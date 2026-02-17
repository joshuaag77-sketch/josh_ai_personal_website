import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const metadata = {
  title: "Notebook - Josh",
  description: "Entries from a public lab notebook: experiments and thinking on leverage and intelligent systems.",
};

export default function PostsPage() {
  const posts = getAllPosts();
  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags))
  ).sort();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-4xl font-bold mb-10 text-zinc-900 dark:text-zinc-100">
        Notebook
      </h1>

      {allTags.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-medium mb-3 text-zinc-600 dark:text-zinc-400">
            Filter by tag
          </h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm bg-zinc-100 dark:bg-zinc-900 rounded-full border border-zinc-200 dark:border-zinc-800"
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
              className="border-b border-zinc-200 dark:border-zinc-800 pb-8 last:border-0 last:pb-0"
            >
              <Link
                href={`/posts/${post.slug}`}
                className="block group"
              >
                <h2 className="text-2xl font-semibold mb-3 text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                  {post.summary}
                </p>
                <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-500">
                  <time>{new Date(post.date).toLocaleDateString()}</time>
                  {post.tags.length > 0 && (
                    <div className="flex gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 rounded text-xs"
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
          <p className="text-zinc-600 dark:text-zinc-400">
            No posts yet. Check back soon!
          </p>
        )}
      </div>
    </div>
  );
}
