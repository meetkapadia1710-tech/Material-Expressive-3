# Dynamic color audit and implementation log

Date: 2026-10-30

## Findings

1. **The palette generator was not seed-faithful.** The picker used `SchemeExpressive` from Material Color Utilities. That scheme is intentionally detached from its source color, so a Lagoon seed (`#006A60`) could produce amber primary roles. The official library distinguishes this from `SchemeContent`, which preserves color affinity. I changed the generator to `SchemeContent`; Lagoon now produces teal primary roles and Violet produces violet roles. This is a product requirement for this picker, not a claim that Material prescribes `SchemeContent` for every application.
2. **There were two seed sources and an unscoped project override.** The picker had local seed state plus the `portfolio-color-seed` key while the document bootstrap and theme controls used `portfolio-color-palette`. A project accent component also applied its colors to the document root asynchronously. These could leave the trigger, current page, and next route in different palettes. The palette record is now the single persisted source; all roles are applied together to the root, and project accent roles are scoped to the card or detail page.
3. **Page paint was split between role tokens and palette aliases.** The audit found old `--palette-*` aliases and legacy short color variables in global and page styles, plus direct paint values in component CSS. The known purple leftovers appeared in Home artwork, project artwork and chips, page-header shapes, About and Achievements cards, navigation/footer, form surfaces, focus/selection styles, and transient UI. Those consumers now use semantic roles. The whole source scan found no Tailwind palette classes, named color declarations, or colored SVG literals outside the intentional seed and theme-generation code described below.
4. **The light surface hierarchy was too flat.** Several panels shared neutral or old palette-alias fills. Light and dark now both use the same semantic surface levels, with a subtle seed-derived page background and progressively distinct container tones.
5. **Some filled artwork did not use its matching foreground role.** The header mark, hero code icon, filled badges, project shapes, and category/status chips now use their corresponding `on-*` role or a neutral surface text role. Role contrast is checked before a generated scheme is accepted.

## Material 3 knowledge-base alignment follow-up

Reviewed the local reverse-engineering extracts for the Material color system, color roles, dynamic schemes, static schemes, scheme selection, and advanced color customization, then cross-checked the official M3 color references and Material Color Utilities source.

- **COMPLIANT — semantic roles and pairings.** App paint is centralized in the standard role variables; filled elements use paired `on-*` foregrounds. This follows the knowledge-base guidance that roles connect UI elements to colors and should be paired intentionally.
- **COMPLIANT — tonal surfaces.** Background, surface, and the five surface-container levels are generated together and used as the page/panel hierarchy. The generated palette also supplies surface dim/bright and inverse roles.
- **COMPLIANT — seed-driven theme.** The visitor-selected seed is the single user-provided source; Material Color Utilities creates light and dark schemes from it. `SchemeContent` is retained because this control is explicitly expected to preserve the selected seed's color affinity. M3 documents dynamic schemes and the library documents scheme variants, but the reviewed M3 guidance does not prescribe one variant for a manually chosen seed; this is a product-specific selection, not an official M3 Expressive mandate.
- **COMPLIANT — error roles.** Error colors remain semantically stable across seed choices and adapt between light and dark, matching the M3 role guidance for semantic error colors.
- **COMPLIANT — fixed Default plus generated palettes.** The historical hand-designed violet/lime role set is the SSR, first-visit, invalid-storage, and Reset palette. Seed choices remain generated and are applied before first paint when saved. M3 distinguishes static and dynamic schemes; the exact Default hues and supporting artwork are product-specific.
- **VERIFIED — Default visual sample.** A local browser review covered Home, Projects, About, Skills, and Achievements in both light and dark Default. The only preserved pre-dynamic reference screenshot is the historical Home dark image; older route screenshots for Projects, About, Skills, and Achievements were not present in the repository.

The exact Default palette and its component artwork are historical product decisions restored from Git; Material role names describe their semantic placement and do not imply that Material prescribes these hues.

## Color source scan

The repository scan covered `app`, `components`, `styles`, `lib`, and `content`, including CSS, TS/TSX, SVG text, inline styles, and component style objects. It searched for hex, RGB/HSL/OKLCH values, CSS named colors, and common Tailwind palette classes. No page-specific Tailwind colors or SVG color literals remained.

Remaining raw color values are intentional and centralized:
- `styles/themes.css`: hand-designed Default roles and fallback token definitions.
- `lib/dynamic-colors.ts` and `lib/dynamic-color-state.ts`: HCT conversion math, `SchemeContent` schema mapping, contrast validation, and storage persistence.
- `lib/project-accent.ts`: scoped `--project-light-*` and `--project-dark-*` CSS custom properties calculated per project accent seed.
- `content/interface.ts`: curated preset seed swatches (Default, Violet, Lagoon, Ochre, Rose).

## Implementation Details

### 1. Unified Dynamic Color State
All dynamic color state is synchronized through `lib/dynamic-color-state.ts` using `portfolio-color-palette` as the single authoritative storage key. A document bootstrap script resolves this before initial paint to prevent theme flashes.

### 2. Scoped Project Accent System
Projects with specific accent seeds (e.g. RepoGrade, Hindsight) compute scoped CSS custom properties via `projectAccentStyle(seed)`. These properties attach directly to the card or detail container (`data-project-accent="true"`), preventing leakage into global document styles.

### 3. Contrast Verification
All color roles and component pairs are checked against WCAG 2.1 AA requirements (4.5:1 for body copy and icons, 3:1 for large display elements) in `tests/theme-token-contrast.test.tsx`.

## Platform-Scoped Color Schemes for /achievements

Date: 2026-11-03

### 1. Platform Seeds & Architecture
Platform cards and widgets on `/achievements` now use fixed, brand-specific Material Design 3 Expressive color schemes generated exclusively using Material Color Utilities (`Hct`, `SchemeContent`, `TonalPalette`). Each scheme is applied via scoped CSS variables (`[data-platform-scheme="..."]`), overriding global role tokens locally so child components strictly consume standard role tokens (`--color-primary`, `--color-surface`, `--color-surface-container-*`, `--color-on-*`, etc.) with zero hardcoded hexes.

- **LeetCode**: Seed `#FFA116` (warm amber/yellow). Dark scheme uses low-chroma charcoal neutral surfaces with amber as primary.
- **CodeChef**: Seed `#795548` (earthy brown). Rich brown surfaces/containers paired with cream and tan on-colors.
- **GitHub**: Seed `#4A4D50` (near-neutral low-chroma grey, chroma 4.8). Crisp grey/black surfaces with high-contrast text.
- **GeeksforGeeks**: Seed `#2F8D46` (signature green). Forest green surfaces with vibrant mint accents.

### 2. Tone Adjustments & Difficulty / Ramp Separation
1. **LeetCode Dark Mode Neutralization**:
   - Rather than muddy brown surfaces from raw seed chroma, dark surfaces are derived from a low-chroma neutral palette `Hct(68, 4)`:
     - `surface`: `#181410` (tone 8)
     - `surface-container-low`: `#1E1915` (tone 10)
     - `surface-container`: `#26211C` (tone 14)
   - Primary is anchored at tone 74 (`#FFA116`), preserving LeetCode's vibrant amber identity while achieving 8.4:1 contrast on container backgrounds.
2. **Algorithmic Difficulty Separation (Easy / Medium / Hard)**:
   - **Easy**: Mapped to `tertiary` generated from green tonal palette (`#6DBD6A` in dark mode, `#166A20` in light mode).
   - **Medium**: Mapped to `primary` warm amber (`#FFA116` in dark mode, `#7C4A00` in light mode).
   - **Hard**: Mapped to `error` red (`#FF5449` in dark mode, `#BA1A1A` in light mode).
   - All three difficulty tiers are visually separated by distinct hues and reinforced with explicit text labels and numeric counts.
3. **GitHub Heatmap 5-Step Green Tonal Ramp**:
   - Replaced legacy hardcoded hexes with semantic CSS custom properties (`--github-heatmap-level-*`) derived from a green tonal palette `Hct(145.6, 53.0)`:
     - **Dark Mode**: Level 0 = `surface-container-high`, Level 1 = tone 25 (`#00460E`), Level 2 = tone 40 (`#1B6D24`), Level 3 = tone 60 (`#53A252`), Level 4 = tone 75 (`#7ACB76`).
     - **Light Mode**: Level 0 = `surface-container`, Level 1 = tone 85 (`#95E88F`), Level 2 = tone 70 (`#6DBD6A`), Level 3 = tone 50 (`#38873A`), Level 4 = tone 30 (`#005312`).
4. **GeeksforGeeks Card Title Contrast Fix**:
   - Previously, the title suffered from severe illegibility (~1.5:1 contrast) due to dark green hover/text variables overlaying a dark green background.
   - Now, card text pairs `on-surface` (`#FFFFFF` on `#1A1F19` = 16.7:1) with `primary` accents/hovers (`#93F19E` = 12.2:1), exceeding WCAG AAA standards.

### 3. Contrast Verification Summary
All text, icon, and surface pairings verified via automated tests in `tests/theme-token-contrast.test.tsx`:
- **LeetCode (Light)**: on-surface = 17.0:1 | on-surface-variant = 10.9:1 | primary = 6.3:1
- **LeetCode (Dark)**: on-surface = 17.1:1 | on-surface-variant = 10.1:1 | primary = 8.4:1
- **CodeChef (Light)**: on-surface = 17.1:1 | on-surface-variant = 10.9:1 | primary = 10.9:1
- **CodeChef (Dark)**: on-surface = 16.7:1 | on-surface-variant = 12.2:1 | primary = 12.2:1
- **GitHub (Light)**: on-surface = 17.1:1 | on-surface-variant = 11.0:1 | primary = 11.0:1
- **GitHub (Dark)**: on-surface = 16.8:1 | on-surface-variant = 12.3:1 | primary = 12.2:1
- **GeeksforGeeks (Light)**: on-surface = 17.1:1 | on-surface-variant = 10.9:1 | primary = 10.9:1
- **GeeksforGeeks (Dark)**: on-surface = 16.7:1 | on-surface-variant = 12.3:1 | primary = 12.2:1

### 4. Data Audit & Resolution
1. **LeetCode 762+ vs 763 Count Consistency**:
   - *Root Cause*: Meet Kapadia (`Code-Hacker_17`) solved an additional Medium problem on LeetCode ($371\text{ Easy} + 337\text{ Medium} + 55\text{ Hard} = 763$). The static fallback recorded 762 ($371 + 336 + 55$), but the client-side GraphQL route `/api/leetcode` returned live 763, creating a mismatch between the profile card (762+) and distribution panel (763+).
   - *Fix*: Standardized both static snapshot and live defaults to exact 763 (371 Easy, 337 Medium, 55 Hard) across `content/achievements.ts`, `lib/leetcode.ts`, `components/achievements/leetcode-widget.tsx`, and `lib/skill-projects.ts`.
   - *Suffix Note*: Dropped the `+` suffix on LeetCode cards because 763 represents the exact, fully verified sum of accepted submissions.
2. **GitHub Heatmap Activity Timeline**:
   - *Investigation*: Inspected raw HTML fetched from `https://github.com/users/meetkapadia1710-tech/contributions`. Meet had virtually no public commits between late August and late October 2026 (0 contributions recorded), followed by daily commits starting October 28 (creating the active 6-day streak ending November 2).
   - *Finding*: The heatmap calendar correctly spans all 53 weeks without cutoff or staleness. The blank period between September and October is an accurate reflection of public commit history.
3. **Data Sync Truthfulness**:
   - Both LeetCode and GitHub routes revalidate on a 1-hour ISR window (`revalidate = 3600`).
   - Replaced ambiguous "Live Sync" badges with `"LeetCode Sync • Hourly"` and `"GitHub Sync • Hourly"` along with explicit tooltip descriptions detailing hourly synchronization.


