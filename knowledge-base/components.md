# Components: inventory, decisions, and accessibility

Research completed 2026-10-28 (Asia/Calcutta). The [rendered component catalog](evidence/rendered/components.txt) verifies the inventory and purposes. The corresponding public JSON files in `evidence/page-data/components__*.json` supply the detailed Overview, Specs, Guidelines, and Accessibility tabs. These files were read as published data; component interactions were not exercised. [Source ledger](evidence/sources-components.json).

REA catalog evidence: `ev_59d954f4e4ee8a997c7f8f794671d3fe485e45f7a9978b7df06d7262c502ac0e`, step `ready_3`. The route map contains **36 component families**, plus the components and all-buttons index pages. Each family declares four tabs. A route or retrieved tab is not evidence that its API exists on every platform.

## Action components

The table summaries below are verified in the published page data unless explicitly marked otherwise. Follow each linked Accessibility tab for the complete platform-specific interaction details.

| Component | Purpose and current design choices | Accessibility guidance to preserve |
|---|---|---|
| [Buttons](https://m3.material.io/components/buttons/overview) | Default or toggle behavior; elevated, filled, tonal, outlined, or text color configurations; five suggested sizes and round/square shapes. | Match the accessible name to the visible action label; keyboard activation; accommodate enlarged text. [Accessibility](https://m3.material.io/components/buttons/accessibility) |
| [Button groups](https://m3.material.io/components/button-groups/overview) | Standard or connected groups; single or multiple selection, optionally requiring a selection. Connected groups replace segmented buttons in Expressive guidance. | Each button is interactive; the group container is not a focus stop. Preserve selected-state announcements and adequate targets. [Accessibility](https://m3.material.io/components/button-groups/accessibility) |
| [FAB](https://m3.material.io/components/floating-action-button/overview) | A persistent primary/common action; FAB, medium, and large sizes. The small and surface-color options are no longer recommended. | Use a clear action name. Guidance says to omit an unavailable FAB rather than disable it; avoid obscuring other focus indicators. [Accessibility](https://m3.material.io/components/floating-action-button/accessibility) |
| [Extended FAB](https://m3.material.io/components/extended-fab/overview) | Primary action with a visible label when an icon alone is insufficient; small, medium, large. | Icon and label form one focusable action. Prioritize access to the primary action in focus order. [Accessibility](https://m3.material.io/components/extended-fab/accessibility) |
| [FAB menu](https://m3.material.io/components/fab-menu/overview) | Opens from a FAB for 2–6 related actions; one menu size works with FAB sizes; not for extended FABs. Replaces speed-dial/stacked-small-FAB usage. | Focus initially stays on the close button replacing the FAB; keep it unobstructed, communicate expanded state, and label every action. [Accessibility](https://m3.material.io/components/fab-menu/accessibility) |
| [Icon buttons](https://m3.material.io/components/icon-buttons/overview) | Default or toggle actions using a recognizable system icon; expressive size, width, shape, and color options. | Name the action rather than the glyph. Provide web tooltips and distinguish selected/unselected appearance. [Accessibility](https://m3.material.io/components/icon-buttons/accessibility) |
| [Segmented buttons](https://m3.material.io/components/segmented-buttons/overview) | Baseline single/multiple choices among 2–5 options. Retained in the catalog, but no longer recommended after adopting Expressive. | Do not rely on color alone for selection; support entry into and movement within the group. [Accessibility](https://m3.material.io/components/segmented-buttons/accessibility) |
| [Split buttons](https://m3.material.io/components/split-button/overview) | A principal action beside a separate menu of related choices; five size options. | Both parts need adequate targets and separate focus. The menu button's name and expanded state must explain the additional choices. [Accessibility](https://m3.material.io/components/split-button/accessibility) |
| [Toolbars](https://m3.material.io/components/toolbars/overview) | Docked or floating sets of frequently used actions; standard or vibrant colors; may pair with a FAB. Guidance discourages showing one with a navigation bar simultaneously. | Interact with the controls inside, not the container. Web uses a toolbar role; preserve access when the toolbar collapses or content scrolls. [Accessibility](https://m3.material.io/components/toolbars/accessibility) |

## Navigation and search

| Component | Purpose and current design choices | Accessibility guidance to preserve |
|---|---|---|
| [App bars](https://m3.material.io/components/app-bars/overview) | Describe the current page and offer essential navigation/actions. Search, small, medium flexible, and large flexible variants. The earlier medium/large forms are no longer recommended. | Identify the current page, label icon actions, and retain access while scrolling. Initial focus is the leading interactive control. [Accessibility](https://m3.material.io/components/app-bars/accessibility) |
| [Navigation bar](https://m3.material.io/components/navigation-bar/overview) | 3–5 stable peer destinations for compact/medium windows. Expressive's flexible bar supports horizontal items in medium windows. | Make selected destinations clear; grow vertically for enlarged labels. The guidance requires full labels through 2× text size. [Accessibility](https://m3.material.io/components/navigation-bar/accessibility) |
| [Navigation rail](https://m3.material.io/components/navigation-rail/overview) | 3–7 destinations, optional FAB, medium through extra-large windows. Collapsed and expanded forms replace the baseline rail; expanded replaces the drawer. | Expanded targets span the item width. Preserve selection cues, enlarged labels, focus order, and menu/FAB access. [Accessibility](https://m3.material.io/components/navigation-rail/accessibility) |
| [Navigation drawer](https://m3.material.io/components/navigation-drawer/overview) | Standard/modal baseline navigation with grouped destinations. Expressive guidance now recommends the expanded rail. | Preserve destination names and selected state; a modal drawer must be dismissible. Retention in the catalog is not a recommendation for new Expressive designs. [Accessibility](https://m3.material.io/components/navigation-drawer/accessibility) |
| [Tabs](https://m3.material.io/components/tabs/overview) | Peer content categories, with primary/secondary variants; horizontal overflow is possible. | Support keyboard movement and access to off-screen tabs; avoid an infinitely looping set that traps linear navigation. [Accessibility](https://m3.material.io/components/tabs/accessibility) |
| [Search](https://m3.material.io/components/search/overview) | Query entry, suggestions, and results; a search app bar can provide the global entry point. Current guidance describes contained or divided presentation. | Announce new suggestions/results, label the input and actions, and permit clearing and navigating results. [Accessibility](https://m3.material.io/components/search/accessibility) |

## Containment and temporary surfaces

| Component | Purpose and current design choices | Accessibility guidance to preserve |
|---|---|---|
| [Cards](https://m3.material.io/components/cards/overview) | Related content about a subject; elevated, filled, outlined; dimensions follow contents. | Choose a directly actionable card or a non-actionable container with internal actions. Avoid placing actions on an already actionable surface; provide alternatives to drag/swipe. [Accessibility](https://m3.material.io/components/cards/accessibility) |
| [Carousel](https://m3.material.io/components/carousel/overview) | Browsable visual collections; multi-browse, uncontained, uncontained multi-aspect, hero, centered hero, full-screen. | On vertically scrolling pages provide access to all content without horizontal scrolling, typically a Show all route; full-screen carousels are an exception. [Accessibility](https://m3.material.io/components/carousel/accessibility) |
| [Lists](https://m3.material.io/components/lists/overview) | Scannable, consistently arranged items; current Expressive list adds segmented styling, selection treatment, and flexible slots. | Selection requires a cue beyond color. Provide alternatives to swipe actions and preserve keyboard access to individual actions. [Accessibility](https://m3.material.io/components/lists/accessibility) |
| [Bottom sheets](https://m3.material.io/components/bottom-sheets/overview) | Secondary content anchored below; standard/modal; guidance focuses on compact/medium windows. | Resizing must have a single-pointer alternative. A drag handle can act as a button that cycles the available heights. [Accessibility](https://m3.material.io/components/bottom-sheets/accessibility) |
| [Side sheets](https://m3.material.io/components/side-sheets/overview) | Optional secondary content/actions at the side; standard/modal, with internal navigation if needed. | Include a close affordance and keyboard access; the design guidance gives the sheet a dialog role. [Accessibility](https://m3.material.io/components/side-sheets/accessibility) |
| [Dialogs](https://m3.material.io/components/dialogs/overview) | A single important task or decision; basic/full-screen. Intended to interrupt, so use sparingly. | Provide entry, dismissal, access to all content, and correct focus handling. Apply each child control's rules too. [Accessibility](https://m3.material.io/components/dialogs/accessibility) |
| [Menus](https://m3.material.io/components/menus/overview) | Temporary related actions; current vertical menus add shape, color, selection, and submenu motion; baseline menu remains. | Focus first item on opening; support closing and item navigation. Do not nest independent switches/buttons inside a menu item. [Accessibility](https://m3.material.io/components/menus/accessibility) |
| [Divider](https://m3.material.io/components/divider/overview) | Low-emphasis grouping when whitespace is insufficient; horizontal/vertical. | Defined as decorative, with no contrast minimum in this component guidance. Do not make it an interactive focus target. [Accessibility](https://m3.material.io/components/divider/accessibility) |

## Selection and input

| Component | Purpose and current design choices | Accessibility guidance to preserve |
|---|---|---|
| [Checkbox](https://m3.material.io/components/checkbox/overview) | Multiple independent selections; parent control can represent an indeterminate set. | Associate the visible label; allow clicking it. Preserve mixed state. **The published keyboard table has a source defect; see below.** [Accessibility](https://m3.material.io/components/checkbox/accessibility) |
| [Radio button](https://m3.material.io/components/radio-button/overview) | One selection from a set. An explicit None/Not applicable choice can allow opting out. | Group and label choices; arrow navigation and appropriate entry to the selected item. Selecting a radio should deselect peers. [Accessibility](https://m3.material.io/components/radio-button/accessibility) |
| [Switch](https://m3.material.io/components/switch/overview) | An independent on/off setting with an immediately legible state. | Label what is controlled and expose state. Guidance discourages shrinking targets by default; density is a user choice. [Accessibility](https://m3.material.io/components/switch/accessibility) |
| [Chips](https://m3.material.io/components/chips/overview) | Assist, filter, input, and suggestion variants for contextual actions/options. | Match semantics to behavior. Give an overflowing set a way to reveal all choices without requiring horizontal scrolling. [Accessibility](https://m3.material.io/components/chips/accessibility) |
| [Sliders](https://m3.material.io/components/sliders/overview) | Values or a range along a track; Expressive adds size/orientation and shape options. | Focus the handle, expose current value, and support keyboard adjustment and endpoints. Track ends must be visually discoverable. [Accessibility](https://m3.material.io/components/sliders/accessibility) |
| [Text fields](https://m3.material.io/components/text-fields/overview) | Filled/outlined text entry with visible state and actionable error messages. | Associate label, supporting text, and error; label interactive trailing icons according to their current function. [Accessibility](https://m3.material.io/components/text-fields/accessibility) |
| [Date pickers](https://m3.material.io/components/date-pickers/overview) | Docked, modal, and modal input; date or range selection. | Allow direct text entry. Do not insert formatting punctuation as someone types; format on commit/blur, following the guidance. [Accessibility](https://m3.material.io/components/date-pickers/accessibility) |
| [Time pickers](https://m3.material.io/components/time-pickers/overview) | Modal dial or input selection; hours/minutes and applicable time formats. | Offer manual input rather than relying on the dial; preserve format labels and accessible targets. [Accessibility](https://m3.material.io/components/time-pickers/accessibility) |

## Communication and progress

| Component | Purpose and current design choices | Accessibility guidance to preserve |
|---|---|---|
| [Badges](https://m3.material.io/components/badges/overview) | Small/large status or counts associated with an icon or destination. | Include the status/count in the destination announcement; an unlabeled colored dot is insufficient. [Accessibility](https://m3.material.io/components/badges/accessibility) |
| [Loading indicator](https://m3.material.io/components/loading-indicator/overview) | A short ongoing process, including pull-to-refresh. Replaces most indeterminate circular indicators; not for a process transitioning to determinate progress. | Name the process and provide a non-gesture refresh action. The page uses a progress-bar accessibility role. [Accessibility](https://m3.material.io/components/loading-indicator/accessibility) |
| [Progress indicators](https://m3.material.io/components/progress-indicators/overview) | Linear/circular process status; expressive wave and thickness options. | Describe the process and progress; preserve adequate active-indicator contrast and visible track endpoints. [Accessibility](https://m3.material.io/components/progress-indicators/accessibility) |
| [Snackbar](https://m3.material.io/components/snackbar/overview) | A brief non-blocking process update; temporary or persistent. | Actionable snackbars should not auto-dismiss. Announce without moving/trapping focus; web auto-dismissed messages also need inline feedback. [Accessibility](https://m3.material.io/components/snackbar/accessibility) |
| [Tooltips](https://m3.material.io/components/tooltips/overview) | Plain descriptions or richer explanatory content, optionally containing actions. | Make information available on focus as appropriate; avoid obscuring essential content or trapping focus. [Accessibility](https://m3.material.io/components/tooltips/accessibility) |

## Important revision boundaries

These are **design recommendations in the retrieved page data**, not proof of API deletion:

| Earlier pattern | Current documented direction |
|---|---|
| Segmented buttons | Connected button groups. |
| Navigation drawer | Expanded navigation rail. |
| Baseline navigation rail | Collapsed/expanded expressive rail. |
| Baseline navigation bar | Flexible navigation bar. |
| Bottom app bar | Docked toolbar; bottom app bar remains available but is not recommended. |
| Small or surface-color FAB | Current FAB/medium/large and accent/container color configurations. |
| Speed dial or stacked small FABs | FAB menu. |
| Baseline extended FAB | Small extended FAB, with medium/large options. |
| Most indeterminate circular progress uses | Loading indicator when its short-duration use case fits. |

The page data records more than the initial May 2025 Expressive launch: carousel gained uncontained multi-aspect layout in November 2025; vertical menus were introduced in November 2025; Expressive lists were added in December 2025. Consequently, the homepage's count of launch updates is not a complete inventory of the present system. The table above is intentionally organized by current component family.

## How to use the Specs and Guidelines tabs

For implementation, choose the component variant, intended behavior, theme/context, and platform first. Then consult its Specs tab for anatomy and tokens and Guidelines for composition, placement, and behavior. The retained JSON contains the authored spec tables and image references; this document does not invent a universal pixel-size table or convert Android `dp` into CSS pixels. Some details exist only in diagrams, which have not all been visually audited.

Examples of verified measurements with narrow scope: button-group and split-button pages require 48×48 dp targets even when visible extra-small/small controls are shorter; the extended-FAB overview lists 56/80/96 dp for its small/medium/large variants. These are component-specific published values, not screen-density conversion rules. For web-target guidance and WCAG distinctions see [accessibility.md](accessibility.md).

## Source defects and limits

- **Checkbox keyboard-table mismatch:** its Accessibility tab contains rows about chips, arrowing between chips, and deleting an input chip. The checkbox overview/label/mixed-state prose is usable, but this table is not treated as authoritative checkbox keyboard behavior. Verify the platform control's documentation and standards instead. Retained source: `components__checkbox.json`, Accessibility section.
- **Contrast wording:** some button/chip passages state 3:1 for labels or component contrast. This research preserves that as published wording, not a blanket replacement for WCAG's normal-text contrast requirements. Apply the relevant text/non-text criteria and contextual exceptions, as discussed in [accessibility.md](accessibility.md).
- **Platform availability:** the Search overview names Compose for its newer style; Lists names Compose and Views. This does not prove parity of every capability or future maintenance. [Implementation guidance](implementation.md) records the platform status separately.
- **No interaction audit:** page-data retrieval and REA catalog capture establish published guidance, not keyboard correctness, screen-reader output, or behavior of shipped library components.
- **Media limits:** images, videos, interactive prototypes, Figma component variants, and every spec token/value were not individually verified. The page-data manifest and the central coverage report describe the retained evidence and remaining work.
