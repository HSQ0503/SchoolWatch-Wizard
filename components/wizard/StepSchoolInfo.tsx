"use client";

import { useCallback, useEffect, useRef } from "react";
import type { WizardFormData } from "@/lib/types";

type StepProps = { data: WizardFormData; onChange: (data: WizardFormData) => void };

const inputClass =
  "w-full rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] px-3 py-2 text-[13px] text-[color:var(--color-foreground)] placeholder-[color:var(--color-text-faded)] transition-colors focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-accent)]";

const labelClass =
  "block text-xs text-[color:var(--color-text-faded)] mb-1.5";

const fontMono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

export default function StepSchoolInfo({ data, onChange }: StepProps) {
  const school = data.school;
  const nameRef = useRef<HTMLInputElement>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-focus school name on mount
  useEffect(() => { nameRef.current?.focus(); }, []);

  function updateSchool(patch: Partial<WizardFormData["school"]>) {
    onChange({ ...data, school: { ...school, ...patch } });
  }

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo must be under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange({ ...data, logo: reader.result as string });
    };
    reader.readAsDataURL(file);
  }, [data, onChange]);

  function removeLogo() {
    onChange({ ...data, logo: undefined });
    if (fileRef.current) fileRef.current.value = "";
  }

  // Auto-derive fields from school name to reduce typing
  function handleNameChange(name: string) {
    const patch: Partial<WizardFormData["school"]> = { name };

    // Auto-fill shortName if untouched or matches previous derivation
    const prevDerived = school.name.split(" ").slice(0, 2).join(" ");
    if (!school.shortName || school.shortName === prevDerived) {
      patch.shortName = name.split(" ").slice(0, 2).join(" ");
    }

    // Auto-fill acronym if untouched or matches previous derivation
    const prevAcronym = school.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 4);
    if (!school.acronym || school.acronym === prevAcronym) {
      patch.acronym = name.split(" ").filter(w => w.length > 0).map(w => w[0]).join("").toUpperCase().slice(0, 4);
    }

    // Auto-fill appName
    const prevApp = school.name.split(" ")[0] + "Watch";
    if (!school.appName || school.appName === prevApp) {
      const firstWord = name.split(" ")[0] || "";
      patch.appName = firstWord ? firstWord + "Watch" : "";
    }

    updateSchool(patch);
  }

  return (
    <div className="space-y-8" style={fontMono}>
      <div className="flex items-baseline gap-3.5 border-b border-dashed border-[color:var(--color-line-strong)] pb-4">
        <h2 className="text-[22px] font-bold text-[color:var(--color-foreground)]">
          <span className="text-[color:var(--color-text-faded)] font-normal">{"// "}</span>
          school_info
        </h2>
        <span className="text-[12px] text-[color:var(--color-text-faded)]">
          — who are you building this for?
        </span>
      </div>

      {/* Identity */}
      <div className="divide-y divide-[color:var(--color-line)]">
        <div className="grid grid-cols-[180px_1fr] items-start gap-4 py-2.5">
          <div className={labelClass}>name <span className="text-[color:var(--color-accent)]">*</span></div>
          <div>
            <input
              ref={nameRef}
              className={inputClass}
              type="text"
              placeholder="Windermere Preparatory School"
              value={school.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
            <p className="mt-1.5 text-[11px] text-[color:var(--color-text-faded)]">
              Full legal name. Auto-fills short_name, acronym, and app_name.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-2.5">
          <div className={labelClass}>short_name</div>
          <input
            className={inputClass}
            type="text"
            placeholder="Windermere Prep"
            value={school.shortName}
            onChange={(e) => updateSchool({ shortName: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-2.5">
          <div className={labelClass}>acronym</div>
          <input
            className={inputClass}
            type="text"
            placeholder="WPS"
            maxLength={4}
            value={school.acronym}
            onChange={(e) => updateSchool({ acronym: e.target.value.toUpperCase() })}
          />
        </div>

        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-2.5">
          <div className={labelClass}>mascot <span className="text-[color:var(--color-accent)]">*</span></div>
          <input
            className={inputClass}
            type="text"
            placeholder="Lakers"
            value={school.mascot}
            onChange={(e) => updateSchool({ mascot: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-2.5">
          <div className={labelClass}>app_name</div>
          <input
            className={inputClass}
            type="text"
            placeholder="LakerWatch"
            value={school.appName}
            onChange={(e) => updateSchool({ appName: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-2.5">
          <div className={labelClass}>city <span className="text-[color:var(--color-accent)]">*</span></div>
          <input
            className={inputClass}
            type="text"
            placeholder="Orlando"
            value={school.city}
            onChange={(e) => updateSchool({ city: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-2.5">
          <div className={labelClass}>state <span className="text-[color:var(--color-accent)]">*</span></div>
          <input
            className={inputClass}
            type="text"
            placeholder="Florida"
            value={school.state}
            onChange={(e) => updateSchool({ state: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-2.5">
          <div className={labelClass}>state_code <span className="text-[color:var(--color-accent)]">*</span></div>
          <input
            className={inputClass}
            type="text"
            placeholder="FL"
            maxLength={2}
            value={school.stateCode}
            onChange={(e) => updateSchool({ stateCode: e.target.value.toUpperCase() })}
          />
        </div>

        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-2.5">
          <div className={labelClass}>academic_year <span className="text-[color:var(--color-accent)]">*</span></div>
          <input
            className={inputClass}
            type="text"
            placeholder="2025-2026"
            value={school.academicYear}
            onChange={(e) => updateSchool({ academicYear: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-[180px_1fr] items-start gap-4 py-2.5">
          <div className={labelClass}>contact_email <span className="text-[color:var(--color-accent)]">*</span></div>
          <div>
            <input
              className={inputClass}
              type="email"
              placeholder="admin@school.edu"
              value={data.contactEmail}
              onChange={(e) => onChange({ ...data, contactEmail: e.target.value })}
            />
            <p className="mt-1.5 text-[11px] text-[color:var(--color-text-faded)]">
              Used for the magic link we send after deploy. Not public.
            </p>
          </div>
        </div>

        {/* Logo — simplified, still binds to data.logo */}
        <div className="grid grid-cols-[180px_1fr] items-start gap-4 py-2.5">
          <div className={labelClass}>logo</div>
          <div className="flex items-center gap-4">
            {data.logo ? (
              <div className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.logo}
                  alt="School logo preview"
                  className="h-14 w-14 rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] object-contain"
                />
                <button
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-[color:var(--color-accent)] text-[10px] text-black hover:brightness-110"
                  aria-label="Remove logo"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[3px] border border-dashed border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] text-[color:var(--color-text-faded)]">
                ⟨img⟩
              </div>
            )}
            <div className="flex-1">
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="inline-block cursor-pointer rounded-[3px] border border-[color:var(--color-line-strong)] px-3 py-1.5 text-xs text-[color:var(--color-text-dim)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-foreground)]"
              >
                {data.logo ? "change logo" : "upload logo"}
              </label>
              <p className="mt-1.5 text-[11px] text-[color:var(--color-text-faded)]">
                png, jpg, svg, or webp · max 2MB
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
