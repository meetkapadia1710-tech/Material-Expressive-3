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

