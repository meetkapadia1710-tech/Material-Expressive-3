"use client";

import { ThemeToggle } from "./interface-controls";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation, profile, siteCopy } from "@/content/profile";

export function SiteNavigation() {
  const pathname = usePathname();
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
      </nav><ThemeToggle />
    </header>
  );
}
