"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import WizardShell from "@/components/WizardShell";
import StepSchoolInfo from "@/components/wizard/StepSchoolInfo";
import StepColors from "@/components/wizard/StepColors";
import StepSchedule from "@/components/wizard/StepSchedule";
import StepLunchWaves from "@/components/wizard/StepLunchWaves";
import StepCalendar from "@/components/wizard/StepCalendar";
import StepFeatures from "@/components/wizard/StepFeatures";
import StepReview from "@/components/wizard/StepReview";
import type { WizardFormData } from "@/lib/types";

type Status = "verifying" | "loading" | "ready" | "error";

function Spinner() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  );
}

const STEPS = [
  (props: Parameters<typeof StepSchoolInfo>[0]) => <StepSchoolInfo {...props} />,
  (props: Parameters<typeof StepColors>[0]) => <StepColors {...props} />,
  (props: Parameters<typeof StepSchedule>[0]) => <StepSchedule {...props} />,
  (props: Parameters<typeof StepLunchWaves>[0]) => <StepLunchWaves {...props} />,
  (props: Parameters<typeof StepCalendar>[0]) => <StepCalendar {...props} />,
  (props: Parameters<typeof StepFeatures>[0]) => <StepFeatures {...props} />,
  (props: Parameters<typeof StepReview>[0]) => <StepReview {...props} />,
];

function EditPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("verifying");
  const [school, setSchool] = useState<{ config_data: WizardFormData } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("No login token provided");
      setStatus("error");
      return;
    }

    async function load() {
      try {
        const verifyRes = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!verifyRes.ok) {
          setError("Invalid or expired link");
          setStatus("error");
          return;
        }

        const { email } = await verifyRes.json();

        setStatus("loading");

        const schoolRes = await fetch(
          `/api/schools/by-email?email=${encodeURIComponent(email)}`
        );

        if (!schoolRes.ok) {
          setError("Could not load school data");
          setStatus("error");
          return;
        }

        const data = await schoolRes.json();
        setSchool(data);
        setStatus("ready");
      } catch {
        setError("Something went wrong. Please try again.");
        setStatus("error");
      }
    }

    load();
  }, [token]);

  if (status === "verifying" || status === "loading") return <Spinner />;
  if (status === "error") return <ErrorMessage message={error} />;

  return (
    <WizardShell
      steps={STEPS}
      initialData={school!.config_data as WizardFormData}
    />
  );
}

export default function EditPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <EditPageContent />
    </Suspense>
  );
}
