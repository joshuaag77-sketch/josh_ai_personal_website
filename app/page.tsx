import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { ChatWidget } from "@/components/ChatWidget";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";

const systems = [
  {
    num: "01",
    name: "Fleet Sparing Simulator",
    what: "A probabilistic model of gas-turbine fleet reliability for a major pipeline operator — spare counts, failure risk, overhaul scheduling, ten-year NPV per scenario.",
    outcome:
      "Built with the reliability engineers who run the fleet, validated within 2% of the specialist vendor's simulator, and adopted in place of a five-figure annual software subscription. It informed an eight-figure sparing decision.",
    status: "Deployed · in use",
  },
  {
    num: "02",
    name: "A Second Brain That Runs Itself",
    what: "A plain-text knowledge graph tended by scheduled agents: a gardener that maintains it, a weekly brief that mines it for connections I can't see myself, a foundry that turns them into things worth writing.",
    outcome:
      "Runs on a schedule whether I show up or not. Everything it learns compounds in one place — including the ideas that become the posts below.",
    status: "Running daily",
    href: "/posts/ai-second-brain-obsidian",
  },
  {
    num: "03",
    name: "This Site's Chatbot",
    what: "A small agent trained on my notes and bio, wired into this page. The cheapest way to test whether an AI system represents you honestly is to let strangers interrogate it.",
    outcome: "Live at the bottom of this page. Ask it something hard.",
    status: "Live below",
    href: "#ask",
  },
];

export default function Home() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      {/* ── Hero ─────────────────────────────────── */}
      <section className="mb-20 sm:mb-28">
        <AnimateOnScroll>
          <p className="spec-label mb-6">Field notes from the deployment gap</p>
          <h1 className="display-font text-4xl sm:text-6xl font-semibold leading-[1.05] text-[color:var(--ink)] max-w-3xl mb-8">
            AI&apos;s hardest problems aren&apos;t in the models.{" "}
            <em className="text-[color:var(--accent-deep)]">
              They&apos;re in the field.
            </em>
          </h1>
          <p className="text-lg sm:text-xl text-[color:var(--ink-muted)] leading-relaxed max-w-2xl mb-10">
            I&apos;m Joshua Agarwal — chemical engineer, P.Eng. I spent four
            years at Enbridge turning frontier AI into tools that operators
            actually use, and I write down what survives contact with reality.
            Now at Wharton, working out how to do it at scale.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/posts" className="btn-primary">
              Read the notebook
            </Link>
            <Link href="#systems" className="btn-secondary">
              What I&apos;ve built ↓
            </Link>
          </div>
        </AnimateOnScroll>

        {/* Proof strip */}
        <AnimateOnScroll delay={150}>
          <div className="mt-14 grid sm:grid-cols-3 border-y border-[color:var(--hair)] divide-y sm:divide-y-0 sm:divide-x divide-[color:var(--hair-soft)]">
            {[
              ["Capital decision informed", "Eight figures, one model"],
              ["Validation vs. specialist vendor", "Within 2%"],
              ["Credentials", "P.Eng · Wharton MBA '28"],
            ].map(([label, value]) => (
              <div key={label} className="py-5 sm:px-6 first:sm:pl-0">
                <p className="spec-label spec-label--muted mb-2">{label}</p>
                <p className="display-font text-lg text-[color:var(--ink)]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </AnimateOnScroll>
      </section>

      {/* ── Thesis ───────────────────────────────── */}
      <section className="mb-20 sm:mb-28">
        <AnimateOnScroll>
          <div className="ruled grid gap-6 lg:grid-cols-[0.35fr,0.65fr]">
            <p className="spec-label">The thesis</p>
            <div>
              <p className="display-font text-2xl sm:text-3xl text-[color:var(--ink)] leading-snug mb-5">
                AI is infrastructure, not a feature.
              </p>
              <p className="text-[color:var(--ink-muted)] leading-relaxed max-w-xl">
                The bottleneck isn&apos;t the models — it&apos;s the last mile:
                getting intelligence into real workflows, in organizations with
                real constraints, where a wrong answer costs actual money. That
                gap between what&apos;s possible and what&apos;s deployed is
                where I work, and most of what&apos;s written here is a field
                report from inside it.
              </p>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* ── Systems ──────────────────────────────── */}
      <section id="systems" className="mb-20 sm:mb-28 scroll-mt-24">
        <AnimateOnScroll>
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="display-font text-3xl font-semibold text-[color:var(--ink)]">
              Systems in production
            </h2>
            <p className="spec-label spec-label--muted hidden sm:block">
              Not demos
            </p>
          </div>
          <p className="text-[color:var(--ink-muted)] mb-8 max-w-xl">
            Things I&apos;ve built that are still running without me.
          </p>
        </AnimateOnScroll>
        <div>
          {systems.map((s, i) => {
            const inner = (
              <div className="system-row group">
                <span className="display-font text-2xl text-[color:var(--ink-faint)]">
                  {s.num}
                </span>
                <div>
                  <h3 className="display-font text-xl font-semibold text-[color:var(--ink)] group-hover:text-[color:var(--accent-deep)] transition-colors mb-2">
                    {s.name}
                  </h3>
                  <p className="text-sm text-[color:var(--ink-muted)] leading-relaxed max-w-2xl mb-2">
                    {s.what}
                  </p>
                  <p className="text-sm text-[color:var(--ink)] leading-relaxed max-w-2xl">
                    {s.outcome}
                  </p>
                </div>
                <span className="spec-label whitespace-nowrap hidden sm:flex items-center gap-2">
                  <span className="pulse-dot inline-block w-1.5 h-1.5 rounded-full" />
                  {s.status}
                </span>
              </div>
            );
            return (
              <AnimateOnScroll key={s.num} delay={i * 100}>
                {s.href ? (
                  <Link href={s.href} className="block">
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </AnimateOnScroll>
            );
          })}
        </div>
      </section>

      {/* ── Writing ──────────────────────────────── */}
      <section className="mb-20 sm:mb-28">
        <AnimateOnScroll>
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="display-font text-3xl font-semibold text-[color:var(--ink)]">
              Recent entries
            </h2>
            <Link
              href="/posts"
              className="spec-label hover:text-[color:var(--accent-deep)] transition-colors"
            >
              All entries →
            </Link>
          </div>
        </AnimateOnScroll>
        <div>
          {posts.map((post, i) => (
            <AnimateOnScroll key={post.slug} delay={i * 100}>
              <Link href={`/posts/${post.slug}`} className="entry-row group">
                <div className="grid gap-2 sm:grid-cols-[0.28fr,0.72fr] sm:gap-8">
                  <div>
                    <p className="spec-label mb-1.5">{post.kicker || "Entry"}</p>
                    <p className="text-xs text-[color:var(--ink-faint)] font-mono">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                      {post.readingTime ? ` · ${post.readingTime}` : ""}
                    </p>
                  </div>
                  <div>
                    <h3 className="entry-title display-font text-xl sm:text-2xl font-semibold text-[color:var(--ink)] mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-[color:var(--ink-muted)] leading-relaxed max-w-2xl">
                      {post.summary}
                    </p>
                  </div>
                </div>
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* ── Chat ─────────────────────────────────── */}
      <section id="ask" className="scroll-mt-24">
        <AnimateOnScroll>
          <ChatWidget />
        </AnimateOnScroll>
      </section>
    </div>
  );
}
