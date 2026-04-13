"use client";

// Source: homepage-zine.html — .signals
import { useEffect, useRef, useState } from "react";

type Signal = {
  from: number;
  to: number;
  label: string;
  prefix?: string;
  suffix?: string;
  comma?: boolean;
};

const SIGNALS: Signal[] = [
  { from: 0, to: 5, label: "min to live" },
  { from: 47832, to: 0, label: "lines of code", comma: true },
  { from: 0, to: 100, label: "yours", suffix: "%" },
  { from: 299, to: 0, label: "forever", prefix: "$" },
];

const DURATION = 1400;

function formatSignal(value: number, s: Signal) {
  const rounded = Math.round(value);
  const body = s.comma ? rounded.toLocaleString("en-US") : String(rounded);
  return `${s.prefix ?? ""}${body}${s.suffix ?? ""}`;
}

export default function SignalsRow() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [values, setValues] = useState<number[]>(() => SIGNALS.map((s) => s.from));

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setValues(SIGNALS.map((s) => s.to));
      return;
    }

    let rafId = 0;
    let started = false;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / DURATION);
        const eased = 1 - Math.pow(1 - t, 3);
        setValues(SIGNALS.map((s) => s.from + (s.to - s.from) * eased));
        if (t < 1) rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            started = true;
            run();
            observer.disconnect();
          }
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="Key facts"
      className="border-y-2 border-[color:var(--color-ink)] px-8 py-5"
    >
      <ul className="mx-auto flex max-w-[1120px] items-baseline justify-between gap-10 overflow-x-auto">
        {SIGNALS.map((s, i) => (
          <li key={s.label} className="flex items-baseline gap-3 whitespace-nowrap">
            <span
              className="tabular-nums text-[color:var(--color-marker)]"
              style={{
                fontFamily: "var(--font-archivo)",
                fontSize: 34,
                letterSpacing: "-0.03em",
              }}
            >
              {formatSignal(values[i] ?? s.from, s)}
            </span>
            <span
              className="text-[color:var(--color-ink)]"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              {s.label}
            </span>
            {i < SIGNALS.length - 1 && (
              <span
                aria-hidden="true"
                className="ml-7 mt-3 h-2.5 w-2.5 rotate-45 bg-[color:var(--color-ink)]"
              />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
