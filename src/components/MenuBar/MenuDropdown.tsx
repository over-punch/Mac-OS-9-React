// MenuDropdown component - Mac OS 9 style
// Standalone dropdown menu sharing the MenuBar's styling

import React, { forwardRef, useCallback, useId, useLayoutEffect, useState, useRef } from 'react';
import { mergeClasses } from '../../utils/classNames';
import styles from './MenuBar.module.css';

export interface MenuDropdownProps {
	/**
	 * Menu label (displayed in the menu bar/button)
	 */
	label: React.ReactNode;

	/**
	 * Menu items (content of the dropdown)
	 */
	items: React.ReactNode;

	/**
	 * Whether the menu is disabled
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Custom class name for the menu container
	 */
	className?: string;

	/**
	 * Custom class name for menu dropdown
	 */
	dropdownClassName?: string;

	/**
	 * Preferred alignment of the dropdown menu.
	 *
	 * This is a preference, not a guarantee: if the menu would overflow the
	 * viewport it is nudged back into view. Set `avoidCollisions` to `false`
	 * to keep the alignment exactly as specified.
	 *
	 * @default 'left'
	 */
	align?: 'left' | 'right';

	/**
	 * Whether to reposition the dropdown when it would render outside the
	 * viewport — shifted horizontally, and flipped above the trigger when
	 * there is no room below.
	 *
	 * @default true
	 */
	avoidCollisions?: boolean;
}

/** Gap left between the dropdown and the viewport edge when repositioning. */
const VIEWPORT_MARGIN = 4;

/**
 * Mac OS 9 style MenuDropdown component
 *
 * A standalone dropdown menu that shares the styling of the MenuBar.
 * Useful for placing menus in the status area (rightContent) or other parts
 * of the app.
 *
 * @example
 * ```tsx
 * <MenuDropdown
 *   label="Options"
 *   align="right"
 *   items={
 *     <>
 *       <MenuItem label="Preferences…" onClick={openPrefs} />
 *       <MenuItem label="Sign out" onClick={signOut} />
 *     </>
 *   }
 * />
 * ```
 */
export const MenuDropdown = forwardRef<HTMLDivElement, MenuDropdownProps>(
	(
		{
			label,
			items,
			disabled = false,
			className = '',
			dropdownClassName = '',
			align = 'left',
			avoidCollisions = true,
		},
		ref
	) => {
		const [isOpen, setIsOpen] = useState(false);
		const [collisionOffset, setCollisionOffset] = useState<{ x: number; y: number } | null>(null);

		const containerRef = useRef<HTMLDivElement | null>(null);
		const dropdownRef = useRef<HTMLDivElement | null>(null);

		const triggerId = useId();

		// Fan the internal ref out to the forwarded one so the consumer still
		// gets the node while collision detection keeps its own handle.
		const setContainerRef = useCallback(
			(node: HTMLDivElement | null) => {
				containerRef.current = node;
				if (typeof ref === 'function') {
					ref(node);
				} else if (ref) {
					(ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
				}
			},
			[ref]
		);

		// Close when a click lands outside.
		//
		// Listens for `click` rather than `mousedown` so that dropdown content
		// rendered into a portal still receives its own click before the menu
		// unmounts. See the matching note in MenuBar.
		React.useEffect(() => {
			if (!isOpen) return;

			const handleClickOutside = (event: MouseEvent) => {
				const container = containerRef.current;
				const dropdown = dropdownRef.current;
				const target = event.target as Node;
				if (container?.contains(target) || dropdown?.contains(target)) return;
				setIsOpen(false);
			};

			document.addEventListener('click', handleClickOutside);
			return () => document.removeEventListener('click', handleClickOutside);
		}, [isOpen]);

		// Handle Escape key to close menu
		React.useEffect(() => {
			if (!isOpen) return;

			const handleEscape = (event: KeyboardEvent) => {
				if (event.key === 'Escape') {
					event.preventDefault();
					setIsOpen(false);
				}
			};

			document.addEventListener('keydown', handleEscape);
			return () => document.removeEventListener('keydown', handleEscape);
		}, [isOpen]);

		// Keep the dropdown inside the viewport.
		//
		// Without this, a menu near the right edge of the window — which is
		// exactly where a status-area menu lives — rendered partly or entirely
		// off-screen with no way to reach its items. Measured before paint so
		// the corrected position is the first one the user sees.
		useLayoutEffect(() => {
			if (!isOpen || !avoidCollisions) {
				setCollisionOffset(null);
				return;
			}

			const dropdown = dropdownRef.current;
			if (!dropdown) return;

			// Measure in the un-nudged position.
			const rect = dropdown.getBoundingClientRect();
			let x = 0;
			let y = 0;

			const overflowRight = rect.right - (window.innerWidth - VIEWPORT_MARGIN);
			if (overflowRight > 0) x -= overflowRight;

			const overflowLeft = VIEWPORT_MARGIN - (rect.left + x);
			if (overflowLeft > 0) x += overflowLeft;

			// No room below: flip above the trigger.
			const overflowBottom = rect.bottom - (window.innerHeight - VIEWPORT_MARGIN);
			if (overflowBottom > 0) {
				const trigger = containerRef.current?.getBoundingClientRect();
				const spaceAbove = trigger ? trigger.top : 0;
				y =
					rect.height + (trigger?.height ?? 0) <= spaceAbove
						? -(rect.height + (trigger?.height ?? 0))
						: -overflowBottom;
			}

			setCollisionOffset(x === 0 && y === 0 ? null : { x, y });
		}, [isOpen, avoidCollisions, items]);

		const handleToggle = () => {
			if (!disabled) {
				setIsOpen((open) => !open);
			}
		};

		const menuContainerClassNames = mergeClasses(styles.menuContainer, className);

		const menuButtonClassNames = mergeClasses(
			styles.menuButton,
			isOpen ? styles['menuButton--open'] : '',
			disabled ? styles['menuButton--disabled'] : ''
		);

		const dropdownClassNames = mergeClasses(
			styles.dropdown,
			align === 'right' ? styles['dropdown--right'] : '',
			dropdownClassName
		);

		return (
			<div ref={setContainerRef} className={menuContainerClassNames}>
				<button
					id={triggerId}
					type="button"
					className={menuButtonClassNames}
					onClick={handleToggle}
					disabled={disabled}
					aria-haspopup="menu"
					aria-expanded={isOpen}
					aria-disabled={disabled}
				>
					{/* A string label is wrapped for styling parity with MenuBar.
					    It is a span, not a heading: menu labels are not document
					    structure. */}
					{typeof label === 'string' ? <span className={styles.menuLabel}>{label}</span> : label}
				</button>

				{isOpen && (
					<div
						ref={dropdownRef}
						className={dropdownClassNames}
						role="menu"
						aria-labelledby={triggerId}
						style={
							collisionOffset
								? { transform: `translate(${collisionOffset.x}px, ${collisionOffset.y}px)` }
								: undefined
						}
						onClick={() => setIsOpen(false)} // Close when an item is clicked
					>
						{items}
					</div>
				)}
			</div>
		);
	}
);

MenuDropdown.displayName = 'MenuDropdown';

export default MenuDropdown;
