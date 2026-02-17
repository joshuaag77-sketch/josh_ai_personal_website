import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function Home() {
  const posts = getAllPosts().slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <section className="mb-20">
        <h1 className="text-4xl sm:text-5xl font-bold mb-5 text-zinc-900 dark:text-zinc-100">
          Building Systems, Not Just Tools
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
          I work at the intersection of engineering, infrastructure, and
          intelligent systems. This site documents how I experiment with AI to
          improve decision-making, workflows, and real-world problem solving.
        </p>
        <div className="flex gap-4">
          <Link
            href="/posts"
            className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-md font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            Read Posts
          </Link>
          <Link
            href="/about"
            className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-md font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Current Work Section */}
      <section className="mb-20">
        <h2 className="text-2xl font-semibold mb-6 text-zinc-900 dark:text-zinc-100">
          What I'm currently building
        </h2>
        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 space-y-5">
          <p className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
            Most people treat AI as a novelty or shortcut. I treat it as a lever.
          </p>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            I'm interested in what happens when intelligent tools are applied to
            real constraints — engineering tradeoffs, operational decisions,
            complex systems. Not demos. Not theory. Practice.
          </p>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            This site is a public log of that process: what I build, what works,
            what fails, and what I learn along the way.
          </p>
        </div>
      </section>

      {/* Latest Posts */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Latest Posts
          </h2>
          <Link
            href="/posts"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            View all →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Link
                key={post.slug}
                href={`/posts/${post.slug}`}
                className="block p-6 sm:p-7 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <h3 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-zinc-100">
                  {post.title}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                  {post.summary}
                </p>
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
                  <time>{new Date(post.date).toLocaleDateString()}</time>
                  {post.tags.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{post.tags[0]}</span>
                    </>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <p className="text-zinc-600 dark:text-zinc-400">
              No posts yet. Check back soon!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
