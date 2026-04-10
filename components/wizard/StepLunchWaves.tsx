"use client";

import type { WizardFormData } from "@/lib/types";

type StepProps = { data: WizardFormData; onChange: (data: WizardFormData) => void };

type WaveOption = { id: string; label: string };

const inputClass =
  "w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors duration-150";

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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Lunch Waves</h2>
        <p className="mt-1 text-sm text-gray-400">
          Does your school split lunch into multiple waves (staggered lunch periods)?
        </p>
      </div>

      {/* Toggle */}
      <button
        onClick={toggleEnabled}
        aria-pressed={enabled}
        className={`cursor-pointer flex w-full items-center justify-between rounded-xl border-2 px-5 py-4 text-left transition-colors duration-150 ${
          enabled
            ? "border-white bg-white/10 text-white"
            : "border-white/20 text-gray-400 hover:border-white/30"
        }`}
      >
        <span className="text-sm font-semibold">Yes, we have lunch waves</span>
        <span
          className={`flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
            enabled ? "bg-white" : "bg-white/20"
          }`}
        >
          <span
            className={`h-4 w-4 rounded-full shadow transition-transform duration-200 ${
              enabled ? "translate-x-6 bg-black" : "translate-x-1 bg-gray-400"
            }`}
          />
        </span>
      </button>

      {/* Wave options */}
      {enabled && (
        <div className="space-y-4">
          <div className="space-y-2">
            {options.map((wave, i) => (
              <div key={wave.id} className="flex items-center gap-3">
                <input
                  className="w-32 shrink-0 rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white font-mono placeholder-gray-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors duration-150"
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
                  className={`cursor-pointer shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition-colors duration-150 ${
                    defaultWave === wave.id
                      ? "border-white bg-white text-black"
                      : "border-white/20 text-gray-500 hover:text-white hover:border-white/40"
                  }`}
                >
                  Default
                </button>
                <button
                  onClick={() => removeWave(i)}
                  aria-label={`Remove wave ${i + 1}`}
                  className="cursor-pointer shrink-0 rounded-lg p-2 text-gray-600 transition-colors duration-150 hover:bg-white/5 hover:text-red-400"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addWave}
            className="cursor-pointer rounded-lg border border-dashed border-white/20 px-4 py-2 text-sm text-gray-500 transition-colors duration-150 hover:border-white/30 hover:text-gray-300"
          >
            + Add Lunch Wave
          </button>

          <p className="rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-xs text-gray-400 leading-relaxed">
            <strong className="text-gray-300">Tip:</strong> After setting up waves, go back to the Schedule step to add lunch-specific periods for each wave.
          </p>
        </div>
      )}
    </div>
  );
}
