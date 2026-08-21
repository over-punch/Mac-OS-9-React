// IconButton component - Mac OS 9 style button with icon
// A Button whose content is an icon, with an optional label in any of four
// positions.
//
// This is a thin wrapper over Button rather than a parallel implementation.
// The two used to be wholly independent (issue #88): IconButton had its own
// copy of the variant, size, hover, active, focus and disabled styling, and
// none of Button's behaviour — no polymorphism, no `asChild`, no loading
// state, no accessible-name check, and its own take on the disabled
// convention. Anything fixed in one had to be fixed twice.
//
// What IconButton keeps is the part Button has no equivalent for: an icon
// with a label placed above, below, before or after it.

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { Button } from '../Button/Button';
import { mergeClasses } from '../../utils/classNames';
import { warnMissingProp } from '../../utils/deprecation';
import styles from './IconButton.module.css';

/**
 * Classes for targeting IconButton sub-elements.
 */
export interface IconButtonClasses {
	/** Root button. */
	root?: string;
	/** Layout wrapper around the icon and label. */
	content?: string;
	/** Wrapper around the icon. */
	icon?: string;
	/** Wrapper around the label. */
	label?: string;
}

export interface IconButtonProps
	// `formMethod` is omitted and re-declared because the DOM lib types it as
	// a plain string while Button narrows it to the two values a form can
	// actually use.
	extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'formMethod'> {
	/** Override the form method. */
	formMethod?: 'get' | 'post';

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
 * IconButton component for Mac OS 9 UI
 *
 * A Button whose content is an icon, optionally with a text label. Inherits
 * Button's variants, sizes, states and accessibility behaviour.
 *
 * With no `label`, this is an icon-only control and needs an accessible name:
 * pass `aria-label` or `title`. Development builds warn when neither is there.
 *
 * @example
 * ```tsx
 * // Icon-only button
 * <IconButton icon={<SaveIcon />} aria-label="Save" />
 *
 * // Icon with label
 * <IconButton icon={<FolderIcon />} label="New Folder" variant="primary" />
 *
 * // Label above the icon
 * <IconButton icon={<SearchIcon />} label="Search" labelPosition="top" />
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
		// An icon with no visible label has no accessible name, so a screen
		// reader announces it as just "button".
		if (process.env.NODE_ENV !== 'production' && !label && !props['aria-label'] && !props.title) {
			warnMissingProp(
				'IconButton',
				'no accessible name. Pass `label`, `aria-label`, or `title` — an icon alone announces as "button".'
			);
		}

		return (
			<Button
				ref={ref}
				variant={variant}
				size={size}
				disabled={disabled}
				className={mergeClasses(
					styles.iconButton,
					label && styles['iconButton--with-label'],
					className
				)}
				classes={{
					root: classes?.root,
					// Button wraps non-iconOnly children in its text span; that is
					// the element that has to lay the icon and label out.
					text: mergeClasses(styles.content, styles[`content--${labelPosition}`], classes?.content),
					iconOnly: mergeClasses(styles.content, classes?.content),
				}}
				iconOnly={!label}
				{...props}
			>
				<span className={mergeClasses(styles.icon, classes?.icon)}>{icon}</span>
				{label ? <span className={mergeClasses(styles.label, classes?.label)}>{label}</span> : null}
			</Button>
		);
	}
);

IconButton.displayName = 'IconButton';

export default IconButton;
