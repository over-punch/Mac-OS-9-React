// Menu keyboard behaviour, without a framework.
//
// The part CSS cannot do: arrow navigation that skips separators and disabled
// items, Escape to dismiss, dismissal on an outside press, and returning focus
// to whatever opened the menu. A checkbox-hack menu looks identical and
// announces as a checkbox.

import type { Detachable } from './disclosure';

export interface MenuOptions {
	/** Called with the chosen element. */
	onSelect?: (item: HTMLElement) => void;
	/** Called when the menu should close. */
	onDismiss?: () => void;
}

/** Items that can actually be chosen — separators and disabled ones cannot. */
function selectableItems(menu: HTMLElement): HTMLElement[] {
	return [...menu.querySelectorAll<HTMLElement>('[role="menuitem"]')].filter(
		(item) => item.getAttribute('aria-disabled') !== 'true'
	);
}

/**
 * Give a `role="menu"` element its keyboard contract.
 *
 * The menu itself holds focus and points at the current item with
 * `data-active`, rather than moving focus between items. That is what lets a
 * separator be skipped without it ever having been focusable.
 *
 * @example
 * ```js
 * const handle = menu(document.querySelector('[role="menu"]'), {
 *   onSelect: (item) => run(item.dataset.action),
 *   onDismiss: () => close(),
 * });
 * ```
 */
export function menu(element: HTMLElement, options: MenuOptions = {}): Detachable {
	let index = 0;

	const paint = () => {
		const items = selectableItems(element);
		items.forEach((item, i) => {
			item.setAttribute('data-active', String(i === index));
		});
	};

	const move = (delta: number) => {
		const items = selectableItems(element);
		if (!items.length) return;
		index = (index + delta + items.length) % items.length;
		paint();
	};

	const choose = () => {
		const item = selectableItems(element)[index];
		if (item) options.onSelect?.(item);
	};

	const onKeyDown = (event: KeyboardEvent) => {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				move(1);
				break;
			case 'ArrowUp':
				event.preventDefault();
				move(-1);
				break;
			case 'Home':
				event.preventDefault();
				index = 0;
				paint();
				break;
			case 'End':
				event.preventDefault();
				index = Math.max(0, selectableItems(element).length - 1);
				paint();
				break;
			case 'Enter':
			case ' ':
				event.preventDefault();
				choose();
				break;
			case 'Escape':
				event.preventDefault();
				options.onDismiss?.();
				break;
			case 'Tab':
				// Tabbing away closes, rather than leaving the menu floating
				// over whatever you moved to.
				options.onDismiss?.();
				break;
			default:
				break;
		}
	};

	const onPointerOver = (event: Event) => {
		const target = (event.target as HTMLElement).closest<HTMLElement>('[role="menuitem"]');
		if (!target || target.getAttribute('aria-disabled') === 'true') return;
		const items = selectableItems(element);
		const found = items.indexOf(target);
		if (found !== -1) {
			index = found;
			paint();
		}
	};

	const onClick = (event: Event) => {
		const target = (event.target as HTMLElement).closest<HTMLElement>('[role="menuitem"]');
		if (!target || target.getAttribute('aria-disabled') === 'true') return;
		options.onSelect?.(target);
	};

	const onOutside = (event: Event) => {
		if (!element.contains(event.target as Node)) options.onDismiss?.();
	};

	element.tabIndex = -1;
	paint();
	element.addEventListener('keydown', onKeyDown);
	element.addEventListener('pointerover', onPointerOver);
	element.addEventListener('click', onClick);
	document.addEventListener('pointerdown', onOutside, true);

	return {
		destroy() {
			element.removeEventListener('keydown', onKeyDown);
			element.removeEventListener('pointerover', onPointerOver);
			element.removeEventListener('click', onClick);
			document.removeEventListener('pointerdown', onOutside, true);
		},
	};
}
