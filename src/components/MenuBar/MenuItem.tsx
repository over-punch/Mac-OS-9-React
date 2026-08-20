// MenuItem component - Mac OS 9 style
// Individual menu item for use within MenuBar

import React, { forwardRef, useCallback, useRef, useState } from 'react';
import styles from './MenuItem.module.css';

export interface MenuItemProps {
	/**
	 * Menu item label text
	 */
	label: string;

	/**
	 * Optional keyboard shortcut to display (e.g., "⌘S", "Ctrl+O").
	 *
	 * The displayed form is also exposed to assistive tech via
	 * `aria-keyshortcuts`, translated into the format that attribute requires
	 * (`⌘S` becomes `Meta+S`). Pass {@link MenuItemProps.keyShortcut} if the
	 * automatic translation is wrong for your notation.
	 */
	shortcut?: string;

	/**
	 * Explicit `aria-keyshortcuts` value, overriding the value derived from
	 * `shortcut`. Use the format from the ARIA specification — modifiers
	 * `Alt`, `Control`, `Meta`, `Shift`, joined to the key with `+`.
	 *
	 * @example "Meta+Shift+S"
	 */
	keyShortcut?: string;

	/**
	 * Whether the menu item is disabled
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Whether the menu item is selected/active
	 * @default false
	 */
	selected?: boolean;

	/**
	 * Whether the menu item has a separator after it
	 * @default false
	 */
	separator?: boolean;

	/**
	 * Whether the menu item has a checkmark (for toggle items)
	 * @default false
	 */
	checked?: boolean;

	/**
	 * Optional icon to display before the label
	 */
	icon?: React.ReactNode;

	/**
	 * Callback when menu item is clicked
	 */
	onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

	/**
	 * Callback when menu item is focused
	 */
	onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;

	/**
	 * Callback when menu item loses focus
	 */
	onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;

	/**
	 * Custom class name for the menu item
	 */
	className?: string;

	/**
	 * Whether the item has a submenu indicator (arrow)
	 * @default false
	 */
	hasSubmenu?: boolean;

	/**
	 * Submenu items
	 */
	items?: React.ReactNode;
}

/**
 * Modifier glyphs and words, mapped to the modifier names that
 * `aria-keyshortcuts` accepts.
 */
const SHORTCUT_MODIFIERS: ReadonlyArray<readonly [RegExp, string]> = [
	[/⌘|cmd|command/gi, 'Meta'],
	[/⌥|opt|option/gi, 'Alt'],
	[/⇧|shift/gi, 'Shift'],
	[/⌃|ctrl|control/gi, 'Control'],
];

/**
 * Converts a displayed shortcut into an `aria-keyshortcuts` value.
 *
 * A menu item that shows "⌘S" communicates nothing to a screen reader: the
 * glyph is not announced as a key combination and there is no attribute
 * carrying the binding. This produces "Meta+S" for that attribute while the
 * visible text stays as designed.
 */
function toAriaKeyShortcuts(shortcut: string | undefined): string | undefined {
	if (!shortcut) return undefined;

	let result = shortcut.trim();
	for (const [pattern, name] of SHORTCUT_MODIFIERS) {
		result = result.replace(pattern, `${name}+`);
	}

	// Collapse the separators that the source notation may or may not have
	// used, then drop any trailing one.
	result = result
		.replace(/\s*\+\s*/g, '+')
		.replace(/\++/g, '+')
		.replace(/\+$/, '');

	return result.length > 0 ? result : undefined;
}

/**
 * Mac OS 9 style MenuItem component
 * 
 * Individual menu item for use within MenuBar or dropdown menus.
 * 
 * Features:
 * - Classic Mac OS 9 menu item styling
 * - Disabled state support
 * - Keyboard shortcut display
 * - Checkmark support for toggle items
 * - Separator support
 * - Selected/active state
 * - Icon support
 * - Submenu indicator
 * - Full keyboard and mouse support
 * 
 * @example
 * ```tsx
 * // Basic menu item
 * <MenuItem label="Open..." onClick={() => console.log('Open')} />
 * 
 * // With keyboard shortcut
 * <MenuItem label="Save" shortcut="⌘S" onClick={() => console.log('Save')} />
 * 
 * // Disabled item
 * <MenuItem label="Undo" disabled />
 * 
 * // Checked item (toggle)
 * <MenuItem label="Show Grid" checked onClick={() => console.log('Toggle')} />
 * 
 * // With separator
 * <MenuItem label="Preferences..." separator onClick={() => console.log('Prefs')} />
 * 
 * // With submenu indicator
 * <MenuItem label="Recent Files" hasSubmenu />
 * ```
 */
export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(
	(
		{
			label,
			shortcut,
			keyShortcut,
			disabled = false,
			selected = false,
			separator = false,
			checked = false,
			icon,
			onClick,
			onFocus,
			onBlur,
			className = '',
			hasSubmenu = false,
			items,
		},
		ref
	) => {
		const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
		const effectiveHasSubmenu = hasSubmenu || !!items;

		// Internal refs to the trigger button and submenu container, used by the
		// keyboard handler to move focus into / out of the submenu. The trigger
		// ref is fanned out so the consumer's forwardRef still receives the node.
		const buttonRef = useRef<HTMLButtonElement | null>(null);
		const submenuRef = useRef<HTMLDivElement | null>(null);

		const setButtonRef = useCallback(
			(node: HTMLButtonElement | null) => {
				buttonRef.current = node;
				if (typeof ref === 'function') ref(node);
				else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
			},
			[ref]
		);

		// Class names
		const menuItemClassNames = [
			styles.menuItem,
			selected ? styles['menuItem--selected'] : '',
			disabled ? styles['menuItem--disabled'] : '',
			separator ? styles['menuItem--separator'] : '',
			className,
		]
			.filter(Boolean)
			.join(' ');

		// Handle click
		const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
			if (disabled) {
				event.preventDefault();
				return;
			}
			onClick?.(event);
		};

		// WAI-ARIA menu pattern: ArrowRight opens the submenu and moves focus
		// to its first item; ArrowLeft closes the submenu and returns focus
		// to the parent. Hover behavior (mouse enter/leave) is unchanged.
		const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
			if (!effectiveHasSubmenu || disabled) return;
			if (event.key === 'ArrowRight') {
				event.preventDefault();
				setIsSubmenuOpen(true);
				// Defer focus until after the submenu renders.
				queueMicrotask(() => {
					const firstItem =
						submenuRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
					firstItem?.focus();
				});
			} else if (event.key === 'ArrowLeft' && isSubmenuOpen) {
				event.preventDefault();
				setIsSubmenuOpen(false);
				buttonRef.current?.focus();
			}
		};

		return (
			<div
				className={styles.menuItemContainer}
				onMouseEnter={() => setIsSubmenuOpen(true)}
				onMouseLeave={() => setIsSubmenuOpen(false)}
				style={{ position: 'relative', width: '100%' }}
			>
				<button
					ref={setButtonRef}
					type="button"
					className={menuItemClassNames}
					onClick={handleClick}
					onKeyDown={handleKeyDown}
					onFocus={onFocus}
					onBlur={onBlur}
					disabled={disabled}
					// aria-checked is only valid on menuitemcheckbox /
					// menuitemradio, never on a plain menuitem, so the role
					// follows the presence of a checked state.
					role={checked ? 'menuitemcheckbox' : 'menuitem'}
					aria-disabled={disabled}
					aria-checked={checked ? 'true' : undefined}
					aria-keyshortcuts={keyShortcut ?? toAriaKeyShortcuts(shortcut)}
					aria-haspopup={effectiveHasSubmenu ? 'menu' : undefined}
					aria-expanded={effectiveHasSubmenu ? isSubmenuOpen : undefined}
				>
					{/* Checkmark area */}
					<span className={styles.checkmark}>{checked && '✓'}</span>

					{/* Icon area */}
					{icon && <span className={styles.icon}>{icon}</span>}

					{/* Label */}
					<span className={styles.label}>{label}</span>

					{/* Shortcut */}
					{shortcut && (
						<span className={styles.shortcut} aria-hidden="true">
							{shortcut}
						</span>
					)}

					{/* Submenu indicator */}
					{effectiveHasSubmenu && (
						<span className={styles.submenuArrow} aria-hidden="true">
							▶
						</span>
					)}
				</button>

				{/* Submenu */}
				{items && isSubmenuOpen && (
					<div ref={submenuRef} className={styles.submenu} role="menu">
						{items}
					</div>
				)}

				{/* Separator line if needed */}
				{separator && <div className={styles.separatorLine} role="separator" />}
			</div>
		);
	}
);

MenuItem.displayName = 'MenuItem';

export default MenuItem;
