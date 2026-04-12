// Source: homepage-zine.html — .signals
const SIGNALS: { n: string; label: string }[] = [
  { n: "5", label: "min to live" },
  { n: "0", label: "lines of code" },
  { n: "247", label: "schools running" },
  { n: "$0", label: "forever" },
];

export default function SignalsRow() {
  return (
    <section
      aria-label="Key facts"
      className="border-y-2 border-[color:var(--color-ink)] px-8 py-5"
    >
      <ul className="mx-auto flex max-w-[1120px] items-baseline justify-between gap-10 overflow-x-auto">
        {SIGNALS.map((s, i) => (
          <li key={s.label} className="flex items-baseline gap-3 whitespace-nowrap">
            <span
              className="text-[color:var(--color-marker)]"
              style={{
                fontFamily: "var(--font-archivo)",
                fontSize: 34,
                letterSpacing: "-0.03em",
              }}
            >
              {s.n}
            </span>
            <span
              className="text-[color:var(--color-ink)]"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              {s.label}
            </span>
            {i < SIGNALS.length - 1 && (
              <span
                aria-hidden="true"
                className="ml-7 mt-3 h-2.5 w-2.5 rotate-45 bg-[color:var(--color-ink)]"
              />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
