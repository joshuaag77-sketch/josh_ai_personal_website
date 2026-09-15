"use client";

import { useEffect, useRef } from "react";
import styles from "./RuptureExperiment.module.css";

export function RuptureExperiment() {
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = frame.current;
    if (!iframe) return;
    let observer: ResizeObserver | undefined;

    const fitContent = () => {
      observer?.disconnect();
      const studio = iframe.contentDocument?.querySelector(".studio");
      if (!studio) return;
      const resize = () => {
        iframe.style.height = `${Math.ceil(studio.getBoundingClientRect().height)}px`;
      };
      observer = new ResizeObserver(resize);
      observer.observe(studio);
      resize();
    };

    iframe.addEventListener("load", fitContent);
    fitContent();
    return () => {
      iframe.removeEventListener("load", fitContent);
      observer?.disconnect();
    };
  }, []);

  return (
    <figure className={styles.wrap} aria-label="The full Rupture experiment">
      <div className={styles.toolbar}>
        <div>
          <p className={styles.eyebrow}>The actual result</p>
          <p className={styles.hint}>Press play, scrub the impact, or drag to orbit.</p>
        </div>
        <a href="/experiments/rupture/index.html" target="_blank" rel="noopener noreferrer">
          Open full-size <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className={styles.frame}>
        <iframe
          ref={frame}
          src="/experiments/rupture/index.html"
          title="Rupture: full interactive bullet and water-balloon experiment"
          loading="lazy"
          allow="fullscreen"
        />
      </div>
      <figcaption className={styles.caption}>
        The complete final render, with all controls preserved. This is a stylized
        fluid approximation. The short impact is expanded on the timeline; the
        readout shows simulated physical time. Requires WebGL 2.
      </figcaption>
    </figure>
  );
}
