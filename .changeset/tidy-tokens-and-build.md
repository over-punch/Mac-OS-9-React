---
'@liiift-studio/mac-os9-ui': minor
---

Fix the design-token layer, window interaction model, and build pipeline.

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
