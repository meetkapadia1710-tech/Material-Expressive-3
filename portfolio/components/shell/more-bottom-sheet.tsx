"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { ThemeToggle } from "@/components/interface-controls";
import { ColorSeedPicker } from "@/components/color-seed-picker";
import styles from "./mobile-bottom-bar.module.css";

interface MoreBottomSheetProps {
  open: boolean;
  onClose: () => void;
  onOpenShortcuts?: () => void;
  onOpenCommandPalette?: () => void;
  installPromptAvailable?: boolean;
  onTriggerInstall?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: (enabled: boolean) => void;
}

export function MoreBottomSheet({
  open,
  onClose,
  onOpenShortcuts,
  onOpenCommandPalette,
  installPromptAvailable = false,
  onTriggerInstall,
  soundEnabled = false,
  onToggleSound,
}: MoreBottomSheetProps) {
  const pathname = usePathname();
  const sheetRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const sheet = sheetRef.current;
    if (open && !sheet?.open) sheet?.showModal();
  }, [open]);

  if (!open) return null;

  function dismiss() {
    sheetRef.current?.close();
    onClose();
  }

  return (
      <dialog
        ref={sheetRef}
        aria-labelledby="more-sheet-title"
        className={styles.sheet}
        onCancel={(event) => { event.preventDefault(); dismiss(); }}
        onClick={(event) => { if (event.target === event.currentTarget) {
          const box = event.currentTarget.getBoundingClientRect();
          if (event.clientY < box.top || event.clientX < box.left || event.clientX > box.right) dismiss();
        } }}
      >
        <div className={styles.handleContainer}>
          <div className={styles.dragHandle} aria-hidden="true" />
        </div>

        <div className={styles.sheetHeader}>
          <h2 id="more-sheet-title" className={styles.sheetTitle}>
            More Navigation & Tools
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={dismiss}
            aria-label="Close menu"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className={styles.sheetContent}>
          {/* Sub-destinations */}
          <div className={styles.sectionGroup}>
            <span className={styles.sectionLabel}>Destinations</span>
            <div className={styles.destinationsGrid}>
              <Link
                href="/skills"
                className={`${styles.sheetNavLink} ${pathname === "/skills" ? styles.sheetNavActive : ""}`}
                onClick={dismiss}
              >
                <span className={styles.sheetNavIcon}>
                  <Icon name="code" />
                </span>
                <div className={styles.sheetNavMeta}>
                  <span className={styles.sheetNavText}>Skills & Craft</span>
                  <span className={styles.sheetNavSub}>Technical capabilities & focus</span>
                </div>
              </Link>

              <Link
                href="/contact"
                className={`${styles.sheetNavLink} ${pathname === "/contact" ? styles.sheetNavActive : ""}`}
                onClick={dismiss}
              >
                <span className={styles.sheetNavIcon}>
                  <Icon name="mail" />
                </span>
                <div className={styles.sheetNavMeta}>
                  <span className={styles.sheetNavText}>Contact</span>
                  <span className={styles.sheetNavSub}>Get in touch or start a project</span>
                </div>
              </Link>

              <Link
                href="/resume"
                className={`${styles.sheetNavLink} ${pathname === "/resume" ? styles.sheetNavActive : ""}`}
                aria-current={pathname === "/resume" ? "page" : undefined}
                onClick={dismiss}
              >
                <span className={styles.sheetNavIcon}><Icon name="file" /></span>
                <div className={styles.sheetNavMeta}>
                  <span className={styles.sheetNavText}>Resume</span>
                  <span className={styles.sheetNavSub}>Experience and credentials</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Actions & Tools */}
          <div className={styles.sectionGroup}>
            <span className={styles.sectionLabel}>Tools & Palette</span>
            <div className={styles.toolsRow}>
              {onOpenCommandPalette ? (
                <button
                  type="button"
                  className={styles.actionChip}
                  onClick={() => {
                    dismiss();
                    onOpenCommandPalette();
                  }}
                >
                  <Icon name="search" />
                  <span>Command Palette</span>
                  <kbd className={styles.chipKbd}>⌘K</kbd>
                </button>
              ) : null}

              {onOpenShortcuts ? (
                <button
                  type="button"
                  className={styles.actionChip}
                  onClick={() => {
                    dismiss();
                    onOpenShortcuts();
                  }}
                >
                  <Icon name="keyboard" />
                  <span>Shortcuts</span>
                  <kbd className={styles.chipKbd}>?</kbd>
                </button>
              ) : null}

              {installPromptAvailable && onTriggerInstall ? (
                <button
                  type="button"
                  className={`${styles.actionChip} ${styles.installChip}`}
                  onClick={() => {
                    dismiss();
                    onTriggerInstall();
                  }}
                >
                  <Icon name="download" />
                  <span>Install App</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Audio & Haptic Switch */}
          {onToggleSound ? (
            <div className={styles.soundControlRow}>
              <div className={styles.soundMeta}>
                <Icon name={soundEnabled ? "volume" : "volume-x"} />
                <div>
                  <span className={styles.soundTitle}>Tactile Sound FX</span>
                  <p className={styles.soundDesc}>Subtle synthesized audio clicks on navigation</p>
                </div>
              </div>
              <label className={styles.m3Switch}>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => onToggleSound(e.target.checked)}
                  aria-label="Toggle tactile sound effects"
                />
                <span className={styles.switchTrack}>
                  <span className={styles.switchThumb} />
                </span>
              </label>
            </div>
          ) : null}

          {/* Theme & Seed Controls */}
          <div className={styles.sectionGroup}>
            <span className={styles.sectionLabel}>Appearance</span>
            <div className={styles.appearanceRow}>
              <div className={styles.themeToggleWrap}>
                <ThemeToggle />
              </div>
              <div className={styles.colorPickerWrap}>
                <ColorSeedPicker inline />
              </div>
            </div>
          </div>
        </div>
      </dialog>
  );
}
