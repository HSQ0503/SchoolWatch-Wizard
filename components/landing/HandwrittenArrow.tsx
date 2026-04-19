// A Caveat-script label with an optional hand-drawn SVG arrow beneath it.
// Typically absolutely positioned by the parent section.
// Reference: homepage-zine.html — .annotation and .how .step .scribble blocks
type Props = {
  label: string;
  arrow?: "down-left" | "down-right" | "up-left" | "up-right" | "none";
  rotate?: number; // degrees to rotate the whole annotation
  className?: string; // positioning
};

const ARROW_PATHS: Record<Exclude<Props["arrow"], "none" | undefined>, string> = {
  "down-left": "M50 4 C 30 8, 14 14, 6 36",
  "down-right": "M8 4 C 28 8, 44 14, 52 36",
  "up-left": "M50 36 C 30 32, 14 26, 6 4",
  "up-right": "M8 36 C 28 32, 44 26, 52 4",
};

const HEAD_PATHS: Record<Exclude<Props["arrow"], "none" | undefined>, string> = {
  "down-left": "M6 36 L14 28 M6 36 L12 38",
  "down-right": "M52 36 L44 28 M52 36 L46 38",
  "up-left": "M6 4 L14 12 M6 4 L12 2",
  "up-right": "M52 4 L44 12 M52 4 L46 2",
};

export default function HandwrittenArrow({
  label,
  arrow = "down-left",
  rotate = 0,
  className = "",
}: Props) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none text-center leading-tight ${className}`}
      style={{
        fontFamily: "var(--font-caveat)",
        fontWeight: 700,
        fontSize: 22,
        color: "var(--marker)",
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {label}
      {arrow !== "none" && (
        <svg
          width="58"
          height="42"
          viewBox="0 0 58 42"
          fill="none"
          style={{ margin: "6px auto 0", display: "block" }}
        >
          <path
            d={ARROW_PATHS[arrow]}
            stroke="var(--marker)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={HEAD_PATHS[arrow]}
            stroke="var(--marker)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}
