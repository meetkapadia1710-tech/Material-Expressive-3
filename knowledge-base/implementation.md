# Implementation guidance and platform status

Research completed 2026-10-28 (Asia/Calcutta). Status is a dated observation, not a maintenance guarantee. Source records are in [sources-components.json](evidence/sources-components.json). No application was built or package installed for this research.

## Choose an implementation independently of the design specification

The rendered [M3 Develop page](https://m3.material.io/develop) identifies Compose as Material's preferred Android toolkit, Flutter as its multi-platform option, and Android Views and Material Web as libraries in maintenance mode. A component on m3.material.io is a design resource; its presence does not establish an API or feature in every library. The rendered page is retained in [develop.txt](evidence/rendered/develop.txt), REA evidence `ev_59d954f4e4ee8a997c7f8f794671d3fe485e45f7a9978b7df06d7262c502ac0e`, step `ready_4`.

| Platform | Verified status | Consequence |
|---|---|---|
| Android, Jetpack Compose | M3 Develop says the in-house Compose library gets Material updates first and recommends it for Android. | Start new Android Material work here; inspect individual API stability and dependency versions. |
| Flutter | M3 Develop says the Flutter team actively maintains it. The [Flutter platform page](https://m3.material.io/develop/flutter) explicitly says it supports original M3 components and M3 Expressive is not available on Flutter. | Use its documented M3 implementation; do not promise official Expressive support from the current platform page. |
| Android Views, MDC-Android | M3 Develop says critical fixes only; the [official repository](https://github.com/material-components/material-components-android) labels itself maintenance mode. | Preserve existing apps as needed; plan deliberate migration rather than expecting future Material feature work. |
| Material Web, `@material/web` | The [official README](https://raw.githubusercontent.com/material-components/material-web/main/README.md) says maintenance mode pending new maintainers. The [M3 Web platform page](https://m3.material.io/develop/web) states that no updates are currently being made and Expressive is not implemented. | Evaluate the shipped component inventory and maintenance constraints before adoption. The README directs Angular users to Angular Material. |
| Native Material Components for iOS | The [official repository](https://github.com/material-components/material-components-ios) was archived on 2025-12-11 and is read-only. | This repository is not evidence of a maintained native M3 Expressive implementation. Flutter and a custom native implementation are different options, not successors proven by this archive. |

The Flutter/Web Expressive statements above are **published official-library status**, verified in the retrieved platform page JSON. They do not mean custom or community implementations of expressive visual patterns are technically impossible. This research did not assess those implementations.

## Android: Compose

The official [M3 Compose guide](https://developer.android.com/develop/ui/compose/designsystems/material3) identifies `androidx.compose.material3:material3`, supports M3/Expressive and dynamic color, and documents explicit opt-in for experimental APIs. Its core theme carries color scheme, typography, and shapes. Keep imports consistent with the M3 package; M2 also has a type called `MaterialTheme`.

On the [release page](https://developer.android.com/jetpack/androidx/releases/compose-material3), the latest listed update was 2026-10-21, stable was **1.4.0**, and beta was **1.5.0-beta02** when accessed. These are a snapshot of that page, not universal versions for every adaptive or Wear artifact. The page explicitly routes Wear OS M3 Expressive apps to **Wear Compose Material 3**. Check the API and release notes for the feature being used; a beta dependency is not required merely because a design is called Expressive.

Practical integration sequence (analyst synthesis of the linked guides):

1. Select dependencies and record the resolved versions in the project.
2. Establish theme roles, typography, and shape before overriding individual controls.
3. Use semantic color roles; pair container and content roles and provide light/dark schemes.
4. Prefer library components, then customize through supported APIs. Custom drawing requires its own semantics and interaction work.
5. Treat state, navigation, focus, errors, and loading as behavior to implement, not a side effect of styling.
6. Verify layout and accessibility on the target windows and input methods.

[Compose semantics](https://developer.android.com/develop/ui/compose/accessibility/semantics) describes how meaning and role are exposed to accessibility, autofill, and tests. Standard Material and Foundation components provide semantics, but the app must supply meaningful content and customize semantics where necessary. A camera glyph, for example, needs the meaning of its action; decoration should not become a duplicate announcement. Built-in semantics do not certify the final app.

### Migrating from M2

The [official migration guide](https://developer.android.com/develop/ui/compose/designsystems/material2-material3) recommends phased migration, beginning with the design system and adding M3 alongside M2 temporarily. Migrate themes and screens, then remove M2 themes and dependencies. It discourages leaving both systems together indefinitely because their design and implementation contracts differ. Color roles, theme arguments, component APIs, and defaults need review; package renaming alone is not a complete migration.

## Android: Views

The current [MDC-Android repository](https://github.com/material-components/material-components-android) remains useful for existing Views code, APIs, themes, and historical examples, subject to its maintenance status. Its documentation includes some Expressive styles; this does not change the current critical-fixes-only direction reported by M3 Develop.

A concrete example of version-sensitive guidance is the [Views FAB documentation](https://raw.githubusercontent.com/material-components/material-components-android/master/docs/components/FloatingActionButton.md): it describes a medium FAB, deprecates the small FAB and surface-color FABs in the Expressive update, and distinguishes primary/secondary/tertiary colors from their container variants. This is documentation of that library and design update, not proof that similarly named APIs were removed on all platforms. For an existing app, record the theme family and exact library version before applying a spec table.

## Web

The [Material Web quick start](https://raw.githubusercontent.com/material-components/material-web/main/docs/quick-start.md) documents installation of `@material/web`, imports such as `@material/web/button/filled-button.js`, and custom elements such as `md-filled-button`. It distinguishes CDN prototyping from an installed production build. Import the components actually used and follow the package's production tooling guidance.

The repository README identifies this as a Material 3 Web Components library. **It is not the same package as an older Material Components Web library, nor does it represent every framework's Material implementation.** The README's Angular Material recommendation is specific to Angular; choosing other framework libraries requires a separate assessment. The Material Web documentation landing page at `https://material-web.dev/components/` could not be fetched through the web retrieval tool in this pass; the public repository and raw official documentation remained accessible.

For theming, follow [design-tokens.md](design-tokens.md). Do not assume a spec token has the identical CSS name or is exposed by the package. For a custom component, use native HTML semantics or the appropriate platform pattern, then test keyboard focus, labels, selected state, validation, and screen-reader output. These are implementation recommendations, not a claim that the M3 documentation site itself passed an accessibility audit.

## Flutter

Flutter's [migration guide](https://docs.flutter.dev/release/breaking-changes/material-3-migration) dates the default change to Flutter 3.16 in November 2023. Its own warning says breaking-change articles describe their release and can become stale. The current [`ThemeData.useMaterial3` API](https://api.flutter.dev/flutter/material/ThemeData/useMaterial3.html) still documents `true` as the default and a temporary opt-out. It also says constructing a theme with the flag changes defaults, while toggling it through `copyWith` does not regenerate those defaults. Do not equate the flag with full coverage of all current Expressive designs.

The current [`ColorScheme.fromSeed` API](https://api.flutter.dev/flutter/material/ColorScheme/ColorScheme.fromSeed.html) exposes a seed, brightness, dynamic-scheme variant, contrast level, and optional role overrides. It warns that the original seed may not appear verbatim in the resulting scheme. Prefer role-based use of `ColorScheme` and review overrides; generated palettes cannot compensate for arbitrary incompatible foreground/background assignments.

The Flutter API lists M3 replacements such as `NavigationBar` for `BottomNavigationBar`, `NavigationDrawer` for `Drawer`, and `SegmentedButton` for `ToggleButtons`. These are Flutter mappings in that API snapshot. They should not be confused with later M3 Expressive design guidance that may deprecate a pattern. Resolve such differences per platform and release.

## Design-to-code handoff

Recommended handoff record (analyst synthesis):

| Record | Why it matters |
|---|---|
| Design family and dated source URLs | Distinguishes M2, baseline M3, and Expressive revisions. |
| Platform, library, version, API stability | Separates the visual spec from shipped implementation. |
| Semantic role and component token mapping | Prevents exporting unrelated hex values as a theme. |
| State matrix | Includes enabled, disabled, focused, hovered, pressed, selected, error, and loading when applicable. |
| Responsive behavior | Specifies navigation changes, content panes, reflow, and retained state. |
| Accessibility behavior | Includes names, roles, values, focus movement, announcements, and alternatives to gestures. |
| Acceptance evidence | Records what was checked on real target devices and assistive technology. |

## Verification boundaries

- Verified: the rendered M3 platform positioning, the cited official repository status, and the listed documentation/API statements.
- Not performed: package installation, compilation, device execution, dependency security review, browser compatibility testing, or comparison of every component API across every version.
- Not established: universal Expressive parity across Compose, Flutter, web, Views, iOS, Wear, XR, or third-party libraries. The M3 platform pages explicitly report no Expressive implementation for Flutter and Material Web in this snapshot; other feature support must be resolved at the selected package/version level.
- The GitHub `main`/`master` and API pages are moving references. The local source ledger records this access date; it does not pin all external repositories to commits.
