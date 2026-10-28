# Foundations and design principles

Research started: 2026-10-27; evidence audit: 2026-10-28 (Asia/Calcutta). This is a source-backed synthesis, not a replacement specification. Source IDs resolve in [the foundation source ledger](evidence/sources-foundations.json). The homepage, Get Started, Foundations, and accessibility-principles content were verified in retained REA browser captures dated 2026-10-27.

## What Material 3 is

Material is Google's design system spanning UX guidance, reusable components, and implementation resources. Its information architecture separates **foundations** (accessibility, content, customization, tokens, interaction, layout), **styles** (visual and motion systems), and **components** (reusable interface elements). These layers should be read together: a component's appearance alone does not establish its interaction or accessibility behavior. The first two statements are verified in rendered official text; the last is an implementation inference. [F01 — Foundations](https://m3.material.io/foundations), [F02 — Get started](https://m3.material.io/get-started)

## Material 3 and M3 Expressive

M3 Expressive is an **expansion of Material 3**, not a separately verified replacement called Material 4. Official introductory guidance highlights additional component flexibility, emphasized typography, spring-based motion, and a library of 35 shapes. Existing Material 3 concepts such as semantic color roles, theming, and adaptive layout still matter. Availability of an expressive design in documentation does not establish that every platform library implements it. [F02 — Get started](https://m3.material.io/get-started), [F03 — Material 3 in Compose](https://developer.android.com/develop/ui/compose/designsystems/material3)

The rendered homepage promotes 2026 updates, including a Compose-first Android direction, while its Expressive section highlights color, motion, adaptive components, typography, and shape. The full rendered accessibility snapshot is retained locally; the separate ordinary web-text fetch returned only the JavaScript-required shell. That retrieval limitation does not mean the live content was inaccessible. [F04 — Homepage](https://m3.material.io/)

## Explicit principles for accessible design

The current foundation overview states that accessibility by default is a core Material value and gives three named principles. These are an official list, unlike the research synthesis below:

| Published principle | Practical meaning |
|---|---|
| Honor individuals | Allow people to adapt the experience to their changing abilities, preferences, and circumstances. |
| Learn before, not after | Research diverse needs before settling on a solution; investigate unexpected outcomes and improve the design. |
| Requirements as a starting point | Use accessibility requirements to guide solutions, while considering needs beyond minimum compliance. |

The page covers permanent and situational disabilities and treats accessibility as relevant throughout design and development. Component defaults are a foundation, not evidence that the completed product is accessible. That final distinction is an analyst conclusion; testing guidance is in [Accessibility](accessibility.md). [F07 — Accessibility principles](https://m3.material.io/foundations/overview/principles)

## Principles supported by current official research

The following is a synthesis of Google's research, **not a verbatim named list of Material principles**:

| Principle | Consequence for a product |
|---|---|
| Use expression to direct attention | Apply size, color, shape, motion, and containment to make important actions easier to locate. |
| Preserve recognizable tasks | Keep useful labels and familiar structures; novel composition can hurt usability. |
| Match the emotional tone to context | The appropriate intensity depends on the audience and task. |
| Validate both usefulness and appeal | Test comprehension and task performance alongside preference. |
| Include varied abilities | Account for contrast, target size, navigation, and assistive technology. |

Google reports 46 studies and more than 18,000 participants. In tested designs, key elements were sometimes found up to four times faster. These are **vendor-reported results for studied designs**, not guaranteed gains for any application that adopts M3. The article also reports examples where unconventional playlists or removed action labels reduced usability. [F05 — Better, Easier, Emotional UX](https://design.google/library/expressive-material-design-google-research)

The Material team's accompanying interview explicitly treats flexibility as central: expression can be restrained or energetic. This supports selecting tactics intentionally rather than applying maximum visual intensity everywhere. [F06 — Inside M3 Expressive](https://design.google/library/design-notes-material-3-expressive-liam-spradlin)

## How the foundations work together

| Layer | Question to answer before implementation | Local reference |
|---|---|---|
| User need and content | What action or information should the person understand first? | This file; content-design sources listed below |
| Color and type | Which roles express emphasis without losing legibility? | [Color](color.md), [Typography](typography.md) |
| Layout | How does hierarchy survive resizing and different input modes? | [Layout](layout.md) |
| Components and states | What behavior, feedback, and state changes are expected? | [Components](components.md) |
| Tokens | How do shared decisions propagate through design and code? | [Design tokens](design-tokens.md) |
| Accessibility | Does the resulting experience work beyond its visual appearance? | [Accessibility](accessibility.md) |

This table is an analyst-created workflow informed by the site's organization; it is not an official mandatory sequence.

## Inclusive research, content, and interaction

The published **Building for all** content asks teams to work with communities, experts, and researchers because the team itself cannot represent every user. Consider ability, language and literacy, culture, geography, age, access to technology, and socioeconomic context. Its co-design tab emphasizes involving people in creation and in continuing decisions, rather than limiting their participation to a final usability test. Those are verified published recommendations; no research program was run in this investigation. [F08 — User needs](https://m3.material.io/foundations/building-for-all/user-needs), [F09 — Co-design](https://m3.material.io/foundations/building-for-all/co-design)

The English-language content style guide recommends explaining consequences directly, using descriptive headings that scan well, preferring sentence case, and expanding abbreviations when practical. It warns against inconsistent pronoun choices. These are guidance for product content, not a universal grammar policy for all locales. Localization and accessible writing need their own review. [F10 — UX writing](https://m3.material.io/foundations/content-design/style-guide/ux-writing-best-practices), [F11 — Word choice](https://m3.material.io/foundations/content-design/style-guide/word-choice)

The state model distinguishes enabled, disabled, hovered, focused, pressed, and dragged interactions. Selected state can coexist with other feedback, while the state-layer model applies one layer at a time. A state layer takes its color from foreground content and changes opacity to show interaction. Focus also needs a perceptible keyboard indicator; a state overlay alone should not be treated as a complete keyboard-accessibility implementation. Component specifications and platform APIs determine the applicable behavior. [F12 — States overview](https://m3.material.io/foundations/interaction/states/overview), [F13 — State layers](https://m3.material.io/foundations/interaction/states/state-layers)

Customization can combine brand identity with individual preferences. The published guidance calls for a custom theme that can accept user-generated schemes and provide a fallback when dynamic color is not used. It also allows dynamic color in selected contexts, such as a personal account space. This establishes a supported design direction; it does not verify any particular Theme Builder export. [F14 — Customization](https://m3.material.io/foundations/customization)

## Implementation decisions to record

Before building, record the target platform, library version, baseline or Expressive APIs used, theme source, supported input modes, and accessibility test conditions. Separate system-level customization from component-specific exceptions. Keep the reason for an exception beside its token or component override. These are recommendations derived from the differences between design guidance and platform implementations, not claims of an official Material release process.

## Verified scope and unresolved gaps

- The reviewed official introduction confirms foundations/styles/components organization and Expressive's relationship to M3.
- Public page data was reviewed for inclusive research, co-design, selected content-design tabs, customization, and state fundamentals on 2026-10-28. This verifies published content, not every interactive example, translated edition, or full internationalization workflow.
- The retained live homepage says **14** new/updated Expressive components; the retained live Get Started page says **15**. This is a same-investigation discrepancy, not only a search-cache difference. The reason remains unverified; use the component inventory rather than treating either promotional count as exhaustive.
- Direct web-text fetches exposed a JavaScript-required shell, but REA rendered the overview pages successfully. The source ledger identifies the capture and step for each verified page.
- Historical Material slogans are not presented here as the current M3 Expressive principle set without current-page evidence.
