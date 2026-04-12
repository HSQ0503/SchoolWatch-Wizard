// Fixed-position paper-grain overlay for the zine homepage.
// Tuned to ink-colored noise on cream (was bright/screen on black in the old dark landing).
const NOISE_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.05  0 0 0 0 0.05  0 0 0 0 0.05  0 0 0 0.22 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`
  );

export default function PaperNoise() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] mix-blend-multiply opacity-[0.6]"
      style={{ backgroundImage: `url("${NOISE_SVG}")`, backgroundSize: "180px 180px" }}
    />
  );
}
