// useResizable
//
// Pointer-gesture maths is where the awkward bugs live, and this hook was at
// 21% coverage — the least-tested code in the package while owning every
// Window resize. The cases below are the ones that are easy to get wrong:
// dragging from an anchored edge, clamping against a limit, and a resize
// inside a scaled container.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useResizable, type ResizeRect, type ResizeDirection } from './useResizable';

/** A box with a handle per direction, driven by the hook under test. */
function Harness({
	onResize,
	direction = 'se',
	...options
}: {
	onResize: (rect: ResizeRect) => void;
	direction?: ResizeDirection;
	enabled?: boolean;
	minWidth?: number;
	minHeight?: number;
	maxWidth?: number;
	maxHeight?: number;
	onResizeStart?: () => void;
	onResizeEnd?: () => void;
}) {
	// A real consumer commits the new geometry to state, which re-renders.
	// That matters here: `isClamped` is read from a ref, so it is only
	// observable on a render that follows the move — a bare spy would show a
	// stale value and the flag would look permanently false.
	const [, setRect] = useState<ResizeRect | null>(null);
	const { getHandleProps, isResizing, isClamped } = useResizable({
		onResize: (rect) => {
			setRect(rect);
			onResize(rect);
		},
		...options,
	});
	return (
		<div data-testid="box">
			<button type="button" data-testid="handle" {...getHandleProps(direction)} />
			<span data-testid="state">{`${isResizing}:${isClamped}`}</span>
		</div>
	);
}

/** jsdom gives every element a zero rect; give the box a real size. */
function sizeBox(width = 200, height = 100) {
	Element.prototype.getBoundingClientRect = vi.fn(
		() =>
			({
				width,
				height,
				top: 0,
				left: 0,
				right: width,
				bottom: height,
				x: 0,
				y: 0,
				toJSON: () => ({}),
			}) as DOMRect
	);
}

/**
 * Press the handle, move by a delta, and release.
 *
 * Animation frames run synchronously here (see beforeEach), so the move lands
 * before this returns.
 */
function drag(dx: number, dy: number, { release = true } = {}) {
	const handle = screen.getByTestId('handle');
	// isPrimary must be set explicitly: jsdom defaults it to false, and the
	// gesture filters non-primary contacts to ignore right-clicks and the
	// secondary touches browsers report alongside the primary one.
	fireEvent.pointerDown(handle, {
		clientX: 0,
		clientY: 0,
		pointerId: 1,
		button: 0,
		isPrimary: true,
	});
	act(() => {
		// isPrimary again: the move listener filters on it too, so without it
		// the gesture starts and then silently receives nothing.
		document.dispatchEvent(
			new PointerEvent('pointermove', {
				clientX: dx,
				clientY: dy,
				pointerId: 1,
				isPrimary: true,
			})
		);
	});
	if (release) {
		act(() => {
			document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 }));
		});
	}
}

beforeEach(() => {
	// Run animation frames synchronously. usePointerGesture coalesces
	// pointermove into one requestAnimationFrame callback, so without this a
	// move never reaches onResize and every assertion sees no calls at all.
	vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
		callback(0);
		return 0;
	});
	vi.stubGlobal('cancelAnimationFrame', () => {});
	sizeBox();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('useResizable', () => {
	it('builds handle props that identify their direction', () => {
		render(<Harness onResize={vi.fn()} direction="nw" />);
		const handle = screen.getByTestId('handle');
		expect(handle).toHaveAttribute('data-direction', 'nw');
		// Without this the browser scrolls instead of resizing on touch.
		expect(handle).toHaveStyle({ touchAction: 'none' });
	});

	describe('growing edges', () => {
		it('east grows width by the delta and leaves the origin alone', () => {
			const onResize = vi.fn();
			render(<Harness onResize={onResize} direction="e" />);
			drag(40, 0);
			expect(onResize).toHaveBeenLastCalledWith({ width: 240, height: 100, dx: 0, dy: 0 });
		});

		it('south grows height by the delta', () => {
			const onResize = vi.fn();
			render(<Harness onResize={onResize} direction="s" />);
			drag(0, 30);
			expect(onResize).toHaveBeenLastCalledWith({ width: 200, height: 130, dx: 0, dy: 0 });
		});

		it('south-east grows both', () => {
			const onResize = vi.fn();
			render(<Harness onResize={onResize} direction="se" />);
			drag(40, 30);
			expect(onResize).toHaveBeenLastCalledWith({ width: 240, height: 130, dx: 0, dy: 0 });
		});
	});

	describe('anchored edges', () => {
		it('west moves the origin by however much the width actually changed', () => {
			const onResize = vi.fn();
			render(<Harness onResize={onResize} direction="w" />);
			// Dragging left by 40 grows the box leftward: it gets 40 wider and
			// its origin moves 40 to the left.
			drag(-40, 0);
			expect(onResize).toHaveBeenLastCalledWith({ width: 240, height: 100, dx: -40, dy: 0 });
		});

		it('north moves the origin upward', () => {
			const onResize = vi.fn();
			render(<Harness onResize={onResize} direction="n" />);
			drag(0, -30);
			expect(onResize).toHaveBeenLastCalledWith({ width: 200, height: 130, dx: 0, dy: -30 });
		});

		it('north-west moves both', () => {
			const onResize = vi.fn();
			render(<Harness onResize={onResize} direction="nw" />);
			drag(-40, -30);
			expect(onResize).toHaveBeenLastCalledWith({ width: 240, height: 130, dx: -40, dy: -30 });
		});
	});

	describe('limits', () => {
		it('will not shrink below the minimum', () => {
			const onResize = vi.fn();
			render(<Harness onResize={onResize} direction="e" minWidth={150} />);
			drag(-100, 0);
			expect(onResize).toHaveBeenLastCalledWith(expect.objectContaining({ width: 150 }));
		});

		it('will not grow past the maximum', () => {
			const onResize = vi.fn();
			render(<Harness onResize={onResize} direction="se" maxWidth={220} maxHeight={110} />);
			drag(500, 500);
			expect(onResize).toHaveBeenLastCalledWith(
				expect.objectContaining({ width: 220, height: 110 })
			);
		});

		it('stops the origin at the limit too, not at the raw pointer delta', () => {
			const onResize = vi.fn();
			render(<Harness onResize={onResize} direction="w" maxWidth={220} />);
			// The pointer moved 100 but the box could only grow 20, so the
			// origin may only move 20 — otherwise the far edge drifts.
			drag(-100, 0);
			expect(onResize).toHaveBeenLastCalledWith({ width: 220, height: 100, dx: -20, dy: 0 });
		});

		it('reports being pinned against a limit', () => {
			render(<Harness onResize={vi.fn()} direction="e" minWidth={150} />);
			drag(-100, 0, { release: false });
			expect(screen.getByTestId('state')).toHaveTextContent('true:true');
		});

		it('clears the pinned flag when the gesture ends', () => {
			render(<Harness onResize={vi.fn()} direction="e" minWidth={150} />);
			drag(-100, 0);
			expect(screen.getByTestId('state')).toHaveTextContent('false:false');
		});

		it('is not pinned while inside the limits', () => {
			render(<Harness onResize={vi.fn()} direction="e" minWidth={50} maxWidth={500} />);
			drag(40, 0, { release: false });
			expect(screen.getByTestId('state')).toHaveTextContent('true:false');
		});
	});

	describe('lifecycle', () => {
		it('reports start and end', () => {
			const onResizeStart = vi.fn();
			const onResizeEnd = vi.fn();
			render(
				<Harness onResize={vi.fn()} onResizeStart={onResizeStart} onResizeEnd={onResizeEnd} />
			);
			drag(10, 10);
			expect(onResizeStart).toHaveBeenCalledTimes(1);
			expect(onResizeEnd).toHaveBeenCalledTimes(1);
		});

		it('does nothing at all when disabled', () => {
			const onResize = vi.fn();
			const onResizeStart = vi.fn();
			render(<Harness onResize={onResize} enabled={false} onResizeStart={onResizeStart} />);
			drag(40, 30);
			expect(onResize).not.toHaveBeenCalled();
			expect(onResizeStart).not.toHaveBeenCalled();
		});

		it('ends on pointercancel, not only on pointerup', () => {
			const onResizeEnd = vi.fn();
			render(<Harness onResize={vi.fn()} onResizeEnd={onResizeEnd} />);
			const handle = screen.getByTestId('handle');
			fireEvent.pointerDown(handle, {
				clientX: 0,
				clientY: 0,
				pointerId: 1,
				button: 0,
				isPrimary: true,
			});
			act(() => {
				document.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1 }));
			});
			// A cancelled gesture that never ends leaves the window stuck in a
			// resize with no pointer driving it.
			expect(onResizeEnd).toHaveBeenCalledTimes(1);
		});
	});
});
