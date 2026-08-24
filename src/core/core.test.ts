// The shared behaviour core.
//
// No framework and no DOM in this file — which is the whole claim these
// modules make. If any of them grew a React or document dependency, it would
// fail here rather than somewhere subtler.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRepeater, REPEAT_DELAY, REPEAT_INTERVAL } from './repeat';
import { createDelayedOpen, OPEN_DELAY } from './openDelay';
import { wrap, stepThrough } from './navigation';

describe('wrap', () => {
	it.each([
		[0, 3, 0],
		[2, 3, 2],
		[3, 3, 0],
		[-1, 3, 2],
		[-4, 3, 2],
		[7, 3, 1],
	])('wrap(%i, %i) is %i', (index, length, expected) => {
		expect(wrap(index, length)).toBe(expected);
	});

	it('answers 0 for an empty list rather than NaN', () => {
		expect(wrap(1, 0)).toBe(0);
	});
});

describe('stepThrough', () => {
	// A menu with a disabled item at 2 and a separator at 3.
	const enabled = [0, 1, 4];

	it('skips what cannot be landed on', () => {
		expect(stepThrough(1, 1, enabled)).toBe(4);
	});

	it('wraps around the subset, not the whole list', () => {
		expect(stepThrough(4, 1, enabled)).toBe(0);
		expect(stepThrough(0, -1, enabled)).toBe(4);
	});

	it('stays put when nothing is selectable', () => {
		expect(stepThrough(2, 1, [])).toBe(2);
	});

	it('moves forward onto the next enabled entry from a disabled one', () => {
		// Sitting on the disabled item at 2, forward should reach 4 — not skip
		// it by counting from an anchor that is already ahead.
		expect(stepThrough(2, 1, enabled)).toBe(4);
	});

	it('moves backward to the previous enabled entry from a disabled one', () => {
		expect(stepThrough(2, -1, enabled)).toBe(1);
	});

	it('handles a single enabled entry', () => {
		expect(stepThrough(0, 1, [0])).toBe(0);
		expect(stepThrough(0, -1, [0])).toBe(0);
	});
});

describe('createRepeater', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('fires once immediately, then repeats after the delay', () => {
		const action = vi.fn();
		const repeater = createRepeater();

		repeater.start(action);
		expect(action).toHaveBeenCalledTimes(1);

		// A single click must stay a single step.
		vi.advanceTimersByTime(REPEAT_DELAY - 50);
		expect(action).toHaveBeenCalledTimes(1);

		vi.advanceTimersByTime(50 + REPEAT_INTERVAL * 3);
		expect(action.mock.calls.length).toBeGreaterThan(1);
	});

	it('stops cleanly before the interval begins', () => {
		const action = vi.fn();
		const repeater = createRepeater();
		repeater.start(action);
		repeater.stop();
		vi.advanceTimersByTime(5000);
		expect(action).toHaveBeenCalledTimes(1);
	});

	it('stops cleanly after the interval begins', () => {
		const action = vi.fn();
		const repeater = createRepeater();
		repeater.start(action);
		vi.advanceTimersByTime(REPEAT_DELAY + REPEAT_INTERVAL * 5);
		const held = action.mock.calls.length;
		repeater.stop();
		vi.advanceTimersByTime(5000);
		expect(action).toHaveBeenCalledTimes(held);
	});

	it('gives each repeater its own timers', () => {
		const a = vi.fn();
		const b = vi.fn();
		const first = createRepeater();
		const second = createRepeater();

		first.start(a);
		second.start(b);
		// Stopping one must not cancel the other — which is exactly what a
		// module-level timer would do.
		first.stop();
		vi.advanceTimersByTime(REPEAT_DELAY + REPEAT_INTERVAL * 3);

		expect(a).toHaveBeenCalledTimes(1);
		expect(b.mock.calls.length).toBeGreaterThan(1);
	});
});

describe('createDelayedOpen', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	const setup = () => {
		const onOpen = vi.fn();
		const onClose = vi.fn();
		return { onOpen, onClose, controller: createDelayedOpen({ onOpen, onClose }) };
	};

	it('waits before opening', () => {
		const { onOpen, controller } = setup();
		controller.open();
		expect(onOpen).not.toHaveBeenCalled();
		vi.advanceTimersByTime(OPEN_DELAY);
		expect(onOpen).toHaveBeenCalledTimes(1);
	});

	it('opens at once when asked', () => {
		const { onOpen, controller } = setup();
		// Focus arrives all at once; there is nothing to wait for.
		controller.open(true);
		expect(onOpen).toHaveBeenCalledTimes(1);
	});

	it('never opens if closed before the delay elapses', () => {
		const { onOpen, onClose, controller } = setup();
		controller.open();
		controller.close();
		vi.advanceTimersByTime(5000);
		expect(onOpen).not.toHaveBeenCalled();
		// Nothing was open, so nothing needed closing.
		expect(onClose).not.toHaveBeenCalled();
	});

	it('closes immediately, never on a delay', () => {
		const { onClose, controller } = setup();
		controller.open(true);
		controller.close();
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('reports each transition once', () => {
		const { onOpen, onClose, controller } = setup();
		controller.open(true);
		controller.open(true);
		expect(onOpen).toHaveBeenCalledTimes(1);
		controller.close();
		controller.close();
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('cancel drops a pending open without closing an existing one', () => {
		const { onOpen, onClose, controller } = setup();
		controller.open(true);
		controller.cancel();
		expect(onClose).not.toHaveBeenCalled();
		expect(onOpen).toHaveBeenCalledTimes(1);
	});
});
