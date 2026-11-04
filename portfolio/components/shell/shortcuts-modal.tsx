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
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && !dialog?.open) dialog?.showModal();
  }, [open]);

  if (!open) return null;

  function dismiss() {
    dialogRef.current?.close();
    onClose();
  }

  return (
      <dialog
        ref={dialogRef}
        aria-labelledby="shortcuts-dialog-title"
        className={styles.dialog}
        onCancel={(event) => { event.preventDefault(); dismiss(); }}
        onClick={(event) => { if (event.target === event.currentTarget) {
          const box = event.currentTarget.getBoundingClientRect();
          if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dismiss();
        } }}
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
            onClick={dismiss}
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
      </dialog>
  );
}

