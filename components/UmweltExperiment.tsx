"use client";

import { useEffect, useRef } from "react";
import styles from "./UmweltExperiment.module.css";

export function UmweltExperiment({ view }: { view: "city" | "animals" }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const isCity = view === "city";

  useEffect(() => {
    const iframe = frame.current;
    if (!iframe) return;
    let observer: ResizeObserver | undefined;
    const fit = () => {
      observer?.disconnect();
      const content = iframe.contentDocument?.querySelector(
        view === "city" ? "#observatory" : "#perception-lab"
      );
      if (!content) return;
      const resize = () => {
        iframe.style.height = `${Math.ceil(content.getBoundingClientRect().height)}px`;
      };
      observer = new ResizeObserver(resize);
      observer.observe(content);
      resize();
    };
    iframe.addEventListener("load", fit);
    fit();
    return () => {
      iframe.removeEventListener("load", fit);
      observer?.disconnect();
    };
  }, [view]);

  return (
    <figure className={styles.wrap}>
      <div className={styles.toolbar}>
        <p>{isCity ? "Choose a sensor. Drag to orbit. Change the cyclist’s direction." : "Choose an animal. Drag the divider. Adjust the signal."}</p>
        <a href={`/experiments/umwelt/index.html#${isCity ? "observatory" : "perception-lab"}`} target="_blank" rel="noopener noreferrer">Open full-size ↗</a>
      </div>
      <iframe
        ref={frame}
        src={`/experiments/umwelt/index.html?embed=${view}`}
        title={isCity ? "UMWELT: interactive camera, lidar and radar model" : "UMWELT: owl, eagle, honeybee and pit-viper sensory comparisons"}
        loading="lazy"
        allow="fullscreen"
        className={isCity ? styles.city : styles.animals}
      />
      <figcaption className={styles.caption}>
        {isCity ? "A generated scene with simplified sensor geometry. No Waymo recordings or perception software." : "Illustrations of sensory capabilities. Settings, display colours, UV patterns and heat signals are authored, not calibrated animal vision."}
      </figcaption>
    </figure>
  );
}
