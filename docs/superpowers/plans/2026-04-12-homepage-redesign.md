# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current `/` landing page with an identity-driven homepage targeting student leaders, using a Raycast-inspired dark aesthetic and 7 focused sections that convert "this is interesting" into "I'm filling out the wizard."

**Architecture:** Next.js 16 App Router. One server-rendered page (`app/page.tsx`) composes eight client-agnostic section components under `components/landing/`. New shared typography (Geist Sans + Geist Mono via `next/font/google`) and CSS variables defined via Tailwind v4's `@theme inline` block in `globals.css`. Scroll-reveal motion via the `motion` library, loaded only where used.

**Tech Stack:** Next.js 16.2.3, React 19, TypeScript 5, Tailwind CSS v4 (`@tailwindcss/postcss`), `next/font/google` (Geist Sans + Geist Mono), `motion` (new dependency — React animation library).

**Spec:** `docs/superpowers/specs/2026-04-12-homepage-redesign-design.md`

**Reference for each visual component:** Raycast.com aesthetic — deep near-black background (`#0a0a0a`), crimson-coral accent (`#FF6363`), restrained motion, single-family typography, subtle grain overlay, hairline borders.

---

## Task 1: Install dependency, swap fonts, update global palette

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Install `motion`**

Run:
```bash
npm install motion
```
Expected: `motion` added to `dependencies` in `package.json`.

- [ ] **Step 2: Replace Inter with Geist Sans + Geist Mono in `app/layout.tsx`**

Replace the entire contents of `app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

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
        className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-full`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Update `app/globals.css` to a dark-only palette and wire Geist vars**

Replace the entire contents of `app/globals.css` with:

```css
@import "tailwindcss";

:root {
  --background: #0a0a0a;
  --foreground: #ffffff;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface: rgba(255, 255, 255, 0.03);
  --color-border-hairline: rgba(255, 255, 255, 0.08);
  --color-body: #a1a1aa;
  --color-label: #e4e4e7;
  --color-accent: #ff6363;
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
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
}
```

Note: the existing wizard / login / edit pages use explicit `bg-black text-white` classes, so they are unaffected by the body default change. The old landing page (`components/LandingHero.tsx`) relies on white background + gray text and will visually break until Task 10 replaces it — this is expected; we ship an empty / broken `/` between now and Task 10 only if we stop mid-plan, which we won't.

- [ ] **Step 4: Verify build passes**

Run:
```bash
npm run build
```
Expected: build succeeds (may warn about the old `LandingHero` / `LandingFeatures` color contrast — that's fine, they're being deleted).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json app/layout.tsx app/globals.css
git commit -m "Add Geist fonts, motion dependency, dark palette CSS vars"
```

---

## Task 2: Create the grain overlay component

**Files:**
- Create: `components/landing/Noise.tsx`

- [ ] **Step 1: Create the Noise component**

Create `components/landing/Noise.tsx` with:

```tsx
export default function Noise() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.04] mix-blend-overlay"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`,
      }}
    />
  );
}
```

- [ ] **Step 2: Run lint to verify no TypeScript errors**

Run:
```bash
npm run lint
```
Expected: no errors in `components/landing/Noise.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/landing/Noise.tsx
git commit -m "Add grain overlay component for landing page"
```

---

## Task 3: Create the Hero component with placeholder screenshot

**Files:**
- Create: `components/landing/Hero.tsx`
- Create: `public/screenshots/.gitkeep` (so the folder exists)

- [ ] **Step 1: Create the screenshots folder placeholder**

```bash
mkdir -p public/screenshots/wizard
touch public/screenshots/.gitkeep
```

- [ ] **Step 2: Create `components/landing/Hero.tsx`**

```tsx
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20 sm:pt-28">
      {/* Radial glow behind headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-24 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(255,99,99,0.18), transparent 70%)" }}
      />

      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1.1fr_1fr] md:gap-16">
        {/* Left: copy + CTAs */}
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-label)]">
            SchoolWatch
          </p>
          <h1 className="mt-5 max-w-[14ch] text-5xl font-bold leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl md:text-[4.25rem]">
            Build the schedule app your school never made.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-[color:var(--color-body)]">
            Pick your colors, add your bell schedule, deploy to a real URL.
            Five minutes, no code, free.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Link
              href="/setup"
              className="rounded-lg bg-[color:var(--color-accent)] px-6 py-3 text-sm font-semibold text-black transition-transform duration-150 hover:scale-[1.02]"
            >
              Start Yours →
            </Link>
            <a
              href="https://lakerwatch.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              See LakerWatch →
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-2">
            {["Free", "5 minutes", "No code"].map((label) => (
              <li
                key={label}
                className="rounded-full border border-[color:var(--color-border-hairline)] px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[color:var(--color-label)]"
              >
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: placeholder screenshot window */}
        <div className="relative">
          <div
            className="relative aspect-[4/3] w-full rotate-[2deg] rounded-xl border border-[color:var(--color-border-hairline)] bg-[color:var(--color-surface)] shadow-2xl"
            style={{ boxShadow: "0 40px 120px -20px rgba(255,99,99,0.15)" }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-1.5 border-b border-[color:var(--color-border-hairline)] px-3 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="ml-3 font-mono text-[10px] text-white/30">
                lakerwatch.com
              </span>
            </div>
            {/* Placeholder content — replaced with real screenshot in Task 12 */}
            <div className="flex h-[calc(100%-2.25rem)] items-center justify-center text-xs text-white/20">
              LakerWatch screenshot (placeholder)
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Wire Hero + Noise into `app/page.tsx`**

Replace the contents of `app/page.tsx` with:

```tsx
import Hero from "@/components/landing/Hero";
import Noise from "@/components/landing/Noise";

export default function Home() {
  return (
    <main className="relative">
      <Noise />
      <Hero />
    </main>
  );
}
```

- [ ] **Step 4: Run dev server and visually verify**

Run:
```bash
npm run dev
```
Open `http://localhost:3000`. Expected:
- Dark background (`#0a0a0a`)
- Soft crimson radial glow behind the headline
- Headline in large white bold type, tight tracking
- Crimson "Start Yours →" button, plain secondary link
- Three mono-font badges below
- Right column shows a tilted dark card with `lakerwatch.com` in the window bar and "placeholder" text inside
- Subtle grain across the whole viewport

Stop the dev server (Ctrl+C).

- [ ] **Step 5: Run lint + build**

```bash
npm run lint && npm run build
```
Expected: both succeed.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx components/landing/Hero.tsx public/screenshots/.gitkeep
git commit -m "Add landing Hero with placeholder screenshot slot"
```

---

## Task 4: Create the LakerWatch showcase section with placeholder

**Files:**
- Create: `components/landing/LakerWatchShowcase.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create the LakerWatchShowcase component**

Create `components/landing/LakerWatchShowcase.tsx`:

```tsx
const CALLOUTS = [
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
    <section className="relative px-6 py-28">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-label)]">
          Live at Windermere Prep
        </p>
        <h2 className="mt-4 max-w-[20ch] text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-white md:text-5xl">
          A real student-built dashboard. Running right now.
        </h2>

        {/* Screenshot + absolutely-positioned callouts (desktop only) */}
        <div className="relative mx-auto mt-20 hidden w-full max-w-3xl md:block">
          <div className="relative aspect-[16/10] w-full rounded-xl border border-[color:var(--color-border-hairline)] bg-[color:var(--color-surface)] shadow-2xl">
            <div className="flex items-center gap-1.5 border-b border-[color:var(--color-border-hairline)] px-3 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
              <span className="ml-3 font-mono text-[10px] text-white/30">
                lakerwatch.com
              </span>
            </div>
            <div className="flex h-[calc(100%-2.25rem)] items-center justify-center text-xs text-white/20">
              LakerWatch dashboard (placeholder)
            </div>
          </div>

          {CALLOUTS.map((c) => (
            <div
              key={c.title}
              className={`absolute ${c.position} hidden w-44 rounded-lg border border-[color:var(--color-border-hairline)] bg-black/80 p-3 backdrop-blur lg:block`}
            >
              <p className="text-[13px] font-semibold text-white">{c.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-[color:var(--color-body)]">
                {c.body}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile / tablet: screenshot + list below */}
        <div className="mt-16 md:hidden">
          <div className="relative aspect-[16/10] w-full rounded-xl border border-[color:var(--color-border-hairline)] bg-[color:var(--color-surface)]">
            <div className="flex items-center gap-1.5 border-b border-[color:var(--color-border-hairline)] px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-white/10" />
              <span className="h-2 w-2 rounded-full bg-white/10" />
              <span className="h-2 w-2 rounded-full bg-white/10" />
            </div>
            <div className="flex h-[calc(100%-1.75rem)] items-center justify-center text-xs text-white/20">
              LakerWatch dashboard
            </div>
          </div>
          <ul className="mt-8 space-y-5">
            {CALLOUTS.map((c) => (
              <li key={c.title}>
                <p className="text-sm font-semibold text-white">{c.title}</p>
                <p className="mt-1 text-sm text-[color:var(--color-body)]">
                  {c.body}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-20 flex justify-center">
          <a
            href="https://lakerwatch.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs uppercase tracking-wider text-[color:var(--color-label)] transition-colors hover:text-white"
          >
            lakerwatch.com →
          </a>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add showcase to `app/page.tsx`**

Update `app/page.tsx` to:

```tsx
import Hero from "@/components/landing/Hero";
import LakerWatchShowcase from "@/components/landing/LakerWatchShowcase";
import Noise from "@/components/landing/Noise";

export default function Home() {
  return (
    <main className="relative">
      <Noise />
      <Hero />
      <LakerWatchShowcase />
    </main>
  );
}
```

- [ ] **Step 3: Run dev server and visually verify**

Run:
```bash
npm run dev
```
Scroll past the hero. Expected:
- Eyebrow "LIVE AT WINDERMERE PREP" in mono uppercase
- Large white heading
- Centered placeholder window with `lakerwatch.com` in the chrome
- On desktop (≥ lg, 1024px): four callout cards floating at the corners of the screenshot
- On tablet/mobile: screenshot followed by a vertical list of the same four callouts

Stop dev server.

- [ ] **Step 4: Run lint + build**

```bash
npm run lint && npm run build
```
Expected: both succeed.

- [ ] **Step 5: Commit**

```bash
git add components/landing/LakerWatchShowcase.tsx app/page.tsx
git commit -m "Add LakerWatch showcase with annotated callouts"
```

---

## Task 5: Create the wizard preview section

**Files:**
- Create: `components/landing/WizardPreview.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create the WizardPreview component**

Create `components/landing/WizardPreview.tsx`:

```tsx
const STEPS = [
  {
    n: "01",
    title: "Name your school.",
    body: "Mascot, colors, academic year. The basics.",
  },
  {
    n: "02",
    title: "Pick your palette.",
    body: "Two seed colors, eight zones, dark mode included.",
  },
  {
    n: "03",
    title: "Add your schedule.",
    body: "Simple, block, or rotating. Lunch waves handled.",
  },
  {
    n: "04",
    title: "Deploy.",
    body: "We send you a live URL. Share it with your friends.",
  },
];

export default function WizardPreview() {
  return (
    <section className="relative px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-label)]">
          How it works
        </p>
        <h2 className="mt-4 max-w-[22ch] text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-white md:text-5xl">
          Four screens. No code. No catch.
        </h2>

        <ol className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="rounded-xl border border-[color:var(--color-border-hairline)] bg-[color:var(--color-surface)] p-6"
            >
              <p className="font-mono text-sm font-semibold text-[color:var(--color-accent)]">
                {s.n}
              </p>
              {/* Placeholder thumbnail — replaced with real screenshot in Task 12 */}
              <div className="mt-4 aspect-[4/3] w-full rounded-md border border-[color:var(--color-border-hairline)] bg-black/40" />
              <p className="mt-5 text-base font-semibold text-white">
                {s.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--color-body)]">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to `app/page.tsx`**

```tsx
import Hero from "@/components/landing/Hero";
import LakerWatchShowcase from "@/components/landing/LakerWatchShowcase";
import Noise from "@/components/landing/Noise";
import WizardPreview from "@/components/landing/WizardPreview";

export default function Home() {
  return (
    <main className="relative">
      <Noise />
      <Hero />
      <LakerWatchShowcase />
      <WizardPreview />
    </main>
  );
}
```

- [ ] **Step 3: Run dev server and visually verify**

Run `npm run dev`. Expected:
- Eyebrow "HOW IT WORKS"
- Heading "Four screens. No code. No catch."
- Four cards in a row on desktop (≥ lg), 2×2 on tablet, stacked on mobile
- Each card: crimson "01"–"04" numeral at top (mono), empty thumbnail placeholder, title, body
- Stop dev server.

- [ ] **Step 4: Run lint + build**

```bash
npm run lint && npm run build
```
Expected: both succeed.

- [ ] **Step 5: Commit**

```bash
git add components/landing/WizardPreview.tsx app/page.tsx
git commit -m "Add wizard preview section with 4 step cards"
```

---

## Task 6: Create the pull quote section

**Files:**
- Create: `components/landing/PullQuote.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create the PullQuote component**

Create `components/landing/PullQuote.tsx`:

```tsx
export default function PullQuote() {
  return (
    <section className="relative px-6 py-40">
      <div className="mx-auto max-w-3xl text-center">
        <span className="mx-auto block h-px w-16 bg-[color:var(--color-accent)]" />
        <p className="mt-10 text-3xl font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-4xl md:text-[2.75rem]">
          Every school has one or two kids who build things.
          <br className="hidden sm:block" />{" "}
          <span className="text-[color:var(--color-body)]">
            This is how you become one of them.
          </span>
        </p>
        <span className="mx-auto mt-10 block h-px w-16 bg-[color:var(--color-accent)]" />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to `app/page.tsx`**

```tsx
import Hero from "@/components/landing/Hero";
import LakerWatchShowcase from "@/components/landing/LakerWatchShowcase";
import Noise from "@/components/landing/Noise";
import PullQuote from "@/components/landing/PullQuote";
import WizardPreview from "@/components/landing/WizardPreview";

export default function Home() {
  return (
    <main className="relative">
      <Noise />
      <Hero />
      <LakerWatchShowcase />
      <WizardPreview />
      <PullQuote />
    </main>
  );
}
```

- [ ] **Step 3: Visual check**

Run `npm run dev`. Expected:
- Centered large quote, white first line, gray second line
- Two short crimson horizontal strokes above and below
- Very generous vertical padding; the section feels like a breath

Stop dev server.

- [ ] **Step 4: Run lint + build**

```bash
npm run lint && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add components/landing/PullQuote.tsx app/page.tsx
git commit -m "Add pull-quote identity moment section"
```

---

## Task 7: Create the FAQ section

**Files:**
- Create: `components/landing/Faq.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create the Faq component**

Create `components/landing/Faq.tsx`:

```tsx
const ITEMS = [
  {
    q: "Is this actually free?",
    a: "Yes. Hosting is free on Vercel. The only paid thing is if you want a custom domain like yourschool.com — that's optional and you buy it yourself.",
  },
  {
    q: "Do I need my principal's approval?",
    a: "No. You get a real URL like yourschool.vercel.app, send it to your friends, and it spreads on its own. You can show your principal later if you want.",
  },
  {
    q: "My school has weird lunch waves, rotating days, or block schedules. Will it work?",
    a: "Yes. The wizard handles all three, plus after-school periods and day-type overrides per wave.",
  },
  {
    q: "Can I change things later?",
    a: "Yes. You'll get an email link that lets you edit anything — add events, change colors, update the schedule.",
  },
  {
    q: "What if someone at my school already tried this?",
    a: "They probably used a worse option. You can still build yours and share it — whichever one gets used wins.",
  },
];

export default function Faq() {
  return (
    <section className="relative px-6 py-28">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[color:var(--color-label)]">
          Questions you&apos;re about to ask
        </p>
        <h2 className="mt-4 text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-white md:text-5xl">
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
    </section>
  );
}
```

- [ ] **Step 2: Add to `app/page.tsx`**

```tsx
import Faq from "@/components/landing/Faq";
import Hero from "@/components/landing/Hero";
import LakerWatchShowcase from "@/components/landing/LakerWatchShowcase";
import Noise from "@/components/landing/Noise";
import PullQuote from "@/components/landing/PullQuote";
import WizardPreview from "@/components/landing/WizardPreview";

export default function Home() {
  return (
    <main className="relative">
      <Noise />
      <Hero />
      <LakerWatchShowcase />
      <WizardPreview />
      <PullQuote />
      <Faq />
    </main>
  );
}
```

- [ ] **Step 3: Visual check**

Run `npm run dev`. Expected:
- Eyebrow "QUESTIONS YOU'RE ABOUT TO ASK" + heading "Answered."
- 5 Q&A rows, each with bold question on the left and body text on the right (stacked on mobile)
- Hairline dividers between rows, and above/below the whole list

Stop dev server.

- [ ] **Step 4: Run lint + build**

```bash
npm run lint && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add components/landing/Faq.tsx app/page.tsx
git commit -m "Add FAQ section with 5 objection-killers"
```

---

## Task 8: Create the final CTA section

**Files:**
- Create: `components/landing/FinalCta.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create the FinalCta component**

Create `components/landing/FinalCta.tsx`:

```tsx
import Link from "next/link";

export default function FinalCta() {
  return (
    <section className="relative flex min-h-[65vh] items-center justify-center px-6 py-32">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-white md:text-6xl">
          You&apos;re still reading.
          <br />
          <span className="text-[color:var(--color-body)]">Go build it.</span>
        </h2>
        <div className="mt-12">
          <Link
            href="/setup"
            className="inline-block rounded-lg bg-[color:var(--color-accent)] px-8 py-4 text-base font-semibold text-black transition-transform duration-150 hover:scale-[1.02]"
          >
            Start Yours →
          </Link>
        </div>
        <p className="mt-6 text-sm text-[color:var(--color-body)]">
          Takes about 5 minutes. No signup before you start.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Add to `app/page.tsx`**

```tsx
import Faq from "@/components/landing/Faq";
import FinalCta from "@/components/landing/FinalCta";
import Hero from "@/components/landing/Hero";
import LakerWatchShowcase from "@/components/landing/LakerWatchShowcase";
import Noise from "@/components/landing/Noise";
import PullQuote from "@/components/landing/PullQuote";
import WizardPreview from "@/components/landing/WizardPreview";

export default function Home() {
  return (
    <main className="relative">
      <Noise />
      <Hero />
      <LakerWatchShowcase />
      <WizardPreview />
      <PullQuote />
      <Faq />
      <FinalCta />
    </main>
  );
}
```

- [ ] **Step 3: Visual check**

Run `npm run dev`. Expected:
- Near-full-viewport section (min-h 65vh)
- Big two-line headline, second line in gray
- Single large crimson CTA button
- Sub-line: "Takes about 5 minutes. No signup before you start."

Stop dev server.

- [ ] **Step 4: Run lint + build**

```bash
npm run lint && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add components/landing/FinalCta.tsx app/page.tsx
git commit -m "Add final CTA closing section"
```

---

## Task 9: Create the footer

**Files:**
- Create: `components/landing/Footer.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create the Footer component**

Create `components/landing/Footer.tsx`:

```tsx
export default function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-border-hairline)] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 font-mono text-xs text-[color:var(--color-body)] sm:flex-row sm:items-center">
        <p>SchoolWatch — made by Han at Windermere Prep.</p>
        <div className="flex gap-6">
          <a
            href="https://github.com/HSQ0503/schoolwatch-wizard"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            GitHub
          </a>
          <a
            href="https://lakerwatch.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            See LakerWatch
          </a>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Add to `app/page.tsx`**

```tsx
import Faq from "@/components/landing/Faq";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/landing/Footer";
import Hero from "@/components/landing/Hero";
import LakerWatchShowcase from "@/components/landing/LakerWatchShowcase";
import Noise from "@/components/landing/Noise";
import PullQuote from "@/components/landing/PullQuote";
import WizardPreview from "@/components/landing/WizardPreview";

export default function Home() {
  return (
    <main className="relative">
      <Noise />
      <Hero />
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

Run `npm run dev`. Expected:
- Minimal footer with hairline top border
- Left: attribution. Right: GitHub · See LakerWatch
- Mono font, gray text, hover to white

Stop dev server.

- [ ] **Step 4: Run lint + build**

```bash
npm run lint && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add components/landing/Footer.tsx app/page.tsx
git commit -m "Add minimal landing footer"
```

---

## Task 10: Delete the old landing components

**Files:**
- Delete: `components/LandingHero.tsx`
- Delete: `components/LandingFeatures.tsx`

- [ ] **Step 1: Verify nothing still imports the old components**

Run:
```bash
grep -rn "LandingHero\|LandingFeatures" app components lib 2>/dev/null
```
Expected: no matches (the only imports were in `app/page.tsx`, which Task 3 replaced).

- [ ] **Step 2: Delete the files**

```bash
rm components/LandingHero.tsx components/LandingFeatures.tsx
```

- [ ] **Step 3: Run lint + build**

```bash
npm run lint && npm run build
```
Expected: both succeed — no references remain.

- [ ] **Step 4: Commit**

```bash
git add -A components/
git commit -m "Remove old light-theme landing components"
```

---

## Task 11: Add scroll-reveal animations with motion

**Files:**
- Create: `components/landing/Reveal.tsx`
- Modify: `components/landing/LakerWatchShowcase.tsx`
- Modify: `components/landing/WizardPreview.tsx`
- Modify: `components/landing/PullQuote.tsx`
- Modify: `components/landing/Faq.tsx`
- Modify: `components/landing/FinalCta.tsx`

- [ ] **Step 1: Create a small reusable `Reveal` wrapper**

Create `components/landing/Reveal.tsx`:

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
  if (shouldReduce) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Wrap the inner content of each section with `Reveal`**

For each of `LakerWatchShowcase.tsx`, `WizardPreview.tsx`, `PullQuote.tsx`, `Faq.tsx`, `FinalCta.tsx`:

1. Add `import Reveal from "./Reveal";` at the top
2. Wrap the outermost content inside the `<section>` tag with `<Reveal>…</Reveal>`

Example — in `components/landing/PullQuote.tsx`, change:

```tsx
    <section className="relative px-6 py-40">
      <div className="mx-auto max-w-3xl text-center">
        ...
      </div>
    </section>
```

to:

```tsx
    <section className="relative px-6 py-40">
      <Reveal>
        <div className="mx-auto max-w-3xl text-center">
          ...
        </div>
      </Reveal>
    </section>
```

Do NOT wrap the `Hero` component — it should render immediately on load.

- [ ] **Step 3: Visual check**

Run `npm run dev`. Scroll slowly. Expected:
- Hero renders instantly on load
- Each subsequent section fades and rises into view as you scroll it past the top 90% of the viewport
- Each animation runs once only (doesn't re-fire when scrolling back up)
- Toggle "Reduce motion" in OS accessibility settings → animations are disabled and content appears instantly

Stop dev server.

- [ ] **Step 4: Run lint + build**

```bash
npm run lint && npm run build
```

- [ ] **Step 5: Commit**

```bash
git add components/landing/
git commit -m "Add scroll-reveal animations to landing sections"
```

---

## Task 12: Capture real screenshots and swap placeholders

**Files:**
- Add: `public/screenshots/lakerwatch-dashboard.png` (or `.webp`)
- Add: `public/screenshots/wizard/01-school.png`, `02-colors.png`, `03-schedule.png`, `04-deploy.png`
- Modify: `components/landing/Hero.tsx`
- Modify: `components/landing/LakerWatchShowcase.tsx`
- Modify: `components/landing/WizardPreview.tsx`

**Note:** This is a manual capture task. If no screenshots are available when running this plan, skip Step 1 and instead keep the placeholders in place — the rest of the landing page is complete and shippable without them. Return to this task once captures exist.

- [ ] **Step 1: Capture the screenshots**

Hero + showcase:
1. Open `https://lakerwatch.com` in a Chromium browser at 1440×900
2. Scroll to the top of the dashboard (the countdown-ring hero view)
3. Use DevTools → Device Toolbar → capture full viewport screenshot at 2x device pixel ratio
4. Save as `public/screenshots/lakerwatch-dashboard.png` (or export to `.webp` if preferred — just update filenames in the components)

Wizard steps:
1. `npm run dev` and open `http://localhost:3000/setup`
2. Fill minimal data to reach each step, screenshot the inner content area (the `<main>` region with the step component), save as:
   - `public/screenshots/wizard/01-school.png` (School Info step)
   - `public/screenshots/wizard/02-colors.png` (Colors step with the live mockup visible)
   - `public/screenshots/wizard/03-schedule.png` (Schedule step)
   - `public/screenshots/wizard/04-deploy.png` (Review & Deploy step)

Each wizard screenshot should be captured at an aspect around 4:3 (e.g., 800×600 source), zoomed so step content is readable.

- [ ] **Step 2: Wire the hero screenshot**

In `components/landing/Hero.tsx`, replace the placeholder `<div>` with a Next.js `<Image>`:

1. Add at the top: `import Image from "next/image";`
2. Replace the block:

```tsx
            {/* Placeholder content — replaced with real screenshot in Task 12 */}
            <div className="flex h-[calc(100%-2.25rem)] items-center justify-center text-xs text-white/20">
              LakerWatch screenshot (placeholder)
            </div>
```

with:

```tsx
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
```

- [ ] **Step 3: Wire the showcase screenshot**

In `components/landing/LakerWatchShowcase.tsx`, replace the two placeholder `<div>` blocks (desktop + mobile) with `<Image>` tags pointing to the same `/screenshots/lakerwatch-dashboard.png`. Use the same `alt` text as the hero. On the mobile block, drop `priority`.

- [ ] **Step 4: Wire the wizard step thumbnails**

In `components/landing/WizardPreview.tsx`:

1. Add at the top: `import Image from "next/image";`
2. Update the `STEPS` array to include a `src`:

```tsx
const STEPS = [
  { n: "01", src: "/screenshots/wizard/01-school.png", title: "Name your school.", body: "Mascot, colors, academic year. The basics." },
  { n: "02", src: "/screenshots/wizard/02-colors.png", title: "Pick your palette.", body: "Two seed colors, eight zones, dark mode included." },
  { n: "03", src: "/screenshots/wizard/03-schedule.png", title: "Add your schedule.", body: "Simple, block, or rotating. Lunch waves handled." },
  { n: "04", src: "/screenshots/wizard/04-deploy.png", title: "Deploy.", body: "We send you a live URL. Share it with your friends." },
];
```

3. Replace the placeholder thumbnail:

```tsx
              {/* Placeholder thumbnail — replaced with real screenshot in Task 12 */}
              <div className="mt-4 aspect-[4/3] w-full rounded-md border border-[color:var(--color-border-hairline)] bg-black/40" />
```

with:

```tsx
              <div className="relative mt-4 aspect-[4/3] w-full overflow-hidden rounded-md border border-[color:var(--color-border-hairline)] bg-black/40">
                <Image
                  src={s.src}
                  alt={`SchoolWatch wizard step ${s.n}: ${s.title}`}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
```

- [ ] **Step 5: Visual check + responsive check**

Run `npm run dev`. Expected:
- Real LakerWatch screenshot appears in the hero and in the showcase section, cleanly filling the window chrome
- Each wizard step card shows the corresponding real screenshot
- No layout shift when images load (because `fill` + aspect-ratio container is used)
- Check on mobile viewport (DevTools device mode, iPhone 12): hero stacks correctly, showcase shows single screenshot with list below, wizard cards stack, final CTA centered

Stop dev server.

- [ ] **Step 6: Run lint + build**

```bash
npm run lint && npm run build
```
Expected: both succeed. The build will additionally optimize the images via `next/image`.

- [ ] **Step 7: Commit**

```bash
git add public/screenshots/ components/landing/Hero.tsx components/landing/LakerWatchShowcase.tsx components/landing/WizardPreview.tsx
git commit -m "Wire real LakerWatch + wizard screenshots"
```

---

## Task 13: Final polish — accessibility + responsive sweep

**Files:**
- Modify: any landing components where issues are found

- [ ] **Step 1: Keyboard focus audit**

Run `npm run dev`. Tab through the page from top to bottom. Expected:
- Every interactive element (hero CTA, hero secondary link, showcase URL link, final CTA, footer links) receives a visible focus ring
- Tab order is top-to-bottom, left-to-right, nothing is skipped or trapped

If any element has no visible focus state, add `focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-accent)] focus-visible:outline-offset-2` to its class list.

- [ ] **Step 2: Heading hierarchy audit**

Run DevTools → Accessibility → Heading navigation. Expected:
- Exactly one `<h1>` (the hero headline)
- Every major section (`LakerWatchShowcase`, `WizardPreview`, `Faq`, `FinalCta`) has an `<h2>`
- No skipped levels

- [ ] **Step 3: Alt text audit**

Every `<Image>` in the landing page components must have meaningful `alt` text (not empty, not "image", not the filename). Sampled correct examples already exist from Task 12 — verify the wizard step images and LakerWatch screenshots all have them.

- [ ] **Step 4: Mobile sweep**

In Chrome DevTools, open device mode at:
- iPhone 12 (390px)
- iPad (768px)
- Desktop (1440px)

Scroll through the full page at each. Expected:
- No horizontal scroll at any breakpoint
- Hero stacks correctly at ≤ md; screenshot below text
- LakerWatch showcase callouts appear as a list at ≤ lg; floating at lg+
- Wizard cards: 1 column ≤ sm, 2 at sm, 4 at lg
- FAQ rows stack the question above the answer at ≤ sm
- Footer wraps cleanly on mobile

Fix any overflow / sizing issues found.

- [ ] **Step 5: Run lint + build**

```bash
npm run lint && npm run build
```

- [ ] **Step 6: Commit (if changes were made in Steps 1–4)**

```bash
git add components/landing/
git commit -m "Polish focus rings, alt text, responsive breakpoints on landing"
```

If no changes were needed, skip this commit.

---

## Done

- `/` renders seven sections: Hero, LakerWatchShowcase, WizardPreview, PullQuote, Faq, FinalCta, Footer.
- Site-wide typography is Geist Sans + Geist Mono; the wizard/login/edit pages inherit the new family automatically.
- The old light-theme `LandingHero` and `LandingFeatures` components are deleted.
- Scroll-reveal animations are present and respect `prefers-reduced-motion`.
- Real LakerWatch and wizard screenshots are wired in (if captured; placeholders otherwise).
- The page passes `npm run lint` and `npm run build` with no errors.
