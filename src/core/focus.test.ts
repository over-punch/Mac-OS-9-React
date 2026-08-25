// The shared focus core.
//
// Both the React Dialog and the framework-free focusTrap sit on this, so the
// rules for what counts as focusable have one home. The cases below are the
// ones that are easy to get wrong and invisible when they are: a disabled
// button matches the selector but cannot be focused, and tabindex="-1" is
// focusable programmatically but not tab-reachable.

import { describe, it, expect, afterEach } from 'vitest';
import { getFocusables, isElementFocusable, initialFocusTarget, nextTrapTarget } from './focus';

function mount(html: string): HTMLElement {
	const host = document.createElement('div');
	host.innerHTML = html;
	document.body.appendChild(host);
	// jsdom reports no client rects for everything, which would make every
	// element fail the visibility check.
	Element.prototype.getClientRects = function () {
		return [{}] as unknown as DOMRectList;
	};
	return host;
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('isElementFocusable', () => {
	it('rejects a disabled control that matches the selector', () => {
		const host = mount('<button disabled>No</button>');
		expect(isElementFocusable(host.querySelector('button')!)).toBe(false);
	});

	it('rejects tabindex="-1", which is focusable but not tab-reachable', () => {
		const host = mount('<button tabindex="-1">No</button>');
		expect(isElementFocusable(host.querySelector('button')!)).toBe(false);
	});

	it('rejects anything inside an aria-hidden subtree', () => {
		const host = mount('<div aria-hidden="true"><button>No</button></div>');
		// A control a keyboard user can reach but a screen reader says is not
		// there is worse than one that is simply missing.
		expect(isElementFocusable(host.querySelector('button')!)).toBe(false);
	});

	it('rejects a hidden element', () => {
		const host = mount('<button hidden>No</button>');
		expect(isElementFocusable(host.querySelector('button')!)).toBe(false);
	});

	it('accepts an ordinary control', () => {
		const host = mount('<button>Yes</button>');
		expect(isElementFocusable(host.querySelector('button')!)).toBe(true);
	});
});

describe('getFocusables', () => {
	it('finds the tab stops people forget', () => {
		const host = mount(`
			<a href="#x">link</a>
			<button>button</button>
			<input>
			<div contenteditable="true">editable</div>
			<details><summary>summary</summary></details>
			<audio controls></audio>
			<span>not focusable</span>`);
		const names = getFocusables(host).map((el) => el.tagName.toLowerCase());
		expect(names).toEqual(['a', 'button', 'input', 'div', 'summary', 'audio']);
	});

	it('returns them in document order', () => {
		const host = mount('<button>1</button><button>2</button><button>3</button>');
		expect(getFocusables(host).map((el) => el.textContent)).toEqual(['1', '2', '3']);
	});
});

describe('initialFocusTarget', () => {
	it('honours an explicit selector', () => {
		const host = mount('<button>first</button><button data-want>wanted</button>');
		expect(initialFocusTarget(host, '[data-want]').textContent).toBe('wanted');
	});

	it('falls back to the first focusable when the selector misses', () => {
		const host = mount('<button>first</button>');
		expect(initialFocusTarget(host, '[data-missing]').textContent).toBe('first');
	});

	it('ignores a selector that matches something unfocusable', () => {
		const host = mount('<button disabled data-want>no</button><button>yes</button>');
		expect(initialFocusTarget(host, '[data-want]').textContent).toBe('yes');
	});

	it('falls back to the container when there is nothing inside', () => {
		const host = mount('<p>nothing focusable</p>');
		// Focus has to land somewhere inside, or the trap has nothing to trap
		// and Escape has nothing listening.
		expect(initialFocusTarget(host)).toBe(host);
	});
});

describe('nextTrapTarget', () => {
	const setup = () => mount('<button>first</button><button>mid</button><button>last</button>');

	it('wraps from the last element to the first', () => {
		const host = setup();
		const last = getFocusables(host)[2] as HTMLElement;
		expect(nextTrapTarget(host, last, false)?.textContent).toBe('first');
	});

	it('wraps backwards from the first to the last', () => {
		const host = setup();
		const first = getFocusables(host)[0] as HTMLElement;
		expect(nextTrapTarget(host, first, true)?.textContent).toBe('last');
	});

	it('leaves the middle alone, so the browser does its own job', () => {
		const host = setup();
		const mid = getFocusables(host)[1] as HTMLElement;
		// Preventing default on every Tab would fight the browser for nothing,
		// and would break a trap containing a single element.
		expect(nextTrapTarget(host, mid, false)).toBeNull();
	});

	it('pulls focus back in when it has escaped the container', () => {
		const host = setup();
		const outside = document.createElement('button');
		document.body.appendChild(outside);
		expect(nextTrapTarget(host, outside, false)?.textContent).toBe('first');
	});

	it('keeps focus on the container when nothing inside is focusable', () => {
		const host = mount('<p>nothing</p>');
		// Otherwise Tab escapes the modal entirely.
		expect(nextTrapTarget(host, null, false)).toBe(host);
	});
});
