"use client";

import { useEffect, useMemo, useRef } from "react";
import type { WizardFormData } from "@/lib/types";
import { generateConfigTs } from "@/lib/config-generator";

// Live syntax-highlighted school.config.ts pane.
// Renders THE CANONICAL output of lib/config-generator.ts (single source of truth).
// Highlights the line range corresponding to the current wizard step.
//
// Reference: wizard-terminal.html — .pane-preview + .code blocks

type Props = {
  data: WizardFormData;
  activeStep: number; // 0..6 matching STEPS in WizardShell
};

// Map step index → (top-level key, fallback regex anchor).
// The generator emits keys in a fixed order; we find the matching line block.
const STEP_ANCHORS: { key: string; startPattern: RegExp; endPattern: RegExp }[] = [
  { key: "school", startPattern: /^  school: \{/, endPattern: /^  \},$/ },                   // step 0
  { key: "colors", startPattern: /^  colors: \{/, endPattern: /^  \},$/ },                   // step 1
  { key: "schedule", startPattern: /^  schedule: \{/, endPattern: /^  \},$/ },               // step 2
  { key: "lunchWaves", startPattern: /^  lunchWaves: \{/, endPattern: /^  \},$/ },           // step 3
  { key: "calendar", startPattern: /^  calendar: \{/, endPattern: /^  \},$/ },               // step 4
  { key: "features", startPattern: /^  features: \{/, endPattern: /^  \},$/ },               // step 5
  { key: "school", startPattern: /^const config/, endPattern: /^export default config;$/ }, // step 6 — review → highlight whole config
];

// Minimal TypeScript tokenizer (regex-only, zero deps). Emits spans with token classes.
// Order of rules matters — comments first, then strings, then keywords/numbers.
type Token = { type: "com" | "str" | "kw" | "num" | "fn" | "plain"; text: string };

function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;
  while (cursor < line.length) {
    const rest = line.slice(cursor);

    // Line comment
    const com = rest.match(/^\/\/[^\n]*/);
    if (com) {
      tokens.push({ type: "com", text: com[0] });
      cursor += com[0].length;
      continue;
    }

    // Double-quoted string (no embedded escapes other than \\ and \" — matches esc() output)
    const str = rest.match(/^"(?:\\.|[^"\\])*"/);
    if (str) {
      tokens.push({ type: "str", text: str[0] });
      cursor += str[0].length;
      continue;
    }

    // Keyword
    const kw = rest.match(/^(import|export|const|type|from|default|true|false)\b/);
    if (kw) {
      tokens.push({ type: "kw", text: kw[0] });
      cursor += kw[0].length;
      continue;
    }

    // Number
    const num = rest.match(/^-?\d+(\.\d+)?/);
    if (num) {
      tokens.push({ type: "num", text: num[0] });
      cursor += num[0].length;
      continue;
    }

    // Type/function identifier at import sites: SchoolConfig
    const fn = rest.match(/^[A-Z][A-Za-z0-9]*/);
    if (fn) {
      tokens.push({ type: "fn", text: fn[0] });
      cursor += fn[0].length;
      continue;
    }

    // Fallback: one char
    tokens.push({ type: "plain", text: rest[0] });
    cursor += 1;
  }
  return tokens;
}

const CLASS_BY_TYPE: Record<Token["type"], string> = {
  com: "text-[color:var(--color-text-faded)] italic",
  str: "text-[color:var(--color-ok)]",
  kw: "text-[#c084fc]",
  num: "text-[color:var(--color-warn)]",
  fn: "text-[#60a5fa]",
  plain: "",
};

export default function ConfigPreview({ data, activeStep }: Props) {
  const source = useMemo(() => generateConfigTs(data), [data]);
  const lines = useMemo(() => source.split("\n"), [source]);

  // Compute the highlighted line range for the current step.
  const range = useMemo(() => {
    const anchor = STEP_ANCHORS[activeStep];
    if (!anchor) return null;
    const start = lines.findIndex((l) => anchor.startPattern.test(l));
    if (start < 0) return null;
    // endPattern matches "  }," — find the first one at or after start+1
    for (let i = start + 1; i < lines.length; i++) {
      if (anchor.endPattern.test(lines[i])) return { start, end: i };
    }
    return { start, end: lines.length - 1 };
  }, [lines, activeStep]);

  // Scroll the highlighted block into view on step change.
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!range || !containerRef.current) return;
    const el = containerRef.current.querySelector(
      `[data-line="${range.start}"]`
    ) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [range]);

  return (
    <div className="flex min-h-0 flex-1 flex-col" aria-live="polite">
      <div
        className="flex items-center justify-between border-b border-[color:var(--color-line)] bg-[color:var(--color-background)] px-[18px] py-2.5 text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-text-faded)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <span>school.config.ts</span>
        <span className="text-[color:var(--color-text-dim)]">
          <b className="font-medium text-[color:var(--color-ok)]">live</b> · auto-saves
        </span>
      </div>
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto whitespace-pre px-5 py-4 text-[12px] leading-[1.65] text-[color:var(--color-text-dim)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {lines.map((line, i) => {
          const isHighlighted = range && i >= range.start && i <= range.end;
          const isLastHighlighted = range && i === range.end;
          const tokens = tokenizeLine(line);
          return (
            <div
              key={i}
              data-line={i}
              className={
                isHighlighted
                  ? "-mx-3 border-l-2 border-[color:var(--color-accent)] bg-[rgba(255,99,99,0.08)] pl-2.5"
                  : ""
              }
            >
              {tokens.map((t, j) => (
                <span key={j} className={CLASS_BY_TYPE[t.type]}>
                  {t.text}
                </span>
              ))}
              {isLastHighlighted && (
                <span
                  aria-hidden="true"
                  className="ml-0.5 inline-block h-[14px] w-[7px] animate-[config-caret_1s_step-end_infinite] bg-[color:var(--color-accent)] align-middle"
                />
              )}
              {"\n"}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes config-caret { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
