# Using the look without React

The README's position is that this library's value is the behaviour, not the
paint, and that the component class names are not a public API — they are
content-hashed by CSS Modules and change between builds. That has not changed.

What follows is the other half of that argument, done rather than asserted:
the actual CSS for the controls that are **only** paint, written against the
published tokens, so a Vue, Svelte, Astro or plain-HTML project can have them
without pulling in React.

```html
<link rel="stylesheet" href="node_modules/@liiift-studio/mac-os9-ui/dist/tokens.css" />
<link rel="stylesheet" href="node_modules/@liiift-studio/mac-os9-ui/dist/base.css" />
```

Or from a bundler:

```js
import '@liiift-studio/mac-os9-ui/tokens';
import '@liiift-studio/mac-os9-ui/base';
```

Both entry points are framework-neutral, versioned and supported. Everything
below builds on those tokens only — no class from the package is referenced.

Every token used here is asserted to exist in the published `tokens.css` by
`src/test/without-react.test.ts`, so these recipes cannot quietly rot when a
token is renamed.

---

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

| Control                                     | What CSS cannot give you                                                           |
| ------------------------------------------- | ---------------------------------------------------------------------------------- |
| `Window`                                    | Pointer _and_ keyboard drag and resize (WCAG 2.1.1), z-ordering across a stack     |
| `Dialog`, `Alert`                           | Focus trap, scroll lock, focus restore on close, Escape across a stack             |
| `MenuBar`, `MenuDropdown`, `ContextualMenu` | Roving tabindex, arrow navigation, dismiss on outside press, focus restore         |
| `Select`                                    | A listbox with type-ahead — the native `<select>` cannot be styled into this shape |
| `Tabs`                                      | Arrow-key navigation, `aria-controls` wiring, panel mounting                       |
| `ListView`, `TreeView`                      | Selection model, shift-range, `aria-level`, expand and collapse                    |
| `Scrollbar`                                 | Proportional thumb, drag maths, Page Up/Down                                       |
| `Slider`                                    | Arrow/Page/Home/End, pointer capture, tick snapping                                |
| `LittleArrows`                              | Hold-to-repeat, and stopping when the pointer leaves the button                    |
| `DisclosureTriangle`                        | `aria-expanded` on the thing it actually controls                                  |
| `BalloonHelp`                               | Open on focus as well as hover, Escape to dismiss, `aria-describedby`              |
| `ClockControl`                              | Segment selection, wrapping, and keeping display and value apart                   |

The `:checked` and `:has()` tricks that fake some of these produce controls
that look right and announce wrong. A checkbox hack driving a "menu" is still
a checkbox to a screen reader.

---

## The honest summary

If you want the **look**, everything above is real and supported, and the
tokens are versioned so it will keep matching.

If you want the **controls**, the behaviour is the product. Reimplementing a
focus trap or a roving tabindex in another framework is a genuine piece of
work, and it is the piece this library exists to have already done.

See [PITFALLS.md](../PITFALLS.md) for the specific ways these have gone wrong
here, which is a reasonable list of what to get right if you do rebuild them.
