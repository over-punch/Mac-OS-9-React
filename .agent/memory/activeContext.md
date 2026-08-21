# Active Context

## Current Focus
The panel-review backlog is fully closed — all 124 issues. The package has a
landing site, the README has been rebuilt against what the library actually
does, and CI runs lint, typecheck, build, Storybook and the test suite against
React 18 and 19.

## Recent Changes (2026-08-20)

### Review backlog
Worked the full open issue list rather than a slice of it. Roughly a third were
already fixed on `main` from the earlier critical-fix PR series and had simply
never been closed — those were verified against the current source before
closing, not taken on trust. The rest were fixed here.

The highest-impact single find: `--font-size-xs` was never defined. A missing
semicolon after `--font-bold: 700` in `theme.css` swallowed the declaration that
followed it, so every rule referencing `var(--font-size-xs)` — in Button,
Select, TextField, Tabs, Radio, Checkbox, ListView and IconButton — silently
fell back to the inherited size.

### Reconciling with a parallel effort
A collaborator (Colby May) pushed six branches the same day covering the same
issue list. Every one conflicted with the work here. The decision was: keep this
branch's implementations, port across only what was not duplicated. Landed from
those branches: the Select listbox rewrite, Select/Tabs generics,
`useOutsideClick`, `useMenuPosition`, and `WindowManagerProvider`. The six
branches remain unmerged; #41, #55 and #88 carry comments pointing at them.

### Structural changes
- **Tokens** reorganised into three tiers (primitives → semantics →
  per-component hooks). 16 of the 21 documented component hooks were not read by
  any component; all are wired now, with defaults preserving the prior look.
- **Styles** split into `fonts.css` / `tokens.css` / `theme.css`, with new
  `/tokens` and `/webfonts` entry points. The Google Fonts `@import` is out of
  the default stylesheet.
- **Icons**: the registry was a one-icon stub with five empty category files.
  It now holds 39 icons built from character maps via `createPixelIcon`.
- **Tests**: 247, up from 26. Includes an axe sweep over every rendering
  component and WCAG contrast assertions against the palette.
- **Site**: `site/` is a Vite app built out of the library itself, deployed to
  Pages at the root with Storybook moved under `/storybook/`.
- **CI**: a new workflow runs lint, typecheck, build, site build and Storybook
  build, plus the test suite against React 18 and 19 — the peer range had never
  been exercised.

## Active Decisions
- **Selection in ListView is controlled only.** No `defaultSelectedIds`. Worth
  revisiting for consistency with the `X` / `defaultX` pairing used elsewhere.
- **Stories are excluded from `tsc`.** Storybook's `Meta<typeof T>` cannot
  express the polymorphic Button. Story breakage is caught by building Storybook
  in CI instead.
- **`--font-weight-normal` stays 700.** Mac OS 9's system face reads as bold and
  matching it is the point; `--font-weight-regular` was added for the 400 face.

## Next Steps
1. **Release.** `main` contains a breaking change (`Select`) that is not on npm.
   The README says so explicitly. Two changesets are staged.
2. Colby's six branches are still unmerged and now fully superseded — every
   issue they targeted is closed, with the useful parts ported across. They can
   be deleted once he has looked at them.
3. 352 tests across 20 files. Coverage thresholds are a ratchet in
   vitest.config.ts; raise them as coverage grows.
