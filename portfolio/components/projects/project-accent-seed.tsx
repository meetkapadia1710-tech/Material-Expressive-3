"use client";

import { useEffect, useRef } from "react";

let activeAccentRequest = 0;

export function ProjectAccentSeed({ seed }: { seed?: string | null }) {
  const overridden = useRef(false);
  useEffect(() => {
    if (!seed) return;
    overridden.current = false;
    const request = ++activeAccentRequest;
    const applyProjectAccent = async () => {
      const palette = await import("@/lib/dynamic-colors");
      if (request !== activeAccentRequest) return;
      const record = palette.createDynamicColorRecord(seed);
      if (!record) return;
      if (overridden.current) return;
      document.documentElement.dataset.projectAccent = "true";
      palette.applyDynamicColorRecord(record, document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    };
    const onTheme = () => { if (!overridden.current) void applyProjectAccent(); };
    const onGlobalColor = () => { overridden.current = true; delete document.documentElement.dataset.projectAccent; };
    void applyProjectAccent();
    window.addEventListener("portfolio:theme-effective", onTheme);
    window.addEventListener("portfolio:global-color-applied", onGlobalColor);
    return () => {
      window.removeEventListener("portfolio:theme-effective", onTheme);
      window.removeEventListener("portfolio:global-color-applied", onGlobalColor);
      const release = ++activeAccentRequest;
      void import("@/lib/dynamic-colors").then((palette) => {
        if (release !== activeAccentRequest) return;
        delete document.documentElement.dataset.projectAccent;
        const globalPalette = palette.readDynamicColorRecord();
        if (globalPalette) palette.applyDynamicColorRecord(globalPalette, document.documentElement.dataset.theme === "dark" ? "dark" : "light");
        else palette.clearDynamicColorRoles();
      });
    };
  }, [seed]);

  return null;
}
