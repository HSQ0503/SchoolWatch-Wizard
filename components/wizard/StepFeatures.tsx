"use client";

import React from "react";
import type { WizardFormData } from "@/lib/types";

type StepProps = { data: WizardFormData; onChange: (data: WizardFormData) => void };

type Feature = {
  key: keyof WizardFormData["features"];
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    key: "events",
    title: "Events",
    description:
      "Show upcoming school events on the dashboard. Reads from the calendar you just set up.",
  },
  {
    key: "productivity",
    title: "Productivity",
    description:
      "Show a small focus timer and to-do list widget on the dashboard sidebar.",
  },
];

// Zine step-body primitives (shared visual language used by all 7 steps).
const kickerCls =
  "mb-3 text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink-faded)]";
const headlineCls =
  "font-[900] leading-[0.95] tracking-[-0.02em] text-[color:var(--color-ink)]";
const subcopyCls =
  "mt-4 text-[15px] leading-[1.55] text-[color:var(--color-ink-soft)]";
const labelCls =
  "mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-faded)]";
void labelCls;
const kickerFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };
const headlineFont: React.CSSProperties = {
  fontFamily: "var(--font-archivo)",
  fontSize: "clamp(32px, 4.2vw, 52px)",
};
const italicAccent: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontStyle: "italic",
  fontWeight: 400,
  letterSpacing: "-0.01em",
};
const subcopyFont: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  maxWidth: "52ch",
};
const labelFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };
void labelFont;

export default function StepFeatures({ data, onChange }: StepProps) {
  function toggle(key: keyof WizardFormData["features"]) {
    onChange({ ...data, features: { ...data.features, [key]: !data.features[key] } });
  }

  return (
    <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div>
        <p className={kickerCls} style={kickerFont}>step 06 / features</p>
        <h1 className={headlineCls} style={headlineFont}>
          Pick the <span style={italicAccent}>extras.</span>
        </h1>
        <p className={subcopyCls} style={subcopyFont}>
          Toggle optional dashboard sections on or off. Both can be changed later without
          redeploying — flip them on to see how they look, off if they feel like clutter.
        </p>

        <div className="mt-10 space-y-5">
          {FEATURES.map(({ key, title, description }) => {
            const checked = data.features[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                aria-pressed={checked}
                className="flex w-full items-center gap-5 border-2 border-[color:var(--color-ink)] bg-[color:var(--color-paper)] p-5 text-left transition-colors hover:bg-[color:var(--color-ink)]/5"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-[color:var(--color-ink)]"
                  style={{ background: checked ? "var(--highlight)" : "transparent" }}
                >
                  {checked && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M3 8.5L6.5 12L13 4"
                        stroke="var(--ink)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                <div>
                  <p
                    className="text-[18px] font-semibold text-[color:var(--color-ink)]"
                    style={{ fontFamily: "var(--font-archivo)" }}
                  >
                    {title}
                  </p>
                  <p
                    className="text-[14px] italic text-[color:var(--color-ink-soft)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right-rail margin note */}
      <aside className="order-first lg:order-last lg:pt-24" aria-label="Tip">
        <div className="relative border-l-[3px] border-[color:var(--color-ink)] pl-5">
          <span
            aria-hidden="true"
            className="absolute -left-8 -top-1 leading-none"
            style={{
              fontFamily: "var(--font-caveat)",
              fontWeight: 700,
              fontSize: 28,
              color: "var(--marker)",
              transform: "rotate(-6deg)",
            }}
          >
            6
          </span>
          <p
            className="text-[15px] italic leading-[1.5] text-[color:var(--color-ink-soft)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Both features can be toggled later without redeploying. Flip them on to see how
            they look; flip them off if they feel like clutter.
          </p>
        </div>
      </aside>
    </div>
  );
}
