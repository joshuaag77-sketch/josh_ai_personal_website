import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--hair)] bg-[color:var(--paper)]/85 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="group flex items-baseline gap-3">
            <span className="display-font text-lg font-semibold text-[color:var(--ink)] group-hover:text-[color:var(--accent-deep)] transition-colors">
              Joshua Agarwal
            </span>
            <span className="spec-label spec-label--muted hidden sm:inline">
              Field Notes
            </span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/posts"
              className="text-sm text-[color:var(--ink-muted)] hover:text-[color:var(--accent-deep)] transition-colors"
            >
              Notebook
            </Link>
            <Link
              href="/about"
              className="text-sm text-[color:var(--ink-muted)] hover:text-[color:var(--accent-deep)] transition-colors"
            >
              About
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
