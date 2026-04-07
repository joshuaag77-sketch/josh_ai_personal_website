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
          <Link href={`/posts/${featured.slug}`} className="block group mb-10">
            <article className="relative rounded-2xl border border-blue-200/60 dark:border-blue-900/40 bg-white/70 dark:bg-slate-950/60 backdrop-blur p-5 sm:p-6 transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-[0_20px_60px_-40px_rgba(37,99,235,0.5)]">
              <div className="flex items-start gap-5">
                {featured.heroImage && (
                  <div className="hidden sm:block flex-shrink-0 w-[160px] h-[100px] rounded-lg overflow-hidden border border-slate-200/50 dark:border-slate-800/50">
                    <img
                      src={featured.heroImage}
                      alt={featured.heroAlt || featured.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-semibold uppercase tracking-[0.18em]">
                      <span className="inline-block h-1 w-1 rounded-full bg-white animate-pulse" />
                      Spotlight
                    </span>
                    {featured.kicker && (
                      <span className="text-[10px] uppercase tracking-[0.25em] text-blue-600/70 dark:text-blue-300/70">
                        {featured.kicker}
                      </span>
                    )}
                  </div>
                  <h2 className="display-font text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
                    {featured.summary}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-500">
                    <time>{new Date(featured.date).toLocaleDateString()}</time>
                    {featured.readingTime && <span>{featured.readingTime}</span>}
                    {featured.tags.length > 0 && (
                      <div className="flex gap-1.5">
                        {featured.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 bg-blue-50 dark:bg-slate-900 rounded text-[10px]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </article>
          </Link>
        </AnimateOnScroll>
      )}

      <AnimateOnScroll delay={100}>
        <PostsFilter posts={rest} allTags={allTags} />
      </AnimateOnScroll>
    </div>
  );
}
