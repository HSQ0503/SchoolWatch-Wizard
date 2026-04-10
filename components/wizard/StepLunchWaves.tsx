"use client";

import type { WizardFormData } from "@/lib/types";

type StepProps = { data: WizardFormData; onChange: (data: WizardFormData) => void };

type WaveOption = { id: string; label: string };

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black";

const DEFAULT_WAVES: WaveOption[] = [
  { id: "wave-1", label: "Wave 1" },
  { id: "wave-2", label: "Wave 2" },
];

export default function StepLunchWaves({ data, onChange }: StepProps) {
  console.log("[StepLunchWaves] Rendering. enabled:", data.lunchWaves.enabled, "options:", data.lunchWaves.options.length);
  const { enabled, options, default: defaultWave } = data.lunchWaves;

  function updateLunchWaves(patch: Partial<WizardFormData["lunchWaves"]>) {
    onChange({ ...data, lunchWaves: { ...data.lunchWaves, ...patch } });
  }

  function toggleEnabled() {
    if (enabled) {
      // Turn off — clear everything
      updateLunchWaves({ enabled: false, options: [], default: "" });
    } else {
      // Turn on — seed with 2 default waves
      updateLunchWaves({
        enabled: true,
        options: DEFAULT_WAVES,
        default: DEFAULT_WAVES[0].id,
      });
    }
  }

  function addWave() {
    const id = `wave-${options.length + 1}`;
    const newOptions = [...options, { id, label: `Wave ${options.length + 1}` }];
    updateLunchWaves({ options: newOptions });
  }

  function removeWave(index: number) {
    const removed = options[index];
    const newOptions = options.filter((_, i) => i !== index);
    const newDefault =
      defaultWave === removed.id ? (newOptions[0]?.id ?? "") : defaultWave;
    updateLunchWaves({ options: newOptions, default: newDefault });
  }

  function updateWave(index: number, patch: Partial<WaveOption>) {
    const newOptions = options.map((w, i) => (i === index ? { ...w, ...patch } : w));
    updateLunchWaves({ options: newOptions });
  }

  function setDefault(id: string) {
    updateLunchWaves({ default: id });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Lunch Waves</h2>
        <p className="mt-1 text-sm text-gray-500">
          Does your school split lunch into multiple waves (staggered lunch periods)?
        </p>
      </div>

      {/* Big toggle */}
      <button
        onClick={toggleEnabled}
        aria-pressed={enabled}
        className={`cursor-pointer flex w-full items-center justify-between rounded-xl border-2 px-5 py-4 text-left transition-colors duration-150 ${
          enabled
            ? "border-black bg-black text-white"
            : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
        }`}
      >
        <span className="text-sm font-semibold">Yes, we have lunch waves</span>
        {/* Toggle pill */}
        <span
          className={`flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
            enabled ? "bg-white" : "bg-gray-300"
          }`}
        >
          <span
            className={`h-4 w-4 rounded-full shadow transition-transform duration-200 ${
              enabled ? "translate-x-6 bg-black" : "translate-x-1 bg-white"
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
                  className="w-32 shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black font-mono"
                  type="text"
                  placeholder="wave-1"
                  value={wave.id}
                  onChange={(e) => {
                    const newId = e.target.value;
                    const newOptions = options.map((w, j) =>
                      j === i ? { ...w, id: newId } : w
                    );
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
                {/* Default toggle */}
                <button
                  onClick={() => setDefault(wave.id)}
                  aria-pressed={defaultWave === wave.id}
                  className={`cursor-pointer shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition-colors duration-150 ${
                    defaultWave === wave.id
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white text-gray-500 hover:border-gray-400"
                  }`}
                >
                  Default
                </button>
                {/* Remove */}
                <button
                  onClick={() => removeWave(i)}
                  aria-label={`Remove wave ${i + 1}`}
                  className="cursor-pointer shrink-0 rounded-lg p-2 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-red-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addWave}
            className="cursor-pointer rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 transition-colors duration-150 hover:border-gray-400 hover:text-gray-700"
          >
            + Add Lunch Wave
          </button>

          <p className="rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-500 leading-relaxed border border-gray-200">
            <strong className="text-gray-700">Next step:</strong> Go back to Schedule to add
            lunch-specific periods for each wave. Periods in those slots will be tied to the wave
            selected by each student.
          </p>
        </div>
      )}
    </div>
  );
}
