import { getAllPosts } from "@/lib/posts";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { PostsFilter } from "@/components/PostsFilter";

export const metadata = {
  title: "Notebook - Josh",
  description: "Entries from a public lab notebook: experiments and thinking on leverage and intelligent systems.",
};

export default function PostsPage() {
  const posts = getAllPosts();
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort();

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

      <AnimateOnScroll delay={100}>
        <PostsFilter posts={posts} allTags={allTags} />
      </AnimateOnScroll>
    </div>
  );
}
