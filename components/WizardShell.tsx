"use client";

import { ReactNode, useState } from "react";
import { WizardFormData } from "@/lib/types";

export const STEPS = [
  "School Info",
  "Colors",
  "Schedule",
  "Lunch Waves",
  "Calendar",
  "Features",
  "Review & Deploy",
] as const;

export const DEFAULT_FORM_DATA: WizardFormData = {
  school: {
    name: "",
    shortName: "",
    acronym: "",
    mascot: "",
    appName: "",
    city: "",
    state: "",
    stateCode: "",
    country: "US",
    academicYear: "",
  },
  colors: {
    primary: "#003da5",
    accent: "#003da5",
  },
  schedule: {
    dayTypes: [
      {
        id: "regular",
        label: "Regular Day",
        weekdays: [1, 2, 3, 4, 5],
      },
    ],
    bells: {
      regular: {
        shared: [
          { name: "1st Period", start: "08:00", end: "08:50" },
        ],
        after: [],
      },
    },
  },
  lunchWaves: {
    enabled: false,
    options: [],
    default: "",
  },
  calendar: {
    noSchoolDates: [],
    earlyDismissalDates: [],
    events: [],
  },
  features: {
    events: true,
    productivity: true,
  },
  contactEmail: "",
};

export type StepProps = {
  data: WizardFormData;
  onChange: (data: WizardFormData) => void;
};

type WizardShellProps = {
  steps: ((props: StepProps) => ReactNode)[];
  initialData?: WizardFormData;
};

export default function WizardShell({ steps, initialData }: WizardShellProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<WizardFormData>(initialData ?? DEFAULT_FORM_DATA);

  const totalSteps = STEPS.length;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Progress bar */}
      <div className="sticky top-0 z-10 bg-black border-b border-white/10 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm font-semibold text-white">
              {STEPS[currentStep]}
            </span>
          </div>
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step content */}
      <main className="flex-1 px-6 py-10">
        <div className="max-w-2xl mx-auto" key={currentStep}>
          {steps[currentStep]({ data, onChange: setData })}
        </div>
      </main>

      {/* Navigation */}
      <div className="sticky bottom-0 bg-black border-t border-white/10 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={isFirst}
            className="px-5 py-2.5 rounded-lg text-sm font-medium border border-white/20 text-gray-300 hover:text-white hover:border-white/40 transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            Back
          </button>

          {!isLast && (
            <button
              onClick={() => setCurrentStep((s) => s + 1)}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-white text-black hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
