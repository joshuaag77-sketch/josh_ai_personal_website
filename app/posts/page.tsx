import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const metadata = {
  title: "Notebook - Josh",
  description: "Entries from a public lab notebook: experiments and thinking on leverage and intelligent systems.",
};

export default function PostsPage() {
  const posts = getAllPosts();
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.35em] text-blue-600/80 dark:text-blue-300/80 mb-3">
          Notebook
        </p>
        <h1 className="display-font text-4xl font-semibold text-slate-900 dark:text-slate-100">
          Entries, experiments, and thinking.
        </h1>
      </div>

      {allTags.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-medium mb-3 text-slate-600 dark:text-slate-400">
            Filter by tag
          </h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm bg-blue-50 dark:bg-slate-900 rounded-full border border-blue-100 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-8">
        {posts.length > 0 ? (
          posts.map((post) => (
            <article
              key={post.slug}
              className="border-b border-slate-200/70 dark:border-slate-800/70 pb-8 last:border-0 last:pb-0"
            >
              <Link href={`/posts/${post.slug}`} className="block group">
                <p className="text-xs uppercase tracking-[0.28em] text-blue-600/70 dark:text-blue-300/70 mb-3">
                  Entry
                </p>
                <h2 className="display-font text-2xl font-semibold mb-3 text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                  {post.title}
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                  {post.summary}
                </p>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
                  <time>{new Date(post.date).toLocaleDateString()}</time>
                  {post.tags.length > 0 && (
                    <div className="flex gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-blue-50 dark:bg-slate-900 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </article>
          ))
        ) : (
          <p className="text-slate-600 dark:text-slate-400">
            No posts yet. Check back soon!
          </p>
        )}
      </div>
    </div>
  );
}

