// Numbered red-pen margin note, used next to tilted screenshots on the Showcase section.
// Reference: homepage-zine.html — .showcase .notes .note block
type Props = {
  n: number;
  title: string;
  children: React.ReactNode;
};

export default function MarginNote({ n, title, children }: Props) {
  return (
    <div className="relative mb-10 pl-5 border-l-[3px] border-[color:var(--color-ink)]">
      <span
        aria-hidden="true"
        className="absolute -left-9 -top-1 leading-none"
        style={{
          fontFamily: "var(--font-caveat)",
          fontWeight: 700,
          fontSize: 32,
          color: "var(--marker)",
        }}
      >
        {n}
      </span>
      <h4
        className="text-[color:var(--color-ink)] text-[20px] tracking-tight leading-[1.15] mb-1.5"
        style={{ fontFamily: "var(--font-archivo)" }}
      >
        {title}
      </h4>
      <p
        className="text-[color:var(--color-ink-soft)] text-base leading-[1.5]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {children}
      </p>
    </div>
  );
}
