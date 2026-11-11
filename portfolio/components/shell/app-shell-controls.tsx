"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MobileBottomBar } from "./mobile-bottom-bar";
import { ShortcutsModal } from "./shortcuts-modal";
import { SwRegistrar } from "./sw-registrar";
import { playTactileSound, type SoundKind } from "@/lib/sound-engine";
import { toggleThemeChoice } from "@/components/interface-controls";

export function AppShellClientControls() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [singleKeyEnabled, setSingleKeyEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Initialize sound preference and single-key shortcut preference from localStorage
  useEffect(() => {
    try {
      const soundPref = localStorage.getItem("portfolio-sound-enabled") === "true";
      setSoundEnabled(soundPref);
      const singleKeyPref = localStorage.getItem("portfolio-single-key-shortcuts");
      if (singleKeyPref !== null) {
        setSingleKeyEnabled(singleKeyPref === "true");
      }
    } catch {}
  }, []);

  const handleToggleSound = useCallback((enabled: boolean) => {
    setSoundEnabled(enabled);
    try {
      localStorage.setItem("portfolio-sound-enabled", enabled ? "true" : "false");
    } catch {}
    if (enabled) {
      playTactileSound("toggle");
    }
  }, []);

  const handleToggleSingleKey = useCallback((enabled: boolean) => {
    setSingleKeyEnabled(enabled);
    try {
      localStorage.setItem("portfolio-single-key-shortcuts", enabled ? "true" : "false");
    } catch {}
  }, []);

  const handlePlaySound = useCallback((kind: SoundKind) => {
    playTactileSound(kind);
  }, []);

  const handleOpenCommandPalette = useCallback(() => {
    // Dispatch Ctrl+K keyboard event to activate the existing CommandPaletteController
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
  }, []);

  const handleOpenShortcuts = useCallback(() => {
    setShortcutsOpen(true);
    playTactileSound("click");
  }, []);

  // Global keyboard shortcuts listener
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing inside an editable form element
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      // Check for ? to open shortcuts helper
      if (event.key === "?" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        setShortcutsOpen((prev) => !prev);
        playTactileSound("click");
        return;
      }

      // Single-key navigation shortcuts (1-6) and theme toggle (t/T)
      if (singleKeyEnabled && !event.ctrlKey && !event.metaKey && !event.altKey) {
        switch (event.key) {
          case "1":
            event.preventDefault();
            playTactileSound("tick");
            startTransition(() => router.push("/"));
            break;
          case "2":
            event.preventDefault();
            playTactileSound("tick");
            startTransition(() => router.push("/projects"));
            break;
          case "3":
            event.preventDefault();
            playTactileSound("tick");
            startTransition(() => router.push("/about"));
            break;
          case "4":
            event.preventDefault();
            playTactileSound("tick");
            startTransition(() => router.push("/skills"));
            break;
          case "5":
            event.preventDefault();
            playTactileSound("tick");
            startTransition(() => router.push("/achievements"));
            break;
          case "6":
            event.preventDefault();
            playTactileSound("tick");
            startTransition(() => router.push("/contact"));
            break;
          case "t":
          case "T":
            event.preventDefault();
            playTactileSound("toggle");
            toggleThemeChoice();
            break;
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [singleKeyEnabled, router]);

  return (
    <>
      <SwRegistrar />
      <MobileBottomBar
        onOpenShortcuts={handleOpenShortcuts}
        onOpenCommandPalette={handleOpenCommandPalette}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onPlaySound={handlePlaySound}
      />
      <ShortcutsModal
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
        singleKeyShortcutsEnabled={singleKeyEnabled}
        onToggleSingleKeyShortcuts={handleToggleSingleKey}
      />
    </>
  );
}

