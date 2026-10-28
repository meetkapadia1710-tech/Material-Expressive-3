# Research method and provenance

Research period: 2026-10-27 through 2026-10-28, Asia/Calcutta. Original access dates and UTC retrieval timestamps are retained rather than rewritten to the final report date.

## Questions and evidence levels

The investigation asked what the system recommends for foundations, principles, color, typography, layout, components, tokens, accessibility and implementation; which recommendations are baseline or Expressive; which platforms actually document support; and what remains unverified.

| Level | Meaning | Does not establish |
|---|---|---|
| REA observed | DOM/accessibility text captured from a live browser after declared navigation and a visible heading | Visual correctness of every diagram, all tabs/states, screen-reader behavior or library correctness |
| Published data | Public JSON retrieved from a route/module referenced by the observed site bundle, with hashes | That hidden content is current public guidance, or that every module was rendered |
| Official external documentation | Primary Android, Flutter, W3C, Google Design and Material repository statements | Build success, version parity or unchanged future documentation |
| Indexed text | Search-indexed official content where direct extraction was limited | Freshness equivalent to the live site |
| Analyst synthesis | Practical workflow or interpretation derived from cited facts | An official mandatory rule or observed implementation behavior |
| Unknown / untested | Evidence absent, a method not exercised, or a conflict unresolved | That the feature is impossible or the source is inaccessible to everyone |

## Acquisition

1. Read the explicitly requested [REA skill](C:/Users/meetk/.agents/skills/reverse-engineer-anything/SKILL.md) and its browser runtime-observation guide. No native analysis target was opened.
2. Ordinary web text retrieval returned a JavaScript-required shell for the site. REA launched an owned headless Chrome instance and performed declared navigation/waits, successfully capturing DOM and accessibility text.
3. The homepage network observation exposed a public versioned content endpoint. The rendered HTML exposed the shipped bundle at `/static/angular/main.9fa6346ef63e2a6c.js`.
4. Retrieve the public sitemap, bundle and homepage JSON. Extract the route-map JSON as data without executing the bundle. Its 90 entries include 88 JSON mappings; Get Started is separately rendered and Search was not exercised.
5. Fetch all 88 mapped page JSON files with four bounded concurrent GET workers. Preserve raw bytes, endpoint, HTTP result, timestamp and SHA-256 in [page-data-manifest.json](evidence/page-data-manifest.json). No mapped request failed.
6. Extract readable text only from visible sections and non-hidden blocks. Retain table text, media alternative text, embedded links and module references. Keep raw source to recover formatting or omitted fields.
7. Inspect the shipped `ngOnInit` / `fetchDsdbDataJSON` URL construction and derive public token-data endpoints. Retrieve all 41 unique non-status endpoints referenced by the visible page data. All returned JSON successfully. [Module manifest](evidence/module-data-manifest.json)
8. Render representative detail pages and four current articles with REA. Record four broken root-level sitemap URLs and their working `/blog/` counterparts separately.
9. Synthesize topic guides in independent research passes, then review cross-topic claims and verify local links, inventory consistency and source-file hashes.

The site's observed content version is **`2026-10-13_06-10-19`**. The bundle also declares data-module version **`1789970763497130`**. These are artifact identifiers, not a claim that every page was edited on that date. Individual source update timestamps and module versions remain in their own records. The site bundle is evidence of publication machinery, not the source code of Material component libraries.

## REA ledger

| Evidence ID | What was observed | Limitations |
|---|---|---|
| `ev_0770a7e5418adf3699f932b8eac5d76547974734ad17d1f162473c3e5b4a56a8` | Homepage DOM, accessibility tree and network metadata | Event capture incomplete at cutoff; homepage DOM/tree captured |
| `ev_59d954f4e4ee8a997c7f8f794671d3fe485e45f7a9978b7df06d7262c502ac0e` | Get Started, section indexes, color/type/token overviews, accessibility redirect and a layout not-found page | Complete for requested capture sections; transient navigation snapshots also retained, use `ready_*` steps |
| `ev_aa66dba08400f793f85ce7c917d9d58aa3a0dc2122f76130eb217650a08ec3d6` | Declared public requests for robots, sitemap and homepage data | Some response-body capture attempts aborted or were unfinished; direct HTTP later recovered the sitemap and page data |
| `ev_3566d4ddd59da340a484784a34e0fde0dab16f3476c1f07d08b4108b9050cde3` | Color roles, type-scale tokens, breakpoints, accessible structure, button specs/accessibility, motion specs, token workflow | Complete for requested DOM/tree capture; dynamic token values not fully exposed in those snapshots |
| `ev_b7d66738c353d9373ebef32776fc8d3e48b03adb3f2174f3a6db9289370eb6e6` | Four root-level article paths from the sitemap | All rendered a not-found heading |
| `ev_a92eac9e99c81f8f4382af264a96628d0bb48c039f5ff3005d54faeb754e0b0f` | Working `/blog/` pages for Expressive introduction, motion theming, Compose-first and I/O 2026 | Documentation content observed; demonstrations and code not executed |

Canonical records are retained in `evidence/rea-*.json`. Later bundles can include earlier records, so the indexer deduplicates by Evidence ID. `evidence/rendered-manifest.json` points to selected ready-state extracts. Each record retains provider limitations and cleanup results. The REA launches used an owned temporary browser/profile and reported `terminated-owned-process` cleanup. No existing personal browser tab was taken over.

Capture settings were a 1280×720 viewport, en-US locale, light color scheme, reduced motion, and blocked service workers, using installed Chrome. This constrains what was observed. No screenshot-based visual audit, assistive-technology session, interactive component test, device run, dark-mode audit or mobile viewport sweep was performed.

## Source and inventory rules

Sitemap counts include only sitemap namespace `url/loc`, excluding embedded image locations. A parent JSON document counts for a sitemap route only when it matches the exact route or a declared tab label/alias. In particular, the blog index is not counted as retrieval of every blog article. The four currently linked articles were rendered outside the sitemap's working article paths and have separate evidence.

The 96 dynamic module placements contain 36 `STATUS_TABLE` references plus 60 other placements resolving to 41 unique retrieved endpoints. A module can be reused on several pages with different filters. Retrieved module data is not proof that every declared value/context is selected in a visible table. See [token-catalog.md](token-catalog.md).

Topic ledgers have local citation IDs. The combined [source index](sources.md) qualifies them by ledger (`foundations:`, `type-layout:`, `components:`) to avoid collisions. Public-page IDs `P001`–`P088` belong to a separate generated inventory. External `main`/`master` repository links remain moving references unless a retained source says otherwise.

## Reproduction and reuse

`tools/collect_site.py` and `tools/collect_modules.py` fetch the explicit saved version. `tools/build_indexes.py` regenerates offline extracts and inventories. `tools/index_tokens.py` generates the derived token catalog. `tools/validate_kb.py` checks the local result. Before researching a later release, reacquire the homepage/bundle, inspect its actual mappings and version, and create a new evidence snapshot rather than silently relabeling this one.

Get Started links licensing resources for Material's code and content; see its [captured text](evidence/rendered/get-started.txt) and the [official page](https://m3.material.io/get-started). Authored guides here paraphrase and link the sources. Raw captured data is retained as research evidence with original attribution and provenance; it is not a rebranding of Google's specification. External fonts, media, libraries and Figma resources retain their own applicable terms.
