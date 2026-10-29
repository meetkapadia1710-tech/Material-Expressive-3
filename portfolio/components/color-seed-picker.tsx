"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { interfaceCopy } from "@/content/interface";
import { Icon } from "@/components/icon";
import { runThemeReveal, useToast } from "@/components/interface-controls";
import styles from "./color-seed-picker.module.css";

const presetSeeds = interfaceCopy.colors.presets;

export function ColorSeedPicker() {
  const rootRef = useRef<HTMLDetailsElement>(null);
  const latestRequest = useRef(0);
  const [seed, setSeed] = useState("");
  const [busy, setBusy] = useState(false);
  const notify = useToast();

  const syncCurrentPalette = useCallback(() => {
    try { if (!localStorage.getItem("portfolio-color-palette")) return; } catch { return; }
    void import("@/lib/dynamic-colors").then(({ readDynamicColorRecord, applyDynamicColorRecord }) => {
      const record = readDynamicColorRecord();
      if (!record) return;
      const mode = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      applyDynamicColorRecord(record, mode);
    });
  }, []);

  useEffect(() => {
    try { setSeed(localStorage.getItem("portfolio-color-seed") ?? ""); } catch { setSeed(""); }
    syncCurrentPalette();
    window.addEventListener("portfolio:theme-effective", syncCurrentPalette);
    return () => window.removeEventListener("portfolio:theme-effective", syncCurrentPalette);
  }, [syncCurrentPalette]);

  const chooseSeed = useCallback(async (nextSeed: string) => {
    const request = ++latestRequest.current;
    setBusy(true);
    try {
      const palette = await import("@/lib/dynamic-colors");
      const record = palette.createDynamicColorRecord(nextSeed);
      if (request !== latestRequest.current) return;
      if (!record) {
        runThemeReveal(() => { palette.resetDynamicColorRecord(); window.dispatchEvent(new CustomEvent("portfolio:global-color-applied")); }, rootRef.current?.querySelector("summary"));
        setSeed("");
        notify(interfaceCopy.colors.fallback);
        return;
      }
      runThemeReveal(() => {
        palette.persistDynamicColorRecord(record);
        palette.applyDynamicColorRecord(record, document.documentElement.dataset.theme === "dark" ? "dark" : "light");
        window.dispatchEvent(new CustomEvent("portfolio:global-color-applied"));
      }, rootRef.current?.querySelector("summary"));
      setSeed(record.seed);
    } catch {
      if (request === latestRequest.current) {
        setSeed("");
        notify(interfaceCopy.colors.fallback);
      }
    } finally {
      if (request === latestRequest.current) setBusy(false);
    }
  }, [notify]);

  const reset = useCallback(async () => {
    ++latestRequest.current;
    setBusy(true);
    const palette = await import("@/lib/dynamic-colors");
    runThemeReveal(() => { palette.resetDynamicColorRecord(); window.dispatchEvent(new CustomEvent("portfolio:global-color-applied")); }, rootRef.current?.querySelector("summary"));
    setSeed("");
    setBusy(false);
  }, []);

  return <details ref={rootRef} className={styles.control}>
    <summary className={styles.trigger} aria-label={interfaceCopy.colors.label} title={interfaceCopy.colors.label}>
      <Icon name="palette" />
    </summary>
    <div className={styles.popover}>
      <h2>{interfaceCopy.colors.title}</h2>
      <div className={styles.swatches} role="group" aria-label={interfaceCopy.colors.title}>
        {presetSeeds.map((preset) => <button
          key={preset.seed}
          type="button"
          className={styles.swatch}
          style={{ "--seed-color": preset.seed } as CSSProperties}
          aria-label={`${preset.label} ${preset.seed}`}
          aria-pressed={seed.toUpperCase() === preset.seed}
          disabled={busy}
          onClick={() => void chooseSeed(preset.seed)}
        ><span aria-hidden="true">{seed.toUpperCase() === preset.seed ? "✓" : ""}</span><small>{preset.label}</small></button>)}
      </div>
      <label className={styles.custom}>
        <span>{interfaceCopy.colors.custom}</span>
        <input type="color" value={seed || interfaceCopy.colors.presets[0].seed} disabled={busy} onChange={(event) => void chooseSeed(event.currentTarget.value.toUpperCase())} />
      </label>
      <button className={styles.reset} type="button" onClick={() => void reset()} disabled={busy || !seed}>{interfaceCopy.colors.reset}</button>
      <p className={styles.status} aria-live="polite" aria-atomic="true">{busy ? interfaceCopy.colors.generating : ""}</p>
    </div>
  </details>;
}
