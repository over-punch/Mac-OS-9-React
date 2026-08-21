// TextField component - Mac OS 9 style
// Classic text input with label support and full accessibility

import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { mergeClasses } from '../../utils/classNames';
import { resolveAria } from '../../utils/aria';
import styles from './TextField.module.css';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
	/**
	 * Label text for the text field
	 */
	label?: React.ReactNode;

	/**
	 * Position of the label relative to the text field
	 * @default 'top'
	 */
	labelPosition?: 'top' | 'left' | 'right';

	/**
	 * Size of the text field
	 * @default 'md'
	 */
	size?: 'sm' | 'md' | 'lg';

	/**
	 * Whether the text field takes full width of its container
	 * @default false
	 */
	fullWidth?: boolean;

	/**
	 * Error state for form validation
	 * @default false
	 */
	error?: boolean;

	/**
	 * Error message to display below the field
	 */
	errorMessage?: string;

	/**
	 * Helper text to display below the field
	 */
	helperText?: string;

	/**
	 * Icon to display before the input (left side)
	 */
	leftIcon?: React.ReactNode;

	/**
	 * Icon to display after the input (right side)
	 */
	rightIcon?: React.ReactNode;

	/**
	 * Accessible name, when there is no visible `label`.
	 *
	 * This is the standard attribute; it is already accepted through the
	 * inherited input props and is listed here for discoverability.
	 */
	'aria-label'?: string;

	/**
	 * ID of an element describing this field. Merged with the ids the
	 * component generates for its helper and error text.
	 */
	'aria-describedby'?: string;

	/** @deprecated Use `aria-label`. */
	ariaLabel?: string;

	/** @deprecated Use `aria-describedby`. */
	ariaDescribedBy?: string;

	/**
	 * Additional CSS class names
	 */
	className?: string;

	/**
	 * Custom wrapper class name
	 */
	wrapperClassName?: string;

	/**
	 * Render a multi-line field (a `<textarea>`) instead of a single-line
	 * `<input>`.
	 *
	 * Everything else — label, sizes, icons, error and helper text, the
	 * Mac OS 9 inset bevel — behaves identically, so a comment box does not
	 * have to be styled from scratch to sit next to the other fields.
	 *
	 * @default false
	 */
	multiline?: boolean;

	/**
	 * Visible rows when `multiline` is set.
	 * @default 3
	 */
	rows?: number;

	/**
	 * How politely the error message is announced when it appears.
	 *
	 * The message is rendered in a live region so assistive tech announces
	 * validation failures as they happen; previously it was a plain
	 * paragraph, silently appearing for anyone not looking at that part of
	 * the screen. Use `'off'` when your form announces errors centrally and
	 * per-field announcements would double up.
	 *
	 * @default 'polite'
	 */
	errorLiveRegion?: 'polite' | 'assertive' | 'off';

	/**
	 * Extra props forwarded to the underlying `<textarea>` when `multiline`
	 * is set — anything specific to textareas, such as `wrap`.
	 */
	textareaProps?: Omit<
		TextareaHTMLAttributes<HTMLTextAreaElement>,
		keyof InputHTMLAttributes<HTMLInputElement>
	>;
}

/**
 * Mac OS 9 style TextField component
 *
 * Classic text input with inset bevel effect and optional label.
 *
 * Features:
 * - Classic Mac OS 9 inset bevel styling
 * - Label positioning (top/left/right)
 * - Size variants (sm/md/lg)
 * - Error states with messages
 * - Helper text support
 * - Icon support (left/right)
 * - Full accessibility with ARIA support
 * - Keyboard navigation
 * - Form integration
 *
 * @example
 * ```tsx
 * // Basic text field
 * <TextField placeholder="Enter text..." />
 *
 * // With label
 * <TextField label="Username" placeholder="Enter username" />
 *
 * // With error
 * <TextField
 *   label="Email"
 *   error
 *   errorMessage="Invalid email address"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 * />
 *
 * // With icons
 * <TextField
 *   leftIcon={<SearchIcon />}
 *   placeholder="Search..."
 * />
 * ```
 */
export const TextField = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextFieldProps>(
	(
		{
			label,
			labelPosition = 'top',
			size = 'md',
			fullWidth = false,
			error = false,
			errorMessage,
			helperText,
			leftIcon,
			rightIcon,
			ariaLabel,
			ariaDescribedBy,
			'aria-label': ariaLabelAttr,
			'aria-describedby': ariaDescribedByAttr,
			className = '',
			wrapperClassName = '',
			type = 'text',
			id,
			disabled,
			multiline = false,
			rows = 3,
			errorLiveRegion = 'polite',
			textareaProps,
			...props
		},
		ref
	) => {
		// Generate ID if not provided (for label association)
		// useId must be called unconditionally. Writing `id || React.useId()`
		// short-circuits the hook away whenever `id` is supplied, so the hook
		// order changes if `id` ever goes from defined to undefined.
		const generatedId = React.useId();
		const inputId = id ?? generatedId;

		// Standard attributes win; the camelCase aliases warn once in development.
		const resolvedLabel = resolveAria(
			'TextField',
			'aria-label',
			'ariaLabel',
			ariaLabelAttr,
			ariaLabel
		);
		const resolvedDescribedBy = resolveAria(
			'TextField',
			'aria-describedby',
			'ariaDescribedBy',
			ariaDescribedByAttr,
			ariaDescribedBy
		);

		// Generate helper/error text ID for aria-describedby
		const helperId = `${inputId}-helper`;
		const errorId = `${inputId}-error`;

		// Combine aria-describedby
		const describedByIds = mergeClasses(
			helperText && helperId,
			error && errorMessage && errorId,
			// The caller's own description is merged with the ids the component
			// generates, rather than replacing them.
			resolvedDescribedBy
		);

		// Build class names
		const wrapperClassNames = mergeClasses(
			styles.wrapper,
			styles[`wrapper--${size}`],
			styles[`wrapper--label-${labelPosition}`],
			fullWidth && styles['wrapper--full-width'],
			disabled && styles['wrapper--disabled'],
			wrapperClassName
		);

		const inputWrapperClassNames = mergeClasses(
			styles['input-wrapper'],
			(leftIcon || rightIcon) && styles['input-wrapper--with-icon'],
			leftIcon && styles['input-wrapper--with-left-icon'],
			rightIcon && styles['input-wrapper--with-right-icon']
		);

		const inputClassNames = mergeClasses(
			styles.input,
			styles[`input--${size}`],
			error && styles['input--error'],
			fullWidth && styles['input--full-width'],
			className
		);

		const labelClassNames = mergeClasses(styles.label, styles[`label--${size}`]);

		// ARIA attributes
		const ariaAttributes = {
			'aria-label': !label ? resolvedLabel : undefined,
			'aria-describedby': describedByIds || undefined,
			'aria-invalid': error,
		};

		return (
			<div className={wrapperClassNames}>
				{label && (labelPosition === 'top' || labelPosition === 'left') && (
					<label htmlFor={inputId} className={labelClassNames}>
						{label}
					</label>
				)}

				<div className={inputWrapperClassNames}>
					{leftIcon && (
						<span className={styles['input-icon-left']} aria-hidden="true">
							{leftIcon}
						</span>
					)}

					{multiline ? (
						<textarea
							ref={ref as React.Ref<HTMLTextAreaElement>}
							id={inputId}
							rows={rows}
							className={inputClassNames}
							disabled={disabled}
							{...ariaAttributes}
							{...(props as unknown as TextareaHTMLAttributes<HTMLTextAreaElement>)}
							{...textareaProps}
						/>
					) : (
						<input
							ref={ref as React.Ref<HTMLInputElement>}
							type={type}
							id={inputId}
							className={inputClassNames}
							disabled={disabled}
							{...ariaAttributes}
							{...props}
						/>
					)}

					{rightIcon && (
						<span className={styles['input-icon-right']} aria-hidden="true">
							{rightIcon}
						</span>
					)}
				</div>

				{label && labelPosition === 'right' && (
					<label htmlFor={inputId} className={labelClassNames}>
						{label}
					</label>
				)}

				{helperText && !error && (
					<p id={helperId} className={styles['helper-text']}>
						{helperText}
					</p>
				)}

				{/* The live region is always mounted, not conditionally rendered.
		    Assistive tech only announces changes to a region that already
		    existed — inserting the region and its text at the same moment is
		    frequently missed entirely. */}
				<p
					id={errorId}
					className={styles['error-message']}
					role={errorLiveRegion === 'off' ? undefined : 'status'}
					aria-live={errorLiveRegion === 'off' ? undefined : errorLiveRegion}
					hidden={!(error && errorMessage)}
				>
					{error && errorMessage ? errorMessage : null}
				</p>
			</div>
		);
	}
);

TextField.displayName = 'TextField';

export default TextField;
