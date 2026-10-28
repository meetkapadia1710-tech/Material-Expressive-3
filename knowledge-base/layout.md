# Layout and adaptive design

Research dates: **2026-10-27–28, Asia/Calcutta**. Published Material page data now covers the layout tabs, spacing system, and RTL guidance. Android adaptive-layout documentation provides implementation corroboration. Dimensions below use the units stated by their sources; dp is not a physical screen pixel count.

## Adapt to the available window

Use the space allocated to the application, not a device label such as phone or tablet. Window size can change during use through resizing, split screen, rotation, and folding. Width and height are separate classifications. Width is often the main decision input, but a short landscape window can invalidate a two-pane arrangement even when its width is sufficient. [Android window size classes](https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes)

| Dimension | Class | Verified range |
| --- | --- | --- |
| Width | Compact | `< 600 dp` |
| Width | Medium | `600 <= width < 840 dp` |
| Width | Expanded | `840 <= width < 1200 dp` |
| Width | Large | `1200 <= width < 1600 dp` |
| Width | Extra large | `>= 1600 dp` |
| Height | Compact | `< 480 dp` |
| Height | Medium | `480 <= height < 900 dp` |
| Height | Expanded | `>= 900 dp` |

These are the ranges in the inspected Android documentation; the Material breakpoints page corroborates the five width ranges. Compose's `currentWindowAdaptiveInfo()` exposes window information; the guide specifies `supportLargeAndXLargeWidth = true` to include large and extra-large widths. [Implementation and thresholds](https://developer.android.com/develop/adaptive-apps/guides/use-window-size-classes), [Material breakpoints](https://m3.material.io/foundations/layout/breakpoints/overview)

Material's current layout pages use **breakpoints**, with **window size classes** described as the earlier term. This terminology change does not mean Android APIs have the same names as the website. [Material canonical examples](https://m3.material.io/foundations/layout/canonical-examples/overview)

## Layout scaffold and canonical patterns

A scaffold organizes regions such as bars, rails, and panes. Material provides three common layout patterns. These are starting points that can be adapted to the product's content. [Material canonical examples](https://m3.material.io/foundations/layout/canonical-examples/overview)

| Pattern | Content relationship | Useful interpretation |
| --- | --- | --- |
| Feed | Many peer items in a grid or list | Change column count as available width changes |
| List-detail | A selectable collection and the selected item's details | Keep selection coherent when panes appear or disappear |
| Supporting pane | Primary work plus related auxiliary content | Maintain a clear priority between main content and supporting tools |

The Material source describes a supporting pane as commonly taking the smaller share of the window, with primary content around two-thirds. It also describes layering panes for focused tasks such as a shopping basket or comment response. These are patterns, not a universal requirement to divide every screen identically. [Material examples](https://m3.material.io/foundations/layout/canonical-examples/overview)

## Android implementation guidance

`ListDetailPaneScaffold` and `SupportingPaneScaffold` provide pane handling and navigation support. A list-detail layout can show both panes at expanded widths and a single pane at compact/medium widths. When the window narrows with a detail selected, preserve that selected detail; when it widens, restore the accompanying list and its selection. Hoist the relevant state instead of rebuilding it separately for each arrangement. [Android canonical layouts](https://developer.android.com/develop/ui/compose/layouts/adaptive/canonical-layouts)

For a feed, `LazyVerticalGrid` with adaptive columns chooses a column count from the available width and the product's minimum item width. The documentation's `180.dp` example is a sample, **not a mandatory Material card width**. Full-width headers can span the grid. Supporting panes must remain reachable when they do not fit beside the main content. [Android canonical implementation](https://developer.android.com/develop/ui/compose/layouts/adaptive/canonical-layouts)

## Verified breakpoint layout defaults

These are defaults from Material's individual breakpoint tabs, not constraints for every product or every component. [Compact](https://m3.material.io/foundations/layout/breakpoints/compact), [medium](https://m3.material.io/foundations/layout/breakpoints/medium), [expanded](https://m3.material.io/foundations/layout/breakpoints/expanded), [large and extra-large](https://m3.material.io/foundations/layout/breakpoints/large-extra-large)

| Breakpoint | Pane guidance | Outer margins / inter-pane space |
| --- | --- | --- |
| Compact | One pane | Leading/trailing margins 16 dp |
| Medium | Prefer one; two for low-density content, with equal widths | Margins and spacer 24 dp |
| Expanded | One or two; fixed-and-flexible pattern defaults its fixed pane to 360 dp | Margins and spacer 24 dp |
| Large / extra large | Often two; extra large may add a side sheet as a third pane | Margins and spacer 24 dp; fixed pane default 412 dp |

The large/extra-large tab separately notes a default maximum side-sheet width of 400 dp, so a third-pane sheet is not interchangeable with the fixed-pane default. Preserve the purpose of each measure. Navigation should stay reachable and adapt between bars and rails when the replacement preserves the function. [Large and extra-large](https://m3.material.io/foundations/layout/breakpoints/large-extra-large), [breakpoint decisions](https://m3.material.io/foundations/layout/breakpoints/overview)

## Grids, spacing, density, and RTL

The May 2026 grids update introduces global alignment rulers. Bar/safety rulers reserve system-UI space; title and content rulers align important content. Populate edge regions and then content panes, adjusting the grid to available space. Density should improve scanning without hiding essential information or undermining accessible target sizes. [Grids](https://m3.material.io/foundations/layout/grids-spacing/grids), [density](https://m3.material.io/foundations/layout/grids-spacing/density)

Material's spacing scale uses **`md.sys.measurement.space100 = 8 dp`**. Nested values such as 2, 4, 6, and 10 dp are allowed. Padding is internal, gaps separate siblings, and margins sit outside an element. Prefer padding and gaps inside components. The page identifies spacing tokens as available in Compose and still being connected to components, rather than universally implemented. [Spacing overview](https://m3.material.io/styles/spacing/overview), [tokens](https://m3.material.io/styles/spacing/tokens)

Adaptive or density-specific spacing belongs in the component's mapping to the scale. Preserve spacing by default when text grows to 200%; allow the container or layout to adapt. Custom spacing can follow the multiplier convention, for example `space225 = 18 dp`. [Applying spacing](https://m3.material.io/styles/spacing/applying-spacing)

Use leading/trailing geometry for RTL. Mirror directional navigation icons, pane layouts, and appropriate gestures, while retaining the correct direction for media controls and clockwise clocks. Alignment and text direction are separate concerns; test mixed text, URLs, numbers, punctuation, and cursor movement. The RTL page documents language-specific exceptions, so indiscriminate horizontal flipping is insufficient. [Bidirectionality](https://m3.material.io/foundations/layout/bidirectionality-rtl)

## Practical design procedure

This procedure is analyst synthesis from the sources, offered as implementation guidance:

1. Identify the task's primary content and the relationship of secondary content to it.
2. Choose a canonical pattern, then specify what happens at each relevant width and height transition.
3. Define which content remains visible, which navigation surface is available, and how hidden content is reached.
4. Specify selection, scroll, focus, and back-navigation behavior across transitions.
5. Test just below, at, and just above each chosen breakpoint, then resize continuously.
6. Include large text, long labels, keyboard operation, split screen, and folded configurations in the acceptance criteria.

Do not infer a universal grid-column count or component width from the breakpoint table. The defaults above have specific layout scopes. A viewport qualifying as expanded does not prove that the product's actual content fits two useful panes.

## Coverage limits

- Five width classes and three height classes were verified in current Android documentation.
- Material breakpoint, grid/spacing, scaffold, canonical-layout, RTL, and spacing-system page data was retrieved; selected relevant text was reviewed. Breakpoints overview was also rendered through REA ([snapshot](evidence/rendered/foundations__layout__breakpoints__overview.txt), `ev_3566d4ddd59da340a484784a34e0fde0dab16f3476c1f07d08b4108b9050cde3`, step `ready_2`). Diagrams were not visually audited.
- The older `/foundations/layout/understanding-layout/overview` and `/foundations/layout/canonical-layouts/overview` paths returned 404 through the web retrieval tool. The current indexed canonical page is `/foundations/layout/canonical-examples/overview`.
- Interactive spacing-token modules, all safe-area/inset configurations, fold postures, and navigation transitions were not exercised.
- No interactive resizing of a sample app was performed. Described behavior is official guidance, not an observed test result.

Source records: `TL-06` through `TL-09`, `TL-23` through `TL-25`, `TL-30`, in [sources-type-layout.json](evidence/sources-type-layout.json).
