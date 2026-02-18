import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getAllPosts } from "@/lib/posts";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} - Josh`,
    description: post.summary,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = getAllPosts();
  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const prevPost =
    currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  return (
    <article className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.12),_transparent_60%)]" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative">
        <header className="mb-10">
          <Link
            href="/posts"
            className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors mb-5 inline-block"
          >
            &larr; Back to notebook
          </Link>
          {post.kicker && (
            <p className="text-xs uppercase tracking-[0.35em] text-blue-600/80 dark:text-blue-300/80 mb-4">
              {post.kicker}
            </p>
          )}
          <h1 className="display-font text-4xl font-semibold mb-5 text-slate-900 dark:text-slate-100 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-6">
            <time>{new Date(post.date).toLocaleDateString()}</time>
            {post.tags.length > 0 && (
              <div className="flex gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-blue-50 dark:bg-slate-900 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          {post.summary && (
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              {post.summary}
            </p>
          )}
        </header>

        {post.heroImage && (
          <figure className="mb-10 overflow-hidden rounded-3xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/60 backdrop-blur shadow-[0_30px_120px_-70px_rgba(15,23,42,0.6)]">
            <img
              src={post.heroImage}
              alt={post.heroAlt || ""}
              className="w-full h-auto"
            />
            {post.heroCaption && (
              <figcaption className="px-6 py-4 text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400 border-t border-slate-200/70 dark:border-slate-800/70">
                {post.heroCaption}
              </figcaption>
            )}
          </figure>
        )}

        <div
          className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-p:leading-relaxed prose-a:text-slate-900 dark:prose-a:text-slate-100 prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-blue-600 dark:hover:prose-a:text-blue-300 prose-blockquote:border-blue-200 dark:prose-blockquote:border-slate-700 prose-blockquote:bg-blue-50/60 dark:prose-blockquote:bg-slate-900/40 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: post.contentHtml || "" }}
        />

        <nav className="mt-14 pt-8 border-t border-slate-200/70 dark:border-slate-800/70 flex justify-between">
          {prevPost ? (
            <Link
              href={`/posts/${prevPost.slug}`}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
            >
              &larr; {prevPost.title}
            </Link>
          ) : (
            <span />
          )}
          {nextPost ? (
            <Link
              href={`/posts/${nextPost.slug}`}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors text-right"
            >
              {nextPost.title} &rarr;
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </article>
  );
}

