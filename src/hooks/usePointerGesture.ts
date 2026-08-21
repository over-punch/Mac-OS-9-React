// usePointerGesture - shared pointer-drag lifecycle primitive
//
// Every drag-like interaction in the library follows the same shape:
// pointerdown captures some start state, pointermove updates from it, and
// pointerup/pointercancel tears down. Before this hook, Window, Scrollbar,
// MenuBar and MenuDropdown each re-implemented that lifecycle with their own
// document-level listeners (issue #55).
//
// Two behaviours are baked in so every consumer gets them for free:
//  - Moves are coalesced into a single requestAnimationFrame callback, so a
//    240Hz pointer can't drive more than one state update per frame (#21).
//  - Listeners attach once per gesture and read callbacks through a ref, so a
//    parent re-render mid-drag can't detach them and drop move events.

import { useCallback, useEffect, useRef, useState } from 'react';

export interface PointerGestureHandlers<TStart> {
	/**
	 * Called on pointerdown. Return the gesture's start state, or `null` to
	 * decline the gesture (wrong button, disabled, clicked a child control).
	 */
	onStart: (event: React.PointerEvent<HTMLElement>) => TStart | null;

	/**
	 * Called at most once per animation frame while the pointer moves, with
	 * the most recent pointer event and the state returned by `onStart`.
	 */
	onMove: (event: PointerEvent, start: TStart) => void;

	/**
	 * Called once when the gesture ends (pointerup or pointercancel).
	 */
	onEnd?: (start: TStart) => void;
}

export interface PointerGesture {
	/** Whether a gesture is currently in flight. */
	isActive: boolean;
	/** Attach to the target element's `onPointerDown`. */
	start: (event: React.PointerEvent<HTMLElement>) => void;
}

export function usePointerGesture<TStart>(
	handlers: PointerGestureHandlers<TStart>
): PointerGesture {
	const [isActive, setIsActive] = useState(false);

	// Latest-callback ref: lets the effect below depend only on `isActive`,
	// so listeners survive parent re-renders mid-gesture.
	const handlersRef = useRef(handlers);
	handlersRef.current = handlers;

	const startStateRef = useRef<TStart | null>(null);

	const start = useCallback((event: React.PointerEvent<HTMLElement>) => {
		// Primary button / primary contact only. Filters right-click and the
		// secondary touches browsers report alongside the primary one.
		if (event.button !== 0 || !event.isPrimary) return;

		const startState = handlersRef.current.onStart(event);
		if (startState === null) return;

		startStateRef.current = startState;
		setIsActive(true);
	}, []);

	useEffect(() => {
		if (!isActive) return;

		// rAF coalescing: pointermove can fire well above display refresh
		// rate. We keep only the newest event and flush it once per frame.
		let frame: number | null = null;
		let pendingEvent: PointerEvent | null = null;

		const flush = () => {
			frame = null;
			const event = pendingEvent;
			pendingEvent = null;
			const startState = startStateRef.current;
			if (!event || startState === null) return;
			handlersRef.current.onMove(event, startState);
		};

		const handlePointerMove = (event: PointerEvent) => {
			if (!event.isPrimary) return;
			event.preventDefault();
			pendingEvent = event;
			if (frame === null) frame = requestAnimationFrame(flush);
		};

		const handlePointerEnd = () => {
			// Flush any move still queued so the gesture ends on the exact
			// final pointer position rather than the last painted frame.
			if (frame !== null) {
				cancelAnimationFrame(frame);
				flush();
			}
			const startState = startStateRef.current;
			startStateRef.current = null;
			setIsActive(false);
			if (startState !== null) handlersRef.current.onEnd?.(startState);
		};

		document.addEventListener('pointermove', handlePointerMove);
		document.addEventListener('pointerup', handlePointerEnd);
		document.addEventListener('pointercancel', handlePointerEnd);

		return () => {
			if (frame !== null) cancelAnimationFrame(frame);
			document.removeEventListener('pointermove', handlePointerMove);
			document.removeEventListener('pointerup', handlePointerEnd);
			document.removeEventListener('pointercancel', handlePointerEnd);
		};
	}, [isActive]);

	return { isActive, start };
}
