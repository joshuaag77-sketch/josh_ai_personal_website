"use client";

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

// A small bird half hidden off the top of the hero. It is decoration, not the point.
export function HeroBird() {
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
    <>
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
        className="pointer-events-none absolute -top-16 -right-20 w-[22rem] max-w-none opacity-50 sm:-top-24 sm:right-[-2rem] sm:w-[34rem]"
      />
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
    </>
  );
}
