"use client";

import React from "react";
import type { WizardFormData } from "@/lib/types";

type StepProps = { data: WizardFormData; onChange: (data: WizardFormData) => void };

type WaveOption = { id: string; label: string };

const inputClass =
  "w-full rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] px-3 py-2 text-[13px] text-[color:var(--color-foreground)] placeholder-[color:var(--color-text-faded)] transition-colors focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-accent)]";

const fontMono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

const DEFAULT_WAVES: WaveOption[] = [
  { id: "wave-1", label: "Wave 1" },
  { id: "wave-2", label: "Wave 2" },
];

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  );
}

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
    <div className="space-y-6" style={fontMono}>
      <div className="flex items-baseline gap-3.5 border-b border-dashed border-[color:var(--color-line-strong)] pb-4">
        <h2 className="text-[22px] font-bold text-[color:var(--color-foreground)]">
          <span className="text-[color:var(--color-text-faded)] font-normal">{"// "}</span>
          lunch_waves
        </h2>
        <span className="text-[12px] text-[color:var(--color-text-faded)]">
          — does your school split lunch into staggered waves?
        </span>
      </div>

      {/* Toggle */}
      <button
        onClick={toggleEnabled}
        aria-pressed={enabled}
        className={`flex w-full cursor-pointer items-center justify-between rounded-[3px] border px-5 py-4 text-left text-sm transition-colors ${
          enabled
            ? "border-[color:var(--color-accent)] bg-[rgba(255,99,99,0.08)] text-[color:var(--color-foreground)]"
            : "border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] text-[color:var(--color-text-dim)] hover:border-[color:var(--color-accent)]"
        }`}
        style={fontMono}
      >
        <span className="font-semibold">
          {enabled ? "● lunch waves enabled" : "○ no lunch waves"}
        </span>
        <span className="text-xs uppercase tracking-[0.12em] text-[color:var(--color-text-faded)]">
          [click to toggle]
        </span>
      </button>

      {enabled && (
        <div className="space-y-4">
          <div className="space-y-2">
            {options.map((wave, i) => (
              <div key={wave.id} className="flex items-center gap-2">
                <input
                  className="w-32 shrink-0 rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] px-3 py-2 text-[13px] text-[color:var(--color-foreground)] placeholder-[color:var(--color-text-faded)] focus:border-[color:var(--color-accent)] focus:outline-none"
                  style={fontMono}
                  type="text"
                  placeholder="wave-1"
                  value={wave.id}
                  onChange={(e) => {
                    const newId = e.target.value;
                    const newOptions = options.map((w, j) => (j === i ? { ...w, id: newId } : w));
                    const newDefault = defaultWave === wave.id ? newId : defaultWave;
                    updateLunchWaves({ options: newOptions, default: newDefault });
                  }}
                  aria-label={`Wave ${i + 1} ID`}
                />
                <input
                  className={inputClass}
                  type="text"
                  placeholder="Wave label"
                  value={wave.label}
                  onChange={(e) => updateWave(i, { label: e.target.value })}
                  aria-label={`Wave ${i + 1} label`}
                />
                <button
                  onClick={() => updateLunchWaves({ default: wave.id })}
                  aria-pressed={defaultWave === wave.id}
                  className={`shrink-0 cursor-pointer rounded-[3px] border px-2.5 py-1.5 text-[11px] ${
                    defaultWave === wave.id
                      ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-black font-bold"
                      : "border-[color:var(--color-line-strong)] text-[color:var(--color-text-faded)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-foreground)]"
                  }`}
                  style={fontMono}
                >
                  default
                </button>
                <button
                  onClick={() => removeWave(i)}
                  aria-label={`Remove wave ${i + 1}`}
                  className="cursor-pointer shrink-0 rounded-[3px] p-1.5 text-[color:var(--color-text-faded)] hover:bg-[color:var(--color-bg-input)] hover:text-[color:var(--color-accent)]"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addWave}
            className="cursor-pointer text-xs uppercase tracking-[0.12em] text-[color:var(--color-accent)] hover:brightness-110"
          >
            [+] add lunch wave
          </button>

          <p className="rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] px-4 py-3 text-[11px] leading-relaxed text-[color:var(--color-text-faded)]">
            <span className="text-[color:var(--color-text-dim)] font-bold">tip:</span> after adding waves, go back to <span className="text-[color:var(--color-accent)]">schedule</span> to set per-wave lunch periods.
          </p>
        </div>
      )}
    </div>
  );
}
