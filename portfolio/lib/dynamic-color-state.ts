export type StoredDynamicColorRecord = {
  seed: string;
  light: Record<string, string>;
  dark: Record<string, string>;
};

export const DYNAMIC_COLOR_STORAGE_KEY = "portfolio-color-palette";
export const DEFAULT_COLOR_PALETTE_CHOICE = { mode: "default" } as const;
const hexColor = /^#[\da-f]{6}$/i;
const roleNames = [
  "primary", "on-primary", "primary-container", "on-primary-container",
  "secondary", "on-secondary", "secondary-container", "on-secondary-container",
  "tertiary", "on-tertiary", "tertiary-container", "on-tertiary-container",
  "error", "on-error", "error-container", "on-error-container",
  "background", "on-background", "surface", "on-surface", "surface-variant", "on-surface-variant",
  "surface-container-lowest", "surface-container-low", "surface-container", "surface-container-high", "surface-container-highest",
  "surface-dim", "surface-bright", "outline", "outline-variant", "inverse-surface", "inverse-on-surface", "inverse-primary",
  "surface-tint", "shadow", "scrim",
];

function isRecord(value: unknown): value is StoredDynamicColorRecord & { mode?: "seed" } {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<StoredDynamicColorRecord>;
  const mode = (value as { mode?: unknown }).mode;
  if (mode !== undefined && mode !== "seed") return false;
  return typeof record.seed === "string" && hexColor.test(record.seed)
    && [record.light, record.dark].every((roles) => roles && roleNames.every((name) => hexColor.test(roles[name] ?? "")));
}

export type StoredPaletteChoice =
  | typeof DEFAULT_COLOR_PALETTE_CHOICE
  | { mode: "seed"; record: StoredDynamicColorRecord };

export function readStoredPaletteChoice(): StoredPaletteChoice {
  if (typeof window === "undefined") return DEFAULT_COLOR_PALETTE_CHOICE;
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(DYNAMIC_COLOR_STORAGE_KEY) ?? "null");
    if (saved && typeof saved === "object" && (saved as { mode?: unknown }).mode === "default") return DEFAULT_COLOR_PALETTE_CHOICE;
    if (isRecord(saved)) return { mode: "seed", record: saved };
    if (saved !== null) localStorage.removeItem(DYNAMIC_COLOR_STORAGE_KEY);
    localStorage.removeItem("portfolio-color-seed");
  } catch {
    try { localStorage.removeItem(DYNAMIC_COLOR_STORAGE_KEY); } catch { /* Storage can be unavailable. */ }
  }
  return DEFAULT_COLOR_PALETTE_CHOICE;
}

export function readStoredColorRecord(): StoredDynamicColorRecord | null {
  const choice = readStoredPaletteChoice();
  return choice.mode === "seed" ? choice.record : null;
}

export function applyColorRecordToDocument(record: StoredDynamicColorRecord, theme: "light" | "dark") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const colors = record[theme];
  for (const [name, value] of Object.entries(colors)) root.style.setProperty(`--color-${name}`, value);
  root.style.setProperty("--color-seed", record.seed.toUpperCase());
  root.dataset.colorSeed = record.seed.toUpperCase();
  root.dataset.colorSource = "user";
  root.dataset.colorPalette = "seed";
}

export function clearColorRecordFromDocument() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  for (const property of Array.from({ length: root.style.length }, (_, index) => root.style.item(index))) {
    if (property.startsWith("--color-")) root.style.removeProperty(property);
  }
  delete root.dataset.colorSeed;
  delete root.dataset.colorSource;
  root.style.removeProperty("--color-seed");
  root.dataset.colorPalette = "default";
}

export function persistDefaultColorChoice() {
  try {
    localStorage.setItem(DYNAMIC_COLOR_STORAGE_KEY, JSON.stringify(DEFAULT_COLOR_PALETTE_CHOICE));
    localStorage.removeItem("portfolio-color-seed");
  } catch { /* The static Default palette remains active if storage is unavailable. */ }
  clearColorRecordFromDocument();
}

export function applyStoredColorScheme(theme: "light" | "dark") {
  const choice = readStoredPaletteChoice();
  if (choice.mode === "seed") applyColorRecordToDocument(choice.record, theme);
  else clearColorRecordFromDocument();
  return choice.mode === "seed" ? choice.record : null;
}
