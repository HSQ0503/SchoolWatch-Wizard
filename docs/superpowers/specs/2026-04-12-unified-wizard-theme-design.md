# Unified Wizard Theme — Design Spec

**Date:** 2026-04-12
**Scope:** Retire the dark terminal visual language inside `/setup`, `/edit`, and `/login`. Rewrite the wizard shell and all seven step components in the same paper-and-ink zine vocabulary already shipped on the homepage (`app/page.tsx` + `components/landing/*`).

## Goal

The homepage speaks a warm, tactile, student-made zine language (paper palette, Archivo Black + Fraunces italics, handwritten margin notes, polaroids, yellow offset-shadow CTAs). Clicking "Start Yours" currently drops the user into a cold monospace terminal wizard — two visual worlds glued together. This spec unifies them under the zine language so the identity established on the homepage survives the commitment moment.

## Non-Goals

Recording these explicitly to keep the PR focused:

- `lib/email.ts` magic-link email template — separate rendering target with its own constraints (MSO conditionals, inline CSS, email client compatibility). Revisit in a later PR if we want a zine-themed email.
- `lib/config-generator.ts` output — the generated `school.config.ts` source stays byte-for-byte identical. AGENTS.md is explicit: the deployed template expects this exact string shape.
- Any `/api/*` route handler, Prisma schema, or auth flow. Pure presentation layer only.
- The deployed school dashboards (`lakerwatch.com` et al.). Different repo, different product.
- Landing page (`app/page.tsx` + `components/landing/*`). Already zine; only one narrowing change (see Section 1).
- No new fonts beyond the four already loaded in `app/layout.tsx`.
- No new runtime dependencies. `motion/react`, Tailwind v4, `next/font` are enough.
- No dark-mode toggle on the wizard. It was never a feature; the wizard is single-theme now.
- No new CSS vars beyond the `.theme-zine` set already defined in `globals.css:19-32`.

## Approach

Single branch, single PR. One coherent visual pass over the wizard shell + all seven steps + auxiliary surfaces (DeployProgress, ConfigPreview, login, edit). The CSS-var system already isolates palette changes to one place; step components are small; there's no backend or data risk. Breaking this across multiple PRs would force the wizard through a transitional period where some steps look zine and others still look terminal — worse UX than the big-bang switch.

## Section 1 — Theme mechanics & typography

### Palette

Apply the existing `.theme-zine` wrapper (already defined in `app/globals.css:19-32`) at the outer `<div>` of `components/WizardShell.tsx` so `/setup` and `/edit` inherit it automatically, and directly on the page root of `app/login/page.tsx` since login doesn't render the shell. The wrapper flips:

- `--background` → `--paper` (`#f5efe0`)
- `--foreground` → `--ink` (`#1a1a1a`)
- Activates `--paper-dark`, `--ink-soft`, `--ink-faded`, `--highlight`, `--marker`, `--blue-mark`, `--hairline`

One override is required. The current `.theme-zine` rule hides the native scrollbar via `html:has(.theme-zine)`, which is fine on the landing one-pager but bad on a scrolling wizard form. Narrow that selector to `html:has(.theme-zine-landing)` and add a `theme-zine-landing` class alongside `theme-zine` on the `<main>` wrapper in `app/page.tsx:15`. The wizard keeps its scrollbar.

No new CSS vars. Remove wizard-specific references to `--bg-input`, `--color-accent`, `--color-line`, `--color-line-strong`, `--color-bg-raised`, `--color-text-dim`, `--color-text-faded`, `--color-ok` inside `components/wizard/*` and `components/WizardShell.tsx`. The dark `:root` vars in `globals.css:3-17` stay untouched (they still apply to non-zine surfaces if any are added later).

### Fonts

Already loaded in `app/layout.tsx` via `next/font`:

- `--font-archivo` — Archivo Black (display headlines)
- `--font-display` — Fraunces (serif body + italic accents)
- `--font-caveat` — Caveat (handwritten margin notes)
- `--font-mono` — JetBrains Mono (kickers, labels, chrome)
- `--font-sans` — Geist (neutral body fallback)

Wizard adopts the same stack. No new font loads.

## Section 2 — Shell chrome

Three components in `components/wizard/` get rewritten. All stay at the same layout positions (sticky top, sticky bottom) — this is a pure visual translation, not a structural change.

### `WizardTopBar`

`components/wizard/WizardTopBar.tsx`. Becomes a dark ink bar laid across the paper: background `--ink`, text `--paper`, `--font-mono` 11px, letter-spacing `0.1em`. Left side: boxed `SW` monogram in `--font-archivo` → `schoolwatch · wizard · v0.3.2` → pulsing `--color-ok` dot (retained as a green indicator on the ink bar) + "connected". Right side: `⌘K commands` / `? help` with `<Kbd>` chips restyled to paper-on-ink (paper border, paper text). Mirrors how the homepage's `ZineNav` sits atop the paper.

### `ProgressStrip`

`components/wizard/ProgressStrip.tsx`. Paper-on-paper panel below the topbar: `--paper-dark` background, bottom border `--hairline`.

- **Left label:** mono `step 01 / 07` with the active number rendered in `--font-archivo` weight 900 and `--marker` color.
- **Middle cells:** 7 bell-cells, `--ink` border 1.5px, `--paper` empty fill, `--highlight` fill for done and active cells. The active cell gets a 3px hard offset shadow in `--ink` (`box-shadow: 3px 3px 0 var(--ink)`).
- **Right label:** uppercase mono step name (e.g. `SCHOOL INFO`).

The existing coral hatched animation is retired. Active cell gets a subtle `--highlight` → `--paper-dark` shimmer (CSS-only keyframe, 3s linear infinite). Disabled under `prefers-reduced-motion` (rule already present in `globals.css:77-89`).

### `StatusBar`

`components/wizard/StatusBar.tsx`. Sticky bottom navigation becomes a `--paper-dark` bar with hairline top border.

- **Left:** ghost back button — mono uppercase, underline offset 4px, hover transitions `--ink` → `--marker` with `text-decoration-style: wavy`. Same idiom as the "See LakerWatch" link at `ZineHero.tsx:83-94`.
- **Middle:** validation errors in Fraunces italic, `--marker` color. Replaces the current boxed alert treatment.
- **Right:** primary CTA — `--ink` background, `--paper` text, Archivo Black 14px. Uses the signature offset-shadow pattern from `ZineHero.tsx:72`: `shadow-[6px_6px_0_var(--highlight)]` with hover translating to `3px_3px_0` and active pressing to `0_0_0`.

The coral accent color, `bg-[--color-bg-raised]` surfaces, and hatched progress patterns are fully retired here.

## Section 3 — Step body pattern

Every step renders into the same content container, so one pattern governs all seven.

### Container

- Max-width `1120px` (matches homepage hero at `ZineHero.tsx:28`), centered.
- Padding `36px 42px` on desktop, `24px 20px` on mobile.
- Background `--paper` (inherited) — no card/surface layer. The form sits directly on the page like content on a magazine spread.

### Step header

Three stacked pieces:

1. **Kicker:** mono uppercase, e.g. `step 02 / colors · pick the palette`. `--font-mono`, 11px, `letter-spacing: 0.22em`, color `--ink-faded`.
2. **Headline:** Archivo Black, `clamp(32px, 4.2vw, 52px)`, leading `0.95`. Each step has one Fraunces italic accent word ("the *colors*", "your *schedule*", etc.) — same mixed-font idiom as `ZineHero.tsx:48-58`.
3. **Subcopy:** Fraunces serif 16px, color `--ink-soft`, max-width `52ch`.

### Form rows

- **Labels:** mono uppercase 10px, `letter-spacing: 0.18em`, color `--ink-faded`. No `:` suffix.
- **Text inputs:** underline-only. Transparent background, `border-bottom: 2px solid var(--ink)`, `--font-display` 18px text. Focus state changes border-bottom to `--marker`. No box borders, no rounded corners, no fill.
- **Paired fields:** two-column grid (short name / acronym, mascot / city). Collapses to single column below `md`.
- **Checkboxes / radios:** hand-inked squares. `--ink` border, `--highlight` fill when checked, with a hand-drawn check rendered as inline SVG (not Unicode ✓).

### Decoration

One `MarginNote` per step. Caveat font, `--marker` color, slight rotation (-4° to 6°). Pulls attention to the single most useful tip for that step. Positioned absolutely in the right margin on `lg+`, inline at the top on mobile. Reuses the existing `components/landing/MarginNote.tsx` component verbatim.

### Error state

Errors render as a Fraunces italic line in `--marker` above the offending field. Not a boxed alert. Matches the margin-note vernacular.

### Section rules

Where a step has internal sections (Schedule's day-types vs. bell-periods, Calendar's three date lists), separate with a dashed hairline `border-top: 1px dashed var(--hairline)` and a mono uppercase section label. Same device as the dashed rows inside the hero Polaroid at `ZineHero.tsx:143-146`.

## Section 4 — Per-step treatments

The Section 3 pattern covers most of it. Per-step deltas:

### 1 · `StepSchoolInfo`

Straight application of Section 3. Logo uploader becomes a dashed-border `--ink` rectangle with a Caveat hint ("drop logo here ↙"). Preview swatch renders as a mini-Polaroid with 2° rotation once an image loads (reuses `components/landing/Polaroid.tsx`).

### 2 · `StepColors`

- Two seed swatches at top (primary / accent): ink-bordered squares, hex typed in mono beside each.
- Eight zone overrides stack below as a dashed-rule list, one row per zone (`navbar`, `navText`, `background`, `heading`, `ring`, `surface`, `cardAccent`, `badge`). Override-tracking `Set` logic in `StepColors.tsx` is preserved.
- The `DashboardPreview` on the right sits inside a `TapedScreenshot` frame (existing homepage component at `components/landing/TapedScreenshot.tsx`) with two tape strips. The frame contains the dark deployed dashboard rendered accurately — the metaphor is "photo of a phone on the desk."
- Dark-mode derive/override logic in `lib/colors.ts` is untouched.

### 3 · `StepSchedule`

Highest density step.

- **Day-type picker:** row of ink-bordered chip toggles (weekday letters M T W T F), similar to the "this week" polaroid grid at `ZineHero.tsx:130-141`.
- **Bell periods:** ruled table. Dashed hairline between rows, mono period name on the left, Fraunces italic time inputs on the right. Small ink `+ add period` button under the list.
- **Per-wave overrides:** collapse into a nested ruled block under each lunch wave tab.

### 4 · `StepLunchWaves`

- Enable/disable as a single toggle card.
- Each wave is a ruled block with its name inline-edited (underline input) and a dashed list of bell override periods. "Add wave" is an ink ghost button.

### 5 · `StepCalendar`

Three lists: no-school dates, early-dismissal dates, events. Each renders as stacks of index-card-style rows — white card, slight 1° rotation on every third item for handmade feel, date on the left in Archivo Black, label in Fraunces. Date picker uses native `<input type="date">` styled with an underline and ink caret color.

### 6 · `StepFeatures`

Two toggles. Render as big ink checkboxes with Fraunces descriptions beside each — physical-feeling rather than sliders. Sparse step; fill with a `MarginNote` about what each feature actually does.

### 7 · `StepReview`

The "cover sheet."

- Archivo Black title, stacked summary sections (school, colors, schedule summary, calendar counts, features) separated by dashed rules and mono uppercase section labels. Existing `SectionLabel` component retained.
- Primary Deploy CTA: the hero ink-button-with-yellow-shadow, full-width on mobile.
- `ConfigPreview` panel: renders as a white "printed report" card inside the paper — hairline border, mono 12px, subtle. Collapsed by default behind a `view generated config ↓` disclosure.

## Section 5 — Auxiliary surfaces

### `DeployProgress`

`components/DeployProgress.tsx`. State machine `idle → creating-repo → pushing-config → creating-project → deploying → done | error` stays identical. Visual:

- Stacked ruled rows on paper, one per state.
- **Pending rows:** faded ink (`--ink-faded`).
- **Active row:** `--highlight` background strip with a pulsing ink dot on the left. Keeps the current `animate-ping` + solid inner circle CSS pattern — just reskinned from coral to ink.
- **Done rows:** hand-drawn ink checkmark (inline SVG, not Unicode ✓).
- **Error rows:** `--marker` strikethrough line with the error message in Fraunces italic underneath.

No heavy animation library. The existing CSS-only approach ports directly.

### `ConfigPreview`

`components/wizard/ConfigPreview.tsx`. Currently a dark mono code block. Reskin as a "printed report" card:

- `--paper` background with hairline `--ink` border.
- Tiny Caveat label "school.config.ts" in the top-right corner, rotated 2°.
- Code itself: mono 12px, `--ink` on `--paper`. No syntax colorization — the code's density alone reads as a printed listing.
- Collapsed by default on the Review step behind a mono disclosure.

### Login page

`app/login/page.tsx`. Currently shares the dark wizard vocabulary. Convert:

- Centered paper card (max-width ~480px).
- Archivo Black headline "Edit your SchoolWatch".
- Fraunces subcopy.
- Single underline email input.
- Ink button with yellow offset shadow, label "send me a link →".
- Success state in `--marker` Fraunces italic.
- One Polaroid or MarginNote for warmth and continuity with the homepage.

### Edit page

`app/edit/page.tsx`. Reuses the redesigned `WizardShell`, so it inherits all chrome and step work. Zero extra design work beyond importing the shell and ensuring the theme wrapper is applied.

### Kbd component

`components/wizard/Kbd.tsx` is retained but restyled: paper border, paper text, on-ink backdrop when used inside `WizardTopBar`. Its prior dark styling is removed.

## Architecture notes

### File touch list

Rewritten:

- `components/WizardShell.tsx` — theme wrapper, container classes
- `components/wizard/WizardTopBar.tsx`
- `components/wizard/ProgressStrip.tsx`
- `components/wizard/StatusBar.tsx`
- `components/wizard/ConfigPreview.tsx`
- `components/wizard/Kbd.tsx`
- `components/wizard/StepSchoolInfo.tsx`
- `components/wizard/StepColors.tsx`
- `components/wizard/StepSchedule.tsx`
- `components/wizard/StepLunchWaves.tsx`
- `components/wizard/StepCalendar.tsx`
- `components/wizard/StepFeatures.tsx`
- `components/wizard/StepReview.tsx`
- `components/wizard/DashboardPreview.tsx` — wrap in `TapedScreenshot`, internals unchanged
- `components/wizard/DeployLog.tsx`
- `components/DeployProgress.tsx`
- `app/login/page.tsx`
- `app/edit/page.tsx`
- `app/setup/page.tsx` — light touch if needed (theme applied via `WizardShell`)

Touched (one-line changes):

- `app/page.tsx:15` — add `theme-zine-landing` class alongside `theme-zine`
- `app/globals.css:35-40` — narrow the scrollbar-hide selector from `.theme-zine` to `.theme-zine-landing`

Imported from existing landing components (no rewrites):

- `components/landing/MarginNote.tsx`
- `components/landing/Polaroid.tsx`
- `components/landing/TapedScreenshot.tsx`
- `components/landing/Highlight.tsx`

Untouched:

- All of `lib/*`
- All of `app/api/*`
- `prisma/schema.prisma`
- `components/landing/*` (only imports added from wizard side)

### Motion

`motion/react` already in use on homepage. Each step mount gets the same stagger container/item variants from `ZineHero.tsx:10-17`. Respects `useReducedMotion()`.

### Responsiveness

Mobile-first implementation (per project preference). Sizes and layouts described in this spec are the desktop end state for clarity; the actual Tailwind classes stack base (mobile) → `md:` → `lg:`. Key mobile behaviors: paired form-row grids collapse to single column, MarginNotes shift from absolute right-margin placement to inline-at-top, Polaroid and TapedScreenshot frames scale proportionally, headline clamp ensures legibility down to ~375px viewport width.

## Accepted regressions

- Coral hatched progress animation fully retired.
- Terminal monospace aesthetic for wizard bodies fully retired. Mono is now only used for kickers, labels, and chrome — not for primary UI surfaces.
- The HTML mockup written to `.superpowers/brainstorm/` during this session (Option A of `unification-degree.html`) becomes the new canonical visual reference. Any older terminal-style reference (e.g. a `wizard-terminal.html` artifact) is stale.
- Previous dark styling of `Kbd` component is gone.

## Open questions

None. All sections approved during brainstorming.

## Next step

Invoke `superpowers:writing-plans` to turn this spec into a step-by-step implementation plan.
