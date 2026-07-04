import { AnimateOnScroll } from "@/components/AnimateOnScroll";

export const metadata = {
  title: "About",
  description:
    "Joshua Agarwal — chemical engineer, P.Eng. Four years building AI and low-carbon systems inside heavy industry; now at Wharton.",
};

const timeline = [
  {
    period: "2016 – 2020",
    title: "Chemical Engineering, UBC",
    detail:
      "Dean's List. Got rejected from UBC out of high school, spent a year at U of C engineering my way in. The rejection built more than the degree did.",
  },
  {
    period: "2020 – 2022",
    title: "Kiewit — field engineer",
    detail:
      "Major pipeline construction, including the Trans Mountain Expansion. Drilling, blasting, dewatering emergencies, subcontractors. I've stood in the excavations I re-planned — it changes how you think about 'implementation.'",
  },
  {
    period: "2022 – 2026",
    title: "Enbridge — New Energy Technologies, P.Eng",
    detail:
      "Senior engineer on hydrogen, carbon capture, and RNG. Ran the early-stage studies that inform major investment decisions — and quietly moved most of that modeling in-house. Along the way I started building the AI tools the team actually adopted, including a fleet-reliability simulator that informed an eight-figure capital decision.",
  },
  {
    period: "2024",
    title: "Avatar Innovations — venture studio",
    detail:
      "Elected to lead a four-person clean-energy venture. Won the opening shark-tank round, licensed tech pathways with Sandia National Labs, pivoted when the economics said so, and took the program's GRIT Award for it.",
  },
  {
    period: "2023 – 2026",
    title: "Young Professionals in Energy, Calgary",
    detail:
      "Volunteer → co-chair of the flagship Future Leaders Dinner → VP → elected 2026 president. Aligning a volunteer board of competing perspectives taught me more about influence than any job title has.",
  },
  {
    period: "2026 →",
    title: "The Wharton School — MBA",
    detail:
      "Philadelphia. Working out how the deployment gap gets closed at scale — and writing it down here as I go.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
      {/* Hero */}
      <AnimateOnScroll>
        <div className="flex items-center gap-6 mb-14">
          <img
            src="/images/joshua-agarwal.jpg"
            alt="Joshua Agarwal"
            className="w-24 h-24 rounded-md object-cover object-top border border-[color:var(--hair)] shrink-0"
          />
          <div>
            <p className="spec-label mb-2">About</p>
            <h1 className="display-font text-3xl font-semibold text-[color:var(--ink)]">
              Joshua Agarwal
            </h1>
            <p className="text-sm text-[color:var(--ink-muted)] mt-1">
              Chemical engineer, P.Eng · Wharton MBA &apos;28 · Calgary →
              Philadelphia
            </p>
          </div>
        </div>
      </AnimateOnScroll>

      {/* Story */}
      <AnimateOnScroll>
        <section className="ruled mb-14">
          <p className="spec-label mb-5">The short version</p>
          <div className="space-y-4 text-[color:var(--ink-muted)] leading-relaxed">
            <p>
              I&apos;m an engineer who kept ending up in the gap between what a
              technology could do and what an organization would actually
              deploy. At Enbridge I watched promising low-carbon projects stall
              — not because the engineering failed, but because risk outran the
              organization&apos;s tolerance and nobody was positioned to align
              people around a first-of-a-kind decision.
            </p>
            <p>
              So that became the job I gave myself: run the analysis in-house,
              build the tools people actually adopt, and translate hard
              technical work into decisions leadership will act on. It turns
              out the same gap exists in AI — the models are far ahead of what
              most organizations can absorb — and closing it is roughly the
              most interesting problem I can think of.
            </p>
            <p>
              This site is the working notebook: systems I&apos;ve built, what
              broke, and what I&apos;d tell you over coffee if you asked how it
              really went.
            </p>
          </div>
        </section>
      </AnimateOnScroll>

      {/* Timeline */}
      <AnimateOnScroll delay={100}>
        <section className="ruled mb-14">
          <p className="spec-label mb-6">The record</p>
          <div className="space-y-0">
            {timeline.map((item) => (
              <div
                key={item.period}
                className="grid sm:grid-cols-[0.25fr,0.75fr] gap-2 sm:gap-8 py-5 border-b border-[color:var(--hair-soft)] last:border-b-0"
              >
                <p className="font-mono text-xs text-[color:var(--ink-faint)] pt-1">
                  {item.period}
                </p>
                <div>
                  <h3 className="display-font text-lg font-semibold text-[color:var(--ink)] mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[color:var(--ink-muted)] leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </AnimateOnScroll>

      {/* FAQ */}
      <AnimateOnScroll delay={150}>
        <section className="ruled">
          <p className="spec-label mb-6">Straight answers</p>
          <div className="space-y-8">
            {[
              {
                q: "What are you actually good at?",
                a: "Taking something ambiguous and high-stakes — a fleet-reliability question, an undefined claims file, a first-of-a-kind study — and turning it into structure, a number, and a decision. Then building the tool so it keeps happening without me.",
              },
              {
                q: "Are you an AI person or an energy person?",
                a: "Both, on purpose. Energy is where I have a decade of scar tissue and a professional license; AI is the lever. The bet is that the intersection is worth more than either alone.",
              },
              {
                q: "What are you working on right now?",
                a: "The MBA, consulting recruiting, this notebook, and a small fleet of personal agents that maintain my knowledge base and publish to this site. The agents are the experiment; the notebook is the data.",
              },
              {
                q: "How do I reach you?",
                a: "Email or LinkedIn in the footer. If you're working on AI deployment in the physical economy — energy, infrastructure, industrials — I will almost certainly reply.",
              },
            ].map(({ q, a }) => (
              <div key={q}>
                <h3 className="display-font font-semibold text-[color:var(--ink)] mb-1.5">
                  {q}
                </h3>
                <p className="text-sm text-[color:var(--ink-muted)] leading-relaxed">
                  {a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </AnimateOnScroll>
    </div>
  );
}
