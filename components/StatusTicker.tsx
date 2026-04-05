"use client";

import { useEffect, useState } from "react";

const ITEMS = [
  "Building AI-powered tools",
  "Writing about intelligent systems",
  "Experimenting with Claude",
  "Studying for MBA applications",
];

const INTERVAL = 4000;

export function StatusTicker() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"visible" | "exiting" | "entering">("visible");

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase("exiting");
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % ITEMS.length);
        setPhase("entering");
        setTimeout(() => setPhase("visible"), 50);
      }, 300);
    }, INTERVAL);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-950/50 backdrop-blur text-sm">
      <span className="relative flex h-2.5 w-2.5">
        <span className="pulse-dot absolute inset-0 rounded-full bg-emerald-400/60" />
        <span className="relative rounded-full h-2.5 w-2.5 bg-emerald-500" />
      </span>
      <span className={`typing-word ${phase} text-slate-600 dark:text-slate-300`}>
        {ITEMS[index]}
      </span>
    </div>
  );
}
