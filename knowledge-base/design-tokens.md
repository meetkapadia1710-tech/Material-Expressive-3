# Design tokens

Research started: 2026-10-27; evidence audit: 2026-10-28 (Asia/Calcutta). Source IDs resolve in [source ledger](evidence/sources-foundations.json). The Material token overview was directly rendered by REA; platform-source examples below are separately identified.

## Model and levels

A token pairs a reusable name with a value or alias. Material defines reference (`md.ref.*`), system (`md.sys.*`), and component (`md.comp.*`) classes: available choices, semantic roles, and component-specific decisions respectively. [T05 — Material token overview](https://m3.material.io/foundations/design-tokens/overview)

The corresponding Material Web public examples are:

| Level | Meaning | Verified web example |
|---|---|---|
| Reference | Concrete value such as a font family | `--md-ref-typeface-brand` |
| System | A design-system role | `--md-sys-color-primary` |
| Component | An attribute of a specific component | `--md-filled-button-container-color` |

Component tokens can refer to system tokens **or concrete values**. The latter matters: “every component token must always alias a system token” is stronger than the verified implementation contract. Web component token names omit a `comp` prefix. CSS selectors can scope overrides. [T01 — Material Web theming](https://github.com/material-components/material-web/blob/main/docs/theming/README.md)

Material recommends aliases where possible and permits reference-to-reference aliases. Its overview labels component tokens “in development”; released platform APIs must be checked separately. [T05 — Material token overview](https://m3.material.io/foundations/design-tokens/overview)

## Contexts and reading specification tables

A stable semantic name can resolve differently for theme, form factor, density, or writing direction. Reference choices remain context-independent; system assignments select among them. [T05 — Material token overview](https://m3.material.io/foundations/design-tokens/overview)

Specification tables group tokens by **state**, then **element**. Columns identify the styled attribute, token, optional description, and contextual value. [T05 — Material token overview](https://m3.material.io/foundations/design-tokens/overview)

Analyst recommendation: transfer this context with the value so an enabled-state color is not accidentally applied to a different state.

## Verified mapping chain

The official generated filled-button token file maps the container to system `primary`, label color to `on-primary`, label typography to `label-large`, and shape to `corner-full`. The same file has literal attributes such as a 40px container height and disabled opacities. These are **v0.192 web implementation examples**, not the latest Expressive size specification. [T02 — generated filled-button tokens](https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-comp-filled-button.scss)

```text
filled-button container color
    → system primary role
    → palette reference selected by light/dark scheme
    → concrete resolved color
```

The arrows summarize observed mappings. A runtime-resolved value was not measured. See [Color](color.md) for a bounded light/dark reference example.

## Categories and practical use

| Category | What it expresses | What to retain when transferring it |
|---|---|---|
| Color | Semantic use and paired foregrounds | Role names, theme/contrast context, source generation inputs |
| Typography | Role and individual text properties | Family, weight, size, line height, tracking, supported font axes |
| Shape | Corner or shape decisions | Units, asymmetric/logical corners, component support |
| Elevation | Visual hierarchy | Tonal/surface treatment and shadow behavior separately |
| State | Interaction feedback | State layer, opacity, focus behavior, disabled appearance |
| Motion | Timing or spring behavior | Platform/API, scheme, reduced-motion policy |

This is an analyst-created handoff checklist, not a claim that one published token export contains every category. The filled-button wrapper explicitly lists supported and unsupported properties, and imports color, elevation, shape, state, and type systems. It does not support every generated property: for example, its unsupported list includes `focus-state-layer-color`, `focus-state-layer-opacity`, `label-text-tracking`, and `label-text-type`. [T03 — web filled-button token wrapper](https://github.com/material-components/material-web/blob/main/tokens/_md-comp-filled-button.scss)

## Names are implementation-specific

Material Web's color wrapper generates `--md-sys-color-*` custom properties with fallback values. It includes fixed-color roles, surface-container roles, and some older names. This shows why a role inventory should identify its source and version rather than assume every platform has an identical schema. [T04 — web system color wrapper](https://github.com/material-components/material-web/blob/main/tokens/_md-sys-color.scss)

Material Web's theming documentation states that `--md-ref-palette` and `--md-sys-motion` tokens are not currently supported there. Do not interpret internal Sass palette files as evidence that the similarly named public CSS customization API is supported. [T01 — Material Web theming](https://github.com/material-components/material-web/blob/main/docs/theming/README.md)

Compose exposes design systems through `MaterialTheme` and typed objects rather than the web custom-property names. A migration needs a semantic mapping, not a mechanical renaming pass. The first statement is documented; the second is an analyst recommendation. [F03 — Material 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3)

## Suggested local token record

The following **is an original record format for this knowledge base**, not an official Material or DTCG schema:

```json
{
  "role": "filled-button.container-color",
  "platform": "material-web",
  "publicName": "--md-filled-button-container-color",
  "systemAlias": "--md-sys-color-primary",
  "source": "https://github.com/material-components/material-web/blob/main/tokens/versions/v0_192/_md-comp-filled-button.scss",
  "sourceVersionLabel": "v0.192",
  "observedAt": "2026-10-27",
  "status": "observed-source-mapping",
  "runtimeVerified": false
}
```

For an actual project, add a pinned package/commit, value type and unit, theme context, deprecation status, owner, and override rationale. Keep design-source aliases, platform APIs, and resolved runtime values as separate fields. Validate missing aliases, unsupported overrides, and units during export. These are recommended engineering controls, not verified Material requirements.

## Documented design-to-code workflow

The rendered **How to use tokens** tab describes downloading the baseline theme as a Design System Package, generating styles with the Material Theme Builder Figma plugin, applying those styles in mockups, swapping baseline styles in selected kit components, and exporting platform theme files. It distinguishes changing colors through Theme Builder from editing styles directly. [T06 — How to use tokens](https://m3.material.io/foundations/design-tokens/how-to-use-tokens)

This is verification of published workflow text. The Figma plugin was not opened, its current controls were not inspected, and no DSP or theme export was generated. Treat menu wording as dated documentation; validate the export format and supported token categories in the tool version actually used.

## Coverage limits

- Ordinary web extraction returned JavaScript-required shells, but REA subsequently rendered the complete token overview. The how-to-use tab was verified in public page data and a fresh REA rendered capture on 2026-10-28. Its documented workflow was not exercised in Figma.
- A guessed `how-to-read-tokens` route returned 404; another guessed `reading-tokens` route was inaccessible through the tool. Neither result proves the topic is absent from the live site.
- This file is not a complete export of all Material token names and values.
- No Figma variables were imported, no library was installed, and no token-generating tool was executed in this topic pass.
- Repository URLs use mutable branches. The internal generated design-system version is recorded where visible; exact repository commit identity remains unpinned.
