"use client";

import { useEffect, useState } from "react";

export interface ActiveThemeTokens {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  outline: string;
  outlineVariant: string;
  isDark: boolean;
}

export function getThemeTokens(): ActiveThemeTokens {
  if (typeof window === "undefined") {
    return {
      primary: "#6142AE",
      onPrimary: "#FFFFFF",
      primaryContainer: "#E9DDFF",
      onPrimaryContainer: "#292431",
      secondary: "#E3F29C",
      onSecondary: "#292431",
      secondaryContainer: "#F0F6E4",
      background: "#FAF8F3",
      onBackground: "#292431",
      surface: "#FFFDF9",
      onSurface: "#292431",
      surfaceContainer: "#F0EDE6",
      surfaceContainerHigh: "#F0EDE6",
      outline: "#8F8498",
      outlineVariant: "#DED9D2",
      isDark: false
    };
  }

  const root = document.documentElement;
  const isDark = root.dataset.theme === "dark";
  const cs = getComputedStyle(root);

  const read = (prop: string, fallback: string) => {
    const val = cs.getPropertyValue(prop).trim();
    return val && /^#[0-9a-f]{3,8}$|^rgb/i.test(val) ? val : fallback;
  };

  return {
    primary: read("--color-primary", isDark ? "#CFB7FF" : "#6142AE"),
    onPrimary: read("--color-on-primary", isDark ? "#241933" : "#FFFFFF"),
    primaryContainer: read("--color-primary-container", isDark ? "#3D2D53" : "#E9DDFF"),
    onPrimaryContainer: read("--color-on-primary-container", isDark ? "#E0D8EC" : "#292431"),
    secondary: read("--color-secondary", isDark ? "#CBE78D" : "#E3F29C"),
    onSecondary: read("--color-on-secondary", isDark ? "#283815" : "#292431"),
    secondaryContainer: read("--color-secondary-container", isDark ? "#31462F" : "#F0F6E4"),
    background: read("--color-background", isDark ? "#19141F" : "#FAF8F3"),
    onBackground: read("--color-on-background", isDark ? "#E6E1E5" : "#292431"),
    surface: read("--color-surface", isDark ? "#19141F" : "#FFFDF9"),
    onSurface: read("--color-on-surface", isDark ? "#E6E1E5" : "#292431"),
    surfaceContainer: read("--color-surface-container", isDark ? "#2A2333" : "#F0EDE6"),
    surfaceContainerHigh: read("--color-surface-container-high", isDark ? "#352D3F" : "#EAE6DF"),
    outline: read("--color-outline", isDark ? "#938F99" : "#8F8498"),
    outlineVariant: read("--color-outline-variant", isDark ? "#49454F" : "#DED9D2"),
    isDark
  };
}

export function createCardFrontSvg(t: ActiveThemeTokens): string {
  const cardBg = t.isDark ? "#221935" : "#FAF7FC";
  const cardBorder = t.isDark ? "#433261" : "#DED6E8";
  const slotBg = t.isDark ? "#160F24" : "#EDE7F3";
  const namePillBg = t.isDark ? "#2E2147" : "#FFFFFF";
  const namePillBorder = t.isDark ? "#433261" : "#E5DDF0";
  const haloColor = t.isDark ? t.primaryContainer : t.primary;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="720" viewBox="0 0 512 720">
    <defs>
      <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${t.primary}" />
        <stop offset="100%" stop-color="${t.primary}" stop-opacity="0.9" />
      </linearGradient>
      <linearGradient id="chipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#EED67C" />
        <stop offset="50%" stop-color="#D4AF37" />
        <stop offset="100%" stop-color="#AA821A" />
      </linearGradient>
    </defs>

    <!-- Card Base & Border -->
    <rect x="16" y="16" width="480" height="688" rx="36" fill="${cardBorder}" />
    <rect x="20" y="20" width="472" height="680" rx="32" fill="${cardBg}" />

    <!-- Slot Guide -->
    <rect x="196" y="38" width="120" height="22" rx="11" fill="${slotBg}" />

    <!-- Top Header -->
    <rect x="48" y="80" width="416" height="68" rx="22" fill="url(#headerGrad)" />
    <!-- Secondary Lime Chip -->
    <rect x="64" y="94" width="40" height="40" rx="14" fill="${t.secondary}" />
    <!-- Star Spark in Chip -->
    <path d="M84 102 L86 112 L96 114 L86 116 L84 126 L82 116 L72 114 L82 112 Z" fill="${t.onSecondary}" />
    <!-- Header Titles -->
    <text x="120" y="108" font-family="'Manrope', 'DM Sans', -apple-system, sans-serif" font-size="18" font-weight="800" fill="${t.onPrimary}" letter-spacing="0.5">MEET KAPADIA</text>
    <text x="120" y="130" font-family="'Manrope', 'DM Sans', -apple-system, sans-serif" font-size="12" font-weight="600" fill="${t.onPrimary}" opacity="0.85" letter-spacing="1">PORTFOLIO · 2026</text>

    <!-- Decorative Orbiting Halo -->
    <circle cx="256" cy="265" r="110" fill="none" stroke="${haloColor}" stroke-width="2" stroke-dasharray="6 8" opacity="0.4" />

    <!-- Central Monogram Emblem (exact website .brand-mark) -->
    <g transform="translate(256, 265)">
      <rect x="-70" y="-70" width="140" height="140" rx="36" fill="${t.secondary}" transform="rotate(-7)" />
      <!-- Dot indicator at top right -->
      <circle cx="58" cy="-56" r="10" fill="${cardBg}" />
      <circle cx="58" cy="-56" r="7" fill="${t.primary}" />
      <!-- 'MK' Typography -->
      <text x="0" y="16" font-family="'Manrope', 'DM Sans', -apple-system, sans-serif" font-size="48" font-weight="900" fill="${t.onSecondary}" text-anchor="middle" letter-spacing="-1" transform="rotate(-7)">MK</text>
    </g>

    <!-- Name Badge -->
    <rect x="56" y="385" width="400" height="52" rx="26" fill="${namePillBg}" stroke="${namePillBorder}" stroke-width="1.5" />
    <text x="256" y="419" font-family="'Manrope', 'DM Sans', -apple-system, sans-serif" font-size="22" font-weight="800" fill="${t.onSurface}" text-anchor="middle" letter-spacing="0.5">MEET KAPADIA</text>

    <!-- Role Pill -->
    <rect x="76" y="450" width="360" height="38" rx="19" fill="${t.primaryContainer}" />
    <text x="256" y="475" font-family="'Manrope', 'DM Sans', -apple-system, sans-serif" font-size="13" font-weight="700" fill="${t.onPrimaryContainer}" text-anchor="middle" letter-spacing="0.8">DESIGN ENGINEER · DEVELOPER</text>

    <!-- Education Pill -->
    <rect x="96" y="498" width="320" height="34" rx="17" fill="${t.secondary}" />
    <text x="256" y="521" font-family="'Manrope', 'DM Sans', -apple-system, sans-serif" font-size="12" font-weight="700" fill="${t.onSecondary}" text-anchor="middle" letter-spacing="0.8">IIIT VADODARA · B.TECH CSE</text>

    <!-- Bottom Strip: Holographic Chip & Barcode -->
    <rect x="52" y="565" width="76" height="54" rx="10" fill="url(#chipGrad)" />
    <rect x="62" y="575" width="56" height="34" rx="6" fill="none" stroke="#7A5805" stroke-width="2" />
    <line x1="90" y1="565" x2="90" y2="619" stroke="#7A5805" stroke-width="2" />

    <!-- Barcode Strip -->
    <g transform="translate(150, 565)" fill="${t.primary}">
      <rect x="0" y="0" width="3" height="42" />
      <rect x="6" y="0" width="6" height="42" />
      <rect x="16" y="0" width="2" height="42" />
      <rect x="22" y="0" width="5" height="42" />
      <rect x="31" y="0" width="2" height="42" />
      <rect x="37" y="0" width="7" height="42" />
      <rect x="48" y="0" width="3" height="42" />
      <rect x="55" y="0" width="2" height="42" />
      <rect x="61" y="0" width="6" height="42" />
      <rect x="71" y="0" width="2" height="42" />
      <rect x="77" y="0" width="4" height="42" />
      <rect x="85" y="0" width="2" height="42" />
      <rect x="91" y="0" width="7" height="42" />
      <rect x="102" y="0" width="3" height="42" />
      <rect x="109" y="0" width="2" height="42" />
      <rect x="115" y="0" width="5" height="42" />
      <rect x="124" y="0" width="2" height="42" />
      <rect x="130" y="0" width="6" height="42" />
      <rect x="140" y="0" width="3" height="42" />
      <rect x="147" y="0" width="2" height="42" />
      <rect x="153" y="0" width="6" height="42" />
      <rect x="163" y="0" width="2" height="42" />
      <rect x="169" y="0" width="5" height="42" />
      <rect x="178" y="0" width="3" height="42" />
      <rect x="185" y="0" width="7" height="42" />
      <rect x="196" y="0" width="2" height="42" />
      <rect x="202" y="0" width="6" height="42" />
      <rect x="212" y="0" width="3" height="42" />
      <rect x="219" y="0" width="4" height="42" />
      <rect x="227" y="0" width="2" height="42" />
      <rect x="233" y="0" width="7" height="42" />
      <rect x="244" y="0" width="3" height="42" />
      <rect x="251" y="0" width="2" height="42" />
      <rect x="257" y="0" width="6" height="42" />
      <rect x="267" y="0" width="3" height="42" />
      <rect x="274" y="0" width="2" height="42" />
      <rect x="280" y="0" width="5" height="42" />
      <rect x="289" y="0" width="4" height="42" />
      <rect x="297" y="0" width="3" height="42" />
    </g>
    <text x="295" y="624" font-family="'Manrope', 'DM Sans', -apple-system, sans-serif" font-size="11" font-weight="600" fill="${t.outline}" text-anchor="middle" letter-spacing="1">MK-2024-CSE-0831</text>
  </svg>`;

  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

export function createCardBackSvg(t: ActiveThemeTokens): string {
  const cardBg = t.isDark ? "#221935" : "#FAF7FC";
  const cardBorder = t.isDark ? "#433261" : "#DED6E8";
  const panelBg = t.isDark ? "#2A1D45" : "#F2ECF7";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="720" viewBox="0 0 512 720">
    <rect x="16" y="16" width="480" height="688" rx="36" fill="${cardBorder}" />
    <rect x="20" y="20" width="472" height="680" rx="32" fill="${cardBg}" />

    <!-- Slot Guide -->
    <rect x="196" y="38" width="120" height="22" rx="11" fill="${t.isDark ? "#160F24" : "#EDE7F3"}" />

    <!-- M3 Decorative Grid -->
    <g opacity="0.25">
      <rect x="64" y="90" width="28" height="28" rx="8" fill="${t.primary}" />
      <circle cx="140" cy="104" r="14" fill="${t.secondary}" />
      <rect x="198" y="90" width="28" height="28" rx="14" fill="${t.primary}" />
      <rect x="270" y="90" width="28" height="28" rx="8" fill="${t.secondary}" />
      <circle cx="356" cy="104" r="14" fill="${t.primary}" />
      <rect x="414" y="90" width="28" height="28" rx="14" fill="${t.secondary}" />

      <circle cx="78" cy="160" r="14" fill="${t.secondary}" />
      <rect x="126" y="146" width="28" height="28" rx="14" fill="${t.primary}" />
      <rect x="198" y="146" width="28" height="28" rx="8" fill="${t.secondary}" />
      <circle cx="284" cy="160" r="14" fill="${t.primary}" />
      <rect x="342" y="146" width="28" height="28" rx="14" fill="${t.secondary}" />
      <rect x="414" y="146" width="28" height="28" rx="8" fill="${t.primary}" />
    </g>

    <!-- Center Panel -->
    <rect x="52" y="210" width="408" height="260" rx="28" fill="${panelBg}" stroke="${cardBorder}" stroke-width="1.5" />
    <text x="256" y="246" font-family="'Manrope', 'DM Sans', -apple-system, sans-serif" font-size="14" font-weight="800" fill="${t.primary}" text-anchor="middle" letter-spacing="1.5">MATERIAL 3 EXPRESSIVE</text>
    <text x="256" y="274" font-family="'Manrope', 'DM Sans', -apple-system, sans-serif" font-size="20" font-weight="900" fill="${t.onSurface}" text-anchor="middle" letter-spacing="0.5">PORTFOLIO ARCHITECTURE</text>

    <!-- Feature Pills -->
    <rect x="80" y="302" width="352" height="34" rx="17" fill="${t.primaryContainer}" />
    <text x="256" y="324" font-family="'Manrope', 'DM Sans', -apple-system, sans-serif" font-size="12" font-weight="700" fill="${t.onPrimaryContainer}" text-anchor="middle" letter-spacing="0.6">FLUID SPRINGS · DYNAMIC SEED</text>

    <rect x="80" y="348" width="352" height="34" rx="17" fill="${t.secondary}" />
    <text x="256" y="370" font-family="'Manrope', 'DM Sans', -apple-system, sans-serif" font-size="12" font-weight="700" fill="${t.onSecondary}" text-anchor="middle" letter-spacing="0.6">HCT COLOR HARMONY · SPATIAL MOTION</text>

    <text x="256" y="425" font-family="'Manrope', 'DM Sans', -apple-system, sans-serif" font-size="12" font-weight="600" fill="${t.outline}" text-anchor="middle" letter-spacing="0.5">THOUGHTFUL SOFTWARE · ALWAYS LEARNING</text>

    <!-- QR Code Block -->
    <rect x="201" y="495" width="110" height="110" rx="16" fill="${t.secondary}" />
    <!-- QR Grid simulation -->
    <g fill="${t.onSecondary}">
      <rect x="211" y="505" width="28" height="28" rx="6" />
      <rect x="216" y="510" width="18" height="18" rx="3" fill="${t.secondary}" />
      <rect x="221" y="515" width="8" height="8" rx="1" fill="${t.onSecondary}" />

      <rect x="263" y="505" width="28" height="28" rx="6" />
      <rect x="268" y="510" width="18" height="18" rx="3" fill="${t.secondary}" />
      <rect x="273" y="515" width="8" height="8" rx="1" fill="${t.onSecondary}" />

      <rect x="211" y="557" width="28" height="28" rx="6" />
      <rect x="216" y="562" width="18" height="18" rx="3" fill="${t.secondary}" />
      <rect x="221" y="567" width="8" height="8" rx="1" fill="${t.onSecondary}" />

      <rect x="247" y="513" width="7" height="7" />
      <rect x="250" y="530" width="12" height="6" />
      <rect x="245" y="545" width="8" height="8" />
      <rect x="265" y="545" width="7" height="14" />
      <rect x="255" y="565" width="16" height="8" />
      <rect x="278" y="565" width="12" height="12" />
    </g>

    <text x="256" y="632" font-family="'Manrope', 'DM Sans', -apple-system, sans-serif" font-size="11" font-weight="700" fill="${t.onSurface}" text-anchor="middle" letter-spacing="1">SCAN TO CONNECT</text>
  </svg>`;

  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

export function createStrapSvg(t: ActiveThemeTokens): string {
  const strapBg = t.isDark ? "#1C142E" : "#ECE5F5";
  const stitchColor = t.primary;
  const accentColor = t.secondary;

  // Lanyard.tsx paintStrap rotates image by +90deg into a 192(w) x along(h) canvas.
  // Using 384(w) x 192(h) gives along = 384 and tileRatio = 2.
  // Rotating inner elements by -90deg renders them upright on the hanging strap.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="384" height="192" viewBox="0 0 384 192">
    <rect width="384" height="192" fill="${strapBg}" />

    <!-- Stitched Edge Borders -->
    <line x1="0" y1="12" x2="384" y2="12" stroke="${stitchColor}" stroke-width="4" stroke-dasharray="8 6" opacity="0.85" />
    <line x1="0" y1="180" x2="384" y2="180" stroke="${stitchColor}" stroke-width="4" stroke-dasharray="8 6" opacity="0.85" />

    <!-- Repeating Element 1 -->
    <g transform="translate(96, 96) rotate(-90)">
      <rect x="-14" y="-36" width="28" height="28" rx="9" fill="${accentColor}" />
      <path d="M0 -30 L2 -24 L8 -22 L2 -20 L0 -14 L-2 -20 L-8 -22 L-2 -24 Z" fill="${t.onSecondary}" />
      <rect x="-64" y="2" width="128" height="28" rx="14" fill="${t.primary}" />
      <text x="0" y="21" font-family="'Manrope', -apple-system, sans-serif" font-size="12" font-weight="800" fill="${t.onPrimary}" text-anchor="middle" letter-spacing="1">MK · M3</text>
    </g>

    <!-- Repeating Element 2 -->
    <g transform="translate(288, 96) rotate(-90)">
      <rect x="-14" y="-36" width="28" height="28" rx="9" fill="${accentColor}" />
      <path d="M0 -30 L2 -24 L8 -22 L2 -20 L0 -14 L-2 -20 L-8 -22 L-2 -24 Z" fill="${t.onSecondary}" />
      <rect x="-64" y="2" width="128" height="28" rx="14" fill="${t.primary}" />
      <text x="0" y="21" font-family="'Manrope', -apple-system, sans-serif" font-size="12" font-weight="800" fill="${t.onPrimary}" text-anchor="middle" letter-spacing="1">PORTFOLIO</text>
    </g>
  </svg>`;

  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

export function useLanyardTheme() {
  const [tokens, setTokens] = useState<ActiveThemeTokens>(getThemeTokens);

  useEffect(() => {
    const update = () => {
      setTokens(getThemeTokens());
    };

    update();

    window.addEventListener("portfolio:theme-choice", update);
    window.addEventListener("portfolio:theme-effective", update);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", update);

    const observer = new MutationObserver(() => update());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "data-color-palette", "data-color-seed", "style"]
    });

    return () => {
      window.removeEventListener("portfolio:theme-choice", update);
      window.removeEventListener("portfolio:theme-effective", update);
      media.removeEventListener("change", update);
      observer.disconnect();
    };
  }, []);

  const frontImage = createCardFrontSvg(tokens);
  const backImage = createCardBackSvg(tokens);
  const strapImage = createStrapSvg(tokens);
  const cardColor = tokens.isDark ? "#2A1D47" : "#FAF7FC";
  const strapColor = tokens.isDark ? "#1C142E" : "#ECE5F5";

  return {
    tokens,
    frontImage,
    backImage,
    strapImage,
    cardColor,
    strapColor
  };
}
