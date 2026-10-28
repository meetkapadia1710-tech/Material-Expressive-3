# Theme review — 28 October 2026

Dark mode now uses layered charcoal surfaces with lavender actions, violet containers, lime highlights, and separate green, blue, warm and rose accents. It preserves the existing Manrope headings, DM Sans body text, content and routes. The Appearance dropdown is replaced by 48px sun, moon and monitor controls using native radio semantics, accessible names, arrow-key navigation and visible focus indicators. Saved preference and system preference handling remain intact.

## Verification

- Production build passed; all 23 generated routes completed.
- Typecheck passed. ESLint: zero errors, one existing `next/no-img-element` warning for legacy project media.
- All 41 existing tests passed.
- Inspected all six main pages and 15 public project detail pages in dark mode. Rendered text contrast audit passed; the lowest sampled dark contrast ratio was 5.66:1.
- Checked all six main pages at 320px: no horizontal overflow or sampled text contrast failures.
- Checked all six main pages in light mode. Corrected two existing low-contrast labels in Achievements; final sampled minimum there is 4.58:1. No sampled text contrast failures remain on the six main pages.
- Verified keyboard theme changes, visible icon focus, selected state and persistence after refresh.
- Checked dark search fields, empty results, copy-email toast and footer. Reviewed project art and surfaces visually.
- Preview server and temporary browser tab closed after testing; viewport and System preference restored.

`contrast-audit.json` contains the rendered-text results and computed font families. This checks text against composited ancestor backgrounds, excluding decorative, hidden and disabled elements. It is not a complete accessibility certification or a test of every overlapping surface and interaction state. `home-dark.png` shows the updated header and hero.

## Files changed

- `styles/themes.css`
- `app/globals.css`
- `components/icon.tsx`
- `components/interface-controls.tsx`
- `components/achievements/achievements-page.module.css`
- `FEATURES.md`
- `verification/theme-review/README.md`
- `verification/theme-review/contrast-audit.json`
- `verification/theme-review/home-dark.png`
