export default function SectionDivider() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center"
    >
      <div className="h-px w-full bg-[color:var(--color-border-hairline)]" />
      <div className="absolute h-1 w-1 rotate-45 bg-[color:var(--color-accent)]" />
    </div>
  );
}
