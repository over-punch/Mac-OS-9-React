// Radio component - Mac OS 9 style
// Classic radio button with label support and full accessibility
// Includes companion RadioGroup component for WAI-ARIA radiogroup pattern

import React, { forwardRef, InputHTMLAttributes, useCallback, useId, useRef, useState } from 'react';
import styles from './Radio.module.css';

/**
 * Internal context that lets <Radio> inherit `name`, controlled `value`,
 * and the change callback from a surrounding <RadioGroup>. Plain
 * <Radio> usage (no group) continues to work because the context defaults
 * to `null` and the Radio component falls back to its own props.
 */
interface RadioGroupContextValue {
	name: string;
	value?: string | number;
	onChange?: (value: string | number, event: React.ChangeEvent<HTMLInputElement>) => void;
	disabled?: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

export interface RadioProps
	extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
	/**
	 * Whether the radio is checked
	 * For controlled component usage
	 */
	checked?: boolean;

	/**
	 * Default checked state
	 * For uncontrolled component usage
	 */
	defaultChecked?: boolean;

	/**
	 * Whether the radio is disabled
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Label text for the radio
	 */
	label?: React.ReactNode;

	/**
	 * Position of the label relative to the radio
	 * @default 'right'
	 */
	labelPosition?: 'left' | 'right';

	/**
	 * Size of the radio
	 * @default 'md'
	 */
	size?: 'sm' | 'md' | 'lg';

	/**
	 * Error state for form validation
	 * @default false
	 */
	error?: boolean;

	/**
	 * Override aria-label (for radios without visible labels)
	 */
	ariaLabel?: string;

	/**
	 * ID of element that describes this radio
	 */
	ariaDescribedBy?: string;

	/**
	 * Additional CSS class names
	 */
	className?: string;

	/**
	 * Value for the radio button (required for radio groups)
	 */
	value?: string | number;

	/**
	 * Name for the radio group (all radios in a group should share the same name).
	 * When the radio is rendered inside a <RadioGroup>, the group's `name` wins.
	 */
	name?: string;

	/**
	 * Callback when checked state changes
	 */
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Mac OS 9 style Radio component
 *
 * Classic radio button with raised bevel effect and optional label. For
 * groups of radio buttons, prefer wrapping siblings in <RadioGroup>: that
 * adds the required ARIA semantics, arrow-key navigation, and ensures
 * single-selection enforcement across the group.
 *
 * @example
 * ```tsx
 * // Recommended: with RadioGroup
 * <RadioGroup name="size" value={size} onChange={setSize}>
 *   <Radio value="small" label="Small" />
 *   <Radio value="medium" label="Medium" />
 *   <Radio value="large" label="Large" />
 * </RadioGroup>
 *
 * // Standalone (legacy) still works
 * <Radio name="color" value="red" label="Red" />
 * ```
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(
	(
		{
			checked,
			defaultChecked,
			disabled = false,
			label,
			labelPosition = 'right',
			size = 'md',
			error = false,
			ariaLabel,
			ariaDescribedBy,
			className = '',
			value,
			name,
			onChange,
			id,
			...props
		},
		ref
	) => {
		// When wrapped by <RadioGroup>, inherit name / value / onChange / disabled
		// from context. Standalone Radios fall back to their own props.
		const group = React.useContext(RadioGroupContext);
		const resolvedName = group?.name ?? name;
		const resolvedDisabled = disabled || group?.disabled || false;
		const resolvedChecked = group ? group.value !== undefined && group.value === value : checked;
		const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
			if (group?.onChange && value !== undefined) group.onChange(value, event);
			onChange?.(event);
		};

		// Generate ID if not provided (for label association)
		const generatedId = useId();
		const radioId = id || generatedId;

	// Build class names
	const wrapperClassNames = [
		styles.wrapper,
		styles[`wrapper--${size}`],
		styles[`wrapper--label-${labelPosition}`],
		resolvedDisabled && styles['wrapper--disabled'],
		error && styles['wrapper--error'],
		className,
	]
		.filter(Boolean)
		.join(' ');

	const radioClassNames = [
		styles.radio,
		styles[`radio--${size}`],
		error && styles['radio--error'],
	]
		.filter(Boolean)
		.join(' ');

	const labelClassNames = [styles.label, styles[`label--${size}`]].filter(Boolean).join(' ');

		// ARIA attributes
		const ariaAttributes = {
			'aria-label': !label ? ariaLabel : undefined,
			'aria-describedby': ariaDescribedBy,
			'aria-invalid': error,
		};

		return (
			<div className={wrapperClassNames}>
				{label && labelPosition === 'left' && (
					<label htmlFor={radioId} className={labelClassNames}>
						{label}
					</label>
				)}

				<input
					ref={ref}
					type="radio"
					id={radioId}
					className={radioClassNames}
					checked={group ? resolvedChecked : checked}
					defaultChecked={group ? undefined : defaultChecked}
					disabled={resolvedDisabled}
					value={value}
					name={resolvedName}
					onChange={handleInputChange}
					{...ariaAttributes}
					{...props}
				/>

				{label && labelPosition === 'right' && (
					<label htmlFor={radioId} className={labelClassNames}>
						{label}
					</label>
				)}
			</div>
		);
	}
);

Radio.displayName = 'Radio';

/**
 * Props accepted by <RadioGroup>.
 */
export interface RadioGroupProps {
	/**
	 * Shared name for every <Radio> in the group. When omitted, a stable
	 * auto-generated id is used so radios in the same group are linked.
	 */
	name?: string;

	/**
	 * Controlled selected value. Pair with `onChange`.
	 */
	value?: string | number;

	/**
	 * Uncontrolled initial value.
	 */
	defaultValue?: string | number;

	/**
	 * Fires when the user picks a different option.
	 */
	onChange?: (value: string | number) => void;

	/**
	 * Disable every radio in the group at once.
	 */
	disabled?: boolean;

	/**
	 * Layout direction. Also controls which arrow keys advance the
	 * selection: vertical uses Up/Down, horizontal uses Left/Right.
	 * @default 'vertical'
	 */
	orientation?: 'vertical' | 'horizontal';

	/**
	 * Accessible name for the group. Provide this unless you wire
	 * `ariaLabelledBy` to a visible heading.
	 */
	ariaLabel?: string;

	/**
	 * ID of a visible label element for the group.
	 */
	ariaLabelledBy?: string;

	/**
	 * Additional CSS class names applied to the group wrapper.
	 */
	className?: string;

	/**
	 * One or more <Radio> elements.
	 */
	children: React.ReactNode;
}

/**
 * Container for a set of <Radio> options. Adds the required
 * WAI-ARIA radiogroup semantics, arrow-key navigation between options,
 * and a single-selection model.
 *
 * @example
 * ```tsx
 * const [size, setSize] = useState('medium');
 * <RadioGroup name="size" value={size} onChange={setSize} ariaLabel="T-shirt size">
 *   <Radio value="small" label="Small" />
 *   <Radio value="medium" label="Medium" />
 *   <Radio value="large" label="Large" />
 * </RadioGroup>
 * ```
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
	(
		{
			name,
			value,
			defaultValue,
			onChange,
			disabled = false,
			orientation = 'vertical',
			ariaLabel,
			ariaLabelledBy,
			className = '',
			children,
		},
		ref
	) => {
		const generatedName = useId();
		const resolvedName = name ?? `radio-group-${generatedName}`;

		const isControlled = value !== undefined;
		const [internalValue, setInternalValue] = useState<string | number | undefined>(defaultValue);
		const currentValue = isControlled ? value : internalValue;

		const handleChildChange = useCallback(
			(nextValue: string | number) => {
				if (!isControlled) setInternalValue(nextValue);
				onChange?.(nextValue);
			},
			[isControlled, onChange]
		);

		// Arrow-key navigation. We scope the listener to the group root and
		// query enabled radios on demand so consumers can render any structure
		// inside (Radio wrapped in extra divs is fine).
		const groupRef = useRef<HTMLDivElement | null>(null);
		const setGroupRef = useCallback(
			(node: HTMLDivElement | null) => {
				groupRef.current = node;
				if (typeof ref === 'function') ref(node);
				else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
			},
			[ref]
		);

		const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
			const isVertical = orientation === 'vertical';
			const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
			const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
			if (event.key !== prevKey && event.key !== nextKey) return;

			const root = groupRef.current;
			if (!root) return;
			const radios = Array.from(
				root.querySelectorAll<HTMLInputElement>(
					`input[type="radio"][name="${resolvedName}"]:not(:disabled)`
				)
			);
			if (radios.length === 0) return;

			event.preventDefault();
			const activeIndex = radios.findIndex((r) => r === document.activeElement);
			const direction = event.key === nextKey ? 1 : -1;
			// If nothing in the group is focused yet, start from the currently
			// selected radio (or the first one if there's no selection).
			const startIndex =
				activeIndex >= 0
					? activeIndex
					: Math.max(
							0,
							radios.findIndex((r) => r.value === String(currentValue))
						);
			const nextIndex = (startIndex + direction + radios.length) % radios.length;
			const target = radios[nextIndex];
			if (!target) return;
			target.focus();
			// Selecting on arrow move matches the WAI-ARIA radiogroup pattern
			// for automatic activation. The synthetic ChangeEvent piggybacks
			// onto `change` so the consumer's onChange fires once.
			target.checked = true;
			target.dispatchEvent(new Event('change', { bubbles: true }));
		};

		const contextValue: RadioGroupContextValue = {
			name: resolvedName,
			value: currentValue,
			disabled,
			onChange: (nextValue) => handleChildChange(nextValue),
		};

		return (
			<div
				ref={setGroupRef}
				role="radiogroup"
				aria-label={ariaLabel}
				aria-labelledby={ariaLabelledBy}
				aria-orientation={orientation}
				aria-disabled={disabled || undefined}
				onKeyDown={handleKeyDown}
				className={className}
			>
				<RadioGroupContext.Provider value={contextValue}>
					{children}
				</RadioGroupContext.Provider>
			</div>
		);
	}
);

RadioGroup.displayName = 'RadioGroup';

export default Radio;
