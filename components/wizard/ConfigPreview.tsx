"use client";

import type { WizardFormData } from "@/lib/types";
import { generateConfigTs } from "@/lib/config-generator";

// Printed-report card: renders the generated school.config.ts as plain mono ink on paper.
// No syntax colorization — the density alone reads as a printed listing.
// The `activeStep` prop is retained for API compatibility but ignored; this component
// now only appears on the Review step (see StepReview), where highlighting per-step
// is not meaningful.
type Props = {
  data: WizardFormData;
  activeStep?: number;
};

export default function ConfigPreview({ data }: Props) {
  const source = generateConfigTs(data);

  return (
    <div className="relative mt-6 bg-white border border-[color:var(--color-ink)] p-5 shadow-[4px_4px_0_var(--highlight)]">
      <span
        aria-hidden="true"
        className="absolute right-4 top-2 leading-none"
        style={{
          fontFamily: "var(--font-caveat)",
          fontSize: 16,
          color: "var(--ink-soft)",
          transform: "rotate(2deg)",
        }}
      >
        school.config.ts
      </span>
      <pre
        className="overflow-x-auto whitespace-pre text-[12px] leading-[1.65] text-[color:var(--color-ink)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {source}
      </pre>
    </div>
  );
}
