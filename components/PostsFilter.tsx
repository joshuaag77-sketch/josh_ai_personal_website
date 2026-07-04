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
  featured?: boolean;
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

  const pillBase =
    "px-3 py-1 text-xs font-mono uppercase tracking-[0.12em] rounded-sm border transition-colors duration-150";

  return (
    <>
      {allTags.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`${pillBase} ${
              !activeTag
                ? "bg-[color:var(--ink)] text-[color:var(--paper)] border-[color:var(--ink)]"
                : "bg-transparent border-[color:var(--hair)] text-[color:var(--ink-muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent-deep)]"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              className={`${pillBase} ${
                tag === activeTag
                  ? "bg-[color:var(--ink)] text-[color:var(--paper)] border-[color:var(--ink)]"
                  : "bg-transparent border-[color:var(--hair)] text-[color:var(--ink-muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent-deep)]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div>
        {filtered.length > 0 ? (
          filtered.map((post) => (
            <Link
              key={post.slug}
              href={`/posts/${post.slug}`}
              className="entry-row group"
            >
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
                  <p className="text-sm text-[color:var(--ink-muted)] leading-relaxed max-w-2xl mb-3">
                    {post.summary}
                  </p>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono uppercase tracking-[0.12em] text-[color:var(--ink-faint)]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-[color:var(--ink-muted)] py-8">
            Nothing under that tag yet.
          </p>
        )}
      </div>
    </>
  );
}
