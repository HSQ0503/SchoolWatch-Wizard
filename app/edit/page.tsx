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
import { defaultLightColors } from "@/lib/colors";

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

  const [status, setStatus] = useState<Status>("verifying");
  const [school, setSchool] = useState<{ id: string; configData: WizardFormData } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        let email: string | null = null;

        // Path A: verify magic link token (sets session cookie)
        if (token) {
          const verifyRes = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });

          if (verifyRes.ok) {
            const data = await verifyRes.json();
            email = data.email;
          }
        }

        // Path B: fall back to existing session cookie
        if (!email) {
          const sessionRes = await fetch("/api/auth/session");
          if (sessionRes.ok) {
            const data = await sessionRes.json();
            email = data.email;
          }
        }

        if (!email) {
          setError(token ? "Invalid or expired link. Please request a new one." : "Please log in to edit your dashboard.");
          setStatus("error");
          return;
        }

        setStatus("loading");

        const schoolRes = await fetch(
          `/api/schools/by-email?email=${encodeURIComponent(email)}`
        );

        if (!schoolRes.ok) {
          setError("Could not load school data");
          setStatus("error");
          return;
        }

        const schoolData = await schoolRes.json();
        // Migrate old color format (flat { primary, accent }) to new zone format
        const cfg = schoolData.configData;
        if (cfg?.colors && !cfg.colors.light) {
          const primary = cfg.colors.primary || "#003da5";
          const accent = cfg.colors.accent || "#003da5";
          cfg.colors = { primary, accent, light: defaultLightColors(primary, accent), dark: {} };
        }
        setSchool(schoolData);
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
      initialData={school!.configData as WizardFormData}
      schoolId={school!.id}
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
