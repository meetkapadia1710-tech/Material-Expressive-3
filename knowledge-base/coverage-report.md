# Coverage report

Completed 2026-10-28, Asia/Calcutta. The requested knowledge base is delivered with source-backed guides, a reproducible corpus, and an explicit boundary between published guidance and observed behavior.

## Measured coverage

| Evidence | Result | Boundary |
|---|---:|---|
| JSON documents mapped by the observed site bundle | **88 of 88 retrieved** | Two other route entries, Get Started and Search, have no mapped JSON file; Get Started was rendered, Search was not exercised |
| Visible sections in those documents | **259** | Machine extracted; individual figures and interactions were not all reviewed |
| Component families | **36** | Overview, Specs, Guidelines and Accessibility data retained; current purposes and selected behavior summarized |
| Unique referenced token-data endpoints | **41 of 41 retrieved** | Excludes the separate status-table data path |
| Token occurrences / distinct names | **8,897 / 6,418** | Includes dependencies, repetitions and deprecated/undefined declarations; not an active API count |
| Selected rendered observations | **27** | 22 content pages and five rendered not-found results |
| REA Evidence records | **6** | Deduplicated across saved bundles; method and per-record limitations retained |
| Topic citation records | **134** | Ledger-qualified IDs; methods include rendered text, public data, official docs and indexed official text |
| Sitemap page entries inventoried | **375** | Excludes image locations; not a claim that the whole sitemap was read |

The 88 documents comprise 27 foundation documents, 16 style documents, 38 component/index documents, five development documents, the homepage and the blog index. Four current articles were additionally rendered at working `/blog/` URLs. Their content is retained in REA snapshots rather than the 88-document corpus.

Within the sitemap, **259 entries** match an exact retrieved page or declared tab: 17 also have selected rendered evidence, and 242 have page data without a dedicated rendered capture. The remaining entries are **112 blog article bodies not collected** and **four root-level article URLs that rendered a not-found page**. The four working `/blog/` counterparts are outside those sitemap entries. This avoids counting a blog index as retrieval of every linked article.

Machine-readable results: [coverage statistics](evidence/coverage-statistics.json), [sitemap CSV](evidence/sitemap-coverage.csv), [sitemap JSON](evidence/sitemap-coverage.json), [page inventory](evidence/source-inventory.json), [rendered manifest](evidence/rendered-manifest.json).

## Requested-topic matrix

“Answered” below means published guidance has been researched and synthesized. Empirical validation of an application or every design example remains a separate question.

| Requested topic | Research outcome | Remaining limits |
|---|---|---|
| Foundations | Answered: system organization, inclusion, content, customization, interaction and research | Watches/XR and all editorial subrules are retained as source data, with limited authored synthesis |
| Design principles | Answered: named accessibility principles, Expressive research and practical interpretation | Vendor study results were not independently reproduced |
| Color systems | Answered: roles, pairing, palettes, static/dynamic sources, contrast and customization | No color algorithm run, all-role visual sweep, or measurement of an actual theme |
| Typography | Answered: 30 styles, baseline/emphasized roles, variable fonts, scripts and provenance differences | All font/script renderings and all 30 styles not visually tested |
| Layout | Answered: breakpoints, scaffolds, canonical patterns, spacing, density and RTL | No interactive resizing, fold-posture or inset testing on a real application |
| Components | Answered: 36-family catalog, current design choices, accessibility and replacements | Every geometry value, animation, state and library API not independently audited |
| Design tokens | Answered: naming/classes/contexts/workflows plus a context-preserving structural catalog | No chosen-theme resolver, runtime CSS export, alias evaluation or exhaustive UI filter interaction |
| Accessibility | Answered: standards distinctions, semantic/focus/input guidance and source defects | No screen-reader, keyboard, switch-access or compliance audit of the site or a generated app |
| Implementation guidance | Answered: official platform status, integration and migration boundaries | No package installation/build, device execution, browser matrix or complete cross-version API comparison |

## Access failures and recovered paths

| Target/method | Observed result | Disposition |
|---|---|---|
| Ordinary web extraction of many m3 pages | JavaScript-required shell | Recovered through REA rendering and public page-data retrieval; not an unresolved site-wide access failure |
| REA request-body capture for sitemap/homepage data | Some responses aborted or unfinished | Public HTTP GET recovered and saved the actual data; original partial Evidence remains labeled |
| `/foundations/accessible-design/overview` | Redirected to `/foundations/overview/principles` | Current destination captured; no claim that the old URL contains a separate current guide |
| `/foundations/layout/overview` | Rendered “This page cannot be found” | Current layout material retrieved under `/foundations/layout/layout-overview` and related pages |
| `/building-with-m3-expressive` | Rendered not-found | Working [article](https://m3.material.io/blog/building-with-m3-expressive) captured |
| `/m3-expressive-motion-theming` | Rendered not-found | Working [article](https://m3.material.io/blog/m3-expressive-motion-theming) captured |
| `/material-is-compose-first` | Rendered not-found | Working [article](https://m3.material.io/blog/material-is-compose-first) captured |
| `/whats-new-at-io26` | Rendered not-found | Working [article](https://m3.material.io/blog/whats-new-at-io26) captured |
| Earlier layout/token slugs tried through web retrieval | Some returned 404 or failed extraction | Current routes recorded in the relevant topic ledgers; do not reuse a failed guessed slug as a source |
| `https://material-web.dev/components/` via web retrieval | Could not be fetched in that research pass | Official Material Web repository/raw docs were accessible and used instead; no claim of global unavailability |

Rendered not-found means the captured application displayed that heading. It does not automatically establish an HTTP 404 response because the selected captures did not measure response status for each route.

## Material not individually accessed or tested

- **Status-table widgets:** 36 placements are inventoried; their separate backing status data was not extracted as a complete independent dataset. Platform status in the guide is corroborated by the rendered Develop page, retrieved platform pages and official repositories.
- **Media:** 3,363 media/link placements are inventoried, not 3,363 unique assets. Images, videos and prototypes were not downloaded and visually audited. Text extraction includes available authored alternatives and captions.
- **Hidden data:** nine invisible sections and 48 hidden blocks are excluded from readable extracts. Original JSON retains them; hidden content is not promoted to current visible guidance.
- **Figma and workflow execution:** the Design Kit, Theme Builder, token downloads and DSP workflow are documented from sources. Their plugin interactions, exports and every variant were not executed or validated. Their omission is not evidence that access is restricted.
- **Historical articles and archives:** the 112 uncollected sitemap blog bodies, M1/M2 archives and linked videos were not exhaustively researched. Four current articles relevant to Expressive and implementation were captured separately.
- **Specialized platforms:** watches/XR source pages are retained, but this knowledge base does not establish implementation parity across Wear, XR, native iOS and third-party libraries.
- **Personalized contexts:** dark mode, all contrast combinations, languages, reduced-motion alternatives, every token selector and every responsive viewport were not exhaustively rendered. The catalog records declared contexts without inventing a universal chosen value.

## Source inconsistencies preserved

| Finding | Treatment |
|---|---|
| Homepage promotes 14 Expressive component updates; Get Started says 15 | Preserve both observed statements; do not infer a common counting scope |
| Checkbox Accessibility keyboard table contains chip/removal instructions | Flag the mismatch; do not treat those rows as checkbox requirements |
| Some component label/contrast prose uses 3:1 | Keep text/non-text and WCAG criterion distinctions; do not apply it as a universal normal-text threshold |
| Typography values vary between explanatory docs, generated platform tokens and current site declarations | Identify source/version/unit; do not silently merge them into one scale |
| Symbols guide describes four axes but includes ROND in examples | Preserve the documentation discrepancy rather than asserting an exhaustive axis limit |
| Old component recommendations coexist with later Expressive replacements and platform APIs | Scope deprecation/replacement to the documented design or library; do not infer universal API removal |

These issues and their sources are detailed in the relevant guides. The token catalog also retains undefined values and deprecated records rather than resolving them by guesswork.

## Verification performed

The final local validation checks required deliverables, JSON readability, page/module SHA-256 against the acquisition manifests, source-ID uniqueness within ledgers and the combined register, local Markdown targets, extraction counts, and REA cleanup results. It also checks token identities and token/value/context-tree/set pointers against the retained source. Results are saved in [validation-report.json](evidence/validation-report.json).

These checks establish integrity and navigation of the local knowledge base. They do not certify Google's documentation, component libraries, an accessibility conformance level, or future URL availability.
