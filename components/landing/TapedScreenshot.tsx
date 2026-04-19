// A framed screenshot (or arbitrary child content) held down with configurable tape strips.
// Reference: homepage-zine.html — .screenshot-holder and .how .step .thumb blocks
type TapeColor = "yellow" | "red";
type TapePosition = "top-left" | "top-right";

type Props = {
  children: React.ReactNode;
  rotation?: number; // degrees
  tapes?: { position: TapePosition; color: TapeColor }[];
  className?: string;
};

const COLOR_STYLES: Record<TapeColor, React.CSSProperties> = {
  yellow: { background: "rgba(255,210,60,0.5)" },
  red: { background: "rgba(214,60,60,0.25)" },
};

export default function TapedScreenshot({
  children,
  rotation = 0,
  tapes = [],
  className = "",
}: Props) {
  return (
    <div
      className={`no-tilt-rm relative bg-white pt-3.5 px-3.5 pb-9 border border-black/10 shadow-[0_20px_50px_rgba(26,26,26,0.18),0_3px_6px_rgba(26,26,26,0.08)] ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {tapes.map((t, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`absolute -top-3 h-5 w-[90px] border border-dashed border-black/10 ${
            t.position === "top-left" ? "left-5 -rotate-3" : "right-5 rotate-3"
          }`}
          style={COLOR_STYLES[t.color]}
        />
      ))}
      <div className="relative overflow-hidden">{children}</div>
    </div>
  );
}
