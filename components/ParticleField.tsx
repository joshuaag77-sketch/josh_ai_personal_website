"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive constellation field.
 * Particles drift slowly; nearby particles connect with lines,
 * and the whole field reaches toward the cursor.
 * Falls back to a static render when reduced motion is requested.
 */

const COUNT = 64;
const LINK_DIST = 110;
const MOUSE_DIST = 160;

type P = { x: number; y: number; vx: number; vy: number; r: number };

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let raf = 0;
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999 };
    let particles: P[] = [];
    let running = true;

    const isDark = () =>
      document.documentElement.classList.contains("dark") ||
      (!document.documentElement.classList.contains("light") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      particles = Array.from({ length: COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 1 + Math.random() * 1.6,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const dark = isDark();
      const dot = dark ? "147,197,253" : "71,85,105";
      const line = dark ? "96,165,250" : "37,99,235";

      for (const p of particles) {
        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;
          // gentle pull toward cursor
          const dxm = mouse.x - p.x;
          const dym = mouse.y - p.y;
          const dm = Math.hypot(dxm, dym);
          if (dm < MOUSE_DIST && dm > 0.001) {
            p.x += (dxm / dm) * 0.18;
            p.y += (dym / dm) * 0.18;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dot},${dark ? 0.35 : 0.3})`;
        ctx.fill();
      }

      // particle-to-particle links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK_DIST) {
            const alpha = (1 - d / LINK_DIST) * (dark ? 0.22 : 0.16);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${line},${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
        // link to cursor
        const a = particles[i];
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < MOUSE_DIST) {
          const alpha = (1 - dm / MOUSE_DIST) * (dark ? 0.35 : 0.28);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(${line},${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    };

    const loop = () => {
      if (!running) return;
      draw();
      if (!reduced) raf = requestAnimationFrame(loop);
    };

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    // pause offscreen
    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
        if (running && !reduced) {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(loop);
        }
      },
      { threshold: 0 }
    );

    resize();
    seed();
    io.observe(canvas);
    if (reduced) draw();
    else raf = requestAnimationFrame(loop);

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
