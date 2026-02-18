"use client";

import { useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function ChatWidget() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Ask me about my work, focus areas, or why I build systems the way I do.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/60 backdrop-blur p-6 shadow-[0_30px_120px_-90px_rgba(15,23,42,0.6)]">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-blue-600/80 dark:text-blue-300/80 mb-2">
            Ask Josh
          </p>
          <h3 className="display-font text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Personal chatbot
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Built from my public bio and notes. Quick answers, no fluff.
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-[0.35em] text-slate-400">
          Beta
        </span>
      </div>

      <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
        {messages.map((msg, index) => (
          <div
            key={`${msg.role}-${index}`}
            className={
              msg.role === "assistant"
                ? "bg-blue-50/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 rounded-2xl px-4 py-3"
                : "bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-100 rounded-2xl px-4 py-3 ml-auto"
            }
          >
            <p className="text-sm leading-relaxed">{msg.content}</p>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-rose-500 mt-3">{error}</p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about focus areas, projects, or career goals"
          className="flex-1 rounded-full border border-slate-200/70 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
          className="rounded-full bg-blue-600 text-white px-4 py-2 text-sm font-medium shadow-[0_10px_30px_-18px_rgba(37,99,235,0.8)] hover:bg-blue-500 transition disabled:opacity-60"
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </section>
  );
}

