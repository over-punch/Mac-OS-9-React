// useOutsideClick - dismiss on interaction outside a set of elements
//
// Consolidates the dismissal logic MenuBar and MenuDropdown each had their
// own copy of (issue #55).
//
// Listens on `pointerdown` in the capture phase but defers the callback to
// the subsequent `click`, so a control rendered in a portal still receives
// its own click before the menu closes (issue #36).

import { useEffect, useRef } from 'react';

export interface UseOutsideClickOptions {
	/** Whether the listener is active. */
	enabled?: boolean;
	/** Elements that count as "inside" — a click in any of these is ignored. */
	refs: Array<React.RefObject<HTMLElement | null>>;
	/** Called when an interaction lands outside every ref. */
	onOutside: () => void;
}

export function useOutsideClick({ enabled = true, refs, onOutside }: UseOutsideClickOptions): void {
	const onOutsideRef = useRef(onOutside);
	onOutsideRef.current = onOutside;

	const refsRef = useRef(refs);
	refsRef.current = refs;

	useEffect(() => {
		if (!enabled) return;

		const isInside = (target: Node | null): boolean => {
			if (!target) return false;
			return refsRef.current.some((ref) => ref.current?.contains(target));
		};

		// Tracks whether the gesture *started* outside. Dismissing on a click
		// whose pointerdown began inside would swallow drag-to-select gestures
		// that happen to end outside the menu.
		let startedOutside = false;

		const handlePointerDown = (event: PointerEvent) => {
			startedOutside = !isInside(event.target as Node | null);
		};

		const handleClick = (event: MouseEvent) => {
			if (!startedOutside) return;
			startedOutside = false;
			if (isInside(event.target as Node | null)) return;
			onOutsideRef.current();
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') onOutsideRef.current();
		};

		document.addEventListener('pointerdown', handlePointerDown, true);
		document.addEventListener('click', handleClick, true);
		document.addEventListener('keydown', handleEscape);

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown, true);
			document.removeEventListener('click', handleClick, true);
			document.removeEventListener('keydown', handleEscape);
		};
	}, [enabled]);
}
