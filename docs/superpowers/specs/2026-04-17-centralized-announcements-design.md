# Centralized Announcements for Wizard-Provisioned Schools

**Status:** Design approved, pending implementation plan
**Date:** 2026-04-17
**Author:** Han (via brainstorming session)

## Problem

LakerWatch ships with an admin panel at `/admin` that lets whitelisted emails post announcements rendered on the homepage. Schools provisioned through the schoolwatch-wizard currently have no equivalent — the template (`C:/Dev/SchoolWatch`) is a pure static site driven by `school.config.ts`, and adding per-school admin panels would require every deployed school to carry its own DB, JWT secret, email provider, and whitelist.

We want announcement-posting parity with LakerWatch for every wizard-provisioned school, without forcing each school to run its own backend.

## Goals

- Any school provisioned via the wizard can post announcements that appear on its homepage, identical in shape and placement to LakerWatch's feed.
- Zero new infrastructure per school: no new DB, no new env vars, no new secrets on the deployed side.
- Reuse the wizard's existing magic-link auth flow — no new login UX to learn.
- Backward-compatible with existing deployed schools; they opt in by redeploying once.

## Non-goals (v1)

- Multi-admin per school (single `contactEmail` owner only).
- Editable events, PrepTalks, or lunch menu through this surface — school setup edits continue to go through the existing 7-step wizard via magic link.
- Rich text, markdown, or media in announcement bodies.
- Scheduled publishing, audit logs, push notifications, or email blasts.
- Per-school palette theming of announcement cards — fixed semantic colors instead.
- A "no-wizard" fallback where deployed schools self-host announcements.
- Test scaffolding — neither repo has a test runner today; adding one is a separate project.

## Architecture

Three places, one new moving part.

```
┌──────────────────────┐              ┌─────────────────────────┐
│  Wizard (control)    │              │ Deployed SchoolWatch    │
│  schoolwatch-wizard  │              │ e.g. xyz-prep.vercel    │
│                      │              │                         │
│ • /manage/<slug>     │              │ • Homepage component    │
│   - Announcements    │◀──admin──┐   │   polls public API      │
│     tab (default)    │   writes │   │   every 5s              │
│   - Edit Setup tab   │          │   │                         │
│                      │          │   │ • Reads announcements   │
│ • Mongo              │          │   │   from wizard, renders  │
│   - School           │          │   │   AnnouncementsFeed     │
│   - Announcement NEW │          │   │                         │
│                      │          │   │ • No DB, no auth, no    │
│ • /api/public/       │──reads──▶│   │   env vars              │
│   announcements/     │          │   │                         │
│   <slug>             │──────────┼───▶                         │
│   (CORS, cached 5s)  │          │   │                         │
└──────────────────────┘          │   └─────────────────────────┘
         ▲                        │
         │                        │
         │  magic link email      │
         │  (existing flow)       │
    ┌────┴──────┐                 │
    │  Admin    │─────────────────┘
    │ (school   │
    │  owner)   │
    └───────────┘
```

**The wizard becomes the announcements control plane for every school it provisions.** This piggybacks on infrastructure the wizard already owns (Mongo, magic-link auth, Resend, GitHub/Vercel tokens) and keeps deployed schools as dumb static sites with one extra fetch on the homepage.

### Why centralized over per-school

Per-school admin panels would require provisioning a DB, JWT secret, OTP mailer, and whitelist config for every new school the wizard creates. The wizard already has all of those — reusing them is strictly lighter. The tradeoff is a soft runtime dependency: if the wizard is down, announcements fail silently on every school (empty list → homepage falls back to clock-only layout). Schedules, countdowns, and every other feature remain fully functional.

## Data model

One new Prisma model on the wizard, sibling to `School`:

```prisma
model Announcement {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  schoolId   String   @db.ObjectId
  school     School   @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  title      String
  body       String
  type       String   // "info" | "warning" | "urgent"
  pinned     Boolean  @default(false)
  active     Boolean  @default(true)
  expiresAt  String?  // "YYYY-MM-DD" or null
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([schoolId, active])
}
```

`School` gains a back-relation: `announcements Announcement[]`.

Field names, types, and the `expiresAt` string-date format are identical to LakerWatch's `Announcement` (`C:/Dev/Lakerwatch/prisma/schema.prisma:31-41`) so the admin UI can be lifted with near-zero changes. `schoolId` is the new piece that scopes each record to a tenant.

## API contracts

### Admin API (authenticated — existing session cookie)

| Method | Route | Purpose |
|---|---|---|
| `GET` | `/api/announcements?schoolId=...` | List all (active + inactive) for this school, `pinned desc, createdAt desc` |
| `POST` | `/api/announcements` | Create. Body: `{ schoolId, title, body, type, pinned?, expiresAt? }`. Enforces 4-active cap. |
| `PUT` | `/api/announcements/:id` | Partial update. Ownership-checked. |
| `DELETE` | `/api/announcements/:id` | Ownership-checked. |

**Ownership check:** a helper `verifyAnnouncementAccess(request, announcementId)` loads the announcement, loads its school, and asserts `school.contactEmail === session.email`. Called at the top of every mutation route. For list/create, the check is `school.contactEmail === session.email` directly.

**4-active cap:** on `POST`, the handler counts active non-expired announcements for the given `schoolId` and returns `400 Maximum of 4 active announcements allowed` if the count is already 4. Mirrors LakerWatch's behavior (`C:/Dev/Lakerwatch/app/api/announcements/route.ts:44-53`).

### Public API (unauthenticated, CORS-open)

```
GET /api/public/announcements/:slug
```

- Looks up the school by `slug`. Returns active + non-expired announcements, `pinned desc, createdAt desc`.
- Returns `[]` for unknown slugs (no 404, to avoid slug enumeration leaks).
- Response headers:
  ```
  Cache-Control: public, s-maxage=5, stale-while-revalidate=30
  Access-Control-Allow-Origin: *
  ```
- Vercel edge caches automatically from these headers — regardless of concurrent client count, Mongo sees at most one read per slug per 5 s window.

Response shape (stable contract — deployed template reads this):

```ts
type PublicAnnouncement = {
  id: string;
  title: string;
  body: string;
  type: "info" | "warning" | "urgent";
  pinned: boolean;
  createdAt: string; // ISO
};
```

`active`, `expiresAt`, `schoolId`, and `updatedAt` are stripped from the public payload — those are admin-only concerns.

### Type sharing

- `lib/announcements.ts` on the wizard: canonical `Announcement`, `AnnouncementType`, `MAX_ACTIVE = 4`, `VALID_TYPES` constants.
- The deployed template keeps its own tiny `PublicAnnouncement` type in `lib/types/announcements.ts`.
- We do **not** share code between the two repos. The shape is stable enough that duplication is cleaner than a shared package.

## Admin UI (wizard side)

### New route: `/manage/[slug]`

Post-login landing page for school owners. Two tabs:

1. **Announcements** (default) — the frequent task
2. **Edit Setup** — existing 7-step `WizardShell`, loaded with `initialData` + `schoolId`

Magic link lands on `/manage/:slug?tab=announcements`. The existing `/edit?token=...` URL stays functional and redirects to `/manage/:slug` after token verification.

### Component tree

```
app/manage/[slug]/page.tsx        Auth gate + layout (server component)
app/manage/[slug]/client.tsx      Client shell with tab state, header, logout
  ├─ AnnouncementsAdminPanel      NEW — port of LakerWatch's AdminAnnouncementsPanel
  │   └─ AnnouncementForm         NEW — port of LakerWatch's AdminAnnouncementForm
  └─ WizardShell                  EXISTING — unchanged
```

### Theming

LakerWatch's panel uses their red/beige palette (`bg-red`, `text-red-light`, `border-red/15`). The wizard uses dark theme (`bg-black text-white`, `border-white/10`, primary buttons invert to `bg-white text-black`, per CLAUDE.md "Styling Conventions"). Port the component structure verbatim; swap Tailwind classes to match the wizard's dark theme. No logic changes.

### Auth

- Existing 7-day session cookie signed by `MAGIC_LINK_SECRET` (jose).
- Page-level check: `session.email === school.contactEmail`. Mismatch → 403.
- No new auth code, no new env vars.
- v1 is single-owner-per-school; multi-admin is a trivial future add (`adminEmails String[]` on `School`).

### Interactions

- **Add:** button opens inline form (title, body, type pill-picker, pinned toggle, optional `expiresAt` date). Submit → `POST /api/announcements` → refetch list. Button disabled when active count ≥ 4.
- **Edit:** inline form replaces row. Save → `PUT /api/announcements/:id` → refetch.
- **Toggle active:** eye-icon button → `PUT` with `{ active: !current }`. Gated by 4-active cap when activating.
- **Delete:** two-click confirm (first click reveals Confirm/Cancel buttons) → `DELETE /api/announcements/:id` → refetch.

All patterns lifted 1:1 from `C:/Dev/Lakerwatch/components/AdminAnnouncementsPanel.tsx`.

### Navigation touch-ups

- `/login` form unchanged; magic-link email text updated to "manage your school" instead of "edit your school" (`lib/email.ts`).
- `/edit?token=...` route kept for backward compat — handler runs existing magic-link verify, then `redirect('/manage/<slug>')`.
- Landing page CTAs unchanged.

## Deployed template changes (`C:/Dev/SchoolWatch`)

Three small additions. All backward-compatible — schools without an `announcements` config block keep working identically.

### 1. Config type extension (`lib/types/config.ts`)

```ts
type SchoolConfig = {
  school: { ... },
  location: { ... },
  colors: { ... },
  schedule: { ... },
  features: { ... },
  announcements?: {           // NEW, optional
    enabled: boolean;
    apiUrl: string;           // e.g. "https://schoolwatch-wizard.com"
    slug: string;             // e.g. "xyz-prep"
  };
};
```

### 2. New component + hook

- `components/AnnouncementsFeed.tsx` — port of `C:/Dev/Lakerwatch/components/AnnouncementsFeed.tsx`. Type-color classes swapped to fixed semantic colors (see below).
- `hooks/useAnnouncements.ts` — NEW:
  ```ts
  function useAnnouncements(config?: SchoolConfig['announcements']): PublicAnnouncement[]
  ```
  Polls every 5 s. JSON-diff against the previous response before calling `setState` to suppress unnecessary re-renders (same pattern as `C:/Dev/Lakerwatch/app/page.tsx:22-32`). Returns `[]` when config is absent, disabled, or fetches fail. Silent on errors.

### 3. Homepage integration (`app/page.tsx`)

Reuse the exact two-column-vs-one-column pattern already shipping at `C:/Dev/Lakerwatch/app/page.tsx:57-82`: when `announcements.length > 0`, split into clock-left / feed-right; otherwise single-column clock.

### 4. Fixed semantic colors (not palette-driven)

Same scheme across every deployed school. Works in both light and dark mode regardless of the school's palette.

| Type | Light mode | Dark mode |
|---|---|---|
| `info` | `bg-gray-50 border-gray-200` | `bg-white/5 border-white/10` |
| `warning` | `bg-amber-50 border-amber-200` | `bg-amber-500/10 border-amber-500/30` |
| `urgent` | `bg-red-50 border-red-200` | `bg-red-500/10 border-red-500/30` |

### 5. Wizard-side config generator (`lib/config-generator.ts`)

Always emit an `announcements` block for new deploys:

```ts
announcements: {
  enabled: true,
  apiUrl: "${process.env.NEXT_PUBLIC_APP_URL}",
  slug: "${school.slug}",
},
```

One extra section in the string-templated output; matches the existing `esc()` + indentation pattern. No AST, no structural changes to the generator.

### Template change size

~100 lines total: ~60 for component port + re-skin, ~30 for hook, ~10 for page integration, ~5 for the config type.

## Error handling & fallback behavior

| Situation | Behavior |
|---|---|
| Wizard API is down | Hook returns `[]` → homepage renders clock-only layout. Silent. |
| Slug not found | API returns `[]` → clock-only layout. |
| Network flaky | Ref-compare guard preserves last-successful state; no flicker. |
| `announcements` block missing from config | Hook returns `[]` immediately, no network request. Old schools unaffected. |
| Admin deletes all announcements | Next 5 s poll → `[]` → homepage smoothly reverts to clock-only layout. |
| Admin exceeds 4-active cap | Add button disabled client-side (`MAX_ACTIVE = 4`) and `POST` returns 400 server-side. |

## Security

| Concern | Mitigation |
|---|---|
| Slug enumeration via public API | Unknown slugs return `[]` — indistinguishable from an empty school. |
| Spam on public API | Vercel edge cache (5 s) absorbs traffic; origin sees ~1 req / 5 s per school regardless of client volume. |
| Cross-school writes | Every mutation route loads the target school and asserts `session.email === school.contactEmail`. |
| XSS via announcement body | Rendered as plain text, not `dangerouslySetInnerHTML` (same pattern as `C:/Dev/Lakerwatch/components/AnnouncementsFeed.tsx:58`). |
| CORS scope | `Access-Control-Allow-Origin: *` on the public read-only route only; admin routes stay same-origin with no CORS headers. |
| Session hijacking | Same risk surface as today's wizard. Cookies are httpOnly + sameSite=lax. No new exposure. |

## Rollout

One PR per repo, merged in sequence:

1. **Template repo (`C:/Dev/SchoolWatch`) first** — add optional `announcements` config block, `AnnouncementsFeed`, polling hook. Ship it. Existing schools that later redeploy from `master` gain the capability silently (missing config block → no feed, nothing visible changes).
2. **Wizard (`C:/Dev/schoolwatch-wizard`) second** — add Prisma model, migrations, API routes, `/manage/[slug]` page, config-generator update. New schools provisioned after this point immediately get the feature.
3. **Backfill for existing schools** — one-time manual step: for each school currently in Mongo, trigger `/api/redeploy` so their repo gets the new `announcements` block in `school.config.ts`. Can be a short admin-only script.

## Dependencies

None new. No new npm packages in either repo. Reuses: Prisma, MongoDB, jose, Resend, Tailwind, existing CSS.

## Open questions

None at spec time. Implementation plan will enumerate concrete file touches.
