# Edit Flow Bugfixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 7 audit issues in the edit/redeploy flow — 2 critical (session fallback, email update), 2 moderate (deploy progress UX, name sync), 3 minor (shadowing, duplicate protection, data exposure).

**Architecture:** All fixes are isolated to existing API routes and components. One new file (`app/api/auth/session/route.ts`) is added. No schema changes. No new dependencies.

**Tech Stack:** Next.js 16 App Router, Prisma (MongoDB), jose JWT, TypeScript

---

### Task 1: Session cookie fallback on `/edit` (Critical)

**Files:**
- Create: `app/api/auth/session/route.ts`
- Modify: `app/edit/page.tsx`

- [ ] **Step 1: Create GET /api/auth/session endpoint**

Create `app/api/auth/session/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get("session")?.value;
  if (!sessionCookie) {
    return NextResponse.json({ error: "No session" }, { status: 401 });
  }

  const session = await verifySessionToken(sessionCookie);
  if (!session) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  return NextResponse.json({ email: session.email });
}
```

- [ ] **Step 2: Update edit page to fall back to session cookie**

In `app/edit/page.tsx`, replace the `load` function inside the `useEffect` (lines 54-91) with this version that tries the token first, then falls back to the session cookie:

```ts
async function load() {
  try {
    let email: string | null = null;

    // Path A: verify magic link token (sets session cookie)
    if (token) {
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (verifyRes.ok) {
        const data = await verifyRes.json();
        email = data.email;
      }
    }

    // Path B: fall back to existing session cookie
    if (!email) {
      const sessionRes = await fetch("/api/auth/session");
      if (sessionRes.ok) {
        const data = await sessionRes.json();
        email = data.email;
      }
    }

    if (!email) {
      setError(token ? "Invalid or expired link. Please request a new one." : "Please log in to edit your dashboard.");
      setStatus("error");
      return;
    }

    setStatus("loading");

    const schoolRes = await fetch(
      `/api/schools/by-email?email=${encodeURIComponent(email)}`
    );

    if (!schoolRes.ok) {
      setError("Could not load school data");
      setStatus("error");
      return;
    }

    const data = await schoolRes.json();
    setSchool(data);
    setStatus("ready");
  } catch {
    setError("Something went wrong. Please try again.");
    setStatus("error");
  }
}
```

Also update the initial state to not require a token:

```ts
const [status, setStatus] = useState<Status>("verifying");
const [error, setError] = useState("");
```

And update the useEffect dependency — remove the early `if (!token) return;` guard so it always runs:

```ts
useEffect(() => {
  load();
}, [token]);
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add app/api/auth/session/route.ts app/edit/page.tsx
git commit -m "Fix: add session cookie fallback on /edit page refresh"
```

---

### Task 2: Update contactEmail and name on redeploy (Critical + Moderate)

**Files:**
- Modify: `app/api/redeploy/route.ts:57-59`

- [ ] **Step 1: Add contactEmail and name to the prisma update**

In `app/api/redeploy/route.ts`, change the `prisma.school.update` call (lines 57-59) from:

```ts
await prisma.school.update({
  where: { id: schoolId },
  data: { configData: dataForConfig as object, logoUrl },
});
```

to:

```ts
await prisma.school.update({
  where: { id: schoolId },
  data: {
    name: data.school.name,
    contactEmail: data.contactEmail,
    configData: dataForConfig as object,
    logoUrl,
  },
});
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: No TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/redeploy/route.ts
git commit -m "Fix: sync contactEmail and school name on redeploy"
```

---

### Task 3: Fix DeployProgress for edit mode (Moderate)

**Files:**
- Modify: `components/DeployProgress.tsx`
- Modify: `components/wizard/StepReview.tsx`

- [ ] **Step 1: Add edit mode support to DeployProgress**

In `components/DeployProgress.tsx`, update the `Props` type, add `EDIT_STEPS` and `EDIT_STATE_ORDER`, and use them conditionally.

Change the Props type (line 10-14) from:

```ts
type Props = {
  state: DeployState;
  url?: string;
  error?: string;
};
```

to:

```ts
type Props = {
  state: DeployState;
  url?: string;
  error?: string;
  isEditMode?: boolean;
};
```

Add after the existing `STEPS` array (after line 27):

```ts
const EDIT_STEPS: Step[] = [
  { id: "pushing-config", label: "Updating config..." },
  { id: "deploying", label: "Building your site..." },
  { id: "done", label: "Your changes are live!" },
];

const EDIT_STATE_ORDER: DeployState[] = [
  "idle",
  "pushing-config",
  "deploying",
  "done",
];
```

Update the component signature and body. Change (line 61):

```ts
export default function DeployProgress({ state, url, error }: Props) {
```

to:

```ts
export default function DeployProgress({ state, url, error, isEditMode }: Props) {
```

Change (line 64):

```ts
const currentIndex = STATE_ORDER.indexOf(state);
```

to:

```ts
const steps = isEditMode ? EDIT_STEPS : STEPS;
const stateOrder = isEditMode ? EDIT_STATE_ORDER : STATE_ORDER;
const currentIndex = stateOrder.indexOf(state);
```

Change the STEPS.map call (line 72):

```ts
{STEPS.map((step) => {
  const stepIndex = STATE_ORDER.indexOf(step.id);
```

to:

```ts
{steps.map((step) => {
  const stepIndex = stateOrder.indexOf(step.id);
```

- [ ] **Step 2: Pass isEditMode from StepReview to DeployProgress**

In `components/wizard/StepReview.tsx`, change the DeployProgress call (line 139) from:

```ts
<DeployProgress state={deployState} url={deployUrl} error={deployError} />
```

to:

```ts
<DeployProgress state={deployState} url={deployUrl} error={deployError} isEditMode={isEditMode} />
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add components/DeployProgress.tsx components/wizard/StepReview.tsx
git commit -m "Fix: show correct deploy progress steps in edit mode"
```

---

### Task 4: Fix variable shadowing in StepReview (Minor)

**Files:**
- Modify: `components/wizard/StepReview.tsx:58`

- [ ] **Step 1: Rename shadowed variable**

In `components/wizard/StepReview.tsx`, change line 58 from:

```ts
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Request failed (${res.status})`);
```

to:

```ts
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error ?? `Request failed (${res.status})`);
```

- [ ] **Step 2: Commit**

```bash
git add components/wizard/StepReview.tsx
git commit -m "Fix: rename shadowed body variable in StepReview"
```

---

### Task 5: Add duplicate school protection on deploy (Minor)

**Files:**
- Modify: `app/api/deploy/route.ts:13-14`

- [ ] **Step 1: Add slug uniqueness check**

In `app/api/deploy/route.ts`, after line 13 (`const slug = generateSlug(data.school.name);`), add:

```ts
    const existing = await prisma.school.findFirst({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "A school with this name already exists" },
        { status: 409 }
      );
    }
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: No TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/deploy/route.ts
git commit -m "Fix: reject duplicate school names on deploy"
```

---

### Task 6: Limit data exposed from by-email endpoint (Minor)

**Files:**
- Modify: `app/api/schools/by-email/route.ts:25`

- [ ] **Step 1: Select only needed fields**

In `app/api/schools/by-email/route.ts`, change line 25 from:

```ts
  const school = await prisma.school.findFirst({ where: { contactEmail: email } });
```

to:

```ts
  const school = await prisma.school.findFirst({
    where: { contactEmail: email },
    select: { id: true, configData: true },
  });
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: No TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/schools/by-email/route.ts
git commit -m "Fix: limit fields returned from schools/by-email endpoint"
```

---

### Task 7: Final verification

- [ ] **Step 1: Run full lint + build**

```bash
npm run lint && npm run build
```

Expected: No errors or warnings related to changed files.
