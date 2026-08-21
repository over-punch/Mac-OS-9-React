// MenuItem component - Mac OS 9 style
// Individual menu item for use within MenuBar

import React, { forwardRef, useCallback, useRef, useState } from 'react';
import { mergeClasses } from '../../utils/classNames';
import styles from './MenuItem.module.css';

/**
 * Classes for targeting MenuItem sub-elements.
 */
export interface MenuItemClasses {
	/** Container wrapping the item and any submenu. */
	root?: string;
	/** The item button itself. */
	item?: string;
	/** The label text. */
	label?: string;
	/** The keyboard shortcut. */
	shortcut?: string;
	/** The checkmark slot. */
	checkmark?: string;
	/** Wrapper around `icon`. */
	icon?: string;
	/** An open submenu panel. */
	submenu?: string;
}

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
	 * Whether the item is currently checked.
	 *
	 * Setting this at all — to `false` included — makes the item a checkable
	 * one, which is what tells assistive technology it is an option rather
	 * than a command. Leave it `undefined` for a plain command item.
	 */
	checked?: boolean;

	/**
	 * How a checkable item relates to its neighbours: an independent toggle
	 * (`'checkbox'`) or one option in a mutually exclusive set (`'radio'`).
	 *
	 * Only meaningful alongside `checked`. A set of flavours, view modes or
	 * sort orders — where exactly one is on — is `'radio'`; announcing those
	 * as checkboxes tells a screen-reader user they can turn on several.
	 *
	 * @default 'checkbox'
	 */
	selection?: 'checkbox' | 'radio';

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
	 * Classes for targeting sub-elements.
	 */
	classes?: MenuItemClasses;

	/**
	 * Whether the item has a submenu indicator (arrow)
	 * @default false
	 */
	hasSubmenu?: boolean;

	/**
	 * Submenu content, as JSX — typically nested `MenuItem` elements.
	 *
	 * Named `content` rather than `items` so that across the MenuBar family
	 * `items` always means data and `content` always means JSX.
	 */
	content?: React.ReactNode;
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
			checked,
			selection = 'checkbox',
			icon,
			onClick,
			onFocus,
			onBlur,
			className = '',
			classes,
			hasSubmenu = false,
			content,
		},
		ref
	) => {
		const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
		const effectiveHasSubmenu = hasSubmenu || !!content;

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
		const menuItemClassNames = mergeClasses(
			classes?.item,
			styles.menuItem,
			selected ? styles['menuItem--selected'] : '',
			disabled ? styles['menuItem--disabled'] : '',
			separator ? styles['menuItem--separator'] : '',
			className
		);

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
					const firstItem = submenuRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
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
				className={mergeClasses(styles.menuItemContainer, classes?.root)}
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
					// menuitemradio, never on a plain menuitem — so the role
					// follows whether the item is checkABLE, not whether it
					// currently happens to be checked. Deriving it from the
					// value instead meant an unchecked option announced as a
					// plain command, so a screen-reader user could not tell it
					// was one of a set, and the role changed under them each
					// time they toggled it.
					role={
						checked === undefined
							? 'menuitem'
							: selection === 'radio'
								? 'menuitemradio'
								: 'menuitemcheckbox'
					}
					aria-disabled={disabled}
					aria-checked={checked === undefined ? undefined : checked}
					aria-keyshortcuts={keyShortcut ?? toAriaKeyShortcuts(shortcut)}
					aria-haspopup={effectiveHasSubmenu ? 'menu' : undefined}
					aria-expanded={effectiveHasSubmenu ? isSubmenuOpen : undefined}
				>
					{/* Checkmark area */}
					<span className={mergeClasses(styles.checkmark, classes?.checkmark)}>
						{checked ? '✓' : ''}
					</span>

					{/* Icon area */}
					{icon && <span className={mergeClasses(styles.icon, classes?.icon)}>{icon}</span>}

					{/* Label */}
					<span className={mergeClasses(styles.label, classes?.label)}>{label}</span>

					{/* Shortcut */}
					{shortcut && (
						<span className={mergeClasses(styles.shortcut, classes?.shortcut)} aria-hidden="true">
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
				{content && isSubmenuOpen && (
					<div
						ref={submenuRef}
						className={mergeClasses(styles.submenu, classes?.submenu)}
						role="menu"
					>
						{content}
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
