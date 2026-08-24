// Platinum — the Mac OS 9 interface without a framework.
//
// Two halves, and the second is the point:
//
//   @liiift-studio/mac-os9-ui/platinum.css   the paint, with stable class names
//   @liiift-studio/mac-os9-ui/platinum       the behaviour, as plain modules
//
// The README's position on CSS-only kits is that they hand you the half that
// matters least — a div that looks like a button is not a button. These
// modules are the other half: keyboard contracts, focus management and the
// state wiring, in plain DOM code with no framework and no dependencies.
//
// They attach to markup you write yourself, which is what keeps them usable
// from Vue, Svelte, Astro, htmx or a hand-written page. Each returns a handle
// with `destroy()`, so a framework's teardown has something to call.
//
// Unlike the CSS-module class names the React components use, the class names
// in platinum.css are a public API: they are versioned with the package and
// renaming one is a breaking change.

export { disclosure, type DisclosureOptions, type Detachable } from './disclosure';
export { menu, type MenuOptions } from './menu';
export { balloon, type BalloonOptions } from './balloon';
export { stepper, type StepperOptions } from './stepper';
