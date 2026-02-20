import "./styles.css";

export const metadata = {
  title: "Why I Decided to Apply for an MBA in 2026",
  description:
    "A personal essay by Josh Agarwal on the decision to apply for an MBA in 2026 and the process that led there.",
  openGraph: {
    title: "Why I Decided to Apply for an MBA in 2026",
    description:
      "A personal essay by Josh Agarwal on the decision to apply for an MBA in 2026 and the process that led there.",
    type: "article",
    siteName: "Josh Agarwal",
  },
  twitter: {
    card: "summary_large_image",
    title: "Why I Decided to Apply for an MBA in 2026",
    description:
      "A personal essay by Josh Agarwal on the decision to apply for an MBA in 2026 and the process that led there.",
  },
};

export default function MbaEssayPage() {
  return (
    <div className="essay-root">
      <header className="site-header">
        <div className="container">
          <div className="eyebrow">Josh Agarwal</div>
          <div className="subtext">Personal Essay</div>
        </div>
      </header>

      <main className="container">
        <article className="article">
          <header className="article-header">
            <h1>Why I Decided to Apply for an MBA in 2026</h1>
          </header>

          <section className="article-section">
            <p className="lead">
              I think the idea of doing an MBA was always somewhere in the background for me. It wasn’t something I obsessed over or planned step by step, but it was there. The point where it actually became real was early 2025 after I got back from a trip to India. I remember coming back and feeling like I had momentum in life — work was going well, I was involved in things I cared about, I was building projects and doing meaningful stuff. And I had this thought that kept coming back: if I was ever going to seriously try for something bigger, this was probably the time.
            </p>

            <p>
              I’d actually bought a GMAT book the year before and barely touched it because, honestly, it looked brutal. Permutations, statistics, weird logic questions — it didn’t feel like something you casually flip through after work. But sometime that winter I decided to at least try. I figured I’d study for a few months, write the test, get a strong score, and move on. I’ve always done well academically, so I wasn’t intimidated by it at all. If anything, I thought I could brute-force it.
            </p>
          </section>

          <div className="section-divider"></div>

          <section className="article-section">
            <p>
              So I took a diagnostic test before studying just to see where I stood, and I got a 485. That was the first real wake-up call. I knew the scores I’d need for the schools I was aiming for were around the high-600s, and suddenly I was staring at a gap that wasn’t small. It wasn’t discouraging so much as clarifying. It told me this wasn’t something I could wing.
            </p>

            <p>
              I started studying after work most nights, usually a couple hours at a time. At first it was just me going through a prep book, then I signed up for a structured program and worked through almost all of it. I treated it pretty seriously. When I took my first real test after studying for a while, I got a 575. That one actually stung, because I’d put in real effort and it still felt like I was nowhere close to where I wanted to be.
            </p>
          </section>

          <div className="section-divider"></div>

          <section className="article-section">
            <p>
              The part that surprised me wasn’t that the test was hard. It was how it was hard. I assumed quant would be my strength because of my background, but I was missing questions there too. And verbal was way tougher than I expected. I realized I hadn’t really done deep, focused reading in years. My brain was used to short bursts of information, fast scrolling, quick inputs. Suddenly I had to read dense passages, hold arguments in my head, track logic, evaluate assumptions — under time pressure.
            </p>

            <p>
              My mind felt scattered. I kept running into this frustrating feeling where I knew I wasn’t performing well but couldn’t always explain exactly why.
            </p>

            <blockquote>
              At one point I remember thinking, I actually feel stupid right now — and that wasn’t a feeling I was used to. That was probably the most humbling part of the whole process.
            </blockquote>
          </section>

          <div className="section-divider"></div>

          <section className="article-section">
            <p>
              After a few months I realized I needed a better approach, not just more effort. I ended up connecting with a coach whose perspective I respected, and working with him changed things. Not because he magically made the test easier, but because he forced me to slow down and actually understand what I was doing wrong and how I was thinking. We rebuilt my approach to problems, especially verbal, and focused a lot on reviewing deeply instead of just grinding questions.
            </p>

            <p>
              I worked hard for a couple months with that structure and then took another exam. I got a 585. That was a rough day. I really thought I’d see a big jump and I didn’t. I was frustrated and honestly a bit discouraged. That was probably the closest I came to questioning whether this whole thing was worth it.
            </p>
          </section>

          <div className="section-divider"></div>

          <section className="article-section">
            <p>
              But at that point I had a choice. I could assume the process wasn’t working, or I could trust it a little longer. <strong>I decided to trust it.</strong>
            </p>

            <p>
              Not long after that, I tested again and scored a 655. It wasn’t the score I originally wanted. My goal had been above 700, and I genuinely believed I could get there. There were even some testing-day issues that didn’t help, and part of me still wonders what I might have scored under perfect conditions. But I also knew something else when I saw that number: I’d pushed through something that had actually challenged me.
            </p>
          </section>

          <div className="section-divider"></div>

          <section className="article-section">
            <p>
              I spent way more time on the GMAT than I ever expected to. But I don’t regret it. The process forced me to sharpen skills I hadn’t been using — especially reading carefully, thinking precisely, and being honest with myself about mistakes instead of glossing over them. It made me more disciplined, and it made me more aware of how I approach problems in general.
            </p>

            <p>
              The 655 still stings a little because I know I had aimed higher. At the same time, I’m proud of the fact that I didn’t quit when progress was slow or when results didn’t match effort right away. I think I would have regretted it if I hadn’t followed through.
            </p>
          </section>

          <div className="section-divider"></div>

          <section className="article-section">
            <p>
              <strong>So that’s really why I applied for an MBA in 2026.</strong> Not because I was certain of the outcome, and not because everything went perfectly, but because I knew I had more in me than I was currently using, and I wanted to find out how far I could actually push that.
            </p>
          </section>
        </article>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-line">Written by Josh Agarwal</div>
        </div>
      </footer>
    </div>
  );
}
