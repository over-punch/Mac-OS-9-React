// useMenuPosition - keep a dropdown inside the viewport
//
// Dropdowns were positioned purely in CSS, directly beneath their trigger, so
// near the bottom or right edge they overflowed the viewport and were clipped
// by any ancestor with `overflow: hidden` (issue #34).
//
// This measures the menu after it opens and flips or shifts it when it would
// overflow, re-measuring on scroll and resize. It is a deliberately small
// stand-in for a full positioning library: menus here are simple, always
// anchored to their trigger, and never need middleware beyond flip + shift.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/** Resolved placement of an open menu. */
export interface MenuPosition {
	/** Style to apply to the floating menu element. */
	style: React.CSSProperties;
	/** Whether the menu was flipped above its trigger. */
	flipped: boolean;
}

export interface UseMenuPositionOptions {
	/** Whether the menu is currently open (and therefore measurable). */
	open: boolean;
	/** The trigger the menu is anchored to. */
	anchorRef: React.RefObject<HTMLElement | null>;
	/** The floating menu element. */
	menuRef: React.RefObject<HTMLElement | null>;
	/**
	 * Which trigger edge the menu aligns to.
	 * @default 'left'
	 */
	align?: 'left' | 'right';
	/**
	 * Space to keep between the menu and the viewport edge.
	 * @default 8
	 */
	padding?: number;
}

export function useMenuPosition({
	open,
	anchorRef,
	menuRef,
	align = 'left',
	padding = 8,
}: UseMenuPositionOptions): MenuPosition {
	const [position, setPosition] = useState<MenuPosition>({ style: {}, flipped: false });

	// Avoids an infinite measure→setState→measure loop: we only commit when
	// the computed values actually differ from what is already applied.
	const lastRef = useRef<string>('');

	const update = useCallback(() => {
		const anchor = anchorRef.current;
		const menu = menuRef.current;
		if (!anchor || !menu) return;

		const anchorRect = anchor.getBoundingClientRect();
		const menuRect = menu.getBoundingClientRect();
		const viewportWidth = window.innerWidth;
		const viewportHeight = window.innerHeight;

		// Flip above the trigger when there isn't room below but there is above.
		const spaceBelow = viewportHeight - anchorRect.bottom - padding;
		const spaceAbove = anchorRect.top - padding;
		const flipped = menuRect.height > spaceBelow && spaceAbove > spaceBelow;

		// Shift horizontally so the menu stays fully on screen, preferring the
		// requested alignment and only moving as far as needed.
		let left = align === 'right' ? anchorRect.right - menuRect.width : anchorRect.left;
		const maxLeft = viewportWidth - menuRect.width - padding;
		if (left > maxLeft) left = maxLeft;
		if (left < padding) left = padding;

		const top = flipped ? anchorRect.top - menuRect.height : anchorRect.bottom;

		// Clamp the height so a very long menu scrolls instead of overflowing.
		const maxHeight = flipped ? spaceAbove : spaceBelow;

		const style: React.CSSProperties = {
			position: 'fixed',
			left: `${Math.round(left)}px`,
			top: `${Math.round(top)}px`,
			maxHeight: `${Math.max(0, Math.round(maxHeight))}px`,
			overflowY: 'auto',
		};

		const signature = `${style.left}|${style.top}|${style.maxHeight}|${flipped}`;
		if (signature === lastRef.current) return;
		lastRef.current = signature;
		setPosition({ style, flipped });
	}, [anchorRef, menuRef, align, padding]);

	// Measure before paint so the menu never renders in the wrong place first.
	useLayoutEffect(() => {
		if (!open) {
			lastRef.current = '';
			return;
		}
		update();
	}, [open, update]);

	useEffect(() => {
		if (!open) return;

		// `true` captures scrolls in any ancestor, not just the window.
		window.addEventListener('scroll', update, true);
		window.addEventListener('resize', update);

		// Catches the menu's own content changing size after it opened.
		const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
		if (observer && menuRef.current) observer.observe(menuRef.current);

		return () => {
			window.removeEventListener('scroll', update, true);
			window.removeEventListener('resize', update);
			observer?.disconnect();
		};
	}, [open, update, menuRef]);

	return position;
}
