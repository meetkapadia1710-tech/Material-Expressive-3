"use client";

import { ThemeToggle } from "./interface-controls";
import { Suspense, lazy, memo, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { navigation, profile, siteCopy } from "@/content/profile";
import { interfaceCopy } from "@/content/interface";
import { Icon } from "@/components/icon";
import { ColorSeedPicker } from "@/components/color-seed-picker";
import { motion } from "framer-motion";
import { readMotionBezier, readMotionMilliseconds } from "@/components/motion/motion-tokens";

const CommandPalette = lazy(() => import("./command-palette"));

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
      return <Link key={item.href} href={item.href} prefetch className={`nav-link${active ? " active" : ""}`} aria-current={active ? "page" : undefined} onMouseEnter={prefetch} onFocus={prefetch}>
        {active ? <motion.span layoutId="portfolio-active-nav-indicator" className="nav-active-indicator" aria-hidden="true" transition={layoutTransition} /> : null}
        <span className="nav-link-label">{item.label}</span>
      </Link>;
    })}
  </nav>;
});

function CommandPaletteController() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [paletteRequested, setPaletteRequested] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const openPalette = useCallback(() => {
    if (document.documentElement.dataset.introPending === "true") return;
    setPaletteRequested(true);
    setPaletteOpen(true);
  }, []);
  const closePalette = useCallback(() => { setPaletteOpen(false); requestAnimationFrame(() => triggerRef.current?.focus()); }, []);
  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openPalette(); }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, [openPalette]);

  return <>
    <button ref={triggerRef} type="button" className="command-trigger" aria-label={interfaceCopy.command.triggerLabel} aria-keyshortcuts="Control+K Meta+K" onClick={openPalette}>
      <Icon name="search" /><span>{interfaceCopy.command.trigger}</span><kbd>{interfaceCopy.command.shortcut}</kbd>
    </button>
    {paletteRequested ? <Suspense fallback={null}><CommandPalette open={paletteOpen} onDismiss={closePalette} /></Suspense> : null}
  </>;
}

export function SiteNavigation() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label={siteCopy.homeLinkLabel}>
        <span className="brand-mark" aria-hidden="true">{profile.initials}<span /></span>
        <span className="brand-name">{profile.displayName}<span aria-hidden="true">.</span></span>
      </Link>
      <div className="navigation-tools">
        <NavigationLinks />
        <ColorSeedPicker />
        <CommandPaletteController />
      </div>
      <ThemeToggle />
    </header>
  );
}
