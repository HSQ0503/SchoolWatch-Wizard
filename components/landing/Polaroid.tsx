// White-bordered polaroid frame with optional top tape and a handwritten caption.
// Reference: .superpowers/brainstorm/1270-1776031590/content/homepage-zine.html — .polaroid block
type Props = {
  children: React.ReactNode;
  caption?: string;
  rotation?: number;           // degrees; 0 if omitted
  tape?: boolean;              // yellow tape strip across the top-center
  className?: string;          // additional absolute positioning / sizing classes
  style?: React.CSSProperties; // escape-hatch for one-off positioning
};

export default function Polaroid({
  children,
  caption,
  rotation = 0,
  tape = false,
  className = "",
  style,
}: Props) {
  return (
    <div
      className={`no-tilt-rm relative bg-white pt-2.5 px-2.5 pb-9 shadow-[0_14px_30px_rgba(26,26,26,0.15),0_2px_4px_rgba(26,26,26,0.1)] border border-black/5 ${className}`}
      style={{ transform: `rotate(${rotation}deg)`, ...style }}
    >
      {tape && (
        <span
          aria-hidden="true"
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 -rotate-3 h-5 w-[90px] border border-dashed border-black/10"
          style={{ background: "rgba(255,210,60,0.55)" }}
        />
      )}
      <div className="w-full h-full relative overflow-hidden">{children}</div>
      {caption && (
        <p
          className="absolute bottom-2.5 left-2.5 right-2.5 text-center text-[color:var(--color-ink-soft)]"
          style={{ fontFamily: "var(--font-caveat)", fontSize: 17, fontWeight: 700 }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}
