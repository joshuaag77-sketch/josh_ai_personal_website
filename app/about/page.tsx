import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { AnimatedCounter } from "@/components/AnimatedCounter";

export const metadata = {
  title: "About - Josh",
  description:
    "Chemical engineer. Public lab notebook on leverage, decision-making, and intelligent systems.",
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 sm:py-20">

      {/* Hero */}
      <AnimateOnScroll>
        <div className="flex items-center gap-6 mb-12">
          <img
            src="/images/joshua-agarwal.jpg"
            alt="Joshua Agarwal"
            className="w-20 h-20 rounded-full object-cover object-top ring-2 ring-slate-200/80 dark:ring-slate-700/80 shrink-0"
          />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-600/80 dark:text-blue-400/80 mb-1">
              About
            </p>
            <h1 className="display-font text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Joshua Agarwal
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Chemical Engineer · Calgary
            </p>
          </div>
        </div>
      </AnimateOnScroll>

      {/* Divider */}
      <hr className="border-slate-200/70 dark:border-slate-800/70 mb-12" />

      {/* Stats */}
      <AnimateOnScroll>
        <div className="mb-12 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/60 backdrop-blur p-8 shadow-[0_20px_80px_-70px_rgba(15,23,42,0.6)]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <AnimatedCounter end={4} label="Articles Published" />
            <AnimatedCounter end={655} label="GMAT Score" />
            <AnimatedCounter end={1} label="AI Chatbot Built" />
            <AnimatedCounter end={5} suffix="+" label="Experiments Run" />
          </div>
        </div>
      </AnimateOnScroll>

      {/* Content */}
      <div className="space-y-12">
        <AnimateOnScroll>
          <section>
            <h2 className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-4">
              Background
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              I'm a chemical engineer working in energy and infrastructure.
              Operator mindset: real systems, real constraints, real
              accountability. This site isn't a portfolio or a blog — it's a
              public lab notebook. Experiments with intelligent systems, notes on
              leverage and decision-making, and what I learn when things work or
              don't.
            </p>
          </section>
        </AnimateOnScroll>

        <AnimateOnScroll delay={100}>
          <section>
            <h2 className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-4">
              Intent
            </h2>
            <ul className="space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
              {[
                "Understand where intelligent systems create leverage and where they don't",
                "Run experiments in the open and capture what works, what fails, and why",
                "Improve decision-making and clarity in constrained, real-world systems",
                "Keep the notebook high-signal: no hype, no filler",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </AnimateOnScroll>

        <AnimateOnScroll delay={200}>
          <section>
            <h2 className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-6">
              FAQ
            </h2>
            <div className="space-y-8">
              {[
                {
                  q: "What's your background?",
                  a: "Chemical engineer. I work in energy and infrastructure — real systems with tradeoffs, constraints, and accountability. I study leverage and decision-making through intelligent systems; I'm not an AI influencer or a generic developer.",
                },
                {
                  q: "What are you working on?",
                  a: "Experiments and writing live in the notebook (the posts). No single project — it's a running log of what I'm testing and thinking about.",
                },
                {
                  q: "How can I get in touch?",
                  a: "GitHub and LinkedIn are in the footer. No contact form for now.",
                },
                {
                  q: "What do you do?",
                  a: "Chemical engineering. Operations. Systems thinking. I use intelligent systems as a lever in that context — not as a standalone specialty.",
                },
              ].map(({ q, a }) => (
                <div key={q}>
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1.5">
                    {q}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[0.95rem]">
                    {a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </AnimateOnScroll>
      </div>
    </div>
  );
}
