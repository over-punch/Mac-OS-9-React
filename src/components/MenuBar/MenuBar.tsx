// MenuBar component - Mac OS 9 style
// Horizontal menu bar with dropdown menus, logo support, and status area

import React, { forwardRef, useRef, useState, useEffect, useCallback } from 'react';
import { sanitizeUrl } from '../../utils/url';
import styles from './MenuBar.module.css';

export interface Menu {
	/**
	 * Menu label (displayed in the menu bar)
	 */
	label: string;

	/**
	 * Menu type - determines behavior
	 * @default 'dropdown'
	 */
	type?: 'dropdown' | 'link';

	/**
	 * Menu items (content of the dropdown)
	 * Required when type is 'dropdown'
	 */
	items?: React.ReactNode;

	/**
	 * Link href (for link-type menus)
	 * Used when type is 'link'
	 */
	href?: string;

	/**
	 * Click handler (for link-type menus)
	 * Used when type is 'link'
	 */
	onClick?: () => void;

	/**
	 * Whether the menu is disabled
	 * @default false
	 */
	disabled?: boolean;
}

export interface MenuBarProps {
	/**
	 * Array of menus to display
	 */
	menus: Menu[];

	/**
	 * Index of the currently open menu (controlled)
	 */
	openMenuIndex?: number;

	/**
	 * Callback when a menu is opened
	 */
	onMenuOpen?: (index: number) => void;

	/**
	 * Callback when menus are closed
	 */
	onMenuClose?: () => void;

	/**
	 * Custom class name for the menu bar
	 */
	className?: string;

	/**
	 * Custom class name for menu dropdowns
	 */
	dropdownClassName?: string;

	/**
	 * Content to display on the left side (typically a logo)
	 */
	leftContent?: React.ReactNode;

	/**
	 * Content to display on the right side (status items, clock, etc.)
	 * Can be a single element or array of elements
	 */
	rightContent?: React.ReactNode | React.ReactNode[];
}

/**
 * Mac OS 9 style MenuBar component
 * 
 * Horizontal menu bar with dropdown menus, logo support, and status area.
 * 
 * Features:
 * - Classic Mac OS 9 menu bar styling
 * - Horizontal menu layout
 * - Dropdown menus on click
 * - Link-type menu items for navigation
 * - Logo/icon support on the left
 * - Status area on the right (clock, system indicators, etc.)
 * - Keyboard navigation (Left/Right for menus, Up/Down for items)
 * - Click outside to close
 * - Escape key to close
 * - Controlled state (consumers manage open/closed)
 * - Disabled menu support
 * 
 * @example
 * ```tsx
 * const [openMenu, setOpenMenu] = useState<number | undefined>();
 * 
 * <MenuBar
 *   leftContent={<img src="/logo.png" alt="Logo" width={16} height={16} />}
 *   openMenuIndex={openMenu}
 *   onMenuOpen={setOpenMenu}
 *   onMenuClose={() => setOpenMenu(undefined)}
 *   menus={[
 *     {
 *       label: 'File',
 *       type: 'dropdown',
 *       items: (
 *         <>
 *           <MenuItem label="Open..." shortcut="⌘O" onClick={() => {}} />
 *           <MenuItem label="Save" shortcut="⌘S" onClick={() => {}} />
 *         </>
 *       ),
 *     },
 *     {
 *       label: 'Home',
 *       type: 'link',
 *       href: '/',
 *     },
 *   ]}
 *   rightContent={[
 *     <Clock key="clock" />,
 *     <div key="divider" className={styles.divider} />,
 *     <SystemIndicator key="indicator" />,
 *   ]}
 * />
 * ```
 */
export const MenuBar = forwardRef<HTMLDivElement, MenuBarProps>(
	({
		menus,
		openMenuIndex,
		onMenuOpen,
		onMenuClose,
		className = '',
		dropdownClassName = '',
		leftContent,
		rightContent,
	}, ref) => {
		const [menuBarElement, setMenuBarElement] = useState<HTMLDivElement | null>(null);
		const [focusedIndex, setFocusedIndex] = useState<number>(-1);
		const [internalOpenIndex, setInternalOpenIndex] = useState<number | undefined>(undefined);

		const isControlled = openMenuIndex !== undefined;
		const activeOpenIndex = isControlled ? openMenuIndex : internalOpenIndex;

		const handleMenuOpenInternal = (index: number) => {
			if (!isControlled) {
				setInternalOpenIndex(index);
			}
			onMenuOpen?.(index);
		};

		const handleMenuCloseInternal = () => {
			if (!isControlled) {
				setInternalOpenIndex(undefined);
			}
			onMenuClose?.();
		};

		// Handle click outside to close menu
		useEffect(() => {
			if (activeOpenIndex === undefined || !menuBarElement) return;

			const handleClickOutside = (event: MouseEvent) => {
				if (menuBarElement && !menuBarElement.contains(event.target as Node)) {
					handleMenuCloseInternal();
				}
			};

			document.addEventListener('mousedown', handleClickOutside);
			return () => document.removeEventListener('mousedown', handleClickOutside);
		}, [activeOpenIndex, onMenuClose, menuBarElement, isControlled]);

		// Handle Escape key to close menu
		useEffect(() => {
			if (activeOpenIndex === undefined) return;

			const handleEscape = (event: KeyboardEvent) => {
				if (event.key === 'Escape') {
					event.preventDefault();
					handleMenuCloseInternal();
				}
			};

			document.addEventListener('keydown', handleEscape);
			return () => document.removeEventListener('keydown', handleEscape);
		}, [activeOpenIndex, onMenuClose, isControlled]);

		// Handle keyboard navigation
		const handleKeyDown = useCallback(
			(event: React.KeyboardEvent) => {
				switch (event.key) {
					case 'ArrowLeft':
						event.preventDefault();
						if (activeOpenIndex !== undefined) {
							// Move to previous menu
							const prevIndex = activeOpenIndex > 0 ? activeOpenIndex - 1 : menus.length - 1;
							if (!menus[prevIndex]?.disabled) {
								handleMenuOpenInternal(prevIndex);
							}
						} else if (focusedIndex > 0) {
							setFocusedIndex(focusedIndex - 1);
						}
						break;

					case 'ArrowRight':
						event.preventDefault();
						if (activeOpenIndex !== undefined) {
							// Move to next menu
							const nextIndex = activeOpenIndex < menus.length - 1 ? activeOpenIndex + 1 : 0;
							if (!menus[nextIndex]?.disabled) {
								handleMenuOpenInternal(nextIndex);
							}
						} else if (focusedIndex < menus.length - 1) {
							setFocusedIndex(focusedIndex + 1);
						}
						break;

					case 'ArrowDown':
						event.preventDefault();
						if (activeOpenIndex === undefined && focusedIndex >= 0) {
							// Open the focused menu (only if it's a dropdown)
							const menu = menus[focusedIndex];
							if (!menu?.disabled && menu?.type !== 'link') {
								handleMenuOpenInternal(focusedIndex);
							}
						}
						break;

					case 'Enter':
					case ' ':
						event.preventDefault();
						if (activeOpenIndex === undefined && focusedIndex >= 0) {
							const menu = menus[focusedIndex];
							if (!menu?.disabled) {
								if (menu.type === 'link') {
									// Trigger click handler for link-type menu
									menu.onClick?.();
								} else {
									// Open the focused dropdown menu
									handleMenuOpenInternal(focusedIndex);
								}
							}
						}
						break;
				}
			},
			[activeOpenIndex, focusedIndex, menus, onMenuOpen, onMenuClose, isControlled]
		);

		// Handle menu button click
		const handleMenuClick = (index: number) => {
			const menu = menus[index];
			if (menu?.disabled) return;

			if (menu.type === 'link') {
				// For link-type menus, trigger the onClick handler
				menu.onClick?.();
				return;
			}

			if (activeOpenIndex === index) {
				// Clicking the same menu closes it
				handleMenuCloseInternal();
			} else {
				// Open the clicked menu
				handleMenuOpenInternal(index);
			}
		};

		// Class names
		const menuBarClassNames = [styles.menuBar, className].filter(Boolean).join(' ');

		const dropdownClassNames = [styles.dropdown, dropdownClassName].filter(Boolean).join(' ');

		// Callback ref to handle both internal state and forwarded ref
		const handleRef = useCallback(
			(node: HTMLDivElement | null) => {
				setMenuBarElement(node);
				if (typeof ref === 'function') {
					ref(node);
				} else if (ref) {
					ref.current = node;
				}
			},
			[ref]
		);

		return (
			<div ref={handleRef} className={menuBarClassNames} role="menubar" onKeyDown={handleKeyDown}>
				{/* Left content (logo) */}
				{leftContent && (
					<div className={styles.leftContent}>
						{leftContent}
					</div>
				)}

				{/* Menu items */}
				<div className={styles.menusContainer}>
					{menus.map((menu, index) => {
						const isOpen = activeOpenIndex === index;
						const isFocused = focusedIndex === index;
						const isDropdown = menu.type !== 'link';

						const menuButtonClassNames = [
							styles.menuButton,
							isOpen ? styles['menuButton--open'] : '',
							menu.disabled ? styles['menuButton--disabled'] : '',
						]
							.filter(Boolean)
							.join(' ');

						// For link-type menus, render as anchor if href is provided.
						// sanitizeUrl strips javascript:/data:/vbscript: schemes before the
						// href reaches the DOM, preventing stored-XSS when consumers wire
						// menus from CMS or user-supplied data.
						if (menu.type === 'link' && menu.href) {
							const safeHref = sanitizeUrl(menu.href);
							return (
								<div key={index} className={styles.menuContainer}>
									<a
										href={safeHref}
										className={menuButtonClassNames}
										onClick={(e) => {
											if (menu.onClick) {
												e.preventDefault();
												menu.onClick();
											}
										}}
										onFocus={() => setFocusedIndex(index)}
										onBlur={() => setFocusedIndex(-1)}
										aria-disabled={menu.disabled}
									>
										<h3>
											{menu.label}
										</h3>
									</a>
								</div>
							);
						}

						// Standard dropdown menu or link without href
						return (
							<div key={index} className={styles.menuContainer}>
								<button
									type="button"
									className={menuButtonClassNames}
									onClick={() => handleMenuClick(index)}
									onFocus={() => setFocusedIndex(index)}
									onBlur={() => setFocusedIndex(-1)}
									disabled={menu.disabled}
									aria-haspopup={isDropdown ? 'true' : undefined}
									aria-expanded={isOpen}
									aria-disabled={menu.disabled}
								>
									<h3>
										{menu.label}
									</h3>
								</button>

								{isOpen && isDropdown && menu.items && (
									<div className={dropdownClassNames} role="menu">
										{menu.items}
									</div>
								)}
							</div>
						);
					})}
				</div>

				{/* Right content (status area) */}
				{rightContent && (
					<div className={styles.rightContent}>
						{Array.isArray(rightContent)
							? rightContent.map((item, index) => (
								<React.Fragment key={index}>{item}</React.Fragment>
							))
							: rightContent
						}
					</div>
				)}
			</div>
		);
	}
);

MenuBar.displayName = 'MenuBar';

export default MenuBar;