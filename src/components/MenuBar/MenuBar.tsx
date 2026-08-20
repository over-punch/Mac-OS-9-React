// MenuBar component - Mac OS 9 style
// Horizontal menu bar with dropdown menus, logo support, and status area

import React, { forwardRef, useRef, useState, useEffect, useCallback, useId } from 'react';
import { sanitizeUrl } from '../../utils/url';
import { MenuItem } from './MenuItem';
import { mergeClasses } from '../../utils/classNames';
import styles from './MenuBar.module.css';

/**
 * A dropdown entry described as data rather than JSX.
 *
 * `Menu.items` accepts either React nodes or an array of these. The data form
 * exists because the JSX-only shape made menus impossible to serialise, diff,
 * or drive from a CMS, an API response, or a config file — anything that
 * wanted a menu had to construct React elements first.
 */
export interface MenuItemData {
	/** Item label text */
	label: string;

	/** Keyboard shortcut to display, e.g. "⌘S" */
	shortcut?: string;

	/** Whether the item is disabled */
	disabled?: boolean;

	/** Whether the item shows a checkmark */
	checked?: boolean;

	/** Whether a separator line follows this item */
	separator?: boolean;

	/** Icon rendered before the label */
	icon?: React.ReactNode;

	/** Invoked when the item is chosen */
	onClick?: () => void;

	/** Nested submenu entries */
	submenu?: readonly MenuItemData[];
}

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
	 * Menu items (content of the dropdown).
	 *
	 * Either React nodes — typically `<MenuItem>` elements — or an array of
	 * {@link MenuItemData}, which MenuBar renders for you.
	 *
	 * Required when type is 'dropdown'
	 */
	items?: React.ReactNode | readonly MenuItemData[];

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
	 * Array of menus to display. Never mutated by MenuBar.
	 */
	menus: readonly Menu[];

	/**
	 * Index of the currently open menu (controlled).
	 *
	 * Pair with `onMenuOpen` / `onMenuClose`. For the uncontrolled equivalent
	 * use `defaultOpenMenuIndex`.
	 */
	openMenuIndex?: number;

	/**
	 * Index of the menu open on first render (uncontrolled).
	 *
	 * Every controllable prop in the library follows the same `X` /
	 * `defaultX` pairing — `activeTab` / `defaultActiveTab` on Tabs,
	 * `position` / `defaultPosition` on Window. MenuBar had only the
	 * controlled half.
	 */
	defaultOpenMenuIndex?: number;

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

/** Narrows `Menu.items` to the data form. */
function isMenuItemDataArray(items: Menu['items']): items is readonly MenuItemData[] {
	return Array.isArray(items) && (items.length === 0 || !React.isValidElement(items[0]));
}

/** Renders the data form of a menu into MenuItem elements. */
function renderMenuItemData(items: readonly MenuItemData[]): React.ReactNode {
	return items.map((item, index) => (
		<MenuItem
			key={`${item.label}-${index}`}
			label={item.label}
			shortcut={item.shortcut}
			disabled={item.disabled}
			checked={item.checked}
			separator={item.separator}
			icon={item.icon}
			onClick={item.onClick}
			items={item.submenu ? renderMenuItemData(item.submenu) : undefined}
		/>
	));
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
 * - Full WAI-ARIA menubar semantics with a roving tabindex
 * - Keyboard navigation (Left/Right for menus, Down to open, Escape to close)
 * - Click outside to close
 * - Controlled or uncontrolled open state
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
 *       // Data form — no JSX required
 *       items: [
 *         { label: 'Open…', shortcut: '⌘O', onClick: openFile },
 *         { label: 'Save', shortcut: '⌘S', onClick: saveFile, separator: true },
 *         { label: 'Quit', onClick: quit },
 *       ],
 *     },
 *     {
 *       label: 'Edit',
 *       type: 'dropdown',
 *       // JSX form — still supported
 *       items: <MenuItem label="Undo" shortcut="⌘Z" onClick={undo} />,
 *     },
 *     { label: 'Home', type: 'link', href: '/' },
 *   ]}
 *   rightContent={[<Clock key="clock" />]}
 * />
 * ```
 */
export const MenuBar = forwardRef<HTMLDivElement, MenuBarProps>(
	(
		{
			menus,
			openMenuIndex,
			defaultOpenMenuIndex,
			onMenuOpen,
			onMenuClose,
			className = '',
			dropdownClassName = '',
			leftContent,
			rightContent,
		},
		ref
	) => {
		const [menuBarElement, setMenuBarElement] = useState<HTMLDivElement | null>(null);
		const [focusedIndex, setFocusedIndex] = useState<number>(-1);
		const [internalOpenIndex, setInternalOpenIndex] = useState<number | undefined>(
			defaultOpenMenuIndex
		);

		// One id per MenuBar instance; each trigger derives a stable id from it
		// so its dropdown can point at it with aria-labelledby.
		const baseId = useId();
		const triggerId = (index: number) => `${baseId}-menu-${index}`;

		// Trigger elements, so keyboard navigation can move real DOM focus
		// rather than only tracking an index.
		const triggerRefs = useRef<(HTMLElement | null)[]>([]);

		const isControlled = openMenuIndex !== undefined;
		const activeOpenIndex = isControlled ? openMenuIndex : internalOpenIndex;

		const handleMenuOpenInternal = useCallback(
			(index: number) => {
				if (!isControlled) {
					setInternalOpenIndex(index);
				}
				onMenuOpen?.(index);
			},
			[isControlled, onMenuOpen]
		);

		const handleMenuCloseInternal = useCallback(() => {
			if (!isControlled) {
				setInternalOpenIndex(undefined);
			}
			onMenuClose?.();
		}, [isControlled, onMenuClose]);

		// Close when a click lands outside the menu bar.
		//
		// This listens for `click`, not `mousedown`. On mousedown the menu
		// closed before the pointer was released, so any dropdown content
		// rendered into a portal — a nested menu, a picker — unmounted before
		// its own click handler could run, and choosing such an item did
		// nothing at all. By `click` the item's handler has already fired.
		useEffect(() => {
			if (activeOpenIndex === undefined || !menuBarElement) return;

			const handleClickOutside = (event: MouseEvent) => {
				if (!menuBarElement.contains(event.target as Node)) {
					handleMenuCloseInternal();
				}
			};

			document.addEventListener('click', handleClickOutside);
			return () => document.removeEventListener('click', handleClickOutside);
		}, [activeOpenIndex, menuBarElement, handleMenuCloseInternal]);

		// Escape closes the open menu and returns focus to its trigger.
		useEffect(() => {
			if (activeOpenIndex === undefined) return;

			const handleEscape = (event: KeyboardEvent) => {
				if (event.key !== 'Escape') return;
				event.preventDefault();
				const openIndex = activeOpenIndex;
				handleMenuCloseInternal();
				triggerRefs.current[openIndex]?.focus();
			};

			document.addEventListener('keydown', handleEscape);
			return () => document.removeEventListener('keydown', handleEscape);
		}, [activeOpenIndex, handleMenuCloseInternal]);

		/** Moves focus to a trigger, skipping disabled menus. */
		const focusTrigger = useCallback(
			(startIndex: number, step: 1 | -1) => {
				const count = menus.length;
				if (count === 0) return;

				for (let offset = 0; offset < count; offset += 1) {
					const index = (((startIndex + step * offset) % count) + count) % count;
					if (menus[index]?.disabled) continue;
					setFocusedIndex(index);
					triggerRefs.current[index]?.focus();
					// If a menu was already open, opening the newly focused one
					// matches how a menu bar behaves once it is "active".
					if (activeOpenIndex !== undefined && menus[index]?.type !== 'link') {
						handleMenuOpenInternal(index);
					}
					return;
				}
			},
			[menus, activeOpenIndex, handleMenuOpenInternal]
		);

		// Keyboard navigation, per the WAI-ARIA menubar pattern.
		const handleKeyDown = useCallback(
			(event: React.KeyboardEvent) => {
				const current = focusedIndex >= 0 ? focusedIndex : (activeOpenIndex ?? 0);

				switch (event.key) {
					case 'ArrowLeft':
						event.preventDefault();
						focusTrigger(current - 1, -1);
						break;

					case 'ArrowRight':
						event.preventDefault();
						focusTrigger(current + 1, 1);
						break;

					case 'Home':
						event.preventDefault();
						focusTrigger(0, 1);
						break;

					case 'End':
						event.preventDefault();
						focusTrigger(menus.length - 1, -1);
						break;

					case 'ArrowDown': {
						event.preventDefault();
						const menu = menus[current];
						if (menu && !menu.disabled && menu.type !== 'link') {
							handleMenuOpenInternal(current);
						}
						break;
					}

					case 'Enter':
					case ' ': {
						event.preventDefault();
						const menu = menus[current];
						if (!menu || menu.disabled) break;
						if (menu.type === 'link') {
							menu.onClick?.();
						} else if (activeOpenIndex === current) {
							handleMenuCloseInternal();
						} else {
							handleMenuOpenInternal(current);
						}
						break;
					}
				}
			},
			[
				activeOpenIndex,
				focusedIndex,
				menus,
				focusTrigger,
				handleMenuOpenInternal,
				handleMenuCloseInternal,
			]
		);

		// Handle menu button click
		const handleMenuClick = (index: number) => {
			const menu = menus[index];
			if (!menu || menu.disabled) return;

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
		const menuBarClassNames = mergeClasses(styles.menuBar, className);
		const dropdownClassNames = mergeClasses(styles.dropdown, dropdownClassName);

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

		// Roving tabindex: exactly one trigger is in the tab order at a time,
		// and the arrow keys move between them. Without this, every menu was a
		// separate tab stop, which is not how a menu bar is meant to behave.
		const rovingIndex = focusedIndex >= 0 ? focusedIndex : (activeOpenIndex ?? 0);

		return (
			<div ref={handleRef} className={menuBarClassNames} role="menubar" onKeyDown={handleKeyDown}>
				{/* Left content (logo) */}
				{leftContent && <div className={styles.leftContent}>{leftContent}</div>}

				{/* Menu items */}
				<div className={styles.menusContainer}>
					{menus.map((menu, index) => {
						const isOpen = activeOpenIndex === index;
						const isDropdown = menu.type !== 'link';
						const id = triggerId(index);

						const menuButtonClassNames = mergeClasses(
							styles.menuButton,
							isOpen ? styles['menuButton--open'] : '',
							menu.disabled ? styles['menuButton--disabled'] : ''
						);

						// The label used to be an <h3>, which put a heading into the
						// document outline for every menu — so a page with a menu bar
						// announced "File, heading level 3" and polluted screen-reader
						// heading navigation. It is a span now, styled to match.
						const label = <span className={styles.menuLabel}>{menu.label}</span>;

						// For link-type menus, render as anchor if href is provided.
						// sanitizeUrl strips javascript:/data:/vbscript: schemes before the
						// href reaches the DOM, preventing stored-XSS when consumers wire
						// menus from CMS or user-supplied data.
						if (menu.type === 'link' && menu.href) {
							const safeHref = sanitizeUrl(menu.href);
							return (
								<div key={index} className={styles.menuContainer}>
									<a
										id={id}
										ref={(node) => {
											triggerRefs.current[index] = node;
										}}
										href={safeHref}
										className={menuButtonClassNames}
										role="menuitem"
										tabIndex={index === rovingIndex ? 0 : -1}
										onClick={(e) => {
											if (menu.onClick) {
												e.preventDefault();
												menu.onClick();
											}
										}}
										onFocus={() => setFocusedIndex(index)}
										aria-disabled={menu.disabled}
									>
										{label}
									</a>
								</div>
							);
						}

						// Standard dropdown menu or link without href
						return (
							<div key={index} className={styles.menuContainer}>
								<button
									id={id}
									ref={(node) => {
										triggerRefs.current[index] = node;
									}}
									type="button"
									className={menuButtonClassNames}
									role="menuitem"
									tabIndex={index === rovingIndex ? 0 : -1}
									onClick={() => handleMenuClick(index)}
									onFocus={() => setFocusedIndex(index)}
									disabled={menu.disabled}
									aria-haspopup={isDropdown ? 'menu' : undefined}
									aria-expanded={isDropdown ? isOpen : undefined}
									aria-disabled={menu.disabled}
								>
									{label}
								</button>

								{isOpen && isDropdown && menu.items && (
									// aria-labelledby ties the dropdown back to the trigger
									// that opened it, so assistive tech announces "File menu"
									// rather than an anonymous menu.
									<div className={dropdownClassNames} role="menu" aria-labelledby={id}>
										{isMenuItemDataArray(menu.items)
											? renderMenuItemData(menu.items)
											: (menu.items as React.ReactNode)}
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
							: rightContent}
					</div>
				)}
			</div>
		);
	}
);

MenuBar.displayName = 'MenuBar';

export default MenuBar;
