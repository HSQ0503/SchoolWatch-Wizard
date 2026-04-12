import Reveal from "./Reveal";

type Callout = {
  position: string;
  title: string;
  body: string;
};

const CALLOUTS: Callout[] = [
  {
    position: "top-[18%] left-[-12%]",
    title: "Live countdown ring",
    body: "Checked by every kid between classes.",
  },
  {
    position: "top-[10%] right-[-10%]",
    title: '"It\'s Friday / 3rd Period"',
    body: "Knows what day it is. Knows what period you're in.",
  },
  {
    position: "bottom-[22%] left-[-12%]",
    title: "Next-event card",
    body: "Spirit day, homecoming, early dismissal — all of it.",
  },
  {
    position: "bottom-[8%] right-[-10%]",
    title: "Your school's colors",
    body: "Eight color zones, dark mode included.",
  },
];

export default function LakerWatchShowcase() {
  return (
    <section className="relative px-6 py-28">
      <Reveal>
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-label)]">
          Live at Windermere Prep
        </p>
        <h2 className="mt-4 max-w-[20ch] text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-white md:text-5xl">
          A real student-built dashboard. Running right now.
        </h2>

        {/* Desktop (lg+): screenshot + absolutely-positioned callouts */}
        <div className="relative mx-auto mt-20 hidden w-full max-w-3xl lg:block">
          <div className="relative aspect-[16/10] w-full rounded-xl border border-[color:var(--color-border-hairline)] bg-[color:var(--color-surface)] shadow-2xl">
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
            <div className="flex h-[calc(100%-2.25rem)] items-center justify-center text-xs text-white/20">
              LakerWatch dashboard (placeholder)
            </div>
          </div>

          {CALLOUTS.map((c) => (
            <div
              key={c.title}
              className={`absolute ${c.position} w-44 rounded-lg border border-[color:var(--color-border-hairline)] bg-black/80 p-3 backdrop-blur`}
            >
              <p className="text-[13px] font-semibold text-white">{c.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-[color:var(--color-body)]">
                {c.body}
              </p>
            </div>
          ))}
        </div>

        {/* Tablet / mobile (< lg): screenshot + list */}
        <div className="mt-16 lg:hidden">
          <div className="relative aspect-[16/10] w-full rounded-xl border border-[color:var(--color-border-hairline)] bg-[color:var(--color-surface)]">
            <div
              aria-hidden="true"
              className="flex items-center gap-1.5 border-b border-[color:var(--color-border-hairline)] px-3 py-2"
            >
              <span className="h-2 w-2 rounded-full bg-white/10" />
              <span className="h-2 w-2 rounded-full bg-white/10" />
              <span className="h-2 w-2 rounded-full bg-white/10" />
            </div>
            <div className="flex h-[calc(100%-1.75rem)] items-center justify-center text-xs text-white/20">
              LakerWatch dashboard (placeholder)
            </div>
          </div>
          <ul className="mt-8 space-y-5">
            {CALLOUTS.map((c) => (
              <li key={c.title}>
                <p className="text-sm font-semibold text-white">{c.title}</p>
                <p className="mt-1 text-sm text-[color:var(--color-body)]">
                  {c.body}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-20 flex justify-center">
          <a
            href="https://lakerwatch.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-label)] transition-colors hover:text-white"
          >
            lakerwatch.com →
          </a>
        </div>
      </div>
      </Reveal>
    </section>
  );
}
