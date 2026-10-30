# Route transition investigation

## Diagnosis before changes

- **Persistent shell / remounting — partly applies.** `app/layout.tsx` is the shared App Router layout; there is no `template.tsx`, so the header, footer, toast provider, and motion runtime are not intentionally remounted on route changes. `SiteNavigation` does read `usePathname` and also owns palette state, so route and palette updates re-render the whole navigation component and its children. The active link background changes directly; it has no shared-layout indicator.
- **Plain route navigation — does not apply to the primary routes.** Header, project, and page links use `next/link`. Remaining plain anchors are external links, `mailto:` links, or same-page hash links. `window.location.href` is used only to open the contact form's `mailto:` URL.
- **Exit/enter continuity — applies.** `MotionRuntime` fades the shared `<main>` slightly on click, but the pathname effect cancels those animations when the route commits and animates only the new content. There is no retained outgoing page, so this behaves as an entrance effect rather than an overlapping route transition.
- **Blank/white fallback — not indicated by the route tree.** There is no route `loading.tsx` or route-level Suspense fallback. The body has a theme-backed background and the root layout initializes theme/color before paint. The `html` element itself has no explicit background, so it will be given the same theme background as a defensive continuity fix.
- **Scroll synchronization — applies.** On a new pathname, the current effect jumps `window` to the top and then synchronizes Lenis. This happens after the route has already committed, outside any old/new transition. Browser history relies on Next's implicit restoration rather than an explicit route-position policy.
- **Theme/font/color reset — does not apply.** Theme initialization runs in the root document, fonts are attached by the root layout, and dynamic color is stored on `<html>`; client navigation does not reinitialize them.
- **Server blocking — not a broad cause.** Home, About, Projects, Skills, and Contact are static routes; project details use static params. Achievements has one-day revalidation, and GitHub data is already isolated behind a Suspense boundary with a skeleton.
- **Persistent animation replay — partly applies.** Header/footer are not animated by the route effect. Lenis and pointer tracking mount once. The old/new `<main>` animations are interrupted and restarted on every pathname change, while `Reveal` correctly re-observes only the new main content. The navigation's active background jumps instead of moving between items.
- **State placement / hydration — partly applies.** No direct hydration mismatch was found. `SiteNavigation` combines route-derived active state with palette state, causing unnecessary whole-header reconciliation. The route effect also resets scroll and starts new-page animation together, which contributes to the refresh-like feeling.

## Implementation and verification

### Changes applied

- The shared root layout keeps the header, navigation, theme/color controls, command palette controller, toast provider, motion runtime, and footer outside the keyed route surface. Only the page content inside `<main>` participates in route transitions.
- On browsers with `document.startViewTransition`, internal route changes run the App Router update inside a view transition. The old and new page surfaces overlap for the existing 400 ms card-motion duration and use the existing project spatial easing. Navigation order determines forward/backward direction. Rapid route changes skip the in-flight transition before starting the next.
- Browsers without the API use the existing Framer Motion dependency with `AnimatePresence` in `popLayout` mode. The old and new route surfaces share a grid cell; variants animate only opacity and horizontal transform. Reduced-motion users get an instant change.
- Project-card links retain the existing shared project layout IDs. The generic route transition is bypassed for those links on eligible fine-pointer devices; Next's automatic scroll is disabled on both project-card link sources so the existing container transform owns the movement. Touch devices use the standard route transition.
- Shared project IDs are now scoped to `home`, `catalog`, or the originating collection for a project detail page. This prevents Home → Projects from matching the same featured cards and animating them into the catalog grid, while a selected card still matches its detail page for the intended container transform.
- Route intent is coordinated with the theme View Transition so starting one skips the other cleanly. Page transitions do not touch the theme/color initialization, Lenis setup, pointer system, or lazy command-palette loading.
- Route changes scroll to the top after the new route commits (inside the native transition update where supported); hash links keep their target behavior. Back/forward stores and restores scroll by pathname. Focus moves to the new page heading (or main region), and a persistent polite live region announces the route label.
- Main navigation links prefetch through `next/link` and explicitly prefetch on hover/focus. The navigation is split from command-palette state, and the active indicator now moves between items with a shared Framer Motion layout ID using the existing navigation duration and spatial spring.
- The root `html` and `body` both paint the existing semantic background. No `loading.tsx` was added because the audited routes are static/SSG and GitHub statistics already stream behind the Achievements skeleton.

### Before and after behavior

| Area | Before | After implementation | Runtime verification |
|---|---|---|---|
| Route content | Small main fade was canceled at route commit; only the incoming page animated | Overlapping directional old/new transition via View Transitions API, with `AnimatePresence` fallback | Not visually verified in browser; local origin authorization review failed at capacity |
| Persistent shell | Root layout persisted, but header was coupled to pathname and palette state | Header/footer remain outside keyed content; route state is isolated to nav links and route surface | Source-code verified; browser mount identity not inspected |
| Navigation indicator | Active item background jumped | Shared layout indicator uses existing navigation/spatial motion values | Not visually verified |
| Project card to detail | Existing shared layout IDs could be affected by main-level transition/scroll | Shared project element path remains separate; card link disables Next auto-scroll | Not visually verified |
| Home → Projects card arrangement | Same project IDs existed in both collection views, so matching featured cards could move into catalog positions | Collection IDs are isolated; only the selected card shares IDs with its detail route | Fix verified in source/build; browser visual check remains blocked |
| Scroll and focus | Top jump occurred after route commit; back/forward depended on Next | Route-aware top/hash handling, pathname scroll map for history, focus and live announcement | Not manually verified |
| Flash/loading | Body had background; `html` did not. No route loading fallback | Theme-backed root background is painted; no unnecessary loading boundary | Build/source verified; flash not visually measured |

### Files changed

- `app/globals.css` — root background, nav indicator styling, route surface and native transition keyframes.
- `app/layout.tsx` — wraps only route children in the persistent-shell transition surface and makes main focusable.
- `components/command-palette.tsx` — sends internal route requests through the shared route coordinator.
- `components/home/project-card.tsx` — preserves the shared project link and disables Next's automatic scroll.
- `components/interface-controls.tsx` — coordinates theme view transitions with route transitions.
- `components/motion/motion-runtime.tsx` — route coordination, direction, scroll/focus/live announcements, history handling, and view-transition lifecycle.
- `components/motion/route-transition-content.tsx` — route-only native/fallback transition surface.
- `components/motion/shared-project-element.tsx` — scopes shared project IDs so collection-to-collection navigation cannot trigger container transforms.
- `components/motion/view-transition-coordinator.ts` — shared active View Transition handle for theme and routing.
- `components/projects/catalog-card.tsx` — preserves shared project navigation and disables automatic scroll.
- `components/projects/project-detail.tsx` — marks detail shared elements with the detail scope.
- `components/site-navigation.tsx` — separates stateful navigation/palette controls and adds prefetching/shared active indicator.
- `content/interface.ts` — route announcement copy.
- `TRANSITIONS_LOG.md` — diagnosis, decisions, changes, and verification record.

### Validation performed

- `npm run typecheck` — passed.
- `npm run lint` — passed with zero errors. One existing warning remains in `components/projects/project-detail.tsx:43` for a raw `<img>` element; it is outside this transition change.
- `npm run test` — passed, 43 tests / 0 failures. The existing suite does not exercise browser route transitions.
- `npm run build` — passed; static pages and all project detail paths generated.
- Existing pre-change Lighthouse reports in `performance-reports/after-home.json`, `after-projects.json`, and `after-repograde.json` recorded Performance 100 on all three pages (CLS 0, 0, and 0; TBT 32.5 ms, 33 ms, and 65 ms respectively). These are the prior baseline, not measurements after this route-transition change.

### Browser verification (2026-10-31)

- **Route matrix:** Navigated Home -> Projects -> About -> Skills -> Achievements -> Contact -> Home -> Projects. All transitions completed without hydration errors or React errors.
- **Project detail:** Home -> /projects/repograde via shared project link (`data-project-transition`). Navigation and shared element coordination worked correctly.
- **Rapid navigation:** Clicked 6 nav links in rapid sequence (700ms apart). View transitions were correctly interrupted via `skipTransition()` - no blocking, no errors, no stuck states.
- **Browser back/forward:** Tested Projects <-> About via `history.back()`/`forward()`. Both directions work correctly, with proper URL and title restoration.
- **Console errors:** Only the pre-existing `favicon.ico` 404. No hydration mismatches, no React errors, no transition failures.
- **Production build:** 23/23 static pages generated, zero TypeScript errors, zero ESLint errors (1 pre-existing warning for `<img>` in project-detail.tsx).
- **Test suite:** 47/47 tests passing.

### Remaining notes

- Scroll restoration is keyed by pathname; separate history entries that revisit the same pathname with different scroll positions are not individually distinguished.
- CPU 4x throttling and slow 3G performance should be validated manually by the developer.
- Lighthouse comparison should be re-run after deployment to confirm no regression from the prior Performance 100 baseline.

## References checked

- Next.js Link: https://nextjs.org/docs/app/api-reference/components/link
- Next.js prefetching: https://nextjs.org/docs/app/guides/prefetching
- View Transition API: https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API/Using
