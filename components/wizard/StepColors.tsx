"use client";

import { useState, useCallback } from "react";
import { defaultLightColors, resolveDarkColors } from "@/lib/colors";
import type { ZoneColors } from "@/lib/colors";
import type { WizardFormData } from "@/lib/types";

type StepProps = {
  data: WizardFormData;
  onChange: (data: WizardFormData) => void;
};

const inputClass =
  "w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white font-mono placeholder-gray-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors duration-150";

const labelClass = "block text-sm font-medium text-gray-300 mb-1.5";

const ZONE_LABELS: Record<keyof ZoneColors, string> = {
  navbar: "Navbar",
  navText: "Nav Text",
  background: "Background",
  heading: "Heading",
  ring: "Timer Ring",
  surface: "Card Surface",
  cardAccent: "Card Accent",
  badge: "Badge",
};


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
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-white">School Colors</h2>
        <p className="mt-1 text-sm text-gray-400">
          Pick your brand colors, then click any zone on the mockup to
          fine-tune.
        </p>
      </div>

      {/* Seed color pickers */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className={labelClass}>Primary Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primary || "#000000"}
              onChange={(e) => updateSeeds({ primary: e.target.value })}
              className="h-11 w-14 cursor-pointer rounded-lg border border-white/20 bg-transparent p-1"
              aria-label="Pick primary color"
            />
            <input
              className={inputClass}
              type="text"
              placeholder="#003da5"
              maxLength={7}
              value={primary}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9a-fA-F]{0,6}$/.test(val))
                  updateSeeds({ primary: val });
              }}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className={labelClass}>Accent Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={accent || "#000000"}
              onChange={(e) => updateSeeds({ accent: e.target.value })}
              className="h-11 w-14 cursor-pointer rounded-lg border border-white/20 bg-transparent p-1"
              aria-label="Pick accent color"
            />
            <input
              className={inputClass}
              type="text"
              placeholder="#f59e0b"
              maxLength={7}
              value={accent}
              onChange={(e) => {
                const val = e.target.value;
                if (/^#[0-9a-fA-F]{0,6}$/.test(val))
                  updateSeeds({ accent: val });
              }}
            />
          </div>
        </div>
      </div>

      {/* Dashboard Mockup */}
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          overflow: "hidden",
          maxHeight: 500,
          background: palette.background,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Navbar */}
        <div
          style={{
            background: palette.navbar,
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
          {...zoneProps("navbar")}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: palette.navText,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              color: palette.navText,
              fontWeight: 700,
              fontSize: 14,
            }}
            {...zoneProps("navText")}
          >
            {data.school.appName || "SchoolWatch"}
          </span>
          <div style={{ flex: 1 }} />
          {["Dashboard", "Schedule", "Events"].map((link) => (
            <span
              key={link}
              style={{
                color: palette.navText,
                fontSize: 12,
                opacity: 0.7,
              }}
            >
              {link}
            </span>
          ))}
        </div>

        {/* Page background zone */}
        <div
          style={{ padding: 16, background: palette.background }}
          {...zoneProps("background")}
        >
          {/* Hero card */}
          <div
            style={{
              background: palette.surface,
              borderRadius: 10,
              padding: "20px 24px",
              textAlign: "center",
              marginBottom: 12,
            }}
            {...zoneProps("surface")}
          >
            <div
              style={{
                color: palette.heading,
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 8,
              }}
              {...zoneProps("heading")}
            >
              It&apos;s Friday
            </div>

            {/* Badge */}
            <span
              style={{
                display: "inline-block",
                background: palette.badge,
                color: "#ffffff",
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 999,
                letterSpacing: "0.05em",
                marginBottom: 12,
              }}
              {...zoneProps("badge")}
            >
              REGULAR DAY
            </span>

            <div
              style={{
                color: showingDark ? "#94a3b8" : "#64748b",
                fontSize: 12,
                marginBottom: 12,
              }}
            >
              3rd Period
            </div>

            {/* Timer Ring SVG */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 4,
              }}
              {...zoneProps("ring")}
            >
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke={showingDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"}
                  strokeWidth="6"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke={palette.ring}
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 34 * 0.7} ${2 * Math.PI * 34 * 0.3}`}
                  strokeDashoffset={2 * Math.PI * 34 * 0.25}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                />
                <text
                  x="40"
                  y="44"
                  textAnchor="middle"
                  fill={palette.ring}
                  fontSize="16"
                  fontWeight="700"
                  fontFamily="monospace"
                >
                  23:41
                </text>
              </svg>
            </div>
          </div>

          {/* Glance cards */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {[
              { label: "NEXT EVENT", text: "Spirit Day" },
              { label: "TO-DO", text: "All caught up!" },
            ].map((card) => (
              <div
                key={card.label}
                style={{
                  background: palette.surface,
                  borderRadius: 8,
                  padding: "12px 14px",
                  borderLeft: `3px solid ${palette.cardAccent}`,
                }}
                {...zoneProps("cardAccent")}
              >
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: palette.cardAccent,
                    letterSpacing: "0.05em",
                    marginBottom: 4,
                  }}
                >
                  {card.label}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: showingDark ? "#e2e8f0" : "#1e293b",
                  }}
                >
                  {card.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zone Popover */}
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
              background: "#1a1a2e",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 12,
              padding: 20,
              width: 280,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <span
                style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}
              >
                {ZONE_LABELS[activeZone.zone]}
              </span>
              <button
                onClick={() => setActiveZone(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  fontSize: 18,
                  cursor: "pointer",
                  lineHeight: 1,
                  padding: 4,
                }}
              >
                &times;
              </button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
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
                  width: 48,
                  height: 40,
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 8,
                  background: "transparent",
                  cursor: "pointer",
                  padding: 2,
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
                className={inputClass}
                style={{ flex: 1 }}
              />
            </div>

            <button
              onClick={() => resetZone(activeZone.zone, activeZone.mode)}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                fontSize: 12,
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
              }}
            >
              Reset to default
            </button>
          </div>
        </div>
      )}

      {/* Dark Mode Section */}
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10,
          padding: "14px 18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <span style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 500 }}>
            Dark Mode{" "}
            <span style={{ color: "#64748b", fontSize: 12, fontWeight: 400 }}>
              {darkMode === "hidden" &&
                "— auto-generated from your light colors"}
              {darkMode === "preview" && "— preview"}
              {darkMode === "customize" && "— click zones to customize"}
            </span>
          </span>

          <div style={{ display: "flex", gap: 8 }}>
            {darkMode === "hidden" && (
              <>
                <button
                  onClick={() => setDarkMode("preview")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/20 text-gray-300 hover:text-white hover:border-white/40 transition-colors duration-150 cursor-pointer"
                >
                  Preview Dark Mode
                </button>
                <button
                  onClick={() => setDarkMode("customize")}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/20 text-gray-300 hover:text-white hover:border-white/40 transition-colors duration-150 cursor-pointer"
                >
                  Customize Dark Mode
                </button>
              </>
            )}
            {(darkMode === "preview" || darkMode === "customize") && (
              <button
                onClick={() => setDarkMode("hidden")}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/20 text-gray-300 hover:text-white hover:border-white/40 transition-colors duration-150 cursor-pointer"
              >
                Back to Light Mode
              </button>
            )}
            {darkMode === "preview" && (
              <button
                onClick={() => setDarkMode("customize")}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-white/20 text-gray-300 hover:text-white hover:border-white/40 transition-colors duration-150 cursor-pointer"
              >
                Customize
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
