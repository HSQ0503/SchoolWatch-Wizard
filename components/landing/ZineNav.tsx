import Link from "next/link";

// Sticky top nav for the zine homepage. Wavy red hover underlines.
// Source: homepage-zine.html — nav.top
export default function ZineNav() {
  return (
    <nav
      className="sticky top-0 z-[999] flex items-center justify-between border-b border-[color:var(--color-hairline)] bg-[color:var(--paper)] px-8 py-5"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
      }}
    >
      <div className="flex items-center">
        <img src="/schoolwatch-logo.svg" alt="SchoolWatch" className="h-8 w-auto" />
      </div>
      <div className="flex items-center gap-7">
        <a href="#how" className="text-[color:var(--color-ink)] no-underline hover:[text-decoration:underline_wavy_var(--marker)] hover:underline-offset-[4px]">How it works</a>
        <a href="#showcase" className="text-[color:var(--color-ink)] no-underline hover:[text-decoration:underline_wavy_var(--marker)] hover:underline-offset-[4px]">Live example</a>
        <a href="#faq" className="text-[color:var(--color-ink)] no-underline hover:[text-decoration:underline_wavy_var(--marker)] hover:underline-offset-[4px]">FAQ</a>
        <Link
          href="/setup"
          className="group inline-flex items-center gap-2 border-2 border-[color:var(--ink)] bg-[color:var(--ink)] px-4 py-2 text-[color:var(--paper)] shadow-[4px_4px_0_var(--highlight)] transition-[transform,box-shadow] duration-150 ease-out hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--highlight)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-[0_0_0_var(--highlight)] active:duration-75"
          style={{ fontFamily: "var(--font-archivo)" }}
        >
          Start Yours
          <span className="text-[14px] leading-[0] transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-active:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </nav>
  );
}
