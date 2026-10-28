# Published token catalog

Indexed 2026-10-28 (Asia/Calcutta) from the retained public modules used by the Material 3 site. This is a structural index of published source data. It does not choose a theme, resolve aliases, or test a generated application.

## Files and scope

- [Token catalog JSON](evidence/token-catalog.json): module provenance, context dictionaries, name index, every token occurrence, declared-value pointers, reference names, and contextual-tree counts.
- [Token catalog CSV](evidence/token-catalog.csv): one row per token occurrence, suitable for filtering by name, type, set, module, or context. A repeated name can have multiple rows.
- [Source module manifest](evidence/module-data-manifest.json): exact public URLs, source hashes, retrieval timestamps, and the documentation pages that reference each module.
- [Indexer](tools/index_tokens.py): local-only reproducible extraction. It checks source hashes and copies an explicit allowlist of fields, excluding author and account metadata.

All 41 retrieved modules identify design system `designSystems/20543ce18892f7d9`, revision `7989`, and DSDB version `38.2.9`. These are fields in published data, not a platform-library version or a guarantee that every documentation control displays every record. The module URLs use publication path `2026-10-13_06-10-19`; the actual retrieval timestamps are in the manifest.

## Inventory

| Measure | Count | Interpretation |
|---|---:|---|
| Retrieved modules indexed | 41 | All entries in the module manifest |
| Token occurrences | 8,897 | Declarations counted separately in each module |
| Distinct token names | 6,418 | Exact strings; no renamed-token equivalence inferred |
| Names with repeated occurrences | 520 | Common dependencies recur in component modules |
| Distinct token-set names | 181 | Includes reference, system, component, and unspecified classifications |
| Declared value records | 13,950 | Context-dependent records; not 13,950 universally applicable values |
| Direct alias records | 6,748 | A value's `tokenName` directly names another token |
| Records with any references | 7,033 | Includes direct aliases and composite reference fields |
| Literal-only records | 5,336 | Non-reference payloads, excluding explicitly undefined records |
| Explicitly undefined records | 1,581 | Preserved as undefined, never treated as zero or a fallback |
| Published contextual-tree records | 128,474 | Precomputed source records, counted without reevaluation |
| Contextual records explicitly undefined | 15,854 | Not a claim that the corresponding token is always undefined |

Reference-bearing, literal-only, and explicitly undefined declared records form the 13,950-record partition in this snapshot. Direct aliases are a subset of reference-bearing records. Counts include repetitions across module payloads.

## Types and sets

The data declares 18 token value types. The largest occurrence groups are color (4,179), length (1,017), font-axis values (665), opacity (661), elevation (436), and shape (389). Typography is represented both by composite `TYPOGRAPHY` records and separate font name, weight, size, tracking, and line-height types. Motion includes numeric, duration, cubic Bézier, path, and composite types. See the JSON summary for every type count.

Examples of sets include `md.ref.palette`, `md.ref.typeface`, `md.sys.color`, `md.sys.typescale`, `md.sys.typescale.emphasized`, `md.sys.typescale.variable`, `md.sys.motion`, `md.sys.shape`, and numerous `md.comp.*` sets. Set names can encode variant and size. The index retains older and newer naming forms and deprecation flags rather than collapsing them.

Some modules include dependency tokens without declaring those tokens' sets locally. For 2,274 occurrences, the index finds the set in another retrieved module using the **same resource identity and system revision**, requiring the name/type/class/state metadata to agree. `token_set_source_module` and `token_set_pointer` identify that evidence. The other 6,623 occurrences resolve their sets within their own module. No set joins were missing or ambiguous in this snapshot. A cross-module join identifies metadata only; it does not resolve a token's runtime value.

## Declared contexts

The modules declare the following context groups and tag strings. These are an inventory of available metadata, not an assertion that every token supports every combination.

| Group | Declared tags |
|---|---|
| `theme` | `light`, `dark` |
| `contrast` | `default`, `medium.contrast`, `high.contrast` |
| `platform` | `android`, `compose`, `ios`, `web` |
| `audience` | `1p.baseline`, `3p` |
| `font` | `static`, `variable`, `ios.bold` |
| `motion.scheme` | `standard`, `expressive` |
| `language.height` | `small`, `medium`, `large`, `extra.large` |
| `ios.weight.setting` | `default`, `bold` |
| `ios.dark.theme.elevation` | `none`, `elevated` |

Module dictionaries retain default-tag flags, declared specificity metadata, and JSON pointers. Per-token declarations list the tags actually attached to their value records. `resolved_context_tags` separately summarizes tags in the published contextual trees. The index does not compute precedence, defaults, Cartesian combinations, inheritance, or a selected UI context. A missing context tag is not converted into an invented default.

## Following a token to its evidence

1. Find the exact name in CSV or the JSON `name_index`.
2. Select an occurrence and inspect its module, type, set, state, deprecation flag, and declared contexts.
3. Use `token_pointer` in that module's source JSON to inspect the token declaration.
4. Follow each `value_declarations[].pointer` for the actual alias, literal payload, unit, context tags, and specificity metadata.
5. Inspect `contextual_tree_pointer` separately if the published `referenceTree` and `resolvedValue` are relevant. A source-provided resolved value is not a value calculated or validated by this investigation.

For example, `md.sys.color.primary` occurs in 32 modules. In [the color module](evidence/module-data/COLOR.20543ce18892f7d9.json), its declaration is `/system/tokens/56`: it has ten declared value records, including six direct aliases and four explicit undefined records, plus 46 contextual-tree records. Selecting an arbitrary one would lose its context. The module's public origin is [Material's published color data](https://m3.material.io/_dsm/data/dsdb-m3/2026-10-13_06-10-19/COLOR.20543ce18892f7d9.json).

Similarly, `md.sys.motion.spring.fast.spatial.damping` appears in [the generic style module](evidence/module-data/TOKEN_TYPE_UNSPECIFIED.20543ce18892f7d9.json) at `/system/tokens/14`; its declared contexts include motion scheme and iOS. `md.sys.typescale.body-large.size` appears in [the typography module](evidence/module-data/TYPOGRAPHY.20543ce18892f7d9.json) at `/system/tokens/767`. Follow their value pointers for exact payloads; this guide intentionally does not turn them into universal CSS or platform constants.

JSON pointers escape `/` as `~1` and `~` as `~0`. Long contextual-tree pointer keys are literal resource identities. Do not split those escaped keys as additional hierarchy.

## Limits and reproduction

The index preserves published declarations, including inactive, deprecated, and undefined entries. A token's presence does not establish its use by a rendered component, API availability in a platform package, or accessibility of its resolved appearance. Numbers and units are not converted. Omitted numeric fields are not assumed to mean zero. No font, spring, contrast, or color algorithm was executed.

Raw module metadata, source-provided resolved trees, and UI filtering are separate evidence scopes. The source manifest establishes which endpoints were retrieved; the central coverage report establishes what was actually rendered. See [design-token guidance](design-tokens.md), [color guidance](color.md), and [typography guidance](typography.md) for interpretation.

To regenerate from the saved snapshot, run `python knowledge-base/tools/index_tokens.py` from the workspace root. This reads local inputs only and overwrites the two derived catalog files. It fails if a module's bytes no longer match its manifest hash.
