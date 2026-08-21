// Select component - Mac OS 9 style
// Custom listbox with full keyboard support and pixel-accurate popup
//
// Correctness notes (panel review #38, #49):
//  - Built on a button + role="listbox" popup rather than a native <select>.
//    A native control only lets the closed box be themed; the opened option
//    list is drawn by the OS, which broke the library's whole premise of
//    pixel-perfect Mac OS 9 fidelity. The JSDoc also claimed arrow-key
//    combobox behaviour that was never implemented (#38)
//  - Generic over the option value, so a literal union such as
//    'red' | 'blue' survives into onValueChange instead of widening (#49)
//  - A hidden input carries the value, so the control still participates in
//    native form submission and FormData exactly as the old <select> did

// Note: no per-file 'use client' directive. The library ships as a single
// bundle and Rollup applies the "use client" banner to the whole output,
// so per-file directives are silently dropped at bundle time.

import React, { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { useMenuPosition } from '../../hooks/useMenuPosition';
import { mergeClasses } from '../../utils/classNames';
import styles from './Select.module.css';

/** A single choice in the list. */
export interface SelectOption<TValue extends string | number = string> {
	value: TValue;
	label: string;
	disabled?: boolean;
	/**
	 * Optional group heading. Consecutive options sharing a group are drawn
	 * under one heading, replacing what `<optgroup>` did for the native
	 * control.
	 */
	group?: string;
}

/**
 * Classes for targeting Select sub-elements.
 */
export interface SelectClasses {
	/** Root wrapper. */
	root?: string;
	/** The visible label. */
	label?: string;
	/** The button that opens the listbox. */
	trigger?: string;
	/** The listbox popup. */
	listbox?: string;
	/** An individual option. */
	option?: string;
	/** A group heading within the listbox. */
	group?: string;
	/** Helper text shown when there is no error. */
	helperText?: string;
	/** Error text shown while `error` is set. */
	errorMessage?: string;
}

export interface SelectProps<TValue extends string | number = string> {
	/** Label text for the select */
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

	/** Error message to display below the field */
	errorMessage?: string;

	/** Helper text to display below the field */
	helperText?: string;

	/** Options for the select dropdown */
	options: readonly SelectOption<TValue>[];

	/** Selected value (controlled) */
	value?: TValue;

	/** Initial selected value (uncontrolled) */
	defaultValue?: TValue;

	/** Called with the newly selected value */
	onValueChange?: (value: TValue) => void;

	/** Placeholder shown when nothing is selected */
	placeholder?: string;

	/** Whether the control is disabled */
	disabled?: boolean;

	/** Whether a value is required for form validation */
	required?: boolean;

	/** Name used when the control participates in a form */
	name?: string;

	/** Override aria-label */
	'aria-label'?: string;

	/** ID of element that describes this select */
	'aria-describedby'?: string;

	/** Element id */
	id?: string;

	/** Additional CSS class names */
	className?: string;

	/** Classes for targeting sub-elements. */
	classes?: SelectClasses;
}

/** Index of the first option that isn't disabled, searching in `step` order. */
function findEnabled<TValue extends string | number>(
	options: readonly SelectOption<TValue>[],
	from: number,
	step: number
): number {
	for (let i = from; i >= 0 && i < options.length; i += step) {
		if (!options[i]?.disabled) return i;
	}
	return -1;
}

function SelectInner<TValue extends string | number = string>(
	{
		label,
		labelPosition = 'top',
		size = 'md',
		fullWidth = false,
		error = false,
		errorMessage,
		helperText,
		options,
		value: controlledValue,
		defaultValue,
		onValueChange,
		placeholder = 'Select…',
		disabled = false,
		required = false,
		name,
		id,
		className = '',
		classes,
		'aria-label': ariaLabel,
		'aria-describedby': ariaDescribedBy,
	}: SelectProps<TValue>,
	ref: React.ForwardedRef<HTMLButtonElement>
): React.JSX.Element {
	const generatedId = useId();
	const selectId = id || generatedId;
	const listboxId = `${selectId}-listbox`;
	const helperId = `${selectId}-helper`;
	const errorId = `${selectId}-error`;
	const labelId = `${selectId}-label`;

	const [uncontrolledValue, setUncontrolledValue] = useState<TValue | undefined>(defaultValue);
	const isControlled = controlledValue !== undefined;
	const value = isControlled ? controlledValue : uncontrolledValue;

	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const triggerRef = useRef<HTMLButtonElement | null>(null);
	const listboxRef = useRef<HTMLDivElement | null>(null);

	const selectedIndex = useMemo(
		() => options.findIndex((option) => option.value === value),
		[options, value]
	);

	// Which option the keyboard cursor sits on while the list is open. It
	// tracks the selection when opening, so typing continues from there.
	const [activeIndex, setActiveIndex] = useState(-1);

	const setTriggerRef = useCallback(
		(node: HTMLButtonElement | null) => {
			triggerRef.current = node;
			if (typeof ref === 'function') ref(node);
			else if (ref) ref.current = node;
		},
		[ref]
	);

	useOutsideClick({
		enabled: isOpen,
		refs: [containerRef, listboxRef],
		onOutside: () => setIsOpen(false),
	});

	// Keeps the popup on screen near a viewport edge, same as the menus.
	const { style: popupStyle } = useMenuPosition({
		open: isOpen,
		anchorRef: triggerRef,
		menuRef: listboxRef,
	});

	const commit = useCallback(
		(next: TValue) => {
			if (!isControlled) setUncontrolledValue(next);
			onValueChange?.(next);
		},
		[isControlled, onValueChange]
	);

	const open = useCallback(() => {
		if (disabled) return;
		setActiveIndex(selectedIndex >= 0 ? selectedIndex : findEnabled(options, 0, 1));
		setIsOpen(true);
	}, [disabled, options, selectedIndex]);

	const close = useCallback((returnFocus = true) => {
		setIsOpen(false);
		if (returnFocus) triggerRef.current?.focus();
	}, []);

	const selectAt = useCallback(
		(index: number) => {
			const option = options[index];
			if (!option || option.disabled) return;
			commit(option.value);
			close();
		},
		[options, commit, close]
	);

	// Scroll the active option into view as the cursor moves, so keyboard
	// navigation through a long list stays visible.
	useEffect(() => {
		if (!isOpen || activeIndex < 0) return;
		const node = listboxRef.current?.querySelector<HTMLElement>(
			`[data-option-index="${activeIndex}"]`
		);
		// Optional-called: scrollIntoView is absent in non-browser DOM
		// implementations, and losing the scroll nicety must not throw.
		node?.scrollIntoView?.({ block: 'nearest' });
	}, [isOpen, activeIndex]);

	// Type-ahead buffer: typing "ba" jumps to the first option starting "ba".
	const typeaheadRef = useRef<{ query: string; timer: number | null }>({
		query: '',
		timer: null,
	});

	const runTypeahead = useCallback(
		(char: string) => {
			const state = typeaheadRef.current;
			if (state.timer !== null) window.clearTimeout(state.timer);
			state.query += char.toLowerCase();
			state.timer = window.setTimeout(() => {
				state.query = '';
				state.timer = null;
			}, 500);

			const match = options.findIndex(
				(option) => !option.disabled && option.label.toLowerCase().startsWith(state.query)
			);
			if (match === -1) return;

			if (isOpen) {
				setActiveIndex(match);
				return;
			}
			const matched = options[match];
			if (matched) commit(matched.value);
		},
		[options, isOpen, commit]
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (disabled) return;

			// A single printable character feeds type-ahead rather than any
			// navigation behaviour.
			if (event.key.length === 1 && event.key !== ' ' && !event.metaKey && !event.ctrlKey) {
				event.preventDefault();
				runTypeahead(event.key);
				return;
			}

			switch (event.key) {
				case 'ArrowDown':
				case 'ArrowUp': {
					event.preventDefault();
					const step = event.key === 'ArrowDown' ? 1 : -1;
					if (!isOpen) {
						open();
						return;
					}
					const from = activeIndex < 0 ? (step > 0 ? 0 : options.length - 1) : activeIndex + step;
					const next = findEnabled(options, from, step);
					if (next !== -1) setActiveIndex(next);
					break;
				}
				case 'Home': {
					if (!isOpen) return;
					event.preventDefault();
					setActiveIndex(findEnabled(options, 0, 1));
					break;
				}
				case 'End': {
					if (!isOpen) return;
					event.preventDefault();
					setActiveIndex(findEnabled(options, options.length - 1, -1));
					break;
				}
				case 'Enter':
				case ' ': {
					event.preventDefault();
					if (!isOpen) open();
					else if (activeIndex >= 0) selectAt(activeIndex);
					break;
				}
				case 'Escape': {
					if (!isOpen) return;
					event.preventDefault();
					close();
					break;
				}
				case 'Tab': {
					// Tab commits nothing and simply dismisses, matching native
					// listbox behaviour; focus continues naturally.
					if (isOpen) setIsOpen(false);
					break;
				}
				default:
					break;
			}
		},
		[disabled, isOpen, activeIndex, options, open, close, selectAt, runTypeahead]
	);

	const describedByIds = [
		helperText && !error ? helperId : null,
		error && errorMessage ? errorId : null,
		ariaDescribedBy || null,
	]
		.filter(Boolean)
		.join(' ');

	const wrapperClassNames = mergeClasses(
		styles.wrapper,
		styles[`wrapper--label-${labelPosition}`],
		fullWidth && styles['wrapper--full-width'],
		disabled && styles['wrapper--disabled'],
		className,
		classes?.root
	);

	const triggerClassNames = mergeClasses(
		styles.select,
		styles[`select--${size}`],
		fullWidth && styles['select--full-width'],
		error && styles['select--error'],
		classes?.trigger
	);

	const labelClassNames = mergeClasses(styles.label, styles[`label--${size}`], classes?.label);

	const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

	const labelElement = label ? (
		<span
			id={labelId}
			className={labelClassNames}
			onClick={() => triggerRef.current?.focus()}
			role="presentation"
		>
			{label}
		</span>
	) : null;

	return (
		<div ref={containerRef} className={wrapperClassNames}>
			{labelElement && (labelPosition === 'top' || labelPosition === 'left') && labelElement}

			{/* Carries the value into native form submission and FormData,
			    which the old native <select> provided for free. */}
			{name && <input type="hidden" name={name} value={value ?? ''} />}

			<button
				ref={setTriggerRef}
				id={selectId}
				type="button"
				className={triggerClassNames}
				disabled={disabled}
				onClick={() => (isOpen ? close(false) : open())}
				onKeyDown={handleKeyDown}
				role="combobox"
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				aria-controls={isOpen ? listboxId : undefined}
				aria-activedescendant={
					isOpen && activeIndex >= 0 ? `${selectId}-option-${activeIndex}` : undefined
				}
				aria-label={ariaLabel}
				aria-labelledby={!ariaLabel && label ? labelId : undefined}
				aria-invalid={error || undefined}
				aria-required={required || undefined}
				aria-describedby={describedByIds || undefined}
			>
				<span className={selectedOption ? styles.value : styles.placeholder}>
					{selectedOption ? selectedOption.label : placeholder}
				</span>
				<span className={styles.arrow} aria-hidden="true" />
			</button>

			{isOpen && (
				<div
					ref={listboxRef}
					id={listboxId}
					className={mergeClasses(styles.listbox, classes?.listbox)}
					style={popupStyle}
					role="listbox"
					aria-labelledby={label ? labelId : undefined}
					tabIndex={-1}
				>
					{options.map((option, index) => {
						const isSelected = index === selectedIndex;
						const isActive = index === activeIndex;
						// A heading is drawn whenever the group changes, so
						// consecutive options collapse under one label.
						const previousGroup = index > 0 ? options[index - 1]?.group : undefined;
						const startsGroup = option.group && option.group !== previousGroup;

						return (
							<React.Fragment key={String(option.value)}>
								{startsGroup && (
									<div
										className={mergeClasses(styles.optionGroupLabel, classes?.group)}
										role="presentation"
									>
										{option.group}
									</div>
								)}
								<div
									id={`${selectId}-option-${index}`}
									data-option-index={index}
									className={mergeClasses(
										styles.option,
										isSelected && styles['option--selected'],
										isActive && styles['option--active'],
										option.disabled && styles['option--disabled'],
										classes?.option
									)}
									role="option"
									aria-selected={isSelected}
									aria-disabled={option.disabled || undefined}
									// The list keeps DOM focus on the trigger and
									// tracks the cursor with aria-activedescendant,
									// so pointer hover only moves the cursor.
									onMouseEnter={() => !option.disabled && setActiveIndex(index)}
									onClick={() => selectAt(index)}
								>
									<span className={styles.optionCheck} aria-hidden="true">
										{isSelected ? '✓' : ''}
									</span>
									{option.label}
								</div>
							</React.Fragment>
						);
					})}
				</div>
			)}

			{labelElement && labelPosition === 'right' && labelElement}

			{helperText && !error && (
				<p id={helperId} className={styles['helper-text']}>
					{helperText}
				</p>
			)}

			{error && errorMessage && (
				<p id={errorId} className={styles['error-message']} role="alert">
					{errorMessage}
				</p>
			)}
		</div>
	);
}

const SelectWithRef = forwardRef(SelectInner);
SelectWithRef.displayName = 'Select';

/**
 * Mac OS 9 style Select.
 *
 * A custom listbox, so the opened option list is drawn by the library rather
 * than the operating system and keeps the Mac OS 9 look. Supports arrow-key
 * navigation, Home/End, type-ahead, Escape, and `aria-activedescendant`.
 *
 * @example
 * ```tsx
 * <Select<'red' | 'blue'>
 *   label="Colour"
 *   options={[
 *     { value: 'red', label: 'Red' },
 *     { value: 'blue', label: 'Blue' },
 *   ]}
 *   value={colour}
 *   onValueChange={setColour}  // receives 'red' | 'blue'
 * />
 * ```
 */
export const Select = SelectWithRef as <TValue extends string | number = string>(
	props: SelectProps<TValue> & { ref?: React.Ref<HTMLButtonElement> }
) => React.JSX.Element;

export default Select;
