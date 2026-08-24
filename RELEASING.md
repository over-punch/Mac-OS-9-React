# Releasing

CI covers a lot: lint, typecheck of both programs, the library build, the site
build, the Storybook build, 650 tests across React 18 and 19, and axe-core
against every exported component on every run.

This file is the part CI cannot do. Automated accessibility rules catch roughly
a third of WCAG; the gate below is the other two thirds, plus the handful of
things that have shipped wrong before.

**Several items that used to live here are now tests.** They sat unticked for
six releases because nobody could action them in a hurry, which is how a
checklist becomes decoration. `src/test/a11y-gate.test.ts` now asserts that
every focusable component defines a focus style, that everything which animates
answers `prefers-reduced-motion`, and that everything carrying a bevel has a
`prefers-contrast` fallback — a box-shadow disappears in forced-colours mode.
What is left below genuinely needs eyes or a screen reader.

---

## Manual accessibility gate

Run before any minor or major. Nothing here is checkable by axe.

- [ ] **Keyboard-only pass.** Tab through the site and Storybook without
      touching the mouse. Every interactive element is reachable, in a sensible
      order, and nothing is a trap — `Dialog` releases on Escape, `MenuBar`
      returns focus to its trigger, `Window` gives focus back after a close.

      Not automatable, and not for want of trying: a headless or automated
          browser reports `document.visibilityState` as hidden, which means
          programmatic `.focus()` fires no focus event, synthetic Tab presses do
          not move focus, and `:focus-visible` never matches because it only
          applies to keyboard-initiated focus. This one needs a real window.

- [x] **Focus is always visible.** Now asserted by `a11y-gate.test.ts` for every
      focusable component. The test proves a focus style is _defined_; whether
      it is _legible_ against a given background still needs eyes, so glance at
      it while doing the keyboard pass above.
- [ ] **Screen-reader pass** on at least one of VoiceOver / NVDA. Check the
      things automation cannot judge: does the announced name of a control
      match what it appears to do, does a menu announce its checked state, does
      a sortable column header say which way it is sorted.
- [ ] **Zoom to 200%** and confirm nothing is clipped or overlapping.
- [x] **`prefers-reduced-motion`** — every component that animates is asserted
      to answer it. Still worth confirming the _site's_ zoom is skipped, which
      is site behaviour rather than component CSS.
- [x] **`prefers-contrast: high`** — every bevelled component is asserted to
      have a real-border fallback. Whether the resulting pairs are legible is
      still a judgement call.
- [ ] **Touch targets.** The library ships Mac OS 9 metrics and is deliberately
      below the 44px guideline — see the note in the README. Confirm the docs
      still say so, and that the site's own controls (which are not bound by
      the aesthetic) are not.

## Content

- [ ] Every number in the README was measured on this build, not carried over.
      Run `npm run measure` after `npm run build` — it prints the bundle,
      stylesheet and tarball sizes, the tree-shaking figures and the icon
      count. Do not type any of them from memory. The test count comes from
      `npm test`.
- [ ] Every link in the site's menus goes somewhere that exists. Click all of
      them; three of them silently did nothing once.
- [ ] Every code sample in the README is in `src/__readme_check__/snippets.tsx`
      and therefore compiles. If you added a sample, add it there.
- [ ] `CHANGELOG.md` describes behaviour changes a consumer can observe, not
      the commits that produced them.

## Package

- [ ] `dist/` contains `index.js`, `index.d.ts` and `index.d.cts`, and
      `dist/cjs/index.cjs` — the CJS build is nested, and the `exports` map
      points there. The checklist said `dist/index.cjs` for three releases.
- [ ] `files` is still `["dist", "README.md", "LICENSE", "ATTRIBUTION.md"]` —
      `assets/` and `site/` must not be in the tarball.
- [ ] `dependencies` is still empty. Anything new belongs in `peerDependencies`
      or `devDependencies`.
- [ ] Build from a clean checkout, not an incremental one. A stale `dist/types`
      has hidden a broken declaration bundle before.
- [ ] Install the packed tarball into an empty directory and import from it.
      Grep the shipped `.d.ts` for anything the release was supposed to remove.

## Ship

- [ ] Version bumped via `npx changeset version`, not by hand.
- [ ] Tag the release commit — `git tag -a vX.Y.Z` — and push the tag. The
      repo went three published versions with no tags at all.
- [ ] After publishing, confirm the registry actually has it:
      `npm view @liiift-studio/mac-os9-ui version`.

---

## Notes

**The npm token.** Publishing runs from `.github/workflows/publish-npm.yml`,
which verifies the token before doing any work — it fails in seconds with an
annotation naming `NPM_TOKEN` rather than a minute later with a `404` on the
`PUT`. npm answers an unauthorized publish with 404 rather than 403 so as not
to leak whether a package exists, which is why three releases in a row failed
with an error that read like the package was missing.

**Registry READMEs are stale until the next publish.** Pushing to GitHub
updates the repo, not the npm page. Images render either way because the README
uses absolute `raw.githubusercontent.com` URLs; the _text_ lags.

See [`PITFALLS.md`](./PITFALLS.md) for the running list of things that have
gone wrong and what to do instead.
