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
    title: `${post.title} - Josh AI`,
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
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-8">
        <Link
          href="/posts"
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-4 inline-block"
        >
          ← Back to posts
        </Link>
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400 mb-4">
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
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            {post.summary}
          </p>
        )}
      </header>

      <div
        className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-zinc-900 dark:prose-a:text-zinc-100 prose-a:underline prose-a:underline-offset-2 hover:prose-a:text-zinc-600 dark:hover:prose-a:text-zinc-400"
        dangerouslySetInnerHTML={{ __html: post.contentHtml || "" }}
      />

      <nav className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex justify-between">
        {prevPost ? (
          <Link
            href={`/posts/${prevPost.slug}`}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            ← {prevPost.title}
          </Link>
        ) : (
          <span />
        )}
        {nextPost ? (
          <Link
            href={`/posts/${nextPost.slug}`}
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors text-right"
          >
            {nextPost.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
