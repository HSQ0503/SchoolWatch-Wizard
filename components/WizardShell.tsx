"use client";

import { Component, ErrorInfo, ReactNode, useState, useEffect, ComponentType } from "react";
import { WizardFormData } from "@/lib/types";
import { validateStep } from "@/lib/validation";

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
  schoolId?: string;
};

// Error boundary to catch and log React errors
class StepErrorBoundary extends Component<
  { stepIndex: number; children: ReactNode },
  { error: Error | null }
> {
  constructor(props: { stepIndex: number; children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[WizardShell] Step ${this.props.stepIndex} crashed:`, error);
    console.error("[WizardShell] Component stack:", info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-400 font-semibold mb-2">Step failed to render</p>
          <p className="text-red-300 text-sm font-mono break-all">{this.state.error.message}</p>
          <p className="text-gray-500 text-xs mt-3">Check browser console for full stack trace</p>
        </div>
      );
    }
    return this.props.children;
  }
}

type WizardShellProps = {
  steps: ComponentType<StepProps>[];
  initialData?: WizardFormData;
  schoolId?: string;
};

export default function WizardShell({ steps, initialData, schoolId }: WizardShellProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<WizardFormData>(initialData ?? DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  const totalSteps = STEPS.length;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  // Re-validate whenever data or step changes (clears stale errors)
  const currentErrors = validateStep(currentStep, data);

  // Debug: log step transitions
  useEffect(() => {
    console.log(`[WizardShell] Mounted. Step count: ${steps.length}, Data keys:`, Object.keys(data));
  }, []);

  useEffect(() => {
    const StepComponent = steps[currentStep];
    console.log(`[WizardShell] Step changed to ${currentStep} ("${STEPS[currentStep]}")`);
    console.log(`[WizardShell] Component:`, StepComponent?.name || StepComponent || "UNDEFINED");
    console.log(`[WizardShell] Form data snapshot:`, JSON.parse(JSON.stringify(data)));
    // Reset error display when navigating
    setShowErrors(false);
    setErrors([]);
  }, [currentStep]);

  const StepComponent = steps[currentStep];

  if (!StepComponent) {
    console.error(`[WizardShell] No step component at index ${currentStep}. Steps array length: ${steps.length}`);
    return <div className="text-red-400 p-8">Error: No step component at index {currentStep}</div>;
  }

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

      {/* Step content — rendered as a proper React element so hooks are isolated */}
      <main className="flex-1 px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <StepErrorBoundary stepIndex={currentStep} key={currentStep}>
            <StepComponent key={currentStep} data={data} onChange={setData} schoolId={schoolId} />
          </StepErrorBoundary>
        </div>
      </main>

      {/* Validation errors */}
      {showErrors && errors.length > 0 && (
        <div className="px-6">
          <div className="max-w-2xl mx-auto rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 mb-2">
            <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Please fix the following:</p>
            <ul className="space-y-1">
              {errors.map((err, i) => (
                <li key={i} className="text-sm text-red-300">{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="sticky bottom-0 bg-black border-t border-white/10 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => {
              console.log(`[WizardShell] Back clicked. ${currentStep} -> ${currentStep - 1}`);
              setCurrentStep((s) => s - 1);
            }}
            disabled={isFirst}
            className="px-5 py-2.5 rounded-lg text-sm font-medium border border-white/20 text-gray-300 hover:text-white hover:border-white/40 transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            Back
          </button>

          {!isLast && (
            <button
              onClick={() => {
                if (currentErrors.length > 0) {
                  console.log(`[WizardShell] Validation failed at step ${currentStep}:`, currentErrors);
                  setErrors(currentErrors);
                  setShowErrors(true);
                  return;
                }
                console.log(`[WizardShell] Next clicked. ${currentStep} -> ${currentStep + 1}`);
                setCurrentStep((s) => s + 1);
              }}
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
