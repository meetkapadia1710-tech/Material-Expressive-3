# Pointer interaction verification

The original content, routes, palette, typography and card layouts are unchanged. The native cursor is unchanged.

## Behavior

- Cards on Home and Projects receive a faint, static radial highlight whose layer moves with the pointer. Only its transform and opacity change; its gradient is not repainted from changing gradient parameters. The layer ignores pointer events and leaves card links usable.
- Primary CTAs and navigation links move by at most 3 px per axis. Independent CSS `translate` composes with existing hover/press transforms rather than replacing them.
- Only the hero's decorative flower moves, by at most 6 px per axis. Hero text and controls do not parallax.
- Reset transitions last 180–260 ms. Keyboard input, hidden tabs, disabled preferences and off-screen elements reset immediately. No persistent `will-change` is used.
- The shared tracker has one passive pointer-move listener and queues at most one callback on Framer Motion's RAF scheduler, shared with Lenis. It has no continuously running pointer loop and no React pointer state. Geometry reads are batched before style writes. Invisible subscribers are skipped; no frame is queued when all are off-screen.
- A single observer manages visibility and a single mutation observer manages route/filter insertion and removal. Everything is disposed on unmount or preference changes. Pointer effects are dynamically imported only for fine, hover-capable pointers with no reduced-motion preference.
- Focus rings and keyboard affordances remain available with effects disabled. All effects derive from the existing theme colors.

## Verification

Production build and TypeScript checks passed. ESLint reported zero errors and one existing `@next/next/no-img-element` warning for the dimensionless-media fallback in `project-detail.tsx`; this file was not changed by this pass. All 41 tests passed, including six new pointer lifecycle tests.

Browser checks: mouse movement activated flower parallax, magnetic navigation and the catalog highlight; hero text stayed still; the highlight ignored clicks; project navigation remained functional. Tab cleared active pointer effects and retained visible focus. Filtering retained exactly seven subscribed concept cards. Both themes were checked, and the 390 px responsive layout had no horizontal overflow or console warnings/errors.

Actual Chrome mobile Lighthouse runs did not request the pointer module. A desktop run with `--force-prefers-reduced-motion` also did not request it, while the normal desktop run did. Automated tests additionally simulate coarse pointers, live reduced-motion changes, touch events, keyboard navigation, tab visibility changes, off-screen elements, pointer bursts and subscription cleanup. The mobile UI viewport check alone is not treated as touch emulation. No physical touch-device testing was performed.

## Lighthouse comparison

Same local production server, Chrome and Lighthouse settings before/after this pass. Mobile uses Lighthouse's default simulated 4× CPU slowdown. Desktop uses its desktop preset. Single-run timings naturally vary; these are lab navigation measurements, not a guarantee of 60 fps on all hardware.

| Page / mode | Saved Phase 9 performance | Before this pass | After | CLS after | TBT before → after |
|---|---:|---:|---:|---:|---:|
| Home / mobile | 100 | 99 | 100 | 0 | 36.5 → 44.5 ms |
| Projects / mobile | 100 | 100 | 100 | 0 | 43 → 35.5 ms |
| RepoGrade / mobile | 100 | 100 | 100 | 0 | 78 → 56 ms |
| Home / desktop | — | 100 | 100 | 0 | 0 → 0 ms |
| Home / reduced-motion desktop | — | — | 100 | 0 | — → 0 ms |

The measured performance scores did not fall versus Phase 9. Raw audit evidence is in `performance-reports/pointer/`.

## Every file changed in this pass

- `app/globals.css` — imports the scoped pointer styles.
- `components/motion/motion-runtime.tsx` — mounts and disposes the optional shared system.
- `components/motion/pointer-effects.ts` — DOM subscriptions and effect bounds.
- `lib/pointer-tracker.ts` — shared tracking, scheduling, lifecycle and preference gates.
- `styles/pointer.css` — highlights, magnetic translation, hero translation and focus parity.
- `tests/pointer.test.tsx` — pointer behavior tests.
- `POINTER-INTERACTIONS.md` — this report.
- `performance-reports/pointer/before-home.json`
- `performance-reports/pointer/before-projects.json`
- `performance-reports/pointer/before-repograde.json`
- `performance-reports/pointer/before-desktop.json`
- `performance-reports/pointer/after-home.json`
- `performance-reports/pointer/after-projects.json`
- `performance-reports/pointer/after-repograde.json`
- `performance-reports/pointer/after-desktop.json`
- `performance-reports/pointer/reduced-desktop.json`

Lighthouse was installed locally without saving package or lockfile changes; no production dependency was added.
