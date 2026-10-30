import {
  argbFromHex,
  hexFromArgb,
  Hct,
  MaterialDynamicColors,
  SchemeContent,
} from "@material/material-color-utilities";
import type { DynamicColor, DynamicScheme } from "@material/material-color-utilities";
import { applyColorRecordToDocument, clearColorRecordFromDocument, DYNAMIC_COLOR_STORAGE_KEY, readStoredColorRecord } from "./dynamic-color-state";

export { DYNAMIC_COLOR_STORAGE_KEY } from "./dynamic-color-state";
export type DynamicColorRoles = Record<string, string>;
export type DynamicColorRecord = { seed: string; light: DynamicColorRoles; dark: DynamicColorRoles };

const colorPattern = /^#[\da-f]{6}$/i;
const textContrastPairs = [
  ["primary", "on-primary"], ["primary-container", "on-primary-container"],
  ["secondary", "on-secondary"], ["secondary-container", "on-secondary-container"],
  ["tertiary", "on-tertiary"], ["tertiary-container", "on-tertiary-container"],
  ["error", "on-error"], ["error-container", "on-error-container"],
  ["background", "on-background"], ["surface", "on-surface"],
  ["surface-variant", "on-surface-variant"], ["inverse-surface", "inverse-on-surface"],
] as const;
const surfaceRoles = ["background", "surface", "surface-variant", "surface-container-lowest", "surface-container-low", "surface-container", "surface-container-high", "surface-container-highest"];
const requiredRoles = [
  "primary", "on-primary", "primary-container", "on-primary-container",
  "secondary", "on-secondary", "secondary-container", "on-secondary-container",
  "tertiary", "on-tertiary", "tertiary-container", "on-tertiary-container",
  "error", "on-error", "error-container", "on-error-container",
  "background", "on-background", "surface", "on-surface", "surface-variant", "on-surface-variant",
  "surface-container-lowest", "surface-container-low", "surface-container", "surface-container-high", "surface-container-highest",
  "surface-dim", "surface-bright", "outline", "outline-variant", "inverse-surface", "inverse-on-surface", "inverse-primary",
  "surface-tint", "shadow", "scrim",
];

function luminance(hex: string) {
  const rgb = hex.slice(1).match(/.{2}/g)!.map((channel) => parseInt(channel, 16) / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrast(first: string, second: string) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function adjustForeground(roles: DynamicColorRoles, foregroundName: string, backgroundNames: string[], minimum: number) {
  const foreground = Hct.fromInt(argbFromHex(roles[foregroundName]));
  if (backgroundNames.every((name) => contrast(roles[foregroundName], roles[name]) >= minimum)) return;
  const candidates = Array.from({ length: 101 }, (_, tone) => {
    const color = hexFromArgb(Hct.from(foreground.hue, foreground.chroma, tone).toInt()).toUpperCase();
    return { color, distance: Math.abs(tone - foreground.tone) };
  }).filter((candidate) => backgroundNames.every((name) => contrast(candidate.color, roles[name]) >= minimum))
    .sort((first, second) => first.distance - second.distance);
  if (candidates[0]) roles[foregroundName] = candidates[0].color;
  else {
    const black = "#000000";
    const white = "#FFFFFF";
    const safe = [black, white].find((candidate) => backgroundNames.every((name) => contrast(candidate, roles[name]) >= minimum));
    if (safe) roles[foregroundName] = safe;
  }
}

function ensureRoleContrast(roles: DynamicColorRoles) {
  for (const [background, foreground] of textContrastPairs) adjustForeground(roles, foreground, [background], 4.5);
  for (const accent of ["primary", "secondary", "tertiary"]) adjustForeground(roles, accent, surfaceRoles, 4.5);
  adjustForeground(roles, "on-surface", surfaceRoles, 4.5);
  adjustForeground(roles, "on-surface-variant", surfaceRoles, 4.5);
  adjustForeground(roles, "outline", surfaceRoles, 3);
  adjustForeground(roles, "outline-variant", surfaceRoles, 3);
  return roles;
}

function passesContrast(roles: DynamicColorRoles) {
  return textContrastPairs.every(([surface, foreground]) => contrast(roles[surface], roles[foreground]) >= 4.5)
    && ["on-surface", "on-surface-variant"].every((foreground) => surfaceRoles.every((surface) => contrast(roles[surface], roles[foreground]) >= 4.5))
    && ["outline", "outline-variant"].every((foreground) => surfaceRoles.every((surface) => contrast(roles[surface], roles[foreground]) >= 3));
}

function colorRoles(scheme: SchemeContent): DynamicColorRoles {
  const dynamicColors = new MaterialDynamicColors();
  const role = (dynamicColor: DynamicColor) => hexFromArgb(dynamicColor.getArgb(scheme as DynamicScheme)).toUpperCase();
  return {
    primary: role(dynamicColors.primary()), "on-primary": role(dynamicColors.onPrimary()),
    "primary-container": role(dynamicColors.primaryContainer()), "on-primary-container": role(dynamicColors.onPrimaryContainer()),
    secondary: role(dynamicColors.secondary()), "on-secondary": role(dynamicColors.onSecondary()),
    "secondary-container": role(dynamicColors.secondaryContainer()), "on-secondary-container": role(dynamicColors.onSecondaryContainer()),
    tertiary: role(dynamicColors.tertiary()), "on-tertiary": role(dynamicColors.onTertiary()),
    "tertiary-container": role(dynamicColors.tertiaryContainer()), "on-tertiary-container": role(dynamicColors.onTertiaryContainer()),
    error: role(dynamicColors.error()), "on-error": role(dynamicColors.onError()),
    "error-container": role(dynamicColors.errorContainer()), "on-error-container": role(dynamicColors.onErrorContainer()),
    background: role(dynamicColors.background()), "on-background": role(dynamicColors.onBackground()),
    surface: role(dynamicColors.surface()), "on-surface": role(dynamicColors.onSurface()),
    "surface-variant": role(dynamicColors.surfaceVariant()), "on-surface-variant": role(dynamicColors.onSurfaceVariant()),
    "surface-container-lowest": role(dynamicColors.surfaceContainerLowest()),
    "surface-container-low": role(dynamicColors.surfaceContainerLow()),
    "surface-container": role(dynamicColors.surfaceContainer()),
    "surface-container-high": role(dynamicColors.surfaceContainerHigh()),
    "surface-container-highest": role(dynamicColors.surfaceContainerHighest()),
    "surface-dim": role(dynamicColors.surfaceDim()), "surface-bright": role(dynamicColors.surfaceBright()),
    outline: role(dynamicColors.outline()), "outline-variant": role(dynamicColors.outlineVariant()),
    "inverse-surface": role(dynamicColors.inverseSurface()), "inverse-on-surface": role(dynamicColors.inverseOnSurface()),
    "inverse-primary": role(dynamicColors.inversePrimary()), "surface-tint": role(dynamicColors.surfaceTint()),
    shadow: role(dynamicColors.shadow()), scrim: role(dynamicColors.scrim()),
  };
}

export function isDynamicColorRecord(value: unknown): value is DynamicColorRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<DynamicColorRecord>;
  return typeof record.seed === "string" && colorPattern.test(record.seed)
    && [record.light, record.dark].every((roles) => roles && requiredRoles.every((name) => colorPattern.test(roles[name] ?? "")));
}

export function readDynamicColorRecord() {
  return readStoredColorRecord();
}

export function applyDynamicColorRecord(record: DynamicColorRecord, theme: "light" | "dark") {
  applyColorRecordToDocument(record, theme);
}

export function clearDynamicColorRoles() {
  clearColorRecordFromDocument();
}

export function createDynamicColorRecord(seed: string): DynamicColorRecord | null {
  if (!colorPattern.test(seed)) return null;
  const generate = (isDark: boolean) => {
    for (const contrastLevel of [0.5, 1]) {
      const scheme = new SchemeContent(Hct.fromInt(argbFromHex(seed)), isDark, contrastLevel);
      const roles = ensureRoleContrast(colorRoles(scheme));
      if (requiredRoles.every((name) => colorPattern.test(roles[name] ?? "")) && passesContrast(roles)) return roles;
    }
    return null;
  };
  const light = generate(false);
  const dark = generate(true);
  return light && dark ? { seed: seed.toUpperCase(), light, dark } : null;
}

export function persistDynamicColorRecord(record: DynamicColorRecord) {
  try {
    localStorage.setItem(DYNAMIC_COLOR_STORAGE_KEY, JSON.stringify({ ...record, mode: "seed" }));
    localStorage.removeItem("portfolio-color-seed");
  }
  catch { /* The current page can still use the in-memory palette if storage is unavailable. */ }
}

export function resetDynamicColorRecord() {
  try {
    localStorage.setItem(DYNAMIC_COLOR_STORAGE_KEY, JSON.stringify({ mode: "default" }));
    // Remove the obsolete second source of truth introduced by an earlier picker version.
    localStorage.removeItem("portfolio-color-seed");
  } catch { /* The static Default palette still applies. */ }
  clearDynamicColorRoles();
}
