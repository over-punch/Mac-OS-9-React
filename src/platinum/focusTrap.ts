// Focus trapping, without a framework.
//
// The thing a CSS-only kit cannot give you, and the reason a div that looks
// like a modal is not one. Tab must cycle inside the dialog, Escape must
// close it, and closing must put focus back where it came from — otherwise a
// keyboard user is dropped at the top of the document with the modal still
// visually on top of everything.
//
// The rules for what counts as focusable live in `src/core/focus`, shared with
// the React Dialog, so the two cannot disagree about whether a
// `details > summary` is a tab stop.

import { getFocusables, initialFocusTarget, nextTrapTarget } from '../core/focus';
import type { Detachable } from './disclosure';

/**
 * Open traps, innermost last.
 *
 * Only the topmost responds to Tab and Escape. Without this, two stacked
 * dialogs both handle Escape and the outer one closes underneath the inner —
 * the same coordination the browser does internally for `<dialog>`.
 */
const stack: HTMLElement[] = [];

export interface FocusTrapOptions {
	/**
	 * CSS selector for what to focus on open, relative to the container.
	 * Falls back to the first focusable element, then the container itself.
	 */
	initialFocus?: string;

	/**
	 * Called when Escape is pressed on the topmost trap.
	 *
	 * The trap does not close itself — it does not own the container's
	 * visibility, and guessing would fight whatever does.
	 */
	onEscape?: () => void;

	/**
	 * Give focus back to wherever it was when the trap opened.
	 * @default true
	 */
	restoreFocus?: boolean;
}

/**
 * Trap keyboard focus inside `container` until the handle is destroyed.
 *
 * @example
 * ```js
 * const trap = focusTrap(dialogElement, {
 *   initialFocus: '[data-confirm]',
 *   onEscape: () => close(),
 * });
 * // …later, when the dialog is dismissed:
 * trap.destroy();
 * ```
 */
export function focusTrap(container: HTMLElement, options: FocusTrapOptions = {}): Detachable {
	const { initialFocus, onEscape, restoreFocus = true } = options;

	// Captured before anything in the container takes focus, or what gets
	// saved is the container's own first element and restoring is a no-op.
	const previouslyFocused =
		document.activeElement instanceof HTMLElement ? document.activeElement : null;

	stack.push(container);

	// The container itself needs to be focusable for the fallback to work, but
	// only if the author has not already made it so.
	const addedTabIndex = !container.hasAttribute('tabindex');
	if (addedTabIndex) container.setAttribute('tabindex', '-1');

	initialFocusTarget(container, initialFocus).focus();

	const onKeyDown = (event: KeyboardEvent) => {
		// Only the topmost trap acts; the rest wait their turn.
		if (stack[stack.length - 1] !== container) return;

		if (event.key === 'Escape') {
			event.stopPropagation();
			onEscape?.();
			return;
		}

		if (event.key !== 'Tab') return;

		const target = nextTrapTarget(container, document.activeElement, event.shiftKey);
		// null means the browser's own Tab behaviour is already right — do not
		// fight it, and do not preventDefault for nothing.
		if (!target) return;
		event.preventDefault();
		target.focus();
	};

	document.addEventListener('keydown', onKeyDown, true);

	return {
		destroy() {
			document.removeEventListener('keydown', onKeyDown, true);
			const index = stack.indexOf(container);
			if (index !== -1) stack.splice(index, 1);
			if (addedTabIndex) container.removeAttribute('tabindex');

			// isConnected guards a trigger that was itself removed while the
			// dialog was open; focusing a detached node silently does nothing
			// and drops focus to <body>.
			if (restoreFocus && previouslyFocused?.isConnected) previouslyFocused.focus();
		},
	};
}

/** Every tab-reachable element inside `root`, in document order. */
export { getFocusables };
