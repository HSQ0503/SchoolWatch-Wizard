"use client";

import { useState } from "react";
import type { WizardFormData } from "@/lib/types";
import DeployLog, { type DeployState } from "@/components/wizard/DeployLog";

type StepProps = { data: WizardFormData; onChange: (data: WizardFormData) => void; schoolId?: string };

const fontMono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

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
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error ?? `Request failed (${res.status})`);
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
    <div className="space-y-8" style={fontMono}>
      <div className="flex items-baseline gap-3.5 border-b border-dashed border-[color:var(--color-line-strong)] pb-4">
        <h2 className="text-[22px] font-bold text-[color:var(--color-foreground)]">
          <span className="text-[color:var(--color-text-faded)] font-normal">{"// "}</span>
          {isEditMode ? "review_and_save" : "review_and_deploy"}
        </h2>
        <span className="text-[12px] text-[color:var(--color-text-faded)]">
          — sanity check, then ship.
        </span>
      </div>

      <div className="grid gap-4">
        <ReviewBlock title="school">
          <Row k="name" v={school.name} />
          <Row k="mascot" v={school.mascot} />
          <Row k="app_name" v={school.appName} />
          <Row k="year" v={school.academicYear} />
          {cityState && <Row k="location" v={cityState} />}
        </ReviewBlock>

        <ReviewBlock title="colors">
          <Row k="primary" v={data.colors.primary} swatch={data.colors.primary} />
          <Row k="accent" v={data.colors.accent} swatch={data.colors.accent} />
        </ReviewBlock>

        <ReviewBlock title="schedule">
          <Row k="day_types" v={`${dayTypeCount}`} />
          <Row k="lunch_waves" v={`${lunchWaveCount}`} />
        </ReviewBlock>

        <ReviewBlock title="calendar">
          <Row k="no_school" v={`${calendar.noSchoolDates.length}`} />
          <Row k="events" v={`${calendar.events.length}`} />
        </ReviewBlock>

        <ReviewBlock title="features">
          <Row k="events_calendar" v={features.events ? "enabled" : "disabled"} />
          <Row k="productivity" v={features.productivity ? "enabled" : "disabled"} />
        </ReviewBlock>

        <ReviewBlock title="contact">
          <Row k="email" v={contactEmail} />
        </ReviewBlock>
      </div>

      <button
        onClick={handleDeploy}
        disabled={!canDeploy || isDeploying}
        className="w-full cursor-pointer rounded-[3px] border border-[color:var(--color-accent)] bg-[color:var(--color-accent)] px-6 py-4 text-center text-sm font-bold uppercase tracking-[0.08em] text-black transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        style={fontMono}
      >
        {isDeploying
          ? isEditMode
            ? "./redeploy — running..."
            : "./deploy — running..."
          : isEditMode
          ? "./redeploy →"
          : "./deploy →"}
      </button>

      {!canDeploy && (
        <p className="text-center text-[11px] text-[color:var(--color-text-faded)]">
          school name and contact email are required to deploy.
        </p>
      )}

      <DeployLog
        state={deployState}
        url={deployUrl}
        error={deployError}
        isEditMode={isEditMode}
      />
    </div>
  );
}

function ReviewBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] p-4">
      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-text-faded)]">
        <span>{title}</span>
      </div>
      <dl className="grid grid-cols-[130px_1fr] gap-x-3 gap-y-1.5 text-[12px]">
        {children}
      </dl>
    </div>
  );
}

function Row({
  k,
  v,
  swatch,
}: {
  k: string;
  v: string | number;
  swatch?: string;
}) {
  return (
    <>
      <dt className="text-[color:var(--color-text-faded)]" style={{ fontFamily: "var(--font-mono)" }}>
        {k}
      </dt>
      <dd className="flex items-center gap-2 text-[color:var(--color-foreground)]" style={{ fontFamily: "var(--font-mono)" }}>
        {swatch && (
          <span
            className="inline-block h-2.5 w-2.5 border border-white/10"
            style={{ background: swatch }}
          />
        )}
        {v || "—"}
      </dd>
    </>
  );
}
