# Phase 33: Material 3 Expressive Global Shell Features

## 0. Material 3 Specification Research & Values

Before writing any implementation code, we reviewed the official Material Design 3 Expressive guidelines, Material Web (MWC), and Compose Material 3 specifications. Below are the verified metrics, color roles, component dimensions, and motion values relied upon across all five global shell features:

### A. Navigation Bar (Mobile Bottom Navigation)
* **Official Reference**: [Material 3 Navigation Bar](https://m3.material.io/components/navigation-bar) & Compose `NavigationBar`.
* **Container Height**: `80dp` (plus `env(safe-area-inset-bottom)`).
* **Container Color Role**: `var(--color-surface-container)`.
* **Active Indicator**:
  * Shape: Pill (`width: 64dp`, `height: 32dp`, `border-radius: 9999px` / full corner scale).
  * Color: `var(--color-secondary-container)` or `var(--color-primary-container)`.
  * Icon within Active Indicator: `var(--color-on-secondary-container)` or `var(--color-on-primary-container)`.
* **Inactive Items**:
  * Icon Color: `var(--color-on-surface-variant)`.
  * Label Color: `var(--color-on-surface-variant)`.
* **Active Item Label**:
  * Typography: `var(--type-label-medium)` (12px, weight 600, letter-spacing +0.04em).
  * Color: `var(--color-on-surface)`.
* **Touch Target**: Minimum `48dp × 48dp` hit box per destination.
* **Destinations Allowed**: 3 to 5 destinations. We use 4 primary destinations (Home, Projects, About, Achievements) + 1 "More" action destination opening the M3 Modal Bottom Sheet.

### B. Modal Bottom Sheet
* **Official Reference**: [Material 3 Bottom Sheets](https://m3.material.io/components/bottom-sheets).
* **Container Shape**: Top corners extra-large radius (`28dp` / `var(--shape-corner-extra-large, 28px)`), bottom corners `0dp`.
* **Container Color Role**: `var(--color-surface-container-low)` or `var(--color-surface-container)`.
* **Drag Handle**:
  * Width: `32dp`, Height: `4dp`, Corner: `9999px` full pill.
  * Color: `var(--color-on-surface-variant)` with 40% opacity.
  * Top margin: `12dp`, bottom margin: `12dp`.
* **Scrim**: `color-mix(in srgb, var(--color-scrim) 45%, transparent)` with backdrop-filter blur `6px`.
* **Max Width**: `640dp` (centered on tablets/desktop if opened).

### C. Dialogs & Modals (Keyboard Shortcuts Modal)
* **Official Reference**: [Material 3 Dialogs](https://m3.material.io/components/dialogs).
* **Container Shape**: Extra-large radius (`28dp`).
* **Container Color Role**: `var(--color-surface-container-high)`.
* **Elevation**: Level 3 (`box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.2)`).
* **Padding**: `24dp` all around.
* **Header / Title**: `var(--type-headline-small)` (24px, weight 700).

### D. Switches & Icon Buttons
* **Switch Reference**: [Material 3 Switch](https://m3.material.io/components/switch).
  * Track: `52dp × 32dp`, radius `9999px`, border `2px solid var(--color-outline)`.
  * Thumb (Unselected): `16dp × 16dp`, radius `9999px`, background `var(--color-outline)`.
  * Thumb (Selected): `24dp × 24dp`, radius `9999px`, background `var(--color-on-primary)`, track background `var(--color-primary)`.
* **Icon Buttons**: Minimum touch target `48dp × 48dp`, icon size `22dp`.

### E. Window Size Classes & Breakpoints
* **Official Reference**: [Material 3 Adaptive Design](https://m3.material.io/foundations/layout/applying-layout).
  * **Compact**: `< 600dp` (phones in portrait, small foldables).
  * **Medium**: `600dp` – `839dp` (tablets in portrait, foldables).
  * **Expanded**: `840dp` – `1199dp` (tablets in landscape, laptops).
  * **Large**: `1200dp` – `1599dp` (desktop).
  * **Extra Large**: `≥ 1600dp` (ultra-wide desktop).
* **Decision on Compact Breakpoint**: We adhere strictly to the standard M3 Compact window breakpoint (`< 600px`). Below 600px, the mobile bottom navigation bar renders and the top navigation links collapse into the bottom bar and More sheet. Above 600px (Medium and above), the floating top pill navigation is preserved.

### F. Motion & Springs
* **Spatial Spring** (Transforms, Indicator Sliding, Sheet Expansion):
  * Easing: `var(--motion-project-spatial-easing)` (`cubic-bezier(.38, 1.21, .22, 1)`).
  * Duration: `var(--motion-duration-navigation, 250ms)`.
* **Effects Spring** (Opacity, Scrim fade, Color shifts):
  * Easing: `ease-out` / `cubic-bezier(.2, 0, 0, 1)`.
  * Duration: `180ms` – `200ms`.
* **Prefers-Reduced-Motion**:
  * Collapses all spring animations to immediate transitions (`transition-duration: 0.01ms; animation: none;`).

---

## 1. Current Shell Audit & Conflict Analysis

### A. Header & Navigation (`SiteNavigation` in `components/site-navigation.tsx`)
* **Current Structure**:
  * `.site-header`: flex row containing `.brand`, `.navigation-tools` (with `.navigation`, `<ColorSeedPicker />`, `<CommandPaletteController />`), and `<ThemeToggle />`.
  * On `@media (max-width: 720px)`, `.site-header` switches to a 2-row grid. All 6 navigation links are squeezed into a pill bar that wraps onto multiple lines or crowds out the screen on small viewports (320px–430px).
* **Resolution**:
  * Under `600px`, hide `.navigation` inside `.navigation-tools`.
  * Render `<MobileBottomBar />` fixed at the bottom.
  * In the top header under `600px`, simplify `.site-header` so only the Brand mark, Color Seed picker, Command Palette trigger, and Theme toggle remain, freeing up vertical viewport real estate.

### B. Toast Region (`ToastProvider` in `components/interface-controls.tsx`)
* **Current Conflict**:
  * `.toast-region` has `position: fixed; inset: auto 20px 24px; z-index: 100`.
  * On mobile with an 80px bottom navigation bar, toasts would be partially or completely obscured by the bar.
* **Resolution**:
  * On `@media (max-width: 599px)`, set `.toast-region` bottom to `calc(88px + env(safe-area-inset-bottom, 0px))`, smoothly lifting all notifications and snackbars above the navigation bar.

### C. Page Padding & Safe Area Insets
* **Current Conflict**:
  * Main content and footer currently have standard bottom margins (`margin-bottom: 12px` or `margin: 80px auto 0`).
  * On mobile, the bottom navigation bar covers the bottom 80px of scrollable content if no padding is added.
* **Resolution**:
  * Under `600px`, add `padding-bottom: calc(88px + env(safe-area-inset-bottom, 0px))` to `body` / `.site-shell` so content is never obscured when scrolled to the end.

### D. Keyboard Shortcuts & Input Fields
* **Current State**:
  * Global listener for `Ctrl/Cmd + K` exists in `CommandPaletteController`.
  * No existing single-character shortcuts (1-6, T, ?).
* **Resolution**:
  * Register a single global keydown listener (`lib/shortcuts.ts` / `components/shortcuts-modal.tsx`).
  * Strict guard: check `e.target.tagName` against `INPUT`, `TEXTAREA`, `SELECT`, or `isContentEditable`.
  * Suppress when Command Palette, Certificate Modal, or Shortcuts Modal is open (except `Escape`).
  * Add WCAG 2.1.4 single-key shortcut toggle stored in `localStorage` (`portfolio-single-key-shortcuts`).

### E. Service Worker & Caching
* **Current State**:
  * No service worker or manifest currently registered in `portfolio/app/layout.tsx`.
* **Resolution**:
  * Implement `public/sw.js` with versioned cache name (`v1.0.0`).
  * Cache shell, static routes, fonts, and images.
  * Stale-while-revalidate for pages, cache-first for immutable static hashes.
  * Network-first with 3s timeout for `/api/*` endpoints.
  * Update-available notification via toast with reload button.
  * Explicitly disabled in development (`process.env.NODE_ENV !== 'production'`).

### F. Tactile Sound Synthesis
* **Current State**:
  * No sound effects or Web Audio API code currently present.
* **Resolution**:
  * Synthesize all sound effects via native `AudioContext` without downloading external MP3/WAV assets (<3KB code).
  * Default: **OFF**. Opt-in via M3 switch in More sheet, settings, and command palette.
  * Audio context only instantiated on explicit user gesture after opt-in.
  * Respects `prefers-reduced-motion` and pauses when tab is hidden (`visibilitychange`).

---

## 2. Architecture & File Plan

1. **Mobile Bottom Navigation & More Sheet**:
   * `components/shell/mobile-bottom-bar.tsx`
   * `components/shell/more-bottom-sheet.tsx`
   * `components/shell/mobile-bottom-bar.module.css`
2. **Dynamic Social Share Previews (Open Graph / Twitter)**:
   * `lib/og-tokens.ts` (build-time hex tokens matching Default M3 palette)
   * `components/shell/og-image-template.tsx` (reusable M3 Expressive template for Satori/ImageResponse)
   * `public/fonts/manrope-variable.ttf` (local TTF font file for zero-network build-time rendering)
   * `app/opengraph-image.tsx` & `app/twitter-image.tsx` (site root)
   * `app/about/opengraph-image.tsx`, `app/achievements/opengraph-image.tsx`, `app/skills/opengraph-image.tsx`, `app/contact/opengraph-image.tsx`, `app/projects/opengraph-image.tsx`, `app/projects/[slug]/opengraph-image.tsx`
3. **PWA Support**:
   * `app/manifest.ts` (Dynamic Web App Manifest route)
   * `scripts/generate-pwa-icons.mjs` (Generates 192, 512, maskable 512, and apple-touch 180 icons from MK brand mark)
   * `public/sw.js` (Handcrafted production service worker with cache versioning and offline fallback)
   * `components/shell/pwa-manager.tsx` (Client component for SW registration, update toast, offline banner, and beforeinstallprompt capture)
4. **Keyboard Shortcuts Helper Modal**:
   * `content/shortcuts.ts` (Single source of truth for all shortcuts, keys, groups, and descriptions)
   * `components/shell/shortcuts-modal.tsx` (M3 accessible dialog, focus trap, morph transition, WCAG 2.1.4 toggle)
   * `components/shell/shortcuts-modal.module.css`
5. **Tactile Sound Engine**:
   * `lib/sound-engine.ts` (Web Audio API synthesis for soft clicks, toggles, ticks; lazy-loaded, rate-limited)
   * Settings toggle in More sheet, Theme popup, and Command Palette.

