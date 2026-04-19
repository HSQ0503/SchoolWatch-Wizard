// Source: homepage-zine.html — <footer> + OpenSourceBlock's pills merged as a row above the main line.
export default function Footer() {
  return (
    <footer
      className="border-t border-[color:var(--color-hairline)] px-8 py-10"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <div className="mx-auto flex max-w-[1120px] flex-col gap-6">
        {/* Open-source pills */}
        <ul className="flex flex-wrap items-center gap-3 text-[11px] uppercase text-[color:var(--color-ink-faded)]" style={{ letterSpacing: "0.22em" }}>
          <li>
            <a
              href="https://github.com/HSQ0503/schoolwatch-wizard"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[color:var(--color-hairline)] px-3 py-1 text-[color:var(--color-ink)] no-underline hover:border-[color:var(--color-marker)]"
            >
              GitHub
            </a>
          </li>
          <li className="rounded-full border border-[color:var(--color-hairline)] px-3 py-1">
            Vercel
          </li>
          <li className="rounded-full border border-[color:var(--color-hairline)] px-3 py-1">
            MIT License
          </li>
        </ul>

        {/* Main line */}
        <div className="flex flex-col items-start justify-between gap-4 text-[12px] text-[color:var(--color-ink-faded)] sm:flex-row sm:items-center">
          <p>
            SchoolWatch · made by{" "}
            <a href="https://www.linkedin.com/in/gustavopcampos/" target="_blank" rel="noopener noreferrer" className="text-[color:var(--color-ink)] underline decoration-[color:var(--color-marker)] underline-offset-2">Guga</a>{" "}
            and{" "}
            <a href="https://www.linkedin.com/in/shouqi-han-726110348/" target="_blank" rel="noopener noreferrer" className="text-[color:var(--color-ink)] underline decoration-[color:var(--color-marker)] underline-offset-2">Han</a>{" "}
            @ WPS
          </p>
          <div className="flex gap-6">
            <a
              href="https://github.com/HSQ0503/schoolwatch-wizard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[color:var(--color-ink)] underline decoration-[color:var(--color-marker)] underline-offset-2"
            >
              GitHub
            </a>
            <a
              href="https://lakerwatch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[color:var(--color-ink)] underline decoration-[color:var(--color-marker)] underline-offset-2"
            >
              LakerWatch.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
