"use client";

import React, { useState } from "react";
import type { WizardFormData } from "@/lib/types";

type StepProps = { data: WizardFormData; onChange: (data: WizardFormData) => void };

type Period = { name: string; start: string; end: string };

const inputClass =
  "w-full rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] px-3 py-2 text-[13px] text-[color:var(--color-foreground)] placeholder-[color:var(--color-text-faded)] transition-colors focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-accent)]";

const labelClass =
  "block text-xs text-[color:var(--color-text-faded)] mb-1.5";

const fontMono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

const timeInputClass =
  "w-[7.5rem] shrink-0 rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] px-3 py-2 text-[13px] text-[color:var(--color-foreground)] focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-accent)] [color-scheme:dark]";

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

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  );
}

type PeriodListProps = {
  periods: Period[];
  label: string;
  description?: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, patch: Partial<Period>) => void;
  addLabel?: string;
  emptyMessage?: string;
};

function PeriodList({
  periods,
  label,
  description,
  onAdd,
  onRemove,
  onUpdate,
  addLabel = "+ Add Period",
  emptyMessage = "No periods yet. Click below to add one.",
}: PeriodListProps) {
  return (
    <div style={fontMono}>
      <label className="mb-1 block text-xs text-[color:var(--color-text-faded)] uppercase tracking-[0.1em]">
        {label}
      </label>
      {description && (
        <p className="mb-2 text-[11px] text-[color:var(--color-text-faded)]">{description}</p>
      )}
      <div className="space-y-2">
        {periods.length === 0 && (
          <p className="text-[12px] italic text-[color:var(--color-text-faded)]">
            {emptyMessage}
          </p>
        )}
        {periods.map((period, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={inputClass}
              type="text"
              placeholder="period name"
              value={period.name}
              onChange={(e) => onUpdate(i, { name: e.target.value })}
            />
            <input
              className={timeInputClass}
              type="time"
              value={period.start}
              onChange={(e) => onUpdate(i, { start: e.target.value })}
              aria-label="Start time"
            />
            <input
              className={timeInputClass}
              type="time"
              value={period.end}
              onChange={(e) => onUpdate(i, { end: e.target.value })}
              aria-label="End time"
            />
            <button
              onClick={() => onRemove(i)}
              aria-label={`Remove period ${i + 1}`}
              className="cursor-pointer shrink-0 rounded-[3px] p-1.5 text-[color:var(--color-text-faded)] hover:bg-[color:var(--color-bg-input)] hover:text-[color:var(--color-accent)]"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={onAdd}
        className="mt-3 cursor-pointer text-xs uppercase tracking-[0.12em] text-[color:var(--color-accent)] hover:brightness-110"
      >
        [+] {addLabel.replace(/^\+ /, "")}
      </button>
    </div>
  );
}

export default function StepSchedule({ data, onChange }: StepProps) {
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
    <div className="space-y-6" style={fontMono}>
      <div className="flex items-baseline gap-3.5 border-b border-dashed border-[color:var(--color-line-strong)] pb-4">
        <h2 className="text-[22px] font-bold text-[color:var(--color-foreground)]">
          <span className="text-[color:var(--color-text-faded)] font-normal">{"// "}</span>
          schedule
        </h2>
        <span className="text-[12px] text-[color:var(--color-text-faded)]">
          — day types and their bell times.{" "}
          {lunchWavesEnabled ? "lunch waves enabled." : "rotating schedules handled."}
        </span>
      </div>

      {/* Day type cards */}
      <div>
        <div className="mb-2.5 text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-text-faded)]">
          day types
        </div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {dayTypes.map((dt, i) => {
            const selected = i === activeDayTypeIndex;
            return (
              <button
                key={dt.id}
                onClick={() => setActiveDayTypeIndex(i)}
                className={`cursor-pointer rounded-[3px] border p-3 text-left transition-colors ${
                  selected
                    ? "border-[color:var(--color-accent)] shadow-[inset_0_0_0_1px_var(--color-accent)]"
                    : "border-[color:var(--color-line-strong)]"
                } bg-[color:var(--color-bg-input)]`}
              >
                <div className="text-[10px] uppercase tracking-[0.1em] text-[color:var(--color-text-faded)]">
                  type_{(i + 1).toString().padStart(2, "0")}
                </div>
                <div className="mt-1 text-sm font-bold text-[color:var(--color-foreground)]">
                  {dt.label || "Untitled"}
                </div>
                <div className="mt-1.5 text-[10px] text-[color:var(--color-text-faded)]">
                  weekdays: {dt.weekdays.length === 0 ? "—" : dt.weekdays.map((d) => ["", "mon", "tue", "wed", "thu", "fri"][d]).join(" ")}
                </div>
              </button>
            );
          })}
        </div>
        <button
          onClick={addDayType}
          className="mt-3 cursor-pointer text-xs uppercase tracking-[0.12em] text-[color:var(--color-accent)] hover:brightness-110"
        >
          [+] add day type
        </button>
      </div>

      {activeDayType && (
        <div className="space-y-5 rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] p-5">
          <div className="grid grid-cols-[180px_1fr] items-center gap-4">
            <div className={labelClass}>label</div>
            <input
              className={inputClass}
              type="text"
              placeholder="Regular Day"
              value={activeDayType.label}
              onChange={(e) => updateDayTypeLabel(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-[180px_1fr] items-center gap-4">
            <div className={labelClass}>weekdays</div>
            <div className="flex gap-2">
              {WEEKDAYS.map(({ label, value }) => {
                const active = activeDayType.weekdays.includes(value);
                return (
                  <button
                    key={value}
                    onClick={() => toggleWeekday(value)}
                    aria-pressed={active}
                    className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-[3px] border text-xs ${
                      active
                        ? "border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-black font-bold"
                        : "border-[color:var(--color-line-strong)] text-[color:var(--color-text-faded)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-foreground)]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {!lunchWavesEnabled ? (
            <PeriodList
              periods={sharedPeriods}
              label="periods"
              onAdd={addSharedPeriod}
              onRemove={removeSharedPeriod}
              onUpdate={updateSharedPeriod}
              addLabel="add period"
            />
          ) : (
            <div className="space-y-5">
              <PeriodList
                periods={sharedPeriods}
                label="before lunch"
                description="Periods everyone has at the same time, before lunch starts."
                onAdd={addSharedPeriod}
                onRemove={removeSharedPeriod}
                onUpdate={updateSharedPeriod}
                addLabel="add period"
                emptyMessage="no before-lunch periods yet."
              />
              {waveOptions.map((wave) => (
                <div
                  key={wave.id}
                  className="rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-background)] p-4"
                >
                  <PeriodList
                    periods={getWavePeriods(wave.id)}
                    label={`lunch wave: ${wave.label || wave.id}`}
                    description="Periods for students in this wave during the lunch split."
                    onAdd={() => addWavePeriod(wave.id)}
                    onRemove={(i) => removeWavePeriod(wave.id, i)}
                    onUpdate={(i, patch) => updateWavePeriod(wave.id, i, patch)}
                    addLabel="add period"
                    emptyMessage="no periods for this wave yet."
                  />
                </div>
              ))}
              <PeriodList
                periods={afterPeriods}
                label="after lunch"
                description="Periods everyone has at the same time, after lunch ends."
                onAdd={addAfterPeriod}
                onRemove={removeAfterPeriod}
                onUpdate={updateAfterPeriod}
                addLabel="add period"
                emptyMessage="no after-lunch periods yet."
              />
            </div>
          )}

          {dayTypes.length > 1 && (
            <div className="border-t border-[color:var(--color-line)] pt-3">
              <button
                onClick={() => removeDayType(activeDayTypeIndex)}
                className="cursor-pointer text-xs text-[color:var(--color-accent)]/80 underline-offset-2 hover:text-[color:var(--color-accent)] hover:underline"
              >
                remove this day type
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function lastEnd(periods: Period[]): string | null {
  if (periods.length === 0) return null;
  const end = periods[periods.length - 1].end;
  return /^\d{2}:\d{2}$/.test(end) ? end : null;
}
