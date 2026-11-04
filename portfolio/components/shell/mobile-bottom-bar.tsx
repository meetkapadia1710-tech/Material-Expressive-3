"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icon";
import { MoreBottomSheet } from "./more-bottom-sheet";
import styles from "./mobile-bottom-bar.module.css";

interface Destination {
  href: string;
  label: string;
  icon: IconName;
}

const PRIMARY_DESTINATIONS: Destination[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/projects", label: "Projects", icon: "layers" },
  { href: "/about", label: "About", icon: "user" },
  { href: "/achievements", label: "Trophies", icon: "trophy" },
];

interface MobileBottomBarProps {
  onOpenShortcuts?: () => void;
  onOpenCommandPalette?: () => void;
  installPromptAvailable?: boolean;
  onTriggerInstall?: () => void;
  soundEnabled?: boolean;
  onToggleSound?: (enabled: boolean) => void;
  onPlaySound?: (kind: "click" | "tick" | "toggle") => void;
}

export function MobileBottomBar({
  onOpenShortcuts,
  onOpenCommandPalette,
  installPromptAvailable = false,
  onTriggerInstall,
  soundEnabled = false,
  onToggleSound,
  onPlaySound,
}: MobileBottomBarProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = moreOpen || pathname === "/skills" || pathname === "/contact" || pathname === "/resume";
  useEffect(() => setMoreOpen(false), [pathname]);

  return (
    <>
      <nav
        className={styles.bottomBar}
        data-fixed-ui
        aria-label="Mobile Navigation"
      >
        <div className={styles.barInner}>
          {PRIMARY_DESTINATIONS.map((dest) => {
            const active = pathname === dest.href || (dest.href !== "/" && pathname.startsWith(`${dest.href}/`));
            return (
              <Link
                key={dest.href}
                href={dest.href}
                prefetch={true}
                className={`${styles.navItem} ${active ? styles.itemActive : ""}`}
                aria-current={active ? "page" : undefined}
                onPointerDown={() => onPlaySound?.("tick")}
              >
                <div className={styles.iconContainer}>
                  {active ? <span className={styles.activePill} aria-hidden="true" /> : null}
                  <span className={styles.iconSlot}>
                    <Icon name={dest.icon} />
                  </span>
                </div>
                <span className={styles.itemLabel}>{dest.label}</span>
              </Link>
            );
          })}

          {/* 5th Destination: More Sheet Trigger */}
          <button
            type="button"
            className={`${styles.navItem} ${moreActive ? styles.itemActive : ""}`}
            onClick={() => {
              onPlaySound?.("click");
              setMoreOpen(true);
            }}
            aria-expanded={moreOpen}
            aria-haspopup="dialog"
            aria-label="More navigation and settings"
          >
            <div className={styles.iconContainer}>
              {moreActive ? <span className={styles.activePill} aria-hidden="true" /> : null}
              <span className={styles.iconSlot}>
                <Icon name="more" />
              </span>
            </div>
            <span className={styles.itemLabel}>More</span>
          </button>
        </div>
      </nav>

      <MoreBottomSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        onOpenShortcuts={onOpenShortcuts}
        onOpenCommandPalette={onOpenCommandPalette}
        installPromptAvailable={installPromptAvailable}
        onTriggerInstall={onTriggerInstall}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
      />
    </>
  );
}

