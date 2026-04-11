# Zone-Based Color Customizer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 2-input color picker with an interactive visual customizer — 8 clickable zones on a live dashboard mockup, with auto-derived dark mode and optional overrides.

**Architecture:** Template repo (SchoolWatch) is updated first to consume the new color format (16 CSS vars instead of 6). Then the wizard repo (schoolwatch-wizard) is updated to emit the new format, with the StepColors component rewritten as an interactive mockup. Old-format schools auto-migrate on edit page load.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, Prisma (MongoDB)

---

## File Map

### SchoolWatch template (`C:/Dev/SchoolWatch`)

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/types/config.ts` | Modify | New `SchoolColors` and `ZoneColors` types |
| `app/layout.tsx` | Modify | Set 16 CSS custom properties + 2 derived |
| `app/globals.css` | Modify | New semantic color tokens in `@theme inline` |
| `school.config.ts` | Modify | Update to new color format |
| `examples/simple-school.config.ts` | Modify | Update to new color format |
| `examples/block-schedule.config.ts` | Modify | Update to new color format |
| `examples/rotating-schedule.config.ts` | Modify | Update to new color format |
| `components/Navbar.tsx` | Modify | Use new tokens |
| `components/DayStatusHero.tsx` | Modify | Use new tokens |
| `components/PeriodCountdown.tsx` | Modify | Use new tokens |
| `components/QuickGlanceCards.tsx` | Modify | Use new tokens |
| `components/ScheduleView.tsx` | Modify | Use new tokens |
| `components/CalendarView.tsx` | Modify | Use new tokens |
| `components/EventsList.tsx` | Modify | Use new tokens |
| `components/TodoList.tsx` | Modify | Use new tokens |

### schoolwatch-wizard (`C:/Dev/schoolwatch-wizard`)

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/types.ts` | Modify | New `ColorsConfig` and `ZoneColors` types |
| `lib/colors.ts` | Rewrite | `defaultLightColors`, `deriveDarkColors`, `resolveDarkColors` |
| `lib/config-generator.ts` | Modify | Emit new nested color format |
| `lib/validation.ts` | Modify | Validate zone hex values |
| `components/wizard/StepColors.tsx` | Rewrite | Interactive mockup with clickable zones |
| `app/edit/page.tsx` | Modify | Old format migration |

---

### Task 1: Update template color types

**Repo:** SchoolWatch (`C:/Dev/SchoolWatch`)
**Files:**
- Modify: `lib/types/config.ts:60-67`

- [ ] **Step 1: Replace the colors type**

In `lib/types/config.ts`, replace the current colors block (lines 60-67):

```ts
  colors: {
    primary: string;
    primaryLight: string;
    accent: string;
    accentLight: string;
    darkBg: string;
    darkSurface: string;
  };
```

with:

```ts
  colors: {
    light: {
      navbar: string;
      navText: string;
      background: string;
      heading: string;
      ring: string;
      surface: string;
      cardAccent: string;
      badge: string;
    };
    dark: {
      navbar: string;
      navText: string;
      background: string;
      heading: string;
      ring: string;
      surface: string;
      cardAccent: string;
      badge: string;
    };
  };
```

- [ ] **Step 2: Verify build (will fail — expected, other files still reference old format)**

Run: `cd C:/Dev/SchoolWatch && npm run build 2>&1 | head -30`
Expected: TypeScript errors in files that reference `config.colors.primary` etc. This is expected — we fix them in subsequent tasks.

---

### Task 2: Update template layout.tsx CSS vars

**Repo:** SchoolWatch (`C:/Dev/SchoolWatch`)
**Files:**
- Modify: `app/layout.tsx:80-87`

- [ ] **Step 1: Replace the CSS custom properties**

In `app/layout.tsx`, replace the `style` object (lines 80-87):

```ts
      style={{
        "--school-primary": config.colors.primary,
        "--school-primary-light": config.colors.primaryLight,
        "--school-accent": config.colors.accent,
        "--school-accent-light": config.colors.accentLight,
        "--school-dark-bg": config.colors.darkBg,
        "--school-dark-surface": config.colors.darkSurface,
      } as React.CSSProperties}
```

with:

```ts
      style={{
        "--school-light-navbar": config.colors.light.navbar,
        "--school-light-nav-text": config.colors.light.navText,
        "--school-light-background": config.colors.light.background,
        "--school-light-heading": config.colors.light.heading,
        "--school-light-ring": config.colors.light.ring,
        "--school-light-surface": config.colors.light.surface,
        "--school-light-card-accent": config.colors.light.cardAccent,
        "--school-light-badge": config.colors.light.badge,
        "--school-dark-navbar": config.colors.dark.navbar,
        "--school-dark-nav-text": config.colors.dark.navText,
        "--school-dark-background": config.colors.dark.background,
        "--school-dark-heading": config.colors.dark.heading,
        "--school-dark-ring": config.colors.dark.ring,
        "--school-dark-surface": config.colors.dark.surface,
        "--school-dark-card-accent": config.colors.dark.cardAccent,
        "--school-dark-badge": config.colors.dark.badge,
      } as React.CSSProperties}
```

---

### Task 3: Update template globals.css theme tokens

**Repo:** SchoolWatch (`C:/Dev/SchoolWatch`)
**Files:**
- Modify: `app/globals.css:5-26`

- [ ] **Step 1: Replace the @theme inline block**

In `app/globals.css`, replace the `@theme inline` block (lines 5-26):

```css
@theme inline {
  --color-white: #ffffff;
  --color-bg: #f5f7fa;
  --color-surface: #ffffff;
  --color-border: #e2e5ea;
  --color-navy: var(--school-primary);
  --color-navy-light: var(--school-primary-light);
  --color-red: var(--school-accent);
  --color-red-light: var(--school-accent-light);
  --color-muted: #6b7280;
  --color-text: #1e293b;

  --color-dark-bg: var(--school-dark-bg);
  --color-dark-surface: var(--school-dark-surface);
  --color-dark-border: rgba(255, 255, 255, 0.12);
  --color-dark-text: #f1f5f9;
  --color-dark-muted: #b0bec5;

  --font-display: var(--font-montserrat);
  --font-body: var(--font-dm-sans);
  --font-mono: var(--font-jb-mono);
}
```

with:

```css
@theme inline {
  --color-white: #ffffff;
  --color-navbar: var(--school-light-navbar);
  --color-nav-text: var(--school-light-nav-text);
  --color-bg: var(--school-light-background);
  --color-heading: var(--school-light-heading);
  --color-ring: var(--school-light-ring);
  --color-surface: var(--school-light-surface);
  --color-card-accent: var(--school-light-card-accent);
  --color-badge: var(--school-light-badge);
  --color-border: #e2e5ea;
  --color-muted: #6b7280;
  --color-text: #1e293b;

  --color-dark-navbar: var(--school-dark-navbar);
  --color-dark-nav-text: var(--school-dark-nav-text);
  --color-dark-bg: var(--school-dark-background);
  --color-dark-heading: var(--school-dark-heading);
  --color-dark-ring: var(--school-dark-ring);
  --color-dark-surface: var(--school-dark-surface);
  --color-dark-card-accent: var(--school-dark-card-accent);
  --color-dark-badge: var(--school-dark-badge);
  --color-dark-border: rgba(255, 255, 255, 0.12);
  --color-dark-text: #f1f5f9;
  --color-dark-muted: #b0bec5;

  --font-display: var(--font-montserrat);
  --font-body: var(--font-dm-sans);
  --font-mono: var(--font-jb-mono);
}
```

- [ ] **Step 2: Update the dark body background**

In `app/globals.css`, replace the `.dark body` rule (lines 33-39):

```css
.dark body {
  background:
    radial-gradient(ellipse at 20% 0%, color-mix(in srgb, var(--color-accent) 8%, transparent) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 100%, rgba(245, 166, 35, 0.05) 0%, transparent 50%),
    var(--color-dark-bg);
  color: var(--color-dark-text);
}
```

with:

```css
.dark body {
  background:
    radial-gradient(ellipse at 20% 0%, color-mix(in srgb, var(--color-dark-card-accent) 8%, transparent) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 100%, rgba(245, 166, 35, 0.05) 0%, transparent 50%),
    var(--color-dark-bg);
  color: var(--color-dark-text);
}
```

---

### Task 4: Update template components to use new tokens

**Repo:** SchoolWatch (`C:/Dev/SchoolWatch`)
**Files:**
- Modify: All 8 component files in `components/`

This is a bulk find-and-replace across all component files. The token mapping is:

| Old token | New token | Semantic meaning |
|-----------|-----------|-----------------|
| `text-navy` | `text-heading` | Heading text color |
| `bg-navy` | `bg-heading` | (unused currently) |
| `text-red` (in non-hover, non-interactive) | `text-card-accent` | Accent labels, countdown |
| `bg-red` (badges, active tabs, buttons) | `bg-badge` | Badge/button backgrounds |
| `bg-red-light` (badge palette) | `bg-badge/70` | Lighter badge variant |
| `text-red-light` | `text-card-accent/70` | Lighter accent text |
| `border-red` | `border-card-accent` | Accent borders |
| `ring-red` | `ring-card-accent` | Focus rings |
| `hover:text-red` | `hover:text-card-accent` | Hover accent |
| `hover:bg-red` | `hover:bg-card-accent` | Hover accent bg |
| `hover:border-red` | `hover:border-card-accent` | Hover accent border |
| `bg-white` (nav bar) | `bg-navbar` | Nav background |
| `bg-white` (cards) | `bg-surface` | Card background |
| `dark:bg-dark-bg` | `dark:bg-dark-navbar` (nav) or `dark:bg-dark-bg` (page) | Dark backgrounds |
| `dark:bg-dark-surface` | `dark:bg-dark-surface` | Dark card bg (unchanged token name) |
| `dark:text-red` | `dark:text-dark-card-accent` | Dark accent text |
| `dark:border-red` | `dark:border-dark-card-accent` | Dark accent borders |
| `var(--color-red-light)` (SVG) | `var(--color-ring)` | Timer ring gradient start |
| `var(--color-red)` (SVG) | `var(--color-ring)` | Timer ring gradient end |

- [ ] **Step 1: Update Navbar.tsx**

Apply these replacements in `components/Navbar.tsx`:

1. Line 58: `hover:border-red/30` → `hover:border-card-accent/30`, `dark:hover:border-red/40` → `dark:hover:border-card-accent/40`
2. Line 61: `text-red` → `text-card-accent`
3. Line 62: `group-hover:bg-red/20` → `group-hover:bg-card-accent/20`, `dark:group-hover:bg-red/30` → `dark:group-hover:bg-card-accent/30`
4. Line 64: `bg-red` → `bg-card-accent`
5. Line 67: `text-red` → `text-card-accent`
6. Line 77: `text-red` → `text-card-accent`, `hover:border-red/30` → `hover:border-card-accent/30`, `dark:text-red-light` → `dark:text-dark-card-accent`, `dark:hover:border-red/40` → `dark:hover:border-card-accent/40`
7. Line 93: `hover:bg-red/5` → `hover:bg-card-accent/5`, `hover:text-red` → `hover:text-card-accent`
8. Line 107: `bg-white` → `bg-navbar`, `dark:bg-dark-bg` → `dark:bg-dark-navbar`
9. Line 121: `text-navy` → `text-nav-text`
10. Line 137: `text-red` → `text-nav-text` (active link)
11. Line 138: `hover:text-red` → `hover:text-nav-text`
12. Line 157: `hover:text-red` → `hover:text-card-accent`
13. Line 194: `bg-white` → `bg-navbar`, `dark:bg-dark-bg` → `dark:bg-dark-navbar`
14. Line 207: `bg-red/5 text-red` → `bg-card-accent/5 text-nav-text`
15. Line 208: `hover:bg-red/5 hover:text-red` → `hover:bg-card-accent/5 hover:text-nav-text`

- [ ] **Step 2: Update DayStatusHero.tsx**

In `components/DayStatusHero.tsx`:

1. Lines 27-28 badge palette: `border-red/20 bg-red-light` → `border-badge/20 bg-badge/70`, `border-red/20 bg-red` → `border-badge/20 bg-badge`
2. Line 91: `text-navy` → `text-heading`
3. Line 101: `border-red/20 bg-red` → `border-badge/20 bg-badge`

- [ ] **Step 3: Update PeriodCountdown.tsx**

In `components/PeriodCountdown.tsx`:

1. Lines 27-28 badge palette: same as DayStatusHero
2. Line 146 SVG gradient: `var(--color-red-light)` → `var(--color-ring)` with 70% opacity: change to `stopColor="var(--color-ring)" stopOpacity="0.7"`
3. Line 147 SVG gradient: `var(--color-red)` → `var(--color-ring)`
4. Line 173: `text-red` → `text-ring`
5. Line 180: `bg-red` → `bg-card-accent`
6. Line 203: `text-red` → `text-ring`

- [ ] **Step 4: Update QuickGlanceCards.tsx**

In `components/QuickGlanceCards.tsx`:

1. Line 81: `border-red/15` → `border-card-accent/15`, `border-l-red` → `border-l-card-accent`, `bg-white` → `bg-surface`, `hover:bg-red/5` → `hover:bg-card-accent/5`, `dark:border-l-red` → `dark:border-l-dark-card-accent`, `dark:bg-dark-surface` stays
2. Line 83: `text-red` → `text-card-accent`
3. Line 103: same as line 81
4. Line 105: `text-red` → `text-card-accent`, `dark:text-red-light` → `dark:text-dark-card-accent`

- [ ] **Step 5: Update ScheduleView.tsx**

In `components/ScheduleView.tsx`:

1. Line 85: `bg-red` → `bg-badge`
2. Line 86: `bg-white dark:bg-dark-surface` → `bg-surface dark:bg-dark-surface`
3. Line 97: `bg-white dark:bg-dark-surface` → `bg-surface dark:bg-dark-surface`
4. Line 104: `bg-red` → `bg-badge`
5. Line 106: `ring-red/30` → `ring-badge/30`
6. Line 131: `border-red dark:border-red/40 bg-red/5` → `border-card-accent dark:border-dark-card-accent/40 bg-card-accent/5`
7. Line 134: `bg-white dark:bg-dark-surface` → `bg-surface dark:bg-dark-surface`
8. Line 143: `bg-red` → `bg-badge`
9. Line 149: `text-navy` → `text-heading`
10. Line 160: `text-red` → `text-card-accent`
11. Line 176: `hover:border-red/30 hover:text-red` → `hover:border-card-accent/30 hover:text-card-accent`
12. Line 202: `bg-white dark:bg-dark-bg` → `bg-surface dark:bg-dark-bg`

- [ ] **Step 6: Update CalendarView.tsx**

In `components/CalendarView.tsx`:

1. Line 147: `hover:border-red/30` → `hover:border-card-accent/30`
2. Line 168: same
3. Line 215: `bg-red/10 dark:bg-red/15` → `bg-card-accent/10 dark:bg-dark-card-accent/15`
4. Line 217: `bg-red/5` → `bg-card-accent/5`
5. Line 219: `bg-white dark:bg-dark-surface` → `bg-surface dark:bg-dark-surface`
6. Line 221: `hover:bg-red/5 dark:hover:bg-red/10` → `hover:bg-card-accent/5 dark:hover:bg-dark-card-accent/10`
7. Line 228: `bg-red` → `bg-badge`

- [ ] **Step 7: Update EventsList.tsx**

In `components/EventsList.tsx`:

1. Line 82: `hover:text-red` → `hover:text-card-accent`
2. Line 87: `bg-white` → `bg-surface`
3. Line 94: `bg-red` → `bg-badge`

- [ ] **Step 8: Update TodoList.tsx**

In `components/TodoList.tsx`:

1. Line 19: `bg-red` → `bg-badge`
2. Line 20: `bg-red-light` → `bg-badge/70`
3. Line 21: `bg-red` → `bg-badge`
4. Line 113: `focus:border-red/40` → `focus:border-card-accent/40`
5. Line 128: `bg-red` → `bg-badge`, `hover:bg-red-light` → `hover:bg-badge/70`
6. Line 142: `bg-red` → `bg-badge`
7. Line 162: `border-red bg-red` → `border-badge bg-badge`, `hover:border-red` → `hover:border-badge`
8. Line 192: `hover:text-red` → `hover:text-card-accent`
9. Line 232: `hover:text-red` → `hover:text-card-accent`

- [ ] **Step 9: Commit template component changes**

```bash
cd C:/Dev/SchoolWatch
git add components/
git commit -m "Migrate components to zone-based color tokens"
```

---

### Task 5: Update template school.config.ts and examples

**Repo:** SchoolWatch (`C:/Dev/SchoolWatch`)
**Files:**
- Modify: `school.config.ts:49-56`
- Modify: `examples/simple-school.config.ts`
- Modify: `examples/block-schedule.config.ts`
- Modify: `examples/rotating-schedule.config.ts`

- [ ] **Step 1: Update school.config.ts colors**

Replace the colors block (lines 49-56) with:

```ts
  colors: {
    light: {
      navbar: "#ffffff",
      navText: "#003da5",
      background: "#f5f7fa",
      heading: "#003da5",
      ring: "#003da5",
      surface: "#ffffff",
      cardAccent: "#003da5",
      badge: "#003da5",
    },
    dark: {
      navbar: "#0a1628",
      navText: "#ffffff",
      background: "#0a1628",
      heading: "#f1f5f9",
      ring: "#1a5fc7",
      surface: "rgba(10, 22, 50, 0.85)",
      cardAccent: "#003da5",
      badge: "#003da5",
    },
  },
```

- [ ] **Step 2: Update all three example configs**

Apply the same pattern to each example, converting their old `{ primary, primaryLight, accent, accentLight, darkBg, darkSurface }` to the new `{ light: {...}, dark: {...} }` format using the same field mapping:

- `navbar` light = `"#ffffff"`, dark = old `darkBg`
- `navText` light = old `primary`, dark = `"#ffffff"`
- `background` light = `"#f5f7fa"`, dark = old `darkBg`
- `heading` light = old `primary`, dark = `"#f1f5f9"`
- `ring` light = old `accent`, dark = old `accentLight`
- `surface` light = `"#ffffff"`, dark = old `darkSurface`
- `cardAccent` light = old `accent`, dark = old `accent`
- `badge` light = old `accent`, dark = old `accent`

- [ ] **Step 3: Build and verify**

```bash
cd C:/Dev/SchoolWatch && npm run build
```

Expected: Clean build with no TypeScript errors.

- [ ] **Step 4: Commit and push**

```bash
cd C:/Dev/SchoolWatch
git add -A
git commit -m "feat: zone-based color system — 8 customizable zones per mode

Replace flat 6-field color config with nested light/dark objects,
each with 8 zone-specific color values. Components migrated to
new semantic tokens (text-heading, bg-navbar, text-card-accent, etc.)."
git push
```

---

### Task 6: Update wizard types

**Repo:** schoolwatch-wizard (`C:/Dev/schoolwatch-wizard`)
**Files:**
- Modify: `lib/types.ts`

- [ ] **Step 1: Replace the colors type in WizardFormData**

In `lib/types.ts`, replace:

```ts
  colors: {
    primary: string;
    accent: string;
  };
```

with:

```ts
  colors: {
    primary: string;
    accent: string;
    light: {
      navbar: string;
      navText: string;
      background: string;
      heading: string;
      ring: string;
      surface: string;
      cardAccent: string;
      badge: string;
    };
    dark: {
      navbar?: string;
      navText?: string;
      background?: string;
      heading?: string;
      ring?: string;
      surface?: string;
      cardAccent?: string;
      badge?: string;
    };
  };
```

---

### Task 7: Rewrite wizard colors.ts

**Repo:** schoolwatch-wizard (`C:/Dev/schoolwatch-wizard`)
**Files:**
- Rewrite: `lib/colors.ts`

- [ ] **Step 1: Replace the entire file**

Replace `lib/colors.ts` with:

```ts
export type ZoneColors = {
  navbar: string;
  navText: string;
  background: string;
  heading: string;
  ring: string;
  surface: string;
  cardAccent: string;
  badge: string;
};

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const match = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return null;
  return { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) };
}

export function lightenHex(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.min(255, rgb.r + Math.round((255 - rgb.r) * amount));
  const g = Math.min(255, rgb.g + Math.round((255 - rgb.g) * amount));
  const b = Math.min(255, rgb.b + Math.round((255 - rgb.b) * amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function darkenHex(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const r = Math.max(0, Math.round(rgb.r * (1 - amount)));
  const g = Math.max(0, Math.round(rgb.g * (1 - amount)));
  const b = Math.max(0, Math.round(rgb.b * (1 - amount)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function generateDarkBg(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#0a1628";
  const r = Math.round(rgb.r * 0.08);
  const g = Math.round(rgb.g * 0.08);
  const b = Math.round(rgb.b * 0.15);
  return `#${Math.max(5, r).toString(16).padStart(2, "0")}${Math.max(10, g).toString(16).padStart(2, "0")}${Math.max(20, b).toString(16).padStart(2, "0")}`;
}

function generateDarkSurface(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "rgba(10, 22, 50, 0.85)";
  const r = Math.round(rgb.r * 0.08);
  const g = Math.round(rgb.g * 0.08);
  const b = Math.round(rgb.b * 0.15);
  return `rgba(${Math.max(5, r)}, ${Math.max(10, g)}, ${Math.max(20, b)}, 0.85)`;
}

export function defaultLightColors(primary: string, accent: string): ZoneColors {
  return {
    navbar: "#ffffff",
    navText: primary,
    background: "#f5f7fa",
    heading: primary,
    ring: accent,
    surface: "#ffffff",
    cardAccent: accent,
    badge: accent,
  };
}

export function deriveDarkColors(light: ZoneColors): ZoneColors {
  const darkBg = generateDarkBg(light.heading);
  return {
    navbar: darkBg,
    navText: "#ffffff",
    background: darkBg,
    heading: "#f1f5f9",
    ring: lightenHex(light.ring, 0.15),
    surface: generateDarkSurface(light.heading),
    cardAccent: light.cardAccent,
    badge: light.badge,
  };
}

export function resolveDarkColors(light: ZoneColors, overrides: Partial<ZoneColors>): ZoneColors {
  const derived = deriveDarkColors(light);
  return { ...derived, ...stripUndefined(overrides) };
}

function stripUndefined(obj: Partial<ZoneColors>): Partial<ZoneColors> {
  const result: Partial<ZoneColors> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key as keyof ZoneColors] = value;
    }
  }
  return result;
}
```

---

### Task 8: Update wizard config-generator.ts

**Repo:** schoolwatch-wizard (`C:/Dev/schoolwatch-wizard`)
**Files:**
- Modify: `lib/config-generator.ts`

- [ ] **Step 1: Replace the color generation logic**

In `lib/config-generator.ts`, remove the `import { deriveColors } from "./colors"` and add `import { resolveDarkColors } from "./colors"`.

Then replace the colors section of the `generateConfigTs` function. Find:

```ts
  const { school, colors: inputColors, lunchWaves, calendar, features } = data;
  const colors = deriveColors(inputColors.primary, inputColors.accent);
```

Replace with:

```ts
  const { school, lunchWaves, calendar, features } = data;
  const lightColors = data.colors.light;
  const darkColors = resolveDarkColors(lightColors, data.colors.dark);
```

Then replace the colors block in the template string. Find the section that starts with `  colors: {` and ends with `  },` (the one with primary, primaryLight, etc.) and replace with:

```ts
  colors: {
    light: {
      navbar: "${esc(lightColors.navbar)}",
      navText: "${esc(lightColors.navText)}",
      background: "${esc(lightColors.background)}",
      heading: "${esc(lightColors.heading)}",
      ring: "${esc(lightColors.ring)}",
      surface: "${esc(lightColors.surface)}",
      cardAccent: "${esc(lightColors.cardAccent)}",
      badge: "${esc(lightColors.badge)}",
    },
    dark: {
      navbar: "${esc(darkColors.navbar)}",
      navText: "${esc(darkColors.navText)}",
      background: "${esc(darkColors.background)}",
      heading: "${esc(darkColors.heading)}",
      ring: "${esc(darkColors.ring)}",
      surface: "${esc(darkColors.surface)}",
      cardAccent: "${esc(darkColors.cardAccent)}",
      badge: "${esc(darkColors.badge)}",
    },
  },
```

---

### Task 9: Update wizard validation.ts

**Repo:** schoolwatch-wizard (`C:/Dev/schoolwatch-wizard`)
**Files:**
- Modify: `lib/validation.ts:38-43`

- [ ] **Step 1: Update validateColors**

Replace the current `validateColors` function:

```ts
function validateColors(data: WizardFormData): string[] {
  const errors: string[] = [];
  if (!HEX_RE.test(data.colors.primary)) errors.push("Primary color must be a valid hex (e.g. #003da5)");
  if (!HEX_RE.test(data.colors.accent)) errors.push("Accent color must be a valid hex (e.g. #003da5)");
  return errors;
}
```

with:

```ts
function validateColors(data: WizardFormData): string[] {
  const errors: string[] = [];
  if (!HEX_RE.test(data.colors.primary)) errors.push("Primary color must be a valid hex (e.g. #003da5)");
  if (!HEX_RE.test(data.colors.accent)) errors.push("Accent color must be a valid hex (e.g. #003da5)");
  const zones = data.colors.light;
  for (const [key, value] of Object.entries(zones)) {
    if (!HEX_RE.test(value)) errors.push(`Light ${key} must be a valid hex color`);
  }
  if (data.colors.dark) {
    for (const [key, value] of Object.entries(data.colors.dark)) {
      if (value && !HEX_RE.test(value)) errors.push(`Dark ${key} must be a valid hex color`);
    }
  }
  return errors;
}
```

---

### Task 10: Update wizard WizardShell default form data

**Repo:** schoolwatch-wizard (`C:/Dev/schoolwatch-wizard`)
**Files:**
- Modify: `components/WizardShell.tsx:28-31`

- [ ] **Step 1: Update DEFAULT_FORM_DATA colors**

Replace:

```ts
  colors: {
    primary: "#003da5",
    accent: "#003da5",
  },
```

with:

```ts
  colors: {
    primary: "#003da5",
    accent: "#003da5",
    light: {
      navbar: "#ffffff",
      navText: "#003da5",
      background: "#f5f7fa",
      heading: "#003da5",
      ring: "#003da5",
      surface: "#ffffff",
      cardAccent: "#003da5",
      badge: "#003da5",
    },
    dark: {},
  },
```

---

### Task 11: Rewrite wizard StepColors.tsx

**Repo:** schoolwatch-wizard (`C:/Dev/schoolwatch-wizard`)
**Files:**
- Rewrite: `components/wizard/StepColors.tsx`

This is the largest task — the interactive mockup with clickable zones. The component should be written as a new file with these sub-components:

- `DashboardMockup` — the scaled-down dashboard preview (nav, hero, ring, cards)
- `ZonePopover` — color picker popover anchored to clicked zone
- `StepColors` — main component with primary/accent seeds, mockup, dark mode section

- [ ] **Step 1: Write the complete StepColors component**

Replace the entire `components/wizard/StepColors.tsx` file with a new implementation. The component should:

1. **Seed inputs at top**: Primary + Accent hex pickers (same UI pattern as current — `<input type="color">` + text input). Changing primary calls `defaultLightColors()` and updates all light zones that aren't in the `overriddenZones` set. Same for accent.

2. **Dashboard mockup**: A `<div>` recreation of the real dashboard showing:
   - Nav bar (using `light.navbar` bg, `light.navText` text)
   - "It's Friday" heading (using `light.heading`)
   - Day type badge (using `light.badge`)
   - Timer ring SVG (using `light.ring`)
   - Two glance cards (using `light.surface` bg, `light.cardAccent` borders/labels)
   
   Each zone `<div>` has:
   - `onClick` handler that sets `activeZone` state
   - Hover style: `outline: 2px dashed` with zone color
   - Cursor pointer

3. **Zone popover**: When `activeZone` is set, a positioned popover appears near the clicked zone with:
   - Zone name label
   - `<input type="color">` + hex text input
   - "Reset to default" button
   - Close button
   - Changes update `data.colors.light[zone]` and add zone to `overriddenZones` set

4. **Dark mode section**: Below the mockup, a collapsible section:
   - Toggle between "Preview" (shows dark mockup read-only) and "Customize" (shows dark mockup with clickable zones)
   - Dark mockup uses `resolveDarkColors(light, dark)` for display
   - Clicking a dark zone opens a popover that sets `data.colors.dark[zone]`

5. **State management**:
   - `overriddenZones: Set<string>` — tracks which light zones the user manually clicked (not via seed inputs)
   - `activeZone: { zone: string; mode: "light" | "dark" } | null` — which zone's popover is open
   - `darkMode: "hidden" | "preview" | "customize"` — dark section state

The full implementation code for this component is ~350 lines. The implementing agent should build it following the patterns from the existing StepColors.tsx (same `StepProps` type, same `inputClass`/`labelClass` patterns, same `onChange` callback pattern) and the mockup structure described above.

Key implementation details:

- The mockup should be approximately 500px tall, using inline styles for zone colors (not Tailwind classes, since colors are dynamic)
- Zone hover effect: `outline: 2px dashed rgba(255,255,255,0.5)` with `cursor: pointer`
- Popover positioning: absolute positioned relative to the mockup container, with `top`/`left` calculated from the zone's position
- SVG timer ring: same structure as `PeriodCountdown.tsx` but simplified (static, no animation)

---

### Task 12: Update wizard edit page — old format migration

**Repo:** schoolwatch-wizard (`C:/Dev/schoolwatch-wizard`)
**Files:**
- Modify: `app/edit/page.tsx`

- [ ] **Step 1: Add migration logic**

Import the color functions at the top of `app/edit/page.tsx`:

```ts
import { defaultLightColors, deriveDarkColors } from "@/lib/colors";
```

Then in the `EditPageContent` component, after `setSchool(schoolData)` and before `setStatus("ready")`, add migration logic:

```ts
        const schoolData = await schoolRes.json();
        // Migrate old color format (flat { primary, accent }) to new zone format
        const cfg = schoolData.configData;
        if (cfg?.colors && !cfg.colors.light) {
          const primary = cfg.colors.primary || "#003da5";
          const accent = cfg.colors.accent || "#003da5";
          const light = defaultLightColors(primary, accent);
          cfg.colors = { primary, accent, light, dark: {} };
        }
        setSchool(schoolData);
```

---

### Task 13: Final verification — both repos

- [ ] **Step 1: Build template repo**

```bash
cd C:/Dev/SchoolWatch && npm run build
```

Expected: Clean build, no errors.

- [ ] **Step 2: Build wizard repo**

```bash
cd C:/Dev/schoolwatch-wizard && npm run build
```

Expected: Clean build, no errors.

- [ ] **Step 3: Commit wizard changes**

```bash
cd C:/Dev/schoolwatch-wizard
git add lib/types.ts lib/colors.ts lib/config-generator.ts lib/validation.ts components/wizard/StepColors.tsx components/WizardShell.tsx app/edit/page.tsx
git commit -m "feat: zone-based color customizer — interactive mockup with 8 zones

Replace 2-input color picker with clickable dashboard mockup.
Schools customize 8 zones (navbar, heading, ring, cards, etc.)
independently for light mode, with auto-derived dark mode
and optional overrides. Old format auto-migrates on edit."
```

- [ ] **Step 4: Push both repos**

```bash
cd C:/Dev/SchoolWatch && git push
cd C:/Dev/schoolwatch-wizard && git push
```
