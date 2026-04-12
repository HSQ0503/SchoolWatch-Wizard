# Homepage Redesign — Design Spec

**Date:** 2026-04-12
**Scope:** Replace the current `/` landing experience (`app/page.tsx`, `components/LandingHero.tsx`, `components/LandingFeatures.tsx`) with an identity-driven homepage designed to convert the target persona.

## Goal

Turn the homepage into a page that (a) looks and feels distinctive — not generic SaaS — and (b) actually gets the target persona to click "Start Yours" and complete the wizard.

## Target Persona

**Student leaders looking for a low-effort, resume-worthy win.** The visitor is a student who wants to:

- Do something that improves their school
- Take credit for a real thing they built
- Avoid anything that requires asking for permission, money, or coding skills

They are **not** buying software. They are buying social/status reward. The homepage must acknowledge that motivation without naming it cringe-ly.

## Funnel Model

1. Student visits `/`
2. Hero makes them feel the opportunity (identity-driven copy + single live example)
3. Proof section shows LakerWatch — a real dashboard at a real school — as aspirational evidence
4. Wizard preview kills the "is this really 5 minutes?" objection
5. A single pull quote reframes the emotional stakes
6. FAQ clears remaining objections (cost, approval, schedule quirks, editing)
7. Final CTA closes

No admin, principal, or procurement audience is targeted. The page does not need a "pitch your principal" section because the student can deploy first and share organically.

## Constraints

- Free to use; custom domain is the only optional cost (not surfaced prominently)
- Only one live example exists (LakerWatch / Windermere Prep). Design must lean on it heavily and credibly.
- Single maintainer — scope stays tight; no CMS, no blog, no testimonial pipeline
- Builds must pass `npm run build` (`prisma generate && next build`)
- Next.js 16 App Router — check `node_modules/next/dist/docs/` before using unfamiliar APIs

## Aesthetic Direction

Reference: **Raycast** (`raycast.com`). Dark, refined, crimson accent, product-forward, restrained motion.

### Palette

| Role | Value |
|---|---|
| Background | `#0a0a0a` (deep near-black, not pure) |
| Surface (cards) | `rgba(255,255,255,0.03)` |
| Border hairline | `rgba(255,255,255,0.08)` |
| Heading text | `#ffffff` |
| Body text | `#a1a1aa` (warm gray) |
| Eyebrow / label | `#e4e4e7` |
| Accent (crimson-coral) | `#FF6363` |

Crimson is used sparingly: primary CTA, one or two emphasis words in the hero headline, step numbers in the wizard preview, small decorative strokes/dots.

### Typography

- Single family: **Geist Sans** (already in the stack)
- Hero headline: weight 700–800, tight tracking (`-0.03em` to `-0.04em`), 60–80px desktop / 40–48px mobile
- Section headings: weight 700, 32–44px
- Body: weight 400, 15–16px, line-height 1.6, warm gray
- Eyebrows / labels / micro-trust pills: **Geist Mono**, uppercase or tracked-out, small
- One italic weight accent permitted on a single emphasis word (e.g. *yours* in the hero) — reserved for that moment only

### Motion

- Scroll-reveal fade-up on sections via Motion (React): `opacity 0→1`, `y 24px→0`, `duration 600ms`, `ease-out`, 40ms stagger across children. No heavier animation.
- Hero screenshot: slow parallax drift (±6px translate on scroll)
- CTAs: subtle background-color and scale transitions on hover (`scale: 1.02`, `duration: 150ms`)
- No cursor trails, no auto-playing videos, no marquees

### Decorative details

- Subtle SVG noise/grain overlay at ~4% opacity on the full body
- Soft radial gradient glow behind the hero headline (crimson at ~8% opacity, large blur)
- Hairline section dividers with a single crimson dot centered in the line
- Hero screenshot framed in a muted macOS-style window chrome with a soft drop-shadow

### Out (explicit avoids)

Purple→blue gradients, Inter, rounded blob illustrations, stock photos, emoji in copy, "trusted by 1000+" lies, pricing tables, comparison matrices, feature grids with 12 icons.

## Page Structure

Seven sections, scrollable in under a minute on desktop. Each section has a single job.

### 1. Hero

**Job:** Hook the persona emotionally. Tell them in one headline what they could be.

- **Headline** (2 lines, large, tight): *"Build the schedule app your school never made."* (Final copy to be finalized during implementation; candidates in Copy Appendix.)
- **Subhead** (1 line): "Pick your colors, add your bell schedule, deploy to a real URL. 5 minutes, no code, free."
- **Primary CTA**: `Start Yours →` — crimson button, white text
- **Secondary**: `See LakerWatch →` — plain text link with arrow (links to `https://lakerwatch.com`, opens new tab)
- **Micro-trust row**: three mono-font pill badges in a row: `Free` · `5 minutes` · `No code`
- **Visual anchor** (right column on desktop, stacked below on mobile): tilted LakerWatch dashboard screenshot in a macOS window frame, soft drop-shadow, with a smaller secondary window in different school colors peeking behind it to imply "yours could be next"
- Radial crimson glow behind the headline

### 2. "This is live right now" — LakerWatch showcase

**Job:** Convert the one live example into maximum proof. Double as feature showcase.

- Full-bleed section, dark, generous vertical padding
- Section eyebrow (Geist Mono): `LIVE AT WINDERMERE PREP`
- Section heading: *"A real student-built dashboard. Running right now."*
- Large, high-fidelity screenshot of the LakerWatch dashboard (captured at 2x resolution; store in `public/screenshots/`)
- 4–5 annotated callouts with crimson connector lines + small label cards:
  - Live countdown ring — *"Checked by every kid between classes."*
  - "It's Friday / 3rd Period" greeting — *"Knows what day it is. Knows what period you're in."*
  - Next-event card — *"Spirit day, homecoming, early dismissal — all of it."*
  - Calendar tab — *"Your actual school calendar, not a generic one."*
  - School colors / logo — *"Your school's colors everywhere."*
- Below the screenshot: a single URL link `lakerwatch.com` in mono font with `→` icon

This section kills the need for a separate feature grid; the features ARE the annotations.

### 3. "It really does take 5 minutes" — wizard preview

**Job:** Kill the "too good to be true" objection by showing the actual product.

- Section eyebrow: `HOW IT WORKS`
- Section heading: *"Four screens. No code. No catch."*
- 4 numbered cards in a row (stack on mobile), each with:
  - Large crimson numeral (`01`, `02`, `03`, `04`) in Geist Mono
  - Small screenshot of that wizard step (store in `public/screenshots/wizard/`)
  - One-line title
  - One-line description
- Steps:
  1. **Name your school.** Tell us your mascot, colors, and academic year.
  2. **Pick your palette.** Two colors, eight zones, dark mode included.
  3. **Add your schedule.** Simple, block, or rotating. Lunch waves handled.
  4. **Deploy.** We send you a live URL. Share it with your friends.

### 4. Pull quote / identity moment

**Job:** The emotional closer. One line, enormous breathing room.

- Full-width, centered, no card / no button
- Headline-sized type, weight 700, tight tracking
- Copy (candidate — finalize during implementation): *"Every school has one or two kids who build things. This is how you become one of them."*
- Alt candidates in Copy Appendix
- Vertical padding: very generous (160–200px top and bottom)
- A single hairline crimson stroke above and below, short (60px wide), centered

### 5. FAQ / objection killer

**Job:** Address every hidden concern before the final CTA.

- Section eyebrow: `QUESTIONS YOU'RE ABOUT TO ASK`
- 5 items, accordion or always-open (prefer always-open for simplicity — no state management needed)
- Hairline dividers between items
- Questions:
  1. **Is this actually free?** Yes. Hosting is free on Vercel. The only paid thing is if you want a custom domain like `yourschool.com` — that's optional and you buy it yourself.
  2. **Do I need my principal's approval?** No. You get a real URL like `yourschool.vercel.app`, send it to your friends, and it spreads on its own. You can show your principal later if you want.
  3. **My school has weird lunch waves / rotating days / block schedules. Will it work?** Yes. The wizard handles all three, plus after-school periods and day-type overrides.
  4. **Can I change things later?** Yes. You'll get an email link that lets you edit anything — add events, change colors, update the schedule.
  5. **What if someone at my school already tried this?** They probably used a worse option. You can still build yours and share it — whichever one gets used wins.

### 6. Final CTA

**Job:** Close. One button, nothing else.

- Full-height-ish section (60–70vh)
- Centered column, narrow
- Headline callback (candidate): *"You're still reading. Go build it."*
- Single `Start Yours →` crimson button, slightly larger than the hero CTA
- Below the button, one line in warm gray: "Takes about 5 minutes. No signup before you start."

### 7. Footer

**Job:** Minimal attribution. Nothing more.

- Single hairline border-top
- Left: "SchoolWatch — made by Han at Windermere Prep."
- Right: `GitHub` link · `See LakerWatch` link
- Small mono font, warm gray
- No social icons, no newsletter signup, no legal links (add later if we collect emails — we don't on the landing page)

## Technical Approach

### Files changed

- `app/page.tsx` — now composes the new sections
- `app/globals.css` — add CSS vars for the new palette (background, crimson, warm gray, grain), keep Tailwind v4 theme block
- `app/layout.tsx` — replace Inter with **Geist Sans + Geist Mono** via `next/font/google`. The font class is applied on `<body>`, so the wizard inherits the new family automatically. The wizard's internal typography (`text-white`, `font-semibold`, etc.) is style-neutral and will read correctly in Geist — no wizard regressions expected. Font CSS variables (`--font-geist-sans`, `--font-geist-mono`) are exposed via the `next/font` variable API and wired into the Tailwind `@theme` block.

### Files deleted

- `components/LandingHero.tsx` (replaced)
- `components/LandingFeatures.tsx` (replaced — its role is absorbed into the LakerWatch annotated showcase)

### Files added

- `components/landing/Hero.tsx`
- `components/landing/LakerWatchShowcase.tsx`
- `components/landing/WizardPreview.tsx`
- `components/landing/PullQuote.tsx`
- `components/landing/Faq.tsx`
- `components/landing/FinalCta.tsx`
- `components/landing/Footer.tsx`
- `components/landing/Noise.tsx` — a small component that renders the body-wide SVG grain overlay
- `public/screenshots/lakerwatch-dashboard.png` — hero screenshot (2x, ~1200×800 source)
- `public/screenshots/wizard/01-school.png`, `02-colors.png`, `03-schedule.png`, `04-deploy.png`

Screenshots will be captured manually from the running LakerWatch site and the local wizard; this is an implementation task, not a design decision.

### Dependencies

- Add `motion` (the React animation library, successor to framer-motion). One new dependency.
- No other additions. Tailwind v4 handles the utility classes; Geist fonts are free via `next/font/google`.

### Tailwind configuration

Tailwind v4 reads theme via `@theme` in `globals.css`. Add:

```css
@theme inline {
  --color-background: #0a0a0a;
  --color-surface: rgba(255, 255, 255, 0.03);
  --color-border: rgba(255, 255, 255, 0.08);
  --color-heading: #ffffff;
  --color-body: #a1a1aa;
  --color-label: #e4e4e7;
  --color-accent: #FF6363;
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

Existing wizard colors stay untouched (wizard uses inline Tailwind classes like `bg-black`, `text-white`; those still resolve correctly).

### Responsive behavior

- Breakpoints: mobile-first. Design-critical breakpoint is `md` (768px).
- Hero: two columns on `md+`, stacked on mobile (headline + CTAs above, screenshot below, screenshot scales to 100% width)
- LakerWatch showcase: screenshot scales to 90% width on mobile; callouts collapse into a vertical list below the screenshot on `<md`
- Wizard preview: 4 cards in a row on `md+`, stacked vertically on mobile
- Final CTA: center-column always, button full-width on mobile

### Accessibility

- All interactive elements keyboard-focusable with visible focus rings (crimson, 2px, offset 2px)
- Screenshots have `alt` text describing what's shown
- Headings use a proper `<h1> → <h2> → <h3>` hierarchy
- Color contrast: white on `#0a0a0a` is 20.9:1 ✓; crimson `#FF6363` on `#0a0a0a` is 6.3:1 ✓ (both pass WCAG AA); warm gray `#a1a1aa` on `#0a0a0a` is 7.2:1 ✓
- Motion is reduced when `prefers-reduced-motion: reduce` (Motion library supports this natively; wrap animated sections with the respect-reduced-motion pattern)

### Performance

- All screenshots: optimize as AVIF + WebP fallback via `next/image`
- Noise overlay: single small SVG data URL, no network request
- No third-party scripts, no analytics on launch (add later if needed)

## Out of Scope

Items deliberately NOT included in this redesign:

- Pricing page / pricing table (no paid tier exists yet)
- Testimonials beyond the single implicit LakerWatch example
- Blog / changelog / docs
- Newsletter capture / email gate
- Comparison table against other tools
- "For administrators" section (persona is students only)
- Multilingual support
- A/B testing infrastructure
- Analytics beyond what Vercel provides by default

## Success Criteria

Subjective (this launch, no analytics yet):

- The page feels distinct from generic Next.js SaaS landing pages
- The hero communicates "this is for you, and you could do it this weekend" within 3 seconds of landing
- Someone who hits the page can find the live LakerWatch example without scrolling more than once
- The "too good to be true" objection is addressed before the bottom of the page
- A principal or teacher who stumbles on the page would not call it unprofessional

Objective (post-launch, once we add basic analytics):

- `/setup` page visits as a percentage of `/` visits increase versus the current page
- `/setup` → `/api/deploy` completion rate holds or improves (signals the page isn't attracting wrong-fit visitors)

## Copy Appendix

Headline candidates (pick during implementation or ask Han):

- *"Build the schedule app your school never made."* ← current lead
- *"Your school doesn't have a schedule app. You could just make one."*
- *"One weekend. One real app. Every kid at your school using it."*
- *"The schedule app at your school, made by you."*

Pull-quote candidates:

- *"Every school has one or two kids who build things. This is how you become one of them."* ← current lead
- *"You don't need permission. You don't need adults. You just need a weekend."*
- *"The difference between students who built something and students who didn't is usually one weekend."*

Final-CTA headline candidates:

- *"You're still reading. Go build it."* ← current lead
- *"Stop reading. Start building."*
- *"Five minutes from here."*

Final headline/copy choices are an implementation decision; any of the above is acceptable per the design.
