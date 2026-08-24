---
'@liiift-studio/mac-os9-ui': patch
---

Extract the behaviour the React components and the framework-free `platinum`
modules share into one framework-free core, so there is a single implementation
of each decision rather than two that can drift.

Nothing about the public API changes, and no behaviour changes — every existing
component test passes untouched, which is the evidence for that claim.

| Core module | Owns | Now used by |
| --- | --- | --- |
| `repeat` | Hold-to-repeat timing | `LittleArrows`, `stepper()` |
| `openDelay` | Delayed open, immediate close | `BalloonHelp`, `balloon()` |
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
