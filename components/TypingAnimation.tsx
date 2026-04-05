"use client";

import { useEffect, useState } from "react";

const WORDS = ["leverage", "decision-making", "intelligent systems", "building in public"];
const INTERVAL = 3000;

export function TypingAnimation() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"visible" | "exiting" | "entering">("visible");

  useEffect(() => {
    const timer = setInterval(() => {
      setPhase("exiting");
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % WORDS.length);
        setPhase("entering");
        setTimeout(() => setPhase("visible"), 50);
      }, 300);
    }, INTERVAL);

    return () => clearInterval(timer);
  }, []);

  return (
    <span className="inline-flex items-baseline">
      <span className={`typing-word ${phase} text-blue-600 dark:text-blue-400`}>
        {WORDS[index]}
      </span>
      <span className="typing-cursor text-blue-600 dark:text-blue-400 ml-0.5 font-light">|</span>
    </span>
  );
}
