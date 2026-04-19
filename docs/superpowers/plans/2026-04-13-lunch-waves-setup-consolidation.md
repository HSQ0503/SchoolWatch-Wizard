# Lunch Waves Setup Consolidation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Kill standalone Step 4 (Lunch Waves) and move wave definition into Step 3 (Schedule) as a "Setup" block alongside day types, with a segmented `None · 2 · 3 · 4` count picker. Drop user-editable wave IDs and the default radio — both auto-managed.

**Architecture:** UI-only change. `WizardFormData.lunchWaves` shape stays `{ enabled, options: {id,label}[], default }` so existing Mongo schools rehydrate unchanged and `school.config.ts` output is unchanged. The wizard goes 7 → 6 steps. `StepSchedule` grows a Setup block on top containing day types (existing chip strip, lifted into a labeled section) and a new lunch-wave count picker; the existing per-day-type period tables render below. `StepLunchWaves.tsx` is deleted. `validateLunchWaves` is deleted since its data now lives on Step 3 and is already consulted by `validateSchedule`.

**Tech Stack:** Next.js 16.2.3 App Router, React 19, TypeScript 5, Tailwind v4 + CSS-variable zine theme, `motion/react`.

**Testing:** No test infra in this repo. Verification per task = `npm run lint && npm run build` + manual browser walkthrough on `/setup` and `/edit`.

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `components/wizard/StepLunchWaves.tsx` | **delete** | Standalone wave-naming step — no longer needed |
| `components/WizardShell.tsx` | modify | `STEPS` array: drop `"Lunch Waves"` |
| `app/setup/page.tsx` | modify | Drop `StepLunchWaves` import + entry in `steps` |
| `app/edit/page.tsx` | modify | Drop `StepLunchWaves` import + entry in `STEPS` |
| `lib/validation.ts` | modify | Delete `validateLunchWaves`; reshuffle `validateStep` switch |
| `components/wizard/StepCalendar.tsx` | modify | Renumber kicker `step 05` → `step 04`; margin-note `5` → `4` |
| `components/wizard/StepFeatures.tsx` | modify | Renumber kicker `step 06` → `step 05`; margin-note `6` → `5` |
| `components/wizard/StepReview.tsx` | modify | Renumber kicker `step 07` → `step 06` |
| `components/wizard/StepSchedule.tsx` | modify | Add Setup block (day types + lunch-wave segmented picker + wave-label inputs); update right-rail copy; wire count handler with prune/extend logic |

---

## Task 1: Remove Step 4 from wizard flow and renumber downstream kickers

**Files:**
- Delete: `components/wizard/StepLunchWaves.tsx`
- Modify: `components/WizardShell.tsx:10-18`
- Modify: `app/setup/page.tsx:7, 12-20`
- Modify: `app/edit/page.tsx:9, 47-55`
- Modify: `lib/validation.ts:7-16, 127-150`
- Modify: `components/wizard/StepCalendar.tsx:167` and the right-rail `5` marker (around line 316, content `5` inside the `font-caveat` span)
- Modify: `components/wizard/StepFeatures.tsx:81` and the right-rail `6` marker (around line 151)
- Modify: `components/wizard/StepReview.tsx:115`

Rationale for doing this as one task/commit: these changes are mechanically coupled — if `STEPS` shrinks to 6 but `StepLunchWaves` still exists in a page's `steps` array, the wizard breaks. If kickers aren't renumbered, users see `step 05 / calendar` as the 4th step. All of it has to land together for the wizard to be coherent.

- [ ] **Step 1.1: Update `components/WizardShell.tsx` `STEPS` array**

Replace the `STEPS` constant (lines 10–18) with:

```tsx
export const STEPS = [
  "School Info",
  "Colors",
  "Schedule",
  "Calendar",
  "Features",
  "Review & Deploy",
] as const;
```

- [ ] **Step 1.2: Update `app/setup/page.tsx`**

Remove the `StepLunchWaves` import and its entry in the `steps` array. Final file:

```tsx
"use client";

import WizardShell from "@/components/WizardShell";
import StepSchoolInfo from "@/components/wizard/StepSchoolInfo";
import StepColors from "@/components/wizard/StepColors";
import StepSchedule from "@/components/wizard/StepSchedule";
import StepCalendar from "@/components/wizard/StepCalendar";
import StepFeatures from "@/components/wizard/StepFeatures";
import StepReview from "@/components/wizard/StepReview";

const steps = [
  StepSchoolInfo,
  StepColors,
  StepSchedule,
  StepCalendar,
  StepFeatures,
  StepReview,
];

export default function SetupPage() {
  return <WizardShell steps={steps} />;
}
```

- [ ] **Step 1.3: Update `app/edit/page.tsx`**

Remove the `StepLunchWaves` import (line 9) and its entry in the `STEPS` constant (lines 47–55). After edit, the `STEPS` constant should read:

```tsx
const STEPS = [
  StepSchoolInfo,
  StepColors,
  StepSchedule,
  StepCalendar,
  StepFeatures,
  StepReview,
];
```

Leave everything else in `app/edit/page.tsx` alone.

- [ ] **Step 1.4: Update `lib/validation.ts`**

Two changes:

First, replace the `validateStep` switch (lines 7–16) with:

```tsx
export function validateStep(step: number, data: WizardFormData): string[] {
  switch (step) {
    case 0: return validateSchoolInfo(data);
    case 1: return validateColors(data);
    case 2: return validateSchedule(data);
    case 3: return validateCalendar(data);
    default: return [];
  }
}
```

Second, delete the entire `validateLunchWaves` function (lines 127–150). Leave `validateSchedule` untouched — it already reads `data.lunchWaves.enabled` and that stays correct since waves now live on the same step.

- [ ] **Step 1.5: Renumber `components/wizard/StepCalendar.tsx`**

Line 167: change

```tsx
<motion.p variants={headerItem} className={kickerCls} style={kickerFont}>step 05 / calendar</motion.p>
```

to

```tsx
<motion.p variants={headerItem} className={kickerCls} style={kickerFont}>step 04 / calendar</motion.p>
```

Then find the handwritten margin-note marker inside the right-rail `aside`. It's the child of a `span` with `fontFamily: "var(--font-caveat)", fontSize: 28` — currently renders the text `5`. Change it to `4`.

- [ ] **Step 1.6: Renumber `components/wizard/StepFeatures.tsx`**

Line 81: change `step 06 / features` → `step 05 / features`. Then change the right-rail handwritten `6` (inside the `font-caveat` span around line 151) → `5`.

- [ ] **Step 1.7: Renumber `components/wizard/StepReview.tsx`**

Line 115: change

```tsx
step 07 / review &amp; deploy
```

to

```tsx
step 06 / review &amp; deploy
```

StepReview has no right-rail margin-note number. Leave the existing lunch-waves summary section (lines 256–283) unchanged — it reads `data.lunchWaves.enabled` and `options` which are still populated by the data shape.

- [ ] **Step 1.8: Delete `components/wizard/StepLunchWaves.tsx`**

Delete the file entirely.

```bash
rm components/wizard/StepLunchWaves.tsx
```

- [ ] **Step 1.9: Run lint + build**

```bash
npm run lint && npm run build
```

Expected: both succeed. If TypeScript errors mention `StepLunchWaves`, trace back — something still imports it.

- [ ] **Step 1.10: Manual smoke check (pre-Setup-block)**

Start the dev server: `npm run dev`. Navigate to `/setup`. Expected behavior at this point:

- Wizard shows 6 steps in the progress strip.
- Step 3 kicker reads `step 03 / schedule`.
- Step 4 kicker reads `step 04 / calendar` (not 05).
- Step 5 kicker reads `step 05 / features`.
- Step 6 kicker reads `step 06 / review & deploy`.
- There is **no way to enable lunch waves** — this is expected. Step 3 renders in its non-wave layout (`Bell periods` / `After school`). This intermediate state is fixed by Task 2.

- [ ] **Step 1.11: Commit**

```bash
git add components/WizardShell.tsx app/setup/page.tsx app/edit/page.tsx lib/validation.ts components/wizard/StepCalendar.tsx components/wizard/StepFeatures.tsx components/wizard/StepReview.tsx
git rm components/wizard/StepLunchWaves.tsx
git commit -m "$(cat <<'EOF'
refactor: remove standalone lunch-waves step, renumber kickers

Wizard drops from 7 → 6 steps. StepLunchWaves is deleted; its responsibility
moves to StepSchedule in the next commit. validateLunchWaves is deleted since
validateSchedule already consults lunchWaves.enabled.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Add Setup block (day types + lunch-wave segmented picker) to Step 3

**Files:**
- Modify: `components/wizard/StepSchedule.tsx` (entire render + add new handlers)

Goal: Lift the existing day-type chip strip + weekday toggles + rename input into a visually-grouped "Setup" block, and add a lunch-wave segmented picker (`None · 2 · 3 · 4`, extending dynamically if existing data has >4 waves) plus inline wave-label inputs. The per-day-type period tables below stay identical in behavior but get a clearer header separator.

Data contract:

- Wave ids are **always** `wave-1..wave-N`, never user-editable.
- `default` is **always** `options[0]?.id ?? ""`, set automatically when the count changes.
- `enabled` is `true` iff `options.length > 0`.
- When the count drops, obsolete `bells[dayTypeId].lunchWaves[waveId]` entries are pruned.
- When the count rises, missing options are added with auto-generated labels `Wave K`.
- When a user renames a wave, the id does not change — only the label.

- [ ] **Step 2.1: Add wave-count handler and label handler inside `StepSchedule`**

Open `components/wizard/StepSchedule.tsx`. Inside the `StepSchedule` function body, after the existing `toggleWeekday` handler (around line 250) and before the `const activeBlock = …` line, add:

```tsx
// ── Lunch wave handlers (Setup block) ────────────────────────────────
function setWaveCount(n: number) {
  if (n === 0) {
    // Disable waves: prune per-day-type wave periods and clear options.
    const newBells: WizardFormData["schedule"]["bells"] = {};
    for (const [id, block] of Object.entries(bells)) {
      const { lunchWaves: _omit, ...rest } = block;
      void _omit;
      newBells[id] = { ...rest };
    }
    onChange({
      ...data,
      schedule: { ...data.schedule, bells: newBells },
      lunchWaves: { enabled: false, options: [], default: "" },
    });
    return;
  }

  // Enable/resize: keep existing labels by id, seed new ones as "Wave K".
  const existing = data.lunchWaves.options;
  const newOptions: { id: string; label: string }[] = [];
  for (let i = 0; i < n; i++) {
    const id = `wave-${i + 1}`;
    const prevLabel = existing.find((o) => o.id === id)?.label;
    newOptions.push({ id, label: prevLabel ?? `Wave ${i + 1}` });
  }

  // Prune obsolete per-day-type wave period arrays.
  const keepIds = new Set(newOptions.map((o) => o.id));
  const newBells: WizardFormData["schedule"]["bells"] = {};
  for (const [id, block] of Object.entries(bells)) {
    const prunedWaves: Record<string, Period[]> = {};
    if (block.lunchWaves) {
      for (const [waveId, periods] of Object.entries(block.lunchWaves)) {
        if (keepIds.has(waveId)) prunedWaves[waveId] = periods;
      }
    }
    newBells[id] = { ...block, lunchWaves: prunedWaves };
  }

  onChange({
    ...data,
    schedule: { ...data.schedule, bells: newBells },
    lunchWaves: { enabled: true, options: newOptions, default: newOptions[0].id },
  });
}

function setWaveLabel(waveId: string, label: string) {
  const newOptions = data.lunchWaves.options.map((o) =>
    o.id === waveId ? { ...o, label } : o,
  );
  onChange({ ...data, lunchWaves: { ...data.lunchWaves, options: newOptions } });
}

const currentWaveCount = data.lunchWaves.enabled ? data.lunchWaves.options.length : 0;
const waveChipValues = (() => {
  const base = [0, 2, 3, 4];
  if (currentWaveCount <= 4) return base;
  const extras: number[] = [];
  for (let k = 5; k <= currentWaveCount; k++) extras.push(k);
  return [...base, ...extras];
})();
```

- [ ] **Step 2.2: Restructure the render — wrap day-type UI in a labeled "Setup" block and insert the lunch-wave picker**

Find the existing render section in `StepSchedule.tsx` that starts after the header `motion.div` (around line 323). It currently renders, in order:

1. Day-type chip strip (`<div className="mt-10 flex flex-wrap items-center gap-2">`)
2. Active day-type detail panel (rename input + remove button + weekday toggles + period tables)

Restructure to:

1. **Setup block** — a single bordered/spaced container with two sub-sections: "Day types" (chip strip + active-day-type rename row + weekday toggles) and "Lunch waves" (segmented count picker + optional label inputs).
2. **Divider** — dashed horizontal rule with a "Bell periods for: {active day type label}" kicker.
3. **Period tables** — the existing `<>{!lunchWavesEnabled ? … : …}</>` block, unchanged.

Replace the render content below the header with the following JSX. The outer grid wrapper (with the right-rail `aside`) stays as-is; we're replacing only what goes in the main column (`<div>…</div>` child inside `<div className="relative grid …">`).

```tsx
      <div>
        {/* Header — unchanged */}
        <motion.div
          initial={reduce ? false : "hidden"}
          animate="visible"
          variants={headerContainer}
        >
          <motion.p variants={headerItem} className={kickerCls} style={kickerFont}>step 03 / schedule</motion.p>
          <motion.h1 variants={headerItem} className={headlineCls} style={headlineFont}>
            Build the <span style={italicAccent}>schedule.</span>
          </motion.h1>
          <motion.p variants={headerItem} className={subcopyCls} style={subcopyFont}>
            First, define your day types and lunch rotations. Then fill in bell periods for each day type.
          </motion.p>
        </motion.div>

        {/* ── Setup block ──────────────────────────────────────────────── */}
        <div className="mt-10 border-2 border-[color:var(--color-ink)] bg-[color:var(--color-paper)] p-6">
          <p
            className="mb-5 text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]"
            style={labelFont}
          >
            Setup
          </p>

          {/* Day types sub-section */}
          <div>
            <p className={labelCls} style={labelFont}>Day types</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {dayTypes.map((dt, i) => {
                const isActive = i === activeDayTypeIndex;
                return (
                  <button
                    key={dt.id}
                    type="button"
                    onClick={() => setActiveDayTypeIndex(i)}
                    className={`cursor-pointer border-[1.5px] border-[color:var(--color-ink)] px-3 py-1.5 text-[12px] uppercase tracking-[0.14em] transition-colors ${
                      isActive
                        ? "bg-[color:var(--color-ink)] text-[color:var(--color-paper)]"
                        : "bg-[color:var(--color-paper)] text-[color:var(--color-ink)] hover:bg-[color:var(--color-ink)]/5"
                    }`}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {dt.label || "Untitled"}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={addDayType}
                className="cursor-pointer border-[1.5px] border-dashed border-[color:var(--color-ink)] px-3 py-1.5 text-[12px] uppercase tracking-[0.14em] text-[color:var(--color-ink)] hover:bg-[color:var(--color-ink)]/5"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                + add day type
              </button>
            </div>

            {/* Active day-type rename + remove + weekdays */}
            {activeDayType && (
              <div className="mt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <input
                    className="flex-1 border-0 border-b-2 border-[color:var(--color-ink)] bg-transparent py-1.5 text-[18px] text-[color:var(--color-ink)] placeholder-[color:var(--color-ink-faded)]/60 focus:border-[color:var(--color-marker)] focus:outline-none"
                    style={{ fontFamily: "var(--font-display)" }}
                    placeholder="Day type name"
                    aria-label="Day type name"
                    value={activeDayType.label}
                    onChange={(e) => updateDayTypeLabel(e.target.value)}
                  />
                  {dayTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDayType(activeDayTypeIndex)}
                      className="shrink-0 cursor-pointer text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faded)] underline underline-offset-4 hover:text-[color:var(--color-marker)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      remove day type
                    </button>
                  )}
                </div>

                <div className="mt-4">
                  <p className={labelCls} style={labelFont}>Weekdays</p>
                  <div className="mt-2 flex gap-2">
                    {WEEKDAYS.map((w) => (
                      <button
                        key={w.value}
                        type="button"
                        onClick={() => toggleWeekday(w.value)}
                        aria-pressed={activeDayType.weekdays.includes(w.value)}
                        className="flex h-8 w-8 cursor-pointer items-center justify-center border-[1.5px] border-[color:var(--color-ink)] text-[11px] font-semibold transition-colors"
                        style={{
                          background: activeDayType.weekdays.includes(w.value)
                            ? "var(--highlight)"
                            : "transparent",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lunch waves sub-section */}
          <div className="mt-8 border-t border-dashed border-[color:var(--color-hairline)] pt-6">
            <p className={labelCls} style={labelFont}>Lunch waves</p>
            <p
              className="mt-1 text-[13px] italic text-[color:var(--color-ink-soft)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Some schools split lunch across multiple rotations. Pick how many, or leave as None.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {waveChipValues.map((n) => {
                const isActive = currentWaveCount === n;
                const label = n === 0 ? "None" : String(n);
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setWaveCount(n)}
                    aria-pressed={isActive}
                    className={`cursor-pointer border-[1.5px] border-[color:var(--color-ink)] px-3 py-1.5 text-[12px] uppercase tracking-[0.14em] transition-colors ${
                      isActive
                        ? "bg-[color:var(--color-ink)] text-[color:var(--color-paper)]"
                        : "bg-[color:var(--color-paper)] text-[color:var(--color-ink)] hover:bg-[color:var(--color-ink)]/5"
                    }`}
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {currentWaveCount > 0 && (
              <div className="mt-5 space-y-3">
                {data.lunchWaves.options.map((wave) => (
                  <div
                    key={wave.id}
                    className="flex items-center gap-3 border-l-[2px] border-[color:var(--color-ink)] pl-4"
                  >
                    <input
                      aria-label={`${wave.id} label`}
                      className="flex-1 border-0 border-b-[1.5px] border-[color:var(--color-ink)] bg-transparent py-1.5 text-[16px] text-[color:var(--color-ink)] focus:border-[color:var(--color-marker)] focus:outline-none"
                      style={{ fontFamily: "var(--font-display)" }}
                      value={wave.label}
                      placeholder="Wave name"
                      onChange={(e) => setWaveLabel(wave.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Bell periods divider ──────────────────────────────────────── */}
        {activeDayType && (
          <div className="mt-10">
            <p
              className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink)]"
              style={labelFont}
            >
              Bell periods — {activeDayType.label || "Untitled"}
            </p>
          </div>
        )}

        {/* ── Period tables (unchanged behavior) ────────────────────────── */}
        {activeDayType && (
          <div>
            {!lunchWavesEnabled ? (
              <>
                <PeriodTable
                  sectionLabel="Bell periods"
                  periods={sharedPeriods}
                  onAdd={addSharedPeriod}
                  onRemove={removeSharedPeriod}
                  onUpdate={updateSharedPeriod}
                />
                <div className="mt-10 border-t border-dashed border-[color:var(--color-hairline)] pt-8">
                  <PeriodTable
                    sectionLabel="After school"
                    description="Events after the last bell — club meetings, sports practice, etc. Optional."
                    periods={afterPeriods}
                    onAdd={addAfterPeriod}
                    onRemove={removeAfterPeriod}
                    onUpdate={updateAfterPeriod}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-0">
                <PeriodTable
                  sectionLabel="Before lunch"
                  description="Periods everyone has at the same time, before lunch starts."
                  periods={sharedPeriods}
                  onAdd={addSharedPeriod}
                  onRemove={removeSharedPeriod}
                  onUpdate={updateSharedPeriod}
                />
                {waveOptions.map((wave) => (
                  <div
                    key={wave.id}
                    className="mt-8 border-t border-dashed border-[color:var(--color-hairline)] pt-8"
                  >
                    <PeriodTable
                      sectionLabel={`Lunch wave: ${wave.label || wave.id}`}
                      description="Periods for students in this wave during the lunch split."
                      periods={getWavePeriods(wave.id)}
                      onAdd={() => addWavePeriod(wave.id)}
                      onRemove={(i) => removeWavePeriod(wave.id, i)}
                      onUpdate={(i, patch) => updateWavePeriod(wave.id, i, patch)}
                    />
                  </div>
                ))}
                <div className="mt-8 border-t border-dashed border-[color:var(--color-hairline)] pt-8">
                  <PeriodTable
                    sectionLabel="After lunch"
                    description="Periods everyone has at the same time, after lunch ends."
                    periods={afterPeriods}
                    onAdd={addAfterPeriod}
                    onRemove={removeAfterPeriod}
                    onUpdate={updateAfterPeriod}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
```

**Important**: the `<aside>` right-rail block below this (lines ~467–489 in current file) is kept untouched — same "Regular day covers most weeks…" margin note, same handwritten `3`. The outer grid wrapper (`<div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">`) stays.

- [ ] **Step 2.3: Update right-rail copy to mention lunch waves**

In `components/wizard/StepSchedule.tsx`, find the right-rail margin note (the `<p>` inside `<aside>`, around line 486). Change the copy to acknowledge that both day types and waves live in the Setup block now:

```tsx
<p
  className="text-[15px] italic leading-[1.5] text-[color:var(--color-ink-soft)]"
  style={{ fontFamily: "var(--font-display)" }}
>
  Set up day types and lunch waves first — then fill in bell periods for each. Most schools just need one day type and no waves.
</p>
```

- [ ] **Step 2.4: Run lint + build**

```bash
npm run lint && npm run build
```

Expected: both succeed. If TypeScript complains about `Period` type not found inside the new `setWaveCount` handler, note that `Period` is already defined at line 18 of `StepSchedule.tsx` — if the handler is inserted in the correct scope (inside the `StepSchedule` function body), it resolves.

- [ ] **Step 2.5: Manual browser walkthrough — fresh setup flow**

Start `npm run dev`, navigate to `/setup`, and verify:

1. Step 3 header still reads `step 03 / schedule`.
2. A "Setup" box appears below the header with two sections: **Day types** (chip strip + rename + weekday toggles) and **Lunch waves** (segmented chips).
3. The lunch-wave chips read `None · 2 · 3 · 4`. `None` is active by default.
4. Below the Setup box there's a `Bell periods — Regular Day` divider, then the `Bell periods` + `After school` tables (non-wave layout).
5. Click `2` on the wave picker. Two inline inputs appear: `Wave 1`, `Wave 2`. The period tables below reflow into `Before lunch` / `Lunch wave: Wave 1` / `Lunch wave: Wave 2` / `After lunch`.
6. Rename `Wave 1` to `Early`. The `Lunch wave: Early` table label updates live.
7. Click `3` on the wave picker. A third inline input appears (`Wave 3`), and a third `Lunch wave: Wave 3` table appears below. Existing `Early` label is preserved.
8. Click `2` again. The third wave and its period table disappear. Any periods you'd added in `Wave 3` are gone (pruned — this is the documented behavior).
9. Click `None`. Waves disable entirely. Period tables revert to `Bell periods` / `After school`.
10. Add a second day type `Half Day`. The chip strip updates. Click into it — separate period tables; wave picker state is shared with `Regular Day` (global).
11. Advance to Step 4 (Calendar). Kicker reads `step 04 / calendar`.
12. Step 5 Features reads `step 05 / features`. Step 6 Review reads `step 06 / review & deploy`.

- [ ] **Step 2.6: Manual browser walkthrough — edit flow with existing waves**

To verify edit-mode rehydration doesn't break existing schools: from the browser, open an existing school's edit URL (via a magic link from your inbox, or via the session cookie from a recent login). Verify:

1. Step 3 loads with the correct wave count already selected on the segmented picker.
2. Existing wave labels (`Wave 1`, `Wave 2`, or custom names) are populated in the inline inputs.
3. Existing per-wave period tables are populated correctly in the period tables below.
4. Changing the wave count doesn't clobber labels for waves that remain.
5. Hit Redeploy and confirm the deployed site still builds — the `school.config.ts` shape is unchanged.

If you don't have an existing school handy, create one via `/setup` with 2 waves + some periods + Deploy. Wait for the magic link, then use it to re-enter edit mode, and confirm the above.

- [ ] **Step 2.7: Commit**

```bash
git add components/wizard/StepSchedule.tsx
git commit -m "$(cat <<'EOF'
feat: consolidate lunch-wave setup into Step 3 schedule step

Adds a "Setup" block above the period tables containing day-type configuration
and a segmented lunch-wave picker (None · 2 · 3 · 4, extending dynamically
for existing data with >4 waves). Wave ids and default are auto-managed —
users only rename labels. Changing the wave count prunes obsolete per-day-type
wave period arrays.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review

**Spec coverage:**
- Kill Step 4 → Task 1.2, 1.3, 1.8 ✓
- Merge wave setup into Step 3 → Task 2.2 ✓
- Drop user-editable id field → Task 2.2 (no id input rendered) ✓
- Drop default radio → Task 2.1 (`default` auto-set in `setWaveCount`) ✓
- Segmented `None · 2 · 3 · 4` control → Task 2.1 + 2.2 ✓
- Dynamic extension for existing >4 waves → Task 2.1 (`waveChipValues`) ✓
- Persisted shape unchanged → verified: `WizardFormData.lunchWaves` schema in `lib/types.ts` untouched; `config-generator.ts` untouched ✓
- Downstream step numbering renumbered → Task 1.5, 1.6, 1.7 ✓

**Placeholder scan:** No TBDs, no "add appropriate error handling", code blocks included for every code change.

**Type consistency:** `setWaveCount` / `setWaveLabel` / `currentWaveCount` / `waveChipValues` used consistently between Task 2.1 (definitions) and Task 2.2 (consumers). `Period` type is already defined in `StepSchedule.tsx`. `WizardFormData["schedule"]["bells"]` is referenced consistently.

**Intermediate state:** After Task 1 commit, the wizard compiles and runs but has no way to enable lunch waves. This is explicit in Step 1.10. Task 2 fixes it. If this branch were merged after Task 1 only, new schools couldn't configure waves — but the branch shouldn't be merged between tasks.
