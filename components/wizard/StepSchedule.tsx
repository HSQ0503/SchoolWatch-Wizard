"use client";

import React, { useState } from "react";
import type { WizardFormData } from "@/lib/types";
import { motion, useReducedMotion, type Variants } from "motion/react";

const headerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const headerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

type StepProps = { data: WizardFormData; onChange: (data: WizardFormData) => void };

type Period = { name: string; start: string; end: string };

// Zine step-body primitives (shared visual language used by all 7 steps).
const kickerCls =
  "mb-3 text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink-faded)]";
const headlineCls =
  "font-[900] leading-[0.95] tracking-[-0.02em] text-[color:var(--color-ink)]";
const subcopyCls =
  "mt-4 text-[15px] leading-[1.55] text-[color:var(--color-ink-soft)]";
const labelCls =
  "mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-faded)]";

const kickerFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };
const headlineFont: React.CSSProperties = {
  fontFamily: "var(--font-archivo)",
  fontSize: "clamp(32px, 4.2vw, 52px)",
};
const italicAccent: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontStyle: "italic",
  fontWeight: 400,
  letterSpacing: "-0.01em",
};
const subcopyFont: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  maxWidth: "52ch",
};
const labelFont: React.CSSProperties = { fontFamily: "var(--font-mono)" };

// Mon–Fri only (values 1–5 matching existing weekday convention)
const WEEKDAYS = [
  { label: "M", value: 1 },
  { label: "T", value: 2 },
  { label: "W", value: 3 },
  { label: "T", value: 4 },
  { label: "F", value: 5 },
];

function genId() {
  return `dt-${Math.random().toString(36).slice(2, 8)}`;
}

// Smart default: auto-increment period name and time based on the last period's end
function nextPeriodDefaults(periods: Period[], fallbackStart = "08:00"): Period {
  const count = periods.length;
  const name = `${count + 1}${count === 0 ? "st" : count === 1 ? "nd" : count === 2 ? "rd" : "th"} Period`;
  if (count === 0) return { name, start: fallbackStart, end: "" };
  const lastEnd = periods[count - 1].end;
  if (/^\d{2}:\d{2}$/.test(lastEnd)) {
    const [h, m] = lastEnd.split(":").map(Number);
    const startMin = m + 5;
    const startH = h + Math.floor(startMin / 60);
    const sM = startMin % 60;
    const endMin = sM + 50;
    const endH = startH + Math.floor(endMin / 60);
    const eM = endMin % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return { name, start: `${pad(startH)}:${pad(sM)}`, end: `${pad(endH)}:${pad(eM)}` };
  }
  return { name, start: "", end: "" };
}

function lastEnd(periods: Period[]): string | null {
  if (periods.length === 0) return null;
  const end = periods[periods.length - 1].end;
  return /^\d{2}:\d{2}$/.test(end) ? end : null;
}

type PeriodTableProps = {
  periods: Period[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, patch: Partial<Period>) => void;
  addLabel?: string;
  sectionLabel: string;
  description?: string;
};

function PeriodTable({
  periods,
  onAdd,
  onRemove,
  onUpdate,
  addLabel = "+ add period",
  sectionLabel,
  description,
}: PeriodTableProps) {
  return (
    <div className="mt-8">
      <p className={labelCls} style={labelFont}>{sectionLabel}</p>
      {description && (
        <p
          className="mb-3 text-[13px] italic text-[color:var(--color-ink-soft)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {description}
        </p>
      )}
      <div className="mt-3">
        {/* Header row */}
        <div className="flex items-center gap-4 border-b-[1.5px] border-[color:var(--color-ink)] pb-2">
          <span
            className="flex-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-faded)]"
            style={labelFont}
          >
            Period
          </span>
          <span
            className="w-28 text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-faded)]"
            style={labelFont}
          >
            Start
          </span>
          <span
            className="w-28 text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-faded)]"
            style={labelFont}
          >
            End
          </span>
          <span className="w-20" />
        </div>

        {periods.length === 0 && (
          <p
            className="py-4 text-[13px] italic text-[color:var(--color-ink-soft)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            No periods yet.
          </p>
        )}

        {periods.map((b, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-dashed border-[color:var(--color-hairline)] py-2"
          >
            <input
              className="flex-1 border-0 bg-transparent text-[16px] text-[color:var(--color-ink)] focus:outline-none"
              style={{ fontFamily: "var(--font-display)" }}
              value={b.name}
              placeholder="Period name"
              aria-label="Period name"
              onChange={(e) => onUpdate(i, { name: e.target.value })}
            />
            <input
              type="time"
              className="w-28 border-0 bg-transparent text-[15px] text-[color:var(--color-ink)] focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
              value={b.start}
              aria-label="Start time"
              onChange={(e) => onUpdate(i, { start: e.target.value })}
            />
            <input
              type="time"
              className="w-28 border-0 bg-transparent text-[15px] text-[color:var(--color-ink)] focus:outline-none [color-scheme:light] dark:[color-scheme:dark]"
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}
              value={b.end}
              aria-label="End time"
              onChange={(e) => onUpdate(i, { end: e.target.value })}
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label={`Remove period ${i + 1}`}
              className="w-20 cursor-pointer text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faded)] underline underline-offset-4 hover:text-[color:var(--color-marker)]"
              style={labelFont}
            >
              remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={onAdd}
          className="mt-3 cursor-pointer text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink)] underline underline-offset-4 hover:text-[color:var(--color-marker)]"
          style={labelFont}
        >
          {addLabel}
        </button>
      </div>
    </div>
  );
}

export default function StepSchedule({ data, onChange }: StepProps) {
  const reduce = useReducedMotion();
  // Track active day type by index (all handlers below are index-based)
  const [activeDayTypeIndex, setActiveDayTypeIndex] = useState(0);

  const { dayTypes, bells } = data.schedule;
  const activeDayType = dayTypes[activeDayTypeIndex] ?? dayTypes[0];
  const lunchWavesEnabled = data.lunchWaves.enabled && data.lunchWaves.options.length > 0;
  const waveOptions = data.lunchWaves.options;

  function updateSchedule(patch: Partial<WizardFormData["schedule"]>) {
    onChange({ ...data, schedule: { ...data.schedule, ...patch } });
  }

  function addDayType() {
    const id = genId();
    const newDayType = { id, label: "New Day Type", weekdays: [] as number[] };
    const newBells = { ...bells, [id]: { shared: [], after: [] } };
    const newDayTypes = [...dayTypes, newDayType];
    updateSchedule({ dayTypes: newDayTypes, bells: newBells });
    setActiveDayTypeIndex(newDayTypes.length - 1);
  }

  function removeDayType(index: number) {
    if (dayTypes.length <= 1) return;
    const id = dayTypes[index].id;
    const newDayTypes = dayTypes.filter((_, i) => i !== index);
    const newBells = { ...bells };
    delete newBells[id];
    updateSchedule({ dayTypes: newDayTypes, bells: newBells });
    setActiveDayTypeIndex(Math.min(activeDayTypeIndex, newDayTypes.length - 1));
  }

  function updateDayTypeLabel(label: string) {
    const newDayTypes = dayTypes.map((dt, i) =>
      i === activeDayTypeIndex ? { ...dt, label } : dt
    );
    updateSchedule({ dayTypes: newDayTypes });
  }

  function toggleWeekday(day: number) {
    const current = activeDayType.weekdays;
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    const newDayTypes = dayTypes.map((dt, i) =>
      i === activeDayTypeIndex ? { ...dt, weekdays: next } : dt
    );
    updateSchedule({ dayTypes: newDayTypes });
  }

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

  // Current bells block for the active day type
  const activeBlock = bells[activeDayType?.id] ?? { shared: [], after: [] };
  const sharedPeriods = activeBlock.shared;
  const afterPeriods = activeBlock.after ?? [];
  const waveBells = activeBlock.lunchWaves ?? {};

  function updateBlock(patch: Partial<typeof activeBlock>) {
    const id = activeDayType.id;
    const existing = bells[id] ?? { shared: [], after: [] };
    updateSchedule({ bells: { ...bells, [id]: { ...existing, ...patch } } });
  }

  // Shared period handlers
  function addSharedPeriod() {
    updateBlock({ shared: [...sharedPeriods, nextPeriodDefaults(sharedPeriods)] });
  }
  function removeSharedPeriod(i: number) {
    updateBlock({ shared: sharedPeriods.filter((_, idx) => idx !== i) });
  }
  function updateSharedPeriod(i: number, patch: Partial<Period>) {
    updateBlock({ shared: sharedPeriods.map((p, idx) => (idx === i ? { ...p, ...patch } : p)) });
  }

  // After period handlers
  function addAfterPeriod() {
    const fallback = lastEnd(sharedPeriods) ?? "12:00";
    updateBlock({ after: [...afterPeriods, nextPeriodDefaults(afterPeriods, fallback)] });
  }
  function removeAfterPeriod(i: number) {
    updateBlock({ after: afterPeriods.filter((_, idx) => idx !== i) });
  }
  function updateAfterPeriod(i: number, patch: Partial<Period>) {
    updateBlock({ after: afterPeriods.map((p, idx) => (idx === i ? { ...p, ...patch } : p)) });
  }

  // Per-wave period handlers
  function getWavePeriods(waveId: string): Period[] {
    return waveBells[waveId] ?? [];
  }
  function setWavePeriods(waveId: string, periods: Period[]) {
    updateBlock({ lunchWaves: { ...waveBells, [waveId]: periods } });
  }
  function addWavePeriod(waveId: string) {
    const existing = getWavePeriods(waveId);
    const fallback = lastEnd(sharedPeriods) ?? "11:00";
    setWavePeriods(waveId, [...existing, nextPeriodDefaults(existing, fallback)]);
  }
  function removeWavePeriod(waveId: string, i: number) {
    setWavePeriods(waveId, getWavePeriods(waveId).filter((_, idx) => idx !== i));
  }
  function updateWavePeriod(waveId: string, i: number, patch: Partial<Period>) {
    setWavePeriods(waveId, getWavePeriods(waveId).map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }

  return (
    <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div>
        {/* Header */}
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
                    className={`cursor-pointer border-[1.5px] border-[color:var(--color-ink)] px-3 py-1.5 text-[12px] uppercase tracking-[0.14em] text-[color:var(--color-ink)] transition-colors ${
                      isActive ? "" : "bg-[color:var(--color-paper)] hover:bg-[color:var(--color-ink)]/5"
                    }`}
                    style={{
                      fontFamily: "var(--font-mono)",
                      background: isActive ? "var(--highlight)" : undefined,
                    }}
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

      {/* Right-rail margin note */}
      <aside className="order-first lg:order-last lg:pt-24" aria-label="Tip">
        <div className="relative border-l-[3px] border-[color:var(--color-ink)] pl-5">
          <span
            aria-hidden="true"
            className="absolute -left-8 -top-1 leading-none"
            style={{
              fontFamily: "var(--font-caveat)",
              fontWeight: 700,
              fontSize: 28,
              color: "var(--marker)",
              transform: "rotate(-6deg)",
            }}
          >
            3
          </span>
          <p
            className="text-[15px] italic leading-[1.5] text-[color:var(--color-ink-soft)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Set up day types and lunch waves first — then fill in bell periods for each. Most schools just need one day type and no waves.
          </p>
        </div>
      </aside>
    </div>
  );
}
