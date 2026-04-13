# Homepage Premium Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the existing 7-section landing page from "solid first pass" to a premium, product-grade experience via typography pairing (Fraunces + Geist), signals row, depth layering, custom arrows, tightened copy, an open-source footer block, and a scrollytelling redesign of the wizard preview.

**Architecture:** Continue on `feat/homepage-redesign`. Keep the existing component structure under `components/landing/` — add three new shared primitives (Arrow, SectionDivider), two new sections (SignalsRow, OpenSourceBlock), and update all existing sections. The `WizardPreview` gets fully rewritten as a client-side scrollytelling section using `useScroll` + `useTransform` from `motion/react`.

**Tech Stack:** Next.js 16.2.3 App Router, React 19, TypeScript 5, Tailwind CSS v4 (`@theme inline`), `next/font/google` (adds Fraunces), `motion/react` (already installed — adds `useScroll`/`useTransform` usage).

**Spec:** `docs/superpowers/specs/2026-04-12-homepage-premium-upgrade-design.md`

**Prior state:** Branch `feat/homepage-redesign` at commit `6c1c358`. First-pass homepage is complete and working.

---

## Task 1: Add Fraunces font + display CSS variable

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Update `app/layout.tsx` to load Fraunces alongside Geist**

Replace the entire contents of `app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
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
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} font-sans min-h-full`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Update `app/globals.css` to expose the display font var**

In `app/globals.css`, inside the existing `@theme inline { ... }` block, add one line just below `--font-mono: var(--font-geist-mono);`:

```css
  --font-display: var(--font-fraunces);
```

The final `@theme inline` block should look like:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* Fixed-alpha tokens — consume via var() directly, do not use Tailwind opacity modifiers (e.g. /50). */
  --color-surface: rgba(255, 255, 255, 0.03);
  --color-border-hairline: rgba(255, 255, 255, 0.08);
  --color-body: #a1a1aa;
  --color-label: #e4e4e7;
  --color-accent: #ff6363;
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --font-display: var(--font-fraunces);
}
```

- [ ] **Step 3: Verify build passes**

Run:
```bash
npm run build
```
Expected: build succeeds, all 13 pages generated.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css
git commit -m "Add Fraunces display font and --font-display CSS var"
```

---

## Task 2: Create the Arrow component

**Files:**
- Create: `components/landing/Arrow.tsx`

- [ ] **Step 1: Create the Arrow component**

Create `components/landing/Arrow.tsx`:

```tsx
type ArrowProps = {
  className?: string;
};

export default function Arrow({ className = "" }: ArrowProps) {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="14"
      viewBox="0 0 16 14"
      fill="none"
      className={`inline-block translate-y-[1px] transition-transform duration-200 group-hover:translate-x-1 ${className}`}
    >
      <path
        d="M1 7h14m0 0L9 1m6 6l-6 6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
```

- [ ] **Step 2: Lint**

```bash
npm run lint
```
Expected: no errors in `components/landing/Arrow.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/landing/Arrow.tsx
git commit -m "Add Arrow SVG component for CTA hover slide"
```

---

## Task 3: Create the SectionDivider component

**Files:**
- Create: `components/landing/SectionDivider.tsx`

- [ ] **Step 1: Create the SectionDivider component**

Create `components/landing/SectionDivider.tsx`:

```tsx
export default function SectionDivider() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-center"
    >
      <div className="h-px w-full bg-[color:var(--color-border-hairline)]" />
      <div className="absolute h-1 w-1 rotate-45 bg-[color:var(--color-accent)]" />
    </div>
  );
}
```

- [ ] **Step 2: Lint**

```bash
npm run lint
```

- [ ] **Step 3: Commit**

```bash
git add components/landing/SectionDivider.tsx
git commit -m "Add SectionDivider primitive with crimson diamond mark"
```

---

## Task 4: Restore `delay` prop on Reveal

**Files:**
- Modify: `components/landing/Reveal.tsx`

- [ ] **Step 1: Replace the contents of `components/landing/Reveal.tsx`**

```tsx
"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
};

export default function Reveal({ children, delay = 0 }: RevealProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      className="w-full"
      initial={shouldReduce ? false : { opacity: 0, y: 24 }}
      whileInView={shouldReduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Lint + build**

```bash
npm run lint && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add components/landing/Reveal.tsx
git commit -m "Restore delay prop on Reveal for staggered children"
```

---

## Task 5: Create SignalsRow section

**Files:**
- Create: `components/landing/SignalsRow.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/landing/SignalsRow.tsx`**

```tsx
const SIGNALS = ["5 min to live", "0 lines of code", "Open source"];

export default function SignalsRow() {
  return (
    <section
      aria-label="Key facts about SchoolWatch"
      className="border-y border-[color:var(--color-border-hairline)] px-6 py-5"
    >
      <ul className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
        {SIGNALS.map((label, i) => (
          <li
            key={label}
            className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-label)]"
          >
            {i > 0 && (
              <span
                aria-hidden="true"
                className="hidden h-1 w-1 rounded-full bg-[color:var(--color-accent)] sm:inline-block"
              />
            )}
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 2: Update `app/page.tsx` to render SignalsRow between Hero and LakerWatchShowcase**

```tsx
import Faq from "@/components/landing/Faq";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import LakerWatchShowcase from "@/components/landing/LakerWatchShowcase";
import Noise from "@/components/landing/Noise";
import PullQuote from "@/components/landing/PullQuote";
import SignalsRow from "@/components/landing/SignalsRow";
import WizardPreview from "@/components/landing/WizardPreview";

export default function Home() {
  return (
    <main className="relative">
      <Noise />
      <Hero />
      <SignalsRow />
      <LakerWatchShowcase />
      <WizardPreview />
      <PullQuote />
      <Faq />
      <FinalCta />
      <Footer />
    </main>
  );
}
```

- [ ] **Step 3: Visual check**

```bash
npm run dev
```
Open `http://localhost:3000`. Expected: a thin horizontal strip between the Hero and the LakerWatch showcase showing three uppercase mono labels with crimson dots between them. Stop dev server.

- [ ] **Step 4: Lint + build**

```bash
npm run lint && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add components/landing/SignalsRow.tsx app/page.tsx
git commit -m "Add SignalsRow trust strip between Hero and Showcase"
```

---

## Task 6: Update Hero — Fraunces h1, Arrow, page-load stagger, breathing glow

**Files:**
- Modify: `components/landing/Hero.tsx`

- [ ] **Step 1: Replace the entire contents of `components/landing/Hero.tsx`**

```tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import Arrow from "./Arrow";

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Hero() {
  const shouldReduce = useReducedMotion();

  return (
    <section
      aria-label="Hero"
      className="relative overflow-hidden px-6 pb-24 pt-20 sm:pt-28"
    >
      {/* Breathing radial glow behind headline. rgba(255,99,99,…) matches --color-accent. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-24 h-[520px] w-[820px] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(255,99,99,0.18), transparent 70%)" }}
        animate={
          shouldReduce
            ? undefined
            : { opacity: [0.75, 1, 0.75] }
        }
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.1fr_1fr] md:gap-16"
        initial={shouldReduce ? false : "hidden"}
        animate="visible"
        variants={container}
      >
        {/* Left: copy + CTAs */}
        <div className="relative">
          <motion.p
            variants={item}
            className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-label)]"
          >
            SchoolWatch
          </motion.p>
          <motion.h1
            variants={item}
            className="mt-5 max-w-[14ch] text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl md:text-[4.25rem] font-[family-name:var(--font-display)]"
            style={{ fontVariationSettings: '"opsz" 144' }}
          >
            Build the schedule app your school never made.
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-6 max-w-md text-base leading-relaxed text-[color:var(--color-body)]"
          >
            Pick colors. Set the schedule. Hit deploy. Five minutes, no code, free.
          </motion.p>

          <motion.div variants={item} className="mt-10 flex flex-wrap items-center gap-5">
            <Link
              href="/setup"
              className="group inline-flex items-center gap-2 rounded-lg bg-[color:var(--color-accent)] px-6 py-3 text-sm font-semibold text-black transition-[filter] duration-150 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-accent)] focus-visible:outline-offset-2"
            >
              Start Yours <Arrow />
            </Link>
            <a
              href="https://lakerwatch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-accent)] focus-visible:outline-offset-2"
            >
              See LakerWatch <Arrow />
            </a>
          </motion.div>

          <motion.ul variants={item} className="mt-8 flex flex-wrap gap-2">
            {["Free", "5 minutes", "No code"].map((label) => (
              <li
                key={label}
                className="rounded-full border border-[color:var(--color-border-hairline)] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[color:var(--color-label)]"
              >
                {label}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Right: screenshot window */}
        <motion.div variants={item} className="relative">
          <div
            className="relative aspect-[4/3] w-full rotate-[2deg] rounded-xl border border-[color:var(--color-border-hairline)] bg-[color:var(--color-surface)] shadow-2xl"
            style={{ boxShadow: "0 40px 120px -20px rgba(255,99,99,0.15)" }}
          >
            <div
              aria-hidden="true"
              className="flex items-center gap-1.5 border-b border-[color:var(--color-border-hairline)] px-3 py-2.5"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="ml-3 font-mono text-[10px] text-white/30">
                lakerwatch.com
              </span>
            </div>
            <div className="relative h-[calc(100%-2.25rem)] w-full overflow-hidden">
              <Image
                src="/screenshots/lakerwatch-dashboard.png"
                alt="LakerWatch dashboard at Windermere Prep, showing a live countdown ring, the current period, and the school calendar."
                fill
                className="object-cover object-top"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
```

**Note:** Hero is now a client component (`"use client"`) because it uses `useReducedMotion` and `motion` variants. The `<Image>` tag is preserved from the prior pass — `fill` mode works because the window wrapper has explicit sizing via `aspect-[4/3]`.

- [ ] **Step 2: Visual check**

```bash
npm run dev
```
Expected:
- Hero elements fade up sequentially on load (eyebrow → headline → subhead → CTAs → pills → screenshot)
- Headline rendered in Fraunces (editorial serif)
- Radial glow pulses gently (7-second cycle)
- Both CTAs have arrow icons that slide right on hover
- Primary CTA brightens slightly on hover
Stop dev server.

- [ ] **Step 3: Lint + build**

```bash
npm run lint && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add components/landing/Hero.tsx
git commit -m "Premium Hero: Fraunces h1, stagger load, breathing glow, Arrow CTAs"
```

---

## Task 7: Update LakerWatchShowcase — Fraunces h2, SectionDivider, bg gradient, staggered callouts, Arrow

**Files:**
- Modify: `components/landing/LakerWatchShowcase.tsx`

- [ ] **Step 1: Replace the entire contents of `components/landing/LakerWatchShowcase.tsx`**

```tsx
import Image from "next/image";
import Arrow from "./Arrow";
import Reveal from "./Reveal";
import SectionDivider from "./SectionDivider";

type Callout = {
  position: string;
  title: string;
  body: string;
};

const CALLOUTS: Callout[] = [
  {
    position: "top-[18%] left-[-12%]",
    title: "Live countdown ring",
    body: "Checked by every kid between classes.",
  },
  {
    position: "top-[10%] right-[-10%]",
    title: '"It\'s Friday / 3rd Period"',
    body: "Knows what day it is. Knows what period you're in.",
  },
  {
    position: "bottom-[22%] left-[-12%]",
    title: "Next-event card",
    body: "Spirit day, homecoming, early dismissal — all of it.",
  },
  {
    position: "bottom-[8%] right-[-10%]",
    title: "Your school's colors",
    body: "Eight color zones, dark mode included.",
  },
];

export default function LakerWatchShowcase() {
  return (
    <section
      aria-label="LakerWatch showcase"
      className="relative px-6 py-28"
      style={{
        background:
          "linear-gradient(180deg, #0a0a0a 0%, #0b0b0e 50%, #0a0a0a 100%)",
      }}
    >
      <SectionDivider />
      {/* Narrower than other sections so overhanging callout cards at lg+ have room to breathe. */}
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-label)]">
          Live at Windermere Prep
        </p>
        <h2
          className="mt-4 max-w-[20ch] text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-white md:text-5xl font-[family-name:var(--font-display)]"
          style={{ fontVariationSettings: '"opsz" 72' }}
        >
          A real student-built dashboard. Running right now.
        </h2>

        {/* Desktop (lg+): screenshot + absolutely-positioned callouts */}
        <div className="relative mx-auto mt-20 hidden w-full max-w-3xl lg:block">
          <div className="relative aspect-[16/10] w-full rounded-xl border border-[color:var(--color-border-hairline)] bg-[color:var(--color-surface)] shadow-2xl">
            <div
              aria-hidden="true"
              className="flex items-center gap-1.5 border-b border-[color:var(--color-border-hairline)] px-3 py-2.5"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="ml-3 font-mono text-[10px] text-white/30">
                lakerwatch.com
              </span>
            </div>
            <div className="relative h-[calc(100%-2.25rem)] w-full overflow-hidden">
              <Image
                src="/screenshots/lakerwatch-dashboard.png"
                alt="LakerWatch dashboard at Windermere Prep, showing a live countdown ring, the current period, and the school calendar."
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 768px"
              />
            </div>
          </div>

          {CALLOUTS.map((c, i) => (
            <div
              key={c.title}
              className={`absolute ${c.position} w-44`}
            >
              <Reveal delay={i * 0.12}>
                <div className="rounded-lg border border-[color:var(--color-border-hairline)] bg-black/80 p-3 backdrop-blur">
                  <p className="text-[13px] font-semibold text-white">{c.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[color:var(--color-body)]">
                    {c.body}
                  </p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>

        {/* Tablet / mobile (< lg): screenshot + list */}
        <div className="mt-16 lg:hidden">
          <div className="relative aspect-[16/10] w-full rounded-xl border border-[color:var(--color-border-hairline)] bg-[color:var(--color-surface)]">
            <div
              aria-hidden="true"
              className="flex items-center gap-1.5 border-b border-[color:var(--color-border-hairline)] px-3 py-2"
            >
              <span className="h-2 w-2 rounded-full bg-white/10" />
              <span className="h-2 w-2 rounded-full bg-white/10" />
              <span className="h-2 w-2 rounded-full bg-white/10" />
            </div>
            <div className="relative h-[calc(100%-1.75rem)] w-full overflow-hidden">
              <Image
                src="/screenshots/lakerwatch-dashboard.png"
                alt="LakerWatch dashboard at Windermere Prep, showing a live countdown ring, the current period, and the school calendar."
                fill
                className="object-cover object-top"
                sizes="100vw"
              />
            </div>
          </div>
          <ul className="mt-8 space-y-5">
            {CALLOUTS.map((c, i) => (
              <li key={c.title}>
                <Reveal delay={i * 0.1}>
                  <div>
                    <p className="text-sm font-semibold text-white">{c.title}</p>
                    <p className="mt-1 text-sm text-[color:var(--color-body)]">
                      {c.body}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-20 flex justify-center">
          <a
            href="https://lakerwatch.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[color:var(--color-label)] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-accent)] focus-visible:outline-offset-2"
          >
            lakerwatch.com <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Visual check**

```bash
npm run dev
```
Expected:
- Showcase section has a subtle gradient wash (slightly lighter in the middle)
- Thin hairline with a small crimson diamond at the top of the section
- H2 rendered in Fraunces
- Callouts (desktop) fade in sequentially with 120ms between each
- "lakerwatch.com" link has a sliding arrow on hover

Stop dev server.

- [ ] **Step 3: Lint + build**

```bash
npm run lint && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add components/landing/LakerWatchShowcase.tsx
git commit -m "Premium Showcase: Fraunces h2, divider, gradient wash, staggered callouts, Arrow"
```

---

## Task 8: Rewrite WizardPreview as scrollytelling

**Files:**
- Modify: `components/landing/WizardPreview.tsx` (full rewrite)

- [ ] **Step 1: Replace the entire contents of `components/landing/WizardPreview.tsx`**

```tsx
"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import SectionDivider from "./SectionDivider";

type Step = {
  n: string;
  src: string;
  title: string;
  body: string;
};

const STEPS: Step[] = [
  {
    n: "01",
    src: "/screenshots/wizard/01-school.png",
    title: "Name your school.",
    body: "Mascot, colors, academic year. The basics.",
  },
  {
    n: "02",
    src: "/screenshots/wizard/02-colors.png",
    title: "Pick your palette.",
    body: "Two seed colors, eight zones, dark mode included.",
  },
  {
    n: "03",
    src: "/screenshots/wizard/03-schedule.png",
    title: "Add your schedule.",
    body: "Simple, block, or rotating. Lunch waves handled.",
  },
  {
    n: "04",
    src: "/screenshots/wizard/04-deploy.png",
    title: "Deploy.",
    body: "We send you a live URL. Share it with your friends.",
  },
];

export default function WizardPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 30%"],
  });

  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      aria-label="How it works"
      className="relative px-6 py-28"
    >
      <SectionDivider />
      <div className="mx-auto max-w-4xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-label)]">
          How it works
        </p>
        <h2
          className="mt-4 max-w-[22ch] text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-white md:text-5xl font-[family-name:var(--font-display)]"
          style={{ fontVariationSettings: '"opsz" 72' }}
        >
          Four screens. No code. No catch.
        </h2>

        <div ref={ref} className="relative mt-20">
          {/* Vertical progress line */}
          <div
            aria-hidden="true"
            className="absolute left-4 top-0 h-full w-[2px] origin-top bg-[color:var(--color-border-hairline)] sm:left-6"
          >
            <motion.div
              style={{
                scaleY: shouldReduce ? 1 : progressScale,
                transformOrigin: "top",
              }}
              className="h-full w-full bg-[color:var(--color-accent)]"
            />
          </div>

          <ol className="space-y-20">
            {STEPS.map((s) => (
              <li key={s.n}>
                <motion.div
                  initial={shouldReduce ? false : { opacity: 0.5 }}
                  whileInView={shouldReduce ? undefined : { opacity: 1 }}
                  viewport={{ once: false, amount: 0.55, margin: "0px 0px -20% 0px" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="grid grid-cols-[auto_1fr] gap-6 pl-12 sm:gap-10 sm:pl-16"
                >
                  <motion.p
                    initial={shouldReduce ? false : { color: "rgba(255,255,255,0.3)" }}
                    whileInView={shouldReduce ? undefined : { color: "#ffffff" }}
                    viewport={{ once: false, amount: 0.55 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="-ml-12 w-12 text-right font-mono text-3xl font-semibold leading-none sm:-ml-16 sm:w-16 sm:text-4xl font-[family-name:var(--font-display)]"
                    style={{ fontVariationSettings: '"opsz" 72' }}
                  >
                    {s.n}
                  </motion.p>

                  <div>
                    <motion.div
                      initial={shouldReduce ? false : { opacity: 0.5, scale: 0.96 }}
                      whileInView={shouldReduce ? undefined : { opacity: 1, scale: 1 }}
                      viewport={{ once: false, amount: 0.55 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-[color:var(--color-border-hairline)] bg-black/40"
                    >
                      <Image
                        src={s.src}
                        alt={`SchoolWatch wizard step ${s.n}: ${s.title}`}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 640px) 100vw, 640px"
                      />
                    </motion.div>
                    <p className="mt-5 text-xl font-semibold text-white">
                      {s.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-body)]">
                      {s.body}
                    </p>
                  </div>
                </motion.div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Visual check**

```bash
npm run dev
```
Scroll through the WizardPreview section slowly. Expected:
- Vertical layout (one step per row, stacked)
- Large Fraunces numerals on the left (01, 02, 03, 04)
- A crimson line on the left fills downward as you scroll through the section
- Each step fades from 50% → 100% opacity as it enters the upper half of the viewport
- Screenshot scales from 0.96 → 1 on activation
- Reversing scroll: steps fade back to 50% (to match the `once: false` viewport config)

Stop dev server.

- [ ] **Step 3: Lint + build**

```bash
npm run lint && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add components/landing/WizardPreview.tsx
git commit -m "Rewrite WizardPreview as vertical scrollytelling with progress line"
```

---

## Task 9: Update PullQuote — SectionDivider, gradient, Fraunces italic accent

**Files:**
- Modify: `components/landing/PullQuote.tsx`

- [ ] **Step 1: Replace the entire contents of `components/landing/PullQuote.tsx`**

```tsx
import Reveal from "./Reveal";
import SectionDivider from "./SectionDivider";

export default function PullQuote() {
  return (
    <section
      aria-label="Identity quote"
      className="relative px-6 py-40"
      style={{
        background:
          "linear-gradient(180deg, #0a0a0a 0%, #0b0b0e 50%, #0a0a0a 100%)",
      }}
    >
      <SectionDivider />
      <Reveal>
        <div className="mx-auto max-w-3xl text-center">
          <span aria-hidden="true" className="mx-auto block h-px w-16 bg-[color:var(--color-accent)]" />
          <p className="mt-10 text-3xl font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-4xl md:text-[2.75rem]">
            Every school has{" "}
            <span
              className="italic font-[family-name:var(--font-display)] font-normal"
              style={{ fontVariationSettings: '"opsz" 72' }}
            >
              one or two kids who build things
            </span>
            .
            <br className="hidden sm:block" />{" "}
            <span className="text-[color:var(--color-body)]">
              This is how you become one of them.
            </span>
          </p>
          <span aria-hidden="true" className="mx-auto mt-10 block h-px w-16 bg-[color:var(--color-accent)]" />
        </div>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 2: Visual check**

Expected:
- Section has a subtle background gradient
- Thin hairline with crimson diamond at top
- "one or two kids who build things" is rendered in Fraunces italic, while the rest stays Geist

- [ ] **Step 3: Lint + build**

```bash
npm run lint && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add components/landing/PullQuote.tsx
git commit -m "Premium PullQuote: divider, gradient, Fraunces italic accent"
```

---

## Task 10: Update Faq — SectionDivider, Fraunces h2, tightened answers

**Files:**
- Modify: `components/landing/Faq.tsx`

- [ ] **Step 1: Replace the entire contents of `components/landing/Faq.tsx`**

```tsx
import Reveal from "./Reveal";
import SectionDivider from "./SectionDivider";

type FaqItem = {
  q: string;
  a: string;
};

const ITEMS: FaqItem[] = [
  {
    q: "Is this actually free?",
    a: "Yes. Hosting is free. A custom domain like yourschool.com is optional — everything else is free.",
  },
  {
    q: "Do I need my principal's approval?",
    a: "No. You get a real URL like yourschool.vercel.app. Share it with friends. Show your principal when it's already working.",
  },
  {
    q: "My school has weird lunch waves, rotating days, or block schedules. Will it work?",
    a: "Yes. Lunch waves, rotating days, block schedules, after-school periods, per-wave overrides — all handled.",
  },
  {
    q: "Can I change things later?",
    a: "Yes. An email link lets you edit anything — events, colors, the whole schedule.",
  },
  {
    q: "What if someone at my school already tried this?",
    a: "They used a worse option. Build yours anyway — whichever one gets used wins.",
  },
];

export default function Faq() {
  return (
    <section
      aria-label="Frequently asked questions"
      className="relative px-6 py-28"
    >
      <SectionDivider />
      <Reveal>
        <div className="mx-auto max-w-3xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-label)]">
            Questions you&apos;re about to ask
          </p>
          <h2
            className="mt-4 text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-white md:text-5xl font-[family-name:var(--font-display)]"
            style={{ fontVariationSettings: '"opsz" 72' }}
          >
            Answered.
          </h2>

          <dl className="mt-14 divide-y divide-[color:var(--color-border-hairline)] border-y border-[color:var(--color-border-hairline)]">
            {ITEMS.map((item) => (
              <div key={item.q} className="grid gap-2 py-6 sm:grid-cols-[1fr_1.4fr] sm:gap-10">
                <dt className="text-base font-semibold text-white">{item.q}</dt>
                <dd className="text-sm leading-relaxed text-[color:var(--color-body)]">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 2: Lint + build**

```bash
npm run lint && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add components/landing/Faq.tsx
git commit -m "Premium FAQ: divider, Fraunces h2, tightened answer copy"
```

---

## Task 11: Update FinalCta — SectionDivider, gradient, Fraunces h2, Arrow, ambient glow, tighter copy

**Files:**
- Modify: `components/landing/FinalCta.tsx`

- [ ] **Step 1: Replace the entire contents of `components/landing/FinalCta.tsx`**

```tsx
"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import Arrow from "./Arrow";
import Reveal from "./Reveal";
import SectionDivider from "./SectionDivider";

export default function FinalCta() {
  const shouldReduce = useReducedMotion();

  return (
    <section
      aria-label="Get started"
      className="relative flex min-h-[65vh] items-center justify-center px-6 py-40"
      style={{
        background:
          "linear-gradient(180deg, #0a0a0a 0%, #0b0b0e 50%, #0a0a0a 100%)",
      }}
    >
      <SectionDivider />
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <h2
            className="text-4xl font-medium leading-[1.05] tracking-[-0.03em] text-white md:text-6xl font-[family-name:var(--font-display)]"
            style={{ fontVariationSettings: '"opsz" 144' }}
          >
            You&apos;re still reading.
            <br />
            <span className="text-[color:var(--color-body)]">Go build it.</span>
          </h2>
          <div className="relative mt-12 inline-block">
            {/* Ambient glow */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-14 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--color-accent)] opacity-20 blur-2xl"
              animate={shouldReduce ? undefined : { opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <Link
              href="/setup"
              className="group relative inline-flex items-center gap-2 rounded-lg bg-[color:var(--color-accent)] px-8 py-4 text-base font-semibold text-black transition-[filter] duration-150 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-accent)] focus-visible:outline-offset-2"
            >
              Start Yours <Arrow />
            </Link>
          </div>
          <p className="mt-6 text-sm text-[color:var(--color-body)]">
            Five minutes. No signup. Live when you&apos;re done.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 2: Visual check**

Expected:
- Fraunces h2
- Button has a soft crimson glow pulsing behind it (4s cycle)
- Arrow icon slides on hover
- Subcopy reads "Five minutes. No signup. Live when you're done."

- [ ] **Step 3: Lint + build**

```bash
npm run lint && npm run build
```

- [ ] **Step 4: Commit**

```bash
git add components/landing/FinalCta.tsx
git commit -m "Premium FinalCta: Fraunces, Arrow, ambient glow, divider, tighter copy"
```

---

## Task 12: Create OpenSourceBlock section

**Files:**
- Create: `components/landing/OpenSourceBlock.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/landing/OpenSourceBlock.tsx`**

```tsx
import Reveal from "./Reveal";
import SectionDivider from "./SectionDivider";

export default function OpenSourceBlock() {
  return (
    <section
      aria-label="Open source and infrastructure"
      className="relative px-6 py-20"
    >
      <SectionDivider />
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-label)]">
            Made public
          </p>
          <h2
            className="mt-4 text-3xl font-medium leading-[1.1] tracking-[-0.02em] text-white md:text-4xl font-[family-name:var(--font-display)]"
            style={{ fontVariationSettings: '"opsz" 72' }}
          >
            Open by design.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-[color:var(--color-body)]">
            SchoolWatch is open source. Every school gets its own repository and
            its own URL — deployed on Vercel, no shared infrastructure, no
            accounts to manage.
          </p>

          <ul className="mt-10 flex flex-wrap items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-label)]">
            <li>
              <a
                href="https://github.com/HSQ0503/schoolwatch-wizard"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[color:var(--color-border-hairline)] px-3 py-1 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-accent)] focus-visible:outline-offset-2"
              >
                GitHub
              </a>
            </li>
            <li className="rounded-full border border-[color:var(--color-border-hairline)] px-3 py-1">
              Vercel
            </li>
            <li className="rounded-full border border-[color:var(--color-border-hairline)] px-3 py-1">
              MIT License
            </li>
          </ul>
        </div>
      </Reveal>
    </section>
  );
}
```

- [ ] **Step 2: Update `app/page.tsx` to render OpenSourceBlock between FinalCta and Footer**

```tsx
import Faq from "@/components/landing/Faq";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import LakerWatchShowcase from "@/components/landing/LakerWatchShowcase";
import Noise from "@/components/landing/Noise";
import OpenSourceBlock from "@/components/landing/OpenSourceBlock";
import PullQuote from "@/components/landing/PullQuote";
import SignalsRow from "@/components/landing/SignalsRow";
import WizardPreview from "@/components/landing/WizardPreview";

export default function Home() {
  return (
    <main className="relative">
      <Noise />
      <Hero />
      <SignalsRow />
      <LakerWatchShowcase />
      <WizardPreview />
      <PullQuote />
      <Faq />
      <FinalCta />
      <OpenSourceBlock />
      <Footer />
    </main>
  );
}
```

- [ ] **Step 3: Visual check**

Expected: above the existing footer, a new centered section with "MADE PUBLIC" eyebrow, "Open by design." headline in Fraunces, body paragraph, and three pill-shaped tags (GitHub as a link, Vercel + MIT License as plain text).

- [ ] **Step 4: Lint + build**

```bash
npm run lint && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add components/landing/OpenSourceBlock.tsx app/page.tsx
git commit -m "Add OpenSourceBlock infrastructure-credibility section"
```

---

## Task 13: Final sweep — responsive + a11y + visual polish

**Files:**
- Modify: any landing component where issues are found

- [ ] **Step 1: Responsive sweep**

```bash
npm run dev
```
In Chrome DevTools device mode, scroll through the full page at these breakpoints:

- iPhone 12 (390px)
- iPad (768px)
- Desktop (1280px)
- Large desktop (1920px)

Verify at each:
- No horizontal scroll
- Hero stacks on mobile (copy above screenshot), side-by-side on md+
- SignalsRow items stack vertically on mobile, horizontal on sm+
- LakerWatchShowcase callouts appear floating on lg+, stacked list below ≤ md
- WizardPreview vertical stack at all breakpoints; numerals scale
- FAQ question/answer stacks on mobile, 2-col on sm+
- OpenSourceBlock pills wrap gracefully on narrow screens
- FinalCta content stays centered at all widths

Fix any overflow or misalignment.

- [ ] **Step 2: Motion with reduced-motion toggled**

In OS accessibility settings, enable "Reduce motion." Reload the page. Verify:
- No hero stagger entrance (content appears immediately)
- No breathing glow on Hero
- No ambient pulsing on FinalCta button
- No WizardPreview scale/opacity animation on step activation (content static)
- No fade-up on scroll-reveal sections

- [ ] **Step 3: Keyboard focus audit**

Disable reduced motion. Tab through the full page top to bottom. Every interactive element must show a crimson 2px focus ring. Check specifically:
- Hero: Start Yours, See LakerWatch
- LakerWatchShowcase: lakerwatch.com link
- FinalCta: Start Yours
- OpenSourceBlock: GitHub
- Footer: GitHub, See LakerWatch

- [ ] **Step 4: Lint + build**

```bash
npm run lint && npm run build
```

- [ ] **Step 5: Commit (if changes were made)**

```bash
git add components/landing/
git commit -m "Premium landing sweep: responsive + a11y + reduced-motion fixes"
```

If no changes were needed, skip this commit.

---

## Done

- The landing page uses Fraunces for all headlines (editorial serif) and Geist for body (clean sans).
- A signals row sits between Hero and Showcase with three trust stats.
- Alternating sections have subtle gradient washes + a hairline divider with a tiny crimson diamond at the top.
- Every primary CTA has a custom SVG arrow that slides right on hover.
- Copy is tightened across Hero subhead, all FAQ answers, and FinalCta subcopy.
- An OpenSourceBlock above the footer establishes infrastructure credibility.
- Hero has a page-load stagger + breathing glow.
- LakerWatch callouts stagger in sequentially on scroll.
- WizardPreview is a vertical scrollytelling section with a crimson progress line that fills as you scroll.
- FinalCta button has a pulsing ambient glow.
- All motion respects `prefers-reduced-motion`.
- `npm run lint` introduces no new errors; `npm run build` passes.
