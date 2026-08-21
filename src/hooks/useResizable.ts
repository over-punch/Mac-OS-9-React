// useResizable - resize an element by dragging a handle
//
// Supports all eight edge and corner handles (issue #27). Each direction
// contributes independently to width/height, and the two "inverse" edges
// (north, west) also report a position delta so the caller can keep the
// opposite edge visually anchored while the box grows toward the pointer.

import { useCallback, useRef } from 'react';
import { usePointerGesture } from './usePointerGesture';
import { measureContainingBlock } from './gestureGeometry';
import type { ContainingBlock } from './gestureGeometry';

/** Which edge or corner a resize handle grabs. */
export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

/** Result of a single resize frame. */
export interface ResizeRect {
	width: number;
	height: number;
	/**
	 * Position delta to apply so the anchored edge stays put. Zero except
	 * when dragging a north or west handle.
	 */
	dx: number;
	dy: number;
}

interface ResizeStart {
	direction: ResizeDirection;
	pointerX: number;
	pointerY: number;
	width: number;
	height: number;
	container: ContainingBlock;
}

export interface UseResizableOptions {
	enabled?: boolean;
	/** Resolve the element being resized from the handle event. */
	resolveTarget?: (event: React.PointerEvent<HTMLElement>) => HTMLElement | null;
	minWidth?: number;
	minHeight?: number;
	maxWidth?: number;
	maxHeight?: number;
	/** Called at most once per frame with the new geometry. */
	onResize: (rect: ResizeRect) => void;
	onResizeStart?: () => void;
	onResizeEnd?: () => void;
}

export interface UseResizableResult {
	isResizing: boolean;
	/** Whether the box is currently pinned against a min/max limit. */
	isClamped: boolean;
	/** Build the props for one directional handle. */
	getHandleProps: (direction: ResizeDirection) => {
		onPointerDown: (event: React.PointerEvent<HTMLElement>) => void;
		style: { touchAction: 'none' };
		'data-direction': ResizeDirection;
	};
}

export function useResizable(options: UseResizableOptions): UseResizableResult {
	const {
		enabled = true,
		resolveTarget,
		minWidth = 200,
		minHeight = 100,
		maxWidth,
		maxHeight,
		onResize,
		onResizeStart,
		onResizeEnd,
	} = options;

	const optionsRef = useRef({
		minWidth,
		minHeight,
		maxWidth,
		maxHeight,
		onResize,
		onResizeStart,
		onResizeEnd,
	});
	optionsRef.current = {
		minWidth,
		minHeight,
		maxWidth,
		maxHeight,
		onResize,
		onResizeStart,
		onResizeEnd,
	};

	// Which handle is currently held; read inside onStart, which has no other
	// way to learn the direction from a generic pointer event.
	const directionRef = useRef<ResizeDirection>('se');
	const clampedRef = useRef(false);

	const handleStart = useCallback(
		(event: React.PointerEvent<HTMLElement>): ResizeStart | null => {
			if (!enabled) return null;

			const element = resolveTarget ? resolveTarget(event) : (event.currentTarget as HTMLElement);
			if (!element) return null;

			event.preventDefault();
			event.stopPropagation();

			const rect = element.getBoundingClientRect();
			optionsRef.current.onResizeStart?.();

			return {
				direction: directionRef.current,
				pointerX: event.clientX,
				pointerY: event.clientY,
				width: rect.width,
				height: rect.height,
				container: measureContainingBlock(element),
			};
		},
		[enabled, resolveTarget]
	);

	const handleMove = useCallback((event: PointerEvent, start: ResizeStart) => {
		const {
			minWidth: liveMinW,
			minHeight: liveMinH,
			maxWidth: liveMaxW,
			maxHeight: liveMaxH,
			onResize: liveOnResize,
		} = optionsRef.current;

		const scale = start.container.scale;
		const deltaX = (event.clientX - start.pointerX) / scale;
		const deltaY = (event.clientY - start.pointerY) / scale;

		const { direction } = start;
		const growsEast = direction.includes('e');
		const growsWest = direction.includes('w');
		const growsSouth = direction.includes('s');
		const growsNorth = direction.includes('n');

		let width = start.width;
		let height = start.height;
		if (growsEast) width = start.width + deltaX;
		if (growsWest) width = start.width - deltaX;
		if (growsSouth) height = start.height + deltaY;
		if (growsNorth) height = start.height - deltaY;

		const unclampedWidth = width;
		const unclampedHeight = height;

		width = Math.max(liveMinW, width);
		height = Math.max(liveMinH, height);
		if (liveMaxW !== undefined) width = Math.min(liveMaxW, width);
		if (liveMaxH !== undefined) height = Math.min(liveMaxH, height);

		clampedRef.current = width !== unclampedWidth || height !== unclampedHeight;

		// A north/west drag moves the anchored edge: the box grows toward the
		// pointer, so its origin shifts by however much the size actually
		// changed (which is not the raw delta once clamping kicks in).
		const dx = growsWest ? start.width - width : 0;
		const dy = growsNorth ? start.height - height : 0;

		liveOnResize({ width, height, dx, dy });
	}, []);

	const handleEnd = useCallback(() => {
		clampedRef.current = false;
		optionsRef.current.onResizeEnd?.();
	}, []);

	const gesture = usePointerGesture<ResizeStart>({
		onStart: handleStart,
		onMove: handleMove,
		onEnd: handleEnd,
	});

	const getHandleProps = useCallback(
		(direction: ResizeDirection) => ({
			onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
				directionRef.current = direction;
				gesture.start(event);
			},
			style: { touchAction: 'none' as const },
			'data-direction': direction,
		}),
		[gesture]
	);

	return {
		isResizing: gesture.isActive,
		isClamped: clampedRef.current,
		getHandleProps,
	};
}
