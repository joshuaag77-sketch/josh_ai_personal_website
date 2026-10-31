import assert from "node:assert/strict";
import test from "node:test";
import { chatClientKey, createChatLimiter, readChatBody, validateChatHeaders, chatTextStream } from "../lib/chat-security.ts";

const request = (body, headers = {}) => new Request("https://joshagarwal.com/api/chat", {
  method: "POST", body, headers: { "content-type": "application/json", ...headers },
});
const status = (code) => (error) => error.status === code;

test("valid public questions retain the client contract", async () => {
  const req = request(JSON.stringify({ message: "  Kiewit?  ", audience: "builder" }), { origin: "https://joshagarwal.com" });
  validateChatHeaders(req);
  assert.deepEqual(await readChatBody(req), { message: "Kiewit?", audience: "builder" });
});

test("cross-origin browser requests and non-JSON bodies are rejected", () => {
  assert.throws(() => validateChatHeaders(request("{}", { origin: "https://attacker.invalid" })), status(403));
  assert.throws(() => validateChatHeaders(request("{}", { "sec-fetch-site": "cross-site" })), status(403));
  assert.throws(() => validateChatHeaders(request("{}", { "content-type": "text/plain" })), status(415));
});

test("same-origin checks use the public host behind Next's internal URL", () => {
  validateChatHeaders(new Request("http://localhost:3105/api/chat", { headers: {
    host: "127.0.0.1:3105", origin: "http://127.0.0.1:3105", "content-type": "application/json",
  } }));
  assert.throws(() => validateChatHeaders(request("{}", { host: "joshagarwal.com", origin: "https://attacker.invalid" })), status(403));
});

test("JSON shape and the 600-character question limit are enforced", async () => {
  for (const body of ["{", "null", "[]", "42", '{}', '{"message":42}', JSON.stringify({ message: "x".repeat(601) })]) {
    await assert.rejects(readChatBody(request(body)), status(400));
  }
  assert.equal((await readChatBody(request(JSON.stringify({ message: "x".repeat(600), audience: "injected" })))).audience, null);
});

test("the byte cap cannot be bypassed by missing or false Content-Length", async () => {
  assert.throws(() => validateChatHeaders(request("{}", { "content-length": "4097" })), status(413));
  for (const headers of [{}, { "content-length": "1" }]) {
    await assert.rejects(readChatBody(request(JSON.stringify({ message: "ok", padding: "x".repeat(4096) }), headers)), status(413));
  }
  const stream = new ReadableStream({ start(controller) {
    controller.enqueue(new TextEncoder().encode('{"message":"ok","padding":"'));
    controller.enqueue(new Uint8Array(4096));
    controller.close();
  } });
  await assert.rejects(readChatBody(new Request("https://joshagarwal.com/api/chat", { method: "POST", body: stream, duplex: "half" })), status(413));
});

test("stalled bodies time out and cancel their reader", async () => {
  let cancelled = false;
  const stream = new ReadableStream({ cancel() { cancelled = true; } });
  await assert.rejects(readChatBody(new Request("https://joshagarwal.com/api/chat", { method: "POST", body: stream, duplex: "half" }), 10), status(408));
  assert.equal(cancelled, true);
});

test("limiter rejects the eleventh request and recovers after the window", () => {
  const limited = createChatLimiter();
  for (let i = 0; i < 10; i++) assert.equal(limited("client", 1000), false);
  for (let i = 0; i < 100; i++) assert.equal(limited("client", 1001), true);
  assert.equal(limited("client", 61_000), false);
});

test("new client floods cannot clear active limits", () => {
  const limited = createChatLimiter(2);
  for (let i = 0; i < 10; i++) limited("client", 1000);
  assert.equal(limited("second", 1000), false);
  assert.equal(limited("third", 1001), true);
  assert.equal(limited("client", 1001), true);
  assert.equal(limited("third", 61_000), false);
});

test("untrusted forwarded headers do not create fresh local identities", () => {
  const req = request("{}", { "x-forwarded-for": "spoofed", "x-vercel-forwarded-for": "platform-ip" });
  assert.equal(chatClientKey(req, false), "local");
  assert.equal(chatClientKey(req, true), "platform-ip");
  assert.equal(chatClientKey(request("{}", { "x-forwarded-for": "spoofed" }), true), "unknown");
});

test("streamed answers keep the text contract and release the slot once", async () => {
  let finished = 0;
  const response = chatTextStream((async function* () { yield "Hello "; yield "Josh"; })(), () => finished++);
  assert.equal(response.headers.get("content-type"), "text/plain; charset=utf-8");
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(await response.text(), "Hello Josh");
  assert.equal(finished, 1);
});

test("stream failure hides provider details and releases the slot", async () => {
  let finished = 0;
  const response = chatTextStream((async function* () { yield "Hello"; throw new Error("provider-secret-detail"); })(), () => finished++);
  const answer = await response.text();
  assert.match(answer, /answer was cut short/);
  assert.equal(answer.includes("provider-secret-detail"), false);
  assert.equal(finished, 1);
});

test("cancelled streams abort upstream work and release the slot once", async () => {
  let finished = 0;
  let cancelled = 0;
  const response = chatTextStream((async function* () { yield "Hello"; yield "Josh"; })(), () => finished++, () => cancelled++);
  const reader = response.body.getReader();
  await reader.read();
  await reader.cancel();
  assert.equal(finished, 1);
  assert.equal(cancelled, 1);
});
