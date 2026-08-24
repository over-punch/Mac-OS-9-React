# Platinum gap: build loop — CLOSED

Closing the nine controls the library is missing against Apple's Mac OS 8/9
Human Interface Guidelines, chapter 2 (Control Guidelines) — the list the
original interface was actually built from.

Coverage at the start of the loop, v2.2.1: **13 covered, 9 missing, 2 partial**.

Research and ranking: https://claude.ai/code/artifact/52761d42-3a28-42e0-851d-87062ebf3dfc

## Per-item process

1. `.tsx` + `.module.css` + `index.ts` in `src/components/<Name>/`
2. Export from `src/index.ts`
3. Register a layer in `src/test/architecture.test.ts`
4. Tests, including an axe sweep
5. Storybook story
6. `npm run typecheck && npm run lint && npm test`
7. Commit

Batched at the end rather than per item, because they are cheaper together:
README entries, one changeset, site demo rows, Figma kit pages, `npm run measure`.

## Queue

| # | Control | Status |
|---|---------|--------|
| 1 | `GroupBox` — etched border, primary/secondary, 4 title modes | done |
| 2 | `WindowHeader` — Finder's "12 items, 1.2 GB available" bar | done |
| 3 | `Slider` — with optional tick marks | done |
| 4 | `LittleArrows` — the stacked up/down stepper | done |
| 5 | `Placard` — sunken status nub by the horizontal scroll bar | done |
| 6 | `ImageWell` — image drop target | done |
| 7 | `ChasingArrows` — asynchronous arrows | done |
| 8 | `BevelButton` — push / radio / checkbox / pop-up behaviours | done |
| 9 | `ClockControl` — date-time field with little arrows | done |
| 10 | `Window` collapse/zoom naming — additive, deprecate old for 3.0 | done |

## Reevaluate at the end

- Re-measure coverage against the same HIG chapter; the table should read
  22 covered, 0 missing, 2 partial/n-a.
- Re-run `npm run measure`; the README's bundle, stylesheet and tarball figures
  will all move with nine new components.
- Update the artifact in place (same URL) with the new numbers.
- Decide what, if anything, is worth a tier beyond this — Balloon Help, a
  hierarchical ListView, contextual menus and Navigation Services are the
  candidates that are recognisable but sit outside the Controls chapter.

---

## Outcome (2026-08-24, v2.3.0)

Coverage re-derived from `src/index.ts`: **23 of 24 covered, 0 missing, 1 n/a**
(static text, which is a `<p>`). 543 tests. Bundle 228 kB → 255 kB, stylesheet
111 kB → 131 kB, tarball 327 kB → 356 kB; a Button-only import is still 3 kB,
so tree-shaking held.

Two things the loop found that were not on the list:

- **Nine dead Storybook links.** The site index links each row to a
  `--docs` page, which Storybook only emits for a story tagged
  `tags: ['autodocs']` (`.storybook/main.ts` sets `autodocs: 'tag'`). All nine
  new stories were missing it. Two tests in `src/test/site-index.test.ts` now
  check it from source.
- **`ClockControl`'s `useCallback` was pointless** — `current` was a fresh
  object each render, so the callback's identity changed anyway. Memoised.

## Still outside the Controls chapter

Recognisable, deliberately not built yet: Balloon Help (the `--z-index-tooltip`
and `--z-index-popover` tokens are still defined and unused), a hierarchical
`ListView` (cheap now that `DisclosureTriangle` exists), contextual menus (no
`contextmenu` handling anywhere), the Control Strip, and Navigation Services —
which is an application surface, not a control.
