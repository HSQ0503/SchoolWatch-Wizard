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
    title: "Events & Calendar",
    description: "Show school events, holidays, and breaks on a calendar page.",
  },
  {
    key: "productivity",
    title: "Productivity Tools",
    description: "Pomodoro timer, Wordle, to-do list, and group randomizer.",
  },
];

const fontMono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

export default function StepFeatures({ data, onChange }: StepProps) {
  function toggle(key: keyof WizardFormData["features"]) {
    onChange({ ...data, features: { ...data.features, [key]: !data.features[key] } });
  }

  return (
    <div className="space-y-6" style={fontMono}>
      <div className="flex items-baseline gap-3.5 border-b border-dashed border-[color:var(--color-line-strong)] pb-4">
        <h2 className="text-[22px] font-bold text-[color:var(--color-foreground)]">
          <span className="text-[color:var(--color-text-faded)] font-normal">{"// "}</span>
          features
        </h2>
        <span className="text-[12px] text-[color:var(--color-text-faded)]">
          — optional modules. countdown and schedule are always on.
        </span>
      </div>

      <div className="space-y-2">
        {FEATURES.map(({ key, title, description }) => {
          const checked = data.features[key];
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              aria-pressed={checked}
              className={`flex w-full cursor-pointer items-start gap-3 border px-4 py-3 text-left transition-colors ${
                checked
                  ? "border-[color:var(--color-accent)] bg-[rgba(255,99,99,0.05)]"
                  : "border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] hover:border-[color:var(--color-accent)]"
              }`}
              style={fontMono}
            >
              <span
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border text-[10px] font-bold ${
                  checked
                    ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-black"
                    : "border-[color:var(--color-text-faded)] text-transparent"
                }`}
              >
                ✓
              </span>
              <div>
                <p className="text-sm font-bold text-[color:var(--color-foreground)]">{title}</p>
                <p className="mt-0.5 text-xs text-[color:var(--color-text-faded)]">{description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
