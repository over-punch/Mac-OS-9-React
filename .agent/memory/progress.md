# Progress: Mac OS 9 UI Component Library

**Version:** 0.3.3 (unreleased changes on `main`)
**Last synced:** 2026-08-20

## Shipped components

All Phase 1 and Phase 2 components are shipped and publicly exported from `src/index.ts`:

### Form controls
- **Button** — variants (default/primary/danger), sizes (sm/md/lg), polymorphic (`as: 'button' | 'a'`), loading state, `iconOnly`, `leftIcon`/`rightIcon`
- **Checkbox** — checked/unchecked/indeterminate, label positions, error/disabled states
- **Radio** — single Radio control (no Radio.Group component yet — see issue #14)
- **TextField** — single-line input only (no multiline variant yet — see issue #84), label, helper text, error/disabled
- **Select** — native `<select>` styled with Mac OS 9 chrome (open-list still uses OS-native dropdown — see issue #38)
- **Tabs** + **TabPanel** — keyboard navigation, controlled/uncontrolled, simplified square shape

### Containers
- **Window** — title bar, controls, optional drag (`draggable`) and resize (`resizable`) with controlled/uncontrolled state
- **Dialog** — Window-based modal with backdrop, focus trap, Esc handling (multiple correctness issues — see #1–#7)
- **TitleBar** — currently commented out in source and not exported (see issue #46)

### Navigation
- **MenuBar** + **MenuItem** + **MenuDropdown** — horizontal menu, controlled open state, separator/checkmark/submenu variants

### Lists
- **ListView** — columns, rows, selection, sort, hover state, render props, `classes` slot prop
- **FolderList** — composed of Window + ListView with manual prop forwarding
- **Scrollbar** — custom Mac OS 9 styled scrollbar (lacks keyboard a11y — see issue #16)

### Utilities
- **Icon**, **IconButton**, **IconLibrary** — icon system with category-based registry (registry currently near-empty — see issue #86)

## Shipped features

- **Dual ESM/CJS build** via Rollup with TypeScript declarations
- **Drag and resize Windows** with controlled/uncontrolled position and size
- **Custom styling system** — `classes` slot prop, render props, `mergeClasses` utility, data attributes for CSS-only targeting (only on ListView, FolderList, Window — see issue #47)
- **Optional global styles** via separate `/base` export (introduced in 0.3.0 as breaking-ish change)
- **Inlined base64 pixel fonts** in `dist/index.css` (recent fix — see issue #71 about font double-shipping)
- **Storybook documentation** for all shipped components
- **Design tokens** as TypeScript constants + CSS custom properties (currently drifts — see issues #17, #58)

## Active issues (panel review 2026-05-27)

A 15-engineer panel review on 2026-05-27 surfaced 124 findings, all opened as GitHub issues #1–#124:

- **20 Critical** — correctness bugs, security risks, broken core flows (Dialog focus/modal, Window drag state, mobile touch support, ARIA mistakes)
- **70 Major** — functional gaps, API consistency, missing tests (zero tests for 16 of 17 components), token drift, build pipeline issues
- **34 Minor** — style, docs, cleanups

See `.agent/memory/deep-review.md` for the session log.

### Known limitations not yet addressed
- Drag boundary constraints (windows can be dragged off-screen — see issue #12)
- Z-index management for multiple windows (no focus-to-front — see issue #24)
- Touch/pointer event support for drag/resize/scrollbar (mouse-only — see issue #11)
- Keyboard alternative for drag/resize (mouse-only — see issue #25)

## Documentation status

- ✅ README.md exists with installation, basic usage, styling, themes
- ✅ CHANGELOG.md tracks releases via Changesets
- ✅ `docs/custom-styling-guide.md` covers classes/render-prop patterns
- ⚠️ README MenuBar example uses outdated API and will not compile (see issue #19)
- ⚠️ README claims WCAG 2.1 AA compliance but no audit has run (see issue #81)
- ⚠️ Drag/resize, IconLibrary, FolderList not documented in README (see issue #80)
- ✅ Build documentation now matches reality: Rollup throughout, `tsup` removed from devDependencies and config (#73)

## Roadmap

The previous five-phase plan is largely complete. Current focus is correctness and maintenance:

1. **Critical fixes** — landing fixes for issues #1–#20 via feature branches + PRs
2. **Test coverage** — add baseline tests + axe-core integration (issues #77, #78, #79)
3. **API consistency pass** — unify size/variant/onChange/error conventions across components (#41–#47)
4. **Token system overhaul** — single source of truth, semantic layer, component-level overrides (#17, #58–#62)
5. **Performance pass** — rAF throttling, ref-based drag callbacks, ListView row memoization (#21–#23, #51–#54)
6. **Pointer Events migration** — mobile-capable drag/resize/scrollbar (#11)


## Panel-review backlog — closed (2026-08-20)

All 124 issues from the 2026-05-27 panel review are closed.

The last twenty were the architectural and convention-level ones. Several
turned out to need a different fix from the one the issue proposed, and those
are worth remembering:

| Issue | What it actually was |
|-------|----------------------|
| #67 | Reported as 216+ px values bypassing the spacing scale. Categorising all 362 showed 8 were spacing; the rest is pixel-art geometry where an exact px is correct. Fixed the real ones (contrast border widths, a sub-scale font size, dead token fallbacks). |
| #69 | Asked for deep subpath imports. The real problem was that tree-shaking did not work at all — a single-file bundle plus `displayName` assignments meant a Button-only import pulled 69 KB of 74. Preserved modules took it to 3.4 KB, which makes subpaths unnecessary. |
| #119 | Asked for `primitives/` and `compound/` directories. The graph was already that shape and acyclic; what was missing was enforcement. `src/test/architecture.test.ts` now declares and checks the layering. |
| #88 | Folding IconButton into Button would have meant dropping `labelPosition`. Made it a Button wrapper instead: it inherits the chrome and behaviour, its CSS drops from 207 lines to 60. |
| #76 | No internals were leaking. Eight *unused* exported types were, which is the same footgun from the other direction. |

Bugs found while fixing other things, which is where most of the real defects
came from:

- `--font-size-xs` was never defined — a missing semicolon swallowed it, and 8
  components silently lost their font size.
- ListView rendered rows and header cells with no React `key`.
- RadioGroup's arrow-key selection never reached the consumer: it dispatched a
  native `change` event, which React does not use to derive a radio's onChange.
- Scrollbar's thumb could not be dragged at all by consumers using the new
  `onValueChange`, and its listeners re-attached on every frame of a drag.
- `id || useId()` short-circuited the hook in three components.
- The bundled font shipped with no licence (lost in a directory rename).
- `data-numControls` was invalid attribute casing, so three CSS rules never
  matched.
- 16 of the 21 documented component CSS custom properties were read by nothing.

### Verified fixed and closed in this pass
Everything else, including the whole build pipeline (#68–#74, #101, #109,
#112–#114), the token layer (#59–#66, #102–#106, #110, #111), Window (#21–#27,
#54, #98), Dialog (#28–#31, #117), MenuBar (#32–#37, #40, #100), ListView
(#48, #51–#53, #83), Tabs (#39, #50, #85, #116), Button (#90–#92, #96, #99,
#115, #123), Select (#38, #49), and testing (#77–#79, #95).
