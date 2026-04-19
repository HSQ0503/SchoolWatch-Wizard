import Kbd from "./Kbd";

// Sticky app bar: SW monogram + version + connection dot + keyboard hints.
// Dark ink strip sitting atop the paper theme — mirrors how ZineNav sits atop the homepage.
export default function WizardTopBar() {
  return (
    <div
      className="sticky top-0 z-30 flex items-center justify-between bg-[color:var(--color-ink)] px-[18px] py-2.5 text-[11px] text-[color:var(--color-paper)]"
      style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}
    >
      <div className="flex items-center gap-3.5">
        <span
          className="border border-[color:var(--color-paper)] px-1.5 py-0.5 text-[11px] font-extrabold tracking-[0.08em]"
          style={{ fontFamily: "var(--font-archivo)" }}
        >
          SW
        </span>
        <span className="text-[color:var(--color-paper)]/70">
          schoolwatch · wizard · v0.3.2
        </span>
        <span className="flex items-center gap-1.5 text-[color:var(--color-paper)]/70">
          <span
            aria-hidden="true"
            className="inline-block h-[7px] w-[7px] animate-pulse rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]"
          />
          connected
        </span>
      </div>
      <div className="hidden gap-[18px] text-[color:var(--color-paper)]/70 sm:flex">
        <span>
          <Kbd>⌘</Kbd> <Kbd>K</Kbd> commands
        </span>
        <span>
          <Kbd>?</Kbd> help
        </span>
      </div>
    </div>
  );
}
