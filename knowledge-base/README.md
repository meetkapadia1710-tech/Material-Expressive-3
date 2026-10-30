# Material 3 Expressive Knowledge Base

> [!NOTE]
> **Independent Community Research:** This repository is an independent, evidence-backed reference and engineering toolset. It is not affiliated with, sponsored by, or endorsed by Google LLC. Material Design, Android, and Flutter are trademarks of Google LLC.

An evidence-backed reference for [Material Design 3](https://m3.material.io/), researched on **27–28 October 2026, Asia/Calcutta** using the REA reverse-engineering workflow, live browser captures, the site's public published data, and official implementation documentation.

Start with the topic guides below. They are authored syntheses with source links, scope distinctions, and unresolved questions. The evidence directory holds the underlying snapshots and machine-readable inventories. This is a dated research snapshot, not a guarantee about later releases.

## Use with AI Agents & LLMs

This repository is optimized for consumption by AI coding assistants (Gemini, Claude, Cursor, Copilot, Antigravity):
- [llms.txt](llms.txt) provides a compact, structured index of the core guidelines, platform support realities, and design rules.
- Run `python tools/search.py "<query>"` for local zero-dependency semantic keyword search across all guides and extracted text.
- Run `python tools/validate_kb.py` to verify token pointers and evidence integrity.

## Topic guides

| Guide | Coverage |
|---|---|
| [Foundations and principles](foundations.md) | Material 3 and Expressive, inclusive design, research, content, customization, and design decisions |
| [Color](color.md) | Semantic roles, tonal palettes, dynamic/static schemes, contrast contexts, harmonization and customization |
| [Typography](typography.md) | Baseline and emphasized styles, token provenance, variable fonts, scripts and scaling |
| [Layout](layout.md) | Breakpoints, scaffolds, panes, canonical patterns, spacing, density and RTL |
| [Components](components.md) | 36 families, variant choices, accessibility, and current replacement recommendations |
| [Design tokens](design-tokens.md) | Reference/system/component classes, contexts, naming and design-to-code workflows |
| [Token catalog](token-catalog.md) | Searchable inventory derived from retrieved token modules, with source pointers and context limits |
| [Accessibility](accessibility.md) | Semantics, contrast, target sizes, focus, keyboard input, resizing and test guidance |
| [Motion, shape and icons](motion-shape-icons.md) | Springs, schemes, shape scale/morphing and Material Symbols |
| [Interaction, elevation and content](interaction-elevation-content.md) | State layers, selection, input methods, elevation and meaningful content |
| [Implementation](implementation.md) | Compose, Views, Flutter, web and iOS status; theming, migration and handoff |

## Evidence and coverage

- [Coverage report](coverage-report.md): what was retrieved, reviewed, rendered, unavailable, and left untested.
- [Research method](research-method.md): REA Evidence IDs, source hierarchy, capture conditions, reproducibility and limits.
- [Source index](sources.md): ledger-qualified citations and links to the evidence inventories.
- [Published-page inventory (CSV)](evidence/source-inventory.csv) and [JSON](evidence/source-inventory.json): 88 documents containing 259 visible sections, each with source URL, retrieval time and SHA-256.
- [Sitemap coverage (CSV)](evidence/sitemap-coverage.csv) and [JSON](evidence/sitemap-coverage.json): per-URL status for the 375 entries in the retrieved sitemap.
- [Rendered snapshots](evidence/rendered-manifest.json): 27 selected page observations, including five not-found results.
- [Token-module manifest](evidence/module-data-manifest.json): 41 unique public token-data endpoints, all successfully retrieved.

**Read the evidence level literally.** A retrieved JSON document verifies published content, not that every visual example or interactive state works. A rendered page verifies that captured page state, not the correctness of an app using the components. The guides label recommendations and inferences separately.

## Practical findings

M3 Expressive expands Material 3, and current guidance extends beyond the initial launch. Design recommendations and platform support have different timelines. The platform pages explicitly describe Compose as the preferred Android path, Views and Material Web as maintenance libraries, and no official Expressive implementation in Flutter or Material Web in this snapshot. See [implementation](implementation.md) for dated primary sources and qualifications.

The research also preserves source inconsistencies: homepage/Get Started update counts differ; a checkbox keyboard table refers to chips; and some component contrast prose should not be applied as a universal text-contrast threshold. See [components](components.md) and [accessibility](accessibility.md).

## Search and maintain locally

From this directory, run:

```powershell
python tools/search.py "focus indicator"
python tools/search.py "dynamic color" --limit 10
python tools/validate_kb.py
```

`evidence/page-text/` contains UTF-8 text extracted from visible published sections; `evidence/page-data/` preserves the original JSON. Extracts include source links and hashes. They are source evidence, not additional authored guides. Hidden sections and blocks are excluded from the readable extraction but retained in original JSON.

The collectors are version-bound. Read [research-method.md](research-method.md) before refreshing them: rerunning against an old version does not discover the latest release automatically. No external dependencies are needed for the Python scripts; retrieval requires network access.
