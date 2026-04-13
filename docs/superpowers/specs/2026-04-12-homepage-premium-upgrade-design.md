# Homepage Premium Upgrade — Design Spec

**Date:** 2026-04-12
**Scope:** Elevate the existing 7-section SchoolWatch landing page (`/`) from "solid first pass" to a premium, trustworthy, product-grade experience. Builds on the current branch (`feat/homepage-redesign`).

**Out of scope:** The 7-step wizard form at `/setup`. That is Pass 2 (separate spec, separate plan, separate commit cluster).

## Goal

Take the current landing page — structurally sound but reading a bit like a tech demo — and apply a premium pass that (a) boosts conversion among the student-leader persona and (b) makes the page read as trustworthy infrastructure when an adult looks over their shoulder.

## Core Moves (Seven)

Each move is specified in its own section below.

1. **Typography**: Introduce a display serif (Fraunces) alongside Geist for headlines. Creates magazine-grade type pairing.
2. **Signals row**: Three mono-font confidence stats between Hero and LakerWatch showcase. Low visual weight, high trust weight.
3. **Depth layering**: Subtle background rhythm between sections + small decorative "chapter marks" at section boundaries.
4. **Custom arrow treatment**: Replace every unicode `→` with an SVG arrow component that animates on hover.
5. **Copy confidence pass**: Tighten phrasing across hero, FAQ, final CTA. No voice change — just sharper rhythm.
6. **Open-source footer block**: New section above the existing footer establishing infrastructure credibility.
7. **Motion polish**: Hero breathing glow, page-load stagger entry, LakerWatch staggered callout reveals, **WizardPreview scrollytelling redesign**, and CTA micro-interactions.

## 1. Typography — Fraunces + Geist pairing

**Add font:** `Fraunces` via `next/font/google` as a variable font. Exposed as CSS var `--font-display`.

**Tailwind theme:** add `--font-display: var(--font-fraunces)` to the `@theme inline` block in `globals.css`.

**Where Fraunces is used:**
- Hero `<h1>` — weight 600, optical size tuned for display (`"opsz" 144`), tight tracking `-0.04em`
- Every section `<h2>` — weight 500, `"opsz" 72`, tracking `-0.03em`
- PullQuote body text — Fraunces 400 italic on the phrase `one or two kids who build things`; the rest stays Geist Sans at its current weight
- FinalCta `<h2>` — same as other section h2s

**Where Geist Sans stays:**
- All body copy
- Micro-trust pills, eyebrows, mono labels (Geist Mono)
- All CTAs button text, form inputs elsewhere on the app
- FAQ questions/answers

**Visual effect:** Editorial contrast on headlines (serif display + sans body) vs pure-sans everywhere else. A single typographic moment per section, like a magazine pullquote.

**Implementation:** Apply via inline utility class `font-[family-name:var(--font-display)]` (Tailwind arbitrary value) rather than creating a custom Tailwind utility, to keep the change surface small.

## 2. Signals row

**New file:** `components/landing/SignalsRow.tsx`
**Placement:** Between `<Hero />` and `<LakerWatchShowcase />` in `app/page.tsx`.

**Visual:**
- Full-width container with `border-y` (hairline top + bottom)
- Three items, center-aligned on mobile, spaced across on desktop
- Each item is Geist Mono, `text-xs`, uppercase, `tracking-[0.22em]`, color `--color-label`
- Items separated by tiny crimson dots (small round span with bg `--color-accent`, roughly `h-1 w-1 rounded-full`)
- Padding: `py-5` (tight, low visual weight)

**Copy (locked in):**
`5 MIN TO LIVE` · `0 LINES OF CODE` · `OPEN SOURCE`

**Responsive:** on mobile (<sm), items stack vertically with vertical tiny-dot separators between them. On sm+, horizontal row.

**Accessibility:** The `<ul>/<li>` semantic — it IS a list of facts. Give the `<ul>` an `aria-label="Key facts about SchoolWatch"`.

## 3. Depth layering

**Subtle background rhythm.** Alternating sections get a faint top-to-bottom gradient to establish chapter rhythm without being obvious:

- Hero: no treatment (already has radial glow)
- SignalsRow: no treatment
- LakerWatchShowcase: subtle linear gradient `background: linear-gradient(180deg, #0a0a0a 0%, #0b0b0e 50%, #0a0a0a 100%)`
- WizardPreview: no treatment
- PullQuote: subtle gradient same as above (for symmetry with showcase)
- FAQ: no treatment
- FinalCta: subtle gradient
- OpenSourceBlock: no treatment
- Footer: no treatment

**Chapter marks:** Each section except Hero and Footer gets a thin hairline top border with a small centered mark. The mark is a `4px × 4px` rotated square (diamond) in `--color-accent`, centered over the hairline.

**Implementation:** A small shared `SectionDivider` component at the top of each eligible section renders the hairline + diamond. Components already receive `className="relative px-6 py-28"` — we add `<SectionDivider />` as the first child of each qualifying `<section>`.

## 4. Custom arrow treatment

**New component:** `components/landing/Arrow.tsx`

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

**Hover behavior:** Parent element gets the `group` class. The Arrow component uses `group-hover:translate-x-1` to slide right on parent hover. Stroke and color follow `currentColor` so it inherits the parent's text color.

**Replacement sites:**
- `Hero.tsx`: Start Yours CTA, See LakerWatch link
- `LakerWatchShowcase.tsx`: `lakerwatch.com` link
- `FinalCta.tsx`: Start Yours CTA
- `Footer.tsx`: GitHub + See LakerWatch links **do not** get the Arrow component — the small mono font density is more important than the flourish. They stay as plain text links.

Each remaining site wraps the button/link with `group` class and replaces the `→` character with `<Arrow />`.

## 5. Copy confidence pass

Tighten these phrases. No voice change, no new sections — just every existing line lands harder.

**Hero subhead:**
- Before: `Pick your colors, add your bell schedule, deploy to a real URL. Five minutes, no code, free.`
- After: `Pick colors. Set the schedule. Hit deploy. Five minutes, no code, free.`

**FAQ Q1 answer:**
- Before: `Yes. Hosting is free on Vercel. The only paid thing is if you want a custom domain like yourschool.com — that's optional and you buy it yourself.`
- After: `Yes. Hosting is free. A custom domain like yourschool.com is optional — everything else is free.`

**FAQ Q2 answer:**
- Before: `No. You get a real URL like yourschool.vercel.app, send it to your friends, and it spreads on its own. You can show your principal later if you want.`
- After: `No. You get a real URL like yourschool.vercel.app. Share it with friends. Show your principal when it's already working.`

**FAQ Q3 answer:**
- Before: `Yes. The wizard handles all three, plus after-school periods and day-type overrides per wave.`
- After: `Yes. Lunch waves, rotating days, block schedules, after-school periods, per-wave overrides — all handled.`

**FAQ Q4 answer:**
- Before: `Yes. You'll get an email link that lets you edit anything — add events, change colors, update the schedule.`
- After: `Yes. An email link lets you edit anything — events, colors, the whole schedule.`

**FAQ Q5 answer:**
- Before: `They probably used a worse option. You can still build yours and share it — whichever one gets used wins.`
- After: `They used a worse option. Build yours anyway — whichever one gets used wins.`

**FinalCta subcopy:**
- Before: `Takes about 5 minutes. No signup before you start.`
- After: `Five minutes. No signup. Live when you're done.`

## 6. Open-source footer block

**New component:** `components/landing/OpenSourceBlock.tsx`
**Placement:** Between `<FinalCta />` and `<Footer />` in `app/page.tsx`.

**Visual:**
- Full-width section, `py-20`
- Centered column, `max-w-2xl`
- Small eyebrow in Geist Mono: `MADE PUBLIC`
- One headline line in Fraunces: `Open by design.`
- Two-line body in Geist: `SchoolWatch is open source. Every school gets its own repository and its own URL — deployed on Vercel, no shared infrastructure, no accounts to manage.`
- Below, a row of three mono-font tags with hairline border:
  - `GITHUB` — links to the repo
  - `VERCEL` — plain text, no link (just the tech lockup)
  - `MIT LICENSE` — plain text

**Purpose:** Establishes that this is infrastructure, not a side project. Reads credible to teachers, CS advisors, and anyone doing due diligence.

## 7. Motion polish

**7a. Hero breathing glow**

The existing radial glow div in `Hero.tsx` animates its opacity between 0.15 and 0.22 over 7 seconds, ease-in-out, infinite loop. Implemented via `motion.div` with `animate={{ opacity: [0.15, 0.22, 0.15] }}` and `transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}`. Respects `prefers-reduced-motion` (skip animation entirely).

**7b. Hero page-load stagger**

On initial page load, the Hero's content blocks stagger in from bottom:
- Eyebrow ("SchoolWatch"): delay 0ms
- Headline: delay 80ms
- Subhead: delay 160ms
- CTA row: delay 240ms
- Micro-trust pills: delay 320ms
- Screenshot window: delay 400ms

Implemented via a single `motion.div` parent with `variants` and staggered children. Duration 500ms each, `ease: "easeOut"`, `y: 16 → 0`, `opacity: 0 → 1`.

**7c. LakerWatch callout staggered reveals**

Currently all four callouts appear at once when the showcase section is in view. Change to staggered: each callout uses its own `Reveal` with a per-index delay (`delay={i * 0.12}`). This means bringing back the `delay` prop we removed from `Reveal` in the prior pass.

**7d. WizardPreview scrollytelling redesign (biggest change)**

Full visual redesign of this section. Detailed:

- **Layout**: vertical stack on all breakpoints (not a grid). Each step is a two-column row: large step numeral left, screenshot + copy right.
- **Step numerals**: Fraunces, very large (`text-8xl` md+, `text-6xl` mobile), weight 500, slight italic for tension. Muted gray (`text-white/30`) when the step is above the active scroll zone. Fades to `text-white` + brief crimson flash when it enters the active zone.
- **Vertical progress line**: a single absolutely-positioned `motion.div` at the left of the step column. Starts as a 2px wide crimson line at `scaleY: 0` from the top. Its `scaleY` is tied to `useScroll` + `useTransform` — as you scroll through the section, the line fills from top to bottom.
- **Per-step activation**: each step row uses `whileInView` with `viewport={{ once: false, amount: 0.55 }}`. When active: screenshot animates `scale: 0.96 → 1`, `opacity: 0.5 → 1` over 500ms; title/body stagger in (50ms apart); number color transitions to `--color-accent` over 300ms, then settles back to white over a further 400ms.
- **Thumbnails**: now display at a larger size (not 4-up compressed). Each `aspect-[16/10]` full-width in its column.
- **Spacing**: each step gets `py-20` so there's breathing room between activations.

**Mobile treatment:** keep scrollytelling, but step numerals shrink (`text-6xl`) and the vertical progress line aligns to the left edge of the content column.

**Section max-width adjustment:** change from `max-w-6xl` to `max-w-4xl` since layout is now vertical.

**7e. CTA hover micros**

Handled by the Arrow component's `group-hover:translate-x-1`. Additionally:
- Primary CTAs get `hover:brightness-110` on the button itself (gives the crimson a subtle lift on hover without requiring a second color)
- Secondary links get `hover:text-white` (already in place)

**7f. FinalCta button ambient glow**

A decorative `motion.div` sits behind the Start Yours button, sized `w-48 h-14`, crimson bg at 0.2 opacity, `blur-2xl`, and animates opacity between 0.2 and 0.35 over 4 seconds infinite. Creates the "breathing beacon" effect for the closing moment. Respects `prefers-reduced-motion`.

## Technical Implementation Approach

### Files modified

- `app/layout.tsx` — add Fraunces font
- `app/globals.css` — add `--font-display` and `--font-fraunces` to `@theme inline`
- `app/page.tsx` — add `<SignalsRow />` and `<OpenSourceBlock />`, reorder as specified
- `components/landing/Hero.tsx` — page-load stagger variants, breathing glow, Fraunces h1, Arrow component usage, `group` on CTAs
- `components/landing/LakerWatchShowcase.tsx` — SectionDivider, background gradient, staggered callout delays, Arrow on lakerwatch.com link, Fraunces h2
- `components/landing/WizardPreview.tsx` — **full rewrite** to scrollytelling layout, Fraunces numerals + h2, SectionDivider
- `components/landing/PullQuote.tsx` — SectionDivider, background gradient, Fraunces for emphasis text
- `components/landing/Faq.tsx` — SectionDivider, Fraunces h2, updated answer copy
- `components/landing/FinalCta.tsx` — SectionDivider, background gradient, Fraunces h2, ambient glow, Arrow, updated subcopy
- `components/landing/Footer.tsx` — optional Arrow replacement, no other changes
- `components/landing/Reveal.tsx` — **restore `delay` prop** for staggered callouts

### Files added

- `components/landing/Arrow.tsx` — SVG arrow component
- `components/landing/SectionDivider.tsx` — hairline + crimson diamond
- `components/landing/SignalsRow.tsx` — new section
- `components/landing/OpenSourceBlock.tsx` — new section

### Dependencies

No new npm dependencies. Uses existing `motion` library for scrollytelling (`useScroll`, `useTransform`).

### Responsive behavior

- Breakpoints unchanged (mobile <768, tablet 768-1023, desktop 1024+)
- WizardPreview scrollytelling works on all three — numeral scales down on mobile
- SignalsRow stacks vertically on mobile, horizontal on sm+
- OpenSourceBlock is a single-column centered layout at all sizes

### Accessibility

- `prefers-reduced-motion` respected across all new motion (hero breathe, scrollytelling progress line, FinalCta ambient glow)
- All SVG decorations (Arrow, SectionDivider) marked `aria-hidden="true"`
- Headings hierarchy preserved: exactly one `<h1>`. Sections with headline copy get `<h2>`. SignalsRow has NO heading — it renders as an unlabeled `<ul>` with `aria-label="Key facts about SchoolWatch"` (it is a list of facts, not a section with content).

### Performance

- Fraunces as variable font loaded via `next/font/google` — single file, `display: "swap"`
- Motion library is already bundled via `Reveal` — no new bundle impact
- `useScroll` + `useTransform` are CSR-only but don't block render — Reveal pattern ensures clean SSR

## Out of Scope

- Full page layout rewrite (keep the 7-section skeleton; we're dressing it, not redesigning it)
- Dark/light theme toggle (stays dark-only)
- Custom cursor
- Replacing the placeholder screenshots (real screenshots already wired in commit `919e11f`)
- Form/wizard UX changes (Pass 2)
- Analytics integration
- SEO overhaul (current `<title>` and `<meta description>` are adequate)

## Success Criteria

Subjective:

- Page reads as "real product" not "tech demo" at first scroll
- A principal looking over the student's shoulder does not flinch at the design quality
- The wizard walkthrough feels like watching someone actually use it
- Every major moment has at least one subtle motion beat
- Copy is confident without being pompous

Objective (post-launch, when analytics exist):

- `/` → `/setup` click-through rate increases vs current version
- Average scroll depth on `/` increases (proxy for engagement with the page)
- `/setup` abandonment rate holds or drops (we're not attracting the wrong people)

## Copy Reference (locked in)

Headlines (Fraunces):
- Hero `<h1>`: `Build the schedule app your school never made.` *(unchanged)*
- Showcase `<h2>`: `A real student-built dashboard. Running right now.` *(unchanged)*
- WizardPreview `<h2>`: `Four screens. No code. No catch.` *(unchanged)*
- FAQ `<h2>`: `Answered.` *(unchanged)*
- FinalCta `<h2>`: `You're still reading. Go build it.` *(unchanged)*
- OpenSourceBlock `<h2>`: `Open by design.` *(new)*

Body copy changes: see Section 5.

Signals row copy: `5 MIN TO LIVE` · `0 LINES OF CODE` · `OPEN SOURCE` *(new)*
