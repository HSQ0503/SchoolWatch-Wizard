// A text span with a yellow highlighter-marker pass behind it.
// Use inside headlines: <h1>Make your <Highlight>schedule site</Highlight> not suck.</h1>

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Highlight({ children, className = "" }: Props) {
  return (
    <span
      className={className}
      style={{
        background:
          "linear-gradient(180deg, transparent 52%, var(--highlight) 52%, var(--highlight) 94%, transparent 94%)",
        padding: "0 4px",
        margin: "0 -2px",
        // Inline because Tailwind v4 doesn't ship box-decoration-break utilities we can rely on.
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
      }}
    >
      {children}
    </span>
  );
}
