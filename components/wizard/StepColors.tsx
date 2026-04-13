"use client";

import { useState, useCallback } from "react";
import { defaultLightColors, resolveDarkColors } from "@/lib/colors";
import type { ZoneColors } from "@/lib/colors";
import type { WizardFormData } from "@/lib/types";
import DashboardPreview from "./DashboardPreview";

type StepProps = {
  data: WizardFormData;
  onChange: (data: WizardFormData) => void;
};

const fontMono: React.CSSProperties = { fontFamily: "var(--font-mono)" };


export default function StepColors({ data, onChange }: StepProps) {
  const { primary, accent } = data.colors;

  const [overriddenZones, setOverriddenZones] = useState<Set<string>>(
    () => new Set()
  );
  const [activeZone, setActiveZone] = useState<{
    zone: keyof ZoneColors;
    mode: "light" | "dark";
  } | null>(null);
  const [darkMode, setDarkMode] = useState<
    "hidden" | "preview" | "customize"
  >("hidden");

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

  return (
    <div className="space-y-8" style={fontMono}>
      <div className="flex items-baseline gap-3.5 border-b border-dashed border-[color:var(--color-line-strong)] pb-4">
        <h2 className="text-[22px] font-bold text-[color:var(--color-foreground)]">
          <span className="text-[color:var(--color-text-faded)] font-normal">{"// "}</span>
          colors
        </h2>
        <span className="text-[12px] text-[color:var(--color-text-faded)]">
          — two seeds cascade into eight zones. click any zone on the mockup to override.
        </span>
      </div>

      {/* Seeds */}
      <div>
        <div className="mb-2 text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-text-faded)]">
          seeds
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "primary" as const, label: "Primary" },
            { key: "accent" as const, label: "Accent" },
          ].map(({ key, label }) => (
            <div
              key={key}
              className="grid grid-cols-[40px_1fr] items-center gap-2.5 rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] p-2.5"
            >
              <input
                type="color"
                value={(key === "primary" ? primary : accent) || "#000000"}
                onChange={(e) => updateSeeds({ [key]: e.target.value })}
                className="h-10 w-10 cursor-pointer rounded border border-white/10 bg-transparent p-0"
                aria-label={`Pick ${label} color`}
              />
              <div>
                <div className="text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-text-faded)]">
                  {label}
                </div>
                <input
                  className="w-full bg-transparent text-[13px] text-[color:var(--color-foreground)] focus:outline-none"
                  style={fontMono}
                  type="text"
                  maxLength={7}
                  value={key === "primary" ? primary : accent}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9a-fA-F]{0,6}$/.test(val))
                      updateSeeds({ [key]: val });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zones — click on the dashboard below to edit */}
      <div>
        <div className="mb-2 flex justify-between text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-text-faded)]">
          <span>zones</span>
          <span className="text-[color:var(--color-accent)]">* = overridden</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(palette) as (keyof typeof palette)[]).map((zone) => {
            const overridden = overriddenZones.has(zone);
            return (
              <div
                key={zone}
                className={`grid cursor-pointer grid-cols-[20px_1fr_70px] items-center gap-2 rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] px-2.5 py-1.5 text-[11px] transition-colors hover:border-[color:var(--color-accent)] ${
                  overridden ? "border-l-2 border-l-[color:var(--color-accent)]" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (zoneClickable) {
                    setActiveZone({
                      zone,
                      mode: showingDark ? "dark" : "light",
                    });
                  }
                }}
              >
                <span
                  className="h-4 w-4 rounded-[2px] border border-white/10"
                  style={{ background: palette[zone] }}
                />
                <span className="text-[color:var(--color-foreground)]" style={fontMono}>
                  {zone}
                  {overridden && <span className="text-[color:var(--color-accent)]"> *</span>}
                </span>
                <span
                  className="text-right text-[10px] text-[color:var(--color-text-faded)]"
                  style={fontMono}
                >
                  {palette[zone]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live dashboard preview (inline-styled because palette is arbitrary hex) */}
      <div>
        <div className="mb-2 text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-text-faded)]">
          live preview · {showingDark ? "dark" : "light"}
        </div>
        <DashboardPreview
          palette={palette}
          showingDark={showingDark}
          appName={data.school.appName}
          zoneProps={zoneProps}
        />
      </div>

      {/* Zone popover */}
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
            className="rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-raised)] p-5"
            style={{ width: 280, fontFamily: "var(--font-mono)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-[color:var(--color-foreground)]">
                {activeZone.zone}
              </span>
              <button
                onClick={() => setActiveZone(null)}
                className="cursor-pointer bg-transparent text-[color:var(--color-text-faded)] hover:text-[color:var(--color-foreground)]"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="mb-4 flex items-center gap-3">
              <input
                type="color"
                value={activeColor || "#000000"}
                onChange={(e) =>
                  updateZoneColor(activeZone.zone, e.target.value, activeZone.mode)
                }
                className="h-10 w-12 cursor-pointer rounded border border-white/10 bg-transparent p-0"
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
                className="flex-1 bg-[color:var(--color-bg-input)] px-2 py-1.5 text-[13px] text-[color:var(--color-foreground)] focus:outline-none"
                style={{ fontFamily: "var(--font-mono)" }}
              />
            </div>
            <button
              onClick={() => resetZone(activeZone.zone, activeZone.mode)}
              className="cursor-pointer bg-transparent text-xs text-[color:var(--color-text-faded)] underline hover:text-[color:var(--color-foreground)]"
            >
              reset to default
            </button>
          </div>
        </div>
      )}

      {/* Dark mode controls */}
      <div className="rounded-[3px] border border-[color:var(--color-line-strong)] px-4 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <span className="text-sm text-[color:var(--color-foreground)]">
            dark mode{" "}
            <span className="text-xs text-[color:var(--color-text-faded)]">
              {darkMode === "hidden" && "— auto-generated from your light colors"}
              {darkMode === "preview" && "— preview"}
              {darkMode === "customize" && "— click zones to customize"}
            </span>
          </span>
          <div className="flex gap-2">
            {darkMode === "hidden" && (
              <>
                <button
                  onClick={() => setDarkMode("preview")}
                  className="cursor-pointer rounded-[3px] border border-[color:var(--color-line-strong)] px-3 py-1.5 text-xs text-[color:var(--color-text-dim)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-foreground)]"
                >
                  preview dark
                </button>
                <button
                  onClick={() => setDarkMode("customize")}
                  className="cursor-pointer rounded-[3px] border border-[color:var(--color-line-strong)] px-3 py-1.5 text-xs text-[color:var(--color-text-dim)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-foreground)]"
                >
                  customize dark
                </button>
              </>
            )}
            {(darkMode === "preview" || darkMode === "customize") && (
              <button
                onClick={() => setDarkMode("hidden")}
                className="cursor-pointer rounded-[3px] border border-[color:var(--color-line-strong)] px-3 py-1.5 text-xs text-[color:var(--color-text-dim)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-foreground)]"
              >
                back to light
              </button>
            )}
            {darkMode === "preview" && (
              <button
                onClick={() => setDarkMode("customize")}
                className="cursor-pointer rounded-[3px] border border-[color:var(--color-line-strong)] px-3 py-1.5 text-xs text-[color:var(--color-text-dim)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-foreground)]"
              >
                customize
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
