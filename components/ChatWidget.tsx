"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function ChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "I'm trained on Josh's notes and bio. Ask me what he's built, why he left a good engineering job for Wharton, or what he'd say to your hardest AI-deployment question.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    setInput("");
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Chat request failed");
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer || "" },
      ]);
    } catch (err: any) {
      setError(
        err?.message ?? "The chatbot is temporarily unavailable. Try again later!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="border border-[color:var(--hair)] rounded-md bg-[color:var(--paper-raised)] p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="spec-label mb-2">Interrogate this site</p>
          <h3 className="display-font text-2xl font-semibold text-[color:var(--ink)] mb-1">
            Ask the resident agent
          </h3>
          <p className="text-sm text-[color:var(--ink-muted)] max-w-md">
            The fastest way to judge whether someone can build useful AI systems
            is to talk to one they built. This one answers for me.
          </p>
        </div>
        <span className="spec-label spec-label--muted whitespace-nowrap hidden sm:flex items-center gap-2">
          <span className="pulse-dot inline-block w-1.5 h-1.5 rounded-full" />
          Online
        </span>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scroll-smooth">
        {messages.map((msg, index) => (
          <div
            key={`${msg.role}-${index}`}
            className={
              msg.role === "assistant"
                ? "border border-[color:var(--hair-soft)] bg-[color:var(--accent-wash)] rounded-md px-4 py-3 max-w-[85%]"
                : "border border-[color:var(--hair-soft)] bg-[color:var(--paper)] rounded-md px-4 py-3 ml-auto max-w-[85%]"
            }
          >
            <p className="text-sm leading-relaxed text-[color:var(--ink)]">
              {msg.content}
            </p>
          </div>
        ))}
        {loading && (
          <p className="spec-label spec-label--muted px-1">Thinking…</p>
        )}
        <div ref={endRef} />
      </div>

      {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

      <div className="mt-5 flex items-center gap-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="e.g. What has Josh actually shipped?"
          className="flex-1 rounded-sm border border-[color:var(--hair)] bg-[color:var(--paper)] px-4 py-2.5 text-sm text-[color:var(--ink)] placeholder:text-[color:var(--ink-faint)] focus:outline-none focus:border-[color:var(--accent)]"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? "…" : "Send"}
        </button>
      </div>
    </section>
  );
}
