"use client";

import { useCallback, useEffect, useRef } from "react";
import type { WizardFormData } from "@/lib/types";

type StepProps = { data: WizardFormData; onChange: (data: WizardFormData) => void };

const inputClass =
  "w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors duration-150";

const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

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
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white">School Information</h2>
        <p className="mt-1 text-sm text-gray-400">
          Basic details about your school. Short name, acronym, and app name auto-fill as you type.
        </p>
      </div>

      {/* Identity */}
      <div className="space-y-4">
        <div>
          <label className={labelClass}>School Name (full)</label>
          <input
            ref={nameRef}
            className={inputClass}
            type="text"
            placeholder="Windermere Preparatory School"
            value={school.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Short Name</label>
            <input
              className={inputClass}
              type="text"
              placeholder="Windermere Prep"
              value={school.shortName}
              onChange={(e) => updateSchool({ shortName: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Acronym</label>
            <input
              className={inputClass}
              type="text"
              placeholder="WPS"
              maxLength={4}
              value={school.acronym}
              onChange={(e) => updateSchool({ acronym: e.target.value.toUpperCase() })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Mascot</label>
            <input
              className={inputClass}
              type="text"
              placeholder="Lakers"
              value={school.mascot}
              onChange={(e) => updateSchool({ mascot: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>App Name</label>
            <input
              className={inputClass}
              type="text"
              placeholder="LakerWatch"
              value={school.appName}
              onChange={(e) => updateSchool({ appName: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Logo</h3>
        <div className="flex items-center gap-5">
          {data.logo ? (
            <div className="relative shrink-0">
              <img
                src={data.logo}
                alt="School logo preview"
                className="h-16 w-16 rounded-lg object-contain border border-white/10 bg-white/5"
              />
              <button
                onClick={removeLogo}
                className="absolute -top-2 -right-2 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white text-xs hover:bg-red-400 transition-colors"
                aria-label="Remove logo"
              >
                x
              </button>
            </div>
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/5">
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
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
              className="inline-block cursor-pointer rounded-lg border border-white/20 px-4 py-2 text-sm text-gray-300 transition-colors duration-150 hover:border-white/40 hover:text-white"
            >
              {data.logo ? "Change logo" : "Upload logo"}
            </label>
            <p className="mt-1.5 text-xs text-gray-500">PNG, JPG, SVG, or WebP. Max 2MB.</p>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>City</label>
            <input
              className={inputClass}
              type="text"
              placeholder="Orlando"
              value={school.city}
              onChange={(e) => updateSchool({ city: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input
              className={inputClass}
              type="text"
              placeholder="Florida"
              value={school.state}
              onChange={(e) => updateSchool({ state: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>State Code</label>
            <input
              className={inputClass}
              type="text"
              placeholder="FL"
              maxLength={2}
              value={school.stateCode}
              onChange={(e) => updateSchool({ stateCode: e.target.value.toUpperCase() })}
            />
          </div>
          <div>
            <label className={labelClass}>Academic Year</label>
            <input
              className={inputClass}
              type="text"
              placeholder="2025-2026"
              value={school.academicYear}
              onChange={(e) => updateSchool({ academicYear: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</h3>
        <div>
          <label className={labelClass}>Contact Email</label>
          <input
            className={inputClass}
            type="email"
            placeholder="admin@school.edu"
            value={data.contactEmail}
            onChange={(e) => onChange({ ...data, contactEmail: e.target.value })}
          />
          <p className="mt-2 text-xs text-gray-500">
            Used for magic link login to edit your dashboard later.
          </p>
        </div>
      </div>
    </div>
  );
}
