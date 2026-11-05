"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// hero-loop.mp4 is one 8.4s wingbeat with a slow downstroke (0 to 4.7s) and a quicker
// upstroke (4.7 to 7.7s). A real bird pushes down hard and recovers slowly, so the clip
// plays the push fast and the recovery near normal speed: about 1.4s down, 3.1s up.
function flapRate(t: number): number {
  const DOWN = 3.6;
  const UP = 1.15;
  if (t < 0.25) return UP + (DOWN - UP) * (t / 0.25);
  if (t < 4.4) return DOWN;
  if (t < 4.8) return DOWN + (UP - DOWN) * ((t - 4.4) / 0.4);
  return UP;
}

export function HeroIntro() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (video.paused) return;
      const rate = flapRate(video.currentTime);
      if (Math.abs(video.playbackRate - rate) > 0.05) video.playbackRate = rate;
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => undefined);
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#061b2b] text-white">
      <button
        type="button"
        onClick={toggle}
        className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full text-white/30 transition hover:text-white/70"
        aria-label={paused ? "Play animation" : "Pause animation"}
      >
        <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
          {paused ? (
            <path d="M2 1l9 5-9 5z" fill="currentColor" />
          ) : (
            <path d="M2 1h3v10H2zM7 1h3v10H7z" fill="currentColor" />
          )}
        </svg>
      </button>
      <div className="relative mx-auto flex min-h-[72svh] max-w-5xl flex-col justify-end px-6 pb-12 pt-56 sm:px-8 sm:pb-16 lg:justify-center lg:pt-16">
        {/* The bird hangs off the name, so a wing brushes the name at any screen size:
            above it on narrow screens, off its right end on wide ones. */}
        <div className="relative self-start">
          <video
            ref={videoRef}
            src="/experiments/light/hero-loop.mp4"
            poster="/experiments/light/poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            style={{
              maskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 60%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 50% 50% at 50% 50%, #000 60%, transparent 100%)",
            }}
            className="pointer-events-none absolute bottom-[calc(100%-2.5rem)] left-1/2 w-[28rem] max-w-none -translate-x-1/2 lg:bottom-auto lg:left-[calc(100%-12rem)] lg:top-1/2 lg:w-[50rem] lg:translate-x-0 lg:-translate-y-1/2"
          />
          <h1 className="relative font-display text-5xl leading-none md:text-7xl">Josh Agarwal</h1>
        </div>
        <p className="relative mt-5 max-w-lg text-base leading-relaxed text-slate-300 md:text-lg">
          Mega projects at Kiewit. Hydrogen and carbon capture at Enbridge. Now at Wharton.
        </p>
        <div className="relative mt-7 flex flex-wrap gap-3">
          <a
            href="#ask"
            className="inline-flex items-center gap-2 bg-sky-500 px-6 py-3 text-sm font-medium text-[#061b2b] transition hover:bg-sky-400"
          >
            Ask my site anything <span aria-hidden="true">&rarr;</span>
          </a>
          <Link
            href="/brain"
            className="inline-flex items-center gap-2 border border-slate-500 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-300"
          >
            Fly through my notes <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
