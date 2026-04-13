// A tiny keyboard-key badge used throughout the wizard chrome.
// Reference: wizard-terminal.html — .kbd CSS class
type Props = { children: React.ReactNode };

export default function Kbd({ children }: Props) {
  return (
    <span
      className="inline-block rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-background)] px-1.5 py-px text-[10px] text-[color:var(--color-text-dim)]"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}
