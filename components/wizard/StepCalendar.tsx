"use client";

import React, { useState } from "react";
import type { WizardFormData } from "@/lib/types";

type StepProps = { data: WizardFormData; onChange: (data: WizardFormData) => void };

type Tab = "no-school" | "early-dismissal" | "events";

const inputClass =
  "w-full rounded-[3px] border border-[color:var(--color-line-strong)] bg-[color:var(--color-bg-input)] px-3 py-2 text-[13px] text-[color:var(--color-foreground)] placeholder-[color:var(--color-text-faded)] transition-colors focus:border-[color:var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[color:var(--color-accent)]";

const fontMono: React.CSSProperties = { fontFamily: "var(--font-mono)" };

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
    <div className="space-y-6" style={fontMono}>
      <div className="flex items-baseline gap-3.5 border-b border-dashed border-[color:var(--color-line-strong)] pb-4">
        <h2 className="text-[22px] font-bold text-[color:var(--color-foreground)]">
          <span className="text-[color:var(--color-text-faded)] font-normal">// </span>
          calendar
        </h2>
        <span className="text-[12px] text-[color:var(--color-text-faded)]">
          — optional. add no-school days, early dismissals, and events.
        </span>
      </div>

      <div className="flex gap-0 border-b border-[color:var(--color-line-strong)]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 cursor-pointer border-r border-[color:var(--color-line-strong)] px-3 py-2.5 text-[11px] uppercase tracking-[0.12em] last:border-r-0 ${
              activeTab === tab
                ? "bg-[color:var(--color-bg-raised)] text-[color:var(--color-accent)] shadow-[inset_0_-2px_0_var(--color-accent)]"
                : "text-[color:var(--color-text-faded)] hover:bg-[color:var(--color-bg-raised)] hover:text-[color:var(--color-foreground)]"
            }`}
            style={fontMono}
          >
            {TAB_LABELS[tab].toLowerCase()}
            {badgeCounts[tab] > 0 && (
              <span className="ml-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--color-accent)] px-1 text-[10px] font-bold text-black">
                {badgeCounts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "no-school" && (
        <div className="space-y-2">
          {noSchoolDates.length === 0 && (
            <p className="text-[12px] italic text-[color:var(--color-text-faded)]">no entries yet.</p>
          )}
          {noSchoolDates.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="date" className={`w-44 shrink-0 ${inputClass} [color-scheme:dark]`} value={entry.date} onChange={(e) => updateNoSchool(i, { date: e.target.value })} aria-label="Date" />
              <input type="text" className={`flex-1 ${inputClass}`} placeholder="e.g. Winter Break" value={entry.name} onChange={(e) => updateNoSchool(i, { name: e.target.value })} aria-label="Name" />
              <button onClick={() => removeNoSchool(i)} aria-label={`Remove entry ${i + 1}`} className="cursor-pointer shrink-0 rounded-[3px] p-1.5 text-[color:var(--color-text-faded)] hover:text-[color:var(--color-accent)]">
                <TrashIcon />
              </button>
            </div>
          ))}
          <button onClick={addNoSchool} className="cursor-pointer text-xs uppercase tracking-[0.12em] text-[color:var(--color-accent)] hover:brightness-110">
            [+] add
          </button>
        </div>
      )}

      {activeTab === "early-dismissal" && (
        <div className="space-y-2">
          {earlyDismissalDates.length === 0 && (
            <p className="text-[12px] italic text-[color:var(--color-text-faded)]">no entries yet.</p>
          )}
          {earlyDismissalDates.map((entry, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="date" className={`w-44 shrink-0 ${inputClass} [color-scheme:dark]`} value={entry.date} onChange={(e) => updateEarlyDismissal(i, { date: e.target.value })} aria-label="Date" />
              <input type="text" className={`flex-1 ${inputClass}`} placeholder="e.g. Parent-Teacher Conferences" value={entry.name} onChange={(e) => updateEarlyDismissal(i, { name: e.target.value })} aria-label="Name" />
              <button onClick={() => removeEarlyDismissal(i)} aria-label={`Remove entry ${i + 1}`} className="cursor-pointer shrink-0 rounded-[3px] p-1.5 text-[color:var(--color-text-faded)] hover:text-[color:var(--color-accent)]">
                <TrashIcon />
              </button>
            </div>
          ))}
          <button onClick={addEarlyDismissal} className="cursor-pointer text-xs uppercase tracking-[0.12em] text-[color:var(--color-accent)] hover:brightness-110">
            [+] add
          </button>
        </div>
      )}

      {activeTab === "events" && (
        <div className="space-y-2">
          {events.length === 0 && (
            <p className="text-[12px] italic text-[color:var(--color-text-faded)]">no events yet.</p>
          )}
          {events.map((entry, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
              <input type="date" className={`w-44 shrink-0 ${inputClass} [color-scheme:dark]`} value={entry.date} onChange={(e) => updateEvent(i, { date: e.target.value })} aria-label="Date" />
              <input type="text" className={`flex-1 min-w-0 ${inputClass}`} placeholder="Event name" value={entry.name} onChange={(e) => updateEvent(i, { name: e.target.value })} aria-label="Event name" />
              <select className={`w-44 shrink-0 ${inputClass} cursor-pointer`} value={entry.type} onChange={(e) => updateEvent(i, { type: e.target.value })} aria-label="Event type">
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value} className="bg-[color:var(--color-bg-raised)] text-[color:var(--color-foreground)]">
                    {t.label}
                  </option>
                ))}
              </select>
              <button onClick={() => removeEvent(i)} aria-label={`Remove event ${i + 1}`} className="cursor-pointer shrink-0 rounded-[3px] p-1.5 text-[color:var(--color-text-faded)] hover:text-[color:var(--color-accent)]">
                <TrashIcon />
              </button>
            </div>
          ))}
          <button onClick={addEvent} className="cursor-pointer text-xs uppercase tracking-[0.12em] text-[color:var(--color-accent)] hover:brightness-110">
            [+] add
          </button>
        </div>
      )}
    </div>
  );
}
