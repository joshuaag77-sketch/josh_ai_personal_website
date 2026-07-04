"use client";

import { useRef } from "react";

/**
 * Wraps a link/button and makes it lean toward the cursor,
 * springing back on leave. Purely decorative.
 */
export function MagneticButton({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLSpanElement | null>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.3}px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0, 0)";
  };

  return (
    <span
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="magnetic inline-block"
    >
      {children}
    </span>
  );
}
