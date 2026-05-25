"use client";

import { useState } from "react";

const STEPS = [
  { label: "YouTube video", icon: "▶", color: "text-red-400" },
  { label: "Share button", icon: "↑", color: "text-slate-400" },
  { label: "Tasker", icon: "⚡", color: "text-yellow-400" },
  { label: "Supadata API", icon: "⬡", color: "text-blue-400" },
  { label: "Claude API", icon: "◈", color: "text-violet-400" },
  { label: "Markdown note", icon: "#", color: "text-green-400" },
  { label: "Obsidian inbox", icon: "◆", color: "text-purple-400" },
];

const TASKER_STEPS = [
  { n: 1, label: "Received Share trigger", detail: "Android share sheet sends the YouTube link into Tasker." },
  { n: 2, label: "Variable Set", detail: <><code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-yellow-300">%url = %rs_text</code></> },
  { n: 3, label: "Variable Convert", detail: <>URL-encode <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-yellow-300">%url</code> into <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-yellow-300">%url_enc</code>.</> },
  { n: 4, label: "HTTP Request → Supadata", detail: <>Send <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-yellow-300">%url_enc</code> to the transcript API.</> },
  { n: 5, label: "JavaScriptlet", detail: "Parse the transcript response." },
  { n: 6, label: "HTTP Request → Claude", detail: "Send the transcript with an Obsidian markdown prompt." },
  { n: 7, label: "JavaScriptlet", detail: <>Parse Claude's response into <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-yellow-300">%notes</code>.</> },
  { n: 8, label: "Write File", detail: <>Save <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-yellow-300">%notes</code> as a <code className="text-xs bg-slate-800 px-1 py-0.5 rounded text-yellow-300">.md</code> file in the Obsidian inbox.</> },
  { n: 9, label: "Flash confirmation", detail: 'Show "Saved to Inbox."' },
];

export function PipelineSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="my-8 space-y-3">
      {/* Pipeline flow */}
      <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/50 bg-white/50 dark:bg-slate-950/40 p-4">
        <div className="flex flex-wrap items-center gap-y-2">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60">
                <span className={`text-xs ${step.color}`}>{step.icon}</span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span className="text-slate-300 dark:text-slate-600 text-xs font-light mx-0.5">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Expandable Tasker flow */}
      <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/50 overflow-hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-100/80 dark:hover:bg-slate-900/80 transition-colors text-left"
        >
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Show the actual Tasker flow
          </span>
          <span
            className="text-slate-400 dark:text-slate-500 text-xs transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}
          >
            ▾
          </span>
        </button>

        {open && (
          <div className="px-4 pb-4 pt-2 bg-white/40 dark:bg-slate-950/40 border-t border-slate-200/60 dark:border-slate-800/50">
            <ol className="space-y-2.5 mt-2">
              {TASKER_STEPS.map((step) => (
                <li key={step.n} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold flex items-center justify-center mt-0.5">
                    {step.n}
                  </span>
                  <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{step.label}:</span>{" "}
                    {step.detail}
                  </div>
                </li>
              ))}
            </ol>

            <p className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/50 text-xs text-slate-500 dark:text-slate-500 leading-relaxed">
              <span className="font-medium text-slate-600 dark:text-slate-400">The three bugs that mattered:</span>{" "}
              using the right share variable{" "}
              <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-yellow-600 dark:text-yellow-300">%rs_text</code>,
              URL-encoding the YouTube link, and making sure{" "}
              <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-yellow-600 dark:text-yellow-300">%notes</code>{" "}
              existed before writing the file.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
