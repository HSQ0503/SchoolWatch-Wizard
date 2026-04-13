# Wizard + Homepage Redesign — Design Spec

**Date**: 2026-04-12
**Branch**: `feat/homepage-redesign`
**Author**: Han + Claude (via superpowers:brainstorming)

---

## 1. Summary

The current site reads as generic 2026 AI-slop: dark editorial surface + coral accent + Fraunces serif — interchangeable with 50 other landing pages. The wizard itself is a utilitarian `bg-white/10` form that screenshots poorly, undermining the homepage's "how it works" section.

This redesign commits to **two distinct visual languages** that express the product honestly:

- **Homepage — "Student zine"**: cream paper background, heavy `Archivo Black` headlines with highlighter-marker passes, handwritten red annotations, taped polaroid screenshots. The voice of the high-schooler who builds things.
- **Wizard — "Developer utility"**: pure `JetBrains Mono`, dark terminal surface with a 32px grid, ASCII-style progress bar, dense two-pane layout where the right pane is a live syntax-highlighted `school.config.ts` preview. The voice of a respected dev tool.

The hybrid tells the truth about the product: a zine landing page says "a student made this for you"; the terminal wizard says "the thing you deploy is real infrastructure."

**Strict invariant**: this is a styling + component-composition change. **No backend logic, data shape, API, or deploy-pipeline behavior changes.** See §3.

---

## 2. Goals & Non-Goals

### Goals

1. Replace the homepage with the zine-direction design proven in `.superpowers/brainstorm/…/homepage-zine.html`.
2. Replace the wizard chrome and per-step UI with the terminal-direction design proven in `.superpowers/brainstorm/…/wizard-terminal.html`.
3. Regenerate the four wizard screenshots on the homepage's "How it works" section so they reflect the new wizard and look like thumbnails from a dev tool.
4. Extract reusable primitives (`Polaroid`, `TapedScreenshot`, `Highlight`, `MarginNote`, `HandwrittenArrow` for the homepage; `ConfigPreview`, `ProgressStrip`, `StatusBar`, `DashboardPreview` for the wizard).
5. Preserve every piece of existing behavior: same `WizardFormData`, same API routes, same deploy pipeline, same color-zone math, same config-generator output.
6. Keep accessibility: `prefers-reduced-motion` respected, keyboard navigation works on new wizard components, focus-visible outlines everywhere.

### Non-Goals

- No backend / API / Prisma / deploy-pipeline changes.
- No new wizard steps, fields, or validation rules.
- No new `WizardFormData` fields.
- No email template redesign (dark HTML email stays).
- No responsive/print redesign of `/login` beyond what falls out of shared styling.
- No animation library swap (`motion/react` stays).
- No new dependencies except three Google Fonts (`Archivo Black`, `Caveat`, `JetBrains Mono` — `JetBrains Mono` may already be loaded via Geist Mono, but we'll add it explicitly since the wizard is mono-only).
- No refactor of `lib/config-generator.ts` into an AST builder (CLAUDE.md explicitly warns against this).

---

## 3. Behavior Preservation — The Invariant List

**These behaviors MUST be byte-identical after the redesign.** If any implementation step would alter one, stop and flag it.

### 3.1 Data contracts (unchanged)

- `WizardFormData` shape in `lib/types.ts`.
- `StepProps = { data, onChange, schoolId? }` — every step component receives exactly this.
- `StepComponent` mutates via `onChange(nextData)` — never in place.
- `DEFAULT_FORM_DATA` initial values in `components/WizardShell.tsx`.
- `STEPS` array order and length (7 steps, exact labels).
- `School` Prisma model unchanged.

### 3.2 Wizard shell behavior (unchanged)

- `validateStep(stepIndex, data) → string[]` — same function, same return shape, same validation rules per step.
- `currentErrors` re-computed on every render from `validateStep`.
- `showErrors` is `false` on every step change; `true` only after a failed Next click.
- `StepErrorBoundary` wraps every step (same component, same fallback UI message).
- Debug `console.log` calls on mount, step change, Next, Back — preserved.
- Navigation rules: disabled Back on first step, no Next on last step (Review has its own Deploy button).

### 3.3 Colors (`lib/colors.ts`) — unchanged

- `defaultLightColors(primary, accent)` — identical math.
- `deriveDarkColors(light)` — identical math (heading darken 8/8/15, ring lighten 15).
- `resolveDarkColors(light, overrides)` — identical merging.
- `ZoneColors` type — identical keys (`navbar, navText, background, heading, ring, surface, cardAccent, badge`).
- Override tracking via `Set<keyof ZoneColors>` — identical semantics (seed changes never clobber overridden zones).
- Legacy flat `{ primary, accent }` migration in `edit/page.tsx` — preserved.

### 3.4 Config generation (`lib/config-generator.ts`) — unchanged

- Exact output TypeScript source format. The deployed template parses this string — changing indentation, quoting, or key order is a breaking change.
- `esc()` quote-escaping helper unchanged.
- This spec **adds a new consumer** (`ConfigPreview` for the live wizard preview) but it must call the exact same generator, not reimplement it.

### 3.5 Deploy pipeline (`/api/deploy`, `/api/redeploy`) — unchanged

- Order: generate slug → check uniqueness → `createRepoFromTemplate` → `waitForRepoReady` → `createProject` → push logo (if any) → push `school.config.ts` → `triggerDeployment` → save School row → send magic link.
- `pushFile` 409 retry backoff (3s × attempt, 5 attempts) — unchanged.
- Explicit `triggerDeployment` call after push — unchanged.
- `data.logo` base64 stripped before `prisma.school.create` — unchanged.
- `X-Entity-Ref-ID` idempotency key on magic-link email — unchanged.

### 3.6 Auth & email — unchanged

- `createMagicLinkToken` (15 min) / `verifyMagicLinkToken` / session cookie helpers (7 d) — untouched.
- `sendMagicLinkEmail` HTML template — untouched (dark-themed email stays; it already works and is tested across clients).
- `isSuperAdmin(email)` — untouched.

### 3.7 DeployProgress state machine — unchanged semantics

Current states: `idle → creating-repo → pushing-config → creating-project → deploying → done | error`. Edit mode skips the first two.

The **UI representation** changes to a terminal-log-style list (`DeployLog.tsx`), but the underlying state machine, the state transition timing, and the edit-mode skip logic are preserved. The component consuming the states may be renamed, but the states and their triggers are not.

### 3.8 Validation rules — unchanged

`lib/validation.ts` — same per-step validators, same error messages. The UI for displaying errors changes (terminal status bar vs current red panel), but the validation logic is identical.

---

## 4. Design System — Tokens

### 4.1 Homepage tokens — "Zine"

Added to `app/globals.css` under a new `.theme-zine` class scoped to `<main>` in `app/page.tsx`. Does not affect `:root` (wizard) tokens.

```css
.theme-zine {
  --paper: #f5efe0;
  --paper-dark: #ebe3d1;
  --ink: #1a1a1a;
  --ink-soft: #3a3a3a;
  --ink-faded: #6b6b6b;
  --highlight: #ffd23c;
  --marker: #d63c3c;
  --blue-mark: #2a4a8a;
  --hairline: rgba(26,26,26,0.12);
}
```

### 4.2 Wizard tokens — "Terminal"

Replaces existing `:root` dark tokens; the site-wide default shifts to these because the wizard is the app shell.

```css
:root {
  color-scheme: dark;
  --background: #0a0b0d;      /* was #0a0a0a */
  --bg-raised: #121317;
  --bg-input: #16181d;
  --foreground: #e4e4e7;
  --line: #1f2128;
  --line-strong: #2a2d36;
  --text-dim: #a1a1aa;
  --text-faded: #5e6068;
  --color-accent: #ff6363;    /* kept — carries across to zine */
  --color-ok: #10b981;
  --color-warn: #f59e0b;
}
```

The existing `@theme inline { ... }` block stays; we extend it with the new tokens so Tailwind arbitrary values like `text-[color:var(--color-ok)]` work.

### 4.3 Fonts

Loaded in `app/layout.tsx` via `next/font/google`:

- `Archivo Black` (display, 900 only) — new
- `JetBrains Mono` (400/500/700) — new, replaces `Geist Mono` usage in wizard
- `Caveat` (500/700) — new, handwritten annotations only
- `Fraunces` (opsz 9..144, italic+normal 400/500) — kept (already loaded)
- `Geist` — kept (used only in email template; removed from wizard)

Exposed as CSS variables (`--font-archivo-black`, `--font-jetbrains-mono`, `--font-caveat`, `--font-fraunces`) and re-exported via `@theme inline`.

### 4.4 Shared brand anchors

Two things carry across both surfaces so they feel like one product:

- `--color-accent #ff6363` (coral) — in the zine it's the `--marker` red; in the wizard it's the interactive accent.
- `JetBrains Mono` — labels/metadata on the zine, everything on the wizard.

---

## 5. Homepage Architecture

### 5.1 Composition (`app/page.tsx`)

```tsx
<main className="theme-zine">
  <PaperNoise />        {/* renamed from Noise; grain retuned for paper */}
  <ZineNav />           {/* new: top nav with SW stamp, wavy hover underlines */}
  <ZineHero />
  <SignalsRow />
  <Showcase />          {/* replaces LakerWatchShowcase */}
  <HowItWorks />        {/* replaces WizardPreview */}
  <PullQuote />
  <Faq />
  <FinalCta />
  <Footer />            {/* absorbs OpenSourceBlock */}
</main>
```

### 5.2 Per-section specs

#### `ZineNav`
- Sticky, `bg-paper border-b border-hairline`.
- Left: SW monogram stamp (rotated −2°) + "SchoolWatch" in mono.
- Right: `How it works · Live example · FAQ · GitHub ↗` with `text-decoration: underline wavy var(--marker)` on hover.

#### `ZineHero`
- Eyebrow: `a free tool · by students · for students` (mono, 11px, letter-spacing 0.22em).
- H1: `Archivo Black` at `clamp(56px, 9vw, 112px)`, max-width 14ch. Includes `<Highlight>schedule site</Highlight>` and `<FrauncesItalic>not suck.</FrauncesItalic>` children.
- Lede: Fraunces body at 19px, `text-ink-soft`, 42ch max.
- CTAs: `btn-primary` (black bg, paper text, yellow `box-shadow: 6px 6px 0 var(--highlight)` — lifts to `8px 8px` on hover) + `btn-ghost` (mono underlined link).
- Absolute-positioned `<HandwrittenArrow label="free & open source">` pointing at the CTA.
- Photo collage: three `<Polaroid>` components (rotated −5°, +6°, −2°), each containing a fake mini-dashboard + optional Caveat caption.

#### `SignalsRow`
- `border-y border-ink` (2px black rules).
- Four signals as `<span class="num">N</span><span class="label">…</span>`, separated by rotated-square diamond dividers.
- `num`: Archivo Black 34px `text-marker`; label: mono 13px.
- No decorative dots. Every visual element has a signal role.

#### `Showcase`
- Section label: `exhibit a · live at windermere prep` (mono).
- H2: Archivo Black + Fraunces italic: `A real one, *already* running.`
- Grid `1.5fr 1fr`:
  - Left: `<TapedScreenshot rotation={-1.5} tapes={['yellow-left', 'red-right']}>` wrapping a real `/screenshots/lakerwatch-dashboard.png`.
  - Right: `<MarginNote n={1..3}>` stack with Caveat-styled red numerals and Fraunces body.
- CTA: Caveat-style link (`see lakerwatch.com →`) with dashed red underline.

#### `HowItWorks`
- Four `<Step>` rows, grid `140px 1fr 420px`.
- Huge numeral (`01`–`04`) in Archivo Black 140px with yellow fill + 2px black `-webkit-text-stroke` and a red angled underscore.
- Right column: `<TapedScreenshot>` rotated ±1–1.5° containing the **newly regenerated** wizard screenshots (see §7).
- Absolute-positioned `<HandwrittenArrow>` on 2 of 4 steps ("← weird schedules welcome", "takes ~30s ↘").

#### `PullQuote`
- 4px red rules above and below, 60px wide each.
- Fraunces at `clamp(32px, 4.5vw, 52px)`, 20ch max, italic + Highlight on "one or two kids who build things". Dimmed tail sentence `text-ink-faded`.
- Cite in Caveat: `— the manifesto, basically`.

#### `Faq`
- H2: `Archivo Black` + Fraunces italic: `Answered. *Next.*`
- `<ol>` with `grid-cols-[60px_1fr]`: red Archivo numeral + question (Archivo 22px) / answer (Fraunces 17px with inline `<Highlight>` on key phrases).
- Border-bottom on each `<li>`; no backgrounds.

#### `FinalCta`
- Flips to `background: var(--ink)` + `color: var(--paper)`.
- Top edge: 12px `repeating-linear-gradient(135deg, yellow 0 20px, transparent 20px 40px)` on marker-red base (candy-stripe tape).
- H2: Archivo Black at `clamp(56px, 9vw, 120px)` with a yellow `<Highlight>` on "reading".
- Button: yellow bg, black text, 3px paper-colored border, `8px 8px 0 var(--marker)` shadow.
- Caveat "stamp": `open source · MIT · made at WPS` in a dashed yellow rounded rectangle, rotated −2°.

#### `Footer`
- Mono 12px, `text-ink-faded` with red-marker underlined links.
- Left: `SchoolWatch · made by Guga and Han @ WPS`.
- Right: `GitHub · LakerWatch.com`.
- Includes the "Open source / Vercel / MIT" signal-pills that previously lived in `OpenSourceBlock`, as a small row above the main footer line.

### 5.3 New components (`components/landing/`)

| File | Purpose |
|---|---|
| `ZineNav.tsx` | Sticky header |
| `ZineHero.tsx` | New hero section |
| `Showcase.tsx` | Replaces `LakerWatchShowcase.tsx` |
| `HowItWorks.tsx` | Replaces `WizardPreview.tsx` |
| `Polaroid.tsx` | Taped polaroid frame primitive |
| `TapedScreenshot.tsx` | Screenshot-in-frame with configurable tape strips |
| `Highlight.tsx` | `<span>` with gradient marker-pass |
| `MarginNote.tsx` | Numbered Caveat note primitive |
| `HandwrittenArrow.tsx` | SVG curve + Caveat label |
| `PaperNoise.tsx` | Retuned fixed-position grain overlay |

### 5.4 Deleted components

- `LandingHero.tsx`, `LandingFeatures.tsx` — already gone on this branch, noted for completeness.
- `Hero.tsx` (current), `LakerWatchShowcase.tsx`, `WizardPreview.tsx`, `OpenSourceBlock.tsx`, `SectionDivider.tsx`, `Noise.tsx` (replaced by `PaperNoise`), `Arrow.tsx` (replaced by native `→` glyph + HandwrittenArrow for hero annotations), `Reveal.tsx` (replaced by sectional `motion.div` with `whileInView`).
- Note: `FinalCta.tsx`, `Faq.tsx`, `PullQuote.tsx`, `Footer.tsx`, `SignalsRow.tsx` are **rewritten in place** (file kept, content replaced).

---

## 6. Wizard Architecture

### 6.1 Shell (`components/WizardShell.tsx`)

Structurally identical (same state hooks, same error boundary, same validation flow), but visually rebuilt.

```
┌──────────────────────────────────────────────────────────┐
│ <WizardTopBar>   SW · schoolwatch · wizard · v0.3.2      │ ← new
│                  ● connected          ⌘K commands · ? help│
├──────────────────────────────────────────────────────────┤
│ <ProgressStrip>  step 02/07  ████████░░░░░  COLORS       │ ← new
├───────────────────────────┬──────────────────────────────┤
│                           │                              │
│  <StepComponent>          │  <ConfigPreview>  OR         │ ← new right pane
│    (form left pane)       │  <DeployLog> on final step   │
│                           │                              │
├───────────────────────────┴──────────────────────────────┤
│ <StatusBar>  TAB · ⏎ · ⌘←       ● valid · N of M         │ ← new (replaces nav footer)
└──────────────────────────────────────────────────────────┘
```

### 6.2 Navigation model change — confirmation

The current shell has sticky `Back` / `Next` buttons at the bottom. The new design puts keyboard hints in the status bar. **We will keep both**: status bar for keyboard hints (TAB, ⏎, ⌘←), and a pair of text-label-only buttons (`← back   next →`) aligned to the right of the status bar content. Buttons look like terminal commands, not marketing CTAs. This preserves tap/click navigation on touch devices.

### 6.3 `ConfigPreview` component (new)

- Props: `{ data: WizardFormData; activeStep: number }`.
- Calls **`generateConfigTs(data)` from the existing `lib/config-generator.ts`** on every render to produce the canonical TypeScript source string. The preview ALWAYS shows the complete config — fields not yet edited by the user render with `DEFAULT_FORM_DATA` values (so the preview is never half-empty or structurally broken).
- Runs the resulting string through a small regex-based syntax tokenizer (zero deps — matches keywords, strings, numbers, comments, function names) and emits `<span>` tokens with classes (`.kw`, `.str`, `.num`, `.com`, `.fn`). The tokenizer is internal to `ConfigPreview`; do not extend `config-generator.ts` to emit tokens.
- Uses `activeStep` to compute which line ranges in the output correspond to the current step's fields (a small lookup table: step 0 = `school: { … }` block, step 1 = `colors: { … }` block, etc.) and applies a coral left-border + subtle bg tint to those lines, with a blinking coral caret on the last highlighted line.
- Scroll position auto-scrolls the highlighted block into view on step change.
- **Source-of-truth rule**: if `config-generator.ts` changes output format, `ConfigPreview` automatically reflects it. No parallel formatting logic.

### 6.4 Per-step changes

Each step component keeps its **props, state hooks, and behavior** identical. Only the rendered JSX changes.

| Step | Behavior preserved | Visual change |
|---|---|---|
| `StepSchoolInfo` | same fields, same validation | `snake_case` row labels, `.field-row` grid, mono inputs with coral focus ring |
| `StepColors` | `updateSeeds`, `updateZoneColor`, `resetZone`, `overriddenZones` Set, `darkMode` state, `activeZone` popover — all unchanged | seeds → compact `.seed` cards; zones → 2-column dense list with chips + hex; dashboard preview extracted to `DashboardPreview.tsx` **without logic change** (inline styles stay — it must still render using raw hex, not Tailwind) |
| `StepSchedule` | same day-type and bells data shape | day-type cards with `type_0N` labels, bell table in mono with green tabular times, `[+] add` links in coral-mono style |
| `StepLunchWaves` | same toggle + options array | same pattern as schedule |
| `StepCalendar` | same date arrays | list of `YYYY-MM-DD · label · type` rows |
| `StepFeatures` | same boolean toggles | `.checkbox-row` style from the mockup |
| `StepReview` | same summary + deploy trigger | 4 `<dl>`-style review blocks; big `./deploy →` button in coral; right pane replaces `<DeployProgress>` with `<DeployLog>` |

### 6.5 `DashboardPreview` (new component, extracted from `StepColors`)

- Props: `{ palette: ZoneColors; darkMode: boolean; appName: string }`.
- Renders the same inline-styled dashboard mockup currently living inside `StepColors.tsx`.
- The inline-style approach **must stay** (don't port to Tailwind) — the preview renders arbitrary user hex, which Tailwind can't express.
- Moves to `components/wizard/DashboardPreview.tsx` so future work can reuse it.

### 6.6 `DeployLog` component (new, replaces `DeployProgress`)

- Same state machine inputs (`idle → creating-repo → pushing-config → creating-project → deploying → done | error`).
- Renders timestamped log lines: `00:04.8  ✓ github repo created  HSQ0503/…`.
- Pending line blinks coral dot (`●`) with `animation: blink 0.8s ease-in-out infinite`.
- Final done state reveals the deployed URL and the `magic-link sent` line.
- Error state shows a red `✗` line with the error message.
- File at `components/wizard/DeployLog.tsx`. `DeployProgress.tsx` is deleted.

### 6.7 New wizard components (`components/wizard/`)

| File | Purpose |
|---|---|
| `WizardTopBar.tsx` | Sticky app bar (logo stamp, version, connection dot, kbd hints) |
| `ProgressStrip.tsx` | `[N/M] ████░░░░` ASCII-ish progress with hatched-animated active cell |
| `StatusBar.tsx` | Sticky footer (keyboard hints + validation status + inline Back/Next) |
| `ConfigPreview.tsx` | Live syntax-highlighted `school.config.ts` pane |
| `DashboardPreview.tsx` | Extracted from current `StepColors.tsx` |
| `DeployLog.tsx` | Replaces `DeployProgress.tsx` |
| `Kbd.tsx` | `<span class="kbd">…</span>` keyboard-key primitive |

---

## 7. Asset Plan — Regenerated Wizard Screenshots

The homepage's `HowItWorks` section shows four thumbnails. After the wizard redesign, the existing PNGs at `/public/screenshots/wizard/01-school.png` through `04-deploy.png` are stale — they show the old white-on-`bg-white/10` form.

New screenshot set:

| File | Shows |
|---|---|
| `/public/screenshots/wizard/01-school.png` | `StepSchoolInfo` — full two-pane: form on left, growing `school.config.ts` on right |
| `/public/screenshots/wizard/02-colors.png` | `StepColors` — seeds + zone list + `DashboardPreview` below the config |
| `/public/screenshots/wizard/03-schedule.png` | `StepSchedule` — day-type cards + bell table |
| `/public/screenshots/wizard/04-deploy.png` | `StepReview` + live `DeployLog` with some completed and one pending line |

**How they're captured**: run `npm run dev` with realistic seed data in `DEFAULT_FORM_DATA` (Windermere Prep values used in the mockups), take full-width browser screenshots at 1600×1000, crop to 16:10 aspect matching the existing asset dimensions. Replace in place — no path changes, so `HowItWorks` just picks up the new images.

---

## 8. Motion & Accessibility

### 8.1 Motion

- `motion/react` stays. `useReducedMotion()` is called in every animated component.
- **Homepage motion inventory**:
  - `ZineHero`: staggered reveal on load (copy items fade+slide-up 16px, 0.5s ease-out, 0.08s stagger). Polaroids scale-in with very small rotation jitter (`±0.5°`).
  - `Showcase`: margin notes reveal in sequence on scroll.
  - `HowItWorks`: each step row fades in on scroll; the vertical progress track gets `scaleY` tied to scroll progress (currently marker-red, unchanged behavior).
  - `FinalCta`: no ambient pulsing glow (deleted). The button hover animates `translate` + `box-shadow`, not a breathing glow.
- **Wizard motion**:
  - Active progress cell: `slide` keyframe on the hatched overlay (subtle horizontal texture).
  - Connection dot: 2s opacity pulse.
  - Coral caret in `ConfigPreview`: 1s blink.
  - Pending line in `DeployLog`: 0.8s blink.
  - All the above disabled under reduced-motion (static full-opacity).

### 8.2 Accessibility

- Every interactive element has a visible focus state. Coral `outline: 2px solid var(--color-accent); outline-offset: 2px` on focus-visible.
- `ConfigPreview` has `aria-live="polite"` so screen readers announce added fields (not every keystroke — debounced at the React state level, which the existing wizard already does).
- `DeployLog` has `aria-live="polite"` and each log line has `role="status"`.
- The wizard's bottom-bar Back/Next buttons are real `<button>` elements, not links; keyboard-operable.
- Handwritten annotations on the homepage are purely decorative and get `aria-hidden="true"`.
- All screenshots have descriptive `alt` text (same as current).
- Rotated elements (polaroids, taped screenshots, numeral underlines): under `prefers-reduced-motion: reduce`, `transform: none` via a media query — no disorientation.

---

## 9. File-by-File Impact Map

### Added

- `components/landing/ZineNav.tsx`
- `components/landing/ZineHero.tsx`
- `components/landing/Showcase.tsx`
- `components/landing/HowItWorks.tsx`
- `components/landing/Polaroid.tsx`
- `components/landing/TapedScreenshot.tsx`
- `components/landing/Highlight.tsx`
- `components/landing/MarginNote.tsx`
- `components/landing/HandwrittenArrow.tsx`
- `components/landing/PaperNoise.tsx`
- `components/wizard/WizardTopBar.tsx`
- `components/wizard/ProgressStrip.tsx`
- `components/wizard/StatusBar.tsx`
- `components/wizard/ConfigPreview.tsx`
- `components/wizard/DashboardPreview.tsx`
- `components/wizard/DeployLog.tsx`
- `components/wizard/Kbd.tsx`

### Modified

- `app/layout.tsx` — add `Archivo Black`, `Caveat`, `JetBrains Mono` font loading; expose CSS variables.
- `app/globals.css` — add `.theme-zine` token block; retune `:root` terminal tokens.
- `app/page.tsx` — new section order + `theme-zine` class on `<main>`.
- `app/setup/page.tsx` — no structural change; inherits new shell styling automatically.
- `app/edit/page.tsx` — no structural change; migration branch for legacy color shape preserved.
- `app/login/page.tsx` — visual refresh only: swap the generic dark form for a centered terminal-styled card that reuses the wizard's `WizardTopBar` (logo stamp + version) and input/field styling. Same single-email input, same `Send magic link` submit behavior, same `/api/auth/send-link` call. **No auth logic change.**
- `components/WizardShell.tsx` — visual rewrite; state logic unchanged.
- `components/landing/Faq.tsx` — rewrite contents (new markup), same section role.
- `components/landing/FinalCta.tsx` — rewrite contents.
- `components/landing/PullQuote.tsx` — rewrite contents.
- `components/landing/Footer.tsx` — rewrite contents; absorbs `OpenSourceBlock`.
- `components/landing/SignalsRow.tsx` — rewrite contents.
- `components/wizard/StepSchoolInfo.tsx` — visual rewrite; state + validation unchanged.
- `components/wizard/StepColors.tsx` — visual rewrite; extract `DashboardPreview`; state logic unchanged (seeds, overrides Set, darkMode modes, activeZone popover).
- `components/wizard/StepSchedule.tsx` — visual rewrite; state unchanged.
- `components/wizard/StepLunchWaves.tsx` — visual rewrite; state unchanged.
- `components/wizard/StepCalendar.tsx` — visual rewrite; state unchanged.
- `components/wizard/StepFeatures.tsx` — visual rewrite; state unchanged.
- `components/wizard/StepReview.tsx` — visual rewrite; deploy trigger unchanged; replace `<DeployProgress>` with `<DeployLog>`.
- `public/screenshots/wizard/01-school.png` — regenerated.
- `public/screenshots/wizard/02-colors.png` — regenerated.
- `public/screenshots/wizard/03-schedule.png` — regenerated.
- `public/screenshots/wizard/04-deploy.png` — regenerated.

### Deleted

- `components/landing/Hero.tsx` (replaced by `ZineHero`)
- `components/landing/LakerWatchShowcase.tsx` (replaced by `Showcase`)
- `components/landing/WizardPreview.tsx` (replaced by `HowItWorks`)
- `components/landing/OpenSourceBlock.tsx` (merged into `Footer`)
- `components/landing/SectionDivider.tsx` (no longer used — the random red dots)
- `components/landing/Noise.tsx` (replaced by `PaperNoise`)
- `components/landing/Arrow.tsx` (replaced by native `→` + `HandwrittenArrow`)
- `components/landing/Reveal.tsx` (replaced by inline `motion.div` with `whileInView`)
- `components/DeployProgress.tsx` (replaced by `wizard/DeployLog.tsx`)

### Unchanged (explicit — DO NOT TOUCH)

- `app/api/**` — every route
- `lib/auth.ts`
- `lib/colors.ts`
- `lib/config-generator.ts`
- `lib/email.ts`
- `lib/github.ts`
- `lib/prisma.ts`
- `lib/types.ts`
- `lib/validation.ts`
- `lib/vercel.ts`
- `prisma/schema.prisma`
- `components/WizardShell.tsx` — STEPS array, DEFAULT_FORM_DATA, StepErrorBoundary class, validation + error flow (only JSX inside `return` changes)

---

## 10. Acceptance Checklist

Implementation is complete when **all** of these pass:

### Functional (nothing lost)

- [ ] `/setup` renders; all 7 steps navigable forward + backward.
- [ ] `/api/deploy` creates a repo + Vercel project + DB row + magic link email (same as before).
- [ ] Magic link email lands in inbox; clicking it opens `/edit?token=…` and loads the school.
- [ ] `/edit?token=…` rehydrates `WizardFormData` for both current-shape and legacy flat-color schools.
- [ ] `/api/redeploy` pushes updated config + logo + triggers new Vercel deploy.
- [ ] `StepColors` seed change cascades to non-overridden zones; overridden zones stay sticky.
- [ ] `StepColors` dark-mode preview/customize/back-to-light flow works.
- [ ] `StepColors` zone popover opens on click, updates color live, resets to default.
- [ ] Validation errors display on failed Next on every step.
- [ ] `ConfigPreview` output matches the exact string `config-generator.ts` produces for the same `WizardFormData` (byte-for-byte assertion in a test).
- [ ] `npm run lint` clean.
- [ ] `npm run build` clean (no TypeScript errors).

### Visual (design matches mockups)

- [ ] Homepage matches `.superpowers/brainstorm/…/homepage-zine.html` composition (9 sections in order, correct typography and color tokens).
- [ ] Wizard matches `.superpowers/brainstorm/…/wizard-terminal.html` composition (top bar + progress + two panes + status bar).
- [ ] Four wizard screenshots regenerated and visible in `HowItWorks`.
- [ ] No decorative red dots anywhere (old `SectionDivider` fully removed).
- [ ] No `bg-white/10` input styling anywhere in the wizard.

### Accessibility

- [ ] `prefers-reduced-motion: reduce` — all ambient animations (glow pulses, blinks, hatched slide) stop; rotated elements become untilted.
- [ ] Every interactive element has a visible coral focus ring.
- [ ] Keyboard navigation: TAB advances form fields; in `StepReview`, the deploy button is reachable and triggers deploy via Enter.
- [ ] `ConfigPreview` and `DeployLog` use `aria-live="polite"`.

---

## 11. Open Questions

None identified during brainstorming. If one surfaces during plan-writing, flag it inline in the plan document.
