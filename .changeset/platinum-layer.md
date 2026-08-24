---
'@liiift-studio/mac-os9-ui': minor
---

Add **Platinum** — a framework-agnostic layer. The Mac OS 9 interface from Vue,
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
