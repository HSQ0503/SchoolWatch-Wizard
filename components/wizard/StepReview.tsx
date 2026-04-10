"use client";

import { useState } from "react";
import type { WizardFormData } from "@/lib/types";
import DeployProgress, { type DeployState } from "@/components/DeployProgress";

type StepProps = { data: WizardFormData; onChange: (data: WizardFormData) => void; schoolId?: string };

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{children}</p>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-medium text-white text-right">{value || "—"}</span>
    </div>
  );
}

export default function StepReview({ data, schoolId }: StepProps) {
  const isEditMode = !!schoolId;
  const [deployState, setDeployState] = useState<DeployState>("idle");
  const [deployUrl, setDeployUrl] = useState<string | undefined>();
  const [deployError, setDeployError] = useState<string | undefined>();

  const canDeploy = data.school.name.trim() !== "" && data.contactEmail.trim() !== "";
  const isDeploying =
    deployState !== "idle" && deployState !== "done" && deployState !== "error";

  async function handleDeploy() {
    if (!canDeploy || isDeploying) return;

    setDeployError(undefined);
    setDeployUrl(undefined);

    try {
      setDeployState(isEditMode ? "pushing-config" : "creating-repo");
      await new Promise((r) => setTimeout(r, 800));
      if (!isEditMode) {
        setDeployState("pushing-config");
        await new Promise((r) => setTimeout(r, 600));
      }

      const endpoint = isEditMode ? "/api/redeploy" : "/api/deploy";
      const body = isEditMode ? { schoolId, data } : data;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Request failed (${res.status})`);
      }

      const json = await res.json();
      setDeployState("deploying");
      await new Promise((r) => setTimeout(r, 1000));
      setDeployState("done");
      setDeployUrl(isEditMode ? json.deployedUrl : json.deployedUrl);
    } catch (err) {
      setDeployState("error");
      setDeployError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  const { school, schedule, calendar, features, contactEmail } = data;
  const cityState = [school.city, school.stateCode].filter(Boolean).join(", ");
  const dayTypeCount = schedule.dayTypes.length;
  const lunchWaveCount = data.lunchWaves.options.length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">{isEditMode ? "Review & Save" : "Review & Deploy"}</h2>
        <p className="mt-1 text-sm text-gray-400">
          {isEditMode ? "Double-check your changes, then save to redeploy." : "Double-check your configuration, then deploy."}
        </p>
      </div>

      {/* Summary card */}
      <div className="rounded-xl border border-white/10 divide-y divide-white/10">
        <div className="px-5 py-4 space-y-1">
          <SectionLabel>School</SectionLabel>
          <Row label="Name" value={school.name} />
          {cityState && <Row label="Location" value={cityState} />}
        </div>

        <div className="px-5 py-4 space-y-1">
          <SectionLabel>App</SectionLabel>
          <Row label="App name" value={school.appName} />
        </div>

        <div className="px-5 py-4 space-y-1">
          <SectionLabel>Schedule</SectionLabel>
          <Row label="Day types" value={dayTypeCount} />
          <Row label="Lunch waves" value={lunchWaveCount} />
        </div>

        <div className="px-5 py-4 space-y-1">
          <SectionLabel>Calendar</SectionLabel>
          <Row label="No-school days" value={calendar.noSchoolDates.length} />
          <Row label="Events" value={calendar.events.length} />
        </div>

        <div className="px-5 py-4 space-y-1">
          <SectionLabel>Features</SectionLabel>
          <Row label="Events & Calendar" value={features.events ? "Enabled" : "Disabled"} />
          <Row label="Productivity Tools" value={features.productivity ? "Enabled" : "Disabled"} />
        </div>

        <div className="px-5 py-4 space-y-1">
          <SectionLabel>Contact</SectionLabel>
          <Row label="Email" value={contactEmail} />
        </div>
      </div>

      {/* Deploy button */}
      <button
        onClick={handleDeploy}
        disabled={!canDeploy || isDeploying}
        className="w-full cursor-pointer rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-black transition-colors duration-150 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isDeploying ? (isEditMode ? "Saving..." : "Deploying...") : (isEditMode ? "Save Changes" : "Deploy Your Dashboard")}
      </button>

      {!canDeploy && (
        <p className="text-center text-xs text-gray-500">
          School name and contact email are required to deploy.
        </p>
      )}

      <DeployProgress state={deployState} url={deployUrl} error={deployError} />
    </div>
  );
}
