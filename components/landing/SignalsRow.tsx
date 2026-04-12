const SIGNALS = ["5 min to live", "0 lines of code", "Open source"];

export default function SignalsRow() {
  return (
    <section
      aria-label="Key facts about SchoolWatch"
      className="border-y border-[color:var(--color-border-hairline)] px-6 py-5"
    >
      <ul className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
        {SIGNALS.map((label, i) => (
          <li
            key={label}
            className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-label)]"
          >
            {i > 0 && (
              <span
                aria-hidden="true"
                className="hidden h-1 w-1 rounded-full bg-[color:var(--color-accent)] sm:inline-block"
              />
            )}
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
