---
'@liiift-studio/mac-os9-ui': minor
---

Add Progress, Alert, DisclosureTriangle and Separator — four Mac OS 9 controls the library was missing.

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
