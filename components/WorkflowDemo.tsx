"use client";

import { useState, useEffect, useRef } from "react";

const STAGES = [
  {
    id: "youtube",
    icon: "▶",
    label: "YouTube",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    activeBg: "bg-red-500/20 border-red-500/50",
  },
  {
    id: "tasker",
    icon: "⚡",
    label: "Tasker",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    activeBg: "bg-yellow-500/20 border-yellow-500/50",
  },
  {
    id: "claude",
    icon: "◈",
    label: "Claude",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    activeBg: "bg-blue-500/20 border-blue-500/50",
  },
  {
    id: "obsidian",
    icon: "◆",
    label: "Obsidian",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    activeBg: "bg-purple-500/20 border-purple-500/50",
  },
];

const BEFORE = `youtube.com/watch?v=dQw4w9WgXcQ

Saved to Watch Later

(never opened again)`;

const AFTER = `---
title: The Compounding Value of Long-Term Thinking
source: https://youtube.com/watch?v=dQw4w9WgXcQ
captured: 2026-05-24
type: video
tags: [compounding, decision-making, mental-models, long-term]
---

## Summary
Explores why most people systematically underestimate long-term thinking —
and why the gap between short and long-term returns keeps widening.

## Key Ideas
- Compound effects are invisible at first, then suddenly obvious
- The window for decisions that matter most is shorter than it seems
- Most people optimize for the next 90 days; the real opportunity is in years 3–10

## Takeaways
Worth linking to [[Decision Making & Cognitive Biases]] and
[[Self/Career Narrative]]. Revisit before Q3 planning.`;

type Status = "idle" | "running" | "done";

export function WorkflowDemo() {
  const [status, setStatus] = useState<Status>("idle");
  const [activeStage, setActiveStage] = useState(-1);
  const [showOutput, setShowOutput] = useState(false);
  const [tab, setTab] = useState<"before" | "after">("before");
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  function clearAll() {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  }

  function run() {
    if (status === "running") return;
    clearAll();
    setStatus("running");
    setShowOutput(false);
    setActiveStage(-1);
    setTab("before");

    const delays = [0, 700, 1500, 2400];
    delays.forEach((d, i) => {
      timeouts.current.push(setTimeout(() => setActiveStage(i), d));
    });

    timeouts.current.push(
      setTimeout(() => {
        setStatus("done");
        setShowOutput(true);
        setActiveStage(-1);
        setTab("after");
      }, 3400)
    );
  }

  function reset() {
    clearAll();
    setStatus("idle");
    setActiveStage(-1);
    setShowOutput(false);
    setTab("before");
  }

  useEffect(() => () => clearAll(), []);

  return (
    <div className="my-10 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-950/60 backdrop-blur overflow-hidden shadow-lg">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-blue-500 dark:text-blue-400 font-medium mb-0.5">
            Live Demo
          </p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            One tap. Watch what happens.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={run}
            disabled={status === "running"}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all"
          >
            {status === "running" ? "Running…" : status === "done" ? "Run again" : "▶  Tap Share"}
          </button>
          {status === "done" && (
            <button
              onClick={reset}
              className="px-3 py-1.5 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Pipeline */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-1 sm:gap-2">
          {STAGES.map((stage, i) => {
            const isActive = activeStage === i;
            const isDone = status === "done";
            return (
              <div key={stage.id} className="flex items-center flex-1 min-w-0">
                {/* Node */}
                <div
                  className={`flex-1 min-w-0 rounded-xl border px-2 py-2.5 text-center transition-all duration-300 ${
                    isActive
                      ? stage.activeBg + " scale-105 shadow-md"
                      : isDone
                      ? stage.activeBg
                      : stage.bg
                  }`}
                >
                  <div
                    className={`text-lg mb-0.5 transition-transform duration-300 ${
                      isActive ? "scale-125" : ""
                    } ${stage.color}`}
                  >
                    {stage.icon}
                  </div>
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                    {stage.label}
                  </div>
                  {isActive && (
                    <div className="mt-1 flex justify-center gap-0.5">
                      {[0, 1, 2].map((dot) => (
                        <span
                          key={dot}
                          className="inline-block w-1 h-1 rounded-full bg-current opacity-70"
                          style={{
                            color: "inherit",
                            animation: `pulse 0.8s ease-in-out ${dot * 0.15}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                  {isDone && (
                    <div className={`text-xs mt-0.5 ${stage.color} opacity-70`}>✓</div>
                  )}
                </div>

                {/* Connector arrow */}
                {i < STAGES.length - 1 && (
                  <div
                    className={`flex-shrink-0 w-4 sm:w-6 text-center text-slate-400 dark:text-slate-600 text-xs transition-colors duration-300 ${
                      (activeStage > i || isDone) ? "text-blue-400 dark:text-blue-500" : ""
                    }`}
                  >
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Output panel */}
      <div className="px-5 pb-5">
        <div className="rounded-xl border border-slate-200/60 dark:border-slate-700/50 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-slate-200/60 dark:border-slate-700/50 bg-slate-50/80 dark:bg-slate-900/50">
            <button
              onClick={() => setTab("before")}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                tab === "before"
                  ? "text-slate-800 dark:text-slate-200 border-b-2 border-slate-400 dark:border-slate-400"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              Before — dead link
            </button>
            <button
              onClick={() => setTab("after")}
              disabled={!showOutput}
              className={`flex-1 py-2 text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                tab === "after"
                  ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-500"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              After — structured note {showOutput ? "✓" : ""}
            </button>
          </div>

          {/* Content */}
          <div className="p-4 bg-slate-950/5 dark:bg-slate-950/40 min-h-[180px]">
            {tab === "before" && (
              <pre className="text-xs text-slate-500 dark:text-slate-400 font-mono whitespace-pre-wrap leading-relaxed">
                {BEFORE}
              </pre>
            )}
            {tab === "after" && showOutput && (
              <pre
                className="text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed"
                style={{ animation: "fadeIn 0.4s ease-out" }}
              >
                {AFTER}
              </pre>
            )}
            {tab === "after" && !showOutput && (
              <div className="flex items-center justify-center h-full min-h-[180px]">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Hit ▶ Tap Share to run the workflow
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
