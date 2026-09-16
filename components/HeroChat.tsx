"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { slugify } from "@/lib/slug";
import {
  COLD_OPEN,
  ROTATING_QUESTIONS,
  SUGGESTIONS,
  PITCHES,
  type AudienceKey,
} from "@/content/cold-open";

type ChatMessage = { role: "user" | "assistant"; content: string };
type Audience = AudienceKey | null;

const COLD_OPEN_KEY = "coldOpenPlayed";
const AUDIENCE_KEY = "audience";

// Tell the constellation behind the hero that a vault note was just cited.
function announceCitation() {
  window.dispatchEvent(new CustomEvent("vault-cite"));
}

function countCitations(text: string) {
  return (text.match(/\[\[[^\]]+\]\]/g) || []).length;
}

function AssistantText({
  content,
  knownSlugs,
  streaming,
}: {
  content: string;
  knownSlugs: Map<string, string>;
  streaming?: boolean;
}) {
  const parts = content.split(/\[\[([^\]]+)\]\]/g);
  return (
    <p className="text-[15px] sm:text-base leading-relaxed">
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          const slug = knownSlugs.get(part.trim().toLowerCase());
          if (slug) {
            return (
              <Link
                key={i}
                href={`/brain?focus=${slug}`}
                className="vault-chip inline-flex items-center gap-1 mx-0.5 rounded-full border border-blue-400/40 bg-blue-500/10 px-2 py-0.5 text-[13px] font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 transition-colors align-baseline"
              >
                <span aria-hidden>✦</span>
                {part.trim()}
              </Link>
            );
          }
          return <strong key={i}>{part.trim()}</strong>;
        }
        return <span key={i}>{part.replace(/\*\*/g, "")}</span>;
      })}
      {streaming && <span className="typing-cursor text-blue-500 ml-0.5">|</span>}
    </p>
  );
}

function relativeTime(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const h = Math.floor(ms / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "yesterday" : `${d}d ago`;
}

export function HeroChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [ghost, setGhost] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingIdx, setStreamingIdx] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audience, setAudience] = useState<Audience>(null);
  const [knownSlugs, setKnownSlugs] = useState<Map<string, string>>(new Map());
  const [heartbeat, setHeartbeat] = useState<{ nodes: number; updated: string } | null>(null);
  const [coldOpen, setColdOpen] = useState<"pending" | "playing" | "done">("pending");
  const [focused, setFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const reducedRef = useRef(false);

  // ---- boot: audience, vault slugs, heartbeat -------------------------------
  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saved = window.localStorage.getItem(AUDIENCE_KEY);
    if (saved === "recruiter" || saved === "classmate" || saved === "builder") setAudience(saved);

    fetch("/vault-graph.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((g) => {
        if (!g?.nodes) return;
        const m = new Map<string, string>();
        for (const n of g.nodes) m.set(String(n.label).toLowerCase(), slugify(n.label));
        setKnownSlugs(m);
      })
      .catch(() => {});

    fetch("/heartbeat.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((h) => h?.nodes && h?.updated && setHeartbeat({ nodes: h.nodes, updated: h.updated }))
      .catch(() => {});

    // Launcher and nav can pull focus here.
    const onFocusReq = () => {
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => inputRef.current?.focus(), 350);
    };
    window.addEventListener("focus-hero-chat", onFocusReq);
    return () => window.removeEventListener("focus-hero-chat", onFocusReq);
  }, []);

  // ---- cold open: plays once per browser --------------------------------------
  // Mount-only effect. It must be re-runnable (React strict mode mounts twice),
  // so it never early-returns on state it set itself; cleanup cancels the timers.
  useEffect(() => {
    let played = false;
    try {
      played = window.localStorage.getItem(COLD_OPEN_KEY) === "1";
    } catch {}

    if (played || reducedRef.current) {
      setMessages([
        { role: "user", content: COLD_OPEN.question },
        { role: "assistant", content: COLD_OPEN.answer },
      ]);
      setColdOpen("done");
      return;
    }

    setColdOpen("playing");
    let cancelled = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => {
      const t = window.setTimeout(() => !cancelled && fn(), ms);
      timers.push(t);
    };

    // 1. type the question into the input
    const q = COLD_OPEN.question;
    let t = 600;
    for (let i = 1; i <= q.length; i++) {
      later(() => setInput(q.slice(0, i)), t);
      t += 28 + Math.random() * 30;
    }
    // 2. "send" it
    later(() => {
      setInput("");
      setMessages([{ role: "user", content: q }]);
      setLoading(true);
    }, t + 350);
    t += 1100;
    // 3. stream the cached answer word by word
    const words = COLD_OPEN.answer.split(" ");
    let acc = "";
    let cited = 0;
    words.forEach((w, i) => {
      later(() => {
        acc += (i === 0 ? "" : " ") + w;
        const text = acc;
        const c = countCitations(text);
        if (c > cited) {
          cited = c;
          announceCitation();
        }
        setLoading(false);
        setStreamingIdx(1);
        setMessages([
          { role: "user", content: q },
          { role: "assistant", content: text },
        ]);
      }, t);
      t += 38 + (w.endsWith(".") ? 220 : 0);
    });
    later(() => {
      setStreamingIdx(null);
      setColdOpen("done");
      try {
        window.localStorage.setItem(COLD_OPEN_KEY, "1");
      } catch {}
    }, t + 200);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- ghost question: auto-types while idle ----------------------------------
  useEffect(() => {
    if (coldOpen !== "done" || focused || input || loading || reducedRef.current) {
      setGhost("");
      return;
    }
    let cancelled = false;
    let qi = Math.floor(Math.random() * ROTATING_QUESTIONS.length);
    let timer = 0;

    const typeOne = () => {
      const q = ROTATING_QUESTIONS[qi % ROTATING_QUESTIONS.length];
      let i = 0;
      const step = () => {
        if (cancelled) return;
        i++;
        setGhost(q.slice(0, i));
        if (i < q.length) timer = window.setTimeout(step, 34 + Math.random() * 26);
        else
          timer = window.setTimeout(() => {
            // hold, then erase quickly
            const erase = () => {
              if (cancelled) return;
              i -= 3;
              if (i > 0) {
                setGhost(q.slice(0, i));
                timer = window.setTimeout(erase, 12);
              } else {
                setGhost("");
                qi++;
                timer = window.setTimeout(typeOne, 500);
              }
            };
            erase();
          }, 2600);
      };
      step();
    };
    timer = window.setTimeout(typeOne, 900);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [coldOpen, focused, input, loading]);

  useEffect(() => {
    if (!threadRef.current) return;
    threadRef.current.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const selectAudience = (a: AudienceKey) => {
    const next = audience === a ? null : a;
    setAudience(next);
    try {
      if (next) window.localStorage.setItem(AUDIENCE_KEY, next);
      else window.localStorage.removeItem(AUDIENCE_KEY);
    } catch {}
  };

  // ---- send ---------------------------------------------------------------------
  const send = useCallback(
    async (raw?: string) => {
      const text = (raw ?? input).trim();
      if (!text || loading) return;
      setError(null);
      setInput("");
      setGhost("");
      setLoading(true);

      const base: ChatMessage[] = [...messages, { role: "user", content: text }];
      setMessages(base);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, audience: audience ?? undefined }),
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          throw new Error(payload?.error || "Chat request failed");
        }
        if (!res.body) throw new Error("No response body");

        const idx = base.length;
        setStreamingIdx(idx);
        setLoading(false);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let acc = "";
        let cited = 0;
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          const snapshot = acc;
          const c = countCitations(snapshot);
          if (c > cited) {
            cited = c;
            announceCitation();
          }
          setMessages([...base, { role: "assistant", content: snapshot }]);
        }
        if (!acc.trim()) {
          setMessages([...base, { role: "assistant", content: "Nothing came back. Try asking another way." }]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "The chatbot is taking a break. Try again in a minute.";
        setError(msg);
        setMessages(base);
      } finally {
        setLoading(false);
        setStreamingIdx(null);
      }
    },
    [input, loading, messages, audience]
  );

  const suggestions = SUGGESTIONS[audience ?? "default"];
  const showGhost = !input && ghost && !focused;

  return (
    <section
      id="ask"
      className="relative rounded-[28px] border border-slate-200/70 dark:border-slate-800/70 bg-white/75 dark:bg-slate-950/65 backdrop-blur-md p-5 sm:p-8 shadow-[0_40px_140px_-90px_rgba(37,99,235,0.55)]"
      aria-label="Ask Josh"
    >
      {/* header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-blue-600/80 dark:text-blue-300/80 mb-3">
            Ask Josh
          </p>
          <h1 className="display-font text-3xl sm:text-[2.6rem] leading-[1.1] font-semibold text-slate-900 dark:text-slate-100 mb-3">
            Ask me anything about my work.
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            {audience
              ? PITCHES[audience]
              : "Answers come from my public notes and essays. Every citation flies you into the 3D vault."}
          </p>
        </div>
        {heartbeat && (
          <Link
            href="/brain"
            className="hidden sm:inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-300/60 dark:border-emerald-700/60 bg-emerald-50/80 dark:bg-emerald-950/40 px-3 py-1.5 text-xs text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/40 transition-colors"
            title="The vault behind this chat, synced nightly"
          >
            <span className="relative flex h-2 w-2">
              <span className="pulse-dot absolute inset-0 rounded-full bg-emerald-400/60" />
              <span className="relative rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Live · {heartbeat.nodes} notes · synced {relativeTime(heartbeat.updated)}
          </Link>
        )}
      </div>

      {/* audience */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400 mr-1">
          I&apos;m a
        </span>
        {(["recruiter", "classmate", "builder"] as AudienceKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => selectAudience(key)}
            className={
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors capitalize " +
              (audience === key
                ? "border-blue-500 bg-blue-500/15 text-blue-700 dark:text-blue-300"
                : "border-slate-300/70 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-400/60 hover:text-blue-600 dark:hover:text-blue-300")
            }
          >
            {key}
          </button>
        ))}
      </div>

      {/* thread */}
      <div
        ref={threadRef}
        className="space-y-3 max-h-[19rem] sm:max-h-[22rem] overflow-y-auto pr-1 mb-4 scroll-smooth"
        aria-live="polite"
      >
        {messages.length === 0 && !loading && (
          <div className="h-16" aria-hidden />
        )}
        {messages.map((msg, i) =>
          msg.role === "assistant" ? (
            <div
              key={`a-${i}`}
              className="bg-blue-50/70 dark:bg-slate-900/70 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-[92%] animate-[fadeIn_0.3s_ease]"
            >
              <AssistantText content={msg.content} knownSlugs={knownSlugs} streaming={streamingIdx === i} />
            </div>
          ) : (
            <div
              key={`u-${i}`}
              className="bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-2xl rounded-tr-md px-4 py-2.5 ml-auto w-fit max-w-[85%] animate-[fadeIn_0.3s_ease]"
            >
              <p className="text-[15px] leading-relaxed">{msg.content}</p>
            </div>
          )
        )}
        {loading && (
          <div className="bg-blue-50/70 dark:bg-slate-900/70 rounded-2xl rounded-tl-md px-4 py-3 w-fit">
            <span className="thinking-dots" aria-label="Thinking">
              <i /><i /><i />
            </span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && <p className="text-sm text-rose-500 mb-3">{error}</p>}

      {/* input */}
      <div
        className={
          "hero-input relative flex items-center gap-3 rounded-2xl border bg-white/90 dark:bg-slate-900/80 px-4 py-2.5 sm:py-3 transition-shadow " +
          (focused
            ? "border-blue-400 ring-4 ring-blue-500/15"
            : "border-slate-200/80 dark:border-slate-700 breathe")
        }
      >
        <span className="text-blue-600 dark:text-blue-400 text-lg shrink-0" aria-hidden>
          ✦
        </span>
        <div className="relative flex-1 min-w-0">
          {showGhost && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-base sm:text-lg text-slate-500 dark:text-slate-400 truncate w-full">
              {ghost}
              <span className="typing-cursor ml-0.5 text-blue-500">|</span>
            </span>
          )}
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={showGhost ? "" : "Ask a question"}
            aria-label="Ask Josh a question"
            className="w-full bg-transparent text-base sm:text-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none py-1.5"
            disabled={coldOpen === "playing"}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (input.trim()) send();
                else if (ghost) send(ROTATING_QUESTIONS.find((q) => q.startsWith(ghost)) ?? ghost);
              }
              if (e.key === "Tab" && !input && ghost) {
                e.preventDefault();
                setInput(ROTATING_QUESTIONS.find((q) => q.startsWith(ghost)) ?? ghost);
              }
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            if (input.trim()) send();
            else if (ghost) send(ROTATING_QUESTIONS.find((q) => q.startsWith(ghost)) ?? ghost);
            else inputRef.current?.focus();
          }}
          disabled={loading || coldOpen === "playing"}
          className="shrink-0 rounded-full bg-blue-600 text-white px-4 sm:px-5 py-2 text-sm font-medium shadow-[0_10px_30px_-18px_rgba(37,99,235,0.9)] hover:bg-blue-500 transition disabled:opacity-60"
        >
          {loading ? "…" : "Ask"}
        </button>
      </div>

      {/* suggestions */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {suggestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => send(q)}
            disabled={loading || coldOpen === "playing"}
            className="rounded-full border border-slate-200/80 dark:border-slate-700 bg-white/60 dark:bg-slate-900/50 px-3 py-1.5 text-[13px] text-slate-700 dark:text-slate-200 hover:border-blue-400/70 hover:text-blue-700 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
          >
            {q}
          </button>
        ))}
        <span className="ml-auto hidden sm:inline text-[11px] text-slate-400">
          Enter sends the suggested question · Tab keeps it
        </span>
      </div>
    </section>
  );
}
