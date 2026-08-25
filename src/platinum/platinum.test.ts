// The framework-agnostic behaviour layer.
//
// These tests import no React and render no components — they build DOM by
// hand and attach the modules to it, which is exactly how a Vue, Svelte or
// plain-HTML consumer uses them. If any of this needed React, it would fail
// here rather than in someone else's project.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { disclosure } from './disclosure';
import { menu } from './menu';
import { balloon } from './balloon';
import { stepper } from './stepper';
import { focusTrap } from './focusTrap';

/** Build markup from a string, the way a consumer's template would. */
function mount(html: string): HTMLElement {
	const host = document.createElement('div');
	host.innerHTML = html;
	document.body.appendChild(host);
	return host;
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('disclosure', () => {
	const MARKUP = `
		<button class="mac-disclosure" aria-expanded="false" aria-controls="region">Advanced</button>
		<div id="region" hidden>contents</div>`;

	it('toggles the button and the region together', () => {
		const host = mount(MARKUP);
		const button = host.querySelector('button')!;
		const region = host.querySelector('#region') as HTMLElement;
		disclosure(button);

		button.click();
		expect(button.getAttribute('aria-expanded')).toBe('true');
		expect(region.hidden).toBe(false);

		button.click();
		expect(button.getAttribute('aria-expanded')).toBe('false');
		// `hidden`, not display:none — a collapsed region must leave the tab
		// order as well as the screen.
		expect(region.hidden).toBe(true);
	});

	it('adopts the state the markup already declares', () => {
		const host = mount(`
			<button class="mac-disclosure" aria-expanded="true" aria-controls="r2">A</button>
			<div id="r2" hidden>c</div>`);
		disclosure(host.querySelector('button')!);
		// Server-rendered open state must survive, not be reset to closed.
		expect((host.querySelector('#r2') as HTMLElement).hidden).toBe(false);
	});

	it('stops responding after destroy', () => {
		const host = mount(MARKUP);
		const button = host.querySelector('button')!;
		disclosure(button).destroy();
		button.click();
		expect(button.getAttribute('aria-expanded')).toBe('false');
	});
});

describe('menu', () => {
	const MARKUP = `
		<div role="menu" class="mac-menu">
			<div role="menuitem" data-action="open">Open</div>
			<div role="menuitem" data-action="info">Get Info</div>
			<div role="menuitem" aria-disabled="true">Duplicate</div>
			<div class="mac-menu__separator"></div>
			<div role="menuitem" data-action="trash">Move to Trash</div>
		</div>`;

	it('skips disabled items when arrowing', () => {
		const host = mount(MARKUP);
		const element = host.querySelector('[role="menu"]') as HTMLElement;
		const onSelect = vi.fn();
		menu(element, { onSelect });

		// Open -> Get Info -> Move to Trash. Duplicate is disabled, and the
		// separator was never an item.
		element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

		expect(onSelect).toHaveBeenCalledWith(
			expect.objectContaining({ dataset: expect.objectContaining({ action: 'trash' }) })
		);
	});

	it('marks the current item so CSS can paint it', () => {
		const host = mount(MARKUP);
		const element = host.querySelector('[role="menu"]') as HTMLElement;
		menu(element);
		expect(element.querySelector('[data-active="true"]')?.textContent).toBe('Open');
	});

	it('wraps at the ends', () => {
		const host = mount(MARKUP);
		const element = host.querySelector('[role="menu"]') as HTMLElement;
		menu(element);
		element.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
		expect(element.querySelector('[data-active="true"]')?.textContent).toBe('Move to Trash');
	});

	it('dismisses on Escape and on an outside press', () => {
		const host = mount(MARKUP);
		const element = host.querySelector('[role="menu"]') as HTMLElement;
		const onDismiss = vi.fn();
		menu(element, { onDismiss });

		element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		expect(onDismiss).toHaveBeenCalledTimes(1);

		document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		expect(onDismiss).toHaveBeenCalledTimes(2);
	});

	it('ignores a click on a disabled item', () => {
		const host = mount(MARKUP);
		const element = host.querySelector('[role="menu"]') as HTMLElement;
		const onSelect = vi.fn();
		menu(element, { onSelect });
		(element.querySelector('[aria-disabled="true"]') as HTMLElement).click();
		expect(onSelect).not.toHaveBeenCalled();
	});

	it('removes its document listener on destroy', () => {
		const host = mount(MARKUP);
		const element = host.querySelector('[role="menu"]') as HTMLElement;
		const onDismiss = vi.fn();
		menu(element, { onDismiss }).destroy();
		document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		expect(onDismiss).not.toHaveBeenCalled();
	});
});

describe('menu — the paths a happy click never reaches', () => {
	const MARKUP = `
		<div role="menu" class="mac-menu">
			<div role="menuitem" data-action="open">Open</div>
			<div role="menuitem" aria-disabled="true">Duplicate</div>
			<div class="mac-menu__separator"></div>
			<div role="menuitem" data-action="trash">Move to Trash</div>
		</div>`;

	it('Home and End jump to the ends of the selectable set', () => {
		const host = mount(MARKUP);
		const el = host.querySelector('[role="menu"]') as HTMLElement;
		menu(el);

		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
		expect(el.querySelector('[data-active="true"]')?.textContent).toBe('Move to Trash');

		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
		expect(el.querySelector('[data-active="true"]')?.textContent).toBe('Open');
	});

	it('Tab dismisses rather than leaving the menu floating', () => {
		const host = mount(MARKUP);
		const el = host.querySelector('[role="menu"]') as HTMLElement;
		const onDismiss = vi.fn();
		menu(el, { onDismiss });
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
		expect(onDismiss).toHaveBeenCalledTimes(1);
	});

	it('ignores keys it does not own', () => {
		const host = mount(MARKUP);
		const el = host.querySelector('[role="menu"]') as HTMLElement;
		const onSelect = vi.fn();
		const onDismiss = vi.fn();
		menu(el, { onSelect, onDismiss });
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
		expect(onSelect).not.toHaveBeenCalled();
		expect(onDismiss).not.toHaveBeenCalled();
	});

	it('Space chooses, the same as Return', () => {
		const host = mount(MARKUP);
		const el = host.querySelector('[role="menu"]') as HTMLElement;
		const onSelect = vi.fn();
		menu(el, { onSelect });
		el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
		expect(onSelect).toHaveBeenCalledWith(
			expect.objectContaining({ dataset: expect.objectContaining({ action: 'open' }) })
		);
	});

	it('tracks the highlight with the pointer', () => {
		const host = mount(MARKUP);
		const el = host.querySelector('[role="menu"]') as HTMLElement;
		menu(el);
		const trash = [...el.querySelectorAll('[role="menuitem"]')].pop() as HTMLElement;
		// Mac OS 9 tracked pointer and arrow keys as one state, not as separate
		// hover and focus styles.
		trash.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
		expect(el.querySelector('[data-active="true"]')?.textContent).toBe('Move to Trash');
	});

	it('will not highlight a disabled item on hover', () => {
		const host = mount(MARKUP);
		const el = host.querySelector('[role="menu"]') as HTMLElement;
		menu(el);
		const disabled = el.querySelector('[aria-disabled="true"]') as HTMLElement;
		disabled.dispatchEvent(new PointerEvent('pointerover', { bubbles: true }));
		expect(el.querySelector('[data-active="true"]')?.textContent).toBe('Open');
	});

	it('survives a menu with nothing selectable in it', () => {
		const host = mount(`
			<div role="menu" class="mac-menu">
				<div role="menuitem" aria-disabled="true">Only this</div>
			</div>`);
		const el = host.querySelector('[role="menu"]') as HTMLElement;
		const onSelect = vi.fn();
		menu(el, { onSelect });
		// Arrowing through an empty set must not throw or wrap into nothing.
		expect(() =>
			el.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }))
		).not.toThrow();
		el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		expect(onSelect).not.toHaveBeenCalled();
	});

	it('ignores a click that lands on the menu but not on an item', () => {
		const host = mount(MARKUP);
		const el = host.querySelector('[role="menu"]') as HTMLElement;
		const onSelect = vi.fn();
		menu(el, { onSelect });
		(el.querySelector('.mac-menu__separator') as HTMLElement).click();
		expect(onSelect).not.toHaveBeenCalled();
	});
});

describe('balloon', () => {
	const MARKUP = `<div><button id="trash">Trash</button></div>`;

	it('opens on focus and describes the trigger', () => {
		const host = mount(MARKUP);
		const trigger = host.querySelector('#trash') as HTMLElement;
		balloon(trigger, { content: 'Throws things away.' });

		trigger.dispatchEvent(new FocusEvent('focus'));

		const tip = document.querySelector('[role="tooltip"]');
		expect(tip).toHaveTextContent('Throws things away.');
		// Describes rather than labels: the button is still "Trash".
		expect(trigger.getAttribute('aria-describedby')).toBe(tip?.id);
		expect(trigger.textContent).toBe('Trash');
	});

	it('closes on Escape', () => {
		const host = mount(MARKUP);
		const trigger = host.querySelector('#trash') as HTMLElement;
		balloon(trigger, { content: 'Throws things away.' });
		trigger.dispatchEvent(new FocusEvent('focus'));

		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

		expect(document.querySelector('[role="tooltip"]')).toBeNull();
		expect(trigger.hasAttribute('aria-describedby')).toBe(false);
	});

	it('leaves nothing behind on destroy', () => {
		const host = mount(MARKUP);
		const trigger = host.querySelector('#trash') as HTMLElement;
		const handle = balloon(trigger, { content: 'x' });
		trigger.dispatchEvent(new FocusEvent('focus'));
		handle.destroy();
		expect(document.querySelector('[role="tooltip"]')).toBeNull();
		expect(trigger.hasAttribute('aria-describedby')).toBe(false);
	});
});

describe('focusTrap', () => {
	const MARKUP = `
		<button id="outside">Outside</button>
		<div id="dialog">
			<button id="first">First</button>
			<button id="mid">Mid</button>
			<button id="last" data-confirm>Last</button>
		</div>`;

	beforeEach(() => {
		// jsdom reports no client rects, which would make everything fail the
		// visibility check and leave the trap with nothing to cycle.
		Element.prototype.getClientRects = function () {
			return [{}] as unknown as DOMRectList;
		};
	});

	it('moves focus inside on open', () => {
		const host = mount(MARKUP);
		focusTrap(host.querySelector('#dialog') as HTMLElement);
		expect(document.activeElement?.id).toBe('first');
	});

	it('honours an explicit initial focus', () => {
		const host = mount(MARKUP);
		focusTrap(host.querySelector('#dialog') as HTMLElement, { initialFocus: '[data-confirm]' });
		expect(document.activeElement?.id).toBe('last');
	});

	it('cycles Tab from the last element back to the first', () => {
		const host = mount(MARKUP);
		const dialog = host.querySelector('#dialog') as HTMLElement;
		focusTrap(dialog);
		(host.querySelector('#last') as HTMLElement).focus();

		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
		expect(document.activeElement?.id).toBe('first');
	});

	it('cycles Shift+Tab from the first back to the last', () => {
		const host = mount(MARKUP);
		focusTrap(host.querySelector('#dialog') as HTMLElement);
		(host.querySelector('#first') as HTMLElement).focus();

		document.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true })
		);
		expect(document.activeElement?.id).toBe('last');
	});

	it('reports Escape without closing anything itself', () => {
		const host = mount(MARKUP);
		const onEscape = vi.fn();
		focusTrap(host.querySelector('#dialog') as HTMLElement, { onEscape });
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		// The trap does not own the container's visibility, so it asks rather
		// than guessing.
		expect(onEscape).toHaveBeenCalledTimes(1);
		expect(host.querySelector('#dialog')).toBeTruthy();
	});

	it('gives focus back to where it came from', () => {
		const host = mount(MARKUP);
		const outside = host.querySelector('#outside') as HTMLElement;
		outside.focus();

		const trap = focusTrap(host.querySelector('#dialog') as HTMLElement);
		expect(document.activeElement?.id).toBe('first');

		trap.destroy();
		// Dropping focus on <body> would strand a keyboard user.
		expect(document.activeElement?.id).toBe('outside');
	});

	it('only the topmost trap responds', () => {
		const host = mount(`
			<div id="outer"><button id="outer-btn">Outer</button></div>
			<div id="inner"><button id="inner-btn">Inner</button></div>`);
		const outerEscape = vi.fn();
		const innerEscape = vi.fn();
		focusTrap(host.querySelector('#outer') as HTMLElement, { onEscape: outerEscape });
		const inner = focusTrap(host.querySelector('#inner') as HTMLElement, {
			onEscape: innerEscape,
		});

		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		// Without a stack, both fire and the outer dialog closes underneath
		// the inner one.
		expect(innerEscape).toHaveBeenCalledTimes(1);
		expect(outerEscape).not.toHaveBeenCalled();

		inner.destroy();
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		expect(outerEscape).toHaveBeenCalledTimes(1);
	});

	it('leaves the container as it found it', () => {
		const host = mount(MARKUP);
		const dialog = host.querySelector('#dialog') as HTMLElement;
		expect(dialog.hasAttribute('tabindex')).toBe(false);
		const trap = focusTrap(dialog);
		trap.destroy();
		// The trap adds tabindex="-1" so its fallback works; it must not leave
		// it behind on markup the author wrote.
		expect(dialog.hasAttribute('tabindex')).toBe(false);
	});

	it('stops trapping after destroy', () => {
		const host = mount(MARKUP);
		const onEscape = vi.fn();
		focusTrap(host.querySelector('#dialog') as HTMLElement, { onEscape }).destroy();
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		expect(onEscape).not.toHaveBeenCalled();
	});
});

describe('stepper', () => {
	const MARKUP = `
		<span class="mac-littlearrows">
			<button aria-label="Increase"></button>
			<button aria-label="Decrease"></button>
		</span>`;

	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('steps in the right direction', () => {
		const host = mount(MARKUP);
		const onStep = vi.fn();
		stepper(host.querySelector('.mac-littlearrows') as HTMLElement, { onStep });
		const [up, down] = [...host.querySelectorAll('button')];

		up!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		expect(onStep).toHaveBeenCalledWith(1);
		down!.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		expect(onStep).toHaveBeenCalledWith(-1);
	});

	it('waits before repeating, so a click is one step', () => {
		const host = mount(MARKUP);
		const onStep = vi.fn();
		stepper(host.querySelector('.mac-littlearrows') as HTMLElement, { onStep });
		const up = host.querySelector('button')!;

		up.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		expect(onStep).toHaveBeenCalledTimes(1);

		vi.advanceTimersByTime(300);
		expect(onStep).toHaveBeenCalledTimes(1);

		vi.advanceTimersByTime(300);
		expect(onStep.mock.calls.length).toBeGreaterThan(1);
	});

	it('does nothing for a disabled arrow', () => {
		const host = mount(`
			<span class="mac-littlearrows">
				<button aria-label="Increase" disabled></button>
				<button aria-label="Decrease"></button>
			</span>`);
		const onStep = vi.fn();
		stepper(host.querySelector('.mac-littlearrows') as HTMLElement, { onStep });
		const up = host.querySelector('button')!;
		up.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		expect(onStep).not.toHaveBeenCalled();
	});

	it('steps once per keypress, without repeating', () => {
		const host = mount(MARKUP);
		const onStep = vi.fn();
		stepper(host.querySelector('.mac-littlearrows') as HTMLElement, { onStep });
		const up = host.querySelector('button')!;
		// Holding a key already repeats at the OS level; repeating here too
		// would double it.
		up.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		vi.advanceTimersByTime(2000);
		expect(onStep).toHaveBeenCalledTimes(1);
	});

	it('ignores keys that are not Enter or Space', () => {
		const host = mount(MARKUP);
		const onStep = vi.fn();
		stepper(host.querySelector('.mac-littlearrows') as HTMLElement, { onStep });
		host
			.querySelector('button')!
			.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
		expect(onStep).not.toHaveBeenCalled();
	});

	it('stops on pointerup as well as on leave', () => {
		const host = mount(MARKUP);
		const onStep = vi.fn();
		stepper(host.querySelector('.mac-littlearrows') as HTMLElement, { onStep });
		const up = host.querySelector('button')!;
		up.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		vi.advanceTimersByTime(1000);
		const held = onStep.mock.calls.length;
		up.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
		vi.advanceTimersByTime(1000);
		expect(onStep).toHaveBeenCalledTimes(held);
	});

	it('detaches cleanly, timers included', () => {
		const host = mount(MARKUP);
		const onStep = vi.fn();
		const handle = stepper(host.querySelector('.mac-littlearrows') as HTMLElement, { onStep });
		const up = host.querySelector('button')!;
		up.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		handle.destroy();
		vi.advanceTimersByTime(2000);
		// destroy() must kill a running repeat, not just stop listening.
		expect(onStep).toHaveBeenCalledTimes(1);
	});

	it('stops when the pointer leaves', () => {
		const host = mount(MARKUP);
		const onStep = vi.fn();
		stepper(host.querySelector('.mac-littlearrows') as HTMLElement, { onStep });
		const up = host.querySelector('button')!;

		up.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		vi.advanceTimersByTime(1000);
		const held = onStep.mock.calls.length;

		// A pointer released outside the button never fires pointerup on it,
		// so leaving has to be enough — otherwise the repeat runs forever.
		up.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));
		vi.advanceTimersByTime(1000);
		expect(onStep).toHaveBeenCalledTimes(held);
	});
});
