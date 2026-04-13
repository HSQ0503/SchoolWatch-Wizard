# Wizard + Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage in a "student zine" aesthetic and the wizard in a "developer utility" aesthetic, matching validated mockups, while preserving all backend / API / data-shape / color-zone / config-generator / auth / deploy-pipeline logic byte-for-byte.

**Architecture:** Two surface styles, two token sets. Homepage gets `.theme-zine` tokens (cream paper + ink + highlighter + marker + Archivo Black + Fraunces + JetBrains Mono + Caveat). Wizard gets terminal tokens (dark + mono + coral accent) on the default `:root`. Every step component keeps its state hooks, handlers, and prop contract identical — only JSX changes. `ConfigPreview` calls the existing `generateConfigTs` for the live right-pane so there is exactly one source of truth for the generated `school.config.ts` string.

**Tech Stack:** Next.js 16.2.3 (App Router), React 19.2.4, TypeScript 5, Tailwind CSS v4 (@import "tailwindcss" + @theme inline tokens — no config file), `motion/react`, `next/font/google`, existing `lib/*` untouched.

**Visual source-of-truth (canonical mockups, already validated):**
- Homepage: `C:\Dev\schoolwatch-wizard\.superpowers\brainstorm\1270-1776031590\content\homepage-zine.html`
- Wizard: `C:\Dev\schoolwatch-wizard\.superpowers\brainstorm\1270-1776031590\content\wizard-terminal.html`

**Spec:** `docs/superpowers/specs/2026-04-12-wizard-and-homepage-redesign-design.md` — in particular §3 ("Behavior Preservation — The Invariant List") must be honored on every task that touches an existing file.

**Verification policy:** This project has no test framework. Per-task verification uses:
- `npm run lint` — after every code change
- `npm run build` — after tasks that touch types or server/client component boundaries
- `npm run dev` + manual browser check — before closing the phase, not every task

---

## Phase 1 — Foundation (tokens + fonts)

### Task 1: Load new fonts in root layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace the font imports and body className**

Replace the full contents of `app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Geist_Mono, Fraunces, Archivo_Black, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-archivo-black",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains-mono",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-caveat",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

// Kept for possible future use; the wizard now uses JetBrains Mono directly.
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "SchoolWatch — Build your school's dashboard",
  description:
    "Build a real bell-schedule dashboard for your school in 5 minutes. Free, no code, no admin approval needed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className={`${archivoBlack.variable} ${jetbrainsMono.variable} ${caveat.variable} ${fraunces.variable} ${geistMono.variable} font-sans min-h-full`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify lint**

Run: `npm run lint`
Expected: clean (no errors).

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "layout: load Archivo Black / JetBrains Mono / Caveat fonts" -m "Prepares the two redesigned surfaces (zine homepage, terminal wizard)." -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Add zine tokens + retune terminal tokens in globals.css

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Replace the full file contents**

Replace the full contents of `app/globals.css` with:

```css
@import "tailwindcss";

:root {
  color-scheme: dark;
  --background: #0a0b0d;
  --foreground: #e4e4e7;

  --bg-raised: #121317;
  --bg-input: #16181d;
  --line: #1f2128;
  --line-strong: #2a2d36;
  --text-dim: #a1a1aa;
  --text-faded: #5e6068;
  --color-accent: #ff6363;
  --color-ok: #10b981;
  --color-warn: #f59e0b;
}

.theme-zine {
  color-scheme: light;
  --paper: #f5efe0;
  --paper-dark: #ebe3d1;
  --ink: #1a1a1a;
  --ink-soft: #3a3a3a;
  --ink-faded: #6b6b6b;
  --highlight: #ffd23c;
  --marker: #d63c3c;
  --blue-mark: #2a4a8a;
  --hairline: rgba(26, 26, 26, 0.12);
  background: var(--paper);
  color: var(--ink);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-bg-raised: var(--bg-raised);
  --color-bg-input: var(--bg-input);
  --color-line: var(--line);
  --color-line-strong: var(--line-strong);
  --color-text-dim: var(--text-dim);
  --color-text-faded: var(--text-faded);
  --color-accent: var(--color-accent);
  --color-ok: var(--color-ok);
  --color-warn: var(--color-warn);

  --color-paper: var(--paper);
  --color-paper-dark: var(--paper-dark);
  --color-ink: var(--ink);
  --color-ink-soft: var(--ink-soft);
  --color-ink-faded: var(--ink-faded);
  --color-highlight: var(--highlight);
  --color-marker: var(--marker);
  --color-blue-mark: var(--blue-mark);
  --color-hairline: var(--hairline);

  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-jetbrains-mono);
  --font-display: var(--font-fraunces);
  --font-archivo: var(--font-archivo-black);
  --font-caveat: var(--font-caveat);
}

body {
  background: var(--background);
  color: var(--foreground);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  /* De-rotate decorative tilt under reduced motion */
  .no-tilt-rm {
    transform: none !important;
  }
}
```

- [ ] **Step 2: Verify build (catches Tailwind v4 token errors that lint misses)**

Run: `npm run build`
Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "styles: add .theme-zine tokens and retune terminal tokens" -m "Homepage scoped via .theme-zine (cream/ink/highlighter/marker); wizard stays on :root (dark terminal with coral accent + ok/warn). Shared :root --color-accent carries brand across both surfaces." -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Phase 2 — Shared primitives (homepage)

### Task 3: Create `Highlight` primitive

**Files:**
- Create: `components/landing/Highlight.tsx`

- [ ] **Step 1: Write the component**

```tsx
// A text span with a yellow highlighter-marker pass behind it.
// Use inside headlines: <h1>Make your <Highlight>schedule site</Highlight> not suck.</h1>

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Highlight({ children, className = "" }: Props) {
  return (
    <span
      className={className}
      style={{
        background:
          "linear-gradient(180deg, transparent 52%, var(--highlight) 52%, var(--highlight) 94%, transparent 94%)",
        padding: "0 4px",
        margin: "0 -2px",
        // Inline because Tailwind v4 doesn't ship box-decoration-break utilities we can rely on.
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
      }}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Verify lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/landing/Highlight.tsx
git commit -m "landing: add Highlight primitive (zine marker-pass span)" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Create `Polaroid` primitive

**Files:**
- Create: `components/landing/Polaroid.tsx`

- [ ] **Step 1: Write the component**

```tsx
// White-bordered polaroid frame with optional top tape and a handwritten caption.
// Reference: .superpowers/brainstorm/1270-1776031590/content/homepage-zine.html — .polaroid block
type Props = {
  children: React.ReactNode;
  caption?: string;
  rotation?: number;           // degrees; 0 if omitted
  tape?: boolean;              // yellow tape strip across the top-center
  className?: string;          // additional absolute positioning / sizing classes
  style?: React.CSSProperties; // escape-hatch for one-off positioning
};

export default function Polaroid({
  children,
  caption,
  rotation = 0,
  tape = false,
  className = "",
  style,
}: Props) {
  return (
    <div
      className={`no-tilt-rm relative bg-white pt-2.5 px-2.5 pb-9 shadow-[0_14px_30px_rgba(26,26,26,0.15),0_2px_4px_rgba(26,26,26,0.1)] border border-black/5 ${className}`}
      style={{ transform: `rotate(${rotation}deg)`, ...style }}
    >
      {tape && (
        <span
          aria-hidden="true"
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 -rotate-3 h-5 w-[90px] border border-dashed border-black/10"
          style={{ background: "rgba(255,210,60,0.55)" }}
        />
      )}
      <div className="w-full h-full relative overflow-hidden">{children}</div>
      {caption && (
        <p
          className="absolute bottom-2.5 left-2.5 right-2.5 text-center text-[color:var(--color-ink-soft)]"
          style={{ fontFamily: "var(--font-caveat)", fontSize: 17, fontWeight: 700 }}
        >
          {caption}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/landing/Polaroid.tsx
git commit -m "landing: add Polaroid primitive (framed screenshot with tape + caption)" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Create `TapedScreenshot` primitive

**Files:**
- Create: `components/landing/TapedScreenshot.tsx`

- [ ] **Step 1: Write the component**

```tsx
// A framed screenshot (or arbitrary child content) held down with configurable tape strips.
// Reference: homepage-zine.html — .screenshot-holder and .how .step .thumb blocks
type TapeColor = "yellow" | "red";
type TapePosition = "top-left" | "top-right";

type Props = {
  children: React.ReactNode;
  rotation?: number; // degrees
  tapes?: { position: TapePosition; color: TapeColor }[];
  className?: string;
};

const COLOR_STYLES: Record<TapeColor, React.CSSProperties> = {
  yellow: { background: "rgba(255,210,60,0.5)" },
  red: { background: "rgba(214,60,60,0.25)" },
};

export default function TapedScreenshot({
  children,
  rotation = 0,
  tapes = [],
  className = "",
}: Props) {
  return (
    <div
      className={`no-tilt-rm relative bg-white pt-3.5 px-3.5 pb-9 border border-black/10 shadow-[0_20px_50px_rgba(26,26,26,0.18),0_3px_6px_rgba(26,26,26,0.08)] ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {tapes.map((t, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`absolute -top-3 h-5 w-[90px] border border-dashed border-black/10 ${
            t.position === "top-left" ? "left-5 -rotate-3" : "right-5 rotate-3"
          }`}
          style={COLOR_STYLES[t.color]}
        />
      ))}
      <div className="relative overflow-hidden">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Verify lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/landing/TapedScreenshot.tsx
git commit -m "landing: add TapedScreenshot primitive" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Create `HandwrittenArrow` primitive

**Files:**
- Create: `components/landing/HandwrittenArrow.tsx`

- [ ] **Step 1: Write the component**

```tsx
// A Caveat-script label with an optional hand-drawn SVG arrow beneath it.
// Typically absolutely positioned by the parent section.
// Reference: homepage-zine.html — .annotation and .how .step .scribble blocks
type Props = {
  label: string;
  arrow?: "down-left" | "down-right" | "up-left" | "up-right" | "none";
  rotate?: number; // degrees to rotate the whole annotation
  className?: string; // positioning
};

const ARROW_PATHS: Record<Exclude<Props["arrow"], "none" | undefined>, string> = {
  "down-left": "M50 4 C 30 8, 14 14, 6 36",
  "down-right": "M8 4 C 28 8, 44 14, 52 36",
  "up-left": "M50 36 C 30 32, 14 26, 6 4",
  "up-right": "M8 36 C 28 32, 44 26, 52 4",
};

const HEAD_PATHS: Record<Exclude<Props["arrow"], "none" | undefined>, string> = {
  "down-left": "M6 36 L14 28 M6 36 L12 38",
  "down-right": "M52 36 L44 28 M52 36 L46 38",
  "up-left": "M6 4 L14 12 M6 4 L12 2",
  "up-right": "M52 4 L44 12 M52 4 L46 2",
};

export default function HandwrittenArrow({
  label,
  arrow = "down-left",
  rotate = 0,
  className = "",
}: Props) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none text-center leading-tight ${className}`}
      style={{
        fontFamily: "var(--font-caveat)",
        fontWeight: 700,
        fontSize: 22,
        color: "var(--marker)",
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {label}
      {arrow !== "none" && (
        <svg
          width="58"
          height="42"
          viewBox="0 0 58 42"
          fill="none"
          style={{ margin: "6px auto 0", display: "block" }}
        >
          <path
            d={ARROW_PATHS[arrow]}
            stroke="var(--marker)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d={HEAD_PATHS[arrow]}
            stroke="var(--marker)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/landing/HandwrittenArrow.tsx
git commit -m "landing: add HandwrittenArrow primitive (Caveat label + SVG arc)" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Create `MarginNote` primitive

**Files:**
- Create: `components/landing/MarginNote.tsx`

- [ ] **Step 1: Write the component**

```tsx
// Numbered red-pen margin note, used next to tilted screenshots on the Showcase section.
// Reference: homepage-zine.html — .showcase .notes .note block
type Props = {
  n: number;
  title: string;
  children: React.ReactNode;
};

export default function MarginNote({ n, title, children }: Props) {
  return (
    <div className="relative mb-10 pl-5 border-l-[3px] border-[color:var(--color-ink)]">
      <span
        aria-hidden="true"
        className="absolute -left-9 -top-1 leading-none"
        style={{
          fontFamily: "var(--font-caveat)",
          fontWeight: 700,
          fontSize: 32,
          color: "var(--marker)",
        }}
      >
        {n}
      </span>
      <h4
        className="text-[color:var(--color-ink)] text-[20px] tracking-tight leading-[1.15] mb-1.5"
        style={{ fontFamily: "var(--font-archivo)" }}
      >
        {title}
      </h4>
      <p
        className="text-[color:var(--color-ink-soft)] text-base leading-[1.5]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {children}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/landing/MarginNote.tsx
git commit -m "landing: add MarginNote primitive (numbered red-pen note)" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Create `PaperNoise` overlay + delete old `Noise.tsx`

**Files:**
- Create: `components/landing/PaperNoise.tsx`
- Delete: `components/landing/Noise.tsx`

- [ ] **Step 1: Write the new component**

```tsx
// Fixed-position paper-grain overlay for the zine homepage.
// Tuned to ink-colored noise on cream (was bright/screen on black in the old dark landing).
const NOISE_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.05  0 0 0 0 0.05  0 0 0 0 0.05  0 0 0 0.22 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`
  );

export default function PaperNoise() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] mix-blend-multiply opacity-[0.6]"
      style={{ backgroundImage: `url("${NOISE_SVG}")`, backgroundSize: "180px 180px" }}
    />
  );
}
```

- [ ] **Step 2: Delete the old overlay**

```bash
git rm components/landing/Noise.tsx
```

- [ ] **Step 3: Verify lint**

Run: `npm run lint`
Expected: clean (no references to the old file yet — page.tsx rewrite comes later, but TypeScript compiles because no one imports it in this commit).

(If lint complains about an unused reference, it's because another file imports `Noise` — the only current importer is `app/page.tsx`. That file is rewritten in a later task. If this task runs before that one and the dev build errors on the missing import, leave the `page.tsx` import alone for now; it will be replaced in Task 31.)

- [ ] **Step 4: Commit**

```bash
git add components/landing/PaperNoise.tsx
git commit -m "landing: replace Noise with PaperNoise (ink grain for cream paper)" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Phase 3 — Shared primitives (wizard)

### Task 9: Create `Kbd` primitive

**Files:**
- Create: `components/wizard/Kbd.tsx`

- [ ] **Step 1: Write the component**

```tsx
// A tiny keyboard-key badge used throughout the wizard chrome.
// Reference: wizard-terminal.html — .kbd CSS class
type Props = { children: React.ReactNode };

export default function Kbd({ children }: Props) {
  return (
    <span
      className="inline-block rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-background)] px-1.5 py-px text-[10px] text-[color:var(--color-text-dim)]"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Verify lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/wizard/Kbd.tsx
git commit -m "wizard: add Kbd primitive for keyboard-key badges" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: Create `WizardTopBar`

**Files:**
- Create: `components/wizard/WizardTopBar.tsx`

- [ ] **Step 1: Write the component**

```tsx
import Kbd from "./Kbd";

// Sticky app bar: SW monogram + version + connection dot + keyboard hints.
// Reference: wizard-terminal.html — .appbar block
export default function WizardTopBar() {
  return (
    <div
      className="flex items-center justify-between border-b border-[color:var(--color-line)] bg-[color:var(--color-bg-raised)] px-[18px] py-2.5 text-[11px]"
      style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05em" }}
    >
      <div className="flex items-center gap-3.5">
        <div
          className="border border-[color:var(--color-foreground)] px-1.5 py-0.5 text-[11px] font-extrabold tracking-[0.08em] text-[color:var(--color-foreground)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          SW
        </div>
        <div className="text-[color:var(--color-text-faded)]">
          schoolwatch · wizard · v0.3.2
        </div>
        <div className="flex items-center gap-1.5 text-[color:var(--color-text-faded)]">
          <span
            aria-hidden="true"
            className="inline-block h-[7px] w-[7px] animate-pulse rounded-full bg-[color:var(--color-ok)] shadow-[0_0_8px_var(--color-ok)]"
          />
          connected
        </div>
      </div>
      <div className="flex gap-[18px] text-[color:var(--color-text-faded)]">
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

- [ ] **Step 2: Verify lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/wizard/WizardTopBar.tsx
git commit -m "wizard: add WizardTopBar chrome (logo + version + kbd hints)" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: Create `ProgressStrip`

**Files:**
- Create: `components/wizard/ProgressStrip.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

// ASCII-style progress: "step NN / MM  ██████░░░  LABEL"
// Active cell gets a hatched-animation overlay and a coral glow.
// Reference: wizard-terminal.html — .progress block
type Props = {
  current: number; // zero-indexed active step
  total: number;
  label: string;
};

export default function ProgressStrip({ current, total, label }: Props) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    <div
      className="flex items-center gap-4 border-b border-[color:var(--color-line)] px-[18px] py-3.5 text-xs"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <div className="text-[color:var(--color-text-faded)]">
        step{" "}
        <b className="font-bold text-[color:var(--color-accent)]">
          {pad(current + 1)}
        </b>{" "}
        / {pad(total)}
      </div>
      <div className="flex flex-1 gap-[3px]">
        {Array.from({ length: total }).map((_, i) => {
          const isDone = i < current;
          const isActive = i === current;
          return (
            <div
              key={i}
              className={`relative h-3 flex-1 overflow-hidden border ${
                isDone || isActive
                  ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)]"
                  : "border-[color:var(--color-line-strong)] bg-[color:var(--color-background)]"
              }`}
              style={
                isActive
                  ? { boxShadow: "0 0 12px rgba(255,99,99,0.6)" }
                  : undefined
              }
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 animate-[progress-slide_1s_linear_infinite]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(-45deg, transparent 0 3px, rgba(0,0,0,0.2) 3px 6px)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="min-w-[140px] text-right text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-foreground)]">
        {label}
      </div>

      <style>{`
        @keyframes progress-slide {
          from { background-position: 0 0; }
          to   { background-position: 24px 0; }
        }
      `}</style>
    </div>
  );
}
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: clean (inline `<style>` is intentional to keep the keyframe colocated; no global CSS change needed).

- [ ] **Step 3: Commit**

```bash
git add components/wizard/ProgressStrip.tsx
git commit -m "wizard: add ProgressStrip (ASCII progress with hatched active cell)" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 12: Create `StatusBar` (with back/next buttons)

**Files:**
- Create: `components/wizard/StatusBar.tsx`

- [ ] **Step 1: Write the component**

```tsx
import Kbd from "./Kbd";

// Sticky footer for the wizard: keyboard hints on the left, validity + nav on the right.
// Reference: wizard-terminal.html — .statusbar block
type Props = {
  status: "valid" | "invalid" | "pending";
  statusText: string;          // e.g. "8 of 8 required fields"
  onBack: () => void;
  onNext?: () => void;         // omit on final step
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
      ? "var(--color-ok)"
      : status === "invalid"
      ? "var(--color-warn)"
      : "var(--color-text-faded)";

  return (
    <div
      className="flex items-center justify-between gap-4 border-t border-[color:var(--color-line)] bg-[color:var(--color-bg-raised)] px-[18px] py-2 text-[11px] text-[color:var(--color-text-faded)]"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <div className="flex flex-wrap gap-5">
        <span className="flex items-center gap-1.5">
          <Kbd>TAB</Kbd> next field
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>⏎</Kbd> continue
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>⌘</Kbd> <Kbd>←</Kbd> back
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span style={{ color: statusColor }}>
          {status === "valid" ? "● " : status === "invalid" ? "▲ " : "○ "}
          {statusText}
        </span>
        <span>·</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onBack}
            disabled={isFirst}
            className="cursor-pointer border border-[color:var(--color-line-strong)] bg-transparent px-2.5 py-1 text-[color:var(--color-text-dim)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-foreground)] disabled:cursor-not-allowed disabled:opacity-30"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            ← back
          </button>
          {onNext && (
            <button
              type="button"
              onClick={onNext}
              className="cursor-pointer border border-[color:var(--color-accent)] bg-[color:var(--color-accent)] px-2.5 py-1 font-bold text-black hover:brightness-110"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              next →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/wizard/StatusBar.tsx
git commit -m "wizard: add StatusBar (kbd hints + validity + back/next)" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 13: Create `ConfigPreview`

**Files:**
- Create: `components/wizard/ConfigPreview.tsx`

- [ ] **Step 1: Write the component**

```tsx
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
```

- [ ] **Step 2: Verify build (exercises the tokenizer + server/client boundary)**

Run: `npm run build`
Expected: clean build.

- [ ] **Step 3: Commit**

```bash
git add components/wizard/ConfigPreview.tsx
git commit -m "wizard: add ConfigPreview (live school.config.ts pane)" -m "Calls generateConfigTs directly; tokenizer emits spans without a dep; highlights the current step block via regex anchors over the canonical output." -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 14: Extract `DashboardPreview` from current `StepColors` JSX

**Files:**
- Create: `components/wizard/DashboardPreview.tsx`

- [ ] **Step 1: Read the current inline dashboard block**

Open `components/wizard/StepColors.tsx`. The dashboard mockup JSX spans roughly lines 227–426 (the `<div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, overflow: "hidden", maxHeight: 500, background: palette.background, ... }}>` block through its closing `</div>`). This code stays inline-styled (it renders arbitrary user hex; Tailwind can't express that).

- [ ] **Step 2: Write the extracted component**

```tsx
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
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add components/wizard/DashboardPreview.tsx
git commit -m "wizard: extract DashboardPreview (pure visual, behavior preserved)" -m "Pulled the inline-styled mockup out of StepColors so the right pane of the new two-pane layout can reuse it. Inline styles stay — user hex can't be expressed in Tailwind." -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 15: Create `DeployLog` (replaces `DeployProgress`)

**Files:**
- Create: `components/wizard/DeployLog.tsx`

- [ ] **Step 1: Write the component**

```tsx
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
      setEntries((prev) => [
        ...prev,
        { t: "      ", kind: "info", text: `→ ${url}` },
      ]);
    }
  }, [state, url]);

  // Append error line.
  useEffect(() => {
    if (state === "error") {
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
    <div className="flex min-h-0 flex-1 flex-col" aria-live="polite">
      <div
        className="flex items-center justify-between border-b border-[color:var(--color-line)] bg-[color:var(--color-background)] px-[18px] py-2.5 text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-text-faded)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <span>deploy.log</span>
        <span className="text-[color:var(--color-text-dim)]">
          <b className="font-medium text-[color:var(--color-ok)]">
            {state === "done" ? "done" : state === "error" ? "failed" : "running"}
          </b>
        </span>
      </div>
      <div
        ref={scrollRef}
        className="m-[14px] max-h-[400px] flex-1 overflow-y-auto rounded border border-[color:var(--color-line-strong)] bg-black p-[14px] text-[12px] leading-[1.8]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {entries.map((e, i) => (
          <div key={i} className="flex items-start gap-2.5" role="status">
            <span className="min-w-[65px] text-[color:var(--color-text-faded)]">
              {e.t}
            </span>
            {e.kind === "ok" && (
              <span className="text-[color:var(--color-ok)]">✓ {e.text}</span>
            )}
            {e.kind === "info" && (
              <span className="text-[color:var(--color-text-dim)]">{e.text}</span>
            )}
            {e.kind === "pending" && (
              <span className="animate-pulse text-[color:var(--color-warn)]">
                ● {e.text}
              </span>
            )}
            {e.kind === "err" && (
              <span className="text-[color:var(--color-accent)]">✗ {e.text}</span>
            )}
          </div>
        ))}
        {pendingLabel && (
          <div className="flex items-start gap-2.5" role="status">
            <span className="min-w-[65px] text-[color:var(--color-text-faded)]" />
            <span className="animate-pulse text-[color:var(--color-warn)]">
              ● {pendingLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/wizard/DeployLog.tsx
git commit -m "wizard: add DeployLog (terminal-style replacement for DeployProgress)" -m "Identical prop shape and DeployState union. Visual only; StepReview drives it the same way." -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Phase 4 — Wizard shell rewrite

### Task 16: Rewrite `WizardShell.tsx` chrome (preserve all state + validation)

**Files:**
- Modify: `components/WizardShell.tsx`

**Behavior that MUST remain identical** (spec §3.2):
- `STEPS` array (exact labels + order).
- `DEFAULT_FORM_DATA` exact object.
- `StepErrorBoundary` class behavior and error-fallback JSX (only inner styling may change).
- `useState` calls: `currentStep`, `data`, `errors`, `showErrors`.
- `useEffect` calls that log on mount and on step change.
- `currentErrors` computed via `validateStep(currentStep, data)`.
- Next click: if `currentErrors.length > 0`, set errors + showErrors=true and return — do not advance.
- Back click: `setCurrentStep((s) => s - 1)`.
- Reset `showErrors=false` and `errors=[]` on step change.
- `if (!StepComponent)` guard stays.
- `key={currentStep}` on both `StepErrorBoundary` and `StepComponent`.

- [ ] **Step 1: Replace the full file contents**

Replace `components/WizardShell.tsx` with the following. The export surface (`STEPS`, `DEFAULT_FORM_DATA`, `StepProps`, default export `WizardShell`) is unchanged.

```tsx
"use client";

import { Component, ErrorInfo, ReactNode, useState, useEffect, ComponentType } from "react";
import { WizardFormData } from "@/lib/types";
import { validateStep } from "@/lib/validation";
import WizardTopBar from "@/components/wizard/WizardTopBar";
import ProgressStrip from "@/components/wizard/ProgressStrip";
import StatusBar from "@/components/wizard/StatusBar";
import ConfigPreview from "@/components/wizard/ConfigPreview";

export const STEPS = [
  "School Info",
  "Colors",
  "Schedule",
  "Lunch Waves",
  "Calendar",
  "Features",
  "Review & Deploy",
] as const;

export const DEFAULT_FORM_DATA: WizardFormData = {
  school: {
    name: "",
    shortName: "",
    acronym: "",
    mascot: "",
    appName: "",
    city: "",
    state: "",
    stateCode: "",
    country: "US",
    academicYear: "",
  },
  colors: {
    primary: "#003da5",
    accent: "#003da5",
    light: {
      navbar: "#ffffff",
      navText: "#003da5",
      background: "#f5f7fa",
      heading: "#003da5",
      ring: "#003da5",
      surface: "#ffffff",
      cardAccent: "#003da5",
      badge: "#003da5",
    },
    dark: {},
  },
  schedule: {
    dayTypes: [{ id: "regular", label: "Regular Day", weekdays: [1, 2, 3, 4, 5] }],
    bells: { regular: { shared: [{ name: "1st Period", start: "08:00", end: "08:50" }], after: [] } },
  },
  lunchWaves: { enabled: false, options: [], default: "" },
  calendar: { noSchoolDates: [], earlyDismissalDates: [], events: [] },
  features: { events: true, productivity: true },
  contactEmail: "",
};

export type StepProps = {
  data: WizardFormData;
  onChange: (data: WizardFormData) => void;
  schoolId?: string;
};

// Error boundary — preserved behavior, only the fallback styling changed.
class StepErrorBoundary extends Component<
  { stepIndex: number; children: ReactNode },
  { error: Error | null }
> {
  constructor(props: { stepIndex: number; children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[WizardShell] Step ${this.props.stepIndex} crashed:`, error);
    console.error("[WizardShell] Component stack:", info.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <div
          className="border border-[color:var(--color-accent)]/40 bg-[rgba(255,99,99,0.08)] p-6 text-center"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <p className="text-[color:var(--color-accent)] font-semibold mb-2">
            ✗ step failed to render
          </p>
          <p className="text-[color:var(--color-text-dim)] text-sm font-mono break-all">
            {this.state.error.message}
          </p>
          <p className="text-[color:var(--color-text-faded)] text-xs mt-3">
            check browser console for full stack trace
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

type WizardShellProps = {
  steps: ComponentType<StepProps>[];
  initialData?: WizardFormData;
  schoolId?: string;
};

export default function WizardShell({ steps, initialData, schoolId }: WizardShellProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<WizardFormData>(initialData ?? DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  const totalSteps = STEPS.length;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  const currentErrors = validateStep(currentStep, data);

  useEffect(() => {
    console.log(`[WizardShell] Mounted. Step count: ${steps.length}, Data keys:`, Object.keys(data));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const StepComponent = steps[currentStep];
    console.log(`[WizardShell] Step changed to ${currentStep} ("${STEPS[currentStep]}")`);
    console.log(`[WizardShell] Component:`, StepComponent?.name || StepComponent || "UNDEFINED");
    console.log(`[WizardShell] Form data snapshot:`, JSON.parse(JSON.stringify(data)));
    setShowErrors(false);
    setErrors([]);
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

  const StepComponent = steps[currentStep];

  if (!StepComponent) {
    console.error(
      `[WizardShell] No step component at index ${currentStep}. Steps array length: ${steps.length}`
    );
    return (
      <div className="p-8 text-[color:var(--color-accent)]">
        Error: No step component at index {currentStep}
      </div>
    );
  }

  const handleNext = () => {
    if (currentErrors.length > 0) {
      console.log(`[WizardShell] Validation failed at step ${currentStep}:`, currentErrors);
      setErrors(currentErrors);
      setShowErrors(true);
      return;
    }
    console.log(`[WizardShell] Next clicked. ${currentStep} -> ${currentStep + 1}`);
    setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    console.log(`[WizardShell] Back clicked. ${currentStep} -> ${currentStep - 1}`);
    setCurrentStep((s) => s - 1);
  };

  const status: "valid" | "invalid" =
    currentErrors.length === 0 ? "valid" : "invalid";
  const statusText =
    currentErrors.length === 0
      ? `step ${currentStep + 1} ready`
      : `${currentErrors.length} issue${currentErrors.length === 1 ? "" : "s"} to fix`;

  return (
    <div
      className="flex min-h-screen flex-col bg-[color:var(--background)] text-[color:var(--color-foreground)]"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      <WizardTopBar />
      <ProgressStrip
        current={currentStep}
        total={totalSteps}
        label={STEPS[currentStep].toLowerCase()}
      />

      {/* Two-pane layout. On small screens the right pane stacks under. */}
      <div className="grid flex-1 grid-cols-1 md:grid-cols-[1fr_460px]">
        <main className="min-w-0 border-r border-[color:var(--color-line)] px-8 py-8">
          <StepErrorBoundary stepIndex={currentStep} key={currentStep}>
            <StepComponent key={currentStep} data={data} onChange={setData} schoolId={schoolId} />
          </StepErrorBoundary>

          {showErrors && errors.length > 0 && (
            <div
              className="mt-8 border border-[color:var(--color-warn)]/40 bg-[rgba(245,158,11,0.08)] px-4 py-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-warn)]">
                ▲ fix the following:
              </p>
              <ul className="space-y-1">
                {errors.map((err, i) => (
                  <li key={i} className="text-sm text-[color:var(--color-text-dim)]">
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>

        <aside className="flex min-h-[300px] min-w-0 flex-col bg-[color:var(--color-bg-raised)]">
          <ConfigPreview data={data} activeStep={currentStep} />
        </aside>
      </div>

      <StatusBar
        status={status}
        statusText={statusText}
        onBack={handleBack}
        onNext={isLast ? undefined : handleNext}
        isFirst={isFirst}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: clean. (The step files still use their old styling; they'll render inside the new chrome without error.)

- [ ] **Step 3: Manually exercise the shell**

Run: `npm run dev`
Open http://localhost:3000/setup and verify:
- Top bar, progress strip, and status bar are visible.
- Back is disabled on step 1.
- Clicking Next advances; leaving a required field empty and clicking Next shows errors in the warn panel (not advancing).
- The right pane shows live `school.config.ts` output.

- [ ] **Step 4: Commit**

```bash
git add components/WizardShell.tsx
git commit -m "wizard: rewrite WizardShell chrome (terminal two-pane)" -m "All state (currentStep/data/errors/showErrors), validation flow, logging, error boundary, and step component contract preserved. Only JSX shell + styling changes." -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Phase 5 — Wizard step visual rewrites

> Each step task follows the same recipe: **read the current file, preserve every hook / handler / effect / prop contract exactly, replace only the JSX and styling tokens**. Shared mono form conventions are defined once below and re-used.

**Shared field/input styling** (used across steps 5–11):

```tsx
// Put at the top of each rewritten step file.
const inputClass =
  "w-full rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] px-3 py-2 text-[13px] text-[color:var(--color-foreground)] placeholder-[color:var(--color-text-faded)] transition-colors focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-accent)]";

const labelClass =
  "block text-xs text-[color:var(--color-text-faded)] mb-1.5";

const fontMono: React.CSSProperties = { fontFamily: "var(--font-mono)" };
```

### Task 17: Rewrite `StepSchoolInfo.tsx`

**Files:**
- Modify: `components/wizard/StepSchoolInfo.tsx`

**Behavior preserved verbatim:**
- `school`, `nameRef`, `fileRef` refs and the `useEffect` auto-focus on mount.
- `updateSchool(patch)` helper (same signature, same merge).
- `handleLogoUpload`: 2MB size guard + alert, `FileReader.readAsDataURL`, sets `data.logo`.
- `removeLogo`: sets `data.logo = undefined`, clears `fileRef.current.value`.
- `handleNameChange` auto-derive logic for `shortName` / `acronym` / `appName` — **keep the exact comparison strings**.
- All form fields (name, shortName, acronym, mascot, appName, city, state, stateCode, academicYear, contactEmail) present and bound identically.
- `logo-upload` input id + `htmlFor` label preserved.

- [ ] **Step 1: Rewrite only the JSX inside `return (...)`**

Replace the return block (roughly lines 74–261) with:

```tsx
  return (
    <div className="space-y-8" style={fontMono}>
      <div className="flex items-baseline gap-3.5 border-b border-dashed border-[color:var(--color-line-strong)] pb-4">
        <h2 className="text-[22px] font-bold text-[color:var(--color-foreground)]">
          <span className="text-[color:var(--color-text-faded)] font-normal">// </span>
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
```

- [ ] **Step 2: Verify lint + build**

Run: `npm run lint && npm run build`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/wizard/StepSchoolInfo.tsx
git commit -m "wizard/step: terminal-restyle StepSchoolInfo" -m "All hooks/handlers/auto-derive logic preserved; JSX-only rewrite." -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 18: Rewrite `StepColors.tsx` (uses `DashboardPreview`)

**Files:**
- Modify: `components/wizard/StepColors.tsx`

**Behavior preserved verbatim:**
- Top-of-file import shape: existing imports for `defaultLightColors`, `resolveDarkColors`, `ZoneColors`, `WizardFormData`.
- State: `overriddenZones: Set<string>`, `activeZone`, `darkMode` tri-state (`"hidden" | "preview" | "customize"`).
- Derived: `resolvedDark`, `showingDark`, `palette`, `activeColor`, `zoneClickable`.
- Handlers: `updateSeeds`, `updateZoneColor`, `resetZone`, `zoneProps` — exact signatures and logic.
- The zone popover modal behavior (click outside to close, color picker + hex input + reset-to-default link).
- Dark-mode button panel with three modes (`hidden` shows Preview+Customize; `preview` shows Back+Customize; `customize` shows Back).

- [ ] **Step 1: Replace the JSX in the file**

Keep all hooks, handlers, and derived values at the top of the function unchanged. Replace the `return (...)` block with the following. Import the new extracted component at the top: `import DashboardPreview from "./DashboardPreview";`

```tsx
  return (
    <div className="space-y-8" style={fontMono}>
      <div className="flex items-baseline gap-3.5 border-b border-dashed border-[color:var(--color-line-strong)] pb-4">
        <h2 className="text-[22px] font-bold text-[color:var(--color-foreground)]">
          <span className="text-[color:var(--color-text-faded)] font-normal">// </span>
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
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 3: Smoke-test in browser**

`npm run dev` → /setup → Step 2 (Colors). Verify:
- Seed pickers change → non-overridden zones cascade.
- Clicking a zone in the dashboard mockup opens the popover.
- Changing color in popover updates the zone; `*` marker appears.
- "preview dark" swaps the mockup to the derived dark palette.
- "customize" lets you click zones again to override dark values.

- [ ] **Step 4: Commit**

```bash
git add components/wizard/StepColors.tsx
git commit -m "wizard/step: terminal-restyle StepColors" -m "Dashboard extracted to DashboardPreview; zone overrides set, dark-mode tri-state, popover, and seed cascade all preserved. JSX-only rewrite." -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 19: Rewrite `StepSchedule.tsx`

**Files:**
- Modify: `components/wizard/StepSchedule.tsx`

**Behavior preserved verbatim:**
- `activeDayTypeIndex` state.
- `dayTypes`, `bells`, `lunchWavesEnabled`, `waveOptions`, `activeDayType`, `activeBlock`, `sharedPeriods`, `afterPeriods`, `waveBells` derivations.
- All helpers: `updateSchedule`, `addDayType`, `removeDayType`, `updateDayTypeLabel`, `toggleWeekday`, `updateBlock`, `addSharedPeriod`, `removeSharedPeriod`, `updateSharedPeriod`, `addAfterPeriod`, `removeAfterPeriod`, `updateAfterPeriod`, `getWavePeriods`, `setWavePeriods`, `addWavePeriod`, `removeWavePeriod`, `updateWavePeriod`, `genId`, `nextPeriodDefaults`, `lastEnd`.
- `WEEKDAYS` array, `PeriodList` subcomponent shape (props unchanged, only styling changes).
- Conditional rendering of before-lunch / per-wave / after-lunch period sections.
- "Remove this day type" link only shown when `dayTypes.length > 1`.

- [ ] **Step 1: Rewrite JSX + restyle `PeriodList` subcomponent**

Keep every helper and hook exactly as-is. Replace:
1. `inputClass` and `timeInputClass` constants at the top with the shared terminal versions (see Phase 5 preamble), plus:
   ```tsx
   const timeInputClass =
     "w-[7.5rem] shrink-0 rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] px-3 py-2 text-[13px] text-[color:var(--color-foreground)] focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-accent)] [color-scheme:dark]";
   ```
2. `PeriodList` JSX: mono labels, terminal buttons.
3. Top-level `return (...)` JSX.

Use this as the `PeriodList` body:

```tsx
  return (
    <div style={fontMono}>
      <label className="mb-1 block text-xs text-[color:var(--color-text-faded)] uppercase tracking-[0.1em]">
        {label}
      </label>
      {description && (
        <p className="mb-2 text-[11px] text-[color:var(--color-text-faded)]">{description}</p>
      )}
      <div className="space-y-2">
        {periods.length === 0 && (
          <p className="text-[12px] italic text-[color:var(--color-text-faded)]">
            {emptyMessage}
          </p>
        )}
        {periods.map((period, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={inputClass}
              type="text"
              placeholder="period name"
              value={period.name}
              onChange={(e) => onUpdate(i, { name: e.target.value })}
            />
            <input
              className={timeInputClass}
              type="time"
              value={period.start}
              onChange={(e) => onUpdate(i, { start: e.target.value })}
              aria-label="Start time"
            />
            <input
              className={timeInputClass}
              type="time"
              value={period.end}
              onChange={(e) => onUpdate(i, { end: e.target.value })}
              aria-label="End time"
            />
            <button
              onClick={() => onRemove(i)}
              aria-label={`Remove period ${i + 1}`}
              className="cursor-pointer shrink-0 rounded-[3px] p-1.5 text-[color:var(--color-text-faded)] hover:bg-[color:var(--color-bg-input)] hover:text-[color:var(--color-accent)]"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={onAdd}
        className="mt-3 cursor-pointer text-xs uppercase tracking-[0.12em] text-[color:var(--color-accent)] hover:brightness-110"
      >
        [+] {addLabel.replace(/^\+ /, "")}
      </button>
    </div>
  );
```

And the top-level `return (...)`:

```tsx
  return (
    <div className="space-y-6" style={fontMono}>
      <div className="flex items-baseline gap-3.5 border-b border-dashed border-[color:var(--color-line-strong)] pb-4">
        <h2 className="text-[22px] font-bold text-[color:var(--color-foreground)]">
          <span className="text-[color:var(--color-text-faded)] font-normal">// </span>
          schedule
        </h2>
        <span className="text-[12px] text-[color:var(--color-text-faded)]">
          — day types and their bell times.{" "}
          {lunchWavesEnabled ? "lunch waves enabled." : "rotating schedules handled."}
        </span>
      </div>

      {/* Day type cards */}
      <div>
        <div className="mb-2.5 text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-text-faded)]">
          day types
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {dayTypes.map((dt, i) => {
            const selected = i === activeDayTypeIndex;
            return (
              <button
                key={dt.id}
                onClick={() => setActiveDayTypeIndex(i)}
                className={`cursor-pointer rounded-[3px] border p-3 text-left transition-colors ${
                  selected
                    ? "border-[color:var(--color-accent)] shadow-[inset_0_0_0_1px_var(--color-accent)]"
                    : "border-[color:var(--color-line-strong)]"
                } bg-[color:var(--color-bg-input)]`}
              >
                <div className="text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-text-faded)]">
                  type_{(i + 1).toString().padStart(2, "0")}
                </div>
                <div className="mt-1 text-sm font-bold text-[color:var(--color-foreground)]">
                  {dt.label || "Untitled"}
                </div>
                <div className="mt-1.5 text-[10px] text-[color:var(--color-text-faded)]">
                  weekdays: {dt.weekdays.length === 0 ? "—" : dt.weekdays.map((d) => ["", "mon", "tue", "wed", "thu", "fri"][d]).join(" ")}
                </div>
              </button>
            );
          })}
        </div>
        <button
          onClick={addDayType}
          className="mt-3 cursor-pointer text-xs uppercase tracking-[0.12em] text-[color:var(--color-accent)] hover:brightness-110"
        >
          [+] add day type
        </button>
      </div>

      {activeDayType && (
        <div className="space-y-5 rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] p-5">
          <div className="grid grid-cols-[180px_1fr] items-center gap-4">
            <div className={labelClass}>label</div>
            <input
              className={inputClass}
              type="text"
              placeholder="Regular Day"
              value={activeDayType.label}
              onChange={(e) => updateDayTypeLabel(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-[180px_1fr] items-center gap-4">
            <div className={labelClass}>weekdays</div>
            <div className="flex gap-2">
              {WEEKDAYS.map(({ label, value }) => {
                const active = activeDayType.weekdays.includes(value);
                return (
                  <button
                    key={value}
                    onClick={() => toggleWeekday(value)}
                    aria-pressed={active}
                    className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-[3px] border text-xs ${
                      active
                        ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-black font-bold"
                        : "border-[color:var(--color-line-strong)] text-[color:var(--color-text-faded)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-foreground)]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {!lunchWavesEnabled ? (
            <PeriodList
              periods={sharedPeriods}
              label="periods"
              onAdd={addSharedPeriod}
              onRemove={removeSharedPeriod}
              onUpdate={updateSharedPeriod}
              addLabel="add period"
            />
          ) : (
            <div className="space-y-5">
              <PeriodList
                periods={sharedPeriods}
                label="before lunch"
                description="Periods everyone has at the same time, before lunch starts."
                onAdd={addSharedPeriod}
                onRemove={removeSharedPeriod}
                onUpdate={updateSharedPeriod}
                addLabel="add period"
                emptyMessage="no before-lunch periods yet."
              />
              {waveOptions.map((wave) => (
                <div
                  key={wave.id}
                  className="rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-background)] p-4"
                >
                  <PeriodList
                    periods={getWavePeriods(wave.id)}
                    label={`lunch wave: ${wave.label || wave.id}`}
                    description="Periods for students in this wave during the lunch split."
                    onAdd={() => addWavePeriod(wave.id)}
                    onRemove={(i) => removeWavePeriod(wave.id, i)}
                    onUpdate={(i, patch) => updateWavePeriod(wave.id, i, patch)}
                    addLabel="add period"
                    emptyMessage="no periods for this wave yet."
                  />
                </div>
              ))}
              <PeriodList
                periods={afterPeriods}
                label="after lunch"
                description="Periods everyone has at the same time, after lunch ends."
                onAdd={addAfterPeriod}
                onRemove={removeAfterPeriod}
                onUpdate={updateAfterPeriod}
                addLabel="add period"
                emptyMessage="no after-lunch periods yet."
              />
            </div>
          )}

          {dayTypes.length > 1 && (
            <div className="border-t border-[color:var(--color-line)] pt-3">
              <button
                onClick={() => removeDayType(activeDayTypeIndex)}
                className="cursor-pointer text-xs text-[color:var(--color-accent)]/80 underline-offset-2 hover:text-[color:var(--color-accent)] hover:underline"
              >
                remove this day type
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/wizard/StepSchedule.tsx
git commit -m "wizard/step: terminal-restyle StepSchedule" -m "All helpers + period-section branching preserved. JSX-only." -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 20: Rewrite `StepLunchWaves.tsx`

**Files:**
- Modify: `components/wizard/StepLunchWaves.tsx`

**Behavior preserved verbatim:**
- `updateLunchWaves`, `toggleEnabled`, `addWave`, `removeWave`, `updateWave` functions.
- `DEFAULT_WAVES` constant.
- Wave-id rename logic (also updates `default` if the renamed wave was the default).
- "Tip: go back to Schedule step" hint shown when enabled.

- [ ] **Step 1: Rewrite JSX**

Keep imports and helpers untouched. Replace the `return (...)`:

```tsx
  return (
    <div className="space-y-6" style={fontMono}>
      <div className="flex items-baseline gap-3.5 border-b border-dashed border-[color:var(--color-line-strong)] pb-4">
        <h2 className="text-[22px] font-bold text-[color:var(--color-foreground)]">
          <span className="text-[color:var(--color-text-faded)] font-normal">// </span>
          lunch_waves
        </h2>
        <span className="text-[12px] text-[color:var(--color-text-faded)]">
          — does your school split lunch into staggered waves?
        </span>
      </div>

      {/* Toggle */}
      <button
        onClick={toggleEnabled}
        aria-pressed={enabled}
        className={`flex w-full cursor-pointer items-center justify-between rounded-[3px] border px-5 py-4 text-left text-sm transition-colors ${
          enabled
            ? "border-[color:var(--color-accent)] bg-[rgba(255,99,99,0.08)] text-[color:var(--color-foreground)]"
            : "border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] text-[color:var(--color-text-dim)] hover:border-[color:var(--color-accent)]"
        }`}
        style={fontMono}
      >
        <span className="font-semibold">
          {enabled ? "● lunch waves enabled" : "○ no lunch waves"}
        </span>
        <span className="text-xs uppercase tracking-[0.12em] text-[color:var(--color-text-faded)]">
          [click to toggle]
        </span>
      </button>

      {enabled && (
        <div className="space-y-4">
          <div className="space-y-2">
            {options.map((wave, i) => (
              <div key={wave.id} className="flex items-center gap-2">
                <input
                  className="w-32 shrink-0 rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] px-3 py-2 text-[13px] text-[color:var(--color-foreground)] placeholder-[color:var(--color-text-faded)] focus:border-[color:var(--color-accent)] focus:outline-none"
                  style={fontMono}
                  type="text"
                  placeholder="wave-1"
                  value={wave.id}
                  onChange={(e) => {
                    const newId = e.target.value;
                    const newOptions = options.map((w, j) => (j === i ? { ...w, id: newId } : w));
                    const newDefault = defaultWave === wave.id ? newId : defaultWave;
                    updateLunchWaves({ options: newOptions, default: newDefault });
                  }}
                  aria-label={`Wave ${i + 1} ID`}
                />
                <input
                  className={inputClass}
                  type="text"
                  placeholder="Wave label"
                  value={wave.label}
                  onChange={(e) => updateWave(i, { label: e.target.value })}
                  aria-label={`Wave ${i + 1} label`}
                />
                <button
                  onClick={() => updateLunchWaves({ default: wave.id })}
                  aria-pressed={defaultWave === wave.id}
                  className={`shrink-0 cursor-pointer rounded-[3px] border px-2.5 py-1.5 text-[11px] ${
                    defaultWave === wave.id
                      ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-black font-bold"
                      : "border-[color:var(--color-line-strong)] text-[color:var(--color-text-faded)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-foreground)]"
                  }`}
                  style={fontMono}
                >
                  default
                </button>
                <button
                  onClick={() => removeWave(i)}
                  aria-label={`Remove wave ${i + 1}`}
                  className="cursor-pointer shrink-0 rounded-[3px] p-1.5 text-[color:var(--color-text-faded)] hover:bg-[color:var(--color-bg-input)] hover:text-[color:var(--color-accent)]"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={addWave}
            className="cursor-pointer text-xs uppercase tracking-[0.12em] text-[color:var(--color-accent)] hover:brightness-110"
          >
            [+] add lunch wave
          </button>

          <p className="rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] px-4 py-3 text-[11px] leading-relaxed text-[color:var(--color-text-faded)]">
            <span className="text-[color:var(--color-text-dim)] font-bold">tip:</span> after adding waves, go back to <span className="text-[color:var(--color-accent)]">schedule</span> to set per-wave lunch periods.
          </p>
        </div>
      )}
    </div>
  );
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/wizard/StepLunchWaves.tsx
git commit -m "wizard/step: terminal-restyle StepLunchWaves" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 21: Rewrite `StepCalendar.tsx`

**Files:**
- Modify: `components/wizard/StepCalendar.tsx`

**Behavior preserved verbatim:**
- `activeTab` state (`"no-school" | "early-dismissal" | "events"`).
- `updateCalendar`, `addNoSchool`, `updateNoSchool`, `removeNoSchool`, `addEarlyDismissal`, `updateEarlyDismissal`, `removeEarlyDismissal`, `addEvent`, `updateEvent`, `removeEvent`.
- `EVENT_TYPES` constant and `TAB_LABELS` record.
- `badgeCounts` record for tab badges.

- [ ] **Step 1: Rewrite JSX**

Keep all hooks and handlers. Replace the `return (...)`:

```tsx
  return (
    <div className="space-y-6" style={fontMono}>
      <div className="flex items-baseline gap-3.5 border-b border-dashed border-[color:var(--color-line-strong)] pb-4">
        <h2 className="text-[22px] font-bold text-[color:var(--color-foreground)]">
          <span className="text-[color:var(--color-text-faded)] font-normal">// </span>
          calendar
        </h2>
        <span className="text-[12px] text-[color:var(--color-text-faded)]">
          — optional. add no-school days, early dismissals, and events.
        </span>
      </div>

      <div className="flex gap-0 border-b border-[color:var(--color-line-strong)]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 cursor-pointer border-r border-[color:var(--color-line-strong)] px-3 py-2.5 text-[11px] uppercase tracking-[0.12em] last:border-r-0 ${
              activeTab === tab
                ? "bg-[color:var(--color-bg-raised)] text-[color:var(--color-accent)] shadow-[inset_0_-2px_0_var(--color-accent)]"
                : "text-[color:var(--color-text-faded)] hover:bg-[color:var(--color-bg-raised)] hover:text-[color:var(--color-foreground)]"
            }`}
            style={fontMono}
          >
            {TAB_LABELS[tab].toLowerCase()}
            {badgeCounts[tab] > 0 && (
              <span className="ml-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--color-accent)] px-1 text-[10px] font-bold text-black">
                {badgeCounts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "no-school" && (
        <div className="space-y-2">
          {noSchoolDates.length === 0 && (
            <p className="text-[12px] italic text-[color:var(--color-text-faded)]">no entries yet.</p>
          )}
          {noSchoolDates.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="date" className={`w-44 shrink-0 ${inputClass} [color-scheme:dark]`} value={entry.date} onChange={(e) => updateNoSchool(i, { date: e.target.value })} aria-label="Date" />
              <input type="text" className={`flex-1 ${inputClass}`} placeholder="e.g. Winter Break" value={entry.name} onChange={(e) => updateNoSchool(i, { name: e.target.value })} aria-label="Name" />
              <button onClick={() => removeNoSchool(i)} aria-label={`Remove entry ${i + 1}`} className="cursor-pointer shrink-0 rounded-[3px] p-1.5 text-[color:var(--color-text-faded)] hover:text-[color:var(--color-accent)]">
                <TrashIcon />
              </button>
            </div>
          ))}
          <button onClick={addNoSchool} className="cursor-pointer text-xs uppercase tracking-[0.12em] text-[color:var(--color-accent)] hover:brightness-110">
            [+] add
          </button>
        </div>
      )}

      {activeTab === "early-dismissal" && (
        <div className="space-y-2">
          {earlyDismissalDates.length === 0 && (
            <p className="text-[12px] italic text-[color:var(--color-text-faded)]">no entries yet.</p>
          )}
          {earlyDismissalDates.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="date" className={`w-44 shrink-0 ${inputClass} [color-scheme:dark]`} value={entry.date} onChange={(e) => updateEarlyDismissal(i, { date: e.target.value })} aria-label="Date" />
              <input type="text" className={`flex-1 ${inputClass}`} placeholder="e.g. Parent-Teacher Conferences" value={entry.name} onChange={(e) => updateEarlyDismissal(i, { name: e.target.value })} aria-label="Name" />
              <button onClick={() => removeEarlyDismissal(i)} aria-label={`Remove entry ${i + 1}`} className="cursor-pointer shrink-0 rounded-[3px] p-1.5 text-[color:var(--color-text-faded)] hover:text-[color:var(--color-accent)]">
                <TrashIcon />
              </button>
            </div>
          ))}
          <button onClick={addEarlyDismissal} className="cursor-pointer text-xs uppercase tracking-[0.12em] text-[color:var(--color-accent)] hover:brightness-110">
            [+] add
          </button>
        </div>
      )}

      {activeTab === "events" && (
        <div className="space-y-2">
          {events.length === 0 && (
            <p className="text-[12px] italic text-[color:var(--color-text-faded)]">no events yet.</p>
          )}
          {events.map((entry, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
              <input type="date" className={`w-44 shrink-0 ${inputClass} [color-scheme:dark]`} value={entry.date} onChange={(e) => updateEvent(i, { date: e.target.value })} aria-label="Date" />
              <input type="text" className={`flex-1 min-w-0 ${inputClass}`} placeholder="Event name" value={entry.name} onChange={(e) => updateEvent(i, { name: e.target.value })} aria-label="Event name" />
              <select className={`w-44 shrink-0 ${inputClass} cursor-pointer`} value={entry.type} onChange={(e) => updateEvent(i, { type: e.target.value })} aria-label="Event type">
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-[color:var(--color-bg-raised)] text-[color:var(--color-foreground)]">
                    {t.label}
                  </option>
                ))}
              </select>
              <button onClick={() => removeEvent(i)} aria-label={`Remove event ${i + 1}`} className="cursor-pointer shrink-0 rounded-[3px] p-1.5 text-[color:var(--color-text-faded)] hover:text-[color:var(--color-accent)]">
                <TrashIcon />
              </button>
            </div>
          ))}
          <button onClick={addEvent} className="cursor-pointer text-xs uppercase tracking-[0.12em] text-[color:var(--color-accent)] hover:brightness-110">
            [+] add
          </button>
        </div>
      )}
    </div>
  );
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/wizard/StepCalendar.tsx
git commit -m "wizard/step: terminal-restyle StepCalendar" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 22: Rewrite `StepFeatures.tsx`

**Files:**
- Modify: `components/wizard/StepFeatures.tsx`

**Behavior preserved verbatim:**
- `FEATURES` array (shape + copy).
- `toggle(key)` handler.
- `CheckIcon` subcomponent — will be replaced with simpler mono checkbox markup inline.

- [ ] **Step 1: Rewrite the file**

```tsx
import type { WizardFormData } from "@/lib/types";

type StepProps = { data: WizardFormData; onChange: (data: WizardFormData) => void };

type Feature = {
  key: keyof WizardFormData["features"];
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    key: "events",
    title: "Events & Calendar",
    description: "Show school events, holidays, and breaks on a calendar page.",
  },
  {
    key: "productivity",
    title: "Productivity Tools",
    description: "Pomodoro timer, Wordle, to-do list, and group randomizer.",
  },
];

const fontMono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

export default function StepFeatures({ data, onChange }: StepProps) {
  function toggle(key: keyof WizardFormData["features"]) {
    onChange({ ...data, features: { ...data.features, [key]: !data.features[key] } });
  }

  return (
    <div className="space-y-6" style={fontMono}>
      <div className="flex items-baseline gap-3.5 border-b border-dashed border-[color:var(--color-line-strong)] pb-4">
        <h2 className="text-[22px] font-bold text-[color:var(--color-foreground)]">
          <span className="text-[color:var(--color-text-faded)] font-normal">// </span>
          features
        </h2>
        <span className="text-[12px] text-[color:var(--color-text-faded)]">
          — optional modules. countdown and schedule are always on.
        </span>
      </div>

      <div className="space-y-2">
        {FEATURES.map(({ key, title, description }) => {
          const checked = data.features[key];
          return (
            <button
              key={key}
              onClick={() => toggle(key)}
              aria-pressed={checked}
              className={`flex w-full cursor-pointer items-start gap-3 border px-4 py-3 text-left transition-colors ${
                checked
                  ? "border-[color:var(--color-accent)] bg-[rgba(255,99,99,0.05)]"
                  : "border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] hover:border-[color:var(--color-accent)]"
              }`}
              style={fontMono}
            >
              <span
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border text-[10px] font-bold ${
                  checked
                    ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-black"
                    : "border-[color:var(--color-text-faded)] text-transparent"
                }`}
              >
                ✓
              </span>
              <div>
                <p className="text-sm font-bold text-[color:var(--color-foreground)]">{title}</p>
                <p className="mt-0.5 text-xs text-[color:var(--color-text-faded)]">{description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/wizard/StepFeatures.tsx
git commit -m "wizard/step: terminal-restyle StepFeatures" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 23: Rewrite `StepReview.tsx` (swap `DeployProgress` → `DeployLog`)

**Files:**
- Modify: `components/wizard/StepReview.tsx`

**Behavior preserved verbatim:**
- `isEditMode = !!schoolId`.
- All state: `deployState`, `deployUrl`, `deployError`.
- `canDeploy` and `isDeploying` derivations.
- `handleDeploy` body — the exact state-transition timing and `/api/deploy` vs `/api/redeploy` selection. **Do not touch.**
- `cityState`, `dayTypeCount`, `lunchWaveCount` derivations.

- [ ] **Step 1: Swap the import**

Change:
```tsx
import DeployProgress, { type DeployState } from "@/components/DeployProgress";
```
to:
```tsx
import DeployLog, { type DeployState } from "@/components/wizard/DeployLog";
```

- [ ] **Step 2: Replace the `return (...)` block**

Keep everything above the return. Replace with:

```tsx
  return (
    <div className="space-y-8" style={fontMono}>
      <div className="flex items-baseline gap-3.5 border-b border-dashed border-[color:var(--color-line-strong)] pb-4">
        <h2 className="text-[22px] font-bold text-[color:var(--color-foreground)]">
          <span className="text-[color:var(--color-text-faded)] font-normal">// </span>
          {isEditMode ? "review_and_save" : "review_and_deploy"}
        </h2>
        <span className="text-[12px] text-[color:var(--color-text-faded)]">
          — sanity check, then ship.
        </span>
      </div>

      <div className="grid gap-4">
        <ReviewBlock title="school">
          <Row k="name" v={school.name} />
          <Row k="mascot" v={school.mascot} />
          <Row k="app_name" v={school.appName} />
          <Row k="year" v={school.academicYear} />
          {cityState && <Row k="location" v={cityState} />}
        </ReviewBlock>

        <ReviewBlock title="colors">
          <Row k="primary" v={data.colors.primary} swatch={data.colors.primary} />
          <Row k="accent" v={data.colors.accent} swatch={data.colors.accent} />
        </ReviewBlock>

        <ReviewBlock title="schedule">
          <Row k="day_types" v={`${dayTypeCount}`} />
          <Row k="lunch_waves" v={`${lunchWaveCount}`} />
        </ReviewBlock>

        <ReviewBlock title="calendar">
          <Row k="no_school" v={`${calendar.noSchoolDates.length}`} />
          <Row k="events" v={`${calendar.events.length}`} />
        </ReviewBlock>

        <ReviewBlock title="features">
          <Row k="events_calendar" v={features.events ? "enabled" : "disabled"} />
          <Row k="productivity" v={features.productivity ? "enabled" : "disabled"} />
        </ReviewBlock>

        <ReviewBlock title="contact">
          <Row k="email" v={contactEmail} />
        </ReviewBlock>
      </div>

      <button
        onClick={handleDeploy}
        disabled={!canDeploy || isDeploying}
        className="w-full cursor-pointer rounded-[3px] border border-[color:var(--color-accent)] bg-[color:var(--color-accent)] px-6 py-4 text-center text-sm font-bold uppercase tracking-[0.08em] text-black transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        style={fontMono}
      >
        {isDeploying
          ? isEditMode
            ? "./redeploy — running..."
            : "./deploy — running..."
          : isEditMode
          ? "./redeploy →"
          : "./deploy →"}
      </button>

      {!canDeploy && (
        <p className="text-center text-[11px] text-[color:var(--color-text-faded)]">
          school name and contact email are required to deploy.
        </p>
      )}

      <DeployLog
        state={deployState}
        url={deployUrl}
        error={deployError}
        isEditMode={isEditMode}
      />
    </div>
  );
}

function ReviewBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] p-4">
      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-text-faded)]">
        <span>{title}</span>
        {/* edit-link intentionally omitted: use wizard back nav; keeps scope tight */}
      </div>
      <dl className="grid grid-cols-[130px_1fr] gap-x-3 gap-y-1.5 text-[12px]">
        {children}
      </dl>
    </div>
  );
}

function Row({
  k,
  v,
  swatch,
}: {
  k: string;
  v: string | number;
  swatch?: string;
}) {
  return (
    <>
      <dt className="text-[color:var(--color-text-faded)]" style={{ fontFamily: "var(--font-mono)" }}>
        {k}
      </dt>
      <dd className="flex items-center gap-2 text-[color:var(--color-foreground)]" style={{ fontFamily: "var(--font-mono)" }}>
        {swatch && (
          <span
            className="inline-block h-2.5 w-2.5 border border-white/10"
            style={{ background: swatch }}
          />
        )}
        {v || "—"}
      </dd>
    </>
  );
}
```

Also add at the top of the file (near the other imports/consts):
```tsx
const fontMono: React.CSSProperties = { fontFamily: "var(--font-mono)" };
```

And remove the old `SectionLabel` and `Row` helpers that lived above the old `return` (they're replaced by the new `ReviewBlock` + `Row` defined at the bottom).

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add components/wizard/StepReview.tsx
git commit -m "wizard/step: terminal-restyle StepReview; swap DeployProgress → DeployLog" -m "handleDeploy timing, state machine, and endpoint selection untouched." -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Phase 6 — Login page

### Task 24: Rewrite `/login` with wizard chrome

**Files:**
- Modify: `app/login/page.tsx`

**Behavior preserved verbatim:**
- `email`, `status`, `error` state.
- `handleSubmit` POST to `/api/auth/send-link` with identical body and error handling.
- `sent` state shows confirmation card; `error` renders the error; `sending` disables the button.

- [ ] **Step 1: Replace the file contents**

```tsx
"use client";

import { useState } from "react";
import WizardTopBar from "@/components/wizard/WizardTopBar";

type Status = "idle" | "sending" | "sent" | "error";

const fontMono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

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
    <div
      className="flex min-h-screen flex-col bg-[color:var(--background)] text-[color:var(--color-foreground)]"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      <WizardTopBar />

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md" style={fontMono}>
          <div className="mb-6 border-b border-dashed border-[color:var(--color-line-strong)] pb-4">
            <h1 className="text-[22px] font-bold text-[color:var(--color-foreground)]">
              <span className="text-[color:var(--color-text-faded)] font-normal">// </span>
              auth
            </h1>
            <p className="mt-2 text-sm text-[color:var(--color-text-dim)]">
              edit your dashboard. we&apos;ll email you a magic link.
            </p>
          </div>

          {status === "sent" ? (
            <div className="rounded-[3px] border border-[color:var(--color-ok)]/40 bg-[rgba(16,185,129,0.08)] p-5">
              <p className="text-sm font-bold text-[color:var(--color-ok)]">
                ✓ check your inbox
              </p>
              <p className="mt-2 text-[13px] text-[color:var(--color-text-dim)]">
                sent a login link to{" "}
                <strong className="text-[color:var(--color-foreground)]">{email}</strong>.
                expires in 15 min.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                <label htmlFor="email" className="text-xs text-[color:var(--color-text-faded)]">
                  contact_email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@school.edu"
                  className="rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] px-3 py-2 text-[13px] text-[color:var(--color-foreground)] placeholder-[color:var(--color-text-faded)] focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-accent)]"
                  style={fontMono}
                />
              </div>

              {status === "error" && (
                <p className="text-[13px] text-[color:var(--color-accent)]">✗ {error}</p>
              )}

              <button
                type="submit"
                disabled={status === "sending" || !email.trim()}
                className="w-full cursor-pointer rounded-[3px] border border-[color:var(--color-accent)] bg-[color:var(--color-accent)] px-4 py-2.5 text-sm font-bold uppercase tracking-[0.08em] text-black hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                style={fontMono}
              >
                {status === "sending" ? "sending..." : "send magic link →"}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-[11px] text-[color:var(--color-text-faded)]">
            no dashboard yet?{" "}
            <a
              href="/setup"
              className="text-[color:var(--color-accent)] underline underline-offset-2 hover:brightness-110"
            >
              create one
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add app/login/page.tsx
git commit -m "login: rewrite with WizardTopBar + terminal styling" -m "Same send-link POST + state transitions, visual refresh only." -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Phase 7 — Homepage sections

> Canonical visual source: `C:\Dev\schoolwatch-wizard\.superpowers\brainstorm\1270-1776031590\content\homepage-zine.html`. For each task, open the mockup in a browser alongside the code; port the matching `<section>` into a React component using the `.theme-zine` tokens defined in Task 2. Use `Polaroid`, `TapedScreenshot`, `Highlight`, `MarginNote`, `HandwrittenArrow`, and `PaperNoise` where noted.
>
> **All homepage components are server components by default.** Add `"use client"` only if a component uses motion or event handlers.

### Task 25: Create `ZineNav`

**Files:**
- Create: `components/landing/ZineNav.tsx`

- [ ] **Step 1: Write the component**

```tsx
// Sticky top nav for the zine homepage. Wavy red hover underlines.
// Source: homepage-zine.html — nav.top
export default function ZineNav() {
  return (
    <nav
      className="sticky top-0 z-10 flex items-center justify-between border-b border-[color:var(--color-hairline)] bg-[color:var(--color-paper)] px-8 py-5"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
      }}
    >
      <div className="flex items-center gap-2.5 font-bold">
        <span
          className="-rotate-2 border-[1.5px] border-[color:var(--color-ink)] px-1.5 py-0.5 text-[11px] tracking-[0.04em]"
          style={{ fontFamily: "var(--font-archivo)" }}
        >
          SW
        </span>
        SchoolWatch
      </div>
      <div className="flex gap-7">
        <a href="#how" className="text-[color:var(--color-ink)] no-underline hover:[text-decoration:underline_wavy_var(--marker)] hover:underline-offset-[4px]">How it works</a>
        <a href="#showcase" className="text-[color:var(--color-ink)] no-underline hover:[text-decoration:underline_wavy_var(--marker)] hover:underline-offset-[4px]">Live example</a>
        <a href="#faq" className="text-[color:var(--color-ink)] no-underline hover:[text-decoration:underline_wavy_var(--marker)] hover:underline-offset-[4px]">FAQ</a>
        <a
          href="https://github.com/HSQ0503/schoolwatch-wizard"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[color:var(--color-ink)] no-underline hover:[text-decoration:underline_wavy_var(--marker)] hover:underline-offset-[4px]"
        >
          GitHub ↗
        </a>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Verify lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/landing/ZineNav.tsx
git commit -m "landing: add ZineNav (zine top nav with wavy hover)" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 26: Create `ZineHero`

**Files:**
- Create: `components/landing/ZineHero.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import Highlight from "./Highlight";
import HandwrittenArrow from "./HandwrittenArrow";
import Polaroid from "./Polaroid";

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

// Source: homepage-zine.html — section.hero + .hero-photos + .signals
export default function ZineHero() {
  const reduce = useReducedMotion();
  return (
    <section aria-label="Hero" className="relative px-8 pb-24 pt-20 sm:pt-28">
      <motion.div
        initial={reduce ? false : "hidden"}
        animate="visible"
        variants={container}
        className="relative max-w-[1120px] mx-auto"
      >
        <motion.p
          variants={item}
          className="text-[11px] uppercase text-[color:var(--color-ink-faded)] mb-6"
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.22em" }}
        >
          a free tool · by students · for students
        </motion.p>

        <motion.h1
          variants={item}
          className="text-[color:var(--color-ink)] font-[900] leading-[0.92] tracking-[-0.04em]"
          style={{
            fontFamily: "var(--font-archivo)",
            fontSize: "clamp(56px, 9vw, 112px)",
            maxWidth: "14ch",
          }}
        >
          Make your school&apos;s <Highlight>schedule site</Highlight>{" "}
          <span
            className="italic font-normal"
            style={{
              fontFamily: "var(--font-display)",
              fontVariationSettings: '"opsz" 144',
              letterSpacing: "-0.02em",
            }}
          >
            not suck.
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-8 text-lg leading-[1.55] text-[color:var(--color-ink-soft)]"
          style={{ fontFamily: "var(--font-display)", maxWidth: "42ch" }}
        >
          Pick colors. Set the bells. Hit deploy. You get a real live URL you can text to your friends — in about five minutes. No principal approval required.
        </motion.p>

        <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-8">
          <Link
            href="/setup"
            className="group inline-flex items-center gap-2.5 border-2 border-[color:var(--color-ink)] bg-[color:var(--color-ink)] px-7 py-4 text-[color:var(--color-paper)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
            style={{
              fontFamily: "var(--font-archivo)",
              fontSize: 16,
              boxShadow: "6px 6px 0 var(--highlight)",
            }}
          >
            Start Yours <span className="text-[22px] leading-[0]">→</span>
          </Link>
          <a
            href="https://lakerwatch.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] uppercase underline underline-offset-4 text-[color:var(--color-ink)] hover:text-[color:var(--color-marker)]"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.14em" }}
          >
            See LakerWatch ↗
          </a>
        </motion.div>

        {/* Hand-drawn "free & open source" annotation */}
        <HandwrittenArrow
          label="free & open source"
          arrow="down-left"
          rotate={4}
          className="absolute right-[6%] top-5"
        />
      </motion.div>

      {/* Photo collage */}
      <div className="relative mx-auto mt-20 h-[420px] max-w-[1120px]">
        <Polaroid
          tape
          rotation={-5}
          caption="the live one at WPS"
          className="absolute left-[2%] top-5 w-[300px] h-[220px] z-[3]"
        >
          <div className="flex h-full w-full flex-col p-3.5 text-white" style={{ background: "linear-gradient(135deg,#1a2a4a,#2a3a6a)" }}>
            <div className="text-[10px] uppercase tracking-[0.15em] opacity-70">Now</div>
            <div className="mt-5 text-[42px] font-[900] tracking-[-0.03em]" style={{ fontFamily: "var(--font-archivo)" }}>3rd</div>
            <div className="text-[10px] uppercase tracking-[0.15em] opacity-60">period · 23:41 left</div>
          </div>
        </Polaroid>
        <Polaroid
          rotation={6}
          className="absolute right-[4%] top-14 w-[260px] h-[200px] z-[2]"
        >
          <div className="flex h-full w-full flex-col justify-end p-3.5 text-white" style={{ background: "#8b2635" }}>
            <div className="text-[24px] leading-none" style={{ fontFamily: "var(--font-archivo)" }}>IT&apos;S FRIDAY.</div>
            <div className="mt-1.5 text-[11px] opacity-85">regular day · lunch wave B</div>
          </div>
        </Polaroid>
        <Polaroid
          rotation={-2}
          className="absolute left-[36%] top-[170px] w-[240px] h-[180px] z-[4]"
        >
          <div className="h-full w-full p-3.5 text-[color:var(--color-ink)]" style={{ background: "var(--paper)" }}>
            <div className="text-[10px] uppercase tracking-[0.15em] opacity-50">This week</div>
            <div className="mt-2 grid grid-cols-5 gap-0.5">
              {["M","T","W","T","F"].map((d, i) => (
                <div
                  key={i}
                  className={`h-[18px] rounded-[2px] text-center text-[9px] leading-[18px] ${
                    i === 4 ? "bg-[color:var(--color-ink)] text-[color:var(--highlight)] font-[900]" : "bg-black/5 text-[color:var(--color-ink-faded)]"
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="mt-2.5 text-[10px]" style={{ fontFamily: "var(--font-mono)" }}>
              <div className="flex justify-between border-b border-dashed border-black/10 py-0.5">1st · english<span>8:00</span></div>
              <div className="flex justify-between border-b border-dashed border-black/10 py-0.5">2nd · physics<span>8:55</span></div>
              <div className="flex justify-between border-b border-dashed border-black/10 py-0.5">3rd · history<span>9:50</span></div>
            </div>
          </div>
        </Polaroid>
      </div>
      {/* Hidden ref for next Image so build picks it up even though we use bg */}
      <div className="hidden">
        <Image src="/screenshots/lakerwatch-dashboard.png" alt="" width={1} height={1} />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/landing/ZineHero.tsx
git commit -m "landing: add ZineHero (heavy headline + polaroid collage + annotation)" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 27: Rewrite `SignalsRow.tsx`

**Files:**
- Modify: `components/landing/SignalsRow.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
// Source: homepage-zine.html — .signals
const SIGNALS: { n: string; label: string }[] = [
  { n: "5", label: "min to live" },
  { n: "0", label: "lines of code" },
  { n: "247", label: "schools running" },
  { n: "$0", label: "forever" },
];

export default function SignalsRow() {
  return (
    <section
      aria-label="Key facts"
      className="border-y-2 border-[color:var(--color-ink)] px-8 py-5"
    >
      <ul className="mx-auto flex max-w-[1120px] items-baseline justify-between gap-10 overflow-x-auto">
        {SIGNALS.map((s, i) => (
          <li key={s.label} className="flex items-baseline gap-3 whitespace-nowrap">
            <span
              className="text-[color:var(--color-marker)]"
              style={{
                fontFamily: "var(--font-archivo)",
                fontSize: 34,
                letterSpacing: "-0.03em",
              }}
            >
              {s.n}
            </span>
            <span
              className="text-[color:var(--color-ink)]"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              {s.label}
            </span>
            {i < SIGNALS.length - 1 && (
              <span
                aria-hidden="true"
                className="ml-7 mt-3 h-2.5 w-2.5 rotate-45 bg-[color:var(--color-ink)]"
              />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/landing/SignalsRow.tsx
git commit -m "landing: rewrite SignalsRow (zine — big red numerals, diamond dividers)" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 28: Create `Showcase`

**Files:**
- Create: `components/landing/Showcase.tsx`

- [ ] **Step 1: Write the component**

```tsx
import Image from "next/image";
import TapedScreenshot from "./TapedScreenshot";
import MarginNote from "./MarginNote";

// Source: homepage-zine.html — section.showcase
export default function Showcase() {
  return (
    <section id="showcase" aria-label="LakerWatch showcase" className="relative px-8 py-28">
      <div className="mx-auto max-w-[1120px]">
        <p
          className="text-[11px] uppercase text-[color:var(--color-ink-faded)] mb-4.5"
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em" }}
        >
          exhibit a · live at windermere prep
        </p>
        <h2
          className="text-[color:var(--color-ink)] font-[900] leading-[0.95] tracking-[-0.03em]"
          style={{
            fontFamily: "var(--font-archivo)",
            fontSize: "clamp(40px, 6vw, 72px)",
            maxWidth: "18ch",
          }}
        >
          A real one,{" "}
          <span
            className="italic font-normal"
            style={{
              fontFamily: "var(--font-display)",
              letterSpacing: "-0.01em",
            }}
          >
            already
          </span>{" "}
          running.
        </h2>

        <div className="mt-16 grid items-start gap-10 md:grid-cols-[1.5fr_1fr]">
          <TapedScreenshot
            rotation={-1.5}
            tapes={[
              { position: "top-left", color: "yellow" },
              { position: "top-right", color: "red" },
            ]}
          >
            <div className="relative aspect-[16/10] w-full">
              <Image
                src="/screenshots/lakerwatch-dashboard.png"
                alt="LakerWatch dashboard at Windermere Prep showing the countdown ring, current period, and upcoming events."
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 660px"
                priority
              />
            </div>
          </TapedScreenshot>

          <div className="pt-5">
            <MarginNote n={1} title="The countdown ring.">
              Every kid at WPS glances at this between classes. That&apos;s the feature.
            </MarginNote>
            <MarginNote n={2} title={'"It\'s Friday / 3rd Period."'}>
              Knows the day. Knows the period. Handles weird schedules (half-days, pep rallies, &quot;Monday is a Wednesday&quot;).
            </MarginNote>
            <MarginNote n={3} title="Your school's colors.">
              Eight zones, dark mode included. Not a palette — your actual logo-matched brand.
            </MarginNote>
            <a
              href="https://lakerwatch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block border-b-2 border-dashed border-[color:var(--color-marker)] pb-0.5 text-[color:var(--color-marker)] no-underline"
              style={{ fontFamily: "var(--font-caveat)", fontWeight: 700, fontSize: 22 }}
            >
              see lakerwatch.com →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/landing/Showcase.tsx
git commit -m "landing: add Showcase (taped screenshot + margin notes)" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 29: Create `HowItWorks`

**Files:**
- Create: `components/landing/HowItWorks.tsx`

- [ ] **Step 1: Write the component**

```tsx
import Image from "next/image";
import TapedScreenshot from "./TapedScreenshot";
import HandwrittenArrow from "./HandwrittenArrow";

// Source: homepage-zine.html — section.how
type Step = {
  n: string;
  title: string;
  body: string;
  src: string;
  annotation?: { label: string; arrow: "down-left" | "down-right" | "up-left" | "up-right"; rotate: number; className: string };
  rotation: number;
};

const STEPS: Step[] = [
  {
    n: "01",
    title: "Name your school.",
    body: "Mascot, city, academic year. The basics. Optional: drag in a logo.",
    src: "/screenshots/wizard/01-school.png",
    annotation: { label: "takes ~30s ↘", arrow: "none" as const as "down-left", rotate: -4, className: "absolute top-10 right-[40%]" }, // 'none' rendered as label-only; see below
    rotation: -1.5,
  },
  {
    n: "02",
    title: "Pick your palette.",
    body: "Two seed colors → eight zones. Click any zone on the live mockup to fine-tune. Dark mode auto-generates.",
    src: "/screenshots/wizard/02-colors.png",
    rotation: 1.5,
  },
  {
    n: "03",
    title: "Add your schedule.",
    body: "Regular days, block days, rotating days. Lunch waves handled. Friday half-day before finals? Yep.",
    src: "/screenshots/wizard/03-schedule.png",
    annotation: { label: "← weird schedules welcome", arrow: "none" as const as "down-left", rotate: 3, className: "absolute top-20 right-[35%]" },
    rotation: -1,
  },
  {
    n: "04",
    title: "Deploy.",
    body: "We send you a live URL and an email link to edit later. Done.",
    src: "/screenshots/wizard/04-deploy.png",
    rotation: 1,
  },
];

export default function HowItWorks() {
  return (
    <section id="how" aria-label="How it works" className="relative border-t border-dashed border-[color:var(--color-hairline)] px-8 py-28">
      <div className="mx-auto max-w-[1120px]">
        <p
          className="mb-4.5 text-[11px] uppercase text-[color:var(--color-ink-faded)]"
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em" }}
        >
          how it works
        </p>
        <h2
          className="text-[color:var(--color-ink)] font-[900] leading-[0.92] tracking-[-0.04em]"
          style={{
            fontFamily: "var(--font-archivo)",
            fontSize: "clamp(48px, 7vw, 88px)",
            maxWidth: "16ch",
          }}
        >
          Four screens.{" "}
          <span
            className="italic font-normal"
            style={{ fontFamily: "var(--font-display)" }}
          >
            No code.
          </span>{" "}
          No catch.
        </h2>
        <p
          className="mt-4.5 text-lg text-[color:var(--color-ink-soft)]"
          style={{ fontFamily: "var(--font-display)", maxWidth: "50ch" }}
        >
          A wizard asks you questions about your school. When you finish, it spins up a GitHub repo, builds a website, pushes it to Vercel, and texts you the URL.
        </p>

        <ol className="mt-20 grid gap-20">
          {STEPS.map((s) => (
            <li key={s.n} className="relative grid items-start gap-10 md:grid-cols-[140px_1fr_420px]">
              {/* Huge numeral */}
              <div
                aria-hidden="true"
                className="relative leading-[0.8] text-[color:var(--highlight)]"
                style={{
                  fontFamily: "var(--font-archivo)",
                  fontSize: 140,
                  WebkitTextStroke: "2px var(--ink)",
                }}
              >
                {s.n}
                <span
                  aria-hidden="true"
                  className="absolute bottom-2 left-2.5 right-2.5 h-[3px] -rotate-2 rounded-sm bg-[color:var(--color-marker)]"
                />
              </div>

              {/* Copy */}
              <div className="relative">
                <h3
                  className="text-[color:var(--color-ink)]"
                  style={{
                    fontFamily: "var(--font-archivo)",
                    fontSize: 30,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                  }}
                >
                  {s.title}
                </h3>
                <p
                  className="mt-3 text-[color:var(--color-ink-soft)]"
                  style={{ fontFamily: "var(--font-display)", fontSize: 17 }}
                >
                  {s.body}
                </p>
                {s.annotation && (
                  <HandwrittenArrow
                    label={s.annotation.label}
                    arrow="none"
                    rotate={s.annotation.rotate}
                    className={s.annotation.className}
                  />
                )}
              </div>

              {/* Thumbnail */}
              <TapedScreenshot rotation={s.rotation} tapes={[{ position: "top-left", color: "yellow" }]}>
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src={s.src}
                    alt={`SchoolWatch wizard step ${s.n}: ${s.title}`}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, 420px"
                  />
                </div>
              </TapedScreenshot>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: clean. (If TypeScript complains about `"none" as const as "down-left"` unions, simplify the `annotation.arrow` type to `"none"` — `HandwrittenArrow` already handles `"none"`; change the STEPS entries so `arrow: "none"` and type accordingly.)

- [ ] **Step 3: Commit**

```bash
git add components/landing/HowItWorks.tsx
git commit -m "landing: add HowItWorks (yellow outline numerals + tilted thumbs + annotations)" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 30: Rewrite `PullQuote.tsx`

**Files:**
- Modify: `components/landing/PullQuote.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
import Highlight from "./Highlight";

// Source: homepage-zine.html — section.pq
export default function PullQuote() {
  return (
    <section aria-label="Identity quote" className="relative px-8 py-40 text-center">
      <div className="mx-auto max-w-[768px]">
        <span aria-hidden="true" className="mx-auto mb-12 block h-1 w-[60px] bg-[color:var(--color-marker)]" />
        <blockquote
          className="text-[color:var(--color-ink)] font-normal tracking-[-0.02em]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 4.5vw, 52px)",
            lineHeight: 1.15,
            fontVariationSettings: '"opsz" 144',
          }}
        >
          Every school has <Highlight>one or two kids who build things.</Highlight>
          <span className="mt-2.5 block text-[color:var(--color-ink-faded)]">
            This is how you become one of them.
          </span>
        </blockquote>
        <cite
          className="mt-8 block not-italic text-[color:var(--color-ink-soft)]"
          style={{ fontFamily: "var(--font-caveat)", fontWeight: 700, fontSize: 22 }}
        >
          — the manifesto, basically
        </cite>
        <span aria-hidden="true" className="mx-auto mt-12 block h-1 w-[60px] bg-[color:var(--color-marker)]" />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/landing/PullQuote.tsx
git commit -m "landing: rewrite PullQuote (red rules + highlight + Caveat cite)" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 31: Rewrite `Faq.tsx`

**Files:**
- Modify: `components/landing/Faq.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
import Highlight from "./Highlight";

// Source: homepage-zine.html — section.faq
const ITEMS: { q: string; a: React.ReactNode }[] = [
  {
    q: "Is this actually free?",
    a: (
      <>
        <Highlight>Yes.</Highlight> Hosting is free (Vercel&apos;s generous free tier). A custom domain like yourschool.com is optional. Everything else is free forever.
      </>
    ),
  },
  {
    q: "Do I need my principal's approval?",
    a: (
      <>
        No. You get a real URL like <Highlight>yourschool.vercel.app</Highlight>. Share it with friends. Show your principal once it&apos;s already working and they love it.
      </>
    ),
  },
  {
    q: "My school has weird lunch waves and rotating days.",
    a: "Rotating days, block schedules, lunch waves, per-wave bell overrides, after-school periods — all handled. If it's weirder than that, email me, I'll add it.",
  },
  {
    q: "Can I change things later?",
    a: "An email link lets you edit anything — events, colors, the whole schedule. Takes effect on redeploy (about 30 seconds).",
  },
  {
    q: "Someone at my school already tried this.",
    a: "They used a worse option. Build yours anyway — whichever one gets used wins.",
  },
];

export default function Faq() {
  return (
    <section id="faq" aria-label="Frequently asked questions" className="relative border-t border-dashed border-[color:var(--color-hairline)] px-8 py-28">
      <div className="mx-auto max-w-[900px]">
        <p
          className="text-[11px] uppercase text-[color:var(--color-ink-faded)] mb-4.5"
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.2em" }}
        >
          questions you&apos;re about to ask
        </p>
        <h2
          className="text-[color:var(--color-ink)] font-[900] leading-[0.9] tracking-[-0.04em]"
          style={{ fontFamily: "var(--font-archivo)", fontSize: "clamp(48px, 7vw, 88px)" }}
        >
          Answered.{" "}
          <span className="italic font-normal" style={{ fontFamily: "var(--font-display)" }}>
            Next.
          </span>
        </h2>

        <ol className="mt-14 list-none">
          {ITEMS.map((it, i) => (
            <li
              key={it.q}
              className="grid grid-cols-[60px_1fr] gap-6 border-b border-[color:var(--color-hairline)] py-8"
            >
              <div
                className="text-[color:var(--color-marker)] leading-none"
                style={{ fontFamily: "var(--font-archivo)", fontSize: 38 }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <h4
                  className="text-[color:var(--color-ink)]"
                  style={{
                    fontFamily: "var(--font-archivo)",
                    fontSize: 22,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.2,
                  }}
                >
                  {it.q}
                </h4>
                <p
                  className="mt-2.5 text-[color:var(--color-ink-soft)]"
                  style={{ fontFamily: "var(--font-display)", fontSize: 17, lineHeight: 1.5 }}
                >
                  {it.a}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/landing/Faq.tsx
git commit -m "landing: rewrite Faq (Archivo numerals + Fraunces headline + Highlight pulls)" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 32: Rewrite `FinalCta.tsx`

**Files:**
- Modify: `components/landing/FinalCta.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
import Link from "next/link";

// Source: homepage-zine.html — section.final (flips to black paper, candy stripe top)
export default function FinalCta() {
  return (
    <section
      aria-label="Get started"
      className="relative mt-10 px-8 py-40 text-center text-[color:var(--color-paper)]"
      style={{ background: "var(--ink)" }}
    >
      {/* Candy-stripe top edge */}
      <span
        aria-hidden="true"
        className="absolute left-0 right-0 top-0 h-3"
        style={{
          background:
            "repeating-linear-gradient(135deg, var(--highlight) 0 20px, transparent 20px 40px), var(--marker)",
        }}
      />
      <div className="mx-auto max-w-[768px]">
        <h2
          className="text-[color:var(--color-paper)] font-[900] leading-[0.92] tracking-[-0.04em]"
          style={{ fontFamily: "var(--font-archivo)", fontSize: "clamp(56px, 9vw, 120px)" }}
        >
          You&apos;re still{" "}
          <span
            className="inline-block bg-[color:var(--highlight)] px-3 text-[color:var(--color-ink)]"
            style={{
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
            }}
          >
            reading.
          </span>
        </h2>
        <p
          className="mt-6 text-[color:var(--color-paper)]/80"
          style={{ fontFamily: "var(--font-display)", fontSize: 19 }}
        >
          Go build it. Five minutes. No signup. Live when you&apos;re done.
        </p>

        <Link
          href="/setup"
          className="mt-10 inline-flex items-center gap-3.5 border-[3px] border-[color:var(--color-paper)] bg-[color:var(--highlight)] px-10 py-5 text-[color:var(--color-ink)]"
          style={{
            fontFamily: "var(--font-archivo)",
            fontSize: 20,
            boxShadow: "8px 8px 0 var(--marker)",
          }}
        >
          Start Yours →
        </Link>

        <div
          className="mt-8 inline-block -rotate-2 rounded border-2 border-dashed border-[color:var(--highlight)] px-5 py-2.5 text-[color:var(--highlight)]"
          style={{ fontFamily: "var(--font-caveat)", fontWeight: 700, fontSize: 22 }}
        >
          open source · MIT · made at WPS
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/landing/FinalCta.tsx
git commit -m "landing: rewrite FinalCta (black paper, yellow highlight, marker shadow)" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 33: Rewrite `Footer.tsx` (absorbs `OpenSourceBlock`)

**Files:**
- Modify: `components/landing/Footer.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
// Source: homepage-zine.html — <footer> + OpenSourceBlock's pills merged as a row above the main line.
export default function Footer() {
  return (
    <footer
      className="border-t border-[color:var(--color-hairline)] px-8 py-10"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <div className="mx-auto flex max-w-[1120px] flex-col gap-6">
        {/* Open-source pills */}
        <ul className="flex flex-wrap items-center gap-3 text-[11px] uppercase text-[color:var(--color-ink-faded)]" style={{ letterSpacing: "0.22em" }}>
          <li>
            <a
              href="https://github.com/HSQ0503/schoolwatch-wizard"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[color:var(--color-hairline)] px-3 py-1 text-[color:var(--color-ink)] no-underline hover:border-[color:var(--color-marker)]"
            >
              GitHub
            </a>
          </li>
          <li className="rounded-full border border-[color:var(--color-hairline)] px-3 py-1">
            Vercel
          </li>
          <li className="rounded-full border border-[color:var(--color-hairline)] px-3 py-1">
            MIT License
          </li>
        </ul>

        {/* Main line */}
        <div className="flex flex-col items-start justify-between gap-4 text-[12px] text-[color:var(--color-ink-faded)] sm:flex-row sm:items-center">
          <p>
            SchoolWatch · made by{" "}
            <a href="#" className="text-[color:var(--color-ink)] underline decoration-[color:var(--color-marker)] underline-offset-2">Guga</a>{" "}
            and{" "}
            <a href="#" className="text-[color:var(--color-ink)] underline decoration-[color:var(--color-marker)] underline-offset-2">Han</a>{" "}
            @ WPS
          </p>
          <div className="flex gap-6">
            <a
              href="https://github.com/HSQ0503/schoolwatch-wizard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[color:var(--color-ink)] underline decoration-[color:var(--color-marker)] underline-offset-2"
            >
              GitHub
            </a>
            <a
              href="https://lakerwatch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[color:var(--color-ink)] underline decoration-[color:var(--color-marker)] underline-offset-2"
            >
              LakerWatch.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add components/landing/Footer.tsx
git commit -m "landing: rewrite Footer; absorb OpenSourceBlock pills" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Phase 8 — Homepage composition

### Task 34: Update `app/page.tsx` composition + `.theme-zine` wrapper

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace file contents**

```tsx
import Faq from "@/components/landing/Faq";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/landing/Footer";
import HowItWorks from "@/components/landing/HowItWorks";
import PaperNoise from "@/components/landing/PaperNoise";
import PullQuote from "@/components/landing/PullQuote";
import Showcase from "@/components/landing/Showcase";
import SignalsRow from "@/components/landing/SignalsRow";
import ZineHero from "@/components/landing/ZineHero";
import ZineNav from "@/components/landing/ZineNav";

export default function Home() {
  return (
    <main className="theme-zine relative">
      <PaperNoise />
      <ZineNav />
      <ZineHero />
      <SignalsRow />
      <Showcase />
      <HowItWorks />
      <PullQuote />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: clean. If build errors reference missing deleted components, continue to the cleanup task (Phase 10) which removes them.

- [ ] **Step 3: Smoke-test in the browser**

`npm run dev` → http://localhost:3000. Scroll through the whole page. Confirm:
- Cream paper background, black ink, yellow highlights, red marker accents.
- Three polaroid collage in the hero overlaps correctly at desktop width.
- HowItWorks thumbnails show screenshots (placeholders are fine until Task 35 regenerates them).
- FinalCta candy stripe at the top edge renders; button has red drop shadow.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "home: compose zine homepage (Hero → Signals → Showcase → How → Quote → FAQ → CTA → Footer)" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Phase 9 — Regenerate wizard screenshots

### Task 35: Capture four fresh wizard screenshots

**Files:**
- Replace: `public/screenshots/wizard/01-school.png`
- Replace: `public/screenshots/wizard/02-colors.png`
- Replace: `public/screenshots/wizard/03-schedule.png`
- Replace: `public/screenshots/wizard/04-deploy.png`

**Target aspect ratio:** 16:10. Existing file dimensions set the bar; match approximately.

- [ ] **Step 1: Start the dev server and seed values**

Run: `npm run dev`. Open http://localhost:3000/setup.

- [ ] **Step 2: Capture step 01 — `StepSchoolInfo`**

Fill in:
- name: `Windermere Preparatory School`
- short_name: `Windermere Prep`
- acronym: `WPS`
- mascot: `Lakers`
- app_name: `LakerWatch`
- city: `Windermere`
- state: `Florida`
- state_code: `FL`
- academic_year: `2025–2026`
- contact_email: `shan@windermereprep.edu`

Take a full-viewport screenshot at 1600×1000 (macOS: `⇧⌘4 → space → click`; Windows: Snipping Tool). Crop to 16:10 showing the top bar, progress, form, and right-pane config preview. Save as `public/screenshots/wizard/01-school.png`.

- [ ] **Step 3: Capture step 02 — `StepColors`**

Advance. Keep primary/accent defaults or set `#003da5` / `#ffd23c`. Override `heading` to `#8b2635` to demonstrate the `*` marker. Ensure the live dashboard preview is in light mode and visible. Screenshot → `02-colors.png`.

- [ ] **Step 4: Capture step 03 — `StepSchedule`**

Advance. Keep the default Regular Day. Add four periods:
- `1st Period` 08:00 → 08:50
- `2nd Period` 08:55 → 09:45
- `3rd Period` 09:50 → 10:40
- `Break` 10:40 → 10:55

Screenshot showing the day-type cards + bell table and the right-pane growing schedule config. → `03-schedule.png`.

- [ ] **Step 5: Capture step 07 — `StepReview` (with a simulated deploy in flight)**

Advance to the final step. Click `./deploy →`. The deploy will actually run — **use a throwaway email you control OR stop the network request before save** (browser devtools → Network → right-click `/api/deploy` → "Block request URL"). The `DeployLog` will still render its local state-machine progression. Take the screenshot when `deployState === "deploying"` and the log shows the pending `● waiting for deployment` line. → `04-deploy.png`.

If blocking the request is awkward, temporarily modify `StepReview.handleDeploy` to comment out the `fetch` call and leave only the `setDeployState` transitions for the screenshot, then revert before committing.

- [ ] **Step 6: Verify the homepage picks up the new assets**

`npm run dev` → http://localhost:3000 → scroll to How it works. Thumbnails now show the new wizard screens.

- [ ] **Step 7: Commit**

```bash
git add public/screenshots/wizard/01-school.png public/screenshots/wizard/02-colors.png public/screenshots/wizard/03-schedule.png public/screenshots/wizard/04-deploy.png
git commit -m "screens: regenerate wizard screenshots for HowItWorks section" -m "Captured from the redesigned terminal wizard at 1600×1000 and cropped to 16:10 to match HowItWorks thumbnail aspect." -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Phase 10 — Cleanup

### Task 36: Delete replaced components

**Files to delete:**
- `components/landing/Hero.tsx`
- `components/landing/LakerWatchShowcase.tsx`
- `components/landing/WizardPreview.tsx`
- `components/landing/OpenSourceBlock.tsx`
- `components/landing/SectionDivider.tsx`
- `components/landing/Arrow.tsx`
- `components/landing/Reveal.tsx`
- `components/DeployProgress.tsx`

- [ ] **Step 1: Confirm no imports remain**

Run:
```bash
git grep -l "from \"@/components/landing/Hero\"" ; \
git grep -l "from \"./Hero\"" ; \
git grep -l "from \"@/components/landing/LakerWatchShowcase\"" ; \
git grep -l "from \"@/components/landing/WizardPreview\"" ; \
git grep -l "from \"@/components/landing/OpenSourceBlock\"" ; \
git grep -l "from \"@/components/landing/SectionDivider\"" ; \
git grep -l "from \"./SectionDivider\"" ; \
git grep -l "from \"@/components/landing/Arrow\"" ; \
git grep -l "from \"./Arrow\"" ; \
git grep -l "from \"@/components/landing/Reveal\"" ; \
git grep -l "from \"./Reveal\"" ; \
git grep -l "from \"@/components/DeployProgress\""
```
Expected: all outputs empty. If anything shows up, open that file and remove the stale import (it should already be unused after earlier tasks).

- [ ] **Step 2: Delete the files**

```bash
git rm components/landing/Hero.tsx \
       components/landing/LakerWatchShowcase.tsx \
       components/landing/WizardPreview.tsx \
       components/landing/OpenSourceBlock.tsx \
       components/landing/SectionDivider.tsx \
       components/landing/Arrow.tsx \
       components/landing/Reveal.tsx \
       components/DeployProgress.tsx
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: clean. If any "Cannot find module" error fires, a stale import survived Step 1 — fix it and re-run.

- [ ] **Step 4: Commit**

```bash
git commit -m "cleanup: delete replaced landing + wizard components" -m "Hero / LakerWatchShowcase / WizardPreview / OpenSourceBlock / SectionDivider / Arrow / Reveal / DeployProgress — all superseded by the zine + terminal redesign." -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Phase 11 — Final verification

### Task 37: Full lint + build + manual acceptance

**Files:** none modified.

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: clean, zero warnings.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: clean build. No TypeScript errors, no font-loading errors.

- [ ] **Step 3: Manual acceptance — homepage (`/`)**

`npm run dev` → http://localhost:3000. Walk through each acceptance item from spec §10:

- [ ] Cream paper + ink + highlighter yellow + marker red tokens rendering.
- [ ] 9 sections in order: nav → hero → signals → showcase → how → quote → faq → CTA → footer.
- [ ] No leftover "random red dots" from the old `SectionDivider`.
- [ ] Polaroid collage overlaps correctly at ≥1024px; stacks cleanly on mobile.
- [ ] `HowItWorks` thumbnails show the newly captured wizard screenshots.
- [ ] `FinalCta` candy stripe + button with marker drop-shadow visible.
- [ ] All links keyboard-focusable; focus ring visible.
- [ ] With `prefers-reduced-motion` forced on (DevTools → Rendering → emulate CSS media feature): all rotations flatten, animations stop.

- [ ] **Step 4: Manual acceptance — wizard (`/setup`)**

- [ ] Top bar (SW stamp + green live-dot + kbd hints) visible.
- [ ] Progress strip shows 7 cells; active cell has hatched animation + coral glow.
- [ ] Right pane always shows a syntax-highlighted `school.config.ts` that updates as you type.
- [ ] Navigating to a new step highlights the corresponding block in the config preview.
- [ ] Step 2 (Colors): seed changes cascade; zone click opens popover; `*` marker appears on overridden zones; dark preview/customize/back-to-light buttons work.
- [ ] Step 7 (Review): `./deploy →` button runs the real deploy flow against the API (only on a test school email you control). The deploy log shows timestamped lines and the final `→ https://...vercel.app` URL.
- [ ] Validation: leaving School Info required fields empty and clicking `next →` shows the warn panel (not advancing).
- [ ] Bottom status bar shows `● valid` or `▲ N issues to fix` matching state.

- [ ] **Step 5: Manual acceptance — edit (`/edit?token=<real-magic-link>`)**

- [ ] Clicking a real magic link (deploy a test school to generate one) rehydrates the wizard with that school's data.
- [ ] Legacy flat `{ primary, accent }` migration still runs (spec §3.3). If you have an old school row in Mongo without `colors.light`, it migrates on load without error.

- [ ] **Step 6: Manual acceptance — login (`/login`)**

- [ ] WizardTopBar chrome visible.
- [ ] `send magic link →` submits the form; success shows the green `✓ check your inbox` card; error shows red `✗` text.

- [ ] **Step 7: Acceptance checklist — spec §10**

Open `docs/superpowers/specs/2026-04-12-wizard-and-homepage-redesign-design.md` §10 and mentally tick each item. Flag any unchecked items back to the user.

- [ ] **Step 8: Final commit (if any trailing fixups)**

If anything was adjusted during acceptance, commit it. Otherwise skip.

```bash
git add -A
git commit -m "redesign: acceptance pass tweaks" -m "Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Self-Review Notes

**Spec coverage check** (spec §9 ↔ plan tasks):
- Added files (15) — all have creation tasks in Phases 2, 3, 7 (Tasks 3–15, 25, 26, 28, 29).
- Modified files (18) — all have rewrite tasks:
  - `app/layout.tsx` → Task 1
  - `app/globals.css` → Task 2
  - `app/page.tsx` → Task 34
  - `app/setup/page.tsx` → unchanged (confirmed, no task needed)
  - `app/edit/page.tsx` → unchanged (confirmed, no task needed)
  - `app/login/page.tsx` → Task 24
  - `components/WizardShell.tsx` → Task 16
  - `components/landing/Faq.tsx` → Task 31
  - `components/landing/FinalCta.tsx` → Task 32
  - `components/landing/PullQuote.tsx` → Task 30
  - `components/landing/Footer.tsx` → Task 33
  - `components/landing/SignalsRow.tsx` → Task 27
  - All 7 step components → Tasks 17–23
  - 4 wizard screenshots → Task 35
- Deleted files (9, including `Noise.tsx` which is replaced in Task 8) — Task 8 handles Noise deletion; Task 36 handles the rest.

**Behavior preservation spot-check** (spec §3):
- `STEPS` + `DEFAULT_FORM_DATA` identical → Task 16 keeps the literal block.
- `validateStep` untouched → no task modifies `lib/validation.ts`.
- `generateConfigTs` untouched → no task modifies `lib/config-generator.ts`; `ConfigPreview` (Task 13) consumes it.
- `deploy` / `redeploy` endpoints untouched → no task modifies `app/api/**`.
- Color math (`defaultLightColors` / `deriveDarkColors` / `resolveDarkColors`) untouched → no task modifies `lib/colors.ts`.
- `StepErrorBoundary`, step logging, validation re-compute, showErrors reset — all preserved in Task 16.
- `handleDeploy` in `StepReview` preserved → Task 23 explicitly says "do not touch".
- Legacy color migration in `edit/page.tsx` preserved → `edit/page.tsx` is in the unchanged list.

**Terminology consistency check:**
- `DeployLog` + `DeployState` union + prop shape match between Task 15 and Task 23.
- `ConfigPreview` prop shape (`data`, `activeStep`) matches its consumer in Task 16.
- `StatusBar` prop shape matches its consumer in Task 16.
- `HandwrittenArrow` arrow enum `"none"` is correctly referenced in Task 29 (minor type cleanup noted in the task).

**Ambiguities resolved inline.** No TBDs or placeholders remain.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-12-wizard-and-homepage-redesign.md`. Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
