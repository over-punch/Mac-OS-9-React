// useDraggable
//
// The sibling of useResizable, and the same class of code: pointer maths where
// a sign error or a missing clamp produces a window you can throw off screen
// and never get back.
//
// Three harness details are load-bearing, and were each learned the hard way
// while covering useResizable:
//
//   - The gesture filters on `event.isPrimary`, which jsdom defaults to false.
//     Without it the gesture starts and then silently receives nothing.
//   - Moves are coalesced into a requestAnimationFrame callback, so the frame
//     has to run or `onDrag` is never called.
//   - jsdom gives every element a zero rect and zero offsets, so anything the
//     hook measures has to be stubbed or the maths is all zeroes.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useDraggable, type DragPoint } from './useDraggable';

/** Size of the element being dragged, in local pixels. */
const WIDTH = 200;
const HEIGHT = 100;

/** Size of the containing block the boundary is measured against. */
const CONTAINER = 1000;

function Harness({
	onDrag,
	...options
}: {
	onDrag: (point: DragPoint) => void;
	enabled?: boolean;
	boundary?: 'parent' | 'none';
	boundaryBuffer?: number;
	onDragStart?: () => void;
	onDragEnd?: () => void;
}) {
	const { handleProps, isDragging } = useDraggable({ onDrag, ...options });
	return (
		<div>
			<div data-testid="handle" {...handleProps}>
				Title bar
				<button type="button">Close</button>
			</div>
			<span data-testid="state">{String(isDragging)}</span>
		</div>
	);
}

/**
 * Give the dragged element a real size, a starting offset, and a containing
 * block. jsdom reports zero for all three, which would make every assertion
 * pass trivially against zeroes.
 */
function stubLayout({ originX = 0, originY = 0 } = {}) {
	Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
		configurable: true,
		get: () => WIDTH,
	});
	Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
		configurable: true,
		get: () => HEIGHT,
	});
	Object.defineProperty(HTMLElement.prototype, 'offsetLeft', {
		configurable: true,
		get: () => originX,
	});
	Object.defineProperty(HTMLElement.prototype, 'offsetTop', {
		configurable: true,
		get: () => originY,
	});
	// offsetParent drives measureContainingBlock; a null one falls back to the
	// viewport, which is a different code path.
	Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
		configurable: true,
		get: () => document.body,
	});
	Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
		configurable: true,
		get: () => CONTAINER,
	});
	Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
		configurable: true,
		get: () => CONTAINER,
	});
	Element.prototype.getBoundingClientRect = vi.fn(
		() =>
			({
				width: WIDTH,
				height: HEIGHT,
				top: 0,
				left: 0,
				right: WIDTH,
				bottom: HEIGHT,
				x: 0,
				y: 0,
				toJSON: () => ({}),
			}) as DOMRect
	);
}

/** Press the handle, move by a delta, and release. */
function drag(dx: number, dy: number, { release = true, from = 'handle' } = {}) {
	const target = screen.getByTestId(from);
	fireEvent.pointerDown(target, {
		clientX: 0,
		clientY: 0,
		pointerId: 1,
		button: 0,
		isPrimary: true,
	});
	act(() => {
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
	// Animation frames run synchronously; the gesture coalesces moves into one.
	vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
		callback(0);
		return 0;
	});
	vi.stubGlobal('cancelAnimationFrame', () => {});
	stubLayout();
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('useDraggable', () => {
	it('claims the gesture from the browser on touch', () => {
		render(<Harness onDrag={vi.fn()} />);
		// Without touch-action:none the browser scrolls instead, and pointermove
		// never reaches us.
		expect(screen.getByTestId('handle')).toHaveStyle({ touchAction: 'none' });
	});

	it('drops the style when dragging is off, so the browser keeps scrolling', () => {
		render(<Harness onDrag={vi.fn()} enabled={false} />);
		expect(screen.getByTestId('handle')).not.toHaveStyle({ touchAction: 'none' });
	});

	describe('movement', () => {
		it('moves by the pointer delta from where it started', () => {
			const onDrag = vi.fn();
			render(<Harness onDrag={onDrag} boundary="none" />);
			drag(40, 30);
			expect(onDrag).toHaveBeenLastCalledWith({ x: 40, y: 30 });
		});

		it('adds the delta to an element that did not start at the origin', () => {
			stubLayout({ originX: 120, originY: 80 });
			const onDrag = vi.fn();
			render(<Harness onDrag={onDrag} boundary="none" />);
			drag(40, 30);
			expect(onDrag).toHaveBeenLastCalledWith({ x: 160, y: 110 });
		});

		it('moves negatively when the pointer goes back', () => {
			stubLayout({ originX: 300, originY: 300 });
			const onDrag = vi.fn();
			render(<Harness onDrag={onDrag} boundary="none" />);
			drag(-50, -60);
			expect(onDrag).toHaveBeenLastCalledWith({ x: 250, y: 240 });
		});
	});

	describe('boundary', () => {
		it('keeps a strip of the element reachable on the right', () => {
			const onDrag = vi.fn();
			render(<Harness onDrag={onDrag} boundaryBuffer={24} />);
			drag(5000, 0);
			// The element may go no further than the container width less the
			// buffer, or it could be flung out of reach entirely.
			expect(onDrag).toHaveBeenLastCalledWith({ x: CONTAINER - 24, y: 0 });
		});

		it('keeps a strip reachable on the left', () => {
			const onDrag = vi.fn();
			render(<Harness onDrag={onDrag} boundaryBuffer={24} />);
			drag(-5000, 0);
			// Most of the element may leave to the left, but `buffer` px of its
			// right edge must remain: x floors at buffer - width.
			expect(onDrag).toHaveBeenLastCalledWith({ x: 24 - WIDTH, y: 0 });
		});

		it('will not let the title bar go above the container', () => {
			const onDrag = vi.fn();
			render(<Harness onDrag={onDrag} />);
			drag(0, -5000);
			// Clamped at 0 rather than at a negative buffer: a title bar dragged
			// above its container is unreachable, not merely clipped.
			expect(onDrag).toHaveBeenLastCalledWith({ x: 0, y: 0 });
		});

		it('keeps a strip reachable at the bottom', () => {
			const onDrag = vi.fn();
			render(<Harness onDrag={onDrag} boundaryBuffer={24} />);
			drag(0, 5000);
			expect(onDrag).toHaveBeenLastCalledWith({ x: 0, y: CONTAINER - 24 });
		});

		it('honours a custom buffer', () => {
			const onDrag = vi.fn();
			render(<Harness onDrag={onDrag} boundaryBuffer={100} />);
			drag(5000, 0);
			expect(onDrag).toHaveBeenLastCalledWith({ x: CONTAINER - 100, y: 0 });
		});

		it('applies no constraint at all when boundary is none', () => {
			const onDrag = vi.fn();
			render(<Harness onDrag={onDrag} boundary="none" />);
			drag(5000, 5000);
			expect(onDrag).toHaveBeenLastCalledWith({ x: 5000, y: 5000 });
		});
	});

	describe('what must not start a drag', () => {
		it('ignores a press on a button inside the handle', () => {
			const onDrag = vi.fn();
			const onDragStart = vi.fn();
			render(<Harness onDrag={onDrag} onDragStart={onDragStart} />);

			// The window's own close and zoom boxes live in the title bar.
			// Pressing one must not drag the window out from under the pointer.
			const close = screen.getByRole('button', { name: 'Close' });
			fireEvent.pointerDown(close, {
				clientX: 0,
				clientY: 0,
				pointerId: 1,
				button: 0,
				isPrimary: true,
			});
			act(() => {
				document.dispatchEvent(
					new PointerEvent('pointermove', {
						clientX: 40,
						clientY: 40,
						pointerId: 1,
						isPrimary: true,
					})
				);
			});

			expect(onDragStart).not.toHaveBeenCalled();
			expect(onDrag).not.toHaveBeenCalled();
		});

		it('does nothing when disabled', () => {
			const onDrag = vi.fn();
			const onDragStart = vi.fn();
			render(<Harness onDrag={onDrag} enabled={false} onDragStart={onDragStart} />);
			drag(40, 30);
			expect(onDragStart).not.toHaveBeenCalled();
			expect(onDrag).not.toHaveBeenCalled();
		});
	});

	describe('lifecycle', () => {
		it('reports start and end once each', () => {
			const onDragStart = vi.fn();
			const onDragEnd = vi.fn();
			render(<Harness onDrag={vi.fn()} onDragStart={onDragStart} onDragEnd={onDragEnd} />);
			drag(10, 10);
			expect(onDragStart).toHaveBeenCalledTimes(1);
			expect(onDragEnd).toHaveBeenCalledTimes(1);
		});

		it('reports that a drag is in flight, and that it has finished', () => {
			render(<Harness onDrag={vi.fn()} />);
			drag(10, 10, { release: false });
			expect(screen.getByTestId('state')).toHaveTextContent('true');
			act(() => {
				document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 }));
			});
			expect(screen.getByTestId('state')).toHaveTextContent('false');
		});

		it('ends on pointercancel, not only on pointerup', () => {
			const onDragEnd = vi.fn();
			render(<Harness onDrag={vi.fn()} onDragEnd={onDragEnd} />);
			fireEvent.pointerDown(screen.getByTestId('handle'), {
				clientX: 0,
				clientY: 0,
				pointerId: 1,
				button: 0,
				isPrimary: true,
			});
			act(() => {
				document.dispatchEvent(new PointerEvent('pointercancel', { pointerId: 1 }));
			});
			// A cancelled gesture that never ends leaves the window stuck to the
			// pointer with nothing driving it.
			expect(onDragEnd).toHaveBeenCalledTimes(1);
		});
	});
});
