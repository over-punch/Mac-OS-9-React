// Checkbox component - Mac OS 9 style
// Classic checkbox with label support and full accessibility

import React, { forwardRef, InputHTMLAttributes } from 'react';
import { mergeClasses } from '../../utils/classNames';
import { FieldMessage, describedBy, type ErrorLiveRegion } from '../FieldMessage';
import { type Size } from '../../types';
import styles from './Checkbox.module.css';

/**
 * Classes for targeting Checkbox sub-elements.
 */
export interface CheckboxClasses {
	/** Root wrapper. */
	root?: string;
	/** The control itself. */
	input?: string;
	/** The visible label. */
	label?: string;
	/** Helper text shown when there is no error. */
	helperText?: string;
	/** Error text shown while `error` is set. */
	errorMessage?: string;
}

export interface CheckboxProps extends Omit<
	InputHTMLAttributes<HTMLInputElement>,
	'type' | 'size'
> {
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
	size?: Size;

	/**
	 * Error state for form validation
	 * @default false
	 */
	error?: boolean;

	/**
	 * What is wrong, shown beneath the control while `error` is true.
	 *
	 * The control previously had an `error` flag with nowhere to explain it,
	 * so callers rendered their own text and wired `aria-describedby` by hand.
	 */
	errorMessage?: React.ReactNode;

	/**
	 * Guidance shown beneath the control while there is no error.
	 */
	helperText?: React.ReactNode;

	/**
	 * How politely the error is announced when it appears.
	 * @default 'polite'
	 */
	errorLiveRegion?: ErrorLiveRegion;

	/**
	 * Accessible name, when there is no visible `label`.
	 */
	'aria-label'?: string;

	/**
	 * ID of an element describing this checkbox.
	 */
	'aria-describedby'?: string;

	/**
	 * Additional CSS class names
	 */
	className?: string;

	/**
	 * Classes for targeting sub-elements.
	 */
	classes?: CheckboxClasses;

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
			errorMessage,
			helperText,
			errorLiveRegion = 'polite',
			'aria-label': resolvedLabel,
			'aria-describedby': resolvedDescribedBy,
			className = '',
			classes,
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
		// useId must be called unconditionally — see the note in TextField.
		const generatedId = React.useId();
		const checkboxId = id ?? generatedId;

		// Build class names
		const wrapperClassNames = mergeClasses(
			styles.wrapper,
			styles[`wrapper--${size}`],
			styles[`wrapper--label-${labelPosition}`],
			disabled && styles['wrapper--disabled'],
			error && styles['wrapper--error'],
			className,
			classes?.root
		);

		const checkboxClassNames = mergeClasses(
			classes?.input,
			styles.checkbox,
			styles[`checkbox--${size}`],
			indeterminate && styles['checkbox--indeterminate'],
			error && styles['checkbox--error']
		);

		const labelClassNames = mergeClasses(styles.label, styles[`label--${size}`], classes?.label);

		// ARIA attributes
		//
		// Note: we deliberately do NOT set `aria-checked`. Per ARIA 1.2,
		// `aria-checked` cannot be used on a native <input type="checkbox">
		// — the host language already exposes the checked state. The
		// tri-state ("mixed") indicator is the DOM `indeterminate` property,
		// which the effect above sets on the input via ref.
		const helperId = `${checkboxId}-helper`;
		const errorId = `${checkboxId}-error`;

		const ariaAttributes = {
			'aria-label': !label ? resolvedLabel : undefined,
			'aria-describedby': describedBy({
				helperId,
				errorId,
				helperText,
				error,
				errorMessage,
				callerDescribedBy: resolvedDescribedBy,
			}),
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

				<FieldMessage
					helperId={helperId}
					errorId={errorId}
					error={error}
					errorMessage={errorMessage}
					helperText={helperText}
					errorLiveRegion={errorLiveRegion}
					helperClassName={mergeClasses(styles['helper-text'], classes?.helperText)}
					errorClassName={mergeClasses(styles['error-message'], classes?.errorMessage)}
				/>
			</div>
		);
	}
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
