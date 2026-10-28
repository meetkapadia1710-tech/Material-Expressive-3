# Motion, shape, and iconography

Research dates: **2026-10-27–28, Asia/Calcutta**. This companion chapter separates Material's published page-data guidance from observed AndroidX source declarations. Motion and shape tabs were retrieved as JSON; animations were not measured.

## Motion physics in M3 Expressive

The Material motion page dates the physics system to May 2025 and describes it as replacing the earlier easing/duration system. It offers expressive and standard schemes. Springs combine stiffness, damping, and initial velocity; higher stiffness resolves faster, while damping controls bounce. Spatial tokens apply to movement, rotation, size, and shape. Effects tokens handle properties such as opacity or color without overshoot. Each category has fast, default, and slow variants. [M3 motion](https://m3.material.io/styles/motion/overview/how-it-works)

The scheme is selected at the product level; a token such as `md.sys.motion.spring.fast.spatial` does not encode “expressive” in its name. The page recommends default speed for most transitions, fast for smaller components, and slow for larger movements. Availability differs by platform, so guidance does not establish that every web, Flutter, or Android component implements the same behavior. [Motion schemes and application](https://m3.material.io/styles/motion/overview/how-it-works)

The published specs offer web Bézier approximations for animations without gestures or interruptions. For example, expressive default spatial maps to `cubic-bezier(0.38, 1.21, 0.22, 1.00)` over 500 ms. This is an explicitly documented approximation, not a measured spring duration. The page says legacy easing/duration tokens remain as a fallback and are still used for transitions. [Motion specs](https://m3.material.io/styles/motion/overview/specs)

### Verified AndroidX expressive parameters

| Spring | Damping | Stiffness |
| --- | --- | --- |
| Fast spatial | 0.6 | 800 |
| Default spatial | 0.8 | 380 |
| Slow spatial | 0.8 | 200 |
| Fast effects | 1.0 | 3800 |
| Default effects | 1.0 | 1600 |
| Slow effects | 1.0 | 800 |

These values were read from `ExpressiveMotionTokens.kt`, marked `v0_14_0`, on the moving `androidx-main` branch. They are source declarations, not measured durations or proof of a released binary's runtime behavior. A web animation library may use different spring parameter conventions; do not copy numbers without verifying the model. [AndroidX expressive motion tokens](https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ExpressiveMotionTokens.kt)

Analyst guidance: test interruption, reversal, rapid repeated input, reduced motion, and the final settled state. Do not invent one fixed duration for a spring simply because a preview appears to finish within that time.

## Shape system

The inspected AndroidX shape token file (`14_1_0`) provides the following symmetric rounded-corner declarations. It also includes shapes with only selected corners rounded, such as top/start/end variants. [AndroidX shape tokens](https://raw.githubusercontent.com/androidx/androidx/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/ShapeTokens.kt)

| Token suffix | Corner size / declaration |
| --- | --- |
| None | Rectangle / 0 dp |
| ExtraSmall | 4 dp |
| Small | 8 dp |
| Medium | 12 dp |
| Large | 16 dp |
| LargeIncreased | 20 dp |
| ExtraLarge | 28 dp |
| ExtraLargeIncreased | 32 dp |
| ExtraExtraLarge | 48 dp |
| Full | `CircleShape` |

`Full` is a shape declaration, not a universal fixed radius. These source values do not imply every component uses every category. Material's Expressive introduction also identifies an expanded library of 35 shapes for decorative use and morphing; that library is distinct from the corner-radius scale above. [M3 get started](https://m3.material.io/get-started)

The published corner-radius tab corroborates the ten-step scale. It distinguishes changing a shape style globally from remapping one component to another style. Nested shapes should use proportional radii; the supplied optical-roundness rule is outer radius minus padding equals inner radius. Cut corners may need extra padding to avoid clipping content. Abstract shapes are intended for emphasis and decoration, rather than assigning a fixed semantic meaning to one shape. [Corner radius scale](https://m3.material.io/styles/shape/corner-radius-scale), [shape principles](https://m3.material.io/styles/shape/overview-principles)

The shape-morph tab identifies Compose support and says web is not currently available. This describes Material's supplied implementation, not an assertion that a web developer cannot implement morphing independently. [Shape morph](https://m3.material.io/styles/shape/shape-morph)

Analyst guidance: preserve the component's state and interaction affordances when customizing shape. Review clipping, focus decoration, ink/ripple behavior, image crops, and adjacent spacing together. Verify the component-specific token mapping before applying a global radius change.

## Material Symbols

Google's Symbols guide describes three styles and introduces four variable axes: `FILL` from `0` to `1`, `wght` from 100 to 700, `GRAD` for finer emphasis adjustment, and `opsz` from 20 to 48 dp. Its current optimization examples additionally include **`ROND` from 0 to 100**. The overview and examples are therefore not a consistent statement of a four-axis limit; inspect the selected font's supported axes. SVG, PNG, hosted font, and self-hosted delivery are documented, with Apache 2.0 licensing. [Google Material Symbols guide](https://developers.google.com/fonts/docs/material_symbols)

Meaningful icons still need accessible naming, while purely decorative icons should not add redundant announcements. [Compose graphic semantics](https://developer.android.com/develop/ui/compose/accessibility/api-defaults)

For web delivery, the Google guide recommends subsetting requested icon names rather than loading the entire collection. A fallback plan matters if the font fails to load. The subsetting advice is documented; choosing SVG instead for a product's small fixed set is an analyst implementation option. [Symbols web usage](https://developers.google.com/fonts/docs/material_symbols)

## Coverage limits

- Verified: published M3 spring concepts and selected web-conversion guidance, expressive AndroidX spring declarations, published and source shape-corner scales, and Google Symbols delivery guidance. Motion specs was also rendered through REA ([snapshot](evidence/rendered/styles__motion__overview__specs.txt), `ev_3566d4ddd59da340a484784a34e0fde0dab16f3476c1f07d08b4108b9050cde3`, step `ready_6`).
- Not verified: every motion token, standard-scheme spring parameter table, measured animations, a full 35-shape inventory, every component's shape mapping, or all Symbols glyphs and axes.
- No assumption is made that upstream source, current website guidance, and every platform's latest released package are synchronized.

Source records: `TL-19` through `TL-22`, with `TL-03`, `TL-11`, and `TL-29`, in [sources-type-layout.json](evidence/sources-type-layout.json).
