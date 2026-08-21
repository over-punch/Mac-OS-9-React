// Geometry helpers behind the drag and resize hooks.

import { describe, it, expect, afterEach } from 'vitest';
import { clamp, measureContainingBlock, measureOffset } from './gestureGeometry';

describe('clamp', () => {
	it('passes a value already in range', () => {
		expect(clamp(5, 0, 10)).toBe(5);
	});

	it('clamps to the bounds', () => {
		expect(clamp(-3, 0, 10)).toBe(0);
		expect(clamp(42, 0, 10)).toBe(10);
	});

	it('returns the minimum for an inverted range', () => {
		// Happens when a container is narrower than the element plus its
		// boundary buffer; the element should pin to the left rather than
		// producing a NaN or an inside-out box.
		expect(clamp(5, 10, 0)).toBe(10);
	});
});

describe('measureOffset', () => {
	it('reads the element offset within its containing block', () => {
		const el = document.createElement('div');
		Object.defineProperty(el, 'offsetLeft', { value: 40, configurable: true });
		Object.defineProperty(el, 'offsetTop', { value: 25, configurable: true });
		expect(measureOffset(el)).toEqual({ x: 40, y: 25 });
	});
});

describe('measureContainingBlock', () => {
	const originalRect = Element.prototype.getBoundingClientRect;

	afterEach(() => {
		Element.prototype.getBoundingClientRect = originalRect;
	});

	const stub = (el: HTMLElement, rect: Partial<DOMRect>, offsetWidth: number) => {
		Object.defineProperty(el, 'offsetWidth', { value: offsetWidth, configurable: true });
		el.getBoundingClientRect = () => ({ width: 0, height: 0, ...rect }) as DOMRect;
	};

	it('falls back to the viewport with no positioned ancestor', () => {
		const el = document.createElement('div');
		stub(el, { width: 100 }, 100);
		Object.defineProperty(el, 'offsetParent', { value: null, configurable: true });

		const block = measureContainingBlock(el);

		expect(block.width).toBe(window.innerWidth);
		expect(block.height).toBe(window.innerHeight);
		expect(block.scale).toBe(1);
	});

	it('recovers the scale applied by a transformed ancestor', () => {
		// A rendered width of 150 for a layout width of 100 means an ancestor
		// scaled the subtree by 1.5. Pointer deltas arrive in untransformed
		// client pixels, so the hooks divide by this to get local pixels.
		const el = document.createElement('div');
		stub(el, { width: 150 }, 100);
		Object.defineProperty(el, 'offsetParent', { value: null, configurable: true });

		expect(measureContainingBlock(el).scale).toBeCloseTo(1.5, 5);
	});

	it('never reports a zero scale', () => {
		// An element hidden mid-measure reports a zero rect; dividing a delta
		// by zero would send the position to Infinity.
		const el = document.createElement('div');
		stub(el, { width: 0 }, 100);
		Object.defineProperty(el, 'offsetParent', { value: null, configurable: true });

		expect(measureContainingBlock(el).scale).toBe(1);
	});

	it('uses the positioned ancestor when there is one', () => {
		const parent = document.createElement('div');
		Object.defineProperty(parent, 'clientWidth', { value: 800, configurable: true });
		Object.defineProperty(parent, 'clientHeight', { value: 600, configurable: true });

		const el = document.createElement('div');
		stub(el, { width: 100 }, 100);
		Object.defineProperty(el, 'offsetParent', { value: parent, configurable: true });

		const block = measureContainingBlock(el);

		expect(block.width).toBe(800);
		expect(block.height).toBe(600);
	});
});
