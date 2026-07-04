export function Footer() {
  return (
    <footer className="border-t border-[color:var(--hair)] mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm text-[color:var(--ink-muted)]">
              © {new Date().getFullYear()} Joshua Agarwal
            </p>
            <p className="spec-label spec-label--muted mt-1.5">
              Calgary → Philadelphia
            </p>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <a
              href="https://github.com/joshuaag77-sketch"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[color:var(--ink-muted)] hover:text-[color:var(--accent-deep)] transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/joshua-agarwal/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[color:var(--ink-muted)] hover:text-[color:var(--accent-deep)] transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="mailto:joshuaag77@gmail.com"
              className="text-[color:var(--ink-muted)] hover:text-[color:var(--accent-deep)] transition-colors"
            >
              Email
            </a>
          </div>
        </div>
        <p className="spec-label spec-label--muted mt-8 text-center sm:text-left">
          This site is written, published, and maintained with agents I built.
        </p>
      </div>
    </footer>
  );
}
