"use client";

import { useState } from "react";
import type { WizardFormData } from "@/lib/types";

type StepProps = { data: WizardFormData; onChange: (data: WizardFormData) => void };

type Period = { name: string; start: string; end: string };

const inputClass =
  "w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors duration-150";

const timeInputClass =
  "w-[7.5rem] shrink-0 rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors duration-150";

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
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      {description && (
        <p className="text-xs text-gray-500 mb-2">{description}</p>
      )}
      <div className="space-y-2">
        {periods.length === 0 && (
          <p className="text-sm text-gray-500 italic">{emptyMessage}</p>
        )}
        {periods.map((period, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={inputClass}
              type="text"
              placeholder="Period name"
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
              className="cursor-pointer shrink-0 rounded-lg p-2 text-gray-600 transition-colors duration-150 hover:bg-white/5 hover:text-red-400"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={onAdd}
        className="mt-3 cursor-pointer rounded-lg border border-dashed border-white/20 px-4 py-2 text-sm text-gray-500 transition-colors duration-150 hover:border-white/30 hover:text-gray-300"
      >
        {addLabel}
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Bell Schedule</h2>
        <p className="mt-1 text-sm text-gray-400">
          {lunchWavesEnabled
            ? "Define periods before lunch, per-wave lunch periods, and periods after lunch."
            : "Define day types (e.g. Regular, Early Release) and their periods."}
        </p>
      </div>

      {/* Day type tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {dayTypes.map((dt, i) => (
          <button
            key={dt.id}
            onClick={() => setActiveDayTypeIndex(i)}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 ${
              i === activeDayTypeIndex
                ? "bg-white text-black"
                : "border border-white/20 text-gray-400 hover:text-white hover:border-white/40"
            }`}
          >
            {dt.label || "Untitled"}
          </button>
        ))}
        <button
          onClick={addDayType}
          className="cursor-pointer rounded-lg border border-dashed border-white/20 px-4 py-2 text-sm text-gray-500 transition-colors duration-150 hover:border-white/30 hover:text-gray-300"
        >
          + Add Day Type
        </button>
      </div>

      {activeDayType && (
        <div className="space-y-5 rounded-xl border border-white/10 bg-white/5 p-5">
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Day Type Label</label>
            <input
              className={inputClass}
              type="text"
              placeholder="e.g. Regular Day"
              value={activeDayType.label}
              onChange={(e) => updateDayTypeLabel(e.target.value)}
            />
          </div>

          {/* Weekday toggles */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Active Weekdays</label>
            <div className="flex gap-2">
              {WEEKDAYS.map(({ label, value }) => {
                const active = activeDayType.weekdays.includes(value);
                return (
                  <button
                    key={value}
                    onClick={() => toggleWeekday(value)}
                    aria-pressed={active}
                    className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-sm font-medium transition-colors duration-150 ${
                      active
                        ? "bg-white text-black"
                        : "border border-white/20 text-gray-500 hover:text-white hover:border-white/40"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Periods — layout depends on lunch waves */}
          {!lunchWavesEnabled ? (
            <PeriodList
              periods={sharedPeriods}
              label="Periods"
              onAdd={addSharedPeriod}
              onRemove={removeSharedPeriod}
              onUpdate={updateSharedPeriod}
            />
          ) : (
            <div className="space-y-5">
              <PeriodList
                periods={sharedPeriods}
                label="Before Lunch"
                description="Periods everyone has at the same time, before lunch starts."
                onAdd={addSharedPeriod}
                onRemove={removeSharedPeriod}
                onUpdate={updateSharedPeriod}
                emptyMessage="No before-lunch periods yet."
              />

              {waveOptions.map((wave) => (
                <div
                  key={wave.id}
                  className="rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  <PeriodList
                    periods={getWavePeriods(wave.id)}
                    label={`Lunch Wave: ${wave.label || wave.id}`}
                    description="Periods for students in this wave during the lunch split (usually lunch + an adjacent class)."
                    onAdd={() => addWavePeriod(wave.id)}
                    onRemove={(i) => removeWavePeriod(wave.id, i)}
                    onUpdate={(i, patch) => updateWavePeriod(wave.id, i, patch)}
                    emptyMessage="No periods for this wave yet."
                  />
                </div>
              ))}

              <PeriodList
                periods={afterPeriods}
                label="After Lunch"
                description="Periods everyone has at the same time, after lunch ends."
                onAdd={addAfterPeriod}
                onRemove={removeAfterPeriod}
                onUpdate={updateAfterPeriod}
                emptyMessage="No after-lunch periods yet."
              />
            </div>
          )}

          {/* Remove day type */}
          {dayTypes.length > 1 && (
            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => removeDayType(activeDayTypeIndex)}
                className="cursor-pointer text-sm text-red-400/70 underline-offset-2 hover:text-red-400 hover:underline transition-colors duration-150"
              >
                Remove this day type
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
