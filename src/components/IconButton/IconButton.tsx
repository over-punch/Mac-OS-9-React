// IconButton component - Mac OS 9 style button with icon
// Button variant that includes an icon, with optional label

// Note: no per-file 'use client' directive. The library ships as a single
// bundle and Rollup applies the "use client" banner to the whole output,
// so per-file directives were both inconsistent (4 of 16 components) and
// silently dropped at bundle time.

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { mergeClasses } from '../../utils/classNames';
import styles from './IconButton.module.css';

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
			...props
		},
		ref
	) => {
		// Build class names
		const classNames = mergeClasses(
			styles.iconButton,
			styles[`iconButton--${variant}`],
			styles[`iconButton--${size}`],
			label && styles['iconButton--with-label'],
			label && styles[`iconButton--label-${labelPosition}`],
			disabled && styles['iconButton--disabled'],
			className
		);

		return (
			<button ref={ref} type="button" className={classNames} disabled={disabled} {...props}>
				{label && (labelPosition === 'left' || labelPosition === 'top') && (
					<span className={styles.label}>{label}</span>
				)}
				<span className={styles.icon}>{icon}</span>
				{label && (labelPosition === 'right' || labelPosition === 'bottom') && (
					<span className={styles.label}>{label}</span>
				)}
			</button>
		);
	}
);

IconButton.displayName = 'IconButton';

export default IconButton;
