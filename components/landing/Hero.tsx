import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section aria-label="Hero" className="relative overflow-hidden px-6 pb-24 pt-20 sm:pt-28">
      {/* Radial glow behind headline. rgba(255,99,99,…) matches --color-accent. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-24 h-[520px] w-[820px] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(255,99,99,0.18), transparent 70%)" }}
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.1fr_1fr] md:gap-16">
        {/* Left: copy + CTAs */}
        <div className="relative">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-label)]">
            SchoolWatch
          </p>
          <h1 className="mt-5 max-w-[14ch] text-5xl font-bold leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl md:text-[4.25rem]">
            Build the schedule app your school never made.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[color:var(--color-body)]">
            Pick your colors, add your bell schedule, deploy to a real URL.
            Five minutes, no code, free.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Link
              href="/setup"
              className="rounded-lg bg-[color:var(--color-accent)] px-6 py-3 text-sm font-semibold text-black transition-transform duration-150 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-accent)] focus-visible:outline-offset-2"
            >
              Start Yours →
            </Link>
            <a
              href="https://lakerwatch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-white/80 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-accent)] focus-visible:outline-offset-2"
            >
              See LakerWatch →
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-2">
            {["Free", "5 minutes", "No code"].map((label) => (
              <li
                key={label}
                className="rounded-full border border-[color:var(--color-border-hairline)] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[color:var(--color-label)]"
              >
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: placeholder screenshot window */}
        <div className="relative">
          <div
            className="relative aspect-[4/3] w-full rotate-[2deg] rounded-xl border border-[color:var(--color-border-hairline)] bg-[color:var(--color-surface)] shadow-2xl"
            style={{ boxShadow: "0 40px 120px -20px rgba(255,99,99,0.15)" }}
          >
            {/* Window chrome — decorative */}
            <div
              aria-hidden="true"
              className="flex items-center gap-1.5 border-b border-[color:var(--color-border-hairline)] px-3 py-2.5"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="ml-3 font-mono text-[10px] text-white/30">
                lakerwatch.com
              </span>
            </div>
            <div className="relative h-[calc(100%-2.25rem)] w-full overflow-hidden">
              <Image
                src="/screenshots/lakerwatch-dashboard.png"
                alt="LakerWatch dashboard at Windermere Prep, showing a live countdown ring, the current period, and the school calendar."
                fill
                className="object-cover object-top"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
