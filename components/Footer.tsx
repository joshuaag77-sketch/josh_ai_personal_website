export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 mt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
          <p>(c) {new Date().getFullYear()} Josh.</p>
          <div className="flex gap-4">
            <a
              href="https://github.com/joshuaag77-sketch"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/joshua-agarwal/?originalSubdomain=ca"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

