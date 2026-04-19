"use client";

// Paper-panel progress bar below the topbar. 7 chunky bell-cells with ink borders.
// Active cell fills with highlight yellow and gets a 3px hard offset shadow in ink.
// Replaces the ASCII-style coral hatched bar.
type Props = {
  current: number; // zero-indexed active step
  total: number;
  label: string;
};

export default function ProgressStrip({ current, total, label }: Props) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    <div
      className="sticky top-[38px] z-20 flex items-center gap-4 border-b border-[color:var(--color-hairline)] px-[18px] py-3.5 text-xs text-[color:var(--color-ink-faded)]"
      style={{ fontFamily: "var(--font-mono)", background: "#ebe3d1" }}
    >
      <div>
        step{" "}
        <b
          className="text-[color:var(--color-marker)]"
          style={{ fontFamily: "var(--font-archivo)", fontWeight: 900 }}
        >
          {pad(current + 1)}
        </b>
        {" / "}
        {pad(total)}
      </div>
      <div className="flex flex-1 gap-[3px]">
        {Array.from({ length: total }).map((_, i) => {
          const isDone = i < current;
          const isActive = i === current;
          const filled = isDone || isActive;
          return (
            <div
              key={i}
              className="relative h-3 flex-1 border-[1.5px] border-[color:var(--color-ink)]"
              style={{
                background: filled ? "var(--highlight)" : "var(--paper)",
                boxShadow: isActive ? "3px 3px 0 var(--ink)" : undefined,
              }}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 motion-safe:animate-[zine-shimmer_2.4s_ease-in-out_infinite]"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                    backgroundSize: "200% 100%",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div
        className="min-w-[140px] text-right text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink)]"
      >
        {label}
      </div>

      <style>{`
        @keyframes zine-shimmer {
          0%, 100% { background-position: -50% 0; }
          50% { background-position: 150% 0; }
        }
      `}</style>
    </div>
  );
}
