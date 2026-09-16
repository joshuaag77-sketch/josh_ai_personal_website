"use client";

import { useEffect, useState } from "react";

// Small floating "Ask Josh" button that appears once the hero chat is scrolled
// out of view. Clicking it scrolls back and focuses the input.
export function ChatLauncher() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("ask");
    if (!hero) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.05 }
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, []);

  return (
    <button
      type="button"
      aria-label="Ask Josh"
      onClick={() => window.dispatchEvent(new Event("focus-hero-chat"))}
      className={
        "fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-blue-600 text-white pl-4 pr-5 py-3 text-sm font-medium shadow-[0_18px_50px_-20px_rgba(37,99,235,0.9)] hover:bg-blue-500 transition-all duration-300 " +
        (visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none")
      }
    >
      <span aria-hidden>✦</span>
      Ask Josh
    </button>
  );
}
