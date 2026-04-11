# Zone-Based Color Customizer — Design Spec

## Goal

Replace the current 2-input color picker (primary + accent) with an interactive visual customizer. Schools click directly on a mockup of their dashboard to customize 8 color zones, with auto-derived dark mode and optional overrides. Changes span two repos: the wizard (schoolwatch-wizard) and the template (SchoolWatch).

## Color Zones

Each zone is independently customizable for light mode. Dark mode is auto-derived with optional overrides.

| # | Zone | What it controls | Light default | Dark default |
|---|------|-----------------|---------------|--------------|
| 1 | `navbar` | Nav bar background | `#ffffff` | Very dark shade of `heading` |
| 2 | `navText` | App name + active nav link color | primary input | `#ffffff` |
| 3 | `background` | Page background | `#f5f7fa` | Very dark shade of `heading` (darker than navbar) |
| 4 | `heading` | "It's Friday" day-of-week text | primary input | `#f1f5f9` (near-white) |
| 5 | `ring` | Timer ring gradient + countdown number | accent input | `lighten(light.ring, 0.15)` |
| 6 | `surface` | Card/hero background | `#ffffff` | `rgba` of `heading` at 0.85 opacity |
| 7 | `cardAccent` | Card left border + "NEXT EVENT" / "TO-DO" labels | accent input | Same as light value |
| 8 | `badge` | "REGULAR DAY" pill badge background | accent input | Same as light value |

## Data Model

### Wizard — `WizardFormData.colors`

```ts
type ZoneColors = {
  navbar: string
  navText: string
  background: string
  heading: string
  ring: string
  surface: string
  cardAccent: string
  badge: string
}

type ColorsConfig = {
  primary: string          // quick-start seed input (wizard UI only)
  accent: string           // quick-start seed input (wizard UI only)
  light: ZoneColors        // all 8 zones, always fully populated
  dark: Partial<ZoneColors> // only user-overridden zones; undefined = auto-derive
}
```

`primary` and `accent` are wizard-only seed values. They are stripped before saving to `configData` and before generating the config file. Only `light` and `dark` (fully resolved) are persisted.

### Template — `SchoolConfig.colors`

```ts
type SchoolColors = {
  light: ZoneColors  // all 8, fully resolved
  dark: ZoneColors   // all 8, fully resolved (wizard derives missing values before emitting)
}
```

No optional fields — the wizard always emits fully resolved values for both modes.

## Wizard Changes (schoolwatch-wizard)

### `lib/types.ts`

Replace `colors: { primary: string; accent: string }` with the `ColorsConfig` type above.

### `lib/colors.ts`

Replace `deriveColors()` with:

- `defaultLightColors(primary: string, accent: string): ZoneColors` — generates all 8 light zone defaults from the two seed inputs.
- `deriveDarkColors(light: ZoneColors): ZoneColors` — generates all 8 dark zone values from the light values using darkening/lightening logic.
- `resolveDarkColors(light: ZoneColors, overrides: Partial<ZoneColors>): ZoneColors` — merges user overrides onto auto-derived dark values.

### `lib/config-generator.ts`

Update `generateConfigTs()` to emit the new nested `colors: { light: {...}, dark: {...} }` structure instead of the flat 6-field format.

### `lib/validation.ts`

Update `validateColors()` (step 1) to validate all populated zone values are valid hex colors.

### `components/wizard/StepColors.tsx` — Full Rewrite

**Layout:**

1. **Quick-start inputs** at top: Primary + Accent color pickers (same UI as today). Changing these calls `defaultLightColors()` to bulk-update all light zones that haven't been manually overridden by the user.
2. **Dashboard mockup** (light mode) — a scaled-down static recreation of the real dashboard showing: nav bar, "It's Friday" heading, day type badge, timer ring with countdown, two glance cards. Each zone has a subtle dashed outline on hover.
3. **Click a zone** → popover anchored to that zone with: zone name, `<input type="color">` + hex text input, "Reset to default" link. Mockup updates live.
4. **Dark mode section** below the mockup, collapsed by default:
   - Label: "Dark Mode — auto-generated from your light colors"
   - [Preview dark mode] button — toggles the mockup to show auto-derived dark version (read-only)
   - [Customize dark mode] button — expands the same interactive mockup in dark mode, click zones to override
   - Override zones show a small indicator dot; "Reset" reverts to auto-derived

**Tracking manual overrides:** The component maintains a `Set<string>` of zone keys the user has manually changed (via zone clicks, not via the primary/accent quick-start). When primary/accent change, only non-overridden zones get updated. A "Reset all to defaults" link clears all overrides.

### `app/edit/page.tsx` — Old Format Migration

When loading a school with the old `{ primary, accent }` color format in `configData`, detect it (check for absence of `light` key) and migrate on load:

```ts
if (!configData.colors.light) {
  const light = defaultLightColors(configData.colors.primary, configData.colors.accent)
  const dark = deriveDarkColors(light)
  configData.colors = { primary: configData.colors.primary, accent: configData.colors.accent, light, dark: {} }
}
```

This happens client-side in the edit page before passing data to the wizard. No database migration needed.

## Template Changes (SchoolWatch)

### `lib/types/config.ts`

Replace the current flat `colors` type:

```ts
colors: {
  primary: string
  primaryLight: string
  accent: string
  accentLight: string
  darkBg: string
  darkSurface: string
}
```

With:

```ts
colors: {
  light: {
    navbar: string
    navText: string
    background: string
    heading: string
    ring: string
    surface: string
    cardAccent: string
    badge: string
  }
  dark: {
    navbar: string
    navText: string
    background: string
    heading: string
    ring: string
    surface: string
    cardAccent: string
    badge: string
  }
}
```

### `app/layout.tsx`

Set 16 CSS custom properties on `<html>` instead of 6:

```
--school-light-navbar, --school-light-navText, --school-light-background, --school-light-heading,
--school-light-ring, --school-light-surface, --school-light-cardAccent, --school-light-badge,
--school-dark-navbar, --school-dark-navText, --school-dark-background, --school-dark-heading,
--school-dark-ring, --school-dark-surface, --school-dark-cardAccent, --school-dark-badge
```

### `app/globals.css`

Replace current theme tokens. Light mode (default):

```css
--color-navbar: var(--school-light-navbar);
--color-nav-text: var(--school-light-navText);
--color-bg: var(--school-light-background);
--color-heading: var(--school-light-heading);
--color-ring: var(--school-light-ring);
--color-surface: var(--school-light-surface);
--color-card-accent: var(--school-light-cardAccent);
--color-badge: var(--school-light-badge);
```

Dark mode (under `.dark` variant):

```css
--color-navbar: var(--school-dark-navbar);
--color-nav-text: var(--school-dark-navText);
/* ... etc */
```

### Component Updates

All components switch from the old token names to the new ones:

| Old usage | New usage | Components |
|-----------|-----------|------------|
| `text-navy` | `text-heading` | DayStatusHero, ScheduleView |
| `text-red` (as accent) | `text-card-accent` | QuickGlanceCards, PeriodCountdown |
| `bg-red` (badges) | `bg-badge` | PeriodCountdown, DayStatusHero, ScheduleView |
| `text-red` (nav) | `text-nav-text` | Navbar |
| `bg-white` (nav) | `bg-navbar` | Navbar |
| `bg-bg` / `bg-white` (cards) | `bg-surface` | QuickGlanceCards, PeriodCountdown |
| `var(--color-red-light)` / `var(--color-red)` (SVG) | `var(--color-ring)` | PeriodCountdown gradient |
| `bg-dark-bg` | `bg-bg` (resolved per mode) | All dark mode usages |

### `examples/*.config.ts`

Update the 3 example configs to use the new nested color format.

## What Is NOT Changing

- Schedule, lunch waves, calendar, features steps — unchanged
- Deploy / redeploy API routes — unchanged (they pass through `configData` as-is)
- Auth flow — unchanged
- Prisma schema — unchanged (`configData` is already `Json` type)

## Scope Boundary

This spec covers the color customizer only. The following are explicitly out of scope:

- Font customization
- Layout customization
- Per-page color overrides
- CSS export / custom CSS injection
