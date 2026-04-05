"use client";

import { useState } from "react";
import Link from "next/link";

interface PostItem {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  kicker?: string;
  heroImage?: string;
  heroAlt?: string;
  readingTime?: string;
}

interface Props {
  posts: PostItem[];
  allTags: string[];
  initialTag?: string;
}

export function PostsFilter({ posts, allTags, initialTag }: Props) {
  const [activeTag, setActiveTag] = useState<string | null>(initialTag || null);

  const filtered = activeTag
    ? posts.filter((p) => p.tags.includes(activeTag))
    : posts;

  return (
    <>
      {allTags.length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-medium mb-3 text-slate-600 dark:text-slate-400">
            Filter by tag
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1 text-sm rounded-full border transition-all duration-200 ${
                !activeTag
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-blue-50 dark:bg-slate-900 border-blue-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                className={`px-3 py-1 text-sm rounded-full border transition-all duration-200 ${
                  tag === activeTag
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-blue-50 dark:bg-slate-900 border-blue-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-700"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-8">
        {filtered.length > 0 ? (
          filtered.map((post) => (
            <article
              key={post.slug}
              className="post-card-filter border-b border-slate-200/70 dark:border-slate-800/70 pb-8 last:border-0 last:pb-0"
            >
              <Link href={`/posts/${post.slug}`} className="block group">
                <div className="flex gap-6 items-start">
                  {post.heroImage && (
                    <div className="hidden sm:block flex-shrink-0 w-[180px] h-[108px] rounded-xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-sm group-hover:shadow-md group-hover:border-blue-200/50 dark:group-hover:border-blue-800/50 transition-all duration-300">
                      <img
                        src={post.heroImage}
                        alt={post.heroAlt || post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-[0.28em] text-blue-600/70 dark:text-blue-300/70 mb-2">
                      {post.kicker || "Entry"}
                    </p>
                    <h2 className="display-font text-2xl font-semibold mb-2 text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-3 leading-relaxed line-clamp-2">
                      {post.summary}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
                      <time>{new Date(post.date).toLocaleDateString()}</time>
                      {post.readingTime && <span>{post.readingTime}</span>}
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
                  </div>
                </div>
              </Link>
            </article>
          ))
        ) : (
          <p className="text-slate-600 dark:text-slate-400">
            No posts match that tag.
          </p>
        )}
      </div>
    </>
  );
}
