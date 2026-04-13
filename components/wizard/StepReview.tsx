"use client";

import { useState } from "react";
import type { WizardFormData } from "@/lib/types";
import DeployLog, { type DeployState } from "@/components/wizard/DeployLog";
import ConfigPreview from "@/components/wizard/ConfigPreview";
import { defaultLightColors } from "@/lib/colors";
import { motion, useReducedMotion, type Variants } from "motion/react";

const headerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const headerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

type StepProps = { data: WizardFormData; onChange: (data: WizardFormData) => void; schoolId?: string };

// ── zine step-body constants (cross-step parity) ────────────────────────────
const kickerCls =
  "text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink-faded)]";
const headlineCls =
  "mt-2 text-[2.25rem] leading-[1.1] font-bold text-[color:var(--color-ink)]";
const subcopyCls = "mt-3 text-[15px] leading-relaxed text-[color:var(--color-ink-soft)]";
const labelCls =
  "text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-ink-faded)]";

const kickerFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };
const headlineFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
const italicAccent: React.CSSProperties = {
  fontStyle: "italic",
  fontFamily: "var(--font-display)",
};
const subcopyFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
const labelFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

// suppress unused warnings for cross-step parity
void kickerFont;
void italicAccent;
void subcopyFont;

export default function StepReview({ data, schoolId }: StepProps) {
  const reduce = useReducedMotion();
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

  // Count zones whose value differs from the auto-derived defaults
  const derivedDefaults = defaultLightColors(
    data.colors.primary || "#000000",
    data.colors.accent || "#000000"
  );
  const overriddenCount = (
    Object.keys(derivedDefaults) as (keyof typeof derivedDefaults)[]
  ).filter((zone) => data.colors.light[zone] !== derivedDefaults[zone]).length;

  const { school, schedule, calendar, features, contactEmail } = data;
  const cityState = [school.city, school.stateCode].filter(Boolean).join(", ");

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={reduce ? false : "hidden"}
        animate="visible"
        variants={headerContainer}
      >
        <motion.p variants={headerItem} className={kickerCls} style={kickerFont}>
          step 06 / review &amp; deploy
        </motion.p>
        <motion.h1 variants={headerItem} className={headlineCls} style={headlineFont}>
          <span style={italicAccent}>One more</span> look.
        </motion.h1>
        <motion.p variants={headerItem} className={subcopyCls} style={subcopyFont}>
          If everything below looks right, hit {isEditMode ? "Redeploy" : "Deploy"}. We&rsquo;ll
          create the repo, wire up Vercel, and email you a magic link in about a minute.
        </motion.p>
      </motion.div>

      {/* ── School ─────────────────────────────────────────────────────────── */}
      <section className="mt-10">
        <p className={labelCls} style={labelFont}>
          School
        </p>
        <dl
          className="mt-2 grid grid-cols-1 gap-x-8 gap-y-1 sm:grid-cols-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          <div className="flex justify-between gap-4">
            <dt className="text-[color:var(--color-ink-faded)]">Name</dt>
            <dd className="text-right italic text-[color:var(--color-ink)]">
              {school.name || <em className="text-[color:var(--color-marker)]">missing</em>}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[color:var(--color-ink-faded)]">Short name</dt>
            <dd className="text-right italic text-[color:var(--color-ink)]">
              {school.shortName || <em className="text-[color:var(--color-marker)]">—</em>}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[color:var(--color-ink-faded)]">Acronym</dt>
            <dd className="text-right italic text-[color:var(--color-ink)]">
              {school.acronym || <em className="text-[color:var(--color-marker)]">—</em>}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[color:var(--color-ink-faded)]">Mascot</dt>
            <dd className="text-right italic text-[color:var(--color-ink)]">
              {school.mascot || <em className="text-[color:var(--color-marker)]">—</em>}
            </dd>
          </div>
          {cityState && (
            <div className="flex justify-between gap-4">
              <dt className="text-[color:var(--color-ink-faded)]">City / State</dt>
              <dd className="text-right italic text-[color:var(--color-ink)]">{cityState}</dd>
            </div>
          )}
          {school.academicYear && (
            <div className="flex justify-between gap-4">
              <dt className="text-[color:var(--color-ink-faded)]">Academic year</dt>
              <dd className="text-right italic text-[color:var(--color-ink)]">
                {school.academicYear}
              </dd>
            </div>
          )}
          <div className="flex justify-between gap-4 sm:col-span-2">
            <dt className="text-[color:var(--color-ink-faded)]">Contact email</dt>
            <dd className="text-right italic text-[color:var(--color-ink)]">
              {contactEmail || (
                <em className="text-[color:var(--color-marker)]">missing</em>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <hr className="my-8 border-0 border-t border-dashed border-[color:var(--color-hairline)]" />

      {/* ── Colors ─────────────────────────────────────────────────────────── */}
      <section>
        <p className={labelCls} style={labelFont}>
          Colors
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className="block h-8 w-8 border border-[color:var(--color-ink)]"
              style={{ background: data.colors.primary }}
            />
            <span
              className="text-[13px] text-[color:var(--color-ink)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {data.colors.primary.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="block h-8 w-8 border border-[color:var(--color-ink)]"
              style={{ background: data.colors.accent }}
            />
            <span
              className="text-[13px] text-[color:var(--color-ink)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {data.colors.accent.toUpperCase()}
            </span>
          </div>
          {overriddenCount > 0 && (
            <span
              className="text-[13px] italic text-[color:var(--color-ink-soft)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              + {overriddenCount} zone{overriddenCount === 1 ? "" : "s"} overridden
            </span>
          )}
        </div>
      </section>

      <hr className="my-8 border-0 border-t border-dashed border-[color:var(--color-hairline)]" />

      {/* ── Schedule ───────────────────────────────────────────────────────── */}
      <section>
        <p className={labelCls} style={labelFont}>
          Schedule
        </p>
        <ul
          className="mt-3 space-y-1 text-[15px] italic text-[color:var(--color-ink-soft)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {schedule.dayTypes.map((dt) => {
            const bells = schedule.bells[dt.id];
            const sharedCount = bells?.shared.length ?? 0;
            const afterCount = bells?.after?.length ?? 0;
            return (
              <li key={dt.id}>
                <span className="text-[color:var(--color-ink)]">{dt.label}</span> —{" "}
                {sharedCount} period{sharedCount === 1 ? "" : "s"}
                {afterCount > 0 &&
                  `, ${afterCount} after-school event${afterCount === 1 ? "" : "s"}`}
              </li>
            );
          })}
        </ul>
      </section>

      <hr className="my-8 border-0 border-t border-dashed border-[color:var(--color-hairline)]" />

      {/* ── Lunch waves ────────────────────────────────────────────────────── */}
      <section>
        <p className={labelCls} style={labelFont}>
          Lunch waves
        </p>
        {!data.lunchWaves.enabled ? (
          <p
            className="mt-2 text-[15px] italic text-[color:var(--color-ink-soft)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Disabled — lunch is one shared period for everyone.
          </p>
        ) : (
          <p
            className="mt-2 text-[15px] italic text-[color:var(--color-ink-soft)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {data.lunchWaves.options.map((w) => w.label).join(", ")}
            {data.lunchWaves.default && (
              <span className="text-[color:var(--color-ink-faded)]">
                {" "}
                · default:{" "}
                {data.lunchWaves.options.find((w) => w.id === data.lunchWaves.default)
                  ?.label ?? "?"}
              </span>
            )}
          </p>
        )}
      </section>

      <hr className="my-8 border-0 border-t border-dashed border-[color:var(--color-hairline)]" />

      {/* ── Calendar ───────────────────────────────────────────────────────── */}
      <section>
        <p className={labelCls} style={labelFont}>
          Calendar
        </p>
        <p
          className="mt-2 text-[15px] italic text-[color:var(--color-ink-soft)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {calendar.noSchoolDates.length} no-school day
          {calendar.noSchoolDates.length === 1 ? "" : "s"},{" "}
          {calendar.earlyDismissalDates.length} early dismissal
          {calendar.earlyDismissalDates.length === 1 ? "" : "s"},{" "}
          {calendar.events.length} event{calendar.events.length === 1 ? "" : "s"}
        </p>
      </section>

      <hr className="my-8 border-0 border-t border-dashed border-[color:var(--color-hairline)]" />

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section>
        <p className={labelCls} style={labelFont}>
          Features
        </p>
        <p
          className="mt-2 text-[15px] italic text-[color:var(--color-ink-soft)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {Object.entries(features)
            .filter(([, enabled]) => enabled)
            .map(([key]) => key)
            .join(", ") || "None enabled"}
        </p>
      </section>

      {/* ── Generated config disclosure ────────────────────────────────────── */}
      <details className="mt-10 group">
        <summary
          className="inline-flex cursor-pointer list-none items-center gap-2 border border-[color:var(--color-ink)] px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink)] transition-colors hover:bg-[color:var(--color-ink)] hover:text-[color:var(--color-paper)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          view generated config
          <span className="transition-transform group-open:rotate-180">↓</span>
        </summary>
        <ConfigPreview data={data} />
      </details>

      {/* ── Deploy CTA ─────────────────────────────────────────────────────── */}
      <div className="mt-10">
        <button
          type="button"
          onClick={handleDeploy}
          disabled={!canDeploy || isDeploying}
          className="group inline-flex w-full items-center justify-center gap-2.5 border-2 border-[color:var(--color-ink)] bg-[color:var(--color-ink)] px-7 py-4 text-[color:var(--color-paper)] shadow-[6px_6px_0_var(--highlight)] transition-[transform,box-shadow] duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_var(--highlight)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-[0_0_0_var(--highlight)] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
          style={{ fontFamily: "var(--font-archivo)", fontSize: 16 }}
        >
          {isEditMode ? "Redeploy" : "Deploy"}
          <span className="text-[22px] leading-[0] transition-transform group-hover:translate-x-1">
            →
          </span>
        </button>

        {!canDeploy && (
          <p
            className="mt-3 text-[13px] text-[color:var(--color-ink-faded)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            School name and contact email are required to deploy.
          </p>
        )}
      </div>

      {/* ── Deploy log ─────────────────────────────────────────────────────── */}
      <DeployLog
        state={deployState}
        url={deployUrl}
        error={deployError}
        isEditMode={isEditMode}
      />
    </div>
  );
}
