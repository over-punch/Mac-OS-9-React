// Focusable-element detection and focus trapping. No framework, no React.
//
// This was Dialog's, and it is the single most-cited reason the framework-free
// layer could not cover the harder controls: a focus trap is the difference
// between a modal and a div that looks like one, and it is a genuine piece of
// work rather than a styling exercise.
//
// Nothing here touches React, so both the React Dialog and the plain-DOM
// `focusTrap()` in `platinum` sit on the same implementation. When the rules
// for what counts as focusable change — and they do, as browsers add things —
// they change once.

/**
 * Everything the Tab key can naturally reach, plus author overrides via
 * `[tabindex]`. Deliberately broad: `contenteditable`, media with controls and
 * `details > summary` are all tab stops and are all easy to forget.
 */
const FOCUSABLE_SELECTOR = [
	'a[href]',
	'area[href]',
	'button',
	'input',
	'select',
	'textarea',
	'iframe',
	'audio[controls]',
	'video[controls]',
	'[contenteditable="true"]',
	'[contenteditable=""]',
	'details > summary:first-of-type',
	'[tabindex]',
].join(',');

/**
 * Whether an element is genuinely reachable by Tab right now.
 *
 * The selector above is necessary but not sufficient — a `<button disabled>`
 * matches it and cannot be focused, and neither can anything inside an
 * `aria-hidden` subtree or with no layout boxes.
 */
export function isElementFocusable(element: HTMLElement): boolean {
	if ((element as HTMLInputElement).disabled) return false;
	// tabindex="-1" is programmatically focusable but not tab-reachable, and a
	// trap cycles the tab order rather than every focusable node.
	if (element.getAttribute('tabindex') === '-1') return false;
	if (element.hidden) return false;
	if (element.closest('[aria-hidden="true"]')) return false;
	// Zero client rects covers display:none, visibility:hidden and detached
	// subtrees in one check.
	if (element.getClientRects().length === 0) return false;
	return true;
}

/** Every tab-reachable element inside `root`, in document order. */
export function getFocusables(root: HTMLElement): HTMLElement[] {
	return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
		isElementFocusable
	);
}

/**
 * Where focus should go when a container opens.
 *
 * Falls back to the container itself so focus lands *somewhere* inside rather
 * than staying on the trigger — with focus outside, a trap has nothing to trap
 * and Escape has nothing listening.
 */
export function initialFocusTarget(root: HTMLElement, selector?: string): HTMLElement {
	if (selector) {
		const requested = root.querySelector<HTMLElement>(selector);
		if (requested && isElementFocusable(requested)) return requested;
	}
	return getFocusables(root)[0] ?? root;
}

/**
 * Given a Tab keypress inside `root`, the element that should receive focus —
 * or `null` when the browser's own behaviour is already correct.
 *
 * Returning `null` rather than always redirecting matters: preventing the
 * default on every Tab would break a trap containing a single element, and
 * would fight the browser for no reason in the common case.
 */
export function nextTrapTarget(
	root: HTMLElement,
	active: Element | null,
	shiftKey: boolean
): HTMLElement | null {
	const focusables = getFocusables(root);
	if (focusables.length === 0) {
		// Nothing to move to, so keep focus on the container rather than
		// letting Tab escape the modal entirely.
		return root;
	}

	const first = focusables[0] as HTMLElement;
	const last = focusables[focusables.length - 1] as HTMLElement;

	// Only the wrap points need intervention; everything between them is the
	// browser's job and it does it correctly.
	if (shiftKey && (active === first || !root.contains(active))) return last;
	if (!shiftKey && (active === last || !root.contains(active))) return first;
	return null;
}
