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
    title: "Events & Calendar",
    description: "Show school events, holidays, and breaks on a calendar page.",
  },
  {
    key: "productivity",
    title: "Productivity Tools",
    description: "Pomodoro timer, Wordle, to-do list, and group randomizer.",
  },
];

function CheckIcon({ checked }: { checked: boolean }) {
  if (!checked) {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-white/20 transition-colors duration-150" />
    );
  }
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-white bg-white transition-colors duration-150">
      <svg className="h-3 w-3 text-black" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function StepFeatures({ data, onChange }: StepProps) {
  function toggle(key: keyof WizardFormData["features"]) {
    onChange({ ...data, features: { ...data.features, [key]: !data.features[key] } });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Features</h2>
        <p className="mt-1 text-sm text-gray-400">
          Choose which optional features to include in your dashboard.
        </p>
      </div>

      <div className="space-y-3">
        {FEATURES.map(({ key, title, description }) => {
          const checked = data.features[key];
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              aria-pressed={checked}
              className={`cursor-pointer w-full flex items-center gap-4 rounded-xl border-2 px-5 py-4 text-left transition-all duration-150 ${
                checked
                  ? "border-white bg-white/10"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <CheckIcon checked={checked} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-0.5 text-sm text-gray-400">{description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-500">
        The countdown timer and bell schedule are always included.
      </p>
    </div>
  );
}
