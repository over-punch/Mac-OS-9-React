// Balloon help behaviour, without a framework.
//
// Mac OS 9's balloons were hover-only, which makes them invisible to keyboard
// and screen-reader users. This opens on focus as well, describes the trigger
// with aria-describedby rather than replacing its name, and dismisses on
// Escape — none of which CSS can do.

import { createDelayedOpen } from '../core/openDelay';
import type { Detachable } from './disclosure';

let sequence = 0;

export interface BalloonOptions {
	/** What the balloon says. */
	content: string;
}

/**
 * Attach a balloon to a trigger.
 *
 * The balloon element is created on demand and removed on destroy, so the
 * markup you write is just the trigger.
 *
 * @example
 * ```js
 * balloon(document.querySelector('#trash'), {
 *   content: 'Throws away the items you drag here.',
 * });
 * ```
 */
export function balloon(trigger: HTMLElement, options: BalloonOptions): Detachable {
	const id = `mac-balloon-${++sequence}`;
	let node: HTMLElement | null = null;

	// The trigger needs a positioned ancestor for the balloon to sit against.
	// Only set it where the page has not already established one.
	const parent = trigger.parentElement;
	const parentWasStatic = parent !== null && getComputedStyle(parent).position === 'static';
	if (parentWasStatic && parent) parent.style.position = 'relative';

	const remove = () => {
		node?.remove();
		node = null;
		trigger.removeAttribute('aria-describedby');
	};

	const render = () => {
		node = document.createElement('span');
		node.id = id;
		node.className = 'mac-balloon';
		node.setAttribute('role', 'tooltip');
		node.textContent = options.content;
		// Positioned below the trigger by default; the class handles the tail.
		node.style.top = `${trigger.offsetTop + trigger.offsetHeight + 8}px`;
		node.style.left = `${trigger.offsetLeft}px`;
		(parent ?? document.body).appendChild(node);
		// Describes rather than labels: the trigger keeps its own name.
		trigger.setAttribute('aria-describedby', id);
	};

	// The open delay lives in the shared core, so this and the React
	// BalloonHelp agree on how long a hover waits.
	const controller = createDelayedOpen({ onOpen: render, onClose: remove });

	// Focus arrives all at once, so there is nothing to wait for.
	const show = () => controller.open(true);
	const showSoon = () => controller.open();
	const hide = () => controller.close();

	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') hide();
	};

	// Focus arrives all at once rather than by hovering toward it, so there is
	// nothing to wait for.
	trigger.addEventListener('focus', show);
	trigger.addEventListener('blur', hide);
	trigger.addEventListener('pointerenter', showSoon);
	trigger.addEventListener('pointerleave', hide);
	document.addEventListener('keydown', onKeyDown);

	return {
		destroy() {
			hide();
			trigger.removeEventListener('focus', show);
			trigger.removeEventListener('blur', hide);
			trigger.removeEventListener('pointerenter', showSoon);
			trigger.removeEventListener('pointerleave', hide);
			document.removeEventListener('keydown', onKeyDown);
			if (parentWasStatic && parent) parent.style.position = '';
		},
	};
}
