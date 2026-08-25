---
'@liiift-studio/mac-os9-ui': minor
---

Extend the framework-agnostic layer with `focusTrap()`, and give it and the
React `Dialog` one shared implementation.

A focus trap is the difference between a modal and a div that looks like one,
and it was the most-cited thing `docs/without-react.md` had to apologise for.
It is now available without a framework:

```js
import { focusTrap } from '@liiift-studio/mac-os9-ui/platinum';

const trap = focusTrap(dialogElement, {
	initialFocus: '[data-confirm]',
	onEscape: () => close(),
});
// …when the dialog is dismissed:
trap.destroy();
```

Tab cycles inside the container, Shift+Tab cycles backwards, Escape is reported
rather than acted on (the trap does not own the container's visibility), focus
returns to wherever it came from, and stacked traps coordinate so only the
topmost responds — without that, two open dialogs both handle Escape and the
outer closes underneath the inner.

The rules for what counts as focusable moved to `src/core/focus` and are now
shared with `Dialog`, which no longer carries its own copy. That covers the
things easy to forget: `contenteditable`, media with controls,
`details > summary`, and the filters for disabled, hidden, `aria-hidden` and
zero-size elements. `tabindex="-1"` is excluded, because it is focusable
programmatically but not tab-reachable, and a trap cycles the tab order.

No behaviour change to `Dialog` — its 27 tests pass untouched, which is the
evidence.
