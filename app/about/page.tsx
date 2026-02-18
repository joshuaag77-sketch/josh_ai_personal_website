export const metadata = {
  title: "About - Josh",
  description:
    "Chemical engineer. Public lab notebook on leverage, decision-making, and intelligent systems.",
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr] items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-blue-600/80 dark:text-blue-300/80 mb-4">
            About
          </p>
          <h1 className="display-font text-4xl font-semibold mb-6 text-slate-900 dark:text-slate-100">
            Engineer. Operator. Builder of intelligent systems.
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Chemical engineer working in energy and infrastructure. Operator
            mindset: real systems, real constraints, real accountability.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/60 backdrop-blur overflow-hidden shadow-[0_25px_80px_-60px_rgba(15,23,42,0.6)]">
          <img
            src="/images/joshua-agarwal.jpg"
            alt="Joshua Agarwal headshot"
            className="w-full h-auto"
          />
          <div className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 border-t border-slate-200/70 dark:border-slate-800/70">
            Joshua Agarwal
          </div>
        </div>
      </div>

      <div className="mt-12 prose prose-slate dark:prose-invert max-w-none space-y-10">
        <section>
          <h2 className="display-font text-2xl font-semibold mb-5 text-slate-900 dark:text-slate-100">
            Background
          </h2>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            I'm a chemical engineer working in energy and infrastructure.
            Operator mindset: real systems, real constraints, real
            accountability. This site isn't a portfolio or a blog. It's a
            public lab notebook -- experiments with intelligent systems, notes
            on leverage and decision-making, and what I learn when things work
            or don't.
          </p>
        </section>

        <section>
          <h2 className="display-font text-2xl font-semibold mb-5 text-slate-900 dark:text-slate-100">
            Intent
          </h2>
          <ul className="list-disc list-inside space-y-3 text-slate-700 dark:text-slate-300 leading-relaxed">
            <li>
              Understand where intelligent systems create leverage and where they
              don't
            </li>
            <li>
              Run experiments in the open and capture what works, what fails,
              and why
            </li>
            <li>
              Improve decision-making and clarity in constrained, real-world
              systems
            </li>
            <li>
              Keep the notebook high-signal: no hype, no filler
            </li>
          </ul>
        </section>

        <section>
          <h2 className="display-font text-2xl font-semibold mb-5 text-slate-900 dark:text-slate-100">
            FAQ
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">
                What's your background?
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Chemical engineer. I work in energy and infrastructure -- real
                systems with tradeoffs, constraints, and accountability. I study
                leverage and decision-making through intelligent systems; I'm
                not an AI influencer or a generic developer.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">
                What are you working on?
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Experiments and writing live in the notebook (the posts). No
                single "project" -- it's a running log of what I'm testing and
                thinking about.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">
                How can I get in touch?
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                GitHub and LinkedIn are in the footer. No contact form for now.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-slate-900 dark:text-slate-100">
                What do you do?
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Chemical engineering. Operations. Systems thinking. I use
                intelligent systems as a lever in that context -- not as a
                standalone specialty.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

