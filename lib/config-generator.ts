import type { WizardFormData } from "./types";
import { deriveColors } from "./colors";

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Escape a string value for embedding inside double-quoted TS string literals
function esc(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function serializePeriods(
  periods: { name: string; start: string; end: string }[],
  indent: string,
): string {
  return periods
    .map(
      (p) =>
        `${indent}  { name: "${esc(p.name)}", start: "${esc(p.start)}", end: "${esc(p.end)}" }`,
    )
    .join(",\n");
}

function serializeBells(data: WizardFormData): string {
  const { bells } = data.schedule;
  const lines: string[] = [];

  for (const [dayTypeId, block] of Object.entries(bells)) {
    const innerIndent = "        ";

    // shared periods
    const sharedLines = serializePeriods(block.shared, innerIndent);

    let bellBlock = `      "${esc(dayTypeId)}": {\n`;
    bellBlock += `        shared: [\n${sharedLines}\n        ],\n`;

    // lunch waves — only emit when lunchWaves are enabled and present
    if (data.lunchWaves.enabled && block.lunchWaves && Object.keys(block.lunchWaves).length > 0) {
      bellBlock += `        lunchWaves: {\n`;
      for (const [waveId, periods] of Object.entries(block.lunchWaves)) {
        const waveLines = serializePeriods(periods, `${innerIndent}  `);
        bellBlock += `          "${esc(waveId)}": [\n${waveLines}\n          ],\n`;
      }
      bellBlock += `        },\n`;
    }

    // after periods
    const afterLines = serializePeriods(block.after, innerIndent);
    bellBlock += `        after: [\n${afterLines}\n        ],\n`;
    bellBlock += `      }`;

    lines.push(bellBlock);
  }

  return lines.join(",\n");
}

function serializeDayTypes(data: WizardFormData): string {
  return data.schedule.dayTypes
    .map((dt) => {
      const weekdays = `[${dt.weekdays.join(", ")}]`;
      return `    { id: "${esc(dt.id)}", label: "${esc(dt.label)}", weekdays: ${weekdays} }`;
    })
    .join(",\n");
}

function serializeLunchWaveOptions(data: WizardFormData): string {
  if (!data.lunchWaves.enabled || data.lunchWaves.options.length === 0) {
    return "";
  }
  return data.lunchWaves.options
    .map((o) => `    { id: "${esc(o.id)}", label: "${esc(o.label)}" }`)
    .join(",\n");
}

function serializeDateList(
  items: { date: string; name: string }[],
  indent: string,
): string {
  if (items.length === 0) return "";
  return items
    .map((item) => `${indent}{ date: "${esc(item.date)}", name: "${esc(item.name)}" }`)
    .join(",\n");
}

function serializeEvents(
  events: { date: string; name: string; type: string; endDate?: string }[],
  indent: string,
): string {
  if (events.length === 0) return "";
  return events
    .map((e) => {
      const endDate = e.endDate ? `, endDate: "${esc(e.endDate)}"` : "";
      return `${indent}{ date: "${esc(e.date)}", name: "${esc(e.name)}", type: "${esc(e.type)}"${endDate} }`;
    })
    .join(",\n");
}

export function generateConfigTs(data: WizardFormData): string {
  const { school, colors: inputColors, lunchWaves, calendar, features } = data;
  const colors = deriveColors(inputColors.primary, inputColors.accent);
  const storagePrefix = generateSlug(school.appName);

  const dayTypesStr = serializeDayTypes(data);
  const bellsStr = serializeBells(data);

  const noSchoolStr = serializeDateList(calendar.noSchoolDates, "    ");
  const earlyStr = serializeDateList(calendar.earlyDismissalDates, "    ");
  const eventsStr = serializeEvents(calendar.events, "    ");

  const lunchOptionsStr = serializeLunchWaveOptions(data);
  const lunchDefault = lunchWaves.enabled ? esc(lunchWaves.default) : "";

  return `import type { SchoolConfig } from "./lib/types/config";

const config: SchoolConfig = {
  school: {
    name: "${esc(school.name)}",
    shortName: "${esc(school.shortName)}",
    acronym: "${esc(school.acronym)}",
    mascot: "${esc(school.mascot)}",
    appName: "${esc(school.appName)}",
    domain: "",
    logoPath: "/logo.png",
    academicYear: "${esc(school.academicYear)}",
  },
  location: {
    city: "${esc(school.city)}",
    state: "${esc(school.state)}",
    stateCode: "${esc(school.stateCode)}",
    country: "${esc(school.country)}",
  },
  colors: {
    primary: "${esc(colors.primary)}",
    primaryLight: "${esc(colors.primaryLight)}",
    accent: "${esc(colors.accent)}",
    accentLight: "${esc(colors.accentLight)}",
    darkBg: "${esc(colors.darkBg)}",
    darkSurface: "${esc(colors.darkSurface)}",
  },
  storagePrefix: "${storagePrefix}",
  schedule: {
    dayTypes: [
${dayTypesStr}
    ],
    bells: {
${bellsStr}
    },
    dayTypeOverrides: [],
  },
  lunchWaves: {
    options: [
${lunchOptionsStr}
    ],
    default: "${lunchDefault}",
  },
  calendar: {
    noSchoolDates: [
${noSchoolStr}
    ],
    earlyDismissalDates: [
${earlyStr}
    ],
    events: [
${eventsStr}
    ],
  },
  features: {
    events: ${features.events},
    productivity: ${features.productivity},
  },
};
export default config;
`;
}
