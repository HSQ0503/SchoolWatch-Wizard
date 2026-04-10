"use client";

import { useState } from "react";
import type { WizardFormData } from "@/lib/types";

type StepProps = { data: WizardFormData; onChange: (data: WizardFormData) => void };

type Period = { name: string; start: string; end: string };

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black";

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

export default function StepSchedule({ data, onChange }: StepProps) {
  console.log("[StepSchedule] Rendering. dayTypes:", data.schedule.dayTypes.length, "bells keys:", Object.keys(data.schedule.bells));
  const [activeDayTypeIndex, setActiveDayTypeIndex] = useState(0);

  const { dayTypes, bells } = data.schedule;
  const activeDayType = dayTypes[activeDayTypeIndex] ?? dayTypes[0];

  function updateSchedule(patch: Partial<WizardFormData["schedule"]>) {
    onChange({ ...data, schedule: { ...data.schedule, ...patch } });
  }

  // --- Day type operations ---

  function addDayType() {
    const id = genId();
    const newDayType = { id, label: "New Day Type", weekdays: [] };
    const newBells = {
      ...bells,
      [id]: { shared: [], after: [] },
    };
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

  // --- Period operations ---

  function getPeriods(): Period[] {
    return bells[activeDayType?.id]?.shared ?? [];
  }

  function setPeriods(periods: Period[]) {
    const id = activeDayType.id;
    const existing = bells[id] ?? { shared: [], after: [] };
    updateSchedule({
      bells: { ...bells, [id]: { ...existing, shared: periods } },
    });
  }

  function addPeriod() {
    setPeriods([...getPeriods(), { name: "", start: "", end: "" }]);
  }

  function removePeriod(index: number) {
    setPeriods(getPeriods().filter((_, i) => i !== index));
  }

  function updatePeriod(index: number, patch: Partial<Period>) {
    setPeriods(getPeriods().map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  const periods = getPeriods();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Bell Schedule</h2>
        <p className="mt-1 text-sm text-gray-500">
          Create day types (e.g. Regular, Early Release) and define their periods.
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
                ? "bg-black text-white"
                : "border border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            }`}
          >
            {dt.label || "Untitled"}
          </button>
        ))}
        <button
          onClick={addDayType}
          className="cursor-pointer rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 transition-colors duration-150 hover:border-gray-400 hover:text-gray-700"
        >
          + Add Day Type
        </button>
      </div>

      {activeDayType && (
        <div className="space-y-5 rounded-xl border border-gray-200 p-5">
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Day Type Label</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Active Weekdays</label>
            <div className="flex gap-2">
              {WEEKDAYS.map(({ label, value }) => {
                const active = activeDayType.weekdays.includes(value);
                return (
                  <button
                    key={value}
                    onClick={() => toggleWeekday(value)}
                    aria-pressed={active}
                    className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-sm font-medium transition-colors duration-150 ${
                      active
                        ? "bg-black text-white"
                        : "border border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Periods */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Periods</label>
            <div className="space-y-2">
              {periods.length === 0 && (
                <p className="text-sm text-gray-400 italic">No periods yet. Add one below.</p>
              )}
              {periods.map((period, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    className={inputClass}
                    type="text"
                    placeholder="Period name"
                    value={period.name}
                    onChange={(e) => updatePeriod(i, { name: e.target.value })}
                  />
                  <input
                    className="w-28 shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    type="time"
                    value={period.start}
                    onChange={(e) => updatePeriod(i, { start: e.target.value })}
                    aria-label="Start time"
                  />
                  <input
                    className="w-28 shrink-0 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    type="time"
                    value={period.end}
                    onChange={(e) => updatePeriod(i, { end: e.target.value })}
                    aria-label="End time"
                  />
                  <button
                    onClick={() => removePeriod(i)}
                    aria-label={`Remove period ${i + 1}`}
                    className="cursor-pointer shrink-0 rounded-lg p-2 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-red-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addPeriod}
              className="mt-3 cursor-pointer rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 transition-colors duration-150 hover:border-gray-400 hover:text-gray-700"
            >
              + Add Period
            </button>
          </div>

          {/* Remove day type */}
          {dayTypes.length > 1 && (
            <div className="pt-1 border-t border-gray-100">
              <button
                onClick={() => removeDayType(activeDayTypeIndex)}
                className="cursor-pointer text-sm text-red-400 underline-offset-2 hover:text-red-600 hover:underline transition-colors duration-150"
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
