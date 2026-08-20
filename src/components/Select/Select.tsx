// Select component - Mac OS 9 style
// Classic dropdown select with label support and full accessibility

import React, { forwardRef, SelectHTMLAttributes } from 'react';
import styles from './Select.module.css';

export interface SelectOption {
	value: string | number;
	label: string;
	disabled?: boolean;
}

export interface SelectProps
	extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
	/**
	 * Label text for the select
	 */
	label?: React.ReactNode;

	/**
	 * Position of the label relative to the select
	 * @default 'top'
	 */
	labelPosition?: 'top' | 'left' | 'right';

	/**
	 * Size of the select
	 * @default 'md'
	 */
	size?: 'sm' | 'md' | 'lg';

	/**
	 * Whether the select takes full width of its container
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
	 * Options for the select dropdown
	 * Alternative to providing option elements as children
	 */
	options?: SelectOption[];

	/**
	 * Placeholder text (creates a disabled first option)
	 */
	placeholder?: string;

	/**
	 * Override aria-label
	 */
	ariaLabel?: string;

	/**
	 * ID of element that describes this select
	 */
	ariaDescribedBy?: string;

	/**
	 * Additional CSS class names
	 */
	className?: string;

	/**
	 * Custom wrapper class name
	 */
	wrapperClassName?: string;
}

/**
 * Mac OS 9 style Select component
 * 
 * Classic dropdown select with raised bevel effect and optional label.
 * 
 * Features:
 * - Classic Mac OS 9 popup menu styling
 * - Label positioning (top/left/right)
 * - Size variants (sm/md/lg)
 * - Error states with messages
 * - Helper text support
 * - Option groups support
 * - Full accessibility with ARIA support
 * - Keyboard navigation
 * - Form integration
 * 
 * @example
 * ```tsx
 * // With options prop
 * <Select
 *   label="Choose a color"
 *   options={[
 *     { value: 'red', label: 'Red' },
 *     { value: 'blue', label: 'Blue' },
 *     { value: 'green', label: 'Green' }
 *   ]}
 *   placeholder="Select a color..."
 * />
 * 
 * // With children
 * <Select label="Country">
 *   <option value="us">United States</option>
 *   <option value="ca">Canada</option>
 *   <option value="mx">Mexico</option>
 * </Select>
 * ```
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
	(
		{
			label,
			labelPosition = 'top',
			size = 'md',
			fullWidth = false,
			error = false,
			errorMessage,
			helperText,
			options,
			placeholder,
			ariaLabel,
			ariaDescribedBy,
			className = '',
			wrapperClassName = '',
			id,
			disabled,
			children,
			...props
		},
		ref
	) => {
		// Generate ID if not provided (for label association)
		// useId must be called unconditionally — see the note in TextField.
		const generatedId = React.useId();
		const selectId = id ?? generatedId;

		// Generate helper/error text ID for aria-describedby
		const helperId = `${selectId}-helper`;
		const errorId = `${selectId}-error`;

		// Combine aria-describedby
		const describedByIds = [
			helperText && helperId,
			error && errorMessage && errorId,
			ariaDescribedBy,
		]
			.filter(Boolean)
			.join(' ');

		// Build class names
		const wrapperClassNames = [
			styles.wrapper,
			styles[`wrapper--${size}`],
			styles[`wrapper--label-${labelPosition}`],
			fullWidth && styles['wrapper--full-width'],
			disabled && styles['wrapper--disabled'],
			wrapperClassName,
		]
			.filter(Boolean)
			.join(' ');

		const selectClassNames = [
			styles.select,
			styles[`select--${size}`],
			error && styles['select--error'],
			fullWidth && styles['select--full-width'],
			className,
		]
			.filter(Boolean)
			.join(' ');

		const labelClassNames = [styles.label, styles[`label--${size}`]].filter(Boolean).join(' ');

		// ARIA attributes
		const ariaAttributes = {
			'aria-label': !label ? ariaLabel : undefined,
			'aria-describedby': describedByIds || undefined,
			'aria-invalid': error,
		};

		// Render options from options prop
		const renderOptions = () => {
			if (options) {
				return (
					<>
						{placeholder && (
							<option value="" disabled>
								{placeholder}
							</option>
						)}
						{options.map((option) => (
							<option key={option.value} value={option.value} disabled={option.disabled}>
								{option.label}
							</option>
						))}
					</>
				);
			}
			return children;
		};

		return (
			<div className={wrapperClassNames}>
				{label && (labelPosition === 'top' || labelPosition === 'left') && (
					<label htmlFor={selectId} className={labelClassNames}>
						{label}
					</label>
				)}

				<select
					ref={ref}
					id={selectId}
					className={selectClassNames}
					disabled={disabled}
					{...ariaAttributes}
					{...props}
				>
					{renderOptions()}
				</select>

				{label && labelPosition === 'right' && (
					<label htmlFor={selectId} className={labelClassNames}>
						{label}
					</label>
				)}

				{helperText && !error && (
					<p id={helperId} className={styles['helper-text']}>
						{helperText}
					</p>
				)}

				{error && errorMessage && (
					<p id={errorId} className={styles['error-message']}>
						{errorMessage}
					</p>
				)}
			</div>
		);
	}
);

Select.displayName = 'Select';

export default Select;