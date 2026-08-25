# Using the look without React

There is a published, framework-agnostic layer. You do not have to copy CSS out
of this document any more.

```js
import '@liiift-studio/mac-os9-ui/tokens';
import '@liiift-studio/mac-os9-ui/platinum.css';
import { disclosure, menu, balloon, stepper } from '@liiift-studio/mac-os9-ui/platinum';
```

Two halves, and the second is the point.

**`platinum.css`** is the paint: hand-written class names, all prefixed `mac-`,
every value from the design tokens. Unlike the CSS-module names the React
components use — which are content-hashed and change every build — **these are
a public API.** They are versioned with the package, and renaming one is a
breaking change. `src/test/platinum.test.ts` holds the list, so that promise is
enforced rather than merely stated.

**`platinum`** is the behaviour: plain DOM modules, no framework, no
dependencies, and no `"use client"` banner — the React build stamps one on
every file it emits, and putting an RSC directive on framework-free code would
be a lie about what it is. They attach to markup you write yourself, which is
what keeps them usable from Vue, Svelte, Astro, htmx or a hand-written page.
Each returns a handle with `destroy()`, so a framework's teardown has something
to call.

About 12 kB unminified for all four behaviours, and nothing imports React.

### One implementation, two adapters

The behaviour modules are not a reimplementation of the React components. Both
sit on the same framework-free core in `src/core`:

| Core module  | Owns                                              | Used by                              |
| ------------ | ------------------------------------------------- | ------------------------------------ |
| `focus`      | What counts as focusable, and where Tab goes next | `Dialog` · `focusTrap()`             |
| `repeat`     | Hold-to-repeat timing                             | `LittleArrows` · `stepper()`         |
| `openDelay`  | Delayed open, immediate close                     | `BalloonHelp` · `balloon()`          |
| `navigation` | Index stepping and wrapping over a skippable list | `Tabs` · `ContextualMenu` · `menu()` |

That matters to you because it is what stops the two halves drifting. When the
hover delay changes, it changes in one place and both get it — rather than the
React tooltip waiting 400ms while the framework-free one waits 300 because
somebody only edited one file.

The core imports no framework and touches no DOM, which
`src/test/core-boundary.test.ts` enforces: it fails if a React import appears,
if `document` or `window` is reached for, or if one of the shared timings is
re-declared as a literal anywhere else.

---

## A worked example

```html
<button class="mac-disclosure" id="adv" aria-expanded="false" aria-controls="advanced">
	<span class="mac-disclosure__triangle"></span>Advanced
</button>
<div id="advanced" hidden>…</div>
```

```js
import { disclosure } from '@liiift-studio/mac-os9-ui/platinum';

const handle = disclosure(document.getElementById('adv'));
// handle.destroy() when the component unmounts.
```

The module toggles `aria-expanded` and the region's `hidden` — the second being
the bit people forget, which leaves a collapsed region still reachable by Tab.
It also adopts whatever state the markup already declares, so a server-rendered
open section survives hydration instead of snapping shut.

### The behaviours

| Module                       | What it gives you                                                                                                           |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `disclosure(button)`         | Toggle, kept in step with the region's `hidden`                                                                             |
| `menu(element, opts)`        | Arrow navigation that skips separators and disabled items, Escape, outside-press dismissal, `data-active` for the highlight |
| `balloon(trigger, opts)`     | Opens on focus **and** hover, `aria-describedby` rather than a renamed trigger, Escape to dismiss                           |
| `focusTrap(container, opts)` | Tab cycles inside, Escape reports, focus returns to where it came from, stacked traps coordinate                            |
| `stepper(element, opts)`     | Hold-to-repeat after a pause, and stopping when the pointer leaves                                                          |

### The classes

`mac-root` · `mac-text` · `mac-bevel` · `mac-well` · `mac-button` ·
`mac-bevelbutton` · `mac-field` · `mac-input` · `mac-groupbox` ·
`mac-separator` · `mac-windowheader` · `mac-placard` · `mac-progress` ·
`mac-chasing` · `mac-disclosure` · `mac-littlearrows` · `mac-menu` ·
`mac-menuitem` · `mac-balloon` · `mac-window`

Reduced-motion and high-contrast answers are built into the layer, applied once
across it rather than per component.

---

## Rolling your own instead

If you would rather not take the layer, the recipes below are the same CSS
written out, so you can lift just the parts you want. Every token they use is
asserted to exist in the published `tokens.css`.

## What you can do with CSS alone

These controls have no state, no keyboard contract and no focus management.
Copy the CSS; it is the whole component.

### Separator

Two 1px lines, not one. The dark line is the cut and the light line beneath it
is the light catching its lower edge — together they read as engraved rather
than drawn on.

```css
.p-separator {
	height: 2px;
	border: none;
	border-top: var(--border-width-thin) solid var(--color-border-inset);
	border-bottom: var(--border-width-thin) solid var(--color-gray-100);
}
```

```html
<hr class="p-separator" aria-hidden="true" />
```

Drop the `aria-hidden` and use `role="separator"` only where the rule genuinely
divides two unrelated groups. A rule that merely groups things visually is
noise when announced.

### Group box

The etched border that groups related settings. Use a real `<fieldset>` and
`<legend>`: that is what gets the grouping to assistive technology, and a `div`
with a heading looks identical while announcing nothing.

```css
.p-groupbox {
	position: relative;
	margin: 0;
	padding: 0.6em 0 0;
	border: none;
}

.p-groupbox__title {
	position: absolute;
	top: 0;
	left: var(--spacing-2);
	z-index: 1;
	display: flex;
	align-items: center;
	height: 1.2em;
	padding: 0 var(--spacing-1);
	/* Opaque: this is what breaks the groove where the words are. */
	background: var(--color-background);
	font-family: var(--font-system);
	font-size: var(--font-size-md);
	font-weight: var(--font-weight-bold);
	line-height: 1;
}

.p-groupbox__body {
	padding: var(--spacing-3);
	border: var(--border-width-thin) solid var(--color-border-inset);
	box-shadow: 1px 1px 0 0 var(--color-gray-100);
}
```

```html
<fieldset class="p-groupbox">
	<legend class="p-groupbox__title">Sharing</legend>
	<div class="p-groupbox__body">…</div>
</fieldset>
```

The title is positioned rather than nudged because a `<legend>` ignores a
negative margin. The border must pass through the middle of the text — that is
most of what makes it read as Platinum rather than as a modern card.

### Window header

Finder's information bar. Raised, not sunken: it is a shelf the content sits
below.

```css
.p-windowheader {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: var(--spacing-3);
	padding: var(--spacing-1) var(--spacing-2);
	background: var(--color-background);
	box-shadow: var(--shadow-bevel);
	border-bottom: var(--border-width-thin) solid var(--color-border);
	font-family: var(--font-system);
	font-size: var(--font-size-sm);
	/* Counts and sizes change in place; lining the digits up stops the bar
	   twitching as they do. */
	font-variant-numeric: tabular-nums;
}
```

Do not make it a heading. "12 items" in the document outline is noise, and
headings are how screen-reader users navigate.

### Placard

The sunken status nub beside the horizontal scroll bar.

```css
.p-placard {
	display: inline-flex;
	align-items: center;
	min-height: 15px;
	padding: 0 var(--spacing-2);
	background: var(--color-background);
	border: var(--border-width-thin) solid var(--color-border);
	box-shadow: var(--shadow-inset);
	font-family: var(--font-system);
	font-size: var(--font-size-xs);
	font-variant-numeric: tabular-nums;
	white-space: nowrap;
}
```

Use a `<span>` for a readout and a `<button>` only when pressing it does
something. A readout rendered as a button takes Tab focus, invites a press and
does nothing.

### Bevelled surfaces

The single most reusable thing in the whole system. Raised chrome, and the
inversion that makes it look pressed.

```css
.p-bevel {
	background: var(--color-background);
	border: var(--border-width-thin) solid var(--color-border);
	box-shadow: var(--shadow-bevel);
}

.p-bevel:active,
.p-bevel[aria-pressed='true'] {
	box-shadow: var(--shadow-inset);
	background: var(--color-gray-300);
}
```

Put it on a real `<button>` and you have a Mac OS 9 push button. Put
`aria-pressed` on it and you have a toggle that announces correctly.

### Sunken wells

The counterpart: text fields, list boxes and progress tracks all sit in one.

```css
.p-well {
	background: var(--color-surface-inset);
	border: var(--border-width-thin) solid var(--color-border-inset);
	box-shadow: var(--shadow-inset);
}
```

### Chasing arrows

Apple's asynchronous arrows are pure CSS — the animation is the control.

```css
.p-chasing {
	display: inline-block;
	width: 16px;
	height: 16px;
	/* Stepped, not smooth: the original was frames swapped in sequence, and an
	   eased rotation reads as a modern spinner. */
	animation: p-chase 0.8s steps(8) infinite;
}

@keyframes p-chase {
	to {
		transform: rotate(360deg);
	}
}

/* The animation IS the control, so it cannot simply stop — a frozen wheel
   reads as work that has stalled. */
@media (prefers-reduced-motion: reduce) {
	.p-chasing {
		animation: p-breathe 1.6s ease-in-out infinite;
	}

	@keyframes p-breathe {
		0%,
		100% {
			opacity: 0.3;
		}
		50% {
			opacity: 1;
		}
	}
}
```

Give it `role="status"`, `aria-live="polite"` and an `aria-label` saying what
is happening. "Loading" tells a screen-reader user nothing they had not
guessed.

---

## What you should not do with CSS alone

These are not harder versions of the above. Each one is a keyboard contract, a
focus-management problem, or both, and a CSS-only version is not a simpler
implementation — it is a broken one.

Four of them now have framework-free implementations in `platinum`, marked
below. The rest are still React-only.

| Control                                                    | What CSS cannot give you                                                              |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `Window`                                                   | Pointer _and_ keyboard drag and resize (WCAG 2.1.1), z-ordering across a stack        |
| `Dialog`, `Alert` **— `focusTrap()`**                      | The trap itself is framework-free now; the scroll lock and surrounding chrome are not |
| `MenuBar`, `MenuDropdown`, `ContextualMenu` **— `menu()`** | Roving tabindex, arrow navigation, dismiss on outside press, focus restore            |
| `Select`                                                   | A listbox with type-ahead — the native `<select>` cannot be styled into this shape    |
| `Tabs`                                                     | Arrow-key navigation, `aria-controls` wiring, panel mounting                          |
| `ListView`, `TreeView`                                     | Selection model, shift-range, `aria-level`, expand and collapse                       |
| `Scrollbar`                                                | Proportional thumb, drag maths, Page Up/Down                                          |
| `Slider`                                                   | Arrow/Page/Home/End, pointer capture, tick snapping                                   |
| `LittleArrows`                                             | Hold-to-repeat, and stopping when the pointer leaves the button                       |
| `DisclosureTriangle`                                       | `aria-expanded` on the thing it actually controls                                     |
| `BalloonHelp`                                              | Open on focus as well as hover, Escape to dismiss, `aria-describedby`                 |
| `ClockControl`                                             | Segment selection, wrapping, and keeping display and value apart                      |

The `:checked` and `:has()` tricks that fake some of these produce controls
that look right and announce wrong. A checkbox hack driving a "menu" is still
a checkbox to a screen reader.

---

## The honest summary

If you want the **look**, take `platinum.css`. The class names are versioned
and will keep matching.

If you want the **simple controls** — disclosure, menus, balloons, steppers —
take `platinum` too. They are framework-free and tested against real DOM with
no React in the test file at all.

**The focus trap is no longer on that list.** `focusTrap()` is what makes a
modal a modal rather than a div that looks like one, and it shares its
focusable-element rules with the React `Dialog` — so the two cannot disagree
about whether a `details > summary` is a tab stop.

What is still React-only is the roving tabindex, the listbox with type-ahead,
and the tree. Those are genuine pieces of engineering rather than styling
exercises, and they are where most of the work in this library actually is.

See [PITFALLS.md](../PITFALLS.md) for the specific ways these have gone wrong
here, which is a reasonable list of what to get right if you do rebuild them.
