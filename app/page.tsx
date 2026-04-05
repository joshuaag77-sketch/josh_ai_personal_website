import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { ChatWidget } from "@/components/ChatWidget";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { ParticleField } from "@/components/ParticleField";
import { TypingAnimation } from "@/components/TypingAnimation";
import { TiltCard } from "@/components/TiltCard";
import { StatusTicker } from "@/components/StatusTicker";

export default function Home() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <section className="relative mb-16 grid gap-10 lg:grid-cols-[1.15fr,0.85fr] items-center">
        <ParticleField />
        <AnimateOnScroll>
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.35em] text-blue-600/80 dark:text-blue-300/80 mb-4">
              Lab Notebook
            </p>
            <h1 className="display-font text-4xl sm:text-5xl font-semibold mb-5 text-slate-900 dark:text-slate-100">
              Experiments in <TypingAnimation />
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
              Chemical engineer in energy and infrastructure. This site is a public
              lab notebook: experiments with intelligent systems, what I learn, and
              how I think about tradeoffs and constraints.
            </p>
            <div className="mb-6">
              <StatusTicker />
            </div>
            <div className="flex gap-4">
              <Link
                href="/posts"
                className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-500 transition-colors shadow-[0_10px_30px_-18px_rgba(37,99,235,0.8)]"
              >
                Notebook
              </Link>
              <Link
                href="/about"
                className="px-6 py-3 border border-slate-300/80 dark:border-slate-700 rounded-full font-medium hover:bg-white/70 dark:hover:bg-slate-900 transition-colors"
              >
                About
              </Link>
            </div>
          </div>
        </AnimateOnScroll>
        <AnimateOnScroll delay={200}>
          <div className="relative z-10 rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/60 backdrop-blur p-8 shadow-[0_35px_120px_-80px_rgba(15,23,42,0.65)]">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 mb-5">
              Current Thesis
            </p>
            <p className="display-font text-2xl text-slate-900 dark:text-slate-100 mb-4">
              AI is infrastructure, not a feature.
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              I build systems that absorb messy input, structure it, and execute
              with accountability. The goal is leverage, not novelty.
            </p>
            <div className="mt-6 text-xs uppercase tracking-[0.28em] text-blue-600/70 dark:text-blue-300/70">
              Calgary. Energy. Systems.
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      <AnimateOnScroll>
        <div className="mb-20">
          <ChatWidget />
        </div>
      </AnimateOnScroll>

      <section className="mb-20">
        <AnimateOnScroll>
          <h2 className="display-font text-3xl font-semibold mb-8 text-slate-900 dark:text-slate-100">
            What this is
          </h2>
        </AnimateOnScroll>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Focus",
              text: "Leverage inside real systems. Not demos, not hype.",
            },
            {
              title: "Method",
              text: "Small experiments, fast feedback, ruthless clarity.",
            },
            {
              title: "Output",
              text: "Notes, builds, and systems that actually run.",
            },
          ].map((item, i) => (
            <AnimateOnScroll key={item.title} delay={i * 120}>
              <TiltCard>
                <div className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/60 backdrop-blur p-6 shadow-[0_20px_80px_-70px_rgba(15,23,42,0.6)]">
                  <p className="text-xs uppercase tracking-[0.28em] text-blue-600/80 dark:text-blue-300/80 mb-3">
                    {item.title}
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </TiltCard>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      <section>
        <AnimateOnScroll>
          <div className="flex items-center justify-between mb-8">
            <h2 className="display-font text-3xl font-semibold text-slate-900 dark:text-slate-100">
              Recent entries
            </h2>
            <Link
              href="/posts"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
            >
              All entries -&gt;
            </Link>
          </div>
        </AnimateOnScroll>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.length > 0 ? (
            posts.map((post, i) => (
              <AnimateOnScroll key={post.slug} delay={i * 120}>
                <TiltCard>
                  <Link
                    href={`/posts/${post.slug}`}
                    className="group block p-6 sm:p-7 border border-slate-200/70 dark:border-slate-800/70 rounded-2xl bg-white/60 dark:bg-slate-950/40 hover:border-blue-300/70 dark:hover:border-blue-700/70 transition-colors shadow-[0_18px_70px_-60px_rgba(15,23,42,0.6)]"
                  >
                    {post.heroImage && (
                      <div className="mb-4 -mx-1 -mt-1 rounded-xl overflow-hidden h-[120px]">
                        <img
                          src={post.heroImage}
                          alt={post.heroAlt || post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <p className="text-xs uppercase tracking-[0.28em] text-blue-600/70 dark:text-blue-300/70 mb-3">
                      {post.kicker || "Entry"}
                    </p>
                    <h3 className="display-font text-xl font-semibold mb-3 text-slate-900 dark:text-slate-100">
                      {post.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed line-clamp-2">
                      {post.summary}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                      <time>{new Date(post.date).toLocaleDateString()}</time>
                      {post.readingTime && (
                        <>
                          <span>•</span>
                          <span>{post.readingTime}</span>
                        </>
                      )}
                    </div>
                  </Link>
                </TiltCard>
              </AnimateOnScroll>
            ))
          ) : (
            <p className="text-slate-600 dark:text-slate-400">
              No posts yet. Check back soon!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
