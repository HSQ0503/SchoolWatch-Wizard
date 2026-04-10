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
  StepSchoolInfo,
  StepColors,
  StepSchedule,
  StepLunchWaves,
  StepCalendar,
  StepFeatures,
  StepReview,
];

function EditPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>(() => token ? "verifying" : "error");
  const [school, setSchool] = useState<{ config_data: WizardFormData } | null>(null);
  const [error, setError] = useState(() => token ? "" : "No login token provided");

  useEffect(() => {
    if (!token) return;

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
