export default function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-border-hairline)] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 font-mono text-xs text-[color:var(--color-body)] sm:flex-row sm:items-center">
        <p>SchoolWatch — made by Han at Windermere Prep.</p>
        <div className="flex gap-6">
          <a
            href="https://github.com/HSQ0503/schoolwatch-wizard"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            GitHub
          </a>
          <a
            href="https://lakerwatch.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            See LakerWatch
          </a>
        </div>
      </div>
    </footer>
  );
}
