// IconButton component - Mac OS 9 style button with icon
// Button variant that includes an icon, with optional label

// Note: no per-file 'use client' directive. The library ships as a single
// bundle and Rollup applies the "use client" banner to the whole output,
// so per-file directives were both inconsistent (4 of 16 components) and
// silently dropped at bundle time.

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { mergeClasses } from '../../utils/classNames';
import { warnMissingProp } from '../../utils/deprecation';
import styles from './IconButton.module.css';

/**
 * Classes for targeting IconButton sub-elements.
 */
export interface IconButtonClasses {
	/** Root button. */
	root?: string;
	/** Wrapper around the icon. */
	icon?: string;
	/** Wrapper around the label. */
	label?: string;
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	/**
	 * Icon element to display
	 */
	icon: React.ReactNode;

	/**
	 * Optional text label to display alongside icon
	 */
	label?: string;

	/**
	 * Label position relative to icon
	 * @default 'right'
	 */
	labelPosition?: 'left' | 'right' | 'top' | 'bottom';

	/**
	 * Button variant
	 * @default 'default'
	 */
	variant?: 'default' | 'primary' | 'danger';

	/**
	 * Button size
	 * @default 'md'
	 */
	size?: 'sm' | 'md' | 'lg';

	/**
	 * Whether button is disabled
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Additional CSS class names
	 */
	className?: string;

	/**
	 * Classes for targeting sub-elements.
	 */
	classes?: IconButtonClasses;
}

/**
 * An icon with no visible label has no accessible name, so a screen reader
 * announces it as just "button". Warn in development rather than shipping one.
 */
function assertHasName(label: string | undefined, ariaLabel: unknown, title: unknown): void {
	if (label || ariaLabel || title) return;
	warnMissingProp(
		'IconButton',
		'no accessible name. Pass `label`, `aria-label`, or `title` — an icon alone announces as "button".'
	);
}

/**
 * IconButton component for Mac OS 9 UI
 *
 * Button with an icon, optionally with a text label.
 * Supports all button variants and sizes.
 *
 * @example
 * ```tsx
 * // Icon-only button
 * <IconButton icon={<SaveIcon />} />
 *
 * // Icon with label
 * <IconButton
 *   icon={<FolderIcon />}
 *   label="New Folder"
 *   variant="primary"
 * />
 *
 * // Icon with label on different sides
 * <IconButton
 *   icon={<SearchIcon />}
 *   label="Search"
 *   labelPosition="right"
 * />
 * ```
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
	(
		{
			icon,
			label,
			labelPosition = 'right',
			variant = 'default',
			size = 'md',
			disabled = false,
			className = '',
			classes,
			...props
		},
		ref
	) => {
		if (process.env.NODE_ENV !== 'production') {
			assertHasName(label, props['aria-label'], props.title);
		}

		// Build class names
		const classNames = mergeClasses(
			styles.iconButton,
			styles[`iconButton--${variant}`],
			styles[`iconButton--${size}`],
			label && styles['iconButton--with-label'],
			label && styles[`iconButton--label-${labelPosition}`],
			disabled && styles['iconButton--disabled'],
			className,
			classes?.root
		);

		return (
			<button ref={ref} type="button" className={classNames} disabled={disabled} {...props}>
				{label && (labelPosition === 'left' || labelPosition === 'top') && (
					<span className={mergeClasses(styles.label, classes?.label)}>{label}</span>
				)}
				<span className={mergeClasses(styles.icon, classes?.icon)}>{icon}</span>
				{label && (labelPosition === 'right' || labelPosition === 'bottom') && (
					<span className={mergeClasses(styles.label, classes?.label)}>{label}</span>
				)}
			</button>
		);
	}
);

IconButton.displayName = 'IconButton';

export default IconButton;
