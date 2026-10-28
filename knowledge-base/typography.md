# Typography

Research dates: **2026-10-27–28, Asia/Calcutta**. Evidence types: REA-rendered Material overview, published Material page data, directly readable Android documentation, and current upstream AndroidX declarations. All five typography tabs were retrieved as published JSON on October 28; the overview was also rendered through REA. Data retrieval does not establish that every interactive token module was inspected.

## Roles and hierarchy

Material assigns typography by purpose. Each role has large, medium, and small variants. Display serves brief, prominent content; headline marks high-emphasis passages; title supports shorter, secondary headings; body carries sustained reading; label serves controls and compact annotations. Expressive fonts can suit prominent headings, but body text needs fonts that remain readable at small sizes. Web spacing uses line boxes and padding; Android specifications can position text relative to baselines. Material also recommends tabular numerals for changing values such as clocks. [M3 applying type](https://m3.material.io/styles/typography/applying-type)

The rendered overview confirms **30 styles: 15 baseline and 15 emphasized**. Its May 2025 update introduces the emphasized set. It describes variable fonts for editorial expression, while explicitly saying Roboto Flex is not yet part of the M3 type scale. Its availability table marks web typography available but web Expressive typography unavailable. These are the website's observed statements, not independently tested library capabilities. [M3 typography overview](https://m3.material.io/styles/typography/overview)

An **August 2026 update** adds language script-height support. The published type-scale tab groups scripts as small, medium, large, and extra large. It recommends medium as the default and adjusting for detected language; fixed-height components may not adapt automatically. Therefore, baseline dimensions below are not fixed geometry for every language. The tab gives Burmese and Telugu as large-height examples, and Nastaliq as extra large. Token-module context switching was not exercised. [Type scale and tokens](https://m3.material.io/styles/typography/type-scale-tokens), [published data](evidence/page-data/styles__typography.json), [REA overview](evidence/rendered/styles__typography__overview.txt).

## Fonts, fallback, and emphasis

The Fonts tab recommends the fallback sequence **Roboto Flex → Roboto → Noto Sans** when using Roboto Flex. Fallback must be confirmed in the product implementation. The type-scale tab distinguishes a brand face for larger styles from a plain face for reading and compact UI; Roboto is the default for both. [Fonts](https://m3.material.io/styles/typography/fonts), [type-scale guidance](https://m3.material.io/styles/typography/type-scale-tokens)

Emphasized styles communicate selected, unread, or important content. The page says components do not use them by default: swap a baseline style token for its emphasized counterpart, such as `md.sys.typescale.display-large` → `md.sys.typescale.emphasized.display-large`. This is the design-token naming scheme; a platform API may expose different identifiers. [Type scale and tokens](https://m3.material.io/styles/typography/type-scale-tokens)

Editorial treatments belong to occasional expressive moments, such as celebrating content or showing a user's voice. Keep similar moments consistent and match their tone to the task; do not apply decorative treatments indiscriminately to routine labels. [Editorial treatments](https://m3.material.io/styles/typography/editorial-treatments)

## Verified baseline dimensions

The following font-size/line-height pairs are documented in the Android M3 overview. They are **Android scale values in sp**, not physical pixels and not a universal CSS conversion table. [Material 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3)

| Role | Large | Medium | Small |
| --- | --- | --- | --- |
| Display | 57 / 64 | 45 / 52 | 36 / 44 |
| Headline | 32 / 40 | 28 / 36 | 24 / 32 |
| Title | 22 / 28 | 16 / 24 | 14 / 20 |
| Body | 16 / 24 | 14 / 20 | 12 / 16 |
| Label | 14 / 20 | 12 / 16 | 11 / 16 |

Compose exposes these through `Typography` and `MaterialTheme.typography`. Customize individual `TextStyle` entries; the guide says M3 has no constructor-wide `defaultFontFamily`. A product may use a smaller subset of roles. [Compose typography implementation](https://developer.android.com/develop/ui/compose/designsystems/material3#typography)

## Emphasized styles and source-version caution

The inspected `androidx-main` source, marked token version `v0_103`, declares fifteen baseline and fifteen emphasized entries. Emphasized sizes and line heights match their baseline counterparts. Display, headline, body, and title-large emphasized weights reference `WeightMedium`; title-medium/title-small and labels reference `WeightBold`. Some tracking changes too. This is an **observed source declaration**, not proof that every released library uses these values. [AndroidX TypeScaleTokens.kt](https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/TypeScaleTokens.kt)

There is a material discrepancy worth preserving: the Android overview describes title-large as Roboto Medium, while the inspected source assigns baseline `TitleLargeWeight` to `WeightRegular`. Source tracking examples include display-large `-0.2.sp`, body-large `0.5.sp`, and title-medium `0.2.sp`. The emphasized block also carries an upstream TODO about generated tokens. Do not silently reconcile these into one supposedly timeless specification. Pin the actual dependency and inspect its tokens before implementing exact metrics. [AndroidX declarations](https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/TypeScaleTokens.kt), [Android overview](https://developer.android.com/develop/ui/compose/designsystems/material3#typography)

## Readability and accessibility

Material's typography guidance identifies text contrast targets of 3:1 for large text and 4.5:1 for small text. It normally uses `onSurface`, with `onSurfaceVariant` as an alternative. Links on a surface use primary or tertiary and are underlined. [Applying type](https://m3.material.io/styles/typography/applying-type)

For web testing, use the WCAG definition of large-scale text, rather than interpreting the Material role name `display` or `headline` as an automatic exemption: WCAG's large text threshold is 18pt, or 14pt bold, with exceptions for incidental text and logotypes. [W3C contrast explanation](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

## Implementation decisions to record

The following is a research-derived project checklist, not an additional Material specification:

1. Map every product text use to a semantic role before choosing a size.
2. Record family, weight, size, line height, tracking, locale fallback, and whether the style is baseline or emphasized.
3. Keep design-tool, Android, and web units explicit. Test the actual font's metrics rather than assuming a substituted font occupies identical space.
4. Test long translations, wrapping, user font scaling, missing fonts, and changing numerals in the smallest relevant containers.
5. Record the package version or commit that supplied exact implementation values.

## Coverage limits

- Numeric font size/line-height values and the emphasized declarations were verified; a rendered comparison of all thirty styles was not performed.
- All five visible tabs were retrieved as published data. Type scale & tokens was also rendered through REA on October 28 ([snapshot](evidence/rendered/styles__typography__type-scale-tokens.txt), `ev_3566d4ddd59da340a484784a34e0fde0dab16f3476c1f07d08b4108b9050cde3`, step `ready_1`). Interactive token controls and all thirty rendered styles were not tested.
- Downloadable Figma typography assets, installed font glyph coverage, and every language-specific rendering outcome were not inspected.
- Source links to `androidx-main` are moving references; no claim is made that they identify a stable release.

Source records: `TL-01` through `TL-05`, `TL-14`, `TL-27`, `TL-28`, `TL-31`, in [sources-type-layout.json](evidence/sources-type-layout.json).
