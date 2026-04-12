import type { WizardFormData } from "./types";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateStep(step: number, data: WizardFormData): string[] {
  switch (step) {
    case 0: return validateSchoolInfo(data);
    case 1: return validateColors(data);
    case 2: return validateSchedule(data);
    case 3: return validateLunchWaves(data);
    case 4: return validateCalendar(data);
    default: return [];
  }
}

function validateSchoolInfo(data: WizardFormData): string[] {
  const errors: string[] = [];
  const s = data.school;
  if (!s.name.trim()) errors.push("School name is required");
  if (!s.shortName.trim()) errors.push("Short name is required");
  if (!s.acronym.trim()) errors.push("Acronym is required");
  if (!s.mascot.trim()) errors.push("Mascot is required");
  if (!s.appName.trim()) errors.push("App name is required");
  if (!s.city.trim()) errors.push("City is required");
  if (!s.state.trim()) errors.push("State is required");
  if (!s.stateCode.trim()) errors.push("State code is required");
  if (!s.academicYear.trim()) errors.push("Academic year is required");
  if (!data.contactEmail.trim()) {
    errors.push("Contact email is required");
  } else if (!EMAIL_RE.test(data.contactEmail.trim())) {
    errors.push("Contact email is not valid");
  }
  return errors;
}

function validateColors(data: WizardFormData): string[] {
  const errors: string[] = [];
  if (!HEX_RE.test(data.colors.primary)) errors.push("Primary color must be a valid hex (e.g. #003da5)");
  if (!HEX_RE.test(data.colors.accent)) errors.push("Accent color must be a valid hex (e.g. #003da5)");
  const zones = data.colors.light;
  for (const [key, value] of Object.entries(zones)) {
    if (!HEX_RE.test(value)) errors.push(`Light ${key} must be a valid hex color`);
  }
  for (const [key, value] of Object.entries(data.colors.dark)) {
    if (value && !HEX_RE.test(value)) errors.push(`Dark ${key} must be a valid hex color`);
  }
  return errors;
}

function validatePeriodList(
  periods: { name: string; start: string; end: string }[],
  dayTypeLabel: string,
  sectionLabel: string,
  errors: string[],
) {
  for (let i = 0; i < periods.length; i++) {
    const p = periods[i];
    const label = p.name || `${sectionLabel} ${i + 1}`;
    if (!p.name.trim()) errors.push(`${dayTypeLabel}: ${sectionLabel} ${i + 1} needs a name`);
    if (!TIME_RE.test(p.start)) errors.push(`${dayTypeLabel}: "${label}" has an invalid start time`);
    if (!TIME_RE.test(p.end)) errors.push(`${dayTypeLabel}: "${label}" has an invalid end time`);
    if (TIME_RE.test(p.start) && TIME_RE.test(p.end) && p.start >= p.end) {
      errors.push(`${dayTypeLabel}: "${label}" end time must be after start time`);
    }
  }
}

function validateSchedule(data: WizardFormData): string[] {
  const errors: string[] = [];
  const { dayTypes, bells } = data.schedule;
  const lunchWavesEnabled = data.lunchWaves.enabled && data.lunchWaves.options.length > 0;

  if (dayTypes.length === 0) {
    errors.push("At least one day type is required");
    return errors;
  }

  for (const dt of dayTypes) {
    if (!dt.label.trim()) errors.push(`Day type "${dt.id}" needs a label`);
    if (dt.weekdays.length === 0) errors.push(`"${dt.label || dt.id}" has no weekdays selected`);

    const block = bells[dt.id];
    if (!block) {
      errors.push(`"${dt.label || dt.id}" has no bell schedule`);
      continue;
    }

    const dtLabel = dt.label || dt.id;

    // Count total periods across all sections — a day type needs at least one somewhere
    const sharedCount = block.shared.length;
    const afterCount = block.after?.length ?? 0;
    const waveCount = lunchWavesEnabled
      ? data.lunchWaves.options.reduce(
          (sum, w) => sum + (block.lunchWaves?.[w.id]?.length ?? 0),
          0,
        )
      : 0;

    if (sharedCount + afterCount + waveCount === 0) {
      errors.push(`"${dtLabel}" needs at least one period`);
      continue;
    }

    // Validate all period sections
    validatePeriodList(block.shared, dtLabel, "period", errors);
    validatePeriodList(block.after ?? [], dtLabel, "after-lunch period", errors);

    if (lunchWavesEnabled) {
      for (const wave of data.lunchWaves.options) {
        const wavePeriods = block.lunchWaves?.[wave.id] ?? [];
        validatePeriodList(
          wavePeriods,
          dtLabel,
          `${wave.label || wave.id} lunch period`,
          errors,
        );
      }
    }
  }

  return errors;
}

function validateLunchWaves(data: WizardFormData): string[] {
  if (!data.lunchWaves.enabled) return [];

  const errors: string[] = [];
  const { options } = data.lunchWaves;

  if (options.length === 0) {
    errors.push("Add at least one lunch wave or disable lunch waves");
    return errors;
  }

  for (let i = 0; i < options.length; i++) {
    if (!options[i].id.trim()) errors.push(`Wave ${i + 1} needs an ID`);
    if (!options[i].label.trim()) errors.push(`Wave ${i + 1} needs a label`);
  }

  const ids = options.map((o) => o.id);
  if (new Set(ids).size !== ids.length) errors.push("Wave IDs must be unique");
  if (!data.lunchWaves.default || !ids.includes(data.lunchWaves.default)) {
    errors.push("Select a default lunch wave");
  }

  return errors;
}

function validateCalendar(data: WizardFormData): string[] {
  const errors: string[] = [];
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  for (let i = 0; i < data.calendar.noSchoolDates.length; i++) {
    const e = data.calendar.noSchoolDates[i];
    if (!DATE_RE.test(e.date)) errors.push(`No-school entry ${i + 1}: invalid date`);
    if (!e.name.trim()) errors.push(`No-school entry ${i + 1}: name is required`);
  }

  for (let i = 0; i < data.calendar.earlyDismissalDates.length; i++) {
    const e = data.calendar.earlyDismissalDates[i];
    if (!DATE_RE.test(e.date)) errors.push(`Early dismissal ${i + 1}: invalid date`);
    if (!e.name.trim()) errors.push(`Early dismissal ${i + 1}: name is required`);
  }

  for (let i = 0; i < data.calendar.events.length; i++) {
    const e = data.calendar.events[i];
    if (!DATE_RE.test(e.date)) errors.push(`Event ${i + 1}: invalid date`);
    if (!e.name.trim()) errors.push(`Event ${i + 1}: name is required`);
  }

  return errors;
}
