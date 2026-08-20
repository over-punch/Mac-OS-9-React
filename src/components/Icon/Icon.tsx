// Icon component - Mac OS 9 style
// Simple wrapper for SVG icons with consistent sizing

import React, { forwardRef, SVGAttributes } from 'react';
import { mergeClasses } from '../../utils/classNames';
import styles from './Icon.module.css';

export interface IconProps extends SVGAttributes<SVGElement> {
	/**
	 * Icon size
	 * @default 'md'
	 */
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

	/**
	 * Icon content (SVG path or element)
	 */
	children: React.ReactNode;

	/**
	 * Optional label for accessibility
	 */
	label?: string;

	/**
	 * Additional CSS class names
	 */
	className?: string;
}

/**
 * Icon component for Mac OS 9 UI
 *
 * Wraps SVG content with consistent sizing and styling.
 * Use for inline icons in buttons, labels, etc.
 *
 * @example
 * ```tsx
 * <Icon size="sm">
 *   <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
 * </Icon>
 *
 * <Icon label="Close" size="md">
 *   <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
 * </Icon>
 * ```
 */
export const Icon = forwardRef<SVGSVGElement, IconProps>(
	({ size = 'md', children, label, className = '', ...props }, ref) => {
		const classNames = mergeClasses(styles.icon, styles[`icon--${size}`], className);

		return (
			<svg
				ref={ref}
				className={classNames}
				viewBox="0 0 24 24"
				fill="currentColor"
				xmlns="http://www.w3.org/2000/svg"
				aria-label={label}
				aria-hidden={!label}
				role={label ? 'img' : 'presentation'}
				{...props}
			>
				{children}
			</svg>
		);
	}
);

Icon.displayName = 'Icon';

export default Icon;
