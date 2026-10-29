"use client";

import { ThemeToggle } from "./interface-controls";
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation, profile, siteCopy } from "@/content/profile";
import { interfaceCopy } from "@/content/interface";
import { Icon } from "@/components/icon";
import { ColorSeedPicker } from "@/components/color-seed-picker";

const CommandPalette = lazy(() => import("./command-palette"));

export function SiteNavigation() {
  const pathname = usePathname();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [paletteRequested, setPaletteRequested] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const openPalette = useCallback(() => { setPaletteRequested(true); setPaletteOpen(true); }, []);
  const closePalette = useCallback(() => { setPaletteOpen(false); requestAnimationFrame(() => triggerRef.current?.focus()); }, []);
  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openPalette(); }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, [openPalette]);
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label={siteCopy.homeLinkLabel}>
        <span className="brand-mark" aria-hidden="true">{profile.initials}<span /></span>
        <span className="brand-name">{profile.displayName}<span aria-hidden="true">.</span></span>
      </Link>
      <nav className="navigation" aria-label={siteCopy.navigationLabel}>
        {navigation.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return <Link key={item.href} href={item.href} className={`nav-link${active ? " active" : ""}`} aria-current={active ? "page" : undefined}>{item.label}</Link>;
        })}
        <ColorSeedPicker />
        <button ref={triggerRef} type="button" className="command-trigger" aria-label={interfaceCopy.command.triggerLabel} aria-keyshortcuts="Control+K Meta+K" onClick={openPalette}>
          <Icon name="search" /><span>{interfaceCopy.command.trigger}</span><kbd>{interfaceCopy.command.shortcut}</kbd>
        </button>
      </nav><ThemeToggle />
      {paletteRequested ? <Suspense fallback={null}><CommandPalette open={paletteOpen} onDismiss={closePalette} /></Suspense> : null}
    </header>
  );
}
