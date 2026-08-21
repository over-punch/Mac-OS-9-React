// Radio component - Mac OS 9 style
// Classic radio button with label support and full accessibility
// Includes companion RadioGroup component for WAI-ARIA radiogroup pattern

import React, {
	forwardRef,
	InputHTMLAttributes,
	useCallback,
	useId,
	useRef,
	useState,
} from 'react';
import { FieldMessage, describedBy, type ErrorLiveRegion } from '../FieldMessage';
import { mergeClasses } from '../../utils/classNames';
import { type Size } from '../../types';
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

/**
 * Classes for targeting Radio sub-elements.
 */
export interface RadioClasses {
	/** Root wrapper. */
	root?: string;
	/** The input itself. */
	input?: string;
	/** The visible label. */
	label?: string;
	/** Helper text shown when there is no error. */
	helperText?: string;
	/** Error text shown while `error` is set. */
	errorMessage?: string;
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
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
	size?: Size;

	/**
	 * Error state for form validation
	 * @default false
	 */
	error?: boolean;

	/**
	 * What is wrong, shown beneath the control while `error` is true.
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
	 * ID of an element describing this radio.
	 */
	'aria-describedby'?: string;

	/**
	 * Additional CSS class names
	 */
	className?: string;

	/**
	 * Classes for targeting sub-elements.
	 */
	classes?: RadioClasses;

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
 * <RadioGroup name="size" value={size} onValueChange={setSize}>
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
			errorMessage,
			helperText,
			errorLiveRegion = 'polite',
			'aria-label': ariaLabelAttr,
			'aria-describedby': ariaDescribedByAttr,
			className = '',
			classes,
			value,
			name,
			id,
			onChange,
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
		const wrapperClassNames = mergeClasses(
			styles.wrapper,
			styles[`wrapper--${size}`],
			styles[`wrapper--label-${labelPosition}`],
			resolvedDisabled && styles['wrapper--disabled'],
			error && styles['wrapper--error'],
			className,
			classes?.root
		);

		const radioClassNames = mergeClasses(
			classes?.input,
			styles.radio,
			styles[`radio--${size}`],
			error && styles['radio--error']
		);

		const labelClassNames = mergeClasses(styles.label, styles[`label--${size}`], classes?.label);

		// ARIA attributes
		const helperId = `${radioId}-helper`;
		const errorId = `${radioId}-error`;

		const ariaAttributes = {
			'aria-label': !label ? ariaLabelAttr : undefined,
			'aria-describedby': describedBy({
				helperId,
				errorId,
				helperText,
				error,
				errorMessage,
				callerDescribedBy: ariaDescribedByAttr,
			}),
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

Radio.displayName = 'Radio';

/**
 * Props accepted by <RadioGroup>.
 */
export interface RadioGroupProps<TValue extends string | number = string> {
	/**
	 * Shared name for every <Radio> in the group. When omitted, a stable
	 * auto-generated id is used so radios in the same group are linked.
	 */
	name?: string;

	/**
	 * Controlled selected value. Pair with `onValueChange`.
	 *
	 * Generic, so a literal union or a plain `string` survives into the
	 * callback instead of widening to `string | number`.
	 */
	value?: TValue;

	/**
	 * Uncontrolled initial value.
	 */
	defaultValue?: TValue;

	/**
	 * Called with the newly selected value.
	 *
	 * Named `onValueChange` because it reports a value rather than a DOM
	 * event. Across the library `onChange` always means the native change
	 * handler of a wrapped input — which is what the individual `Radio` has —
	 * and `onValueChange` always means the parsed value.
	 */
	onValueChange?: (value: TValue) => void;

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
	 * `aria-labelledby` to a visible heading.
	 */
	'aria-label'?: string;

	/**
	 * ID of a visible label element for the group.
	 */
	'aria-labelledby'?: string;

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
 * <RadioGroup name="size" value={size} onValueChange={setSize} aria-label="T-shirt size">
 *   <Radio value="small" label="Small" />
 *   <Radio value="medium" label="Medium" />
 *   <Radio value="large" label="Large" />
 * </RadioGroup>
 * ```
 */
const RadioGroupImpl = forwardRef<HTMLDivElement, RadioGroupProps<string | number>>(
	(
		{
			name,
			value,
			defaultValue,
			onValueChange,
			disabled = false,
			orientation = 'vertical',
			'aria-label': ariaLabelAttr,
			'aria-labelledby': ariaLabelledByAttr,
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
				onValueChange?.(nextValue);
			},
			[isControlled, onValueChange]
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

			// Report the change through the group's own handler rather than
			// mutating `target.checked` and dispatching a native `change`.
			//
			// React does not derive a radio's onChange from a native change
			// event — it detects the change from a click — so the dispatched
			// event notified nobody, while the imperative `checked = true`
			// desynced the DOM from React's controlled value until the next
			// render put it back. Arrow-key selection simply did not reach the
			// consumer.
			//
			// Selecting on move is the WAI-ARIA radiogroup pattern for
			// automatic activation, which is what this implements.
			handleChildChange(target.value);
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
				aria-label={ariaLabelAttr}
				aria-labelledby={ariaLabelledByAttr}
				aria-orientation={orientation}
				aria-disabled={disabled || undefined}
				onKeyDown={handleKeyDown}
				className={mergeClasses(styles.radioGroup, styles[`radioGroup--${orientation}`], className)}
			>
				<RadioGroupContext.Provider value={contextValue}>{children}</RadioGroupContext.Provider>
			</div>
		);
	}
);

RadioGroupImpl.displayName = 'RadioGroup';

/**
 * `forwardRef` erases generics, so the forwarded component is re-cast to a
 * signature that keeps `TValue` — matching Select, Tabs and ListView.
 */
export const RadioGroup = RadioGroupImpl as <TValue extends string | number = string>(
	props: RadioGroupProps<TValue> & { ref?: React.Ref<HTMLDivElement> }
) => React.ReactElement | null;

export default Radio;
