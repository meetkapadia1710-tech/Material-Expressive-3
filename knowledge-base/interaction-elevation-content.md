# Interaction, elevation and content

Reviewed 2026-10-28 against the retained public page data. These notes supplement the main guides. The links identify published guidance; no input-device or component behavior was tested here.

## States and state layers

Treat interaction state as part of a component's contract. The state overview distinguishes enabled, disabled, hover, focus, press and drag. Selection can coexist with a transient state such as hover; expose meaning through more than color alone. [States overview](https://m3.material.io/foundations/interaction/states/overview), source `P032`

A state layer sits between container and content and normally uses the content's color role. The published state-layer section specifies hover **8%**, focus **10%**, press **10%**, and drag **16%** opacity. It permits only one state layer at a time. These are this documented system's values, not a substitute for inspecting the selected component's token/context or the platform's API. A visible layer and its interactive target can have different bounds. [State layers](https://m3.material.io/foundations/interaction/states/state-layers)

Disabled treatment is component-specific. The guidance lists controls that can be disabled, but says an unavailable FAB should be omitted. Do not invent disabled styling for every container or navigation element. Visual state still needs semantics, focus handling and meaningful labels in an implementation. [Applying states](https://m3.material.io/foundations/interaction/states/applying-states)

## Inputs, gestures and selection

Support the input methods appropriate to the task, including touch, mouse, keyboard, trackpad and stylus. Device category does not determine input: a tablet can have a keyboard or mouse. Preserve expected context-menu, scrolling, cursor, hover and selection behavior. [Inputs](https://m3.material.io/foundations/interaction/inputs), source `P030`

The gesture guide covers tap, double tap, long press, scroll/pan, swipe and Android predictive back. Feedback should follow the gesture in real time. Its descriptions are patterns, not permission to make every operation gesture-only. Provide alternatives where people cannot perform the gesture, as the [accessibility guide](accessibility.md) and relevant component guidance explain. [Gestures](https://m3.material.io/foundations/interaction/gestures), source `P029`

Selection may apply to a whole component or an internal item. Communicate it with checkmarks, control state, shape or surface changes as appropriate. Distinguish an item's selected state from navigation's active destination and from keyboard focus. Define entry, exit and batch-action behavior for selection mode. [Selection](https://m3.material.io/foundations/interaction/selection), source `P031`

Implementation recommendation: write a small state matrix per interactive control, specifying what triggers each state, what changes visually, what is announced, and how the state ends. This matrix is analyst synthesis, not an official universal token schema.

## Elevation

Elevation represents relative distance along the z-axis. Material expresses it through tonal differences, shadows and, where appropriate, scrims. Elevation tokens describe levels; they do not themselves prescribe identical platform shadow rendering. Keep the component's documented resting elevation unless there is a reason grounded in its behavior. [Elevation overview](https://m3.material.io/styles/elevation/overview), source `P046`

The published applying-elevation guidance defines six levels, 0 through 5, using lower levels for resting elements and higher ones for interaction. Avoid turning each section into a different floating layer. Surface boundaries should remain understandable through edges, overlap and separation. Numeric dp values and resolved tokens are available in the retained elevation module; do not equate a token's level number with its dp value. [Applying elevation](https://m3.material.io/styles/elevation/applying-elevation), [elevation tokens](https://m3.material.io/styles/elevation/tokens)

## Content and internationalization

Content is part of the interface hierarchy. Labels, errors, supporting text and notifications should help someone understand what happened and what action is available. Plan content early and consider localization, differing scripts and directionality rather than treating text as fixed-width decoration. [Content design](https://m3.material.io/foundations/content-design/overview), [global writing](https://m3.material.io/foundations/content-design/global-writing)

Alternative text should describe an image's meaning in context. A product photo, a diagram and an image used as a button have different purposes. Decorative imagery should not produce redundant announcements; on the web, an empty `alt` attribute is distinct from a missing alternative. Avoid filenames as descriptions. The captured source's image metadata is evidence of its authored alternative text, not proof that an actual screen reader announces it correctly. [Alt text](https://m3.material.io/foundations/content-design/alt-text), source `P012`

The readable corpus also includes notifications, the writing style guide, accessibility-oriented writing, and RTL layout. These are available for detailed lookup; this short guide does not attempt to reproduce every editorial rule. Some source strings contain replacement characters, which the extraction preserves rather than guessing the missing text. Use the original page and retained JSON when exact wording matters.
