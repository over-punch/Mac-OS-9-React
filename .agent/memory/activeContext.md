# Active Context

## Current Focus
2.2.1 is published and the site is deployed. Nothing is in flight.

## Recent Changes (2026-08-24, later)

### Figma kit caught up
All 27 exported components now have pages, across five passes. The twelve added
here: GroupBox, WindowHeader, Slider, LittleArrows, Placard, ImageWell,
ChasingArrows, BevelButton, ClockControl, BalloonHelp, TreeView,
ContextualMenu. Sixteen new Component-tier variables, every one an alias.
**930 bound fills against 1 intentional hardcode.**

Two ordering traps, both now hit more than once and worth remembering:
`resize()` resets sizing modes to FIXED, and `layoutSizingHorizontal = 'FILL'`
throws unless the node is already inside an auto-layout parent. Set both AFTER
appending.

### The kit's type ramp is still the IBM Plex stand-in
Not for want of installed fonts. Figma sees **none** of the local fonts —
not the Pixel faces, and not Jubilat or InputMono either, which have been in
`~/Library/Fonts` far longer. `listAvailableFontsAsync()` returns 8927 fonts,
all of them Google/Figma's own set, before and after a full app restart.

That points at local font access rather than the install: the desktop app reads
system fonts directly, a browser session needs the Figma Font Helper. Worth
checking which surface the MCP is actually attached to before trying again.
The retarget script is written and staged at
`scratchpad/retarget-type-ramp.js` — it moves only the `UI/*` styles, leaving
Title on EB Garamond and code on IBM Plex Mono, because that is what the
library's own tokens say.

## Recent Changes (2026-08-23)

### Dialog was dropping focus to <body> (2.2.1)
Closing any dialog left focus on `<body>` rather than the trigger, so a
keyboard user was dropped at the top of the document. The restore target was
captured in a passive effect, but React runs layout effects first — so
`initialFocus` had already moved focus inside and the dialog saved its own
button, detached by restore time.

Found by driving the deployed site, not by reading the code: the logic reads
correctly in isolation. There was no focus-restore test at all. There are two
now, both confirmed failing beforehand.

### Four new components (2.2.0, PR #153, merged)
Three of the four were already half-present: the four alert severity icons and
both disclosure triangles have been in the icon registry from the start, with
nothing composing them.

- **Progress** carries the determinate/indeterminate distinction in whether
  `value` was passed, not in a boolean, and omits `aria-valuenow` entirely when
  indeterminate.
- **Alert** is a thin compound over `Dialog`, so the focus trap, scroll lock and
  focus restore come from there unchanged.
- **DisclosureTriangle** is a real `<button>` with `aria-expanded`.
- **Separator** draws two 1px lines, dark over light.

452 tests pass across React 18 and 19. Also untracked `dist/index.css` and
`dist/index.js`, which predated the `/dist` gitignore entry and dirtied the tree
on every build.

### Numbers are measured now, not typed
Every size figure in the README was stale — 247 tests against 454, 186 kB
against 228. `npm run measure` (scripts/measure.mjs) prints all of them from the
current dist/, and RELEASING.md points at it. A new test asserts the site's
component index covers every component and lists nothing unexported; the site
had said "Sixteen components" since 2.2.0 took it to twenty, and both counts are
now derived from the index.

### The icon that was chosen by name
`Alert` mapped `stop` to `StopIcon` — the media transport control, a filled
square — where the circular stop-alert glyph is `ErrorIcon`. Every test passed,
because none asserted which picture rendered. Fixed, with two tests that were
confirmed to fail against the original mapping. See [[PITFALLS.md]].

### Figma kit (file `kYzt3CYNfeexsgSbtpKDi9`)
Four new pages under a "——— PASS 3 ———" divider: Progress (6 variants), Alert
(8), DisclosureTriangle (6), Separator (2). Nine Component-tier variables added,
every one an alias so the three tiers stay intact. The barber pole is drawn as
real 45-degree parallelograms at the CSS's own 6px/12px band geometry, not an
approximation. Alert clones Dialog's chrome and instances Button rather than
redrawing either.

Two existing pages were wrong and are fixed:
- **Checkbox** — all 12 checked and mixed boxes had hugged their tick/dash, so
  they rendered as narrow slivers instead of squares.
- **TextField** — the three `State=Disabled` variants had empty text, so the
  state they existed to demonstrate had nothing to render on. The well is now
  greyed to `gray/200` as the CSS does.

The kit is not linked from the README — it is a private Figma file, and
publishing the URL is the owner's call.

## Earlier (2026-08-20)
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
