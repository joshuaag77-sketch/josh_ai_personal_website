"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Thread = {
  date: string;
  a: { label: string; slug: string };
  b: { label: string; slug: string };
  line: string;
};

export function DailyThread() {
  const [t, setT] = useState<Thread | null>(null);

  useEffect(() => {
    fetch("/api/daily-thread")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && d.a && setT(d))
      .catch(() => {});
  }, []);

  if (!t) return null;

  const star = (n: { label: string; slug: string }) => (
    <Link
      href={`/brain?focus=${n.slug}`}
      className="font-medium text-slate-800 dark:text-slate-100 underline decoration-blue-400/50 decoration-dotted underline-offset-4 hover:decoration-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
    >
      {n.label}
    </Link>
  );

  return (
    <div className="mb-16 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/50 dark:bg-slate-950/40 backdrop-blur px-5 py-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-blue-600/80 dark:text-blue-300/80 shrink-0">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse mr-2 align-middle" />
        Today&apos;s thread
      </span>
      <span className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {star(t.a)} <span className="text-slate-400 mx-1">×</span> {star(t.b)}
        <span className="text-slate-500 dark:text-slate-400"> — {t.line}</span>
      </span>
    </div>
  );
}
