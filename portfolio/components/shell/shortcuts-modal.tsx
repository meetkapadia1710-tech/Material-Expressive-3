"use client";

import { useEffect, useRef } from "react";
import { SHORTCUTS, SHORTCUT_GROUPS } from "@/content/shortcuts";
import { Icon } from "@/components/icon";
import styles from "./shortcuts-modal.module.css";

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
  singleKeyShortcutsEnabled: boolean;
  onToggleSingleKeyShortcuts: (enabled: boolean) => void;
}

export function ShortcutsModal({
  open,
  onClose,
  singleKeyShortcutsEnabled,
  onToggleSingleKeyShortcuts,
}: ShortcutsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement;
      dialogRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      previouslyFocusedRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      // Trap Tab focus inside the dialog
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={styles.scrim} onClick={onClose} aria-hidden="true">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-dialog-title"
        tabIndex={-1}
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.titleIcon}>
              <Icon name="keyboard" />
            </div>
            <div>
              <h2 id="shortcuts-dialog-title" className={styles.title}>
                Keyboard Shortcuts
              </h2>
              <p className={styles.subtitle}>Quick navigation & portfolio controls</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close shortcuts dialog"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* WCAG 2.1.4: Single-character shortcuts toggle */}
        <div className={styles.wcagControl}>
          <div className={styles.wcagMeta}>
            <span className={styles.wcagTitle}>Single-key Shortcuts</span>
            <span className={styles.wcagDesc}>
              Allow number keys 1–6 and T without modifiers (WCAG 2.1.4)
            </span>
          </div>
          <label className={styles.m3Switch}>
            <input
              type="checkbox"
              checked={singleKeyShortcutsEnabled}
              onChange={(e) => onToggleSingleKeyShortcuts(e.target.checked)}
              aria-label="Enable single-character keyboard shortcuts"
            />
            <span className={styles.switchTrack}>
              <span className={styles.switchThumb} />
            </span>
          </label>
        </div>

        <div className={styles.body}>
          {SHORTCUT_GROUPS.map((group) => {
            const items = SHORTCUTS.filter((s) => s.group === group);
            return (
              <div key={group} className={styles.groupSection}>
                <h3 className={styles.groupHeading}>{group}</h3>
                <ul className={styles.list}>
                  {items.map((item) => (
                    <li key={item.id} className={styles.listItem}>
                      <span className={styles.itemDescription}>{item.description}</span>
                      <kbd className={styles.keyChip}>{item.displayKey}</kbd>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

