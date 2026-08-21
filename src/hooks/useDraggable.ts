// useDraggable - drag an absolutely-positioned element by a handle
//
// Extracted from Window (issue #55) so Dialog, FolderList and any future
// composite get identical drag behaviour instead of re-implementing the
// document-listener lifecycle.

import { useCallback, useRef } from 'react';
import { usePointerGesture } from './usePointerGesture';
import { clamp, measureContainingBlock, measureOffset } from './gestureGeometry';
import type { ContainingBlock } from './gestureGeometry';

/** A point in the dragged element's containing-block coordinate system. */
export interface DragPoint {
	x: number;
	y: number;
}

/** State captured once at pointerdown and reused for the whole gesture. */
interface DragStart {
	/** Pointer position at gesture start, in client coordinates. */
	pointerX: number;
	pointerY: number;
	/** Element offset at gesture start, in local coordinates. */
	originX: number;
	originY: number;
	/** Rendered size of the dragged element, in local pixels. */
	width: number;
	height: number;
	/** Containing block measured once, never re-read mid-drag. */
	container: ContainingBlock;
}

export interface UseDraggableOptions {
	/** Whether dragging is currently permitted. */
	enabled?: boolean;

	/**
	 * Resolve the element that should move from the event target. Defaults to
	 * the handle's `currentTarget`, which suits a handle that *is* the element.
	 */
	resolveTarget?: (event: React.PointerEvent<HTMLElement>) => HTMLElement | null;

	/**
	 * How movement is constrained. `'parent'` keeps at least `boundaryBuffer`
	 * pixels of the element inside its containing block so it can't be flung
	 * out of reach; `'none'` applies no constraint.
	 * @default 'parent'
	 */
	boundary?: 'parent' | 'none';

	/**
	 * Pixels of the element that must remain reachable under `'parent'`.
	 * @default 24
	 */
	boundaryBuffer?: number;

	/** Called with the new position on each animation frame of the drag. */
	onDrag: (position: DragPoint) => void;

	/** Called once when the drag begins. */
	onDragStart?: () => void;

	/** Called once when the drag ends. */
	onDragEnd?: () => void;
}

export interface UseDraggableResult {
	/** Whether a drag is currently in flight. */
	isDragging: boolean;
	/** Spread onto the drag handle element. */
	handleProps: {
		onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
		style: { touchAction: 'none' } | undefined;
	};
}

export function useDraggable(options: UseDraggableOptions): UseDraggableResult {
	const {
		enabled = true,
		resolveTarget,
		boundary = 'parent',
		boundaryBuffer = 24,
		onDrag,
		onDragStart,
		onDragEnd,
	} = options;

	// Read through a ref so the gesture never re-binds on a prop identity change.
	const optionsRef = useRef({ boundary, boundaryBuffer, onDrag, onDragStart, onDragEnd });
	optionsRef.current = { boundary, boundaryBuffer, onDrag, onDragStart, onDragEnd };

	const handleStart = useCallback(
		(event: React.PointerEvent<HTMLElement>): DragStart | null => {
			if (!enabled) return null;

			// Never start a drag from an interactive control inside the handle
			// — the window's own close/minimize buttons live there.
			if ((event.target as HTMLElement).closest('button, a[href], input, select, textarea')) {
				return null;
			}

			const element = resolveTarget ? resolveTarget(event) : (event.currentTarget as HTMLElement);
			if (!element) return null;

			event.preventDefault();

			const origin = measureOffset(element);
			const container = measureContainingBlock(element);

			optionsRef.current.onDragStart?.();

			return {
				pointerX: event.clientX,
				pointerY: event.clientY,
				originX: origin.x,
				originY: origin.y,
				width: element.offsetWidth,
				height: element.offsetHeight,
				container,
			};
		},
		[enabled, resolveTarget]
	);

	const handleMove = useCallback((event: PointerEvent, start: DragStart) => {
		const {
			boundary: liveBoundary,
			boundaryBuffer: liveBuffer,
			onDrag: liveOnDrag,
		} = optionsRef.current;

		// Pure delta maths — no layout reads during the gesture.
		const scale = start.container.scale;
		let x = start.originX + (event.clientX - start.pointerX) / scale;
		let y = start.originY + (event.clientY - start.pointerY) / scale;

		if (liveBoundary === 'parent') {
			// Keep `liveBuffer` px of the element inside the container on every
			// edge. The top is clamped at 0 because a title bar dragged above
			// the container is unreachable rather than merely clipped.
			x = clamp(x, liveBuffer - start.width, start.container.width - liveBuffer);
			y = clamp(y, 0, start.container.height - liveBuffer);
		}

		liveOnDrag({ x, y });
	}, []);

	const handleEnd = useCallback(() => {
		optionsRef.current.onDragEnd?.();
	}, []);

	const gesture = usePointerGesture<DragStart>({
		onStart: handleStart,
		onMove: handleMove,
		onEnd: handleEnd,
	});

	return {
		isDragging: gesture.isActive,
		handleProps: {
			onPointerDown: gesture.start,
			// touch-action:none stops the browser claiming the gesture for
			// scrolling before our pointermove handler ever runs.
			style: enabled ? { touchAction: 'none' as const } : undefined,
		},
	};
}
