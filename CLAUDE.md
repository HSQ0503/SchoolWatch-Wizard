@AGENTS.md

# SchoolWatch Wizard

A self-serve wizard that provisions a branded bell-schedule / countdown dashboard (a "SchoolWatch") for any school in ~5 minutes. The user fills out a 7-step form; the backend creates a GitHub repo from a template, writes a `school.config.ts` file to it, spins up a Vercel project, triggers deployment, saves the school in MongoDB, and emails the admin a magic link to edit later.

Sister product: **LakerWatch** (`lakerwatch.com`) — the flagship instance for Windermere Preparatory School. New schools produced by this wizard are deployed the same way.

## Tech Stack

- **Next.js 16.2.3** — App Router (see AGENTS.md: APIs differ from older versions; consult `node_modules/next/dist/docs/` before assuming)
- **React 19.2.4**
- **TypeScript 5** — `type` preferred over `interface`
- **Tailwind CSS v4** — via `@tailwindcss/postcss`, imported as `@import "tailwindcss"` in `globals.css`
- **Prisma 6** + **MongoDB** (single `School` model)
- **jose** — JWT for magic links (15 min) and session cookies (7 d)
- **Resend** — transactional email
- **Vercel + GitHub APIs** — programmatic deploy pipeline
- **npm only** — never yarn / pnpm / bun

## Scripts

```
npm run dev     # next dev
npm run build   # prisma generate && next build
npm run lint    # eslint
```

`postinstall` runs `prisma generate`.

## Folder Structure

```
app/                         Next.js App Router
  page.tsx                   Landing (light theme)
  layout.tsx                 Root layout, Inter font
  globals.css                Tailwind v4 + CSS vars for light/dark
  setup/page.tsx             Fresh wizard (unauthenticated)
  edit/page.tsx              Edit existing school, magic-link or session gated
  login/page.tsx             Request magic link
  api/
    auth/{send-link,verify,session}/route.ts
    deploy/route.ts          POST → provision new school (repo + project + deploy + DB + email)
    redeploy/route.ts        POST → update config + push + redeploy for existing school
    schools/[id]/route.ts
    schools/by-email/route.ts
components/
  LandingHero.tsx            Marketing hero (light theme)
  LandingFeatures.tsx        Feature grid (light theme)
  WizardShell.tsx            Orchestrates 7 steps, progress bar, nav, error boundary (dark theme)
  DeployProgress.tsx         Animated step list for deploy/edit flow
  wizard/
    StepSchoolInfo.tsx       Name, mascot, city, academic year, email, logo
    StepColors.tsx           Primary+accent seeds → 8 color zones, live mockup, dark mode toggle
    StepSchedule.tsx         Day types + bell periods (shared, per-wave, after)
    StepLunchWaves.tsx       Enable/disable lunch waves + per-wave bell overrides
    StepCalendar.tsx         No-school dates, early dismissals, events
    StepFeatures.tsx         Toggle events/productivity features
    StepReview.tsx           Summary + Deploy button → calls /api/deploy or /api/redeploy
lib/
  auth.ts                    createMagicLinkToken / verifyMagicLinkToken / session helpers
  colors.ts                  Zone color types; defaultLightColors, deriveDarkColors, resolveDarkColors
  config-generator.ts        Serializes WizardFormData → school.config.ts TypeScript source
  email.ts                   sendMagicLinkEmail via Resend, dark HTML template
  github.ts                  createRepoFromTemplate, waitForRepoReady, pushFile (with 409 retries), pushLogo
  vercel.ts                  createProject, triggerDeployment, getLatestDeployment, getDeploymentStatus
  prisma.ts                  Prisma client singleton
  types.ts                   WizardFormData shape
  validation.ts              Step-scoped validators keyed by step index
prisma/schema.prisma         Single `School` model, MongoDB provider
docs/superpowers/plans/      Implementation plan markdown files
public/                      Default Next.js template SVGs only
```

## How the App Runs

1. **Landing** (`/`) — light-themed marketing page. CTA links to `/setup` or to `lakerwatch.com` as example.
2. **Setup** (`/setup`) — renders `WizardShell` with 7 step components. All state held in a single `WizardFormData` object in the shell, passed down via `StepProps = { data, onChange, schoolId? }`.
3. **Deploy** (`/api/deploy`) — on submit:
   - Generate slug from school name; check uniqueness in Mongo
   - `createRepoFromTemplate` → GitHub template generate API (`HSQ0503/SchoolWatch` by default)
   - `waitForRepoReady` — poll until template files are copied (GitHub is async)
   - `createProject` on Vercel linked to the new repo
   - Push logo to `public/logo.<ext>` if provided (strip base64 `data:` prefix)
   - `generateConfigTs` → push `school.config.ts` to the repo (with 409 retry backoff)
   - `triggerDeployment` — explicit first-deploy call (git webhook race workaround)
   - Save `School` row in MongoDB
   - Create magic-link JWT → `sendMagicLinkEmail`
4. **Edit** (`/edit?token=…`) — verify token or session cookie, load school by email, rehydrate the same `WizardShell` with `initialData` and `schoolId`.
5. **Redeploy** (`/api/redeploy`) — push updated config (+ logo) to same repo, trigger new deployment.

## Data Flow & Key Types

- `WizardFormData` (`lib/types.ts`) is the single source of truth shuttled through the wizard and persisted as `School.configData` (JSON). The `logo` field (base64 data URL) is **stripped** before DB save.
- The generated `school.config.ts` uses a **different type** (`SchoolConfig` from the deployed app's own `./lib/types/config`) — the wizard hand-writes TS source via `config-generator.ts` using an `esc()` helper to quote-escape values. Don't build an AST; match the existing string format.
- `School` (Mongo): `id, name, slug (unique), contactEmail, configData (JSON), logoUrl?, githubRepoName, vercelProjectId, deployedUrl, createdAt, updatedAt`.

## Color System

This is the most distinctive piece. Understand it before touching `StepColors.tsx` or `lib/colors.ts`.

- **Seeds**: `primary`, `accent` (two hex colors).
- **8 zones**: `navbar, navText, background, heading, ring, surface, cardAccent, badge`. Each has a light-mode value; dark-mode overrides are optional/partial.
- `defaultLightColors(primary, accent)` computes a light-mode zone set from the seeds.
- `deriveDarkColors(light)` generates dark values by darkening the heading (`generateDarkBg` at 8%/8%/15%) and lightening the ring 15%.
- `resolveDarkColors(light, overrides)` = derived + user overrides for any zone the user explicitly customized.
- UI lets users override any zone individually; overridden zones are tracked in a `Set` so seed changes don't clobber them.
- Live dashboard mockup in `StepColors` uses **inline styles** (not Tailwind) to render a preview that reflects the resolved palette in real time.

Old schools may have the flat `{ primary, accent }` shape — `edit/page.tsx` migrates these on load (see the `cfg.colors && !cfg.colors.light` branch).

## Styling Conventions

Two distinct visual languages — don't mix them.

### Landing page (`/`)
- Light theme: white background, `text-gray-900`, `text-gray-500` secondary, `border-gray-200`
- Black CTA buttons (`bg-black text-white`) with `rounded-xl`
- Inter font via `next/font/google` (set in `layout.tsx`)
- Generous padding, centered hero, grid of feature cards

### Wizard / app shells (`/setup`, `/edit`, `/login`)
- Dark theme: `bg-black text-white`
- Borders `border-white/10` or `border-white/20`, surfaces `bg-white/5` or `bg-white/10`
- Primary buttons invert: `bg-white text-black`
- Inputs: `rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors duration-150`
- Labels: `block text-sm font-medium text-gray-300 mb-1.5`
- Error state: `border-red-500/30 bg-red-500/10`, `text-red-400` (heading), `text-red-300` (body)
- Success state: `border-green-500/30 bg-green-500/10`, `text-green-400`, `text-green-300/70`
- Sticky top progress bar + sticky bottom navigation, both `bg-black border-white/10`
- Transition default: `transition-colors duration-150`
- Geometry: `rounded-lg` for small chrome, `rounded-xl` for cards/larger surfaces, `rounded-full` for status pills
- Step headings: `text-xl font-semibold text-white`, subcopy `text-sm text-gray-400`
- `SectionLabel` (review step): `text-xs font-semibold uppercase tracking-wider text-gray-500`

### Motion / micro-interactions
- `DeployProgress` uses a pulsing dot (`animate-ping` + solid inner circle) for the current step, green check for done, hollow circle for pending
- Progress bar: `h-1 bg-white rounded-full transition-all duration-300 ease-out`
- No heavy animation library — CSS-only

### Email template
- Dark themed (`#0f172a` bg, `#1e293b` card, `#3b82f6` CTA button), preheader text, MSO conditional comments for Outlook, `escHtml` helper to prevent injection. See `lib/email.ts`.

## Patterns & Conventions

- **Path alias**: `@/…` → repo root (see `tsconfig.json`).
- **Client components**: `"use client"` at top. Landing / layout are server components.
- **Step contract**: every wizard step receives `{ data, onChange, schoolId? }` and mutates state via `onChange(nextData)`. Never mutate `data` in place.
- **Validation**: `validateStep(stepIndex, data) → string[]`. Shell shows errors on attempted Next. Steps are never blocked from rendering; they just can't advance.
- **Error boundary**: `WizardShell` wraps each step in a class-based `StepErrorBoundary` so one broken step doesn't crash the whole wizard.
- **Config generation**: string templates in `config-generator.ts` — indentation matters for the output file; preserve two-space blocks. All user values go through `esc()` to escape `"` and `\`.
- **GitHub push**: new template repos 409 on write for a few seconds; `pushFile` retries with 3s × attempt backoff up to 5 times.
- **Vercel deploy**: always call `triggerDeployment` after first push — webhook isn't reliably registered on brand-new projects.
- **Resend idempotency**: `X-Entity-Ref-ID` = `magic-link-${email}-${minuteBucket}` to dedupe retries within the same minute.
- **Logo handling**: user uploads as base64 data URL → stored on the wizard form → extracted, decoded to `Buffer`, pushed to the deployed repo's `public/`. Never persist the base64 in Mongo.
- **Auth**: single `MAGIC_LINK_SECRET` signs both 15-minute magic-link JWTs and 7-day session JWTs. `isSuperAdmin(email)` checks against `SUPER_ADMIN_EMAIL`.
- **Slugs**: `generateSlug` is lowercase + non-alphanumeric → `-`, trimmed. Used for both Mongo uniqueness and `schoolwatch-<slug>` repo names.

## Environment Variables

Required at runtime (not committed):

```
DATABASE_URL                  MongoDB connection string
GITHUB_TOKEN                  PAT with repo scope on GITHUB_ORG
GITHUB_ORG                    Org that owns generated repos
GITHUB_TEMPLATE_OWNER         Owner of the SchoolWatch template (default HSQ0503)
VERCEL_TOKEN
VERCEL_TEAM_ID                Optional (for team-scoped projects)
MAGIC_LINK_SECRET             HS256 secret for jose
NEXT_PUBLIC_APP_URL           Origin used in magic-link URLs
RESEND_API_KEY
SUPER_ADMIN_EMAIL
```

## Debugging Notes

- `WizardShell` logs step transitions and the full form-data snapshot to the console on every step change — invaluable when a step crashes.
- `DeployProgress` state machine: `idle → creating-repo → pushing-config → creating-project → deploying → done | error`. Edit mode skips the first two.
- If a deploy creates the repo/project but the DB write fails, you'll have orphaned resources in GitHub/Vercel — no cleanup logic exists yet.

## Things Not to Do

- Don't refactor the string-based config generator into an AST builder — the deployed template expects this exact source shape.
- Don't collapse the two color representations (flat `{primary,accent}` vs zone-based) — the edit page migrates legacy schools on load and removing that branch would break them.
- Don't persist `data.logo` to Mongo — strip it before `prisma.school.create`.
- Don't skip `waitForRepoReady` — template files are copied asynchronously and subsequent writes 404 without it.
- Don't assume the Vercel git webhook will fire on the first push — always call `triggerDeployment` explicitly for new projects.
