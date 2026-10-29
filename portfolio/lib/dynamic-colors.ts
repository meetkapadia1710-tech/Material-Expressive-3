import {
  argbFromHex,
  hexFromArgb,
  Hct,
  MaterialDynamicColors,
  SchemeExpressive,
} from "@material/material-color-utilities";
import type { DynamicColor, DynamicScheme } from "@material/material-color-utilities";

export const DYNAMIC_COLOR_STORAGE_KEY = "portfolio-color-palette";
export const DYNAMIC_COLOR_SEED_KEY = "portfolio-color-seed";

export type DynamicColorRoles = Record<string, string>;
export type DynamicColorRecord = {
  seed: string;
  light: DynamicColorRoles;
  dark: DynamicColorRoles;
};

const DEFAULT_SEED = "#6142AE";
const colorPattern = /^#[\da-f]{6}$/i;
const textContrastPairs = [
  ["primary", "on-primary"], ["primary-container", "on-primary-container"],
  ["secondary", "on-secondary"], ["secondary-container", "on-secondary-container"],
  ["tertiary", "on-tertiary"], ["tertiary-container", "on-tertiary-container"],
  ["error", "on-error"], ["error-container", "on-error-container"],
  ["background", "on-background"], ["surface", "on-surface"],
  ["surface-variant", "on-surface-variant"], ["inverse-surface", "inverse-on-surface"],
] as const;

function luminance(hex: string) {
  const rgb = hex.slice(1).match(/.{2}/g)!.map((channel) => parseInt(channel, 16) / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrast(first: string, second: string) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

function passesContrast(roles: DynamicColorRoles) {
  return textContrastPairs.every(([surface, foreground]) => contrast(roles[surface], roles[foreground]) >= 4.5)
    && contrast(roles.outline, roles.surface) >= 3
    && contrast(roles["outline-variant"], roles.surface) >= 3;
}

function collectLegacyPaletteAliases() {
  const aliases = new Map<string, string>();
  if (typeof document === "undefined") return aliases;
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        if (!(rule instanceof CSSStyleRule) || !rule.selectorText.split(",").some((selector) => selector.trim() === ":root")) continue;
        for (const property of Array.from({ length: rule.style.length }, (_, index) => rule.style.item(index))) {
          if (!property.startsWith("--palette-")) continue;
          const hex = rule.style.getPropertyValue(property).trim();
          if (colorPattern.test(hex)) aliases.set(property, hex.toUpperCase());
        }
      }
    } catch {
      // A browser may omit inaccessible stylesheet rules; semantic roles still work.
    }
  }
  return aliases;
}

function colorRoles(scheme: SchemeExpressive): DynamicColorRoles {
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
    "surface-container": role(dynamicColors.surfaceContainer()), "surface-container-low": role(dynamicColors.surfaceContainerLow()),
    "surface-container-high": role(dynamicColors.surfaceContainerHigh()), outline: role(dynamicColors.outline()),
    "outline-variant": role(dynamicColors.outlineVariant()), "inverse-surface": role(dynamicColors.inverseSurface()),
    "inverse-on-surface": role(dynamicColors.inverseOnSurface()), "inverse-primary": role(dynamicColors.inversePrimary()),
    "surface-tint": role(dynamicColors.surfaceTint()),
  };
}

function legacyPaletteRoles(scheme: SchemeExpressive, aliases: Map<string, string>) {
  const palettes = [scheme.primaryPalette, scheme.secondaryPalette, scheme.tertiaryPalette, scheme.errorPalette];
  const mapped: DynamicColorRoles = {};
  for (const [name, oldHex] of aliases) {
    const oldColor = Hct.fromInt(argbFromHex(oldHex));
    const palette = oldColor.chroma < 8
      ? oldColor.chroma < 3 ? scheme.neutralPalette : scheme.neutralVariantPalette
      : palettes.reduce((closest, candidate) => {
        const distance = Math.abs(((oldColor.hue - candidate.hue + 540) % 360) - 180);
        const closestDistance = Math.abs(((oldColor.hue - closest.hue + 540) % 360) - 180);
        return distance < closestDistance ? candidate : closest;
      }, palettes[0]);
    mapped[name] = hexFromArgb(palette.tone(oldColor.tone)).toUpperCase();
  }
  return mapped;
}

export function isDynamicColorRecord(value: unknown): value is DynamicColorRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<DynamicColorRecord>;
  return typeof record.seed === "string" && colorPattern.test(record.seed)
    && [record.light, record.dark].every((roles) => roles && typeof roles === "object"
      && Object.values(roles).every((entry) => typeof entry === "string" && colorPattern.test(entry)));
}

export function readDynamicColorRecord() {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(DYNAMIC_COLOR_STORAGE_KEY) ?? "null");
    return isDynamicColorRecord(value) ? value : null;
  } catch {
    return null;
  }
}

export function applyDynamicColorRoles(roles: DynamicColorRoles, seed = "selected") {
  const root = document.documentElement;
  for (const [name, value] of Object.entries(roles)) root.style.setProperty(name.startsWith("--palette-") ? name : `--color-${name}`, value);
  root.dataset.colorSeed = seed;
}

export function applyDynamicColorRecord(record: DynamicColorRecord, theme: "light" | "dark") {
  applyDynamicColorRoles(record[theme], record.seed);
}

export function clearDynamicColorRoles() {
  const root = document.documentElement;
  for (const property of Array.from({ length: root.style.length }, (_, index) => root.style.item(index))) {
    if (property.startsWith("--color-") || property.startsWith("--palette-")) root.style.removeProperty(property);
  }
  delete root.dataset.colorSeed;
}

export function createDynamicColorRecord(seed: string): DynamicColorRecord | null {
  if (!colorPattern.test(seed)) return null;
  const aliases = collectLegacyPaletteAliases();
  const generate = (isDark: boolean) => {
    const source = Hct.fromInt(argbFromHex(seed));
    for (const contrastLevel of [0.5, 1]) {
      const scheme = new SchemeExpressive(source, isDark, contrastLevel);
      const roles = colorRoles(scheme);
      if (Object.values(roles).every((value) => colorPattern.test(value)) && passesContrast(roles)) {
        return { ...roles, ...legacyPaletteRoles(scheme, aliases) };
      }
    }
    return null;
  };
  const light = generate(false);
  const dark = generate(true);
  return light && dark ? { seed: seed.toUpperCase(), light, dark } : null;
}

export function persistDynamicColorRecord(record: DynamicColorRecord) {
  try {
    localStorage.setItem(DYNAMIC_COLOR_STORAGE_KEY, JSON.stringify(record));
    localStorage.setItem(DYNAMIC_COLOR_SEED_KEY, record.seed);
  } catch {
    // The current page can still use the in-memory palette if storage is unavailable.
  }
}

export function resetDynamicColorRecord() {
  try {
    localStorage.removeItem(DYNAMIC_COLOR_STORAGE_KEY);
    localStorage.removeItem(DYNAMIC_COLOR_SEED_KEY);
  } catch { /* The default CSS theme still applies. */ }
  clearDynamicColorRoles();
}

export const defaultDynamicColorSeed = DEFAULT_SEED;
