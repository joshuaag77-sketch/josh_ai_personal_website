"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A vertical "pipeline" that draws itself down the left edge of the
 * page as you scroll, with junction nodes that light up as the line
 * passes them. Decorative; hidden on small screens and for reduced motion.
 */

const NODE_FRACTIONS = [0.06, 0.32, 0.6, 0.88];

export function FlowLine() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [height, setHeight] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const parent = wrap.parentElement;
    if (!parent) return;

    const measure = () => setHeight(parent.scrollHeight);
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(parent);

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = parent.getBoundingClientRect();
        const viewH = window.innerHeight;
        // progress: 0 when top of section hits 75% viewport, 1 when bottom nears top
        const total = rect.height - viewH * 0.4;
        const scrolled = Math.min(
          Math.max(viewH * 0.75 - rect.top, 0),
          Math.max(total, 1)
        );
        setProgress(scrolled / Math.max(total, 1));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (height === 0) {
    return <div ref={wrapRef} className="hidden lg:block" aria-hidden="true" />;
  }

  // gentle S-curve down the page
  const w = 48;
  const d = `M ${w / 2} 0
    C ${w} ${height * 0.15}, 0 ${height * 0.3}, ${w / 2} ${height * 0.45}
    C ${w} ${height * 0.6}, 0 ${height * 0.75}, ${w / 2} ${height}`;

  const pathLen = pathRef.current?.getTotalLength() ?? height * 1.05;

  return (
    <div
      ref={wrapRef}
      className="hidden lg:block absolute -left-14 top-0 bottom-0 w-12 pointer-events-none"
      aria-hidden="true"
    >
      <svg
        width={w}
        height={height}
        viewBox={`0 0 ${w} ${height}`}
        fill="none"
        className="absolute inset-0"
      >
        {/* ghost track */}
        <path
          d={d}
          stroke="currentColor"
          className="text-slate-300/40 dark:text-slate-700/40"
          strokeWidth="1.5"
        />
        {/* drawn line */}
        <path
          ref={pathRef}
          d={d}
          stroke="url(#flow-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={pathLen}
          strokeDashoffset={pathLen * (1 - progress)}
          style={{ transition: "stroke-dashoffset 80ms linear" }}
        />
        <defs>
          <linearGradient id="flow-grad" x1="0" y1="0" x2="0" y2={height} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        {/* junction nodes */}
        {NODE_FRACTIONS.map((f) => {
          const lit = progress >= f;
          const p = pathRef.current?.getPointAtLength(pathLen * f);
          const cx = p?.x ?? w / 2;
          const cy = p?.y ?? height * f;
          return (
            <g key={f}>
              {lit && (
                <circle
                  cx={cx}
                  cy={cy}
                  r="8"
                  fill="rgba(59,130,246,0.18)"
                />
              )}
              <circle
                cx={cx}
                cy={cy}
                r="3.5"
                fill={lit ? "#3b82f6" : "transparent"}
                stroke={lit ? "#3b82f6" : "currentColor"}
                strokeWidth="1.5"
                className={lit ? "" : "text-slate-300/60 dark:text-slate-700/60"}
                style={{ transition: "fill 300ms ease, stroke 300ms ease" }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
