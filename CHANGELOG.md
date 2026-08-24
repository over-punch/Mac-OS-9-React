# @liiift-studio/mac-os9-ui

## 2.5.1

### Patch Changes

- e7b5e2d: Extract the behaviour the React components and the framework-free `platinum`
  modules share into one framework-free core, so there is a single implementation
  of each decision rather than two that can drift.

  Nothing about the public API changes, and no behaviour changes — every existing
  component test passes untouched, which is the evidence for that claim.

  | Core module  | Owns                                              | Now used by                        |
  | ------------ | ------------------------------------------------- | ---------------------------------- |
  | `repeat`     | Hold-to-repeat timing                             | `LittleArrows`, `stepper()`        |
  | `openDelay`  | Delayed open, immediate close                     | `BalloonHelp`, `balloon()`         |
  | `navigation` | Index stepping and wrapping over a skippable list | `Tabs`, `ContextualMenu`, `menu()` |

  `REPEAT_DELAY`, `REPEAT_INTERVAL` and `OPEN_DELAY` were each written down in two
  files. Nothing was wrong yet — which is the point, because the next edit to one
  of them would have been.

  `Tabs` gains the most: four hand-rolled `while` loops, each re-deriving "skip
  the disabled ones and wrap at the ends", are now three calls to the same
  function the menus use.

  `src/test/core-boundary.test.ts` keeps the boundary honest. It fails if the core
  imports React, if it reaches for `document` or `window`, if one of the shared
  timings is re-declared as a literal elsewhere, or if a core module ends up with
  only one consumer — a core with one consumer is not shared code, it is
  indirection.

## 2.5.0

### Minor Changes

- 2dec532: Add **Platinum** — a framework-agnostic layer. The Mac OS 9 interface from Vue,
  Svelte, Astro, htmx or a hand-written page, with no React involved.

  ```js
  import '@liiift-studio/mac-os9-ui/tokens';
  import '@liiift-studio/mac-os9-ui/platinum.css';
  import { disclosure, menu, balloon, stepper } from '@liiift-studio/mac-os9-ui/platinum';
  ```

  **`platinum.css`** is the paint: twenty hand-written class names, all prefixed
  `mac-`, every value drawn from the design tokens. Unlike the CSS-module names
  the React components use — content-hashed and different every build — these are
  a public API. They are versioned with the package and renaming one is a
  breaking change; `src/test/platinum.test.ts` holds the list so that promise is
  enforced rather than stated.

  **`platinum`** is the behaviour, which is the point. A CSS-only kit hands you
  the half that matters least: a div that looks like a button is not a button.
  These are plain DOM modules — no framework, no dependencies, about 12 kB
  unminified for all four — covering the controls where CSS alone produces
  something that looks right and announces wrong:

  - `disclosure()` — toggles `aria-expanded` **and** the region's `hidden`, which
    is the part people forget, and adopts the state the markup already declares so
    a server-rendered open section survives hydration.
  - `menu()` — arrow navigation that skips separators and disabled items, Escape,
    outside-press dismissal.
  - `balloon()` — opens on focus as well as hover, describes its trigger with
    `aria-describedby` rather than renaming it, dismisses on Escape.
  - `stepper()` — hold-to-repeat after a pause, and stops when the pointer leaves;
    a pointer released outside the button never fires `pointerup` on it, which is
    how that kind of repeat runs forever.

  They are built separately from the React bundle so they carry no `"use client"`
  banner — putting an RSC directive on framework-free code would be a lie about
  what it is, and would stop a server component importing something it can import
  fine.

  The harder controls — the focus trap, the roving tabindex, the listbox with
  type-ahead, the tree — remain React-only, and
  [docs/without-react.md](https://github.com/Liiift-Studio/Mac-OS-9-React/blob/main/docs/without-react.md)
  says so plainly rather than implying otherwise.

## 2.4.0

### Minor Changes

- Add `BalloonHelp`, `TreeView` and `ContextualMenu` — the recognisable Mac OS 9
  elements that sit outside Apple's Controls chapter.

  **`BalloonHelp`** is the balloon from Help › Show Balloons, including the global
  switch that gated it: wrap a tree in `BalloonHelpProvider` and you get the Help
  menu's toggle. Leave it out and balloons work, because a tooltip that silently
  does nothing by default is a worse trap than a missing period detail.

  The accessibility is the part the original had no answer for. Hover-only help is
  invisible without a pointer, so this opens on focus too, describes its trigger
  with `aria-describedby` rather than replacing its name, and dismisses on Escape
  without moving focus.

  **`TreeView`** is Finder's list view. It is a separate component rather than a
  mode on `ListView` because the two are different ARIA patterns, not two looks at
  one: `ListView` is a multi-selectable listbox of options with no way to express
  depth, while a tree is `treeitem` with `aria-level` and nested groups. Right
  opens a folder then steps into it, Left closes it then steps out, and the whole
  tree is one tab stop. `children: []` is an empty folder that keeps its triangle;
  omitting `children` is a leaf that never had one.

  **`ContextualMenu`** fills a real hole — the library had no `contextmenu`
  handling anywhere. It opens on right-click, and on the ContextMenu key or
  Shift+F10 anchored to the focused element, because a menu reachable only by
  right-click is unreachable without a pointer. Separators are skipped by the
  arrow keys, the menu clamps into the viewport, scrolling dismisses it, and
  closing returns focus to where it came from.

  Also fixes `GroupBox`'s title, which stacked above the box instead of being set
  into its border. The etched groove is meant to pass behind the words, and that
  is most of what makes it read as Platinum.

  The `--z-index-tooltip` and `--z-index-popover` tokens have been defined and
  unused since the beginning. They now have consumers.

## 2.3.0

### Minor Changes

- e1c44e7: Close the remaining gap against Apple's Mac OS 8/9 Control Guidelines: nine new
  controls, and one correction to `Window`.

  Measured against chapter 2 of Apple's own Human Interface Guidelines — the list
  the Platinum appearance was actually built from — the library covered 13 of its
  24 controls. It now covers all of them.

  **New:** `GroupBox`, `WindowHeader`, `Slider`, `LittleArrows`, `Placard`,
  `ImageWell`, `ChasingArrows`, `BevelButton`, `ClockControl`.

  A few of these are more opinionated than their names suggest:

  - **`GroupBox`** is a real `fieldset`/`legend`, which is what gets the grouping
    to assistive technology; a `div` with a heading looks the same and announces
    nothing. A disabled group deliberately does not disable its own fieldset — a
    checkbox title is how you switch the group back on.
  - **`Slider`** treats tick marks as behaviour rather than decoration. A ticked
    slider snaps to its ticks, and its thumb is pointed rather than rounded to
    say so.
  - **`Placard`** renders a `span` until you give it an `onClick`. A readout
    rendered as a button takes Tab focus, invites a press and does nothing.
  - **`ImageWell`** is a button first and a drop target second, because a
    drop-only well is unusable by keyboard and by anyone who cannot drag.
  - **`ChasingArrows`** claims no progress value and renders nothing when
    inactive. Under `prefers-reduced-motion` it pulses rather than freezing: the
    animation is the control, and a still spinner reads as stalled work.
  - **`BevelButton`**'s `behaviour` prop picks its semantics, so a radio
    announces as a radio rather than as a button that looks pressed. For a plain
    push button with an icon, `IconButton` remains the smaller thing.

  **`Window` gains `onCollapse` and `onZoom`.** `onMinimize` and `onMaximize`
  still work and are deprecated for removal in 3.0. Mac OS 9 had no dock and no
  taskbar, so nothing was ever minimised: the collapse box rolled a window into
  its own title bar, and the zoom box fitted it to its contents. The buttons had
  been announcing "Minimize" and "Maximize" to screen readers for behaviour the
  system never had.

## 2.2.1

### Patch Changes

- 0a4c93f: Fix `Dialog` dropping focus to `<body>` on close instead of returning it to the
  element that opened it.

  The element to restore to was captured in a passive effect. React runs every
  layout effect before any passive effect, so `initialFocus` had already moved
  focus into the dialog by the time the capture ran — what got saved was the
  dialog's own button, which is detached once the dialog closes. The
  `isConnected` guard then correctly declined to focus a detached node, and focus
  fell to `<body>`.

  For a keyboard or screen-reader user this meant closing any dialog dropped them
  at the top of the document with no way back to where they were. It affected
  every `Dialog`, and so also `Alert`, which builds on it.

  The capture now runs in a layout effect declared before the one that moves
  focus. Two tests cover it — one for the default case and one for an explicit
  `initialFocus`, which is the path that made the ordering matter.

## 2.2.0

### Minor Changes

- ed98175: Add Progress, Alert, DisclosureTriangle and Separator — four Mac OS 9 controls the library was missing.

  **Progress** — a determinate bar, or the indeterminate barber pole: the diagonal
  stripes Mac OS 9 showed when the length of the work was unknown. `value` decides
  which, and it has no default, because a default would render a claim about
  progress nobody made. An indeterminate bar omits `aria-valuenow` entirely rather
  than reporting 0 — the absence is what tells assistive technology the length is
  unknown.

  **Alert** — the Mac OS 9 alert arrangement, which was fixed for a reason: the
  severity icon told you what kind of alert it was before you read anything, and
  the buttons were always bottom-right with the default rightmost. A thin compound
  over `Dialog`, so the focus trap, scroll lock, Escape handling and focus restore
  come from there unchanged. Renders as `role="alertdialog"` and focuses the
  confirming button, so Return commits and Escape cancels. The four severity icons
  were already in the registry; nothing composed them.

  **DisclosureTriangle** — the expand triangle from Finder lists and dialog
  sections. The glyphs have been in the registry from the start, their doc comments
  literally reading "disclosure triangle", but there was no control — so every
  consumer rebuilt the button, the rotation and the `aria-expanded` wiring by hand.
  It is a real `<button>`: it toggles, it is keyboard operable, and it owns another
  element's state.

  **Separator** — the engraved rule. Two 1px lines rather than one, a dark line
  above a light one, which is what makes it read as cut into the surface rather
  than drawn on top. Decorative by default, since a rule that merely groups things
  visually is noise when announced; pass `decorative={false}` where it genuinely
  divides.

## 2.1.1

### Patch Changes

- Fix three defects: a window that resized when you grabbed it, and two found while filling coverage gaps.

  A `Window` switches to `position: absolute` the moment a drag starts. Any width
  it was inheriting — a grid cell, a flex child, a `width: 100%` rule — then
  resolved against the positioned ancestor instead, so the window visibly jumped
  to a different size as you touched the title bar. It now measures itself once
  at the start of the gesture and keeps the size it already had.

  `maxWidth` and `maxHeight` now constrain layout as well as resizing. They were
  passed to the resize hook and nowhere else, so the props only took effect once
  you dragged the grow box.

  `Button` with `asChild` called `React.Children.only`, which throws on anything
  that is not exactly one element — taking down the consumer's tree, and throwing
  before the component's own `isValidElement` check could run, so its friendlier
  error message and `return null` were unreachable. It now counts children
  instead and fails soft: a development error naming what it received, and
  nothing rendered.

  `FolderList` declared `classes.window` and `classes.titleBar` but forwarded
  neither, so setting either did nothing. Both now reach the underlying `Window`.
  `FolderList` also reached the content area through `Window`'s
  `contentClassName`, which 2.0 deprecated — so every `FolderList` render logged a
  deprecation warning about a prop the consumer had never passed and could not
  stop passing. It goes through `classes` now.

## 2.1.0

### Minor Changes

- Fix `MenuItem`'s role for checkable items, and add `selection` for mutually exclusive sets.

  `role` was derived from the _value_ of `checked`, so an item with
  `checked={false}` announced as a plain `menuitem` — indistinguishable from a
  command — and its role changed under the user each time they toggled it. The
  role now follows whether the item is checkable at all: setting `checked` to
  anything, `false` included, makes it a `menuitemcheckbox`, and `aria-checked`
  is always present. Leaving `checked` undefined still gives a plain `menuitem`.

  New `selection?: 'checkbox' | 'radio'` on `MenuItem` and `MenuItemData`. A set
  of flavours, view modes or sort orders — where exactly one is on — should be
  `'radio'`, so it announces as `menuitemradio` rather than telling a
  screen-reader user they can switch several on at once.

  This is a behaviour change for anyone matching on `getByRole('menuitem')` for
  an item that passes `checked={false}`; it is now `menuitemcheckbox`.

## 2.0.0

> **Never published.** The version was cut and the changes merged, but the npm
> token had expired, and 2.1.0 shipped before it was replaced. Everything below
> is in 2.1.0 — upgrading from 1.x goes straight there, and these are still the
> breaking changes you are migrating across.

### Major Changes

- Remove everything 1.x deprecated, and split `Menu.items` into data and JSX props.

  **Removed — camelCase ARIA aliases.** `ariaLabel`, `ariaLabelledBy`,
  `ariaDescribedBy` and `ariaPressed` are gone from Button, Checkbox, Dialog,
  ListView, Radio, RadioGroup, Scrollbar, Tabs and TextField. Use the standard
  hyphenated attributes, which React passes through unchanged.

  **Removed — value-shaped `onChange`.** `RadioGroup`, `Scrollbar` and `Tabs`
  report a value, so `onValueChange` is now the only name they answer to.
  `Tabs.onValueChange` leads with the value: `(value, index)`.

  **Removed — single-purpose `*ClassName` props.** `TextField.wrapperClassName`,
  `Tabs.tabListClassName`, `Tabs.panelClassName`, `MenuBar.dropdownClassName`,
  `MenuDropdown.dropdownClassName`, `Dialog.backdropClassName` and
  `Dialog.dialogClasses` all fold into the typed `classes` object.

  **Changed — `Menu.items` splits into `items` (data) and `content` (JSX).** The
  1.x union was disambiguated at runtime by asking whether the first array element
  was a React element, which mis-read `items={[<MenuItem />]}` as data and rendered
  an empty menu with no error. The JSX-valued `items` prop on `MenuItem` and
  `MenuDropdown` is likewise now `content`, so across the MenuBar family `items`
  always means data and `content` always means JSX. A menu whose `items` is `[]`
  opens no dropdown rather than an empty `role="menu"` panel.

  **Deprecated — `Window.contentClassName`.** The one `*ClassName` prop that was
  never marked deprecated in 1.x, so it could not be removed here. It warns
  through 2.x and goes in 3.0. Use `classes.content`.

  Internal: `src/utils/aria.ts` (`resolveAria`, `LegacyAriaProps`) is deleted; it
  existed only to resolve the ARIA aliases and was never exported from the root.

## 1.0.0

### Major Changes

- First stable release.

  The API is settled, and that is what this version number means. Every
  convention the library had more than one of now has exactly one, and each is
  stated where you would look for it:

  - **ARIA** — every component takes the standard `aria-label`,
    `aria-labelledby`, `aria-describedby` and `aria-pressed`.
  - **Callbacks** — `onChange` is the native DOM event, on the components that
    wrap a native input. `onValueChange` is the parsed value, on the components
    that report one.
  - **Styling** — every component takes a typed `classes` object naming its real
    slots, and every value it draws with is a CSS custom property in three tiers.
  - **Disabled** — an element with a native `disabled` attribute uses that alone;
    one without carries `aria-disabled`.
  - **Controlled state** — every controllable prop pairs `X` with `defaultX`.

  Deprecated names from the 0.x API — `ariaLabel` and friends, the value-shaped
  `onChange` on RadioGroup, Scrollbar and Tabs, `wrapperClassName`,
  `dialogClasses` and the other single-purpose className props — all still work,
  warn once in development, and will be removed in 2.0.

  Beyond the conventions: `ListView` and `Select` are keyboard operable where
  they were pointer-only, tree-shaking actually works (a single-component import
  is 3 KB rather than 69 KB), the fonts are subset so an ASCII page fetches 38%
  of what it did, and there are 359 tests including an axe sweep over every
  component and WCAG contrast assertions against the palette.

- 6a38916: Rebuild Select as a real listbox, make ListView keyboard operable, and add a
  window manager.

  **Breaking**

  - `Select` no longer renders a native `<select>`. It is a button plus a
    `role="listbox"` popup, so the whole control is themeable — previously the
    open option list was drawn by the operating system. `onChange` is replaced by
    `onValueChange`, which receives the value rather than a DOM event and is
    generic over it. Option groups move from `<optgroup>` to a `group` field on
    each option. A hidden input preserves native form submission and `FormData`.
  - `ListView` rows are now listbox options. If you were spreading
    `RowDefaultProps` onto a custom element via `renderRow`, it now carries
    `role`, `aria-selected`, `tabIndex`, `onKeyDown` and `id` as well.
  - `Button` no longer sets `aria-disabled` on its `<button>` branch; the native
    `disabled` attribute is authoritative there. The anchor and `asChild`
    branches still set it.

  **Added**

  - `WindowManagerProvider` coordinates z-order across several windows: they
    raise on interaction and resolve `active` to "topmost in the stack".
  - `Select` and `Tabs` are generic over the option value and tab id.
  - `useOutsideClick` and `useMenuPosition` are exported.
  - `ListView` gains `ariaLabel` / `ariaLabelledBy` and full keyboard navigation:
    arrow keys, Home/End, Shift-extend, Enter to open, Space to select.
  - The icon registry helpers — `getAllIconNames`, `getIcon`, `hasIcon`,
    `iconRegistry`, `createPixelIcon` — are exported from the package root.

  **Fixed**

  - `ListView` was pointer-only, a WCAG 2.1.1 Level A failure. Rows and sortable
    headers are now keyboard operable.
  - `RadioGroup` declared `aria-orientation` but applied no layout, so its radios
    ran together inline and `orientation` had no visible effect.
  - The bundled Pixel Operator licence is published alongside the font files. It
    was lost when the font directory was renamed, so the package had been
    redistributing the typeface with no licence.
  - 16 of the 21 documented per-component CSS custom properties were not read by
    any component. They are all wired now, with defaults that preserve the
    current appearance.

- 48aa577: Fix the design-token layer, window interaction model, and build pipeline.

  **Fixed**

  - `--font-size-xs` was never defined. A missing semicolon after `--font-bold: 700`
    swallowed the declaration that followed it, so every rule using
    `var(--font-size-xs)` — in Button, Select, TextField, Tabs, Radio, Checkbox,
    ListView and IconButton — silently fell back to the inherited size.
  - Fonts were emitted twice: once content-hashed by `postcss-url`, once by the
    copy plugin. They now ship once, at stable paths that match both the CSS
    references and the public `./fonts/*` export subpath.
  - The font-path rewrite plugin opened a double quote it never closed, producing
    malformed CSS for any single-quoted or unquoted `url()`. The rewrite now
    happens at the `postcss-url` layer and the plugin is gone.
  - The rollup `copy` targets pointed at `src/fonts/pixelOperator`, a directory
    that does not exist, so no fonts were copied to `dist` at all.
  - `Window` discarded a `position` prop supplied after mount until the first drag.

  **Changed**

  - Window drag and resize now coalesce pointer moves into one
    `requestAnimationFrame` tick, and the `offsetParent` rect is measured once per
    gesture instead of on every move.
  - Window drag and resize are keyboard operable: focus the title bar or the grow
    box and use the arrow keys (Shift for a 10× step). Satisfies WCAG 2.1.1.
  - New `zIndex` and `onActivate` props on `Window` for click-to-front across
    several windows.
  - Design tokens are reorganised into three tiers — primitives, semantics, and
    per-component hooks such as `--button-bg`, `--window-titlebar-bg` and
    `--menu-highlight-bg` — so a single component can be retargeted without
    overriding the whole palette.
  - Hardcoded colours in MenuBar, MenuItem and Window now resolve through tokens.
  - `typography.fontFamily` in the TypeScript token export described Charcoal,
    Geneva, Chicago and Apple Garamond — none of which the library loads. It now
    mirrors the CSS custom properties exactly, and `fontSize` is in rem to match.
    `typography.fontFamily.chicago` is removed; `title`, `pixel` and `pixelSmall`
    are added.
  - `font-display` for the bundled Pixel faces is `block` rather than `swap`,
    which avoids a full-page reflow when a bitmap face swaps in.
  - `-webkit-font-smoothing: antialiased` is no longer applied to `<html>` by
    `base.css`; it blurred the pixel faces the library exists to render.
  - Source maps are no longer published, and the intermediate `dist/types` tree is
    removed after the declaration bundle is built.
  - Removed the unused `tsup` dependency and config. Rollup is the build tool.

  **Added**

  - `@liiift-studio/mac-os9-ui/tokens` — design tokens with no `@font-face`
    declarations and no font downloads, for consumers supplying their own faces.
  - `@liiift-studio/mac-os9-ui/webfonts` — opt-in Google Fonts request.
  - `./package.json` export, which modern resolvers require.

  **Breaking**

  - The Google Fonts `@import` has been removed from the default stylesheet. It
    was a render-blocking third-party request on every consuming page. If your app
    relies on `--font-body`, `--font-title` or `--font-mono` resolving to IBM Plex
    or EB Garamond, add `import '@liiift-studio/mac-os9-ui/webfonts'`, or
    self-host those families. The library's own components never needed them.
  - `typography.fontFamily.chicago` is removed from the token export.

## 0.3.0

### Minor Changes

- Remove global element styles from main stylesheet to prevent overriding consumer project styles

  **Breaking-ish Change:** The main stylesheet (`@liiift-studio/mac-os9-ui/styles`) no longer includes global styles for `html` and `body` elements. This prevents the library from overriding your application's base styles.

  **What Changed:**
  - ✅ CSS variables still global (`:root`)
  - ✅ Fonts still bundled and loaded
  - ✅ Component styles unchanged
  - ✅ Utility classes unchanged
  - ❌ No more global `html` font-size and responsive scaling
  - ❌ No more global `body` margin/padding/font-family/colors
  - ❌ No more universal `box-sizing: border-box` reset

  **Migration:**
  If you want the global Mac OS 9 styling (body background, typography, etc.), import the optional base stylesheet:

  ```tsx
  import '@liiift-studio/mac-os9-ui/styles'; // Required - components & variables
  import '@liiift-studio/mac-os9-ui/base'; // Optional - global html/body styles
  ```

  **Benefits:**
  - Library no longer pollutes consumer applications' global styles
  - More composable - users control their own base styles
  - Easier integration into existing projects
  - Opt-in global styling for full Mac OS 9 experience
  - Better library citizenship

  **New Export:**
  - Added `./base` export for optional global styles (`dist/base.css`)

### Patch Changes

- e27086d: Add draggable and resizable features to Window and FolderList components

  **Draggable Windows:**
  - Added optional `draggable` prop to enable drag-by-title-bar functionality
  - Windows stay in normal document flow until first dragged, then become absolutely positioned
  - Supports both controlled (`position`/`onPositionChange`) and uncontrolled (`defaultPosition`) patterns
  - Added `WindowPosition` type to common exports
  - Title bar shows grab cursor when draggable is enabled
  - Window control buttons (close, minimize, maximize) do not trigger drag
  - Fixed mouse position offset issue by calculating positions relative to parent container

  **Resizable Windows:**
  - Implemented fully functional window resizing via resize handle
  - Added `onResize` callback to track size changes
  - Added `minWidth`, `minHeight`, `maxWidth`, `maxHeight` props for size constraints
  - Resize handle in bottom-right corner with nwse-resize cursor
  - Default minimum size: 200×100px
  - Smooth resize with real-time dimension updates

  **Compatibility:**
  - Fully backward compatible - both features default to false
  - Windows can be both draggable and resizable simultaneously
  - FolderList component inherits both features automatically

## Unreleased

### Minor Changes

- Add comprehensive custom styling and element targeting system
  - **New `classes` prop** on ListView, FolderList, and Window components for targeting sub-elements
  - **Render props** (renderRow, renderCell, renderHeaderCell) for complete rendering control
  - **Cell-level interactions** with onCellClick, onCellMouseEnter, and onCellMouseLeave callbacks
  - **Automatic data attributes** for CSS-only targeting without JavaScript
  - **Internal hover state tracking** for rows and cells
  - All features are fully backwards compatible and opt-in

### Patch Changes

- Add `mergeClasses` and `createClassBuilder` utility functions for class name management
- Export new TypeScript interfaces: ListViewClasses, FolderListClasses, WindowClasses, RowRenderState, RowDefaultProps, CellRenderState, HeaderCellRenderState, HeaderCellDefaultProps
- Add comprehensive Storybook documentation with 9 new stories demonstrating all customization approaches
- Add detailed styling guide documentation in `docs/custom-styling-guide.md`
- Improve responsive typography with mobile-first approach
  - Mobile base: 14px (optimal for small screens)
  - Small mobile (480px+): 15px
  - Tablet (768px+): 16px
  - Desktop (1024px+): 16px
  - Large desktop (1440px+): 18px

## 0.2.22

### Patch Changes

- Add submenu functionality to MenuItem component with hover-to-show support
- Add new submenu-focused Storybook examples demonstrating the items prop
- Rename WithSubmenus story to WithSubmenuIndicators for clarity
- Add comprehensive WithSubmenus story showcasing functional nested menus

## 0.2.21

### Patch Changes

- Fix build configuration where fonts were being copied to a nested `dist/fonts` folder instead of the root `fonts` folder in the distribution.

## 0.2.20

### Patch Changes

- Fix build configuration where fonts were being copied to a nested `dist/fonts` folder instead of the root `fonts` folder in the distribution.
- Updated dependencies
  - @liiift-studio/mac-os9-ui@0.2.20

## 0.2.19

### Patch Changes

- Fix NPM publication issue where font files were excluded by gitignore. Added .npmignore to ensure fonts are included in the package.

## 0.2.18

### Patch Changes

- Fix regression where font paths in CSS were incorrect (referencing dist/fonts instead of fonts).

## 0.2.17

### Patch Changes

- Fix font loading issue by bundling fonts in distribution and correcting import paths.

## 0.1.1

### Patch Changes

- Add React 19 compatibility to peer dependencies

## 0.1.0

### Minor Changes

- Initial release of Mac OS 9 UI Component Library

This is the first public release of the @liiift-studio/mac-os9-ui component library, featuring pixel-perfect Mac OS 9 styled React components.

#### Components Included

- **Form Controls**: Button, Checkbox, Radio, TextField, Select
- **Layout & Chrome**: Window, TitleBar, MenuBar, Tabs, Dialog
- **Lists & Navigation**: ListView, FolderList, Scrollbar
- **Utilities**: Icon, IconButton

#### Features

- Full TypeScript support with type definitions
- Dual ESM/CJS module exports
- Accessible components (WCAG 2.1 AA)
- CSS Modules for scoped styling
- Comprehensive Storybook documentation
- Pixel-perfect Mac OS 9 design fidelity
