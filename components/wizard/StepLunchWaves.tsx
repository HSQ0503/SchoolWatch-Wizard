"use client";

import React from "react";
import type { WizardFormData } from "@/lib/types";

type StepProps = { data: WizardFormData; onChange: (data: WizardFormData) => void };

type WaveOption = { id: string; label: string };

// Zine step-body primitives (shared visual language used by all 7 steps).
const kickerCls =
  "mb-3 text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink-faded)]";
const headlineCls =
  "font-[900] leading-[0.95] tracking-[-0.02em] text-[color:var(--color-ink)]";
const subcopyCls =
  "mt-4 text-[15px] leading-[1.55] text-[color:var(--color-ink-soft)]";
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

const DEFAULT_WAVES: WaveOption[] = [
  { id: "wave-1", label: "Wave 1" },
  { id: "wave-2", label: "Wave 2" },
];

export default function StepLunchWaves({ data, onChange }: StepProps) {
  const { enabled, options, default: defaultWave } = data.lunchWaves;

  function updateLunchWaves(patch: Partial<WizardFormData["lunchWaves"]>) {
    onChange({ ...data, lunchWaves: { ...data.lunchWaves, ...patch } });
  }

  function toggleEnabled() {
    if (enabled) {
      updateLunchWaves({ enabled: false, options: [], default: "" });
    } else {
      updateLunchWaves({ enabled: true, options: DEFAULT_WAVES, default: DEFAULT_WAVES[0].id });
    }
  }

  function addWave() {
    const id = `wave-${options.length + 1}`;
    updateLunchWaves({ options: [...options, { id, label: `Wave ${options.length + 1}` }] });
  }

  function removeWave(index: number) {
    const removed = options[index];
    const newOptions = options.filter((_, i) => i !== index);
    const newDefault = defaultWave === removed.id ? (newOptions[0]?.id ?? "") : defaultWave;
    updateLunchWaves({ options: newOptions, default: newDefault });
  }

  function updateWave(index: number, patch: Partial<WaveOption>) {
    updateLunchWaves({ options: options.map((w, i) => (i === index ? { ...w, ...patch } : w)) });
  }

  return (
    <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div>
        <p className={kickerCls} style={kickerFont}>step 04 / lunch waves</p>
        <h1 className={headlineCls} style={headlineFont}>
          Split <span style={italicAccent}>lunch</span> by wave?
        </h1>
        <p className={subcopyCls} style={subcopyFont}>
          Some schools run multiple lunch rotations to fit everyone. If yours does, turn this on and name each wave. If lunch is one shared period, leave it off and skip this step.
        </p>

        {/* Enable toggle — InkCheckboxCard pattern */}
        <button
          type="button"
          onClick={toggleEnabled}
          className="mt-10 flex w-full items-center gap-5 border-2 border-[color:var(--color-ink)] bg-[color:var(--color-paper)] p-5 text-left transition-colors hover:bg-[color:var(--color-ink)]/5"
        >
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-[color:var(--color-ink)]"
            style={{ background: enabled ? "var(--highlight)" : "transparent" }}
          >
            {enabled && (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8.5L6.5 12L13 4" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <div>
            <p className="text-[17px] font-semibold text-[color:var(--color-ink)]" style={{ fontFamily: "var(--font-archivo)" }}>Use lunch waves</p>
            <p className="text-[14px] italic text-[color:var(--color-ink-soft)]" style={{ fontFamily: "var(--font-display)" }}>Some schools split lunch across multiple rotations. Enable this if yours does.</p>
          </div>
        </button>

        {/* Wave list */}
        {enabled && (
          <div className="mt-8 space-y-5">
            {options.map((wave, i) => (
              <div
                key={wave.id}
                className="border-l-[3px] border-[color:var(--color-ink)] py-3 pl-5"
              >
                {/* Header row: label input + id input + default radio + remove */}
                <div className="flex items-center gap-3">
                  <input
                    aria-label="Wave name"
                    className="flex-1 border-0 border-b-[1.5px] border-[color:var(--color-ink)] bg-transparent py-2 text-[20px] text-[color:var(--color-ink)] focus:border-[color:var(--color-marker)] focus:outline-none"
                    style={{ fontFamily: "var(--font-archivo)" }}
                    placeholder="Wave label"
                    value={wave.label}
                    onChange={(e) => updateWave(i, { label: e.target.value })}
                  />
                  <input
                    aria-label="Wave ID"
                    className="w-28 border-0 border-b-[1.5px] border-[color:var(--color-ink)] bg-transparent py-2 text-[13px] text-[color:var(--color-ink-soft)] focus:border-[color:var(--color-marker)] focus:outline-none"
                    style={{ fontFamily: "var(--font-mono)" }}
                    placeholder="wave-id"
                    value={wave.id}
                    onChange={(e) => {
                      const newId = e.target.value;
                      const newOptions = options.map((w, j) => (j === i ? { ...w, id: newId } : w));
                      const newDefault = defaultWave === wave.id ? newId : defaultWave;
                      updateLunchWaves({ options: newOptions, default: newDefault });
                    }}
                  />
                  <label
                    className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faded)]"
                    style={labelFont}
                  >
                    <input
                      type="radio"
                      name="default-wave"
                      checked={defaultWave === wave.id}
                      onChange={() => updateLunchWaves({ default: wave.id })}
                      className="accent-[color:var(--color-marker)]"
                    />
                    default
                  </label>
                  <button
                    type="button"
                    onClick={() => removeWave(i)}
                    className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faded)] underline underline-offset-4 hover:text-[color:var(--color-marker)]"
                    style={labelFont}
                  >
                    remove
                  </button>
                </div>
              </div>
            ))}

            {/* Add wave */}
            <button
              type="button"
              onClick={addWave}
              className="mt-6 text-[12px] uppercase tracking-[0.14em] text-[color:var(--color-ink)] underline underline-offset-4 decoration-[1.5px] transition-colors hover:text-[color:var(--color-marker)] hover:[text-decoration-style:wavy]"
              style={labelFont}
            >
              + add wave
            </button>
          </div>
        )}
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
            4
          </span>
          <p
            className="text-[15px] italic leading-[1.5] text-[color:var(--color-ink-soft)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Most schools don&apos;t need this. If lunch is one shared period for everyone, leave the toggle off and skip ahead.
          </p>
        </div>
      </aside>
    </div>
  );
}
