"use client";

import { useEffect, useState } from "react";

export type Audience = "recruiter" | "classmate" | "builder" | null;

const PITCHES: Record<Exclude<Audience, null>, string> = {
  recruiter:
    "Engineer first: four years turning first-of-a-kind energy projects into operating assets at Enbridge — and building the analytical tools my teams actually adopted, including a probabilistic model that changed a multimillion-dollar sparing decision. Now at Wharton, headed for energy & infrastructure strategy. The chat below knows my track record; ask it anything.",
  classmate:
    "Wharton '28. I build systems that remember things so I don't have to — a second brain in Obsidian that literally runs itself, with this site as its window. Fly through it at /brain, or ask the chat how the whole thing works. If we've crossed paths at pre-MBA stuff, say hi on LinkedIn.",
  builder:
    "Everything here is built, not bought: Next.js on Vercel, a WebGL map of my actual Obsidian vault, scheduled agents pushing live heartbeats through a sync script, and Claude wired in behind a hard privacy sandbox. Start at /brain, then ask the chat to explain its own architecture.",
};

const DEFAULT_PITCH =
  "Chemical engineer in energy and infrastructure. This site is a public lab notebook: experiments with intelligent systems, what I learn, and how I think about tradeoffs and constraints.";

const OPTIONS: { key: Exclude<Audience, null>; label: string }[] = [
  { key: "recruiter", label: "Recruiter" },
  { key: "classmate", label: "Classmate" },
  { key: "builder", label: "Builder" },
];

export function AudiencePitch() {
  const [audience, setAudience] = useState<Audience>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("audience");
    if (saved === "recruiter" || saved === "classmate" || saved === "builder") {
      setAudience(saved);
    }
  }, []);

  const select = (a: Exclude<Audience, null>) => {
    const next = audience === a ? null : a;
    setAudience(next);
    if (next) window.localStorage.setItem("audience", next);
    else window.localStorage.removeItem("audience");
  };

  return (
    <div>
      <p
        key={audience ?? "default"}
        className="text-xl text-slate-600 dark:text-slate-300 mb-4 leading-relaxed animate-[fadeIn_0.5s_ease]"
      >
        {audience ? PITCHES[audience] : DEFAULT_PITCH}
      </p>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-400 mr-1">
          I&apos;m a…
        </span>
        {OPTIONS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => select(key)}
            className={
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
              (audience === key
                ? "border-blue-500 bg-blue-500/15 text-blue-700 dark:text-blue-300"
                : "border-slate-300/70 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-400/60 hover:text-blue-600 dark:hover:text-blue-300")
            }
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
