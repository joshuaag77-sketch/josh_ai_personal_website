import { getAllPosts } from "@/lib/posts";
import { AnimateOnScroll } from "@/components/AnimateOnScroll";
import { PostsFilter } from "@/components/PostsFilter";

export const metadata = {
  title: "Notebook",
  description:
    "A public lab notebook: experiments with intelligent systems inside real constraints, and what survives contact with the field.",
};

export default function PostsPage() {
  const allPosts = getAllPosts();
  const allTags = Array.from(new Set(allPosts.flatMap((p) => p.tags))).sort();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
      <AnimateOnScroll>
        <div className="mb-12">
          <p className="spec-label mb-4">The notebook</p>
          <h1 className="display-font text-4xl sm:text-5xl font-semibold text-[color:var(--ink)] leading-tight mb-4">
            Entries from the field.
          </h1>
          <p className="text-[color:var(--ink-muted)] leading-relaxed max-w-xl">
            Experiments, systems, and the occasional conviction — written while
            the paint is still wet, kept honest by being public.
          </p>
        </div>
      </AnimateOnScroll>

      <AnimateOnScroll delay={100}>
        <PostsFilter posts={allPosts} allTags={allTags} />
      </AnimateOnScroll>
    </div>
  );
}
