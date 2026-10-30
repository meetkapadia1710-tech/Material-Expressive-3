import type { CSSProperties } from "react";
import { createDynamicColorRecord } from "./dynamic-colors";

export function projectAccentStyle(seed?: string | null): CSSProperties | undefined {
  if (!seed) return undefined;
  const record = createDynamicColorRecord(seed);
  if (!record) return undefined;
  const style: Record<string, string> = {};
  for (const theme of ["light", "dark"] as const) {
    for (const [role, color] of Object.entries(record[theme])) {
      style[`--project-${theme}-${role}`] = color;
    }
  }
  return style as CSSProperties;
}
