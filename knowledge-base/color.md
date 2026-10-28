# Color systems

Research started: 2026-10-27; evidence audit: 2026-10-28 (Asia/Calcutta). This file distinguishes design guidance, implementation evidence, and analyst recommendations. See [source ledger](evidence/sources-foundations.json). REA directly rendered the color-system overview; other verification methods are identified in that ledger.

## Current system and dated changes

The rendered overview describes static and dynamic schemes, dark-theme roles, and 26+ roles mapped to components. Its May 2025 update introduces tokenized standard, medium, and high contrast levels. Platform support needs separate verification. [C09 — Color-system overview](https://m3.material.io/styles/color/system/overview)

The same overview records two changes that matter when reusing older examples:

- **August 2024:** light-theme on-container roles for primary, secondary, tertiary, and error became more colorful.
- **February 2023:** tone-based surfaces became independent of elevation. Baseline light surface changed from tone 99 to 98, neutral chroma from 4 to 6, and fixed accents were added.

These are verified descriptions of published changes, not measured colors from a running application. [C09 — Color-system overview](https://m3.material.io/styles/color/system/overview)

## From source color to interface

The verified model is **source color → key colors → tonal palettes → semantic roles → component properties**. A source may be chosen by a designer or extracted from an image. HCT expresses hue, chroma, and tone; hue is circular from 0–360, and tone runs from 0 (black) to 100 (white). The introductory MCU model generates five key palettes and describes 13 selected tones per palette. This does not mean a tonal-palette algorithm can produce only 13 colors. `DynamicScheme` associates generated values with roles while considering contrast and fidelity. [C01 — MCU dynamic scheme](https://github.com/material-foundation/material-color-utilities/blob/main/concepts/dynamic_color_scheme.md)

Android names the five key colors **primary, secondary, tertiary, neutral, neutral variant**. A chosen brand input is not necessarily the exact output primary-role value: tone assignment is part of scheme generation. Light and dark schemes need their own assignments. Android's guidance recommends semantic tokens, consistent color meaning, and restraint when mixing dynamic sources. [C02 — Android color](https://developer.android.com/design/ui/mobile/guides/styles/color)

## Semantic role families

| Family | Main purpose | Typical foreground/background pairing |
|---|---|---|
| Primary | Most prominent actions and active emphasis | `onPrimary` on `primary` |
| Secondary | Less prominent emphasis | `onSecondaryContainer` on `secondaryContainer` |
| Tertiary | Complementary accents | `onTertiaryContainer` on `tertiaryContainer` |
| Error | Error communication | `onErrorContainer` on `errorContainer` |
| Surface | Backgrounds and neutral containers | `onSurface` on surface/container roles |
| Outline | Boundaries | `outline` for meaningful boundaries; `outlineVariant` for lower-emphasis separation |

Role names describe purpose: `container` is a fill and `on` its foreground. Preserve intended pairings. The current page data describes a 45-role diagram including additions, while the overview says 26+; neither establishes a universal API count. [C10 — Color roles](https://m3.material.io/styles/color/roles), [C09 — Current overview](https://m3.material.io/styles/color/system/overview)

Additional roles include inverse colors, fixed/fixed-dim accents and foregrounds, and bright/dim surfaces. Fixed accents retain tone across themes. Error ignores dynamic sources but adapts to theme. Keep surface mappings consistent across breakpoints. [C10 — Color roles](https://m3.material.io/styles/color/roles)

## Surface hierarchy and platform differences

Flutter documents tone-based surfaces and containers as the successor to the older opacity-overlay model. Its roles include `surfaceBright`, `surfaceDim`, and container levels from lowest to highest. Matching `on` colors should provide at least 4.5:1 contrast for readable content. Flutter's constructor marks `background`, `onBackground`, and `surfaceVariant` deprecated in favor of surface-based alternatives. These are **Flutter API facts**, not proof that identically named web properties are removed. [C04 — Flutter ColorScheme](https://api.flutter.dev/flutter/material/ColorScheme-class.html)

The Android Views library separately documents tonal surface defaults from 1.11.0-alpha02 and recommends `MaterialColors.getColor()` for resolving them. This is a version-specific implementation statement; verify the dependency actually used by a project. [C05 — Material Components Android color](https://github.com/material-components/material-components-android/blob/master/docs/theming/Color.md)

## A verified tone-mapping example

These values are observed in the official **Material Web generated design-system v0.192 token file**, accessed on the research date. They illustrate the reference-to-system mapping; they are **not a universal table for all current dynamic schemes, contrast levels, or Expressive implementations**.

| Role | Light reference | Dark reference |
|---|---|---|
| primary | primary40 | primary80 |
| on-primary | primary100 | primary20 |
| primary-container | primary90 | primary30 |
| on-primary-container | primary10 | primary90 |
| surface | neutral98 | neutral6 |
| on-surface | neutral10 | neutral90 |
| surface-container-lowest | neutral100 | neutral4 |
| surface-container | neutral94 | neutral12 |
| surface-container-highest | neutral90 | neutral22 |

Reference: [C06 — generated web color mapping](https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-sys-color.scss). The branch is mutable; the internal `v0.192` label is observed, but a repository commit was not pinned in this topic pass.

## Dynamic, static, and custom schemes

The site's scheme-selection guidance distinguishes a static baseline from a scheme regenerated for changing sources. Static schemes give predictable colors; dynamic schemes enable personalization and user-controlled contrast. The dynamic-source guidance distinguishes wallpaper-derived inputs from content such as artwork or thumbnails. Designing the initial role mapping with baseline colors is useful before previewing multiple dynamic inputs. These are published recommendations from retrieved page data, not observed algorithm outputs. [C11 — Choosing a scheme](https://m3.material.io/styles/color/choosing-a-scheme), [C12 — Choosing a source](https://m3.material.io/styles/color/dynamic/choosing-a-source)

Compose documents dynamic colors from Android 12 onward, with a static light/dark fallback for earlier systems. Material Theme Builder can generate theme colors and export Compose files. The theme's semantic roles remain the interface used by components. [F03 — Material 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3)

Material Color Utilities supplies tools for HCT, quantization, scoring, harmonization, contrast, palettes, and scheme generation. Its README currently lists implementations in C++, Dart, Java, Swift, TypeScript, and Kotlin. This inventory establishes available source implementations, not equal feature parity or release maturity across languages. [C07 — MCU](https://github.com/material-foundation/material-color-utilities)

## Advanced customization decisions

| Decision | Verified guidance | Source |
|---|---|---|
| Combine schemes | Keep a consistent base; place content-based schemes in meaningful regions with the source content visible. The guide recommends at most two source types on one screen. | [C13 — Apply colors](https://m3.material.io/styles/color/advanced/apply-colors) |
| Remap a component | Choose a semantic role for the element, retain intended foreground/background relationships, and test multiple hues and themes. | [C13 — Apply colors](https://m3.material.io/styles/color/advanced/apply-colors) |
| Add semantic or brand colors | Define a static color through the system to obtain main, on-main, container, and on-container roles. | [C14 — Define new colors](https://m3.material.io/styles/color/advanced/define-new-colors) |
| Add custom roles | Specify a reference palette and light/dark tones, foreground/background pairings, and contrast requirements; use this when existing roles cannot meet the need. | [C14 — Define new colors](https://m3.material.io/styles/color/advanced/define-new-colors) |
| Preserve the character of an input | Fidelity adjusts tones to better match the input while retaining contrast relationships. It is different from harmonization. | [C15 — Adjust existing colors](https://m3.material.io/styles/color/advanced/adjust-existing-colors) |
| Blend a static accent with a dynamic scheme | Harmonization shifts hue toward the primary color within limits. Avoid it when the color must remain visually exact, and preview multiple dynamic schemes. | [C15 — Adjust existing colors](https://m3.material.io/styles/color/advanced/adjust-existing-colors) |

The role page's general 3:1 statement does not replace text requirements. Advanced guidance specifies 4.5:1 for small text and 3:1 for large text. Measure actual rendered pairs. [C10 — Color roles](https://m3.material.io/styles/color/roles), [C13 — Apply colors](https://m3.material.io/styles/color/advanced/apply-colors)

## Applying colors on the web

Material Web exposes semantic colors as CSS custom properties with the `--md-sys-color-` prefix. The same properties can style a custom component; surface-family content uses `on-surface` or `on-surface-variant` rather than an independently invented foreground for each surface level. [C08 — Material Web color](https://github.com/material-components/material-web/blob/main/docs/theming/color.md)

Analyst-authored example; it relies on a separately supplied theme:

```css
.account-summary {
  background: var(--md-sys-color-surface-container);
  color: var(--md-sys-color-on-surface);
}
.account-summary__action {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}
```

## Verification checklist and limits

Recommended checks: evaluate actual rendered foreground/background pairs in light/dark themes, at supported contrast settings, and for hovered, focused, pressed, selected, error, and disabled states. Check custom semantic colors and images separately. Use labels, icons, or text alongside color to convey meaning. Token names alone do not demonstrate compliance.

This pass did not execute MCU algorithms, validate gamut behavior, measure rendered contrast, or enumerate every newer dynamic-scheme variant. Exact expressive palette behavior and any chosen brand-color fidelity need implementation-specific tests. The source inventory intentionally does not flatten historical token tables into a timeless specification.
