# Unified Wizard Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin the wizard shell (`/setup`, `/edit`, `/login`) and all seven step components from the current dark terminal aesthetic to the paper-and-ink zine language already shipped on the homepage.

**Architecture:** Single branch, single PR. Apply the existing `.theme-zine` wrapper to wizard surfaces, rewrite chrome (`WizardTopBar` / `ProgressStrip` / `StatusBar` / `Kbd`) and step bodies inline using Tailwind classes + CSS vars. Remove the persistent `ConfigPreview` sidebar; move it to a Review-step disclosure. Reuse homepage primitives (`Polaroid`, `TapedScreenshot`) where decorative. No new fonts, no new dependencies, no backend changes.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, `motion/react` (already on homepage). Fonts already loaded in `app/layout.tsx`: `--font-archivo` (Archivo Black), `--font-display` (Fraunces), `--font-caveat` (Caveat), `--font-mono` (JetBrains Mono), `--font-sans` (Geist).

**Spec:** `docs/superpowers/specs/2026-04-12-unified-wizard-theme-design.md`

---

## Conventions used by every task

- **Verification commands:** every task ends with `npm run lint` (MUST pass cleanly) and `npm run build` (MUST succeed with zero type errors). After the final task, walk through all seven steps in `npm run dev` at `http://localhost:3000/setup` and confirm each step renders, accepts input, and advances.
- **Shell:** use bash syntax — `npm run lint` not `npm.cmd run lint` (the project runs fine on bash on Windows).
- **Commits:** one per task. Commit messages follow the repo style (`feat: ...`, `refactor: ...`, `style: ...`). No Co-Authored-By unless the user has asked for it on other commits.
- **File paths:** absolute paths given below assume the repo root is `C:\Dev\schoolwatch-wizard`. Inside `Edit`/`Write` tool calls use absolute paths; inside bash `cd C:/Dev/schoolwatch-wizard` first or use forward-slash absolute paths.
- **Color tokens to use throughout** (already defined in `app/globals.css:19-32`):
  - `--paper` (`#f5efe0`) — page background
  - `--paper-dark` (`#ebe3d1`) — chrome strips, subtle panels
  - `--ink` (`#1a1a1a`) — primary text, borders, buttons
  - `--ink-soft` (`#3a3a3a`) — body copy
  - `--ink-faded` (`#6b6b6b`) — labels, kickers
  - `--highlight` (`#ffd23c`) — offset shadows, active cell fills
  - `--marker` (`#d63c3c`) — errors, accents, active step number
  - `--blue-mark` (`#2a4a8a`) — blue accent (polaroids only, usually)
  - `--hairline` (`rgba(26,26,26,0.12)`) — dashed rules, light borders
- **Do not** reintroduce the terminal tokens (`--color-accent`, `--color-bg-raised`, `--color-line`, `--color-line-strong`, `--color-text-dim`, `--color-text-faded`, `--color-ok`, `--color-warn`, `--color-foreground`, `--background`, `--bg-input`) inside any wizard file during this refactor. They remain defined globally but no wizard component should reference them.

---

## Task 1: Theme plumbing — narrow scrollbar rule, apply `.theme-zine` to wizard surfaces

**Files:**
- Modify: `C:\Dev\schoolwatch-wizard\app\globals.css:34-40`
- Modify: `C:\Dev\schoolwatch-wizard\app\page.tsx:15`
- Modify: `C:\Dev\schoolwatch-wizard\components\WizardShell.tsx:172-226`
- Modify: `C:\Dev\schoolwatch-wizard\app\login\page.tsx:45-53`

- [ ] **Step 1.1 — Narrow the scrollbar-hide rule so it only applies to the landing page**

  In `app/globals.css`, replace the existing rule (lines 34–40) with:

  ```css
  /* Hide native scrollbar on the landing page only — a custom progress bar replaces it there.
     Wizard pages use `.theme-zine` but NOT `.theme-zine-landing`, so they keep the scrollbar. */
  html:has(.theme-zine-landing) {
    scrollbar-width: none;
  }
  html:has(.theme-zine-landing)::-webkit-scrollbar {
    display: none;
  }
  ```

- [ ] **Step 1.2 — Add the `theme-zine-landing` marker class to the landing page**

  In `app/page.tsx:15`, change:

  ```tsx
  <main className="theme-zine relative">
  ```

  to:

  ```tsx
  <main className="theme-zine theme-zine-landing relative">
  ```

- [ ] **Step 1.3 — Apply `.theme-zine` wrapper to `WizardShell` root**

  In `components/WizardShell.tsx` around lines 172–180, replace the outer `<div>` opening tag:

  ```tsx
  <div
    className="flex min-h-screen flex-col bg-[color:var(--background)] text-[color:var(--color-foreground)]"
    style={{
      backgroundImage:
        "linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)",
      backgroundSize: "32px 32px",
    }}
  >
  ```

  with:

  ```tsx
  <div className="theme-zine flex min-h-screen flex-col bg-[color:var(--paper)] text-[color:var(--color-ink)]">
  ```

  (The grid background texture is retired — the paper aesthetic provides its own warmth without it.)

- [ ] **Step 1.4 — Apply `.theme-zine` wrapper to `login` page root**

  In `app/login/page.tsx:45-53`, replace the outer `<div>` opening tag:

  ```tsx
  <div
    className="flex min-h-screen flex-col bg-[color:var(--background)] text-[color:var(--color-foreground)]"
    style={{
      backgroundImage:
        "linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)",
      backgroundSize: "32px 32px",
    }}
  >
  ```

  with:

  ```tsx
  <div className="theme-zine flex min-h-screen flex-col bg-[color:var(--paper)] text-[color:var(--color-ink)]">
  ```

  The login page body is rewritten fully in Task 14; this step only plumbs the theme wrapper so the sanity check works.

- [ ] **Step 1.5 — Verify lint passes**

  Run: `cd C:/Dev/schoolwatch-wizard && npm run lint`
  Expected: `✔ No ESLint warnings or errors`

- [ ] **Step 1.6 — Verify build passes**

  Run: `cd C:/Dev/schoolwatch-wizard && npm run build`
  Expected: `✓ Compiled successfully` (some chrome components still reference retired tokens — they'll be removed in later tasks; Tailwind arbitrary-value classes with unknown CSS vars still compile).

- [ ] **Step 1.7 — Sanity check: landing page still hides scrollbar, wizard now has scrollbar**

  Run: `cd C:/Dev/schoolwatch-wizard && npm run dev`
  Open `http://localhost:3000` → scroll to confirm no native scrollbar (custom progress bar still works).
  Open `http://localhost:3000/setup` → confirm the page now has a native scrollbar and the background is paper-colored rather than near-black.
  Stop the dev server before continuing.

- [ ] **Step 1.8 — Commit**

  ```bash
  cd C:/Dev/schoolwatch-wizard
  git add app/globals.css app/page.tsx components/WizardShell.tsx app/login/page.tsx
  git commit -m "refactor: apply theme-zine wrapper to wizard shells, narrow scrollbar-hide to landing"
  ```

---

## Task 2: Rewrite `Kbd` and `WizardTopBar`

`Kbd` is rewritten first because `WizardTopBar` imports it. Both share the same task so they commit together.

**Files:**
- Rewrite: `C:\Dev\schoolwatch-wizard\components\wizard\Kbd.tsx`
- Rewrite: `C:\Dev\schoolwatch-wizard\components\wizard\WizardTopBar.tsx`

- [ ] **Step 2.1 — Rewrite `Kbd` with paper-on-ink styling**

  Replace the entire contents of `components/wizard/Kbd.tsx` with:

  ```tsx
  // Tiny keyboard-key badge. Paper-bordered chip designed to sit on top of an ink backdrop
  // (inside WizardTopBar). If used on a paper background directly, it stays readable too —
  // the ink border + paper fill invert naturally.
  type Props = { children: React.ReactNode };

  export default function Kbd({ children }: Props) {
    return (
      <span
        className="inline-block rounded-[2px] border border-[color:var(--color-paper)]/60 bg-[color:var(--color-paper)]/10 px-1.5 py-px text-[10px] text-[color:var(--color-paper)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {children}
      </span>
    );
  }
  ```

- [ ] **Step 2.2 — Rewrite `WizardTopBar` as an ink strip on paper**

  Replace the entire contents of `components/wizard/WizardTopBar.tsx` with:

  ```tsx
  import Kbd from "./Kbd";

  // Sticky app bar: SW monogram + version + connection dot + keyboard hints.
  // Dark ink strip sitting atop the paper theme — mirrors how ZineNav sits atop the homepage.
  export default function WizardTopBar() {
    return (
      <div
        className="sticky top-0 z-30 flex items-center justify-between bg-[color:var(--color-ink)] px-[18px] py-2.5 text-[11px] text-[color:var(--color-paper)]"
        style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.1em" }}
      >
        <div className="flex items-center gap-3.5">
          <span
            className="border border-[color:var(--color-paper)] px-1.5 py-0.5 text-[11px] font-extrabold tracking-[0.08em]"
            style={{ fontFamily: "var(--font-archivo)" }}
          >
            SW
          </span>
          <span className="text-[color:var(--color-paper)]/70">
            schoolwatch · wizard · v0.3.2
          </span>
          <span className="flex items-center gap-1.5 text-[color:var(--color-paper)]/70">
            <span
              aria-hidden="true"
              className="inline-block h-[7px] w-[7px] animate-pulse rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]"
            />
            connected
          </span>
        </div>
        <div className="hidden gap-[18px] text-[color:var(--color-paper)]/70 sm:flex">
          <span>
            <Kbd>⌘</Kbd> <Kbd>K</Kbd> commands
          </span>
          <span>
            <Kbd>?</Kbd> help
          </span>
        </div>
      </div>
    );
  }
  ```

  Notes:
  - `sticky top-0 z-30` is new — previously layout relied on default position. The sticky behavior is explicit so this bar stays visible during scrolling.
  - The green connected dot keeps the `#10b981` value inline rather than a token, since `--color-ok` is being retired from the wizard.
  - Keyboard hints hide on mobile (`hidden sm:flex`) — the SW brand + connected dot are the only essential top-bar content on small screens.

- [ ] **Step 2.3 — Lint & build**

  ```bash
  cd C:/Dev/schoolwatch-wizard && npm run lint && npm run build
  ```

  Expected: both pass.

- [ ] **Step 2.4 — Commit**

  ```bash
  cd C:/Dev/schoolwatch-wizard
  git add components/wizard/Kbd.tsx components/wizard/WizardTopBar.tsx
  git commit -m "style: reskin WizardTopBar + Kbd to ink-on-paper zine language"
  ```

---

## Task 3: Rewrite `ProgressStrip`

**Files:**
- Rewrite: `C:\Dev\schoolwatch-wizard\components\wizard\ProgressStrip.tsx`

- [ ] **Step 3.1 — Rewrite `ProgressStrip` with bell-cell paper aesthetic**

  Replace the entire contents of `components/wizard/ProgressStrip.tsx` with:

  ```tsx
  "use client";

  // Paper-panel progress bar below the topbar. 7 chunky bell-cells with ink borders.
  // Active cell fills with highlight yellow and gets a 3px hard offset shadow in ink.
  // Replaces the ASCII-style coral hatched bar.
  type Props = {
    current: number; // zero-indexed active step
    total: number;
    label: string;
  };

  export default function ProgressStrip({ current, total, label }: Props) {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return (
      <div
        className="sticky top-[38px] z-20 flex items-center gap-4 border-b border-[color:var(--color-hairline)] bg-[color:var(--color-paper-dark)] px-[18px] py-3.5 text-xs text-[color:var(--color-ink-faded)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <div>
          step{" "}
          <b
            className="text-[color:var(--color-marker)]"
            style={{ fontFamily: "var(--font-archivo)", fontWeight: 900 }}
          >
            {pad(current + 1)}
          </b>
          {" / "}
          {pad(total)}
        </div>
        <div className="flex flex-1 gap-[3px]">
          {Array.from({ length: total }).map((_, i) => {
            const isDone = i < current;
            const isActive = i === current;
            const filled = isDone || isActive;
            return (
              <div
                key={i}
                className="relative h-3 flex-1 border-[1.5px] border-[color:var(--color-ink)]"
                style={{
                  background: filled ? "var(--highlight)" : "var(--paper)",
                  boxShadow: isActive ? "3px 3px 0 var(--ink)" : undefined,
                }}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 motion-safe:animate-[zine-shimmer_2.4s_ease-in-out_infinite]"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                      backgroundSize: "200% 100%",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
        <div
          className="min-w-[140px] text-right text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink)]"
        >
          {label}
        </div>

        <style>{`
          @keyframes zine-shimmer {
            0%, 100% { background-position: -50% 0; }
            50% { background-position: 150% 0; }
          }
        `}</style>
      </div>
    );
  }
  ```

  Notes:
  - `sticky top-[38px]` — the topbar is ~38px tall with its py-2.5 + content, so the progress strip sits immediately below it.
  - `motion-safe:` prefix ensures the shimmer respects `prefers-reduced-motion` via Tailwind rather than a media query.
  - The `@keyframes zine-shimmer` is a subtle horizontal shimmer on the active cell (light-band sweeping left→right→left). This replaces the old coral hatched animation.

- [ ] **Step 3.2 — Lint & build**

  ```bash
  cd C:/Dev/schoolwatch-wizard && npm run lint && npm run build
  ```

  Expected: both pass.

- [ ] **Step 3.3 — Commit**

  ```bash
  cd C:/Dev/schoolwatch-wizard
  git add components/wizard/ProgressStrip.tsx
  git commit -m "style: reskin ProgressStrip to paper bell-cells with highlight fill"
  ```

---

## Task 4: Rewrite `StatusBar`

**Files:**
- Rewrite: `C:\Dev\schoolwatch-wizard\components\wizard\StatusBar.tsx`

- [ ] **Step 4.1 — Rewrite `StatusBar` as paper nav with ink/yellow CTA**

  Replace the entire contents of `components/wizard/StatusBar.tsx` with:

  ```tsx
  import Kbd from "./Kbd";

  // Sticky footer for the wizard: keyboard hints on the left, validity + nav on the right.
  // Paper-dark band with hairline top border. Primary CTA uses the signature ink-button
  // with yellow offset shadow from ZineHero.tsx.
  type Props = {
    status: "valid" | "invalid" | "pending";
    statusText: string;
    onBack: () => void;
    onNext?: () => void;
    isFirst: boolean;
  };

  export default function StatusBar({
    status,
    statusText,
    onBack,
    onNext,
    isFirst,
  }: Props) {
    const statusColor =
      status === "valid"
        ? "#3a7d5c"
        : status === "invalid"
        ? "var(--marker)"
        : "var(--ink-faded)";

    return (
      <div
        className="sticky bottom-0 z-20 flex items-center justify-between gap-4 border-t border-[color:var(--color-hairline)] bg-[color:var(--color-paper-dark)] px-[18px] py-3 text-[11px] text-[color:var(--color-ink-faded)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {/* Keyboard hints — desktop only. On mobile the paper surface is tight. */}
        <div className="hidden flex-wrap gap-5 md:flex">
          <span className="flex items-center gap-1.5">
            <Kbd>TAB</Kbd>
            <span className="text-[color:var(--color-ink)]/60">next field</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>⏎</Kbd>
            <span className="text-[color:var(--color-ink)]/60">continue</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>⌘</Kbd> <Kbd>←</Kbd>
            <span className="text-[color:var(--color-ink)]/60">back</span>
          </span>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4 md:flex-initial">
          <span
            style={{ color: statusColor, fontFamily: "var(--font-display)", fontStyle: "italic" }}
            className="text-[13px]"
          >
            {statusText}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              disabled={isFirst}
              className="group inline-flex items-center gap-1 text-[12px] uppercase tracking-[0.14em] text-[color:var(--color-ink)] underline underline-offset-4 decoration-[1.5px] transition-colors duration-150 hover:text-[color:var(--color-marker)] hover:decoration-[color:var(--color-marker)] hover:[text-decoration-style:wavy] disabled:cursor-not-allowed disabled:opacity-30 disabled:no-underline"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              ← back
            </button>
            {onNext && (
              <button
                type="button"
                onClick={onNext}
                className="group inline-flex cursor-pointer items-center gap-2 border-2 border-[color:var(--color-ink)] bg-[color:var(--color-ink)] px-4 py-2 text-[color:var(--color-paper)] shadow-[4px_4px_0_var(--highlight)] transition-[transform,box-shadow] duration-150 ease-out hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--highlight)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-[0_0_0_var(--highlight)] active:duration-75"
                style={{ fontFamily: "var(--font-archivo)", fontSize: 13, letterSpacing: "0.02em" }}
              >
                NEXT
                <span className="text-[16px] leading-[0] transition-transform duration-150 group-hover:translate-x-0.5">
                  →
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
  ```

  Notes:
  - Valid state color is a muted forest green (`#3a7d5c`) rather than the old tech-ok green — better tonal fit with paper.
  - Back button adopts the "See LakerWatch" wavy-underline idiom from the hero.
  - Next button uses the signature `shadow-[4px_4px_0_var(--highlight)]` offset-shadow pattern (slightly smaller than the hero's `6px` because it's a secondary CTA).
  - Status text renders in Fraunces italic, as per the spec (Section 2 · StatusBar middle).

- [ ] **Step 4.2 — Lint & build**

  ```bash
  cd C:/Dev/schoolwatch-wizard && npm run lint && npm run build
  ```

  Expected: both pass.

- [ ] **Step 4.3 — Commit**

  ```bash
  cd C:/Dev/schoolwatch-wizard
  git add components/wizard/StatusBar.tsx
  git commit -m "style: reskin StatusBar with paper bg, ink+highlight CTA, wavy-underline back"
  ```

---

## Task 5: Remove persistent sidebar from `WizardShell`, restyle error panel

This task collapses the two-pane layout to single-pane full-width and rewrites the error-panel styling. `ConfigPreview` relocates to Task 13 (Review step).

**Files:**
- Modify: `C:\Dev\schoolwatch-wizard\components\WizardShell.tsx` (remove import line 9; replace render block 172–227; rewrite error boundary fallback 82–99)

- [ ] **Step 5.1 — Remove ConfigPreview import**

  In `components/WizardShell.tsx`, delete line 9:

  ```tsx
  import ConfigPreview from "@/components/wizard/ConfigPreview";
  ```

- [ ] **Step 5.2 — Rewrite the main render block (lines 172–227)**

  Replace everything from `return (` through the closing `);` at the end of the component with:

  ```tsx
  return (
    <div className="theme-zine flex min-h-screen flex-col bg-[color:var(--paper)] text-[color:var(--color-ink)]">
      <WizardTopBar />
      <ProgressStrip
        current={currentStep}
        total={totalSteps}
        label={STEPS[currentStep].toLowerCase()}
      />

      {/* Single-pane layout. Each step's body handles its own max-width + decoration. */}
      <main className="flex-1 px-6 py-10 sm:px-8 md:px-10 lg:px-14">
        <div className="mx-auto max-w-[1120px]">
          <StepErrorBoundary stepIndex={currentStep} key={currentStep}>
            <StepComponent key={currentStep} data={data} onChange={setData} schoolId={schoolId} />
          </StepErrorBoundary>

          {showErrors && errors.length > 0 && (
            <div
              className="mt-10 border-l-[3px] border-[color:var(--color-marker)] bg-[color:var(--color-marker)]/5 px-5 py-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <p
                className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-marker)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                fix the following
              </p>
              <ul className="space-y-1.5">
                {errors.map((err, i) => (
                  <li
                    key={i}
                    className="text-[15px] italic text-[color:var(--color-ink-soft)]"
                  >
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

      <StatusBar
        status={status}
        statusText={statusText}
        onBack={handleBack}
        onNext={isLast ? undefined : handleNext}
        isFirst={isFirst}
      />
    </div>
  );
  ```

- [ ] **Step 5.3 — Rewrite the StepErrorBoundary fallback (lines 82–99)**

  Replace the `render()` return block inside `StepErrorBoundary` with:

  ```tsx
  render() {
    if (this.state.error) {
      return (
        <div
          className="border-l-[3px] border-[color:var(--color-marker)] bg-[color:var(--color-marker)]/5 p-6"
        >
          <p
            className="mb-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-marker)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            step failed to render
          </p>
          <p
            className="break-all text-[15px] italic text-[color:var(--color-ink-soft)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {this.state.error.message}
          </p>
          <p
            className="mt-3 text-[11px] text-[color:var(--color-ink-faded)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            check browser console for full stack trace
          </p>
        </div>
      );
    }
    return this.props.children;
  }
  ```

- [ ] **Step 5.4 — Lint & build**

  ```bash
  cd C:/Dev/schoolwatch-wizard && npm run lint && npm run build
  ```

  Expected: both pass. The wizard pages (still-unstyled step bodies) will render on paper now with chrome looking correct.

- [ ] **Step 5.5 — Visual spot check**

  Run `npm run dev`, open `/setup`, confirm:
  - Topbar is an ink strip at top.
  - Progress strip is paper-dark with bell cells below the topbar.
  - Step body area is full-width, no right sidebar.
  - Bottom status bar is paper-dark with wavy-underline Back and ink-with-yellow-shadow Next.
  - Step content itself is still the old terminal styling (fixed in subsequent tasks).
  
  Stop dev server.

- [ ] **Step 5.6 — Commit**

  ```bash
  cd C:/Dev/schoolwatch-wizard
  git add components/WizardShell.tsx
  git commit -m "refactor: single-pane wizard layout, zine error panel, drop ConfigPreview sidebar"
  ```

---

## Task 6: Rewrite `StepSchoolInfo`

This task establishes the **step body pattern** that Tasks 7–11 follow. Read this task in full before starting any subsequent step task — it defines the kicker / headline / subcopy / form-row / margin-note idiom used everywhere.

**Files:**
- Rewrite: `C:\Dev\schoolwatch-wizard\components\wizard\StepSchoolInfo.tsx`

- [ ] **Step 6.1 — Read the current file to extract handler logic**

  Read `C:\Dev\schoolwatch-wizard\components\wizard\StepSchoolInfo.tsx` in full. Note:
  - `handleLogoUpload`, `removeLogo`, `handleNameChange`, `updateSchool` — **preserve verbatim**, these carry auto-derive logic (short name, acronym, etc.) that users rely on.
  - `fileRef`, `nameRef`, auto-focus effect — **preserve**.
  - The `StepProps` type + export signature — **preserve**.

- [ ] **Step 6.2 — Rewrite the file**

  Replace the entire contents of `components/wizard/StepSchoolInfo.tsx` with the following. Preserve the existing state/handler logic inside `StepSchoolInfo` (copy it verbatim from the current file); only the JSX and styling change.

  ```tsx
  "use client";

  import { useCallback, useEffect, useRef } from "react";
  import Image from "next/image";
  import type { WizardFormData } from "@/lib/types";

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

  export default function StepSchoolInfo({ data, onChange }: StepProps) {
    const school = data.school;
    const nameRef = useRef<HTMLInputElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => { nameRef.current?.focus(); }, []);

    function updateSchool(patch: Partial<WizardFormData["school"]>) {
      onChange({ ...data, school: { ...school, ...patch } });
    }

    const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
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

    function handleNameChange(name: string) {
      const patch: Partial<WizardFormData["school"]> = { name };
      const prevDerived = school.name.split(" ").slice(0, 2).join(" ");
      if (!school.shortName || school.shortName === prevDerived) {
        patch.shortName = name.split(" ").slice(0, 2).join(" ");
      }
      const prevAcronym = school.name
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");
      if (!school.acronym || school.acronym === prevAcronym) {
        patch.acronym = name
          .split(/\s+/)
          .filter(Boolean)
          .map((w) => w[0]?.toUpperCase() ?? "")
          .join("");
      }
      updateSchool(patch);
    }

    return (
      <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div>
          <p className={kickerCls} style={kickerFont}>
            step 01 / school info
          </p>
          <h1 className={headlineCls} style={headlineFont}>
            Tell us about the <span style={italicAccent}>school.</span>
          </h1>
          <p className={subcopyCls} style={subcopyFont}>
            Name, mascot, location. This shows up in the tab title, headings, and the URL — you can edit it later.
          </p>

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
                  className="flex h-[120px] w-[180px] cursor-pointer flex-col items-center justify-center border-2 border-dashed border-[color:var(--color-ink)] text-center transition-colors hover:bg-[color:var(--color-ink)]/5"
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <span
                    className="text-[color:var(--color-ink)]"
                    style={{ fontFamily: "var(--font-caveat)", fontSize: 22, transform: "rotate(-2deg)" }}
                  >
                    drop logo here ↙
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
  ```

  Notes:
  - The `kickerCls` / `headlineCls` / `subcopyCls` / `labelCls` / `underlineInputCls` string constants at the top of this file establish the **step body pattern**. Tasks 7–11 should copy these constants to the top of each step file verbatim — DRY-at-the-file level, not extracted to a shared module (keeps each step standalone and editable).
  - The `<aside>` margin-note block uses inline styles to match the homepage `MarginNote` component's aesthetic without importing it (the homepage version has a fixed `h4 + p` shape that doesn't fit a single-tip call-out).

- [ ] **Step 6.3 — Lint & build**

  ```bash
  cd C:/Dev/schoolwatch-wizard && npm run lint && npm run build
  ```

  Expected: both pass.

- [ ] **Step 6.4 — Visual check**

  `npm run dev` → `/setup`. Confirm:
  - Kicker "step 01 / school info" in mono.
  - Headline "Tell us about the *school.*" with "school." in serif italic.
  - All underline inputs work, auto-derive of short name and acronym still fires when typing the school name.
  - Logo upload shows dashed ink rectangle with Caveat hint. After uploading, preview polaroid appears with 2° rotation.
  - Margin note "1" in red Caveat hangs in the right rail on desktop.

  Stop dev server.

- [ ] **Step 6.5 — Commit**

  ```bash
  cd C:/Dev/schoolwatch-wizard
  git add components/wizard/StepSchoolInfo.tsx
  git commit -m "style: rewrite StepSchoolInfo in zine language"
  ```

---

## Task 7: Rewrite `StepColors`

**Files:**
- Rewrite: `C:\Dev\schoolwatch-wizard\components\wizard\StepColors.tsx`

- [ ] **Step 7.1 — Read the current file and inventory logic**

  Read the full file first. Identify and preserve verbatim:
  - The override-tracking `Set<string>` state and all derivation calls (`defaultLightColors`, `deriveDarkColors`, `resolveDarkColors` from `lib/colors.ts`).
  - The handler that updates primary/accent seeds and recomputes non-overridden zones.
  - The `DashboardPreview` import.
  - Dark-mode toggle logic (if present).

- [ ] **Step 7.2 — Rewrite the file**

  Replace with a component that:

  1. Copies the `kickerCls` / `headlineCls` / `subcopyCls` / `labelCls` / `underlineInputCls` constants and font style objects from Task 6 (Step 6.2) to the top of this file.
  2. Imports `TapedScreenshot` from `@/components/landing/TapedScreenshot`.
  3. Header: kicker `step 02 / colors`, headline `Pick the <span italic>palette.</span>`, subcopy describing seeds → zones.
  4. **Seeds row** — two large swatches side-by-side, each a `w-24 h-24` square with a 2px ink border, hex typed in mono beside it. Use native `<input type="color">` hidden behind the swatch; the swatch itself is an ink-bordered square rendering the color.

     ```tsx
     <div className="flex items-center gap-6">
       <label className="flex cursor-pointer items-center gap-4">
         <span
           className="block h-24 w-24 border-2 border-[color:var(--color-ink)]"
           style={{ background: colors.primary }}
         />
         <input
           type="color"
           value={colors.primary}
           onChange={handlePrimaryChange}
           className="hidden"
         />
         <div>
           <p className={labelCls} style={labelFont}>Primary seed</p>
           <p className="text-[15px] text-[color:var(--color-ink)]" style={{ fontFamily: "var(--font-mono)" }}>{colors.primary}</p>
         </div>
       </label>
       {/* Identical block for accent */}
     </div>
     ```

  5. **Zone overrides** — a dashed-rule list. One row per zone in `(navbar, navText, background, heading, ring, surface, cardAccent, badge)` order. Each row:

     ```tsx
     <div className="flex items-center justify-between gap-4 border-b border-dashed border-[color:var(--color-hairline)] py-3">
       <div>
         <p className="text-[13px] text-[color:var(--color-ink)]" style={{ fontFamily: "var(--font-mono)" }}>{zone}</p>
         {isOverridden(zone) && (
           <p className="text-[11px] italic text-[color:var(--color-marker)]" style={{ fontFamily: "var(--font-display)" }}>custom</p>
         )}
       </div>
       <label className="flex cursor-pointer items-center gap-2">
         <span
           className="block h-8 w-8 border border-[color:var(--color-ink)]"
           style={{ background: colors.light[zone] }}
         />
         <input type="color" value={colors.light[zone]} onChange={handleZoneChange(zone)} className="hidden" />
         <span className="text-[12px] text-[color:var(--color-ink-faded)]" style={{ fontFamily: "var(--font-mono)" }}>{colors.light[zone]}</span>
         {isOverridden(zone) && (
           <button
             type="button"
             onClick={resetZone(zone)}
             className="ml-2 text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink)] underline underline-offset-2 hover:text-[color:var(--color-marker)]"
             style={{ fontFamily: "var(--font-mono)" }}
           >
             reset
           </button>
         )}
       </label>
     </div>
     ```

  6. **Dashboard preview**, wrapped in `TapedScreenshot`:

     ```tsx
     <TapedScreenshot
       rotation={-1.5}
       tapes={[
         { position: "top-left", color: "yellow" },
         { position: "top-right", color: "red" },
       ]}
     >
       <DashboardPreview colors={colors} />
     </TapedScreenshot>
     ```

     Place this on the right on `lg:` breakpoints using a `grid-cols-[minmax(0,1fr)_420px]` layout (so the form is on the left, preview pinned right); stacks below on smaller screens.

  7. **Margin note** — "Pick one strong color and one quiet one. The preview on the right updates live — tweak until it looks like you."

  8. **Preserve** the dark-mode preview behavior if it exists in the current file. If a toggle is present, restyle it as a pair of ink-bordered chip toggles (`Light` / `Dark`) below the preview.

- [ ] **Step 7.3 — Lint & build**

  ```bash
  cd C:/Dev/schoolwatch-wizard && npm run lint && npm run build
  ```

- [ ] **Step 7.4 — Visual check**

  `/setup` → Next into Colors step. Confirm:
  - Two seed swatches clickable, open native color picker, update all non-overridden zones live.
  - Zone rows show dashed separators, color squares, hex text.
  - Overridden zones show "custom" italic label + "reset" link.
  - Live `DashboardPreview` inside a taped screenshot frame, slightly rotated.

  Stop dev server.

- [ ] **Step 7.5 — Commit**

  ```bash
  cd C:/Dev/schoolwatch-wizard
  git add components/wizard/StepColors.tsx
  git commit -m "style: rewrite StepColors in zine language; wrap DashboardPreview in TapedScreenshot"
  ```

---

## Task 8: Rewrite `StepSchedule`

**Files:**
- Rewrite: `C:\Dev\schoolwatch-wizard\components\wizard\StepSchedule.tsx`

- [ ] **Step 8.1 — Read the current file and inventory logic**

  Preserve verbatim:
  - `dayTypes` + `bells` shape (`data.schedule.dayTypes[]` and `data.schedule.bells[dayTypeId]`).
  - All add/remove/rename handlers for day types, bell periods, after-school events.
  - The distinction between `shared` bells and per-wave bells (lunchWaves-driven).

- [ ] **Step 8.2 — Rewrite the file**

  Use the same top-of-file constants as Task 6. Structure:

  1. Kicker `step 03 / schedule`, headline `Build the <span italic>schedule.</span>`, subcopy about day types and bells.

  2. **Day-types row** — horizontal list of chip toggles, one per day type. Each chip:

     ```tsx
     <button
       type="button"
       onClick={() => setActiveDayType(dt.id)}
       className={`border-[1.5px] border-[color:var(--color-ink)] px-3 py-1.5 text-[12px] uppercase tracking-[0.14em] transition-colors ${
         isActive
           ? "bg-[color:var(--color-ink)] text-[color:var(--color-paper)]"
           : "bg-[color:var(--color-paper)] text-[color:var(--color-ink)] hover:bg-[color:var(--color-ink)]/5"
       }`}
       style={{ fontFamily: "var(--font-mono)" }}
     >
       {dt.label}
     </button>
     ```

     After the chips, an `+ add day type` ghost button in the same row.

  3. **Weekday selector** for the active day type — row of 7 small square toggles (`S M T W T F S`), each a 32x32 ink-bordered square that fills with `--highlight` when selected. Reuses the mini-grid idiom from `ZineHero.tsx:130-141`.

  4. **Bell periods table** — ruled rows with dashed separators. Columns: period name (underline input on a smaller font), start time (`<input type="time">` styled as underline), end time (`<input type="time">` underline), remove button (ghost underline `remove`).

     ```tsx
     <div className="space-y-0">
       <div className="flex items-center gap-4 border-b border-[color:var(--color-ink)] py-2">
         <span className="flex-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-faded)]" style={{ fontFamily: "var(--font-mono)" }}>Period</span>
         <span className="w-28 text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-faded)]" style={{ fontFamily: "var(--font-mono)" }}>Start</span>
         <span className="w-28 text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-faded)]" style={{ fontFamily: "var(--font-mono)" }}>End</span>
         <span className="w-20" />
       </div>
       {bells.map((b, i) => (
         <div key={i} className="flex items-center gap-4 border-b border-dashed border-[color:var(--color-hairline)] py-2">
           <input className="flex-1 border-0 bg-transparent text-[16px] text-[color:var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }} value={b.name} onChange={...} />
           <input type="time" className="w-28 border-0 bg-transparent text-[15px] text-[color:var(--color-ink)]" style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }} value={b.start} onChange={...} />
           <input type="time" className="w-28 border-0 bg-transparent text-[15px] text-[color:var(--color-ink)]" style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }} value={b.end} onChange={...} />
           <button type="button" onClick={() => removePeriod(i)} className="w-20 text-[11px] uppercase text-[color:var(--color-ink-faded)] underline hover:text-[color:var(--color-marker)]" style={{ fontFamily: "var(--font-mono)" }}>remove</button>
         </div>
       ))}
     </div>
     ```

     Under the list, an `+ add period` ghost button.

  5. **After-school periods** — separate collapsed section under a mono uppercase section label `after school`, same table idiom.

  6. **Margin note** — "Regular day covers most weeks. Add a second day type for early dismissals, pep rally schedules, etc."

- [ ] **Step 8.3 — Lint & build**

  ```bash
  cd C:/Dev/schoolwatch-wizard && npm run lint && npm run build
  ```

- [ ] **Step 8.4 — Visual check**

  `/setup` → Next twice. Confirm: adding/removing day types works, period rows editable, time inputs accept input, remove buttons work, after-school section toggles.

- [ ] **Step 8.5 — Commit**

  ```bash
  cd C:/Dev/schoolwatch-wizard
  git add components/wizard/StepSchedule.tsx
  git commit -m "style: rewrite StepSchedule in zine language with ruled bell tables"
  ```

---

## Task 9: Rewrite `StepLunchWaves`

**Files:**
- Rewrite: `C:\Dev\schoolwatch-wizard\components\wizard\StepLunchWaves.tsx`

- [ ] **Step 9.1 — Read the current file and inventory logic**

  Preserve the enable/disable toggle state, wave-list mutation, per-wave bell override handlers, default-wave selector.

- [ ] **Step 9.2 — Rewrite the file**

  Structure:

  1. Standard header (kicker `step 04 / lunch waves`, headline with italic accent, subcopy).

  2. **Enable toggle** — large ink checkbox card. This is the `InkCheckboxCard` pattern — Task 11 reuses the exact same markup:

     ```tsx
     <button
       type="button"
       onClick={() => toggleEnabled()}
       className="flex w-full items-center gap-5 border-2 border-[color:var(--color-ink)] bg-[color:var(--color-paper)] p-5 text-left transition-colors hover:bg-[color:var(--color-ink)]/5"
     >
       <span
         className="flex h-8 w-8 items-center justify-center border-2 border-[color:var(--color-ink)]"
         style={{ background: enabled ? "var(--highlight)" : "transparent" }}
       >
         {enabled && (
           <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
             <path d="M3 8.5L6.5 12L13 4" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
           </svg>
         )}
       </span>
       <div>
         <p className="text-[17px] font-semibold text-[color:var(--color-ink)]" style={{ fontFamily: "var(--font-archivo)" }}>Use lunch waves</p>
         <p className="text-[14px] italic text-[color:var(--color-ink-soft)]" style={{ fontFamily: "var(--font-display)" }}>Some schools split lunch across multiple rotations. Enable this if yours does.</p>
       </div>
     </button>
     ```

  3. When enabled, render the wave list — each wave is a ruled block:

     ```tsx
     <div className="border-l-[3px] border-[color:var(--color-ink)] pl-5 py-3 mt-6">
       <div className="flex items-center gap-3">
         <input className="flex-1 border-0 border-b-[1.5px] border-[color:var(--color-ink)] bg-transparent text-[20px] text-[color:var(--color-ink)]" style={{ fontFamily: "var(--font-archivo)" }} value={wave.name} onChange={...} />
         <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faded)]" style={{ fontFamily: "var(--font-mono)" }}>
           <input type="radio" name="default-wave" checked={isDefault} onChange={...} className="accent-[color:var(--color-marker)]" />
           default
         </label>
         <button type="button" onClick={() => removeWave(wave.id)} className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faded)] underline hover:text-[color:var(--color-marker)]" style={{ fontFamily: "var(--font-mono)" }}>remove</button>
       </div>

       {/* Per-wave bell override rows — copy the bell-period row markup from
           Task 8 Step 8.2 item 4 verbatim, substituting wave-scoped handlers
           (`updateWaveBell(wave.id, i, ...)` / `removeWaveBell(wave.id, i)`). */}
       <div className="mt-4 space-y-0">
         {wave.bells.map(/* same row structure as StepSchedule bell-period row */)}
       </div>
       <button type="button" onClick={...} className="mt-3 text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink)] underline" style={{ fontFamily: "var(--font-mono)" }}>+ add period override</button>
     </div>
     ```

     After the list, `+ add wave` ghost button.

  4. Margin note — "Most schools don't need this. Skip if lunch is one shared period across all students."

- [ ] **Step 9.3 — Lint, build, visual check, commit**

  ```bash
  cd C:/Dev/schoolwatch-wizard && npm run lint && npm run build
  ```

  Visually verify enable/disable, wave rename, default selection, add/remove works.

  ```bash
  git add components/wizard/StepLunchWaves.tsx
  git commit -m "style: rewrite StepLunchWaves in zine language"
  ```

---

## Task 10: Rewrite `StepCalendar`

**Files:**
- Rewrite: `C:\Dev\schoolwatch-wizard\components\wizard\StepCalendar.tsx`

- [ ] **Step 10.1 — Read the current file and inventory logic**

  Preserve the three lists (`noSchoolDates`, `earlyDismissalDates`, `events`) and their add/remove handlers. Events have additional fields (name, description, possibly a date range).

- [ ] **Step 10.2 — Rewrite the file**

  Structure:

  1. Standard header (kicker `step 05 / calendar`, headline with italic accent, subcopy).

  2. Three stacked sections, each separated by a dashed hairline and a mono section label:
     - `no school`
     - `early dismissal`
     - `events`

  3. **Date row** — index-card style:

     ```tsx
     <div
       className="relative flex items-center gap-5 bg-white border border-[color:var(--color-hairline)] shadow-[0_4px_12px_rgba(26,26,26,0.06)] px-5 py-3 mb-3"
       style={{ transform: index % 3 === 2 ? "rotate(1deg)" : undefined }}
     >
       <input
         type="date"
         value={d.date}
         onChange={...}
         className="border-0 bg-transparent text-[20px] text-[color:var(--color-ink)]"
         style={{ fontFamily: "var(--font-archivo)" }}
       />
       <input
         type="text"
         placeholder="Reason (optional)"
         value={d.label}
         onChange={...}
         className="flex-1 border-0 bg-transparent text-[15px] italic text-[color:var(--color-ink-soft)]"
         style={{ fontFamily: "var(--font-display)" }}
       />
       <button type="button" onClick={() => removeDate(i)} className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faded)] underline hover:text-[color:var(--color-marker)]" style={{ fontFamily: "var(--font-mono)" }}>remove</button>
     </div>
     ```

     Every third card (index `% 3 === 2`) gets a `rotate(1deg)` transform for handmade variation.

  4. After each section's list, a `+ add date` (or `+ add event`) ghost button.

  5. **Events** get an extra description field on a second line (Fraunces italic, underline).

  6. Margin note — "You can always add more dates after you deploy. The 10 biggest breaks of the year is a reasonable start."

- [ ] **Step 10.3 — Lint, build, visual check, commit**

  ```bash
  cd C:/Dev/schoolwatch-wizard && npm run lint && npm run build
  ```

  ```bash
  git add components/wizard/StepCalendar.tsx
  git commit -m "style: rewrite StepCalendar as index-card stacks in zine language"
  ```

---

## Task 11: Rewrite `StepFeatures`

**Files:**
- Rewrite: `C:\Dev\schoolwatch-wizard\components\wizard\StepFeatures.tsx`

- [ ] **Step 11.1 — Read the current file**

  Preserve the `features.events` and `features.productivity` booleans + toggle handlers.

- [ ] **Step 11.2 — Rewrite the file**

  Copy the step-body pattern constants from Task 6 Step 6.2 to the top of the file. Two toggle cards stacked. Each card uses the `InkCheckboxCard` pattern shown explicitly below (identical structure to Task 9 Step 9.2 item 2):

  ```tsx
  <button
    type="button"
    onClick={() => toggleFeature("events")}
    className="flex w-full items-center gap-5 border-2 border-[color:var(--color-ink)] bg-[color:var(--color-paper)] p-5 text-left transition-colors hover:bg-[color:var(--color-ink)]/5"
  >
    <span
      className="flex h-8 w-8 items-center justify-center border-2 border-[color:var(--color-ink)]"
      style={{ background: data.features.events ? "var(--highlight)" : "transparent" }}
    >
      {data.features.events && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3 8.5L6.5 12L13 4" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
    <div>
      <p className="text-[18px] font-semibold text-[color:var(--color-ink)]" style={{ fontFamily: "var(--font-archivo)" }}>Events</p>
      <p className="text-[14px] italic text-[color:var(--color-ink-soft)]" style={{ fontFamily: "var(--font-display)" }}>Show upcoming school events on the dashboard. Reads from the calendar you just set up.</p>
    </div>
  </button>
  ```

  Render a second identical card for `productivity` with the copy "Show a small focus timer and to-do list widget on the dashboard sidebar." and `data.features.productivity` as the checked binding.

  Preserve the existing `toggleFeature` handler (or whatever the current file calls it — check the file before rewriting).

  Margin note in the right rail — "Both features can be toggled later without redeploying. Flip them on to see how they look; flip them off if they feel like clutter." (Use the same `<aside>` markup from Task 6 Step 6.2, substituting `2` for the number and this copy.)

- [ ] **Step 11.3 — Lint, build, visual check, commit**

  ```bash
  cd C:/Dev/schoolwatch-wizard && npm run lint && npm run build
  ```

  ```bash
  git add components/wizard/StepFeatures.tsx
  git commit -m "style: rewrite StepFeatures as big ink-checkbox toggle cards"
  ```

---

## Task 12: Rewrite `ConfigPreview` as a printed-report card

**Files:**
- Rewrite: `C:\Dev\schoolwatch-wizard\components\wizard\ConfigPreview.tsx`

This component no longer has a sidebar to live in — it renders inside the Review step (Task 13) behind a disclosure. The tokenizer/highlight/scroll logic is removed; the printed-report aesthetic is just plain mono ink on paper.

- [ ] **Step 12.1 — Rewrite the file**

  Replace the entire contents of `components/wizard/ConfigPreview.tsx` with:

  ```tsx
  "use client";

  import type { WizardFormData } from "@/lib/types";
  import { generateConfigTs } from "@/lib/config-generator";

  // Printed-report card: renders the generated school.config.ts as plain mono ink on paper.
  // No syntax colorization — the density alone reads as a printed listing.
  // The `activeStep` prop is retained for API compatibility but ignored; this component
  // now only appears on the Review step (see StepReview), where highlighting per-step
  // is not meaningful.
  type Props = {
    data: WizardFormData;
    activeStep?: number;
  };

  export default function ConfigPreview({ data }: Props) {
    const source = generateConfigTs(data);

    return (
      <div className="relative mt-6 bg-white border border-[color:var(--color-ink)] p-5 shadow-[4px_4px_0_var(--highlight)]">
        <span
          aria-hidden="true"
          className="absolute right-4 top-2 leading-none"
          style={{
            fontFamily: "var(--font-caveat)",
            fontSize: 16,
            color: "var(--ink-soft)",
            transform: "rotate(2deg)",
          }}
        >
          school.config.ts
        </span>
        <pre
          className="overflow-x-auto whitespace-pre text-[12px] leading-[1.65] text-[color:var(--color-ink)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {source}
        </pre>
      </div>
    );
  }
  ```

  Notes:
  - No tokenizer, no anchors, no scroll effect, no caret animation — all removed.
  - The `activeStep` prop is marked optional and unused. This keeps callers from needing updates if any still pass it (only `StepReview` will after Task 13).

- [ ] **Step 12.2 — Lint & build**

  ```bash
  cd C:/Dev/schoolwatch-wizard && npm run lint && npm run build
  ```

- [ ] **Step 12.3 — Commit**

  ```bash
  cd C:/Dev/schoolwatch-wizard
  git add components/wizard/ConfigPreview.tsx
  git commit -m "refactor: simplify ConfigPreview to printed-report card (no tokenizer, no highlight)"
  ```

---

## Task 13: Rewrite `StepReview`

**Files:**
- Rewrite: `C:\Dev\schoolwatch-wizard\components\wizard\StepReview.tsx`

- [ ] **Step 13.1 — Read the current file and inventory logic**

  Preserve:
  - The `handleDeploy` (or `handleSubmit`) function that `POST`s to `/api/deploy` (or `/api/redeploy` when `schoolId` is present).
  - `DeployState` management and integration with `DeployLog`.
  - The `isEditMode` branch (based on `schoolId` prop).
  - `SectionLabel` component reference if it exists; if not, inline the mono uppercase label idiom.

- [ ] **Step 13.2 — Rewrite the file**

  Structure:

  1. Standard header — kicker `step 07 / review & deploy`, headline `<span italic>One more</span> look.`, subcopy "If everything below looks right, hit Deploy. We'll create the repo, wire up Vercel, and email you a magic link in about a minute."

  2. **Summary sections** — stacked, each separated by a dashed hairline and a mono uppercase `SectionLabel`:
     - `school` — name, mascot, city/state, academic year
     - `colors` — primary + accent swatches (small `w-8 h-8` ink-bordered squares), count of zone overrides
     - `schedule` — day-type labels, period count per day type
     - `lunch waves` — enabled/disabled, list of wave names
     - `calendar` — count of no-school, early-dismissal, events
     - `features` — list of enabled feature names

     Each section renders values in Fraunces italic 15px on ink-soft, with the section label in mono uppercase 11px tracking `0.18em` ink-faded above. If `SectionLabel` already exists in the file, keep it and restyle in place.

  3. **Generated config disclosure** — a `<details>` element. Summary is a mono uppercase pill: `view generated config ↓` (animates to `↑` when open). Inside: `<ConfigPreview data={data} />`.

     ```tsx
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
     ```

  4. **Deploy CTA** — hero-sized ink button with yellow shadow, full-width on mobile, inline on desktop:

     ```tsx
     <button
       type="button"
       onClick={handleDeploy}
       disabled={deployState !== "idle" && deployState !== "error"}
       className="group mt-10 inline-flex w-full items-center justify-center gap-2.5 border-2 border-[color:var(--color-ink)] bg-[color:var(--color-ink)] px-7 py-4 text-[color:var(--color-paper)] shadow-[6px_6px_0_var(--highlight)] transition-[transform,box-shadow] duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_var(--highlight)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-[0_0_0_var(--highlight)] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
       style={{ fontFamily: "var(--font-archivo)", fontSize: 16 }}
     >
       {isEditMode ? "Redeploy" : "Deploy"}
       <span className="text-[22px] leading-[0] transition-transform group-hover:translate-x-1">→</span>
     </button>
     ```

  5. **Deploy log** — render `<DeployLog ... />` below the button, inheriting its (zine-styled) appearance from Task 14.

  6. No margin note on this step — the content density is high and the page is the final commitment, not a teaching moment.

- [ ] **Step 13.3 — Lint, build, visual check, commit**

  ```bash
  cd C:/Dev/schoolwatch-wizard && npm run lint && npm run build
  ```

  Visually verify: summary renders all seven sections, disclosure toggles config preview, deploy button has yellow offset shadow + press-in animation, `isEditMode` variation (when testing `/edit` with a valid session) shows "Redeploy" and skips the log rows that don't apply.

  ```bash
  git add components/wizard/StepReview.tsx
  git commit -m "style: rewrite StepReview with zine summary cards and hero deploy CTA"
  ```

---

## Task 14: Rewrite `DeployLog` in zine language

The current `DeployLog` is a scrolling terminal log with colored bullets. Keep the log aesthetic (it's charming and accurate to what's happening) but port it to paper.

**Files:**
- Rewrite: `C:\Dev\schoolwatch-wizard\components\wizard\DeployLog.tsx`

- [ ] **Step 14.1 — Read the existing file**

  Preserve verbatim:
  - The `DeployState` union export.
  - The `Props` type including `url?`, `error?`, `isEditMode?`.
  - The `STAGE_LINES_NEW` and `STAGE_LINES_EDIT` tables (exact copy).
  - The `PENDING_LABEL` map.
  - The `entries` state and append-on-state-change effects.
  - Auto-scroll behavior.
  - The `idle` early-return guard.

- [ ] **Step 14.2 — Rewrite the render block**

  Replace only the `return (...)` block at the bottom of `DeployLog` with:

  ```tsx
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
  ```

  Notes:
  - The checkmark ✓ stays green (muted forest `#3a7d5c`) so completed steps scan at a glance.
  - The ✗ marker for errors uses `--marker` red.
  - The info lines use `--ink-soft` to recede into the paper.
  - The pending-label row uses Fraunces italic (the waiting state is the emotional one; serif italic feels less mechanical than mono).
  - The outer container uses `bg-white` (crisp "receipt paper" inside the softer cream body) with a hairline border.

- [ ] **Step 14.3 — Lint & build**

  ```bash
  cd C:/Dev/schoolwatch-wizard && npm run lint && npm run build
  ```

- [ ] **Step 14.4 — Commit**

  ```bash
  cd C:/Dev/schoolwatch-wizard
  git add components/wizard/DeployLog.tsx
  git commit -m "style: reskin DeployLog as paper receipt with zine typography"
  ```

---

## Task 15: Rewrite `login` page

**Files:**
- Rewrite: `C:\Dev\schoolwatch-wizard\app\login\page.tsx`

- [ ] **Step 15.1 — Rewrite the file**

  Replace the entire contents with:

  ```tsx
  "use client";

  import { useState } from "react";
  import WizardTopBar from "@/components/wizard/WizardTopBar";

  type Status = "idle" | "sending" | "sent" | "error";

  export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<Status>("idle");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      if (!email.trim() || status === "sending") return;

      setStatus("sending");
      setError("");

      try {
        const res = await fetch("/api/auth/send-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim() }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(
            body?.error === "School not found"
              ? "No school found with that email. Use the email you entered when setting up your dashboard."
              : body?.error ?? "Something went wrong"
          );
        }

        setStatus("sent");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setStatus("error");
      }
    }

    return (
      <div className="theme-zine flex min-h-screen flex-col bg-[color:var(--paper)] text-[color:var(--color-ink)]">
        <WizardTopBar />

        <main className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="w-full max-w-[440px]">
            <p
              className="mb-3 text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink-faded)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              magic link · no passwords
            </p>
            <h1
              className="mb-2 font-[900] leading-[0.95] tracking-[-0.02em] text-[color:var(--color-ink)]"
              style={{ fontFamily: "var(--font-archivo)", fontSize: "clamp(36px, 5vw, 52px)" }}
            >
              Edit your{" "}
              <span
                className="italic font-normal"
                style={{ fontFamily: "var(--font-display)" }}
              >
                SchoolWatch.
              </span>
            </h1>
            <p
              className="mt-4 text-[15px] leading-[1.55] text-[color:var(--color-ink-soft)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Enter the email you used when setting up your dashboard. We&apos;ll send you a login link that expires in 15 minutes.
            </p>

            {status === "sent" ? (
              <div
                className="mt-10 border-l-[3px] border-[color:var(--color-ink)] pl-5 py-3"
              >
                <p
                  className="text-[11px] uppercase tracking-[0.18em] text-[#3a7d5c]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  sent
                </p>
                <p
                  className="mt-2 text-[16px] italic leading-[1.5] text-[color:var(--color-ink)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Check your inbox. Link expires in 15 minutes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-faded)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Contact email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@school.edu"
                    className="w-full border-0 border-b-2 border-[color:var(--color-ink)] bg-transparent px-0 py-2 text-[18px] text-[color:var(--color-ink)] placeholder-[color:var(--color-ink-faded)]/60 focus:border-[color:var(--color-marker)] focus:outline-none"
                    style={{ fontFamily: "var(--font-display)" }}
                  />
                </div>

                {status === "error" && (
                  <p
                    className="text-[14px] italic text-[color:var(--color-marker)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending" || !email.trim()}
                  className="group inline-flex w-full items-center justify-center gap-2.5 border-2 border-[color:var(--color-ink)] bg-[color:var(--color-ink)] px-6 py-3.5 text-[color:var(--color-paper)] shadow-[6px_6px_0_var(--highlight)] transition-[transform,box-shadow] duration-150 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-[3px_3px_0_var(--highlight)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-[0_0_0_var(--highlight)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  style={{ fontFamily: "var(--font-archivo)", fontSize: 15, letterSpacing: "0.02em" }}
                >
                  {status === "sending" ? "Sending…" : "Send me a link"}
                  {status !== "sending" && (
                    <span className="text-[20px] leading-[0] transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  )}
                </button>
              </form>
            )}

            <p
              className="mt-12 text-[13px] text-[color:var(--color-ink-soft)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              No dashboard yet?{" "}
              <a
                href="/setup"
                className="text-[color:var(--color-ink)] underline underline-offset-4 decoration-[1.5px] transition-colors hover:text-[color:var(--color-marker)] hover:decoration-[color:var(--color-marker)] hover:[text-decoration-style:wavy]"
              >
                Make one
              </a>
              .
            </p>
          </div>
        </main>
      </div>
    );
  }
  ```

  Handler logic (`handleSubmit`, state management) is preserved verbatim from the original file — only the JSX markup and classes change.

- [ ] **Step 15.2 — Lint, build, visual check, commit**

  ```bash
  cd C:/Dev/schoolwatch-wizard && npm run lint && npm run build
  ```

  Visual check: open `/login`, confirm paper background, Archivo headline with Fraunces italic accent, underline email input, ink button with yellow shadow, wavy-underline "Make one" link. Test sending a magic link (if RESEND_API_KEY is configured) — or at least confirm the sent-state branch renders when you mock the fetch response.

  ```bash
  git add app/login/page.tsx
  git commit -m "style: rewrite login page in zine language"
  ```

---

## Task 16: Verify `edit` and `setup` pages inherit correctly

**Files:**
- Read-only: `C:\Dev\schoolwatch-wizard\app\setup\page.tsx`
- Read-only: `C:\Dev\schoolwatch-wizard\app\edit\page.tsx`

- [ ] **Step 16.1 — Check `setup` page**

  Open `app/setup/page.tsx`. Confirm it renders `<WizardShell steps={steps} />` with no extra wrapper classes. No edit needed (theme wrapper is applied inside `WizardShell`).

- [ ] **Step 16.2 — Check `edit` page**

  Open `app/edit/page.tsx`. Locate any dark-theme wrappers, error fallbacks, or loading states that bypass `WizardShell` (for example, a "verifying token..." screen shown before the shell renders). For each such standalone surface:
  - Wrap the outer `<div>` in `theme-zine` class and swap `bg-[color:var(--background)]` → `bg-[color:var(--paper)]`, `text-[color:var(--color-foreground)]` → `text-[color:var(--color-ink)]`.
  - Rewrite any inline typography to use Archivo Black headlines and Fraunces italic body copy per the established pattern.
  - Error messages in `--marker` with Fraunces italic.

  If there are no such surfaces (i.e., `edit` immediately renders `WizardShell`), no changes are needed — note that in the commit message.

- [ ] **Step 16.3 — Lint, build, visual check**

  ```bash
  cd C:/Dev/schoolwatch-wizard && npm run lint && npm run build
  ```

  Visually verify:
  - `/setup` — full wizard paper aesthetic, all 7 steps render and navigate correctly.
  - `/edit?token=INVALID` — error state uses paper/ink/marker colors, not the old dark aesthetic.

- [ ] **Step 16.4 — Commit (if any changes)**

  ```bash
  cd C:/Dev/schoolwatch-wizard
  git add app/edit/page.tsx
  git commit -m "style: reskin edit-page standalone surfaces in zine language"
  ```

  If no changes were made, skip the commit.

---

## Task 17: Add `motion/react` stagger to step headers

Spec calls for the same stagger entrance as `ZineHero.tsx:10-17` on every step. Applied just to the step header trio (kicker / headline / subcopy) — applying stagger to every form field is scope creep and doesn't serve the content. Keeping this as its own task so reviewers can diff the typography changes (Tasks 6–11) separately from the motion changes.

**Files (modify — add motion import + wrap header elements):**
- `C:\Dev\schoolwatch-wizard\components\wizard\StepSchoolInfo.tsx`
- `C:\Dev\schoolwatch-wizard\components\wizard\StepColors.tsx`
- `C:\Dev\schoolwatch-wizard\components\wizard\StepSchedule.tsx`
- `C:\Dev\schoolwatch-wizard\components\wizard\StepLunchWaves.tsx`
- `C:\Dev\schoolwatch-wizard\components\wizard\StepCalendar.tsx`
- `C:\Dev\schoolwatch-wizard\components\wizard\StepFeatures.tsx`
- `C:\Dev\schoolwatch-wizard\components\wizard\StepReview.tsx`

- [ ] **Step 17.1 — In each step file, add the motion imports and variants**

  At the top of each file (after `"use client"` and existing imports):

  ```tsx
  import { motion, useReducedMotion, type Variants } from "motion/react";

  const headerContainer: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const headerItem: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };
  ```

- [ ] **Step 17.2 — Wrap the header trio in each step**

  In each step's JSX, replace the plain kicker/headline/subcopy:

  ```tsx
  <p className={kickerCls} style={kickerFont}>step NN / ...</p>
  <h1 className={headlineCls} style={headlineFont}>...</h1>
  <p className={subcopyCls} style={subcopyFont}>...</p>
  ```

  with a motion container and three motion children (using the same `reduce` guard as `ZineHero.tsx:21-28`):

  ```tsx
  // At the top of the component body:
  const reduce = useReducedMotion();

  // In JSX:
  <motion.div
    initial={reduce ? false : "hidden"}
    animate="visible"
    variants={headerContainer}
  >
    <motion.p variants={headerItem} className={kickerCls} style={kickerFont}>step NN / ...</motion.p>
    <motion.h1 variants={headerItem} className={headlineCls} style={headlineFont}>...</motion.h1>
    <motion.p variants={headerItem} className={subcopyCls} style={subcopyFont}>...</motion.p>
  </motion.div>
  ```

  This fires when the step mounts. Because `WizardShell` re-keys the step on `currentStep` change (`key={currentStep}` at line 191 post-Task-5), each step navigation triggers a fresh stagger.

- [ ] **Step 17.3 — Lint & build**

  ```bash
  cd C:/Dev/schoolwatch-wizard && npm run lint && npm run build
  ```

- [ ] **Step 17.4 — Visual check**

  `/setup` → tab through steps with Next/Back. Each step mount should have a visible ~0.4s staggered fade-up on its three header elements. Under `prefers-reduced-motion`, elements should appear instantly without motion (verify by enabling the OS-level reduced-motion setting or by temporarily hard-coding `reduce = true`).

- [ ] **Step 17.5 — Commit**

  ```bash
  cd C:/Dev/schoolwatch-wizard
  git add components/wizard/Step*.tsx
  git commit -m "feat: stagger step header entrance on mount via motion/react"
  ```

---

## Task 18: Final verification

- [ ] **Step 18.1 — Full lint + build**

  ```bash
  cd C:/Dev/schoolwatch-wizard && npm run lint && npm run build
  ```

  Both MUST pass cleanly. If lint has warnings tied to the new code, fix them; do not commit new warnings.

- [ ] **Step 18.2 — End-to-end walkthrough**

  ```bash
  cd C:/Dev/schoolwatch-wizard && npm run dev
  ```

  In a browser:
  1. Open `/` — confirm landing page still looks identical to before this PR (no regressions).
  2. Open `/setup` — walk through all 7 steps in order. At each step, confirm:
     - Chrome (topbar, progress strip, status bar) renders correctly.
     - Step headline uses Archivo Black + one Fraunces italic accent word.
     - Kicker uses mono uppercase.
     - Form inputs are underline-style on paper.
     - Margin note (or right-rail tip) is present.
     - Next/Back navigation works.
     - Validation errors (trigger by leaving required fields empty and clicking Next) render as paper-marker-red Fraunces italic.
  3. On Step 2 (Colors): change the primary seed — confirm TapedScreenshot preview updates live.
  4. On Step 3 (Schedule): add a new period, rename it, delete it. Confirm the ruled table behavior.
  5. On Step 7 (Review): confirm summary sections, expand the `view generated config` disclosure, confirm the printed-report card renders the config source. Do NOT click Deploy unless you want to create a real school.
  6. Open `/login` — confirm paper aesthetic, underline input, ink CTA.
  7. Open `/edit` with no token — confirm the gated state is zine-styled.

- [ ] **Step 18.3 — Confirm no terminal tokens remain in wizard code**

  ```bash
  cd C:/Dev/schoolwatch-wizard
  ```

  Use the Grep tool to search the wizard files for retired token references:
  
  - Pattern: `--color-accent|--color-bg-raised|--color-line|--color-text-dim|--color-text-faded|--color-ok|--color-warn|--color-foreground|--bg-input`
  - Path: `components/wizard/` and `components/WizardShell.tsx` and `app/login/page.tsx` and `app/edit/page.tsx`
  - Expected: zero matches. If any are found, they're leftovers from an incomplete rewrite — fix them in-place, rerun lint + build, and amend the last commit OR add a follow-up commit.

  Also search for `--background`:
  - Expected: matches only in `app/globals.css` (where the var is defined) and `app/layout.tsx` (body-level fallback). No matches in wizard components.

- [ ] **Step 18.4 — Final commit (if cleanup was needed in 18.3)**

  ```bash
  cd C:/Dev/schoolwatch-wizard
  git add -A
  git commit -m "style: clean up stale terminal token references in wizard components"
  ```

  If nothing was fixed in 18.3, skip this commit.

- [ ] **Step 18.5 — Summary to user**

  Report:
  - Total commits on this branch since the spec commit (`git log ff0c92a..HEAD --oneline | wc -l`).
  - Confirm `npm run lint` and `npm run build` both pass.
  - Confirm e2e walkthrough was successful, note any UX observations (e.g., "margin note placement on the Schedule step was tight on md breakpoints — recommend narrowing the right rail or moving the tip inline").
  - List any followups that surfaced during implementation (e.g., "StepColors had a dark-mode toggle I preserved but didn't restyle deeply — worth a follow-up PR if we want it visible on the review step's preview").
