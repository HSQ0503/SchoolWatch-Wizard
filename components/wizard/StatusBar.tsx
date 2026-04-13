import Kbd from "./Kbd";

// Sticky footer for the wizard: keyboard hints on the left, validity + nav on the right.
// Reference: wizard-terminal.html — .statusbar block
type Props = {
  status: "valid" | "invalid" | "pending";
  statusText: string;          // e.g. "8 of 8 required fields"
  onBack: () => void;
  onNext?: () => void;         // omit on final step
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
      ? "var(--color-ok)"
      : status === "invalid"
      ? "var(--color-warn)"
      : "var(--color-text-faded)";

  return (
    <div
      className="flex items-center justify-between gap-4 border-t border-[color:var(--color-line)] bg-[color:var(--color-bg-raised)] px-[18px] py-2 text-[11px] text-[color:var(--color-text-faded)]"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <div className="flex flex-wrap gap-5">
        <span className="flex items-center gap-1.5">
          <Kbd>TAB</Kbd> next field
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>⏎</Kbd> continue
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>⌘</Kbd> <Kbd>←</Kbd> back
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span style={{ color: statusColor }}>
          {status === "valid" ? "● " : status === "invalid" ? "▲ " : "○ "}
          {statusText}
        </span>
        <span>·</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onBack}
            disabled={isFirst}
            className="cursor-pointer border border-[color:var(--color-line-strong)] bg-transparent px-2.5 py-1 text-[color:var(--color-text-dim)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-foreground)] disabled:cursor-not-allowed disabled:opacity-30"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ← back
          </button>
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className="cursor-pointer border border-[color:var(--color-accent)] bg-[color:var(--color-accent)] px-2.5 py-1 font-bold text-black hover:brightness-110"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
