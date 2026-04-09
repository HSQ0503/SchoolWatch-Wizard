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

export function generateDarkBg(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#0a1628";
  const r = Math.round(rgb.r * 0.08);
  const g = Math.round(rgb.g * 0.08);
  const b = Math.round(rgb.b * 0.15);
  return `#${Math.max(5, r).toString(16).padStart(2, "0")}${Math.max(10, g).toString(16).padStart(2, "0")}${Math.max(20, b).toString(16).padStart(2, "0")}`;
}

export function generateDarkSurface(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "rgba(10, 22, 50, 0.85)";
  const r = Math.round(rgb.r * 0.08);
  const g = Math.round(rgb.g * 0.08);
  const b = Math.round(rgb.b * 0.15);
  return `rgba(${Math.max(5, r)}, ${Math.max(10, g)}, ${Math.max(20, b)}, 0.85)`;
}

export function deriveColors(primary: string, accent: string) {
  return {
    primary,
    primaryLight: lightenHex(primary, 0.25),
    accent,
    accentLight: lightenHex(accent, 0.25),
    darkBg: generateDarkBg(primary),
    darkSurface: generateDarkSurface(primary),
  };
}
