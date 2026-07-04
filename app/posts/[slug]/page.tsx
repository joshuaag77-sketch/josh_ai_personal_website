import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostBySlug, getAllPosts } from "@/lib/posts";
import type { Metadata } from "next";
import { ReadingProgress } from "@/components/ReadingProgress";
import { MbaRoiCalculator } from "@/components/MbaRoiCalculator";
import { WorkflowDemo } from "@/components/WorkflowDemo";
import { PipelineSection } from "@/components/PipelineSection";

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

  const siteUrl = "https://josh-ai-personal-website.vercel.app";
  const ogImage = `${siteUrl}/posts/${post.slug}/opengraph-image`;

  return {
    title: `${post.title} - Josh`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      url: `${siteUrl}/posts/${post.slug}`,
      siteName: "Josh Agarwal",
      type: "article",
      publishedTime: post.date,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: [ogImage],
    },
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
      <ReadingProgress />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,_rgba(194,65,12,0.10),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.08),_transparent_60%)]" />
      <div className="max-w-[700px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative">
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
          <h1 className="text-4xl sm:text-5xl font-semibold mb-5 text-slate-900 dark:text-slate-100 font-sans">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400 mb-6">
            <time>{new Date(post.date).toLocaleDateString()}</time>
            {post.readingTime && <span>{post.readingTime}</span>}
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
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {post.summary}
            </p>
          )}
        </header>

        {post.heroImage && (
          <figure className="mb-12 -mx-4 sm:-mx-6 lg:-mx-12">
            <div className="rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-800/50 shadow-[0_20px_80px_-30px_rgba(15,23,42,0.25)] dark:shadow-[0_20px_80px_-30px_rgba(0,0,0,0.5)]">
              <img
                src={post.heroImage}
                alt={post.heroAlt || post.title}
                className="w-full h-auto"
              />
            </div>
            {post.heroCaption && (
              <figcaption className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400 italic">
                {post.heroCaption}
              </figcaption>
            )}
          </figure>
        )}

        {(() => {
          const html = post.contentHtml || "";
          const proseClass =
            "article-content prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-a:text-slate-900 dark:prose-a:text-slate-100 prose-blockquote:border-blue-200 dark:prose-blockquote:border-slate-700";

          // All known markers mapped to their components
          const MARKERS: Record<string, React.ReactNode> = {
            "<p>===ROI_CALCULATOR===</p>": <MbaRoiCalculator />,
            "<p>===WORKFLOW_DEMO===</p>": <WorkflowDemo />,
            "<p>===PIPELINE_SECTION===</p>": <PipelineSection />,
          };

          // Split html on every marker and rebuild as interleaved html+components
          type Seg = { kind: "html"; content: string } | { kind: "node"; content: React.ReactNode };
          let segments: Seg[] = [{ kind: "html", content: html }];

          for (const [marker, node] of Object.entries(MARKERS)) {
            const next: Seg[] = [];
            for (const seg of segments) {
              if (seg.kind === "html" && seg.content.includes(marker)) {
                const parts = seg.content.split(marker);
                parts.forEach((part, i) => {
                  next.push({ kind: "html", content: part });
                  if (i < parts.length - 1) next.push({ kind: "node", content: node });
                });
              } else {
                next.push(seg);
              }
            }
            segments = next;
          }

          return (
            <>
              {segments.map((seg, i) =>
                seg.kind === "html" ? (
                  <div key={i} className={proseClass} dangerouslySetInnerHTML={{ __html: seg.content }} />
                ) : (
                  <React.Fragment key={i}>{seg.content}</React.Fragment>
                )
              )}
            </>
          );
        })()}

        <hr className="my-12 border-slate-200/70 dark:border-slate-800/70" />

        <section className="rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/60 backdrop-blur p-6 shadow-[0_20px_80px_-70px_rgba(15,23,42,0.6)]">
          <p className="text-xs uppercase tracking-[0.3em] text-blue-600/80 dark:text-blue-300/80 mb-3">
            Author
          </p>
          <div className="flex items-center gap-4">
            <img
              src="/images/joshua-agarwal.jpg"
              alt="Joshua Agarwal"
              className="h-14 w-14 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100 font-sans">
                Joshua Agarwal
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Chemical engineer in energy and infrastructure. Writing about
                leverage, intelligent systems, and real-world constraints.
              </p>
            </div>
          </div>
        </section>

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
