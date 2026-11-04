"use client";

import { useState, useRef, useEffect, useCallback, useId, type KeyboardEvent } from "react";
import { Icon } from "@/components/icon";
import { playTactileSound } from "@/lib/sound-engine";
import styles from "./material-select.module.css";

export interface MaterialSelectOption {
  value: string;
  label: string;
}

export interface MaterialSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly MaterialSelectOption[];
  ariaControls?: string;
  className?: string;
}

export function MaterialSelect({
  id,
  label,
  value,
  onChange,
  options,
  ariaControls,
  className = "",
}: MaterialSelectProps) {
  const [open, setOpen] = useState(false);
  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const [highlightedIndex, setHighlightedIndex] = useState(selectedIndex >= 0 ? selectedIndex : 0);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();
  const labelId = `${id}-label`;

  const selectedOption = options.find((opt) => opt.value === value) ?? options[0];

  // Sync highlightedIndex when value or options change
  useEffect(() => {
    const idx = options.findIndex((opt) => opt.value === value);
    if (idx >= 0) setHighlightedIndex(idx);
  }, [value, options]);

  // Click outside listener
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || !listboxRef.current) return;
    const items = listboxRef.current.querySelectorAll<HTMLLIElement>('[role="option"]');
    const targetItem = items[highlightedIndex];
    if (targetItem) {
      targetItem.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, open]);

  const selectOption = useCallback(
    (optValue: string) => {
      onChange(optValue);
      setOpen(false);
      playTactileSound("click");
      triggerRef.current?.focus();
    },
    [onChange]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        }
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        }
        break;
      }
      case "Enter":
      case " ": {
        e.preventDefault();
        if (!open) {
          setOpen(true);
        } else {
          const selected = options[highlightedIndex];
          if (selected) selectOption(selected.value);
        }
        break;
      }
      case "Escape": {
        if (open) {
          e.preventDefault();
          setOpen(false);
          triggerRef.current?.focus();
        }
        break;
      }
      case "Home": {
        if (open) {
          e.preventDefault();
          setHighlightedIndex(0);
        }
        break;
      }
      case "End": {
        if (open) {
          e.preventDefault();
          setHighlightedIndex(options.length - 1);
        }
        break;
      }
      case "Tab": {
        if (open) {
          setOpen(false);
        }
        break;
      }
    }
  };

  return (
    <div className={`${styles.wrapper} ${className}`} ref={containerRef}>
      <label id={labelId} htmlFor={id} className={styles.label}>
        {label}
      </label>

      {/* Visible Material 3 Expressive Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        id={`${id}-trigger`}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-labelledby={`${labelId} ${id}-trigger`}
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={() => {
          setOpen((prev) => !prev);
          playTactileSound("tick");
        }}
        onKeyDown={handleKeyDown}
      >
        <span className={styles.selectedText}>{selectedOption?.label ?? label}</span>
        <svg
          className={styles.chevron}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Floating Material 3 Expressive Menu Surface */}
      {open ? (
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          data-scroll-region
          aria-labelledby={labelId}
          className={styles.menu}
          tabIndex={-1}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isHighlighted = idx === highlightedIndex;
            return (
              <li
                key={opt.value}
                id={`${listboxId}-opt-${idx}`}
                role="option"
                aria-selected={isSelected}
                className={`${styles.menuOption} ${isSelected ? styles.menuOptionSelected : ""} ${
                  isHighlighted ? styles.menuOptionHighlighted : ""
                }`}
                onClick={() => selectOption(opt.value)}
                onMouseEnter={() => setHighlightedIndex(idx)}
              >
                <span className={styles.optionLabel}>{opt.label}</span>
                {isSelected ? (
                  <Icon name="check" className={styles.optionCheck} />
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      {/* Visually Hidden Native Select to preserve form sync & headless accessibility */}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        aria-controls={ariaControls}
        className={styles.visuallyHiddenSelect}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

