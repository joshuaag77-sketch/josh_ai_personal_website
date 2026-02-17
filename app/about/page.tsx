export const metadata = {
  title: "About - Josh AI",
  description: "Learn about my journey building with AI tools and workflows.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <h1 className="text-4xl font-bold mb-10 text-zinc-900 dark:text-zinc-100">
        About
      </h1>

      <div className="prose prose-zinc dark:prose-invert max-w-none space-y-10">
        <section>
          <h2 className="text-2xl font-semibold mb-5 text-zinc-900 dark:text-zinc-100">
            My Story
          </h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
            I'm a professional exploring how AI tools can augment and enhance
            the way we work, learn, and build. This site documents my journey
            experimenting with AI agents, workflows, and tools in practical,
            real-world contexts.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-5 text-zinc-900 dark:text-zinc-100">
            Goals
          </h2>
          <ul className="list-disc list-inside space-y-3 text-zinc-700 dark:text-zinc-300 leading-relaxed">
            <li>
              Build reliable, autonomous agents that can handle complex
              multi-step workflows
            </li>
            <li>
              Create knowledge systems that can answer questions about my work
              and processes
            </li>
            <li>
              Document what works, what doesn't, and why—sharing learnings along
              the way
            </li>
            <li>
              Focus on practical applications that actually improve productivity
              and outcomes
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-5 text-zinc-900 dark:text-zinc-100">
            FAQ
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">
                What's your background?
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                I work at the intersection of software development and AI,
                focusing on building tools and workflows that leverage AI
                capabilities effectively.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">
                What projects are you working on?
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Currently focused on agent development, RAG systems, and workflow
                optimization. Check out my posts for more details on specific
                projects and experiments.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">
                How can I get in touch?
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                You can find me on GitHub and LinkedIn (links in the footer), or
                reach out through the contact form (coming soon).
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-zinc-900 dark:text-zinc-100">
                What skills do you have?
              </h3>
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                Software development, AI/ML tooling, workflow automation, and
                building systems that integrate AI capabilities into professional
                contexts.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
