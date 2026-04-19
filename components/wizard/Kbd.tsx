// Tiny keyboard-key badge. Paper-bordered chip designed to sit on top of an ink backdrop
// (inside WizardTopBar). If used on a paper background directly, it stays readable too —
// the ink border + paper fill invert naturally.
type Props = { children: React.ReactNode };

export default function Kbd({ children }: Props) {
  return (
    <span
      className="inline-block rounded-[2px] border border-[color:var(--color-paper)]/60 bg-[color:var(--color-paper)]/10 px-1.5 py-px text-[10px] text-[color:var(--color-paper)]"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}
