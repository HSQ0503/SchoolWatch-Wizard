"use client";

import type { ZoneColors } from "@/lib/colors";

type Props = {
  palette: ZoneColors;
  showingDark: boolean;
  appName: string;
  // Click-to-edit zone affordance preserved from original
  zoneProps?: (zone: keyof ZoneColors) => Partial<React.HTMLAttributes<HTMLElement>>;
};

// Pure visual extraction of the inline-styled dashboard mockup from the original
// StepColors.tsx. All styling stays inline because the palette is arbitrary hex
// that can't be expressed in Tailwind utilities.
//
// Behavior preserved: zoneProps passthrough so parent can hook click / hover to
// open the zone color popover.
export default function DashboardPreview({
  palette,
  showingDark,
  appName,
  zoneProps,
}: Props) {
  const zp = zoneProps ?? (() => ({}));

  return (
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
        {...zp("navbar")}
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
          style={{ color: palette.navText, fontWeight: 700, fontSize: 14 }}
          {...zp("navText")}
        >
          {appName || "SchoolWatch"}
        </span>
        <div style={{ flex: 1 }} />
        {["Dashboard", "Schedule", "Events"].map((link) => (
          <span
            key={link}
            style={{ color: palette.navText, fontSize: 12, opacity: 0.7 }}
          >
            {link}
          </span>
        ))}
      </div>

      {/* Page background zone */}
      <div
        style={{ padding: 16, background: palette.background }}
        {...zp("background")}
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
          {...zp("surface")}
        >
          <div
            style={{
              color: palette.heading,
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 8,
            }}
            {...zp("heading")}
          >
            It&apos;s Friday
          </div>

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
            {...zp("badge")}
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

          <div
            style={{ display: "flex", justifyContent: "center", marginBottom: 4 }}
            {...zp("ring")}
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
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
              {...zp("cardAccent")}
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
  );
}
