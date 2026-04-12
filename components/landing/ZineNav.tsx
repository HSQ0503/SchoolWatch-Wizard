// Sticky top nav for the zine homepage. Wavy red hover underlines.
// Source: homepage-zine.html — nav.top
export default function ZineNav() {
  return (
    <nav
      className="sticky top-0 z-10 flex items-center justify-between border-b border-[color:var(--color-hairline)] bg-[color:var(--color-paper)] px-8 py-5"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
      }}
    >
      <div className="flex items-center gap-2.5 font-bold">
        <span
          className="-rotate-2 border-[1.5px] border-[color:var(--color-ink)] px-1.5 py-0.5 text-[11px] tracking-[0.04em]"
          style={{ fontFamily: "var(--font-archivo)" }}
        >
          SW
        </span>
        SchoolWatch
      </div>
      <div className="flex gap-7">
        <a href="#how" className="text-[color:var(--color-ink)] no-underline hover:[text-decoration:underline_wavy_var(--marker)] hover:underline-offset-[4px]">How it works</a>
        <a href="#showcase" className="text-[color:var(--color-ink)] no-underline hover:[text-decoration:underline_wavy_var(--marker)] hover:underline-offset-[4px]">Live example</a>
        <a href="#faq" className="text-[color:var(--color-ink)] no-underline hover:[text-decoration:underline_wavy_var(--marker)] hover:underline-offset-[4px]">FAQ</a>
        <a
          href="https://github.com/HSQ0503/schoolwatch-wizard"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[color:var(--color-ink)] no-underline hover:[text-decoration:underline_wavy_var(--marker)] hover:underline-offset-[4px]"
        >
          GitHub ↗
        </a>
      </div>
    </nav>
  );
}
