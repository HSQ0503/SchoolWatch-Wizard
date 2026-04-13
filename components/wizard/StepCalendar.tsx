"use client";

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

const EVENT_TYPES = [
  { value: "event", label: "Event" },
  { value: "no-school", label: "No School" },
  { value: "early-dismissal", label: "Early Dismissal" },
  { value: "exam", label: "Exam" },
  { value: "deadline", label: "Deadline" },
];

// DateCard — index-card style row for a single calendar entry.
function DateCard({
  date,
  label,
  eventType,
  rotation = 0,
  onChangeDate,
  onChangeLabel,
  onChangeEventType,
  onRemove,
}: {
  date: string;
  label: string;
  eventType?: string; // only present for events
  rotation?: number;
  onChangeDate: (val: string) => void;
  onChangeLabel: (val: string) => void;
  onChangeEventType?: (val: string) => void;
  onRemove: () => void;
}) {
  return (
    <div
      className="relative flex flex-wrap items-center gap-4 border border-[color:var(--color-hairline)] bg-white px-5 py-3 shadow-[0_4px_12px_rgba(26,26,26,0.06)]"
      style={{ transform: rotation !== 0 ? `rotate(${rotation}deg)` : undefined }}
    >
      <input
        aria-label="Date"
        type="date"
        value={date}
        onChange={(e) => onChangeDate(e.target.value)}
        className="border-0 bg-transparent text-[20px] text-[color:var(--color-ink)] focus:outline-none"
        style={{ fontFamily: "var(--font-archivo)" }}
      />
      <input
        aria-label={onChangeEventType ? "Event name" : "Reason"}
        type="text"
        value={label}
        placeholder={onChangeEventType ? "Event name" : "Reason (optional)"}
        onChange={(e) => onChangeLabel(e.target.value)}
        className="min-w-[180px] flex-1 border-0 bg-transparent text-[15px] italic text-[color:var(--color-ink-soft)] placeholder-[color:var(--color-ink-faded)]/60 focus:outline-none"
        style={{ fontFamily: "var(--font-display)" }}
      />
      {onChangeEventType !== undefined && (
        <select
          aria-label="Event type"
          value={eventType ?? "event"}
          onChange={(e) => onChangeEventType(e.target.value)}
          className="border-0 bg-transparent text-[12px] uppercase tracking-[0.12em] text-[color:var(--color-ink-faded)] focus:outline-none"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {EVENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faded)] underline underline-offset-4 hover:text-[color:var(--color-marker)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        remove
      </button>
    </div>
  );
}

export default function StepCalendar({ data, onChange }: StepProps) {
  const reduce = useReducedMotion();
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

  return (
    <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div>
        <motion.div
          initial={reduce ? false : "hidden"}
          animate="visible"
          variants={headerContainer}
        >
          <motion.p variants={headerItem} className={kickerCls} style={kickerFont}>step 05 / calendar</motion.p>
          <motion.h1 variants={headerItem} className={headlineCls} style={headlineFont}>
            Pin the <span style={italicAccent}>important dates.</span>
          </motion.h1>
          <motion.p variants={headerItem} className={subcopyCls} style={subcopyFont}>
            No-school days, early dismissals, and events. You can always add more after you deploy — the 10 biggest breaks of the year is a reasonable start.
          </motion.p>
        </motion.div>

        {/* No-school days */}
        <section className="mt-10">
          <p
            className={labelCls}
            style={labelFont}
          >
            No-school days
          </p>
          <p
            className="mt-1 text-[13px] italic text-[color:var(--color-ink-soft)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Holidays, breaks, teacher workdays — anything students should know about.
          </p>

          <div className="mt-4 space-y-3">
            {noSchoolDates.map((d, i) => (
              <DateCard
                key={i}
                date={d.date}
                label={d.name}
                rotation={i % 3 === 2 ? 1 : 0}
                onChangeDate={(val) => updateNoSchool(i, { date: val })}
                onChangeLabel={(val) => updateNoSchool(i, { name: val })}
                onRemove={() => removeNoSchool(i)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addNoSchool}
            className="mt-4 text-[12px] uppercase tracking-[0.14em] text-[color:var(--color-ink)] underline underline-offset-4 decoration-[1.5px] hover:text-[color:var(--color-marker)] hover:[text-decoration-style:wavy]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            + add date
          </button>
        </section>

        <hr className="my-10 border-0 border-t border-dashed border-[color:var(--color-hairline)]" />

        {/* Early dismissals */}
        <section>
          <p
            className={labelCls}
            style={labelFont}
          >
            Early dismissal
          </p>
          <p
            className="mt-1 text-[13px] italic text-[color:var(--color-ink-soft)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Half-days, conference days, any day school ends earlier than usual.
          </p>

          <div className="mt-4 space-y-3">
            {earlyDismissalDates.map((d, i) => (
              <DateCard
                key={i}
                date={d.date}
                label={d.name}
                rotation={i % 3 === 2 ? 1 : 0}
                onChangeDate={(val) => updateEarlyDismissal(i, { date: val })}
                onChangeLabel={(val) => updateEarlyDismissal(i, { name: val })}
                onRemove={() => removeEarlyDismissal(i)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addEarlyDismissal}
            className="mt-4 text-[12px] uppercase tracking-[0.14em] text-[color:var(--color-ink)] underline underline-offset-4 decoration-[1.5px] hover:text-[color:var(--color-marker)] hover:[text-decoration-style:wavy]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            + add date
          </button>
        </section>

        <hr className="my-10 border-0 border-t border-dashed border-[color:var(--color-hairline)]" />

        {/* Events */}
        <section>
          <p
            className={labelCls}
            style={labelFont}
          >
            Events
          </p>
          <p
            className="mt-1 text-[13px] italic text-[color:var(--color-ink-soft)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Exams, deadlines, performances, sports — anything worth putting on the calendar.
          </p>

          <div className="mt-4 space-y-3">
            {events.map((ev, i) => (
              <DateCard
                key={i}
                date={ev.date}
                label={ev.name}
                eventType={ev.type}
                rotation={i % 3 === 2 ? 1 : 0}
                onChangeDate={(val) => updateEvent(i, { date: val })}
                onChangeLabel={(val) => updateEvent(i, { name: val })}
                onChangeEventType={(val) => updateEvent(i, { type: val })}
                onRemove={() => removeEvent(i)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addEvent}
            className="mt-4 text-[12px] uppercase tracking-[0.14em] text-[color:var(--color-ink)] underline underline-offset-4 decoration-[1.5px] hover:text-[color:var(--color-marker)] hover:[text-decoration-style:wavy]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            + add event
          </button>
        </section>
      </div>

      {/* Margin note — appears in the right rail on lg+, stacked above the form body on mobile. */}
      <aside
        className="order-first lg:order-last lg:pt-24"
        aria-label="Tip"
      >
        <div className="relative pl-5 border-l-[3px] border-[color:var(--color-ink)]">
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
            5
          </span>
          <p
            className="text-[15px] italic leading-[1.5] text-[color:var(--color-ink-soft)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            You can always add more dates after you deploy. The 10 biggest breaks of the year is a reasonable start.
          </p>
        </div>
      </aside>
    </div>
  );
}
