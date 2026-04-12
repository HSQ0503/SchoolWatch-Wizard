import Reveal from "./Reveal";
import SectionDivider from "./SectionDivider";

export default function OpenSourceBlock() {
  return (
    <section
      aria-label="Open source and infrastructure"
      className="relative px-6 py-20"
    >
      <SectionDivider />
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-label)]">
            Made public
          </p>
          <h2
            className="mt-4 text-3xl font-medium leading-[1.1] tracking-[-0.02em] text-white md:text-4xl font-[family-name:var(--font-display)]"
            style={{ fontVariationSettings: '"opsz" 72' }}
          >
            Open by design.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[color:var(--color-body)]">
            SchoolWatch is open source. Every school gets its own repository and
            its own URL — deployed on Vercel, no shared infrastructure, no
            accounts to manage.
          </p>

          <ul className="mt-10 flex flex-wrap items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-label)]">
            <li>
              <a
                href="https://github.com/HSQ0503/schoolwatch-wizard"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[color:var(--color-border-hairline)] px-3 py-1 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-accent)] focus-visible:outline-offset-2"
              >
                GitHub
              </a>
            </li>
            <li className="rounded-full border border-[color:var(--color-border-hairline)] px-3 py-1">
              Vercel
            </li>
            <li className="rounded-full border border-[color:var(--color-border-hairline)] px-3 py-1">
              MIT License
            </li>
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
