const MAX_BODY_BYTES = 4096;
const WINDOW_MS = 60_000;

export class ChatRequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function validateChatHeaders(req: Request) {
  const origin = req.headers.get("origin");
  // Next may construct req.url with its internal hostname behind a proxy.
  // Host is the domain the browser actually requested, including local ports.
  const url = new URL(req.url);
  const protocol = process.env.VERCEL === "1" ? "https:" : url.protocol;
  const expectedOrigin = `${protocol}//${req.headers.get("host") ?? url.host}`;
  if (
    req.headers.get("sec-fetch-site") === "cross-site" ||
    (origin !== null && origin !== expectedOrigin)
  ) {
    throw new ChatRequestError(403, "Please send questions from this website.");
  }
  if (req.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new ChatRequestError(415, "Send a JSON question.");
  }
  const length = req.headers.get("content-length");
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > MAX_BODY_BYTES)) {
    throw new ChatRequestError(413, "Question is too large.");
  }
}

// Count actual bytes, including chunked requests without Content-Length.
export async function readChatBody(req: Request, timeoutMs = 5000) {
  if (!req.body) throw new ChatRequestError(400, "Message is required.");
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new ChatRequestError(408, "Question timed out.")), timeoutMs);
  });
  try {
    while (true) {
      const { done, value } = await Promise.race([reader.read(), deadline]);
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) throw new ChatRequestError(413, "Question is too large.");
      chunks.push(value);
    }
    let body: unknown;
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      throw new ChatRequestError(400, "Send a valid JSON question.");
    }
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      throw new ChatRequestError(400, "Send a valid question.");
    }
    const input = body as Record<string, unknown>;
    const message = typeof input.message === "string" ? input.message.trim() : "";
    if (!message) throw new ChatRequestError(400, "Message is required.");
    if (message.length > 600) throw new ChatRequestError(400, "Keep questions under 600 characters.");
    const audience = typeof input.audience === "string" &&
      ["recruiter", "classmate", "builder"].includes(input.audience) ? input.audience : null;
    return { message, audience };
  } finally {
    clearTimeout(timer);
    void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

// Defense in depth only: serverless instances do not share this memory.
// Vercel's WAF must enforce the shared per-IP limit before functions run.
export function createChatLimiter(maxClients = 5000) {
  const hits = new Map<string, number[]>();
  return (ip: string, now = Date.now()): boolean => {
    for (const [key, times] of hits) {
      if (now - times[times.length - 1] >= WINDOW_MS) hits.delete(key);
    }
    const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
    // Fail closed at capacity; never erase active clients' limits.
    if ((!hits.has(ip) && hits.size >= maxClients) || recent.length >= 10) return true;
    recent.push(now);
    hits.set(ip, recent);
    return false;
  };
}

export function chatClientKey(req: Request, onVercel = process.env.VERCEL === "1") {
  // Only trust forwarding metadata supplied by our hosting platform.
  return onVercel ? (req.headers.get("x-vercel-forwarded-for")?.trim() || "unknown") : "local";
}

export function chatTextStream(chunks: AsyncIterable<string>, onFinish = () => {}, onCancel = () => {}) {
  const encoder = new TextEncoder();
  const iterator = chunks[Symbol.asyncIterator]();
  let finished = false;
  const finish = () => {
    if (!finished) {
      finished = true;
      onFinish();
    }
  };
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await iterator.next();
        if (finished) return;
        if (done) {
          finish();
          controller.close();
        } else {
          controller.enqueue(encoder.encode(value));
        }
      } catch {
        if (finished) return;
        // Never log provider error objects or forward their messages.
        console.error("Chat stream failed", { category: "provider" });
        finish();
        controller.enqueue(encoder.encode("\n\n[The answer was cut short. Ask again.]"));
        controller.close();
      }
    },
    cancel() {
      finish();
      onCancel();
      void iterator.return?.().catch(() => {});
    },
  });
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
