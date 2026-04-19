"use client";

import WizardShell from "@/components/WizardShell";
import StepSchoolInfo from "@/components/wizard/StepSchoolInfo";
import StepColors from "@/components/wizard/StepColors";
import StepSchedule from "@/components/wizard/StepSchedule";
import StepCalendar from "@/components/wizard/StepCalendar";
import StepFeatures from "@/components/wizard/StepFeatures";
import StepReview from "@/components/wizard/StepReview";

const steps = [
  StepSchoolInfo,
  StepColors,
  StepSchedule,
  StepCalendar,
  StepFeatures,
  StepReview,
];

export default function SetupPage() {
  return <WizardShell steps={steps} />;
}
