"use client";

import { useEffect, useRef, useState, useCallback, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [moreOpen, setMoreOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollYRef = useRef(0);

  // Optimistic active route selection on pointer down
  const isRouteActive = useCallback(
    (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname === href || pathname.startsWith(`${href}/`);
    },
    [pathname]
  );

  // Hide on scroll down, show on scroll up (only active when not reduced motion)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReducedMotion) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          if (currentY > 120 && currentY > lastScrollYRef.current + 8) {
            setHidden(true);
          } else if (currentY < lastScrollYRef.current - 8 || currentY <= 60) {
            setHidden(false);
          }
          lastScrollYRef.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`${styles.bottomBar} ${hidden ? styles.barHidden : ""}`}
        aria-label="Mobile Navigation"
      >
        <div className={styles.barInner}>
          {PRIMARY_DESTINATIONS.map((dest) => {
            const active = isRouteActive(dest.href);
            return (
              <Link
                key={dest.href}
                href={dest.href}
                prefetch={true}
                className={`${styles.navItem} ${active ? styles.itemActive : ""}`}
                aria-current={active ? "page" : undefined}
                onPointerDown={() => {
                  onPlaySound?.("tick");
                  router.prefetch(dest.href);
                }}
                onClick={() => {
                  if (active) return;
                  startTransition(() => {
                    // optimistic transition
                  });
                }}
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
            className={`${styles.navItem} ${moreOpen ? styles.itemActive : ""}`}
            onClick={() => {
              onPlaySound?.("click");
              setMoreOpen(true);
            }}
            aria-expanded={moreOpen}
            aria-label="More navigation and settings"
          >
            <div className={styles.iconContainer}>
              {moreOpen ? <span className={styles.activePill} aria-hidden="true" /> : null}
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

