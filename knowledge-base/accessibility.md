# Accessibility

Research dates: **2026-10-27–28, Asia/Calcutta**. REA followed the older accessibility-overview URL to `/foundations/overview/principles` and rendered it. Published page data subsequently supplied the Designing and Writing tabs. Android implementation guidance and W3C primary references provide corroboration. This chapter does **not** certify the Material website or any product as accessible.

## Material's verified accessibility principles

The rendered page presents accessibility by default as a core value and identifies three principles:

- **Honor individuals:** accommodate changing abilities, circumstances, and preferences through choice and customization.
- **Learn before, not after:** research diverse users' needs early, and learn from unexpected barriers when they occur.
- **Requirements as a starting point:** use accessibility requirements as a basis for useful design, with benefits that can extend beyond the original access need.

Material distributes detailed goals across component pages and guidance, rather than claiming a single overview is sufficient. [Material accessibility principles](https://m3.material.io/foundations/overview/principles), [rendered evidence](evidence/rendered/foundations__overview__principles.txt), REA evidence `ev_59d954f4e4ee8a997c7f8f794671d3fe485e45f7a9978b7df06d7262c502ac0e`.

## Interaction targets and semantics

Android's Compose accessibility guide explicitly associates Material guidance with a minimum **48 dp** interactive target. Several Material controls reserve this space when they have an interaction callback. The visible icon or checkbox can be smaller than its touch area. Compose may expand a small target outside its layout bounds, so sufficient layout size and spacing still matter to avoid overlapping targets. [Compose API defaults](https://developer.android.com/develop/ui/compose/accessibility/api-defaults)

Use localized descriptions for meaningful graphics. Decorative images can use `contentDescription = null`. Standard buttons, text, clickables, and toggles already carry relevant semantics, so adding redundant image descriptions can make announcements worse. Related icon-and-text children can form one logical interactive element through merged semantics. [API defaults and graphic elements](https://developer.android.com/develop/ui/compose/accessibility/api-defaults)

Semantics communicates role, state, meaning, and available actions. For example, a switch has a role, toggle state, state description, and action; a visual drawing alone does not supply these. Custom controls need corresponding semantics, and test APIs can inspect those properties. [Compose semantics](https://developer.android.com/develop/ui/compose/accessibility/semantics)

## Structure, keyboard flow, and accessible text

Material's Designing guidance uses headings and landmarks to make visual hierarchy navigable through assistive technology. Document initial focus, order within composite controls, and context changes. A dialog should receive focus when opened and return it to its trigger when closed. Prefer the platform's normal traversal pattern; establish a reason before overriding it. [Structure](https://m3.material.io/foundations/designing/structure), [flow](https://m3.material.io/foundations/designing/flow)

Meaningful images, status cues, and icon-only controls need useful names. Labels should explain purpose and context without repeating the role that assistive technology already announces. Decorative imagery should be marked as decorative. Use native semantics where available; adding redundant ARIA labels or roles is not automatically an improvement. [Elements](https://m3.material.io/foundations/designing/elements), [implementation overview](https://m3.material.io/foundations/designing/overview)

Material's Writing guidance calls for at least **200% text enlargement**, with containers growing, content reflowing, or scrolling as appropriate. Critical text should wrap. Truncation is acceptable only when the full content remains accessible through another mechanism; an ellipsis alone is insufficient. Padding and gaps generally retain their default size while text and line height grow. Validate the actual platform's scaling behavior and combined language-height settings. [Text resizing](https://m3.material.io/foundations/writing/text-resizing), [text truncation](https://m3.material.io/foundations/writing/text-truncation)

## Contrast: keep the cases separate

| Case | Verified reference value | Source and boundary |
| --- | --- | --- |
| Ordinary text / images of text | At least 4.5:1 | WCAG 2.2 SC 1.4.3, AA; stated exceptions apply |
| Large-scale text | At least 3:1 | WCAG definition: 18pt, or 14pt bold; not any text named “large” in a design token |
| Meaningful component/state cues and graphical objects | At least 3:1 against adjacent colors | WCAG 2.2 SC 1.4.11, AA; inactive and other stated exceptions apply |

Sources: [W3C text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [W3C non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

Material's applying-type guidance also distinguishes 3:1 large-text and 4.5:1 small-text contrast, and calls for underlined text links. [M3 applying type](https://m3.material.io/styles/typography/applying-type)

Use the intended foreground/background roles and test the actual rendered combinations. A token name does not certify contrast after a brand override, opacity change, overlay, or image background. This last sentence is an analyst implementation inference; the linked standards establish the actual contrast tests.

**Source conflict:** the retrieved button and chip guidance includes 3:1 wording for label/text contrast. That does not establish an exception to WCAG's 4.5:1 threshold for ordinary-sized text. Keep the component's state/container guidance separate from text contrast, and apply the relevant text criterion to the actual label size and weight. This discrepancy is retained rather than silently converting component prose into a conformance claim. [Buttons](https://m3.material.io/components/buttons/accessibility), [chips](https://m3.material.io/components/chips/accessibility), [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

## Material targets are not WCAG CSS-pixel thresholds

WCAG 2.2 SC 2.5.8, at level AA, specifies **24 by 24 CSS pixels** for pointer targets, or the criterion's alternatives and exceptions, including sufficient spacing. This is distinct from the Material/Android 48 dp recommendation. Do not substitute one unit system or criterion for the other. [W3C target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

Material's current density page also explicitly uses **48 × 48 CSS pixels** for default targets and density controls, while other passages on that same page use **48 × 48 dp**. Preserve those source-specific units. It advises making denser layouts an opt-in and keeping the control that reverses the setting accessible. [Material density guidance](https://m3.material.io/foundations/layout/grids-spacing/density)

## Motion and user preferences

WCAG SC 2.3.3 is **AAA**: nonessential interaction-triggered motion can be disabled. Its guidance includes respecting reduced-motion preferences or providing a control. Automatically initiated animation has additional considerations under other criteria; this chapter does not collapse all motion requirements into one rule. [W3C animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

For a Material Expressive implementation, design a reduced-motion path alongside springs and shape transitions. Keep necessary state changes understandable when animation is suppressed. This is an implementation recommendation, not evidence that every Material library automatically does so.

## Verification workflow

Android recommends manual use with services such as TalkBack and Switch Access, alongside automated checks. Compose testing can assert semantic properties. The documented accessibility-test integration uses `ui-test-junit4-accessibility` and `enableAccessibilityChecks()`; the guide identifies Compose 1.8.0 as the starting support point and mentions checks for labels, contrast, target size, and traversal order. Verify compatibility with the project's actual dependency version. [Android accessibility testing](https://developer.android.com/develop/ui/compose/accessibility/testing)

Research-derived acceptance checklist:

- Complete the main tasks with a screen reader and with keyboard/switch input.
- Check accessible names, roles, current values, errors, and changing status.
- Check focus order and focus restoration after dialogs, pane changes, and navigation.
- Test light, dark, dynamic-color, and custom-brand combinations.
- Test large text, long translations, reduced motion, and small windows together.
- Verify that essential content and actions remain available when visual decoration or animation is absent.

These checks are a product test plan. They were not run on a product during this knowledge-base research.

## Coverage limits

- Verified: Android target size, semantics, naming patterns, and testing entry points; selected W3C contrast/target/motion thresholds.
- Published Designing and Writing tabs were inspected for the specific claims above. Other retrieved accessibility-related content is not thereby claimed to have been exhaustively reviewed.
- Not verified: all component accessibility tabs, live screen-reader behavior, keyboard focus behavior, conformance to every WCAG criterion, or any jurisdiction's legal obligations.
- W3C sources supplement the Material investigation; they are separately attributed standards guidance, not claims that Material itself uses precisely the same wording or every listed success criterion.

The Structure tab was also rendered through REA on October 28: [snapshot](evidence/rendered/foundations__designing__structure.txt), evidence `ev_3566d4ddd59da340a484784a34e0fde0dab16f3476c1f07d08b4108b9050cde3`, step `ready_3`. This is page-text verification, not assistive-technology testing.

Source records: `TL-10` through `TL-18`, `TL-24`, `TL-26`, `TL-32`, `TL-33`, in [sources-type-layout.json](evidence/sources-type-layout.json).
