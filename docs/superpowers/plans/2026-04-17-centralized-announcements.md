# Centralized Announcements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add LakerWatch-style announcement posting to every wizard-provisioned school by centralizing the admin UI and data on the wizard, with deployed schools polling a public read-only API.

**Architecture:** One new Mongo collection + one admin tab + one public API route on the wizard. Deployed template gains an optional `announcements` config block, a polling hook, and a feed component. No new infrastructure, no new env vars, no per-school backends.

**Tech Stack:** Next.js 16 App Router, React 19, Prisma 6 + MongoDB, jose (JWT), Resend, Tailwind v4, TypeScript 5.

**Spec:** `docs/superpowers/specs/2026-04-17-centralized-announcements-design.md`

---

## Verification model (no TDD)

Neither `C:/Dev/SchoolWatch` nor `C:/Dev/schoolwatch-wizard` has a test runner today, and the spec explicitly puts test scaffolding out of scope. Every task uses these verification steps instead of unit tests:

- **`npm run build`** — TypeScript check. In the wizard, this also runs `prisma generate` via `postinstall`/the script. Expected: exits 0 with no TS errors.
- **`npm run lint`** — ESLint. Expected: exits 0 with no errors.
- **`curl`** against local dev server — for API routes.
- **Browser smoke test** at `http://localhost:3000` — for UI changes.

If a build or lint command fails, the task is not complete. Fix inline before committing.

---

## Phase A — Template repo (`C:/Dev/SchoolWatch`)

Ships first. Existing schools that redeploy from `master` silently gain the capability; they show no feed until their wizard-generated config includes the new block.

### Task A1: Extend `SchoolConfig` + add `PublicAnnouncement` type

**Files:**
- Create: `C:/Dev/SchoolWatch/lib/types/announcements.ts`
- Modify: `C:/Dev/SchoolWatch/lib/types/config.ts`

- [ ] **Step 1: Create the public announcement type**

Create `C:/Dev/SchoolWatch/lib/types/announcements.ts`:

```ts
export type AnnouncementType = "info" | "warning" | "urgent";

export type PublicAnnouncement = {
  id: string;
  title: string;
  body: string;
  type: AnnouncementType;
  pinned: boolean;
  createdAt: string; // ISO
};
```

- [ ] **Step 2: Extend `SchoolConfig` with the optional `announcements` block**

Edit `C:/Dev/SchoolWatch/lib/types/config.ts`. Add this property to the `SchoolConfig` type (insert after `features`, before the closing brace on line 106):

```ts
  announcements?: {
    enabled: boolean;
    apiUrl: string; // e.g. "https://schoolwatch-wizard.com"
    slug: string;   // e.g. "xyz-prep"
  };
```

- [ ] **Step 3: Verify build**

Run: `cd C:/Dev/SchoolWatch && npm run build`
Expected: exits 0, no TS errors.

- [ ] **Step 4: Verify lint**

Run: `cd C:/Dev/SchoolWatch && npm run lint`
Expected: exits 0, no errors.

- [ ] **Step 5: Commit**

```bash
cd C:/Dev/SchoolWatch
git add lib/types/announcements.ts lib/types/config.ts
git commit -m "feat: add optional announcements config + PublicAnnouncement type"
```

---

### Task A2: Add `useAnnouncements` polling hook

**Files:**
- Create: `C:/Dev/SchoolWatch/hooks/useAnnouncements.ts`

- [ ] **Step 1: Create the hook**

Create `C:/Dev/SchoolWatch/hooks/useAnnouncements.ts`:

```ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicAnnouncement } from "@/lib/types/announcements";
import type { SchoolConfig } from "@/lib/types/config";

const POLL_INTERVAL_MS = 5000;

export function useAnnouncements(
  config: SchoolConfig["announcements"]
): PublicAnnouncement[] {
  const [announcements, setAnnouncements] = useState<PublicAnnouncement[]>([]);
  const lastJson = useRef("");

  const poll = useCallback(() => {
    if (!config?.enabled) return;

    const url = `${config.apiUrl.replace(/\/$/, "")}/api/public/announcements/${config.slug}`;

    fetch(url)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: PublicAnnouncement[]) => {
        if (!Array.isArray(data)) return;
        const json = JSON.stringify(data);
        if (json !== lastJson.current) {
          lastJson.current = json;
          setAnnouncements(data);
        }
      })
      .catch(() => {});
  }, [config]);

  useEffect(() => {
    if (!config?.enabled) {
      setAnnouncements([]);
      return;
    }
    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [config, poll]);

  return announcements;
}
```

- [ ] **Step 2: Verify build**

Run: `cd C:/Dev/SchoolWatch && npm run build`
Expected: exits 0.

- [ ] **Step 3: Verify lint**

Run: `cd C:/Dev/SchoolWatch && npm run lint`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
cd C:/Dev/SchoolWatch
git add hooks/useAnnouncements.ts
git commit -m "feat: add useAnnouncements polling hook"
```

---

### Task A3: Port `AnnouncementsFeed` component with fixed semantic colors

**Files:**
- Create: `C:/Dev/SchoolWatch/components/AnnouncementsFeed.tsx`

- [ ] **Step 1: Create the component**

Create `C:/Dev/SchoolWatch/components/AnnouncementsFeed.tsx`. This is a port of `C:/Dev/Lakerwatch/components/AnnouncementsFeed.tsx` with type colors replaced by fixed semantic colors (info=gray, warning=amber, urgent=red500) that work on any school palette.

```tsx
"use client";

import type { PublicAnnouncement } from "@/lib/types/announcements";

const TYPE_STYLES: Record<string, { dot: string; bg: string; border: string }> = {
  info: {
    dot: "bg-gray-400 dark:bg-white/40",
    bg: "bg-gray-50 dark:bg-white/5",
    border: "border-gray-200 dark:border-white/10",
  },
  warning: {
    dot: "bg-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/30",
  },
  urgent: {
    dot: "bg-red-500",
    bg: "bg-red-50 dark:bg-red-500/10",
    border: "border-red-200 dark:border-red-500/30",
  },
};

const BADGE_COLORS: Record<string, string> = {
  info: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-dark-muted",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

type AnnouncementsFeedProps = {
  announcements: PublicAnnouncement[];
};

export default function AnnouncementsFeed({ announcements }: AnnouncementsFeedProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <p className="mb-3 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted dark:text-dark-muted">
        Announcements
      </p>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
        {announcements.map((a) => {
          const style = TYPE_STYLES[a.type] ?? TYPE_STYLES.info;
          return (
            <div
              key={a.id}
              className={`rounded-xl border ${style.border} ${style.bg} p-4`}
            >
              <div className="mb-2 flex items-center gap-2">
                <div className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} />
                <h3 className="font-display text-base font-bold text-text dark:text-dark-text">
                  {a.title}
                </h3>
                {a.pinned && (
                  <span className="ml-auto text-xs text-muted dark:text-dark-muted">
                    Pinned
                  </span>
                )}
              </div>
              <p className="text-sm leading-relaxed text-muted dark:text-dark-muted">
                {a.body}
              </p>
              <div className="mt-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${BADGE_COLORS[a.type] ?? BADGE_COLORS.info}`}
                >
                  {a.type}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd C:/Dev/SchoolWatch && npm run build`
Expected: exits 0.

- [ ] **Step 3: Verify lint**

Run: `cd C:/Dev/SchoolWatch && npm run lint`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
cd C:/Dev/SchoolWatch
git add components/AnnouncementsFeed.tsx
git commit -m "feat: add AnnouncementsFeed component with fixed semantic colors"
```

---

### Task A4: Integrate feed into homepage with conditional split layout

**Files:**
- Modify: `C:/Dev/SchoolWatch/app/page.tsx`

- [ ] **Step 1: Rewrite `app/page.tsx` with the feed and conditional layout**

Replace the entire contents of `C:/Dev/SchoolWatch/app/page.tsx` with:

```tsx
"use client";

import DayStatusHero from "@/components/DayStatusHero";
import PeriodCountdown from "@/components/PeriodCountdown";
import QuickGlanceCards from "@/components/QuickGlanceCards";
import AnnouncementsFeed from "@/components/AnnouncementsFeed";
import { useLunchWave } from "@/hooks/useLunchWave";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { formatDateStr } from "@/lib/schedule";
import { getDevDate } from "@/lib/devTime";
import config from "@/school.config";

function checkEarlyDismissal(): boolean {
  const today = formatDateStr(getDevDate(new Date()));
  return config.calendar.events.some(
    (e) => e.type === "early-dismissal" && e.date <= today && (e.endDate ?? e.date) >= today
  );
}

export default function Dashboard() {
  const { lunchWave } = useLunchWave();
  const announcements = useAnnouncements(config.announcements);
  const isEarlyDismissal = checkEarlyDismissal();

  const hasAnnouncements = announcements.length > 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl border border-border bg-white p-6 pb-8 shadow-sm dark:border-dark-border dark:bg-dark-surface dark:shadow-none">
        {hasAnnouncements ? (
          <div className="flex flex-col lg:flex-row lg:gap-8">
            <div className="flex flex-col items-center text-center lg:flex-1">
              <DayStatusHero isEarlyDismissal={isEarlyDismissal} />
              <PeriodCountdown lunchWave={lunchWave} />
            </div>
            <div className="my-6 border-t border-border dark:border-dark-border lg:my-0 lg:border-l lg:border-t-0" />
            <div className="max-h-[420px] lg:w-[340px] lg:max-h-none lg:shrink-0 lg:self-stretch lg:overflow-hidden">
              <AnnouncementsFeed announcements={announcements} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <DayStatusHero isEarlyDismissal={isEarlyDismissal} />
            <PeriodCountdown lunchWave={lunchWave} />
          </div>
        )}
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted dark:text-dark-muted">
          At a Glance
        </p>
        <QuickGlanceCards />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd C:/Dev/SchoolWatch && npm run build`
Expected: exits 0.

- [ ] **Step 3: Verify lint**

Run: `cd C:/Dev/SchoolWatch && npm run lint`
Expected: exits 0.

- [ ] **Step 4: Manual smoke test — no announcements config**

The repo's own `school.config.ts` does NOT yet have an `announcements` block, so the feed should stay hidden and the homepage should render the clock-only layout.

Run: `cd C:/Dev/SchoolWatch && npm run dev`
Open: `http://localhost:3000`
Expected: clock-only layout, identical to before this change. No visible feed. No failed network requests in DevTools (the hook should early-return when config is missing).

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
cd C:/Dev/SchoolWatch
git add app/page.tsx
git commit -m "feat: render AnnouncementsFeed on homepage when config enables it"
```

---

### Task A5: Template-side final verification

**Files:** none modified — verification only, no commit.

- [ ] **Step 1: Run full build + lint from scratch**

Run: `cd C:/Dev/SchoolWatch && npm run build && npm run lint`
Expected: both exit 0.

- [ ] **Step 2: Confirm existing repo state is clean**

```bash
cd C:/Dev/SchoolWatch
git status            # should be clean (everything from A1-A4 is committed)
git log --oneline -5  # verify the A1-A4 commits are present
```

The full visual smoke test (feed rendering, split layout, color variants) happens end-to-end in Task B12 once the wizard API is live. Phase A alone only needs to confirm:
- Type additions compile
- No homepage regressions for schools without an `announcements` config block (already verified in Task A4 Step 4)

- [ ] **Step 3: Push template branch**

Push per the template repo's branch/PR conventions. The branch is ready for review and merge.

---

## Phase B — Wizard repo (`C:/Dev/schoolwatch-wizard`)

Ships after Phase A. New schools immediately get the feature; existing schools need a one-time redeploy to receive the updated `school.config.ts`.

### Task B1: Add `Announcement` Prisma model + back-relation on `School`

**Files:**
- Modify: `C:/Dev/schoolwatch-wizard/prisma/schema.prisma`

- [ ] **Step 1: Add the model and the back-relation**

Replace the entire contents of `C:/Dev/schoolwatch-wizard/prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

model School {
  id              String         @id @default(auto()) @map("_id") @db.ObjectId
  name            String
  slug            String         @unique
  contactEmail    String
  configData      Json
  githubRepoName  String
  vercelProjectId String
  deployedUrl     String
  logoUrl         String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  announcements   Announcement[]
}

model Announcement {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  schoolId   String   @db.ObjectId
  school     School   @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  title      String
  body       String
  type       String // "info" | "warning" | "urgent"
  pinned     Boolean  @default(false)
  active     Boolean  @default(true)
  expiresAt  String? // "YYYY-MM-DD" or null
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([schoolId, active])
}
```

- [ ] **Step 2: Regenerate Prisma client + verify build**

Run: `cd C:/Dev/schoolwatch-wizard && npm run build`
Expected: `prisma generate` runs as part of the script, then `next build` succeeds. Exits 0.

- [ ] **Step 3: Verify lint**

Run: `cd C:/Dev/schoolwatch-wizard && npm run lint`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
cd C:/Dev/schoolwatch-wizard
git add prisma/schema.prisma
git commit -m "feat: add Announcement model with schoolId relation"
```

---

### Task B2: Shared announcement types + constants

**Files:**
- Create: `C:/Dev/schoolwatch-wizard/lib/announcements.ts`

- [ ] **Step 1: Create the shared module**

Create `C:/Dev/schoolwatch-wizard/lib/announcements.ts`:

```ts
export type AnnouncementType = "info" | "warning" | "urgent";

export const VALID_TYPES: AnnouncementType[] = ["info", "warning", "urgent"];

export const MAX_ACTIVE = 4;

export const ANNOUNCEMENT_TYPE_LABELS: Record<AnnouncementType, string> = {
  info: "Info",
  warning: "Warning",
  urgent: "Urgent",
};

export type AnnouncementInput = {
  title: string;
  body: string;
  type: AnnouncementType;
  pinned: boolean;
  expiresAt: string; // "YYYY-MM-DD" or "" for none
};

export type Announcement = {
  id: string;
  schoolId: string;
  title: string;
  body: string;
  type: AnnouncementType;
  pinned: boolean;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};
```

- [ ] **Step 2: Verify build**

Run: `cd C:/Dev/schoolwatch-wizard && npm run build`
Expected: exits 0.

- [ ] **Step 3: Verify lint**

Run: `cd C:/Dev/schoolwatch-wizard && npm run lint`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
cd C:/Dev/schoolwatch-wizard
git add lib/announcements.ts
git commit -m "feat: add shared announcement types and MAX_ACTIVE constant"
```

---

### Task B3: Public announcements API route

**Files:**
- Create: `C:/Dev/schoolwatch-wizard/app/api/public/announcements/[slug]/route.ts`

- [ ] **Step 1: Create the public read endpoint**

Create `C:/Dev/schoolwatch-wizard/app/api/public/announcements/[slug]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PUBLIC_HEADERS = {
  "Cache-Control": "public, s-maxage=5, stale-while-revalidate=30",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: PUBLIC_HEADERS });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const school = await prisma.school.findUnique({ where: { slug } });
  if (!school) {
    return NextResponse.json([], { headers: PUBLIC_HEADERS });
  }

  const now = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD" — matches expiresAt format
  const rows = await prisma.announcement.findMany({
    where: {
      schoolId: school.id,
      active: true,
      OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
    },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });

  const payload = rows.map((r) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    type: r.type,
    pinned: r.pinned,
    createdAt: r.createdAt.toISOString(),
  }));

  return NextResponse.json(payload, { headers: PUBLIC_HEADERS });
}
```

- [ ] **Step 2: Verify build**

Run: `cd C:/Dev/schoolwatch-wizard && npm run build`
Expected: exits 0.

- [ ] **Step 3: Verify lint**

Run: `cd C:/Dev/schoolwatch-wizard && npm run lint`
Expected: exits 0.

- [ ] **Step 4: Manual curl test**

Run: `cd C:/Dev/schoolwatch-wizard && npm run dev`

In a second terminal:

```bash
curl -i http://localhost:3000/api/public/announcements/nonexistent-slug
```

Expected:
- `HTTP/1.1 200 OK`
- `Cache-Control: public, s-maxage=5, stale-while-revalidate=30`
- `Access-Control-Allow-Origin: *`
- Body: `[]`

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
cd C:/Dev/schoolwatch-wizard
git add app/api/public/announcements/[slug]/route.ts
git commit -m "feat: add public CORS-open announcements API with edge cache"
```

---

### Task B4: Admin announcements collection route (GET list, POST create)

**Files:**
- Create: `C:/Dev/schoolwatch-wizard/app/api/announcements/route.ts`

- [ ] **Step 1: Create the collection route**

Create `C:/Dev/schoolwatch-wizard/app/api/announcements/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, isSuperAdmin } from "@/lib/auth";
import { MAX_ACTIVE, VALID_TYPES } from "@/lib/announcements";

async function getSessionEmail(req: NextRequest): Promise<string | null> {
  const cookie = req.cookies.get("session")?.value;
  if (!cookie) return null;
  const session = await verifySessionToken(cookie);
  return session?.email ?? null;
}

export async function GET(req: NextRequest) {
  const email = await getSessionEmail(req);
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schoolId = req.nextUrl.searchParams.get("schoolId");
  if (!schoolId) {
    return NextResponse.json({ error: "Missing schoolId" }, { status: 400 });
  }

  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  if (school.contactEmail !== email && !isSuperAdmin(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await prisma.announcement.findMany({
    where: { schoolId },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const email = await getSessionEmail(req);
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { schoolId, title, body: text, type, pinned, expiresAt } = body;

  if (!schoolId || !title || !text || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid announcement type" }, { status: 400 });
  }

  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }
  if (school.contactEmail !== email && !isSuperAdmin(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD" — matches expiresAt format
  const activeCount = await prisma.announcement.count({
    where: {
      schoolId,
      active: true,
      OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
    },
  });
  if (activeCount >= MAX_ACTIVE) {
    return NextResponse.json(
      { error: `Maximum of ${MAX_ACTIVE} active announcements allowed` },
      { status: 400 }
    );
  }

  const created = await prisma.announcement.create({
    data: {
      schoolId,
      title,
      body: text,
      type,
      pinned: pinned ?? false,
      active: true,
      expiresAt: expiresAt || null,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
```

- [ ] **Step 2: Verify build**

Run: `cd C:/Dev/schoolwatch-wizard && npm run build`
Expected: exits 0.

- [ ] **Step 3: Verify lint**

Run: `cd C:/Dev/schoolwatch-wizard && npm run lint`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
cd C:/Dev/schoolwatch-wizard
git add app/api/announcements/route.ts
git commit -m "feat: admin announcements API with ownership + 4-active cap"
```

---

### Task B5: Admin announcements item route (PUT, DELETE)

**Files:**
- Create: `C:/Dev/schoolwatch-wizard/app/api/announcements/[id]/route.ts`

- [ ] **Step 1: Create the item route**

Create `C:/Dev/schoolwatch-wizard/app/api/announcements/[id]/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, isSuperAdmin } from "@/lib/auth";
import { VALID_TYPES } from "@/lib/announcements";

async function getSessionEmail(req: NextRequest): Promise<string | null> {
  const cookie = req.cookies.get("session")?.value;
  if (!cookie) return null;
  const session = await verifySessionToken(cookie);
  return session?.email ?? null;
}

async function loadAndAuthorize(req: NextRequest, id: string) {
  const email = await getSessionEmail(req);
  if (!email) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: { school: true },
  });
  if (!announcement) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }
  if (announcement.school.contactEmail !== email && !isSuperAdmin(email)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { announcement };
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await loadAndAuthorize(req, id);
  if ("error" in result) return result.error;

  const body = await req.json();
  const { title, body: text, type, pinned, active, expiresAt } = body;

  if (type && !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid announcement type" }, { status: 400 });
  }

  const updated = await prisma.announcement.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(text && { body: text }),
      ...(type && { type }),
      ...(pinned !== undefined && { pinned }),
      ...(active !== undefined && { active }),
      expiresAt: expiresAt !== undefined ? expiresAt || null : undefined,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await loadAndAuthorize(req, id);
  if ("error" in result) return result.error;

  await prisma.announcement.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Verify build**

Run: `cd C:/Dev/schoolwatch-wizard && npm run build`
Expected: exits 0.

- [ ] **Step 3: Verify lint**

Run: `cd C:/Dev/schoolwatch-wizard && npm run lint`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
cd C:/Dev/schoolwatch-wizard
git add app/api/announcements/[id]/route.ts
git commit -m "feat: admin announcement PUT/DELETE with ownership check"
```

---

### Task B6: `AnnouncementForm` component (dark-themed port)

**Files:**
- Create: `C:/Dev/schoolwatch-wizard/components/admin/AnnouncementForm.tsx`

- [ ] **Step 1: Create the form**

Create `C:/Dev/schoolwatch-wizard/components/admin/AnnouncementForm.tsx`. Port of LakerWatch's `AdminAnnouncementForm.tsx` re-themed for the wizard's dark palette (per CLAUDE.md "Styling Conventions"):

```tsx
"use client";

import { useState } from "react";
import type { Announcement, AnnouncementInput, AnnouncementType } from "@/lib/announcements";
import { ANNOUNCEMENT_TYPE_LABELS, VALID_TYPES } from "@/lib/announcements";

type Props = {
  announcement?: Announcement;
  onSave: (data: AnnouncementInput) => void | Promise<void>;
  onCancel: () => void;
};

const INPUT_CLASS =
  "w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors duration-150";
const LABEL_CLASS = "block text-sm font-medium text-gray-300 mb-1.5";

export default function AnnouncementForm({ announcement, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(announcement?.title ?? "");
  const [body, setBody] = useState(announcement?.body ?? "");
  const [type, setType] = useState<AnnouncementType>(announcement?.type ?? "info");
  const [pinned, setPinned] = useState(announcement?.pinned ?? false);
  const [expiresAt, setExpiresAt] = useState(announcement?.expiresAt ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      await onSave({ title: title.trim(), body: body.trim(), type, pinned, expiresAt });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={LABEL_CLASS}>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={120}
          className={INPUT_CLASS}
        />
      </div>
      <div>
        <label className={LABEL_CLASS}>Body</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={3}
          maxLength={500}
          className={INPUT_CLASS}
        />
      </div>
      <div>
        <label className={LABEL_CLASS}>Type</label>
        <div className="flex gap-2">
          {VALID_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 ${
                type === t
                  ? "bg-white text-black"
                  : "border border-white/20 text-gray-300 hover:border-white/40"
              }`}
            >
              {ANNOUNCEMENT_TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <input
          id="pinned"
          type="checkbox"
          checked={pinned}
          onChange={(e) => setPinned(e.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-white/10"
        />
        <label htmlFor="pinned" className="text-sm text-gray-300">
          Pin to top
        </label>
      </div>
      <div>
        <label className={LABEL_CLASS}>
          Expires on <span className="text-gray-500">(optional)</span>
        </label>
        <input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className={INPUT_CLASS}
        />
      </div>
      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-gray-100 disabled:opacity-50"
        >
          {announcement ? "Save changes" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-gray-300 transition-colors hover:text-white"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd C:/Dev/schoolwatch-wizard && npm run build`
Expected: exits 0.

- [ ] **Step 3: Verify lint**

Run: `cd C:/Dev/schoolwatch-wizard && npm run lint`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
cd C:/Dev/schoolwatch-wizard
git add components/admin/AnnouncementForm.tsx
git commit -m "feat: add dark-themed AnnouncementForm component"
```

---

### Task B7: `AnnouncementsPanel` component (dark-themed port)

**Files:**
- Create: `C:/Dev/schoolwatch-wizard/components/admin/AnnouncementsPanel.tsx`

- [ ] **Step 1: Create the panel**

Create `C:/Dev/schoolwatch-wizard/components/admin/AnnouncementsPanel.tsx`. Port of LakerWatch's `AdminAnnouncementsPanel.tsx` with dark theme and `schoolId` prop:

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import AnnouncementForm from "@/components/admin/AnnouncementForm";
import type { Announcement, AnnouncementInput } from "@/lib/announcements";
import { ANNOUNCEMENT_TYPE_LABELS, MAX_ACTIVE } from "@/lib/announcements";

type Props = {
  schoolId: string;
};

const TYPE_BADGE: Record<string, string> = {
  info: "bg-white/10 text-gray-300",
  warning: "bg-amber-500/20 text-amber-300",
  urgent: "bg-red-500/20 text-red-300",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AnnouncementsPanel({ schoolId }: Props) {
  const [rows, setRows] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/announcements?schoolId=${encodeURIComponent(schoolId)}`);
      if (res.ok) {
        setRows(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  const activeCount = rows.filter((r) => r.active).length;
  const atLimit = activeCount >= MAX_ACTIVE;

  async function handleAdd(data: AnnouncementInput) {
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, schoolId }),
    });
    if (res.ok) {
      setShowAdd(false);
      fetchRows();
    }
  }

  async function handleEdit(data: AnnouncementInput) {
    if (!editingId) return;
    const res = await fetch(`/api/announcements/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setEditingId(null);
      fetchRows();
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/announcements/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDeleteId(null);
      fetchRows();
    }
  }

  async function handleToggleActive(id: string, currentActive: boolean) {
    if (!currentActive && atLimit) return;
    await fetch(`/api/announcements/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !currentActive }),
    });
    fetchRows();
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Announcements</h2>
          <p className="text-sm text-gray-400">
            {activeCount}/{MAX_ACTIVE} active · {rows.length} total
          </p>
        </div>
        <button
          onClick={() => {
            setShowAdd(true);
            setEditingId(null);
          }}
          disabled={atLimit}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            atLimit
              ? "cursor-not-allowed bg-white/10 text-gray-500"
              : "bg-white text-black hover:bg-gray-100"
          }`}
        >
          + Add Announcement
        </button>
      </div>

      {showAdd && (
        <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-5">
          <h3 className="mb-4 text-base font-semibold text-white">New Announcement</h3>
          <AnnouncementForm onSave={handleAdd} onCancel={() => setShowAdd(false)} />
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[88px] animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/20 py-12 text-center">
          <p className="text-sm font-medium text-gray-400">No announcements yet</p>
          <p className="mt-1 text-xs text-gray-500">Click &quot;Add Announcement&quot; to create one</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((a) => (
            <div
              key={a.id}
              className={`group rounded-xl border border-white/10 bg-white/5 p-4 transition-colors ${
                !a.active ? "opacity-50" : ""
              }`}
            >
              {editingId === a.id ? (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-white">Edit Announcement</h3>
                  <AnnouncementForm
                    announcement={a}
                    onSave={handleEdit}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-white">{a.title}</p>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${TYPE_BADGE[a.type] ?? TYPE_BADGE.info}`}
                      >
                        {ANNOUNCEMENT_TYPE_LABELS[a.type as keyof typeof ANNOUNCEMENT_TYPE_LABELS] ?? a.type}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-sm text-gray-400">{a.body}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {a.pinned && (
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-gray-300">
                          Pinned
                        </span>
                      )}
                      {!a.active && (
                        <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-300">
                          Inactive
                        </span>
                      )}
                      {a.expiresAt && (
                        <span className="text-[11px] text-gray-400">Expires {formatDate(a.expiresAt)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {deleteId === a.id ? (
                      <>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-gray-300 hover:text-white"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleToggleActive(a.id, a.active)}
                          title={a.active ? "Deactivate" : "Activate"}
                          className="rounded-lg px-2.5 py-1.5 text-sm text-gray-400 opacity-0 transition-all hover:bg-white/10 hover:text-white group-hover:opacity-100"
                        >
                          {a.active ? "Hide" : "Show"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(a.id);
                            setShowAdd(false);
                          }}
                          className="rounded-lg px-2.5 py-1.5 text-sm text-gray-400 opacity-0 transition-all hover:bg-white/10 hover:text-white group-hover:opacity-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(a.id)}
                          className="rounded-lg px-2.5 py-1.5 text-sm text-gray-400 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd C:/Dev/schoolwatch-wizard && npm run build`
Expected: exits 0.

- [ ] **Step 3: Verify lint**

Run: `cd C:/Dev/schoolwatch-wizard && npm run lint`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
cd C:/Dev/schoolwatch-wizard
git add components/admin/AnnouncementsPanel.tsx
git commit -m "feat: add dark-themed AnnouncementsPanel admin UI"
```

---

### Task B8: `/manage/[slug]` page — auth gate + tabbed shell

**Files:**
- Create: `C:/Dev/schoolwatch-wizard/app/manage/[slug]/page.tsx` (server component)
- Create: `C:/Dev/schoolwatch-wizard/app/manage/[slug]/ManageShell.tsx` (client component)

- [ ] **Step 1: Create the server auth gate**

Create `C:/Dev/schoolwatch-wizard/app/manage/[slug]/page.tsx`:

```tsx
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySessionToken, isSuperAdmin } from "@/lib/auth";
import ManageShell from "./ManageShell";
import type { WizardFormData } from "@/lib/types";
import { defaultLightColors } from "@/lib/colors";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ManagePage({ params }: PageProps) {
  const { slug } = await params;

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) {
    redirect("/login");
  }
  const session = await verifySessionToken(sessionCookie);
  if (!session) {
    redirect("/login");
  }

  const school = await prisma.school.findUnique({ where: { slug } });
  if (!school) {
    notFound();
  }

  if (school.contactEmail !== session.email && !isSuperAdmin(session.email)) {
    redirect("/login");
  }

  // Migrate legacy flat color format (same migration /edit does)
  const cfg = school.configData as WizardFormData & {
    colors?: { primary?: string; accent?: string; light?: unknown; dark?: unknown };
  };
  if (cfg?.colors && !cfg.colors.light) {
    const primary = cfg.colors.primary || "#003da5";
    const accent = cfg.colors.accent || "#003da5";
    cfg.colors = {
      primary,
      accent,
      light: defaultLightColors(primary, accent),
      dark: {},
    } as WizardFormData["colors"];
  }

  return (
    <ManageShell
      schoolId={school.id}
      schoolName={school.name}
      schoolSlug={school.slug}
      initialData={cfg as WizardFormData}
    />
  );
}
```

- [ ] **Step 2: Create the client tabbed shell**

Create `C:/Dev/schoolwatch-wizard/app/manage/[slug]/ManageShell.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import WizardShell from "@/components/WizardShell";
import StepSchoolInfo from "@/components/wizard/StepSchoolInfo";
import StepColors from "@/components/wizard/StepColors";
import StepSchedule from "@/components/wizard/StepSchedule";
import StepCalendar from "@/components/wizard/StepCalendar";
import StepFeatures from "@/components/wizard/StepFeatures";
import StepReview from "@/components/wizard/StepReview";
import AnnouncementsPanel from "@/components/admin/AnnouncementsPanel";
import type { WizardFormData } from "@/lib/types";

type Tab = "announcements" | "setup";

const STEPS = [
  StepSchoolInfo,
  StepColors,
  StepSchedule,
  StepCalendar,
  StepFeatures,
  StepReview,
];

type Props = {
  schoolId: string;
  schoolName: string;
  schoolSlug: string;
  initialData: WizardFormData;
};

export default function ManageShell({ schoolId, schoolName, initialData }: Props) {
  const searchParams = useSearchParams();
  const initialTab: Tab = searchParams.get("tab") === "setup" ? "setup" : "announcements";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  async function handleLogout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Manage
            </p>
            <h1 className="mt-0.5 text-2xl font-semibold text-white">{schoolName}</h1>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-white/20 px-3 py-2 text-sm text-gray-300 transition-colors hover:text-white"
          >
            Log out
          </button>
        </div>

        <div className="mb-6 flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => setActiveTab("announcements")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "announcements"
                ? "bg-white text-black"
                : "text-gray-300 hover:text-white"
            }`}
          >
            Announcements
          </button>
          <button
            onClick={() => setActiveTab("setup")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "setup" ? "bg-white text-black" : "text-gray-300 hover:text-white"
            }`}
          >
            Edit Setup
          </button>
        </div>

        {activeTab === "announcements" ? (
          <AnnouncementsPanel schoolId={schoolId} />
        ) : (
          <WizardShell steps={STEPS} initialData={initialData} schoolId={schoolId} />
        )}
      </div>
    </div>
  );
}
```

Note: this references a `DELETE /api/auth/session` endpoint for logout. Check whether the wizard already has one — if not, add a minimal one in `app/api/auth/session/route.ts` that clears the cookie. Inspect the file before adding.

- [ ] **Step 3: Ensure logout endpoint exists**

Run: `cd C:/Dev/schoolwatch-wizard && cat app/api/auth/session/route.ts 2>/dev/null || echo "MISSING OR NO DELETE HANDLER"`

If it's missing or has no DELETE handler, edit `C:/Dev/schoolwatch-wizard/app/api/auth/session/route.ts` and add:

```ts
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
```

Import `NextResponse` from `next/server` at the top if not already imported.

- [ ] **Step 4: Verify build**

Run: `cd C:/Dev/schoolwatch-wizard && npm run build`
Expected: exits 0.

- [ ] **Step 5: Verify lint**

Run: `cd C:/Dev/schoolwatch-wizard && npm run lint`
Expected: exits 0.

- [ ] **Step 6: Commit**

```bash
cd C:/Dev/schoolwatch-wizard
git add app/manage/[slug]/page.tsx app/manage/[slug]/ManageShell.tsx app/api/auth/session/route.ts
git commit -m "feat: add /manage/[slug] tabbed admin page"
```

---

### Task B9: Redirect `/edit?token=...` to `/manage/<slug>`

**Files:**
- Modify: `C:/Dev/schoolwatch-wizard/app/edit/page.tsx`

- [ ] **Step 1: Patch `EditPageContent` to redirect after loading school**

In `C:/Dev/schoolwatch-wizard/app/edit/page.tsx`, add `useRouter` import at the top with the other `next/navigation` imports (line 4):

```tsx
import { useRouter, useSearchParams } from "next/navigation";
```

Inside `EditPageContent()` below the `useSearchParams()` line (around line 56–57), add:

```tsx
  const router = useRouter();
```

Replace the `const schoolData = await schoolRes.json();` block plus the color-migration block plus `setSchool(schoolData); setStatus("ready");` (roughly lines 109–118) with:

```tsx
        const schoolData = await schoolRes.json();
        const slug = schoolData.slug ?? schoolData.configData?.slug;
        if (slug) {
          router.replace(`/manage/${slug}?tab=setup`);
          return;
        }
        // Fallback: if the API hasn't been updated to return slug yet,
        // keep the legacy inline wizard so the page still works.
        const cfg = schoolData.configData;
        if (cfg?.colors && !cfg.colors.light) {
          const primary = cfg.colors.primary || "#003da5";
          const accent = cfg.colors.accent || "#003da5";
          cfg.colors = { primary, accent, light: defaultLightColors(primary, accent), dark: {} };
        }
        setSchool(schoolData);
        setStatus("ready");
```

- [ ] **Step 2: Extend `by-email` API to return the slug**

Edit `C:/Dev/schoolwatch-wizard/app/api/schools/by-email/route.ts`. Change the `select` clause on line 27:

From:
```ts
    select: { id: true, configData: true },
```

To:
```ts
    select: { id: true, configData: true, slug: true },
```

- [ ] **Step 3: Verify build**

Run: `cd C:/Dev/schoolwatch-wizard && npm run build`
Expected: exits 0.

- [ ] **Step 4: Verify lint**

Run: `cd C:/Dev/schoolwatch-wizard && npm run lint`
Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
cd C:/Dev/schoolwatch-wizard
git add app/edit/page.tsx app/api/schools/by-email/route.ts
git commit -m "feat: redirect /edit to /manage/:slug after token verification"
```

---

### Task B10: Config generator emits `announcements` block; callers pass slug

**Files:**
- Modify: `C:/Dev/schoolwatch-wizard/lib/config-generator.ts`
- Modify: `C:/Dev/schoolwatch-wizard/app/api/deploy/route.ts`
- Modify: `C:/Dev/schoolwatch-wizard/app/api/redeploy/route.ts`

- [ ] **Step 1: Update `generateConfigTs` signature to accept `slug`**

Edit `C:/Dev/schoolwatch-wizard/lib/config-generator.ts`. Change the signature on line 103:

From:
```ts
export function generateConfigTs(data: WizardFormData, logoPath = "/logo.png"): string {
```

To:
```ts
export function generateConfigTs(
  data: WizardFormData,
  logoPath = "/logo.png",
  slug = ""
): string {
```

- [ ] **Step 2: Emit the `announcements` block**

In the same file, replace the `features` block near the end of the template string (the `features: { ... },` block around lines 187-191). Change this:

```ts
  features: {
    events: ${features.events},
    productivity: ${features.productivity},
  },
};
```

To:

```ts
  features: {
    events: ${features.events},
    productivity: ${features.productivity},
  },
  announcements: {
    enabled: ${slug ? "true" : "false"},
    apiUrl: "${esc((process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, ""))}",
    slug: "${esc(slug)}",
  },
};
```

- [ ] **Step 3: Pass slug from deploy route**

Edit `C:/Dev/schoolwatch-wizard/app/api/deploy/route.ts`. On line 58 change:

From:
```ts
    const configContent = generateConfigTs(dataForConfig, logoPath);
```

To:
```ts
    const configContent = generateConfigTs(dataForConfig, logoPath, slug);
```

- [ ] **Step 4: Pass slug from redeploy route**

Edit `C:/Dev/schoolwatch-wizard/app/api/redeploy/route.ts`. On line 54 change:

From:
```ts
    const configContent = generateConfigTs(dataForConfig, logoPath);
```

To:
```ts
    const configContent = generateConfigTs(dataForConfig, logoPath, school.slug);
```

- [ ] **Step 5: Verify build**

Run: `cd C:/Dev/schoolwatch-wizard && npm run build`
Expected: exits 0.

- [ ] **Step 6: Verify lint**

Run: `cd C:/Dev/schoolwatch-wizard && npm run lint`
Expected: exits 0.

- [ ] **Step 7: Commit**

```bash
cd C:/Dev/schoolwatch-wizard
git add lib/config-generator.ts app/api/deploy/route.ts app/api/redeploy/route.ts
git commit -m "feat: emit announcements block with apiUrl + slug in generated config"
```

---

### Task B11: Update magic-link email copy to say "manage" instead of "edit"

**Files:**
- Modify: `C:/Dev/schoolwatch-wizard/lib/email.ts`

- [ ] **Step 1: Update subject, body, and CTA text**

Edit `C:/Dev/schoolwatch-wizard/lib/email.ts`:

Line 16, change:
```ts
  const preheader = `Your edit link for ${schoolName} — expires in 15 minutes`;
```
To:
```ts
  const preheader = `Your manage link for ${schoolName} — expires in 15 minutes`;
```

Line 22, change:
```ts
    subject: `Edit your ${schoolName} dashboard`,
```
To:
```ts
    subject: `Manage your ${schoolName} dashboard`,
```

Lines 29 and 34 (the text body), change:
```ts
      `Edit your ${schoolName} dashboard`,
      "",
      `You requested a link to edit the ${schoolName} dashboard.`,
      "This link expires in 15 minutes.",
      "",
      `Edit Dashboard: ${url}`,
```
To:
```ts
      `Manage your ${schoolName} dashboard`,
      "",
      `You requested a link to manage the ${schoolName} dashboard.`,
      "This link expires in 15 minutes.",
      "",
      `Manage Dashboard: ${url}`,
```

Line 46 (HTML `<title>`), change:
```html
          <title>Edit your ${escHtml(schoolName)} dashboard</title>
```
To:
```html
          <title>Manage your ${escHtml(schoolName)} dashboard</title>
```

Line 62 (HTML heading), change:
```html
                      <h1 style="margin:0 0 24px;font-size:22px;font-weight:600;color:#f1f5f9;line-height:1.3;">Edit your dashboard</h1>
```
To:
```html
                      <h1 style="margin:0 0 24px;font-size:22px;font-weight:600;color:#f1f5f9;line-height:1.3;">Manage your dashboard</h1>
```

Lines 63-64 (HTML paragraph), change:
```html
                      <p style="margin:0 0 32px;font-size:16px;color:#94a3b8;line-height:1.6;">
                        You requested a link to edit the <strong style="color:#e2e8f0;">${escHtml(schoolName)}</strong> dashboard.
```
To:
```html
                      <p style="margin:0 0 32px;font-size:16px;color:#94a3b8;line-height:1.6;">
                        You requested a link to manage the <strong style="color:#e2e8f0;">${escHtml(schoolName)}</strong> dashboard.
```

Line 71 (CTA button text), change:
```html
                              Edit Dashboard
```
To:
```html
                              Manage Dashboard
```

- [ ] **Step 2: Verify build**

Run: `cd C:/Dev/schoolwatch-wizard && npm run build`
Expected: exits 0.

- [ ] **Step 3: Verify lint**

Run: `cd C:/Dev/schoolwatch-wizard && npm run lint`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
cd C:/Dev/schoolwatch-wizard
git add lib/email.ts
git commit -m "feat: update magic-link email copy to say manage instead of edit"
```

---

### Task B12: End-to-end smoke test

**Files:** none modified — this is a verification-only task. No commit at the end.

- [ ] **Step 1: Start wizard dev server**

Run: `cd C:/Dev/schoolwatch-wizard && npm run dev`

- [ ] **Step 2: Verify `/manage/:slug` auth gate**

Open (without being logged in): `http://localhost:3000/manage/some-existing-slug`
Expected: redirect to `/login`.

- [ ] **Step 3: Log in as a real school owner**

Open `http://localhost:3000/login`, enter a `contactEmail` that matches a real `School` record in your Mongo. Click the magic link in the email.
Expected: land on `http://localhost:3000/manage/<slug>?tab=setup` (coming from `/edit` → redirect). The "Announcements" tab and "Edit Setup" tab both render.

- [ ] **Step 4: Create an announcement**

Click "Announcements" tab → "+ Add Announcement". Fill in:
- Title: "Smoke test"
- Body: "First announcement posted from /manage"
- Type: Urgent
- Pinned: checked
Submit.
Expected: appears at the top of the list with the `URGENT` badge and `Pinned` pill. Active counter shows `1/4`.

- [ ] **Step 5: Verify public API returns the announcement**

In a second terminal:

```bash
curl -s http://localhost:3000/api/public/announcements/<slug> | head -c 500
```

Expected: a JSON array with one announcement matching what you just created. Headers include `Cache-Control: public, s-maxage=5, stale-while-revalidate=30` and `Access-Control-Allow-Origin: *` (verify with `curl -i`).

- [ ] **Step 6: Verify 4-active cap**

Create three more announcements (any content). After the fourth active one, the "+ Add Announcement" button should be disabled with the cap label.
Expected: button disabled, active counter reads `4/4`.

Deactivate one via the "Hide" button. Active counter drops to `3/4`, button re-enables.

- [ ] **Step 7: Verify cross-school isolation**

Log in as a DIFFERENT `contactEmail` (or use a super-admin email to test). Visit `/manage/<other-school-slug>` — you should be able to access it.
Attempt `/manage/<school-not-owned>` as a non-super-admin → redirect to `/login`.

In the URL bar / curl, try `PUT /api/announcements/<id-from-other-school>` with a non-owning session. Expected: 403.

- [ ] **Step 8: Verify redeploy emits the announcements block**

Go to the "Edit Setup" tab. Make any trivial change (e.g., bump academic year from "2026-2027" to "2026-2027 "). Click through to the Review step and Deploy.

Wait for the redeploy response (~30-60 s on a real deploy; local-only will error on Vercel calls — that's fine, the GitHub push happens first).

Open the deployed school's repo on GitHub and view `school.config.ts`. Expected: contains the `announcements` block with `enabled: true`, the correct `apiUrl` (matches `NEXT_PUBLIC_APP_URL`), and the correct `slug`.

If you're running without real Vercel credentials and only want to verify the generator string itself, inspect the server log — the `pushFile` call logs the file contents before pushing; grep for `announcements:` in the generated string.

- [ ] **Step 9: Verify the deployed school shows announcements live**

Wait for the Vercel redeploy to finish. Open the deployed URL in a new tab.
Expected: the homepage renders the split layout (clock left, feed right at `lg:` width) with the announcement(s) you created in Steps 4 and 6 above. Light/dark mode both render correctly.

- [ ] **Step 10: Stop dev server**

Stop the running `npm run dev`. Don't commit anything from this task; it's verification-only.

---

## Rollout to existing schools (post-merge)

After both repos are merged and deployed, run a one-time backfill for each existing `School` record to update its `school.config.ts`:

1. Log in to the wizard as super-admin.
2. For each school in Mongo, trigger `POST /api/redeploy` with `{ schoolId, data: <current configData> }`.
3. Wait for each redeploy to finish (~30-60 s each).

This can be done manually via the UI (one school at a time) or wrapped in a tiny admin script — out of scope for this plan.

---

## Self-review checklist

Re-read the spec (`docs/superpowers/specs/2026-04-17-centralized-announcements-design.md`) and confirm every requirement is covered:

- [x] `Announcement` Prisma model with `schoolId` + cascade delete → Task B1
- [x] Public `GET /api/public/announcements/:slug` with CORS + 5s edge cache → Task B3
- [x] Admin `GET/POST /api/announcements` with ownership + 4-active cap → Task B4
- [x] Admin `PUT/DELETE /api/announcements/:id` with ownership → Task B5
- [x] `/manage/[slug]` auth-gated page with Announcements + Edit Setup tabs → Task B8
- [x] `/edit?token=...` redirects to `/manage/<slug>` → Task B9
- [x] Magic-link email copy updated → Task B11
- [x] Template `SchoolConfig` extended with optional `announcements` block → Task A1
- [x] Template `useAnnouncements` polling hook with ref-compare → Task A2
- [x] Template `AnnouncementsFeed` component with fixed semantic colors → Task A3
- [x] Homepage split layout when announcements present → Task A4
- [x] Config generator emits `announcements` block for new deploys + redeploys → Task B10
- [x] Backward compat: schools without the config block render unchanged → Verified in Task A4/A5

No open placeholders. All type names consistent between tasks: `Announcement`, `AnnouncementInput`, `AnnouncementType`, `PublicAnnouncement`, `MAX_ACTIVE`, `VALID_TYPES`.

---

## Notes on decomposition

This plan touches two repos but builds one feature. The Phase A / Phase B split makes them independently shippable: Phase A is a no-op for existing schools if the wizard is never updated, and Phase B is a no-op for new announcements if the template is on an old version (the emitted config block is simply ignored by a config type that doesn't declare it).
