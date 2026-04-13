import Kbd from "./Kbd";

// Sticky app bar: SW monogram + version + connection dot + keyboard hints.
// Reference: wizard-terminal.html — .appbar block
export default function WizardTopBar() {
  return (
    <div
      className="flex items-center justify-between border-b border-[color:var(--color-line)] bg-[color:var(--color-bg-raised)] px-[18px] py-2.5 text-[11px]"
      style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}
    >
      <div className="flex items-center gap-3.5">
        <div
          className="border border-[color:var(--color-foreground)] px-1.5 py-0.5 text-[11px] font-extrabold tracking-[0.08em] text-[color:var(--color-foreground)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          SW
        </div>
        <div className="text-[color:var(--color-text-faded)]">
          schoolwatch · wizard · v0.3.2
        </div>
        <div className="flex items-center gap-1.5 text-[color:var(--color-text-faded)]">
          <span
            aria-hidden="true"
            className="inline-block h-[7px] w-[7px] animate-pulse rounded-full bg-[color:var(--color-ok)] shadow-[0_0_8px_var(--color-ok)]"
          />
          connected
        </div>
      </div>
      <div className="flex gap-[18px] text-[color:var(--color-text-faded)]">
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
