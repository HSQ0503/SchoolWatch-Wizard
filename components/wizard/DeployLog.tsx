"use client";

import { useEffect, useRef, useState } from "react";

// Terminal-style deploy log that replaces DeployProgress.
// PRESERVED CONTRACT: exact same prop shape and DeployState union as the old
// component, so StepReview's handleDeploy() doesn't need to change.
//
// Visual reference: wizard-terminal.html — .deploy-log block

export type DeployState =
  | "idle"
  | "creating-repo"
  | "pushing-config"
  | "creating-project"
  | "deploying"
  | "done"
  | "error";

type Props = {
  state: DeployState;
  url?: string;
  error?: string;
  isEditMode?: boolean;
};

type LogEntry = { t: string; kind: "ok" | "info" | "pending" | "err"; text: string };

// Stage → log lines to append when that stage becomes current.
// Timestamps increment monotonically across stages so the log looks like a real run.
const STAGE_LINES_NEW: Record<Exclude<DeployState, "idle" | "error">, LogEntry[]> = {
  "creating-repo": [
    { t: "00:00.2", kind: "info", text: "schoolwatch deploy v0.3.2" },
    { t: "00:01.4", kind: "ok", text: "slug available" },
  ],
  "pushing-config": [
    { t: "00:02.1", kind: "ok", text: "github repo created" },
    { t: "00:04.8", kind: "info", text: "waiting for template files..." },
    { t: "00:11.3", kind: "ok", text: "template ready" },
    { t: "00:13.2", kind: "ok", text: "pushed school.config.ts" },
  ],
  "creating-project": [
    { t: "00:14.9", kind: "ok", text: "vercel project created" },
  ],
  "deploying": [
    { t: "00:16.1", kind: "ok", text: "deployment triggered" },
    { t: "00:22.4", kind: "info", text: "building... (next build · prisma generate)" },
    { t: "00:58.7", kind: "info", text: "uploading..." },
  ],
  "done": [{ t: "01:12.0", kind: "ok", text: "live" }],
};

const STAGE_LINES_EDIT: Record<Exclude<DeployState, "idle" | "error">, LogEntry[]> = {
  "creating-repo": [], // skipped in edit mode
  "pushing-config": [
    { t: "00:00.2", kind: "info", text: "schoolwatch redeploy v0.3.2" },
    { t: "00:01.8", kind: "ok", text: "pushed updated school.config.ts" },
  ],
  "creating-project": [], // skipped in edit mode
  "deploying": [
    { t: "00:03.1", kind: "ok", text: "deployment triggered" },
    { t: "00:08.4", kind: "info", text: "building..." },
  ],
  "done": [{ t: "00:42.0", kind: "ok", text: "live" }],
};

const PENDING_LABEL: Record<Exclude<DeployState, "idle" | "error" | "done">, string> = {
  "creating-repo": "creating github repo",
  "pushing-config": "pushing config",
  "creating-project": "creating vercel project",
  "deploying": "waiting for deployment",
};

export default function DeployLog({ state, url, error, isEditMode }: Props) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Append stage lines as state advances.
  useEffect(() => {
    if (state === "idle") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntries([]);
      return;
    }
    if (state === "error") return;
    const table = isEditMode ? STAGE_LINES_EDIT : STAGE_LINES_NEW;
    const lines = table[state] ?? [];
    setEntries((prev) => [...prev, ...lines]);
  }, [state, isEditMode]);

  // Append URL line when done.
  useEffect(() => {
    if (state === "done" && url) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntries((prev) => [
        ...prev,
        { t: "      ", kind: "info", text: `→ ${url}` },
      ]);
    }
  }, [state, url]);

  // Append error line.
  useEffect(() => {
    if (state === "error") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntries((prev) => [
        ...prev,
        { t: "  --  ", kind: "err", text: error ?? "deployment failed" },
      ]);
    }
  }, [state, error]);

  // Auto-scroll to bottom on new entries.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [entries]);

  if (state === "idle" && entries.length === 0) return null;

  const isPending = state !== "idle" && state !== "done" && state !== "error";
  const pendingLabel = isPending
    ? PENDING_LABEL[state as Exclude<DeployState, "idle" | "error" | "done">]
    : null;

  return (
    <div className="mt-8" aria-live="polite">
      <div className="flex items-center justify-between border-b border-[color:var(--color-ink)] pb-2 mb-4">
        <span
          className="text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink-faded)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          deploy log
        </span>
        <span
          className="text-[11px] italic"
          style={{
            fontFamily: "var(--font-display)",
            color:
              state === "done"
                ? "#3a7d5c"
                : state === "error"
                ? "var(--marker)"
                : "var(--ink-faded)",
          }}
        >
          {state === "done" ? "done" : state === "error" ? "failed" : "running"}
        </span>
      </div>
      <div
        ref={scrollRef}
        className="max-h-[360px] space-y-1 overflow-y-auto bg-white border border-[color:var(--color-hairline)] p-4 text-[13px] text-[color:var(--color-ink)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {entries.map((e, i) => (
          <div key={i} className="flex items-start gap-3" role="status">
            <span className="min-w-[60px] text-[color:var(--color-ink-faded)]">{e.t}</span>
            {e.kind === "ok" && (
              <span className="text-[color:var(--color-ink)]">
                <span className="mr-1.5 text-[#3a7d5c]">✓</span>
                {e.text}
              </span>
            )}
            {e.kind === "info" && (
              <span className="text-[color:var(--color-ink-soft)]">{e.text}</span>
            )}
            {e.kind === "pending" && (
              <span
                className="italic text-[color:var(--color-ink-soft)] motion-safe:animate-pulse"
                style={{ fontFamily: "var(--font-display)" }}
              >
                ● {e.text}
              </span>
            )}
            {e.kind === "err" && (
              <span className="text-[color:var(--color-marker)]">
                <span className="mr-1.5">✗</span>
                {e.text}
              </span>
            )}
          </div>
        ))}
        {pendingLabel && (
          <div className="flex items-start gap-3" role="status">
            <span className="min-w-[60px] text-[color:var(--color-ink-faded)]" />
            <span
              className="italic text-[color:var(--color-ink-soft)] motion-safe:animate-pulse"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ● {pendingLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
