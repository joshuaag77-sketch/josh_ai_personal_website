import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { PostsFilter } from "@/components/PostsFilter";

export const metadata = {
  title: "Notebook - Josh",
  description: "Entries from a public lab notebook: experiments and thinking on leverage and intelligent systems.",
};

export default function PostsPage() {
  const allPosts = getAllPosts();
  const featured = allPosts.find((p) => p.featured);
  const rest = allPosts.filter((p) => !p.featured);
  const allTags = Array.from(new Set(allPosts.flatMap((p) => p.tags))).sort();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <AnimateOnScroll>
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.35em] text-blue-600/80 dark:text-blue-300/80 mb-3">
            Notebook
          </p>
          <h1 className="display-font text-4xl font-semibold text-slate-900 dark:text-slate-100">
            Entries, experiments, and thinking.
          </h1>
        </div>
      </AnimateOnScroll>

      {featured && (
        <AnimateOnScroll delay={50}>
          <Link
            href={`/posts/${featured.slug}`}
            className="block group mb-12"
          >
            <div className="relative overflow-hidden rounded-3xl border border-blue-200/60 dark:border-blue-900/40 bg-gradient-to-br from-blue-50 via-white to-white dark:from-blue-950/40 dark:via-slate-950 dark:to-slate-950 p-8 sm:p-12 shadow-[0_30px_120px_-60px_rgba(37,99,235,0.5)] transition-all duration-300 hover:shadow-[0_40px_140px_-50px_rgba(37,99,235,0.6)] hover:-translate-y-1">
              <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

              <div className="relative grid grid-cols-1 md:grid-cols-[1fr,260px] gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-semibold uppercase tracking-[0.2em] mb-5 shadow-lg shadow-blue-600/30">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    Spotlight
                  </div>
                  {featured.kicker && (
                    <p className="text-xs uppercase tracking-[0.3em] text-blue-600/80 dark:text-blue-300/80 mb-3">
                      {featured.kicker}
                    </p>
                  )}
                  <h2 className="display-font text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
                    {featured.summary}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-6">
                    <time>{new Date(featured.date).toLocaleDateString()}</time>
                    {featured.readingTime && <span>{featured.readingTime}</span>}
                    {featured.tags.length > 0 && (
                      <div className="flex gap-2">
                        {featured.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-white/80 dark:bg-slate-900 border border-blue-200/60 dark:border-slate-700 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-300 group-hover:gap-3 transition-all">
                    Read the full guide
                    <span aria-hidden>→</span>
                  </span>
                </div>

                {featured.heroImage && (
                  <div className="relative">
                    <div className="rounded-2xl overflow-hidden border border-blue-200/60 dark:border-blue-900/40 shadow-2xl shadow-blue-900/20 transition-transform duration-300 group-hover:scale-[1.03]">
                      <img
                        src={featured.heroImage}
                        alt={featured.heroAlt || featured.title}
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Link>
        </AnimateOnScroll>
      )}

      <AnimateOnScroll delay={100}>
        <PostsFilter posts={rest} allTags={allTags} />
      </AnimateOnScroll>
    </div>
  );
}
