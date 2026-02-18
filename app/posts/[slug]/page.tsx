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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(24,24,27,0.12),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(244,244,245,0.1),_transparent_60%)]" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative">
        <header className="mb-10">
          <Link
            href="/posts"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-5 inline-block"
          >
            &larr; Back to notebook
          </Link>
          {post.kicker && (
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500 dark:text-zinc-400 mb-4">
              {post.kicker}
            </p>
          )}
          <h1 className="text-4xl font-bold mb-5 text-zinc-900 dark:text-zinc-100 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            <time>{new Date(post.date).toLocaleDateString()}</time>
            {post.tags.length > 0 && (
              <div className="flex gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          {post.summary && (
            <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {post.summary}
            </p>
          )}
        </header>

        {post.heroImage && (
          <figure className="mb-10 overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 shadow-[0_30px_120px_-70px_rgba(0,0,0,0.6)]">
            <img
              src={post.heroImage}
              alt={post.heroAlt || ""}
              className="w-full h-auto"
            />
            {post.heroCaption && (
              <figcaption className="px-6 py-4 text-xs uppercase tracking-[0.22em] text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800">
                {post.heroCaption}
              </figcaption>
            )}
          </figure>
        )}

        <div
          className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100 prose-p:leading-relaxed prose-a:text-zinc-900 dark:prose-a:text-zinc-100 prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-zinc-600 dark:hover:prose-a:text-zinc-400 prose-blockquote:border-zinc-300 dark:prose-blockquote:border-zinc-700"
          dangerouslySetInnerHTML={{ __html: post.contentHtml || "" }}
        />

        <nav className="mt-14 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex justify-between">
          {prevPost ? (
            <Link
              href={`/posts/${prevPost.slug}`}
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              &larr; {prevPost.title}
            </Link>
          ) : (
            <span />
          )}
          {nextPost ? (
            <Link
              href={`/posts/${nextPost.slug}`}
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-right"
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
