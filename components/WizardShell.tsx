"use client";

import { Component, ErrorInfo, ReactNode, useState, useEffect, ComponentType } from "react";
import { WizardFormData } from "@/lib/types";
import { validateStep } from "@/lib/validation";
import WizardTopBar from "@/components/wizard/WizardTopBar";
import ProgressStrip from "@/components/wizard/ProgressStrip";
import StatusBar from "@/components/wizard/StatusBar";

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
    light: {
      navbar: "#ffffff",
      navText: "#003da5",
      background: "#f5f7fa",
      heading: "#003da5",
      ring: "#003da5",
      surface: "#ffffff",
      cardAccent: "#003da5",
      badge: "#003da5",
    },
    dark: {},
  },
  schedule: {
    dayTypes: [{ id: "regular", label: "Regular Day", weekdays: [1, 2, 3, 4, 5] }],
    bells: { regular: { shared: [{ name: "1st Period", start: "08:00", end: "08:50" }], after: [] } },
  },
  lunchWaves: { enabled: false, options: [], default: "" },
  calendar: { noSchoolDates: [], earlyDismissalDates: [], events: [] },
  features: { events: true, productivity: true },
  contactEmail: "",
};

export type StepProps = {
  data: WizardFormData;
  onChange: (data: WizardFormData) => void;
  schoolId?: string;
};

// Error boundary — preserved behavior, only the fallback styling changed.
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
        <div
          className="border-l-[3px] border-[color:var(--color-marker)] bg-[color:var(--color-marker)]/5 p-6"
        >
          <p
            className="mb-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-marker)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            step failed to render
          </p>
          <p
            className="break-all text-[15px] italic text-[color:var(--color-ink-soft)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {this.state.error.message}
          </p>
          <p
            className="mt-3 text-[11px] text-[color:var(--color-ink-faded)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            check browser console for full stack trace
          </p>
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
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  const currentErrors = validateStep(currentStep, data);

  useEffect(() => {
    console.log(`[WizardShell] Mounted. Step count: ${steps.length}, Data keys:`, Object.keys(data));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const StepComponent = steps[currentStep];
    console.log(`[WizardShell] Step changed to ${currentStep} ("${STEPS[currentStep]}")`);
    console.log(`[WizardShell] Component:`, StepComponent?.name || StepComponent || "UNDEFINED");
    console.log(`[WizardShell] Form data snapshot:`, JSON.parse(JSON.stringify(data)));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowErrors(false);
    setErrors([]);
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  const StepComponent = steps[currentStep];

  if (!StepComponent) {
    console.error(
      `[WizardShell] No step component at index ${currentStep}. Steps array length: ${steps.length}`
    );
    return (
      <div className="p-8 text-[color:var(--color-marker)]">
        Error: No step component at index {currentStep}
      </div>
    );
  }

  const handleNext = () => {
    if (currentErrors.length > 0) {
      console.log(`[WizardShell] Validation failed at step ${currentStep}:`, currentErrors);
      setErrors(currentErrors);
      setShowErrors(true);
      return;
    }
    console.log(`[WizardShell] Next clicked. ${currentStep} -> ${currentStep + 1}`);
    setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    console.log(`[WizardShell] Back clicked. ${currentStep} -> ${currentStep - 1}`);
    setCurrentStep((s) => s - 1);
  };

  const status: "valid" | "invalid" =
    currentErrors.length === 0 ? "valid" : "invalid";
  const statusText =
    currentErrors.length === 0
      ? `step ${currentStep + 1} ready`
      : `${currentErrors.length} issue${currentErrors.length === 1 ? "" : "s"} to fix`;

  return (
    <div className="theme-zine flex min-h-screen flex-col bg-[color:var(--paper)] text-[color:var(--color-ink)]">
      <WizardTopBar />
      <ProgressStrip
        current={currentStep}
        total={totalSteps}
        label={STEPS[currentStep].toLowerCase()}
      />

      {/* Single-pane layout. Each step's body handles its own max-width + decoration. */}
      <main className="flex-1 px-6 py-10 sm:px-8 md:px-10 lg:px-14">
        <div className="mx-auto max-w-[1120px]">
          <StepErrorBoundary stepIndex={currentStep} key={currentStep}>
            <StepComponent key={currentStep} data={data} onChange={setData} schoolId={schoolId} />
          </StepErrorBoundary>

          {showErrors && errors.length > 0 && (
            <div
              className="mt-10 border-l-[3px] border-[color:var(--color-marker)] bg-[color:var(--color-marker)]/5 px-5 py-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <p
                className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-marker)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                fix the following
              </p>
              <ul className="space-y-1.5">
                {errors.map((err, i) => (
                  <li
                    key={i}
                    className="text-[15px] italic text-[color:var(--color-ink-soft)]"
                  >
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

      <StatusBar
        status={status}
        statusText={statusText}
        onBack={handleBack}
        onNext={isLast ? undefined : handleNext}
        isFirst={isFirst}
      />
    </div>
  );
}
