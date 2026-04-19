"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { WizardFormData } from "@/lib/types";
import { motion, useReducedMotion, type Variants } from "motion/react";

const headerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const headerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

type StepProps = { data: WizardFormData; onChange: (data: WizardFormData) => void };

// Zine step-body primitives (shared visual language used by all 7 steps).
const kickerCls =
  "mb-3 text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink-faded)]";
const headlineCls =
  "font-[900] leading-[0.95] tracking-[-0.02em] text-[color:var(--color-ink)]";
const subcopyCls =
  "mt-4 text-[15px] leading-[1.55] text-[color:var(--color-ink-soft)]";
const labelCls =
  "mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-faded)]";
const underlineInputCls =
  "w-full border-0 border-b-2 border-[color:var(--color-ink)] bg-transparent px-0 py-2 text-[18px] text-[color:var(--color-ink)] placeholder-[color:var(--color-ink-faded)]/60 focus:border-[color:var(--color-marker)] focus:outline-none";

const kickerFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };
const headlineFont: React.CSSProperties = {
  fontFamily: "var(--font-archivo)",
  fontSize: "clamp(32px, 4.2vw, 52px)",
};
const italicAccent: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontStyle: "italic",
  fontWeight: 400,
  letterSpacing: "-0.01em",
};
const subcopyFont: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  maxWidth: "52ch",
};
const inputFont: React.CSSProperties = { fontFamily: "var(--font-display)" };
const labelFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

const ACCEPTED_LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];

export default function StepSchoolInfo({ data, onChange }: StepProps) {
  const reduce = useReducedMotion();
  const school = data.school;
  const nameRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => { nameRef.current?.focus(); }, []);

  function updateSchool(patch: Partial<WizardFormData["school"]>) {
    onChange({ ...data, school: { ...school, ...patch } });
  }

  const processLogoFile = useCallback((file: File) => {
    if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
      alert("Logo must be a PNG, JPG, SVG, or WebP");
      return;
    }
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

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processLogoFile(file);
  }, [processLogoFile]);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    // Only clear when leaving the drop zone itself, not child elements
    if (e.currentTarget === e.target) setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processLogoFile(file);
  }

  function removeLogo() {
    onChange({ ...data, logo: undefined });
    if (fileRef.current) fileRef.current.value = "";
  }

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
    <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div>
        <motion.div
          initial={reduce ? false : "hidden"}
          animate="visible"
          variants={headerContainer}
        >
          <motion.p variants={headerItem} className={kickerCls} style={kickerFont}>
            step 01 / school info
          </motion.p>
          <motion.h1 variants={headerItem} className={headlineCls} style={headlineFont}>
            Tell us about the <span style={italicAccent}>school.</span>
          </motion.h1>
          <motion.p variants={headerItem} className={subcopyCls} style={subcopyFont}>
            Name, mascot, location. This shows up in the tab title, headings, and the URL — you can edit it later.
          </motion.p>
        </motion.div>

        <div className="mt-10 space-y-6">
          <div>
            <label className={labelCls} style={labelFont}>School name</label>
            <input
              ref={nameRef}
              className={underlineInputCls}
              style={inputFont}
              placeholder="Windermere Preparatory School"
              value={school.name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelCls} style={labelFont}>Short name</label>
              <input
                className={underlineInputCls}
                style={inputFont}
                placeholder="Windermere Prep"
                value={school.shortName}
                onChange={(e) => updateSchool({ shortName: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls} style={labelFont}>Acronym</label>
              <input
                className={underlineInputCls}
                style={inputFont}
                placeholder="WPS"
                maxLength={4}
                value={school.acronym}
                onChange={(e) => updateSchool({ acronym: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className={labelCls} style={labelFont}>Mascot</label>
              <input
                className={underlineInputCls}
                style={inputFont}
                placeholder="Lakers"
                value={school.mascot}
                onChange={(e) => updateSchool({ mascot: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls} style={labelFont}>App name (optional)</label>
              <input
                className={underlineInputCls}
                style={inputFont}
                placeholder="LakerWatch"
                value={school.appName}
                onChange={(e) => updateSchool({ appName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-[2fr_1fr_1fr]">
            <div>
              <label className={labelCls} style={labelFont}>City</label>
              <input
                className={underlineInputCls}
                style={inputFont}
                placeholder="Windermere"
                value={school.city}
                onChange={(e) => updateSchool({ city: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls} style={labelFont}>State</label>
              <input
                className={underlineInputCls}
                style={inputFont}
                placeholder="Florida"
                value={school.state}
                onChange={(e) => updateSchool({ state: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls} style={labelFont}>State code</label>
              <input
                className={underlineInputCls}
                style={inputFont}
                placeholder="FL"
                maxLength={2}
                value={school.stateCode}
                onChange={(e) => updateSchool({ stateCode: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <div>
            <label className={labelCls} style={labelFont}>Academic year</label>
            <input
              className={underlineInputCls}
              style={inputFont}
              placeholder="2025-2026"
              value={school.academicYear}
              onChange={(e) => updateSchool({ academicYear: e.target.value })}
            />
          </div>

          <div>
            <label className={labelCls} style={labelFont}>Contact email</label>
            <input
              className={underlineInputCls}
              style={inputFont}
              type="email"
              placeholder="admin@school.edu"
              value={data.contactEmail}
              onChange={(e) => onChange({ ...data, contactEmail: e.target.value })}
            />
          </div>

          <div>
            <label className={labelCls} style={labelFont}>School logo (optional, max 2MB)</label>
            <div className="flex items-start gap-6">
              <label
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex h-[120px] w-[180px] cursor-pointer flex-col items-center justify-center border-2 border-dashed text-center transition-colors ${
                  isDragging
                    ? "border-[color:var(--color-marker)] bg-[color:var(--color-marker)]/10"
                    : "border-[color:var(--color-ink)] hover:bg-[color:var(--color-ink)]/5"
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <span
                  className={isDragging ? "text-[color:var(--color-marker)]" : "text-[color:var(--color-ink)]"}
                  style={{ fontFamily: "var(--font-caveat)", fontSize: 22, transform: "rotate(-2deg)" }}
                >
                  {isDragging ? "drop it!" : "drop logo here ↙"}
                </span>
              </label>
              {data.logo && (
                <div className="flex items-center gap-4">
                  <div
                    className="relative bg-white p-2.5 shadow-[4px_4px_0_var(--highlight)]"
                    style={{ transform: "rotate(2deg)" }}
                  >
                    <Image
                      src={data.logo}
                      alt="Logo preview"
                      width={80}
                      height={80}
                      className="h-20 w-20 object-contain"
                      unoptimized
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="text-[12px] uppercase tracking-[0.14em] text-[color:var(--color-ink)] underline underline-offset-4 decoration-[1.5px] transition-colors hover:text-[color:var(--color-marker)] hover:decoration-[color:var(--color-marker)] hover:[text-decoration-style:wavy]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    remove
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Margin note — appears in the right rail on lg+, stacked above the form body on mobile. */}
      <aside
        className="order-first lg:order-last lg:pt-24"
        aria-label="Tip"
      >
        <div
          className="relative pl-5 border-l-[3px] border-[color:var(--color-ink)]"
        >
          <span
            aria-hidden="true"
            className="absolute -left-8 -top-1 leading-none"
            style={{
              fontFamily: "var(--font-caveat)",
              fontWeight: 700,
              fontSize: 28,
              color: "var(--marker)",
              transform: "rotate(-6deg)",
            }}
          >
            1
          </span>
          <p
            className="text-[15px] italic leading-[1.5] text-[color:var(--color-ink-soft)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            No principal approval needed to start. You can deploy first and share — changing the name or colors later is a 10-second edit.
          </p>
        </div>
      </aside>
    </div>
  );
}
