"use client";

import { useState, useCallback } from "react";
import { defaultLightColors, resolveDarkColors } from "@/lib/colors";
import type { ZoneColors } from "@/lib/colors";
import type { WizardFormData } from "@/lib/types";
import DashboardPreview from "./DashboardPreview";
import TapedScreenshot from "@/components/landing/TapedScreenshot";
import { motion, useReducedMotion, type Variants } from "motion/react";

const headerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const headerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

type StepProps = {
  data: WizardFormData;
  onChange: (data: WizardFormData) => void;
};

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
const labelFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

// Suppress unused-variable lint for underlineInputCls (kept for consistency with other steps).
void underlineInputCls;
void subcopyFont;

const ZONE_ORDER: (keyof ZoneColors)[] = [
  "navbar",
  "navText",
  "background",
  "heading",
  "ring",
  "surface",
  "cardAccent",
  "badge",
];

export default function StepColors({ data, onChange }: StepProps) {
  const reduce = useReducedMotion();
  const { primary, accent } = data.colors;

  const [overriddenZones, setOverriddenZones] = useState<Set<string>>(
    () => new Set()
  );
  const [activeZone, setActiveZone] = useState<{
    zone: keyof ZoneColors;
    mode: "light" | "dark";
  } | null>(null);
  const [darkMode, setDarkMode] = useState<"hidden" | "preview" | "customize">(
    "hidden"
  );

  // Compute resolved dark colors for preview/customize
  const resolvedDark = resolveDarkColors(data.colors.light, data.colors.dark);

  // Which palette the mockup shows
  const showingDark = darkMode === "preview" || darkMode === "customize";
  const palette: ZoneColors = showingDark ? resolvedDark : data.colors.light;

  // Update primary/accent seeds and cascade to non-overridden zones
  const updateSeeds = useCallback(
    (patch: { primary?: string; accent?: string }) => {
      const newPrimary = patch.primary ?? primary;
      const newAccent = patch.accent ?? accent;
      const defaults = defaultLightColors(
        newPrimary || "#000000",
        newAccent || "#000000"
      );

      // Build light colors: keep overridden zones, refresh the rest
      const newLight = { ...data.colors.light };
      for (const key of Object.keys(defaults) as (keyof ZoneColors)[]) {
        if (!overriddenZones.has(key)) {
          newLight[key] = defaults[key];
        }
      }

      onChange({
        ...data,
        colors: {
          ...data.colors,
          ...patch,
          light: newLight,
          dark: data.colors.dark,
        },
      });
    },
    [primary, accent, data, overriddenZones, onChange]
  );

  // Update a single zone color
  const updateZoneColor = useCallback(
    (zone: keyof ZoneColors, color: string, mode: "light" | "dark") => {
      if (mode === "light") {
        const newLight = { ...data.colors.light, [zone]: color };
        setOverriddenZones((prev) => new Set(prev).add(zone));
        onChange({
          ...data,
          colors: { ...data.colors, light: newLight },
        });
      } else {
        const newDark = { ...data.colors.dark, [zone]: color };
        onChange({
          ...data,
          colors: { ...data.colors, dark: newDark },
        });
      }
    },
    [data, onChange]
  );

  // Reset a zone to default
  const resetZone = useCallback(
    (zone: keyof ZoneColors, mode: "light" | "dark") => {
      if (mode === "light") {
        const defaults = defaultLightColors(
          primary || "#000000",
          accent || "#000000"
        );
        const newLight = { ...data.colors.light, [zone]: defaults[zone] };
        setOverriddenZones((prev) => {
          const next = new Set(prev);
          next.delete(zone);
          return next;
        });
        onChange({
          ...data,
          colors: { ...data.colors, light: newLight },
        });
      } else {
        const newDark = { ...data.colors.dark };
        delete newDark[zone];
        onChange({
          ...data,
          colors: { ...data.colors, dark: newDark },
        });
      }
      setActiveZone(null);
    },
    [primary, accent, data, onChange]
  );

  // Clickable zone wrapper
  const zoneClickable = darkMode === "customize" || !showingDark;

  function zoneProps(zone: keyof ZoneColors) {
    if (!zoneClickable) return {};
    const mode: "light" | "dark" = showingDark ? "dark" : "light";
    return {
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setActiveZone({ zone, mode });
      },
      onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        e.currentTarget.style.outline = "2px dashed rgba(255,255,255,0.4)";
        e.currentTarget.style.outlineOffset = "2px";
        e.currentTarget.style.cursor = "pointer";
      },
      onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.outline = "none";
      },
    };
  }

  // Active zone color value
  const activeColor =
    activeZone &&
    (activeZone.mode === "light"
      ? data.colors.light[activeZone.zone as keyof ZoneColors]
      : resolvedDark[activeZone.zone as keyof ZoneColors]);

  const currentMode: "light" | "dark" = showingDark ? "dark" : "light";

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
      {/* Left column */}
      <div>
        <motion.div
          initial={reduce ? false : "hidden"}
          animate="visible"
          variants={headerContainer}
        >
          <motion.p variants={headerItem} className={kickerCls} style={kickerFont}>
            step 02 / colors
          </motion.p>
          <motion.h1 variants={headerItem} className={headlineCls} style={headlineFont}>
            Pick the <span style={italicAccent}>palette.</span>
          </motion.h1>
          <motion.p variants={headerItem} className={subcopyCls} style={{ fontFamily: "var(--font-display)", maxWidth: "52ch" }}>
            Pick two seed colors — primary (for most of the interface) and accent
            (for small highlights). We&rsquo;ll fill in the rest, and you can
            override any individual zone below.
          </motion.p>
        </motion.div>

        {/* Inline tip */}
        <p
          className="mt-6 text-[14px] italic text-[color:var(--color-marker)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Pick one strong color and one quiet one. The preview on the right
          updates live — tweak until it looks like you.
        </p>

        {/* Seed swatches */}
        <div className="mt-8 flex flex-col gap-6 sm:flex-row">
          {/* Primary seed */}
          <label className="flex cursor-pointer items-center gap-4">
            <span
              className="block h-24 w-24 border-2 border-[color:var(--color-ink)]"
              style={{ background: data.colors.primary }}
            />
            <input
              type="color"
              value={data.colors.primary || "#000000"}
              onChange={(e) => updateSeeds({ primary: e.target.value })}
              className="sr-only"
            />
            <div>
              <p className={labelCls} style={labelFont}>
                Primary seed
              </p>
              <p
                className="text-[15px] text-[color:var(--color-ink)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {(data.colors.primary || "#000000").toUpperCase()}
              </p>
            </div>
          </label>

          {/* Accent seed */}
          <label className="flex cursor-pointer items-center gap-4">
            <span
              className="block h-24 w-24 border-2 border-[color:var(--color-ink)]"
              style={{ background: data.colors.accent }}
            />
            <input
              type="color"
              value={data.colors.accent || "#000000"}
              onChange={(e) => updateSeeds({ accent: e.target.value })}
              className="sr-only"
            />
            <div>
              <p className={labelCls} style={labelFont}>
                Accent seed
              </p>
              <p
                className="text-[15px] text-[color:var(--color-ink)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {(data.colors.accent || "#000000").toUpperCase()}
              </p>
            </div>
          </label>
        </div>

        {/* Individual zones */}
        <div className="mt-10">
          <p className={labelCls} style={labelFont}>
            Individual zones
          </p>
          <div>
            {ZONE_ORDER.map((zone) => {
              const isOverridden = overriddenZones.has(zone);
              const zoneColor = palette[zone] || "#000000";
              return (
                <div
                  key={zone}
                  className="flex items-center justify-between gap-4 border-b border-dashed border-[color:var(--color-hairline)] py-3 last:border-b-0"
                >
                  <div>
                    <p
                      className="text-[13px] text-[color:var(--color-ink)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {zone}
                    </p>
                    {isOverridden && (
                      <p
                        className="text-[11px] italic text-[color:var(--color-marker)]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        custom
                      </p>
                    )}
                  </div>
                  <label className="flex cursor-pointer items-center gap-3">
                    <span
                      className="block h-8 w-8 border border-[color:var(--color-ink)]"
                      style={{ background: zoneColor }}
                    />
                    <input
                      type="color"
                      value={zoneColor}
                      onChange={(e) =>
                        updateZoneColor(zone, e.target.value, currentMode)
                      }
                      className="sr-only"
                    />
                    <span
                      className="text-[12px] text-[color:var(--color-ink-faded)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {zoneColor.toUpperCase()}
                    </span>
                    {isOverridden && currentMode === "light" && (
                      <button
                        type="button"
                        onClick={() => resetZone(zone, "light")}
                        className="ml-2 text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink)] underline underline-offset-2 hover:text-[color:var(--color-marker)]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        reset
                      </button>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right column — live preview pinned */}
      <div className="lg:sticky lg:top-[100px] lg:self-start lg:z-10">
        <TapedScreenshot
          rotation={-1.5}
          tapes={[
            { position: "top-left", color: "yellow" },
            { position: "top-right", color: "red" },
          ]}
        >
          <DashboardPreview
            palette={palette}
            showingDark={showingDark}
            appName={data.school.appName}
            zoneProps={zoneProps}
          />
        </TapedScreenshot>

        {/* Dark mode toggle — ink-bordered chip buttons */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDarkMode("hidden")}
            className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition-colors ${
              darkMode === "hidden"
                ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-paper)]"
                : "border-[color:var(--color-ink)] bg-[color:var(--color-paper)] text-[color:var(--color-ink)] hover:bg-[color:var(--color-ink)]/10"
            }`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            light
          </button>
          <button
            type="button"
            onClick={() => setDarkMode("preview")}
            className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition-colors ${
              darkMode === "preview"
                ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-paper)]"
                : "border-[color:var(--color-ink)] bg-[color:var(--color-paper)] text-[color:var(--color-ink)] hover:bg-[color:var(--color-ink)]/10"
            }`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            dark preview
          </button>
          <button
            type="button"
            onClick={() => setDarkMode("customize")}
            className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] transition-colors ${
              darkMode === "customize"
                ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-paper)]"
                : "border-[color:var(--color-ink)] bg-[color:var(--color-paper)] text-[color:var(--color-ink)] hover:bg-[color:var(--color-ink)]/10"
            }`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            customize dark
          </button>
        </div>
      </div>

      {/* Zone popover — fixed overlay */}
      {activeZone && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
          }}
          onClick={() => setActiveZone(null)}
        >
          <div
            style={{
              width: 280,
              fontFamily: "var(--font-mono)",
              background: "var(--color-paper)",
              border: "2px solid var(--color-ink)",
              padding: "20px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--color-ink)",
                }}
              >
                {activeZone.zone}
              </span>
              <button
                onClick={() => setActiveZone(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 18,
                  color: "var(--color-ink-faded)",
                  lineHeight: 1,
                  padding: 0,
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div
              style={{
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <input
                type="color"
                value={activeColor || "#000000"}
                onChange={(e) =>
                  updateZoneColor(
                    activeZone.zone,
                    e.target.value,
                    activeZone.mode
                  )
                }
                style={{
                  height: 40,
                  width: 48,
                  cursor: "pointer",
                  border: "2px solid var(--color-ink)",
                  background: "transparent",
                  padding: 0,
                }}
              />
              <input
                type="text"
                value={activeColor || ""}
                maxLength={7}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(val))
                    updateZoneColor(activeZone.zone, val, activeZone.mode);
                }}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "0",
                  borderBottom: "2px solid var(--color-ink)",
                  padding: "4px 0",
                  fontSize: 15,
                  color: "var(--color-ink)",
                  fontFamily: "var(--font-mono)",
                  outline: "none",
                }}
              />
            </div>
            <button
              onClick={() => resetZone(activeZone.zone, activeZone.mode)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "var(--color-ink-faded)",
                textDecoration: "underline",
                fontFamily: "var(--font-mono)",
                padding: 0,
              }}
            >
              reset to default
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
