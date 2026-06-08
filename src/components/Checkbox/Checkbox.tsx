// Checkbox component - Mac OS 9 style
// Classic checkbox with label support and full accessibility

import React, { forwardRef, InputHTMLAttributes } from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
	/**
	 * Whether the checkbox is checked
	 * For controlled component usage
	 */
	checked?: boolean;

	/**
	 * Default checked state
	 * For uncontrolled component usage
	 */
	defaultChecked?: boolean;

	/**
	 * Whether the checkbox is in an indeterminate state
	 * (neither checked nor unchecked, typically for "select all" scenarios)
	 * @default false
	 */
	indeterminate?: boolean;

	/**
	 * Whether the checkbox is disabled
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Label text for the checkbox
	 */
	label?: React.ReactNode;

	/**
	 * Position of the label relative to the checkbox
	 * @default 'right'
	 */
	labelPosition?: 'left' | 'right';

	/**
	 * Size of the checkbox
	 * @default 'md'
	 */
	size?: 'sm' | 'md' | 'lg';

	/**
	 * Error state for form validation
	 * @default false
	 */
	error?: boolean;

	/**
	 * Override aria-label (for checkboxes without visible labels)
	 */
	ariaLabel?: string;

	/**
	 * ID of element that describes this checkbox
	 */
	ariaDescribedBy?: string;

	/**
	 * Additional CSS class names
	 */
	className?: string;

	/**
	 * Callback when checked state changes
	 */
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Mac OS 9 style Checkbox component
 * 
 * Classic checkbox with raised bevel effect and optional label.
 * Supports checked, unchecked, indeterminate, and disabled states.
 * 
 * Features:
 * - Classic Mac OS 9 bevel styling
 * - Indeterminate state support
 * - Label positioning (left/right)
 * - Controlled and uncontrolled modes
 * - Full accessibility with ARIA support
 * - Keyboard navigation (Space to toggle)
 * - Form integration
 * 
 * @example
 * ```tsx
 * // Uncontrolled
 * <Checkbox label="Accept terms" />
 * 
 * // Controlled
 * <Checkbox 
 *   checked={isChecked} 
 *   onChange={(e) => setIsChecked(e.target.checked)}
 *   label="Subscribe to newsletter"
 * />
 * 
 * // Indeterminate (for "select all")
 * <Checkbox 
 *   indeterminate={someSelected && !allSelected}
 *   checked={allSelected}
 *   onChange={handleSelectAll}
 *   label="Select all items"
 * />
 * ```
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
	(
		{
			checked,
			defaultChecked,
			indeterminate = false,
			disabled = false,
			label,
			labelPosition = 'right',
			size = 'md',
			error = false,
			ariaLabel,
			ariaDescribedBy,
			className = '',
			onChange,
			id,
			...props
		},
		ref
	) => {
		const inputRef = React.useRef<HTMLInputElement>(null);
		const combinedRef = (ref as React.RefObject<HTMLInputElement>) || inputRef;

		// Set indeterminate property via ref (can't be set via HTML attribute)
		React.useEffect(() => {
			if (combinedRef?.current) {
				combinedRef.current.indeterminate = indeterminate;
			}
		}, [indeterminate, combinedRef]);

		// Generate ID if not provided (for label association)
		const checkboxId = id || React.useId();

	// Build class names
	const wrapperClassNames = [
		styles.wrapper,
		styles[`wrapper--${size}`],
		styles[`wrapper--label-${labelPosition}`],
		disabled && styles['wrapper--disabled'],
		error && styles['wrapper--error'],
		className,
	]
		.filter(Boolean)
		.join(' ');

	const checkboxClassNames = [
		styles.checkbox,
		styles[`checkbox--${size}`],
		indeterminate && styles['checkbox--indeterminate'],
		error && styles['checkbox--error'],
	]
		.filter(Boolean)
		.join(' ');

	const labelClassNames = [styles.label, styles[`label--${size}`]].filter(Boolean).join(' ');

		// ARIA attributes
		//
		// Note: we deliberately do NOT set `aria-checked`. Per ARIA 1.2,
		// `aria-checked` cannot be used on a native <input type="checkbox">
		// — the host language already exposes the checked state. The
		// tri-state ("mixed") indicator is the DOM `indeterminate` property,
		// which the effect above sets on the input via ref.
		const ariaAttributes = {
			'aria-label': !label ? ariaLabel : undefined,
			'aria-describedby': ariaDescribedBy,
			'aria-invalid': error,
		};

		return (
			<div className={wrapperClassNames}>
				{label && labelPosition === 'left' && (
					<label htmlFor={checkboxId} className={labelClassNames}>
						{label}
					</label>
				)}

				<input
					ref={combinedRef}
					type="checkbox"
					id={checkboxId}
					className={checkboxClassNames}
					checked={checked}
					defaultChecked={defaultChecked}
					disabled={disabled}
					onChange={onChange}
					{...ariaAttributes}
					{...props}
				/>

				{label && labelPosition === 'right' && (
					<label htmlFor={checkboxId} className={labelClassNames}>
						{label}
					</label>
				)}
			</div>
		);
	}
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
