"use client";

import { useState } from "react";
import type { WizardFormData } from "@/lib/types";

type StepProps = { data: WizardFormData; onChange: (data: WizardFormData) => void };

type Tab = "no-school" | "early-dismissal" | "events";

const inputClass =
  "rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 transition-colors duration-150";

const EVENT_TYPES = [
  { value: "event", label: "Event" },
  { value: "no-school", label: "No School" },
  { value: "early-dismissal", label: "Early Dismissal" },
  { value: "exam", label: "Exam" },
  { value: "deadline", label: "Deadline" },
];

const TAB_LABELS: Record<Tab, string> = {
  "no-school": "No-School Days",
  "early-dismissal": "Early Dismissal",
  events: "Events",
};

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  );
}

export default function StepCalendar({ data, onChange }: StepProps) {
  const [activeTab, setActiveTab] = useState<Tab>("no-school");

  const { noSchoolDates, earlyDismissalDates, events } = data.calendar;

  function updateCalendar(patch: Partial<WizardFormData["calendar"]>) {
    onChange({ ...data, calendar: { ...data.calendar, ...patch } });
  }

  function addNoSchool() {
    updateCalendar({ noSchoolDates: [...noSchoolDates, { date: "", name: "" }] });
  }
  function updateNoSchool(index: number, patch: Partial<{ date: string; name: string }>) {
    updateCalendar({ noSchoolDates: noSchoolDates.map((e, i) => (i === index ? { ...e, ...patch } : e)) });
  }
  function removeNoSchool(index: number) {
    updateCalendar({ noSchoolDates: noSchoolDates.filter((_, i) => i !== index) });
  }

  function addEarlyDismissal() {
    updateCalendar({ earlyDismissalDates: [...earlyDismissalDates, { date: "", name: "" }] });
  }
  function updateEarlyDismissal(index: number, patch: Partial<{ date: string; name: string }>) {
    updateCalendar({ earlyDismissalDates: earlyDismissalDates.map((e, i) => (i === index ? { ...e, ...patch } : e)) });
  }
  function removeEarlyDismissal(index: number) {
    updateCalendar({ earlyDismissalDates: earlyDismissalDates.filter((_, i) => i !== index) });
  }

  function addEvent() {
    updateCalendar({ events: [...events, { date: "", name: "", type: "event" }] });
  }
  function updateEvent(index: number, patch: Partial<{ date: string; name: string; type: string; endDate: string }>) {
    updateCalendar({ events: events.map((e, i) => (i === index ? { ...e, ...patch } : e)) });
  }
  function removeEvent(index: number) {
    updateCalendar({ events: events.filter((_, i) => i !== index) });
  }

  const tabs: Tab[] = ["no-school", "early-dismissal", "events"];
  const badgeCounts: Record<Tab, number> = {
    "no-school": noSchoolDates.length,
    "early-dismissal": earlyDismissalDates.length,
    events: events.length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Calendar</h2>
        <p className="mt-1 text-sm text-gray-400">
          Add no-school days, early dismissals, and events. This step is optional — you can skip it and add dates later.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex rounded-lg border border-white/10 bg-white/5 p-1 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
              activeTab === tab
                ? "bg-white text-black shadow-sm"
                : "text-gray-500 hover:text-white"
            }`}
          >
            {TAB_LABELS[tab]}
            {badgeCounts[tab] > 0 && (
              <span
                className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                  activeTab === tab
                    ? "bg-black text-white"
                    : "bg-white/10 text-gray-400"
                }`}
              >
                {badgeCounts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* No-School Days */}
      {activeTab === "no-school" && (
        <div className="space-y-3">
          {noSchoolDates.length === 0 && (
            <p className="text-sm text-gray-500 italic">No entries yet.</p>
          )}
          {noSchoolDates.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="date" className={`w-44 shrink-0 ${inputClass}`} value={entry.date} onChange={(e) => updateNoSchool(i, { date: e.target.value })} aria-label="Date" />
              <input type="text" className={`flex-1 ${inputClass}`} placeholder="e.g. Winter Break" value={entry.name} onChange={(e) => updateNoSchool(i, { name: e.target.value })} aria-label="Name" />
              <button onClick={() => removeNoSchool(i)} aria-label={`Remove entry ${i + 1}`} className="cursor-pointer shrink-0 rounded-lg p-2 text-gray-600 transition-colors duration-150 hover:bg-white/5 hover:text-red-400">
                <TrashIcon />
              </button>
            </div>
          ))}
          <button onClick={addNoSchool} className="cursor-pointer rounded-lg border border-dashed border-white/20 px-4 py-2 text-sm text-gray-500 transition-colors duration-150 hover:border-white/30 hover:text-gray-300">
            + Add
          </button>
        </div>
      )}

      {/* Early Dismissal */}
      {activeTab === "early-dismissal" && (
        <div className="space-y-3">
          {earlyDismissalDates.length === 0 && (
            <p className="text-sm text-gray-500 italic">No entries yet.</p>
          )}
          {earlyDismissalDates.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="date" className={`w-44 shrink-0 ${inputClass}`} value={entry.date} onChange={(e) => updateEarlyDismissal(i, { date: e.target.value })} aria-label="Date" />
              <input type="text" className={`flex-1 ${inputClass}`} placeholder="e.g. Parent-Teacher Conferences" value={entry.name} onChange={(e) => updateEarlyDismissal(i, { name: e.target.value })} aria-label="Name" />
              <button onClick={() => removeEarlyDismissal(i)} aria-label={`Remove entry ${i + 1}`} className="cursor-pointer shrink-0 rounded-lg p-2 text-gray-600 transition-colors duration-150 hover:bg-white/5 hover:text-red-400">
                <TrashIcon />
              </button>
            </div>
          ))}
          <button onClick={addEarlyDismissal} className="cursor-pointer rounded-lg border border-dashed border-white/20 px-4 py-2 text-sm text-gray-500 transition-colors duration-150 hover:border-white/30 hover:text-gray-300">
            + Add
          </button>
        </div>
      )}

      {/* Events */}
      {activeTab === "events" && (
        <div className="space-y-3">
          {events.length === 0 && (
            <p className="text-sm text-gray-500 italic">No events yet.</p>
          )}
          {events.map((entry, i) => (
            <div key={i} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <input type="date" className={`w-44 shrink-0 ${inputClass}`} value={entry.date} onChange={(e) => updateEvent(i, { date: e.target.value })} aria-label="Date" />
              <input type="text" className={`flex-1 min-w-0 ${inputClass}`} placeholder="Event name" value={entry.name} onChange={(e) => updateEvent(i, { name: e.target.value })} aria-label="Event name" />
              <select className={`w-44 shrink-0 ${inputClass} cursor-pointer`} value={entry.type} onChange={(e) => updateEvent(i, { type: e.target.value })} aria-label="Event type">
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-gray-900 text-white">{t.label}</option>
                ))}
              </select>
              <button onClick={() => removeEvent(i)} aria-label={`Remove event ${i + 1}`} className="cursor-pointer shrink-0 rounded-lg p-2 text-gray-600 transition-colors duration-150 hover:bg-white/5 hover:text-red-400">
                <TrashIcon />
              </button>
            </div>
          ))}
          <button onClick={addEvent} className="cursor-pointer rounded-lg border border-dashed border-white/20 px-4 py-2 text-sm text-gray-500 transition-colors duration-150 hover:border-white/30 hover:text-gray-300">
            + Add
          </button>
        </div>
      )}
    </div>
  );
}
