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
