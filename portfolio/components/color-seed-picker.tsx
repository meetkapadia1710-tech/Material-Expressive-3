"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { interfaceCopy } from "@/content/interface";
import { Icon } from "@/components/icon";
import { runThemeReveal, useToast } from "@/components/interface-controls";
import { readStoredPaletteChoice } from "@/lib/dynamic-color-state";
import styles from "./color-seed-picker.module.css";

const presetSeeds = interfaceCopy.colors.presets;
const defaultSeed = presetSeeds[0].seed;

function onSeedColor(seed: string) {
  const channels = seed.slice(1).match(/.{2}/g)?.map((part) => Number.parseInt(part, 16) / 255) ?? [0, 0, 0];
  const [red, green, blue] = channels.map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  const brightness = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  return brightness > 0.179 ? "#1B1B1F" : "#FFFFFF";
}

export function ColorSeedPicker() {
  const rootRef = useRef<HTMLDetailsElement>(null);
  const swatchRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const latestRequest = useRef(0);
  const [seed, setSeed] = useState(defaultSeed);
  const [paletteMode, setPaletteMode] = useState<"default" | "seed">("default");
  const [busy, setBusy] = useState(false);
  const notify = useToast();

  const syncSeed = useCallback(() => {
    const choice = readStoredPaletteChoice();
    setPaletteMode(choice.mode);
    setSeed(choice.mode === "seed" ? choice.record.seed.toUpperCase() : defaultSeed);
  }, []);

  useEffect(() => {
    syncSeed();
    const closeOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) rootRef.current?.removeAttribute("open");
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape" || !rootRef.current?.open) return;
      event.preventDefault();
      rootRef.current.removeAttribute("open");
      rootRef.current.querySelector("summary")?.focus();
    };
    window.addEventListener("portfolio:global-color-applied", syncSeed);
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("portfolio:global-color-applied", syncSeed);
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [syncSeed]);

  const chooseSeed = useCallback(async (nextSeed: string) => {
    const request = ++latestRequest.current;
    setBusy(true);
    try {
      const palette = await import("@/lib/dynamic-colors");
      const record = palette.createDynamicColorRecord(nextSeed);
      if (request !== latestRequest.current) return;
      if (!record) {
        notify(interfaceCopy.colors.fallback);
        return;
      }
      runThemeReveal(() => {
        palette.persistDynamicColorRecord(record);
        palette.applyDynamicColorRecord(record, document.documentElement.dataset.theme === "dark" ? "dark" : "light");
        window.dispatchEvent(new CustomEvent("portfolio:global-color-applied", { detail: { seed: record.seed } }));
      }, rootRef.current?.querySelector("summary"));
      setSeed(record.seed);
      setPaletteMode("seed");
    } catch {
      if (request === latestRequest.current) notify(interfaceCopy.colors.fallback);
    } finally {
      if (request === latestRequest.current) setBusy(false);
    }
  }, [notify]);

  const reset = useCallback(async () => {
    ++latestRequest.current;
    setBusy(true);
    try {
      const palette = await import("@/lib/dynamic-colors");
      runThemeReveal(() => {
        palette.resetDynamicColorRecord();
        window.dispatchEvent(new CustomEvent("portfolio:global-color-applied", { detail: { mode: "default", seed: defaultSeed } }));
      }, rootRef.current?.querySelector("summary"));
      setSeed(defaultSeed);
      setPaletteMode("default");
    } finally {
      setBusy(false);
    }
  }, []);

  function moveSwatch(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const optionCount = presetSeeds.length + 1;
    const next = event.key === "Home" ? 0 : event.key === "End" ? optionCount - 1
      : (index + (event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1) + optionCount) % optionCount;
    swatchRefs.current[next]?.focus();
    if (next === 0) void reset();
    else void chooseSeed(presetSeeds[next - 1].seed);
  }

  const checkedIndex = paletteMode === "default" ? 0 : presetSeeds.findIndex((preset) => preset.seed === seed) + 1;
  const firstRadioIndex = checkedIndex > 0 ? checkedIndex : 0;
  const selectDefault = () => void reset();

  return <details ref={rootRef} className={styles.control}>
    <summary className={styles.trigger} aria-label={`${interfaceCopy.colors.label}: ${paletteMode === "default" ? interfaceCopy.colors.default : seed}`} title={`${interfaceCopy.colors.label}: ${paletteMode === "default" ? interfaceCopy.colors.default : seed}`}>
      <Icon name="palette" />
    </summary>
    <div className={styles.popover} aria-busy={busy}>
      <h2>{interfaceCopy.colors.title}</h2>
      <div className={styles.swatches} role="radiogroup" aria-label={interfaceCopy.colors.title}>
        <button
          ref={(element) => { swatchRefs.current[0] = element; }}
          type="button"
          role="radio"
          tabIndex={firstRadioIndex === 0 ? 0 : -1}
          className={`${styles.swatch} ${styles.defaultSwatch}`}
          aria-label={interfaceCopy.colors.default}
          aria-checked={paletteMode === "default"}
          disabled={busy}
          onKeyDown={(event) => moveSwatch(event, 0)}
          onClick={selectDefault}
        ><span className={styles.defaultSwatchColors} aria-hidden="true"><i /><i />{paletteMode === "default" ? <b>✓</b> : null}</span><small>{interfaceCopy.colors.default}</small></button>
        {presetSeeds.map((preset, index) => <button
          key={preset.seed}
          ref={(element) => { swatchRefs.current[index + 1] = element; }}
          type="button"
          role="radio"
          tabIndex={firstRadioIndex === index + 1 ? 0 : -1}
          className={styles.swatch}
          style={{ "--seed-color": preset.seed, "--seed-on-color": onSeedColor(preset.seed) } as CSSProperties}
          aria-label={`${preset.label}, ${preset.seed}`}
          aria-checked={paletteMode === "seed" && seed.toUpperCase() === preset.seed}
          disabled={busy}
          onKeyDown={(event) => moveSwatch(event, index + 1)}
          onClick={() => void chooseSeed(preset.seed)}
        ><span aria-hidden="true">{paletteMode === "seed" && seed.toUpperCase() === preset.seed ? "✓" : ""}</span><small>{preset.label}</small></button>)}
      </div>
      <label className={styles.custom}>
        <span>{interfaceCopy.colors.custom}</span>
        <input type="color" value={seed} disabled={busy} onChange={(event) => void chooseSeed(event.currentTarget.value.toUpperCase())} />
      </label>
      <button className={styles.reset} type="button" onClick={() => void reset()} disabled={busy || paletteMode === "default"}>{interfaceCopy.colors.reset}</button>
      <p className={styles.status} aria-live="polite" aria-atomic="true">{busy ? interfaceCopy.colors.generating : ""}</p>
    </div>
  </details>;
}
