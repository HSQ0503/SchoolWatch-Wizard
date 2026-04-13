"use client";

import React, { useState } from "react";
import type { WizardFormData } from "@/lib/types";

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
        <p className={kickerCls} style={kickerFont}>step 03 / schedule</p>
        <h1 className={headlineCls} style={headlineFont}>
          Build the <span style={italicAccent}>schedule.</span>
        </h1>
        <p className={subcopyCls} style={subcopyFont}>
          Set up day types (regular, early dismissal, half day, etc.) and the bell periods for each. You can edit any of this later.
        </p>

        {/* Day-type chip strip */}
        <div className="mt-10 flex flex-wrap items-center gap-2">
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

        {/* Active day type detail panel */}
        {activeDayType && (
          <div className="mt-8">
            {/* Rename + remove row */}
            <div className="flex items-baseline justify-between gap-4">
              <input
                className="flex-1 border-0 border-b-2 border-[color:var(--color-ink)] bg-transparent py-1.5 text-[20px] text-[color:var(--color-ink)] placeholder-[color:var(--color-ink-faded)]/60 focus:border-[color:var(--color-marker)] focus:outline-none"
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

            {/* Weekday toggles */}
            <div className="mt-6">
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

            {/* Bell periods / lunch wave split */}
            {!lunchWavesEnabled ? (
              <>
                <PeriodTable
                  sectionLabel="Bell periods"
                  periods={sharedPeriods}
                  onAdd={addSharedPeriod}
                  onRemove={removeSharedPeriod}
                  onUpdate={updateSharedPeriod}
                />
                {/* After-school events (non-wave path) */}
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
            Regular day covers most weeks. Add a second day type only if your school has recurring variations (early dismissals, pep rally schedules, testing weeks, etc.).
          </p>
        </div>
      </aside>
    </div>
  );
}
