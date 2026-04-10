import { deriveColors } from "@/lib/colors";
import type { WizardFormData } from "@/lib/types";

type StepProps = { data: WizardFormData; onChange: (data: WizardFormData) => void };

const inputClass =
  "w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white font-mono placeholder-gray-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors duration-150";

const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

const SWATCH_LABELS: Record<string, string> = {
  primary: "Primary",
  primaryLight: "Primary Light",
  accent: "Accent",
  accentLight: "Accent Light",
  darkBg: "Dark Bg",
  darkSurface: "Dark Surface",
};

export default function StepColors({ data, onChange }: StepProps) {
  const { primary, accent } = data.colors;

  function updateColors(patch: Partial<WizardFormData["colors"]>) {
    onChange({ ...data, colors: { ...data.colors, ...patch } });
  }

  const derived = deriveColors(primary || "#000000", accent || "#000000");

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white">School Colors</h2>
        <p className="mt-1 text-sm text-gray-400">
          Pick your two brand colors. All UI shades are derived automatically.
        </p>
      </div>

      {/* Color pickers */}
      <div className="grid grid-cols-2 gap-6">
        {/* Primary */}
        <div className="space-y-2">
          <label className={labelClass}>Primary Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primary || "#000000"}
              onChange={(e) => updateColors({ primary: e.target.value })}
              className="h-11 w-14 cursor-pointer rounded-lg border border-white/20 bg-transparent p-1"
              aria-label="Pick primary color"
            />
            <input
              className={inputClass}
              type="text"
              placeholder="#003da5"
              maxLength={7}
              value={primary}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9a-fA-F]{0,6}$/.test(val)) updateColors({ primary: val });
              }}
            />
          </div>
        </div>

        {/* Accent */}
        <div className="space-y-2">
          <label className={labelClass}>Accent Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={accent || "#000000"}
              onChange={(e) => updateColors({ accent: e.target.value })}
              className="h-11 w-14 cursor-pointer rounded-lg border border-white/20 bg-transparent p-1"
              aria-label="Pick accent color"
            />
            <input
              className={inputClass}
              type="text"
              placeholder="#003da5"
              maxLength={7}
              value={accent}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9a-fA-F]{0,6}$/.test(val)) updateColors({ accent: val });
              }}
            />
          </div>
        </div>
      </div>

      {/* Derived color preview */}
      <div>
        <h3 className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Derived Palette
        </h3>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {(Object.entries(SWATCH_LABELS) as [keyof typeof derived, string][]).map(
            ([key, label]) => (
              <div key={key} className="flex flex-col items-center gap-1.5">
                <div
                  className="h-14 w-full rounded-lg border border-white/10"
                  style={{ background: derived[key] }}
                  title={derived[key]}
                />
                <span className="text-center text-xs text-gray-400 leading-tight">{label}</span>
                <span className="text-center font-mono text-[10px] text-gray-500 truncate w-full">
                  {derived[key].startsWith("rgba")
                    ? derived[key].slice(0, 22) + "..."
                    : derived[key]}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
