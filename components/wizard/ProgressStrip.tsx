"use client";

// ASCII-style progress: "step NN / MM  ██████░░░  LABEL"
// Active cell gets a hatched-animation overlay and a coral glow.
// Reference: wizard-terminal.html — .progress block
type Props = {
  current: number; // zero-indexed active step
  total: number;
  label: string;
};

export default function ProgressStrip({ current, total, label }: Props) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    <div
      className="flex items-center gap-4 border-b border-[color:var(--color-line)] px-[18px] py-3.5 text-xs"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <div className="text-[color:var(--color-text-faded)]">
        step{" "}
        <b className="font-bold text-[color:var(--color-accent)]">
          {pad(current + 1)}
        </b>{" "}
        / {pad(total)}
      </div>
      <div className="flex flex-1 gap-[3px]">
        {Array.from({ length: total }).map((_, i) => {
          const isDone = i < current;
          const isActive = i === current;
          return (
            <div
              key={i}
              className={`relative h-3 flex-1 overflow-hidden border ${
                isDone || isActive
                  ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)]"
                  : "border-[color:var(--color-line-strong)] bg-[color:var(--color-background)]"
              }`}
              style={
                isActive
                  ? { boxShadow: "0 0 12px rgba(255,99,99,0.6)" }
                  : undefined
              }
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 animate-[progress-slide_1s_linear_infinite]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(-45deg, transparent 0 3px, rgba(0,0,0,0.2) 3px 6px)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="min-w-[140px] text-right text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-foreground)]">
        {label}
      </div>

      <style>{`
        @keyframes progress-slide {
          from { background-position: 0 0; }
          to   { background-position: 24px 0; }
        }
      `}</style>
    </div>
  );
}
