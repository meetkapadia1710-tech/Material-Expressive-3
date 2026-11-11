"use client";

import { ThemeToggle } from "./interface-controls";
import { Suspense, lazy, memo, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { navigation, profile, siteCopy } from "@/content/profile";
import { interfaceCopy } from "@/content/interface";
import { Icon } from "@/components/icon";
import { ColorSeedPicker } from "@/components/color-seed-picker";
import type { CodingSearchEntry } from "@/lib/coding-stats";
import { motion } from "framer-motion";
import { readMotionBezier, readMotionMilliseconds } from "@/components/motion/motion-tokens";

const loadCommandPalette = () => import("./command-palette");
const CommandPalette = lazy(loadCommandPalette);

const NavigationLinks = memo(function NavigationLinks() {
  const pathname = usePathname();
  const router = useRouter();
  const layoutTransition = {
    layout: {
      duration: readMotionMilliseconds("--motion-duration-navigation", 250) / 1000,
      ease: readMotionBezier("--motion-project-spatial-easing", [0.38, 1.21, 0.22, 1]),
    },
  };

  return <nav className="navigation" aria-label={siteCopy.navigationLabel}>
    {navigation.map((item) => {
      const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
      const prefetch = () => router.prefetch(item.href);
      return <Link key={item.href} href={item.href} prefetch className={`nav-link${active ? " active" : ""}`} aria-current={active ? "page" : undefined} onMouseEnter={prefetch} onFocus={prefetch} onPointerDown={prefetch}>
        {active ? <motion.span layoutId="portfolio-active-nav-indicator" className="nav-active-indicator" aria-hidden="true" transition={layoutTransition} /> : null}
        <span className="nav-link-label">{item.label}</span>
      </Link>;
    })}
  </nav>;
});

function CommandPaletteController({ codingEntries = [] }: { codingEntries?: readonly CodingSearchEntry[] }) {
  const [paletteRequested, setPaletteRequested] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const openPalette = useCallback(() => {
    if (document.documentElement.dataset.introPending === "true") return;
    setPaletteRequested(true);
    setPaletteOpen(true);
  }, []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);
  const preloadPalette = useCallback(() => { void loadCommandPalette().catch(() => {}); }, []);
  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const handle = window.requestIdleCallback(preloadPalette, { timeout: 2000 });
      return () => window.cancelIdleCallback(handle);
    }
    const handle = setTimeout(preloadPalette, 1000);
    return () => clearTimeout(handle);
  }, [preloadPalette]);
  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openPalette(); }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, [openPalette]);

  return <>
    <button type="button" className="command-trigger" aria-label={interfaceCopy.command.triggerLabel} aria-keyshortcuts="Control+K Meta+K" aria-haspopup="dialog" onPointerEnter={preloadPalette} onFocus={preloadPalette} onClick={(event) => {
      event.currentTarget.focus({ preventScroll: true });
      openPalette();
    }}>
      <Icon name="search" /><span>{interfaceCopy.command.trigger}</span><kbd aria-hidden="true" data-shortcut={interfaceCopy.command.shortcut} />
    </button>
    {paletteRequested ? <Suspense fallback={null}><CommandPalette open={paletteOpen} onDismiss={closePalette} codingEntries={codingEntries} /></Suspense> : null}
  </>;
}

export function SiteNavigation({ codingEntries = [] }: { codingEntries?: readonly CodingSearchEntry[] } = {}) {
  return (
    <header className="site-header">
      <Link className="brand" href="/" title={siteCopy.homeLinkLabel}>
        <span className="brand-mark" aria-hidden="true">{profile.initials}<span /></span>
        <span className="brand-name">{profile.displayName}<span aria-hidden="true">.</span></span>
        <span className="sr-only"> home</span>
      </Link>
      <div className="navigation-tools">
        <NavigationLinks />
        <div className="header-palette"><ColorSeedPicker /></div>
        <CommandPaletteController codingEntries={codingEntries} />
      </div>
      <ThemeToggle />
    </header>
  );
}
