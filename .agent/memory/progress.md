# Progress: Mac OS 9 UI Component Library

**Version:** 0.3.3
**Last synced:** 2026-05-27

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
