import Kbd from "./Kbd";

// Sticky footer for the wizard: keyboard hints on the left, validity + nav on the right.
// Paper-dark band with hairline top border. Primary CTA uses the signature ink-button
// with yellow offset shadow from ZineHero.tsx.
type Props = {
  status: "valid" | "invalid" | "pending";
  statusText: string;
  onBack: () => void;
  onNext?: () => void;
  isFirst: boolean;
};

export default function StatusBar({
  status,
  statusText,
  onBack,
  onNext,
  isFirst,
}: Props) {
  const statusColor =
    status === "valid"
      ? "#3a7d5c"
      : status === "invalid"
      ? "var(--marker)"
      : "var(--ink-faded)";

  return (
    <div
      className="sticky bottom-0 z-20 flex items-center justify-between gap-4 border-t border-[color:var(--color-hairline)] bg-[color:var(--color-paper-dark)] px-[18px] py-3 text-[11px] text-[color:var(--color-ink-faded)]"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {/* Keyboard hints — desktop only. On mobile the paper surface is tight. */}
      <div className="hidden flex-wrap gap-5 md:flex">
        <span className="flex items-center gap-1.5">
          <Kbd>TAB</Kbd>
          <span className="text-[color:var(--color-ink)]/60">next field</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>⏎</Kbd>
          <span className="text-[color:var(--color-ink)]/60">continue</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>⌘</Kbd> <Kbd>←</Kbd>
          <span className="text-[color:var(--color-ink)]/60">back</span>
        </span>
      </div>
      <div className="flex flex-1 items-center justify-end gap-4 md:flex-initial">
        <span
          style={{ color: statusColor, fontFamily: "var(--font-display)", fontStyle: "italic" }}
          className="text-[13px]"
        >
          {statusText}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            disabled={isFirst}
            className="group inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.14em] text-[color:var(--color-ink)] underline underline-offset-4 decoration-[1.5px] transition-colors duration-150 hover:text-[color:var(--color-marker)] hover:decoration-[color:var(--color-marker)] hover:[text-decoration-style:wavy] disabled:cursor-not-allowed disabled:opacity-30 disabled:no-underline"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ← back
          </button>
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className="group inline-flex cursor-pointer items-center gap-2 border-2 border-[color:var(--color-ink)] bg-[color:var(--color-ink)] px-4 py-2 text-[color:var(--color-paper)] shadow-[4px_4px_0_var(--highlight)] transition-[transform,box-shadow] duration-150 ease-out hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--highlight)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-[0_0_0_var(--highlight)] active:duration-75"
              style={{ fontFamily: "var(--font-archivo)", fontSize: 13, letterSpacing: "0.02em" }}
            >
              NEXT
              <span className="text-[16px] leading-[0] transition-transform duration-150 group-hover:translate-x-0.5">
                →
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
