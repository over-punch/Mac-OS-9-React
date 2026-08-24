// Slider component - Mac OS 9 style
//
// A value picked by dragging a thumb along a track. The Human Interface
// Guidelines pair it with optional tick marks, and when a slider has ticks it
// snaps to them — the ticks are not decoration, they are the values.
//
// The thumb is directional: Mac OS 9 drew a pointed thumb aimed at the tick
// marks when a slider had them, and a plain rounded one when it did not.

import { forwardRef, useCallback, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { mergeClasses } from '../../utils/classNames';
import { type Size } from '../../types';
import styles from './Slider.module.css';

/**
 * Classes for targeting Slider sub-elements.
 */
export interface SliderClasses {
	/** The wrapper holding the label and track. */
	root?: string;
	/** The visible label. */
	label?: string;
	/** The groove the thumb travels along. */
	track?: string;
	/** The draggable thumb. */
	thumb?: string;
	/** The tick mark strip. */
	ticks?: string;
}

export interface SliderProps {
	/**
	 * Current value. Controlled.
	 */
	value?: number;

	/**
	 * Starting value when uncontrolled.
	 * @default min
	 */
	defaultValue?: number;

	/**
	 * Lowest selectable value.
	 * @default 0
	 */
	min?: number;

	/**
	 * Highest selectable value.
	 * @default 100
	 */
	max?: number;

	/**
	 * Granularity. Arrow keys move by this much.
	 * @default 1
	 */
	step?: number;

	/**
	 * Number of tick marks to draw, including both ends.
	 *
	 * Mac OS 9 snapped a ticked slider to its ticks, so passing this changes
	 * behaviour as well as appearance: the value lands on a tick rather than
	 * anywhere along the track.
	 */
	ticks?: number;

	/**
	 * Which way the slider runs.
	 * @default 'horizontal'
	 */
	orientation?: 'horizontal' | 'vertical';

	/**
	 * Visible label. When present it names the slider, so a separate
	 * `aria-label` is unnecessary.
	 */
	label?: ReactNode;

	/**
	 * Accessible name, for a slider with no visible label.
	 */
	'aria-label'?: string;

	/**
	 * ID of an element naming this slider.
	 */
	'aria-labelledby'?: string;

	/**
	 * Human-readable form of the current value, for assistive tech — "50
	 * percent" or "3 of 5" rather than a bare number.
	 */
	valueText?: string;

	/**
	 * Thumb and track size.
	 * @default 'md'
	 */
	size?: Size;

	/**
	 * Whether the slider can be changed.
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Called with the new value.
	 */
	onValueChange?: (value: number) => void;

	/**
	 * Additional CSS class names.
	 */
	className?: string;

	/**
	 * Classes for targeting sub-elements.
	 */
	classes?: SliderClasses;
}

/** Round to the nearest step, then clamp into range. */
function quantise(raw: number, min: number, max: number, step: number): number {
	if (!Number.isFinite(raw)) return min;
	const stepped = step > 0 ? Math.round((raw - min) / step) * step + min : raw;
	const clamped = Math.min(Math.max(stepped, min), max);
	// Floating-point steps accumulate error; 1e-6 is finer than any slider
	// anyone can drag and coarse enough to clear it.
	return Math.round(clamped * 1e6) / 1e6;
}

/**
 * Mac OS 9 style slider.
 *
 * @example
 * ```tsx
 * <Slider label="Volume" value={volume} onValueChange={setVolume} />
 *
 * // Ticked sliders snap to their ticks.
 * <Slider label="Speed" min={1} max={5} ticks={5} />
 * ```
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(
	(
		{
			value,
			defaultValue,
			min = 0,
			max = 100,
			step = 1,
			ticks,
			orientation = 'horizontal',
			label,
			valueText,
			size = 'md',
			disabled = false,
			onValueChange,
			className = '',
			classes,
			'aria-label': ariaLabel,
			'aria-labelledby': ariaLabelledBy,
		},
		ref
	) => {
		const trackRef = useRef<HTMLDivElement>(null);
		const generatedId = useId();
		const labelId = `${generatedId}-label`;

		// A ticked slider's step is the gap between ticks, because the ticks
		// are the selectable values.
		const effectiveStep = ticks && ticks > 1 ? (max - min) / (ticks - 1) : step;

		const isControlled = value !== undefined;
		const internal = useRef(quantise(defaultValue ?? min, min, max, effectiveStep));
		const current = isControlled ? quantise(value, min, max, effectiveStep) : internal.current;

		const commit = useCallback(
			(next: number) => {
				const settled = quantise(next, min, max, effectiveStep);
				if (settled === current) return;
				if (!isControlled) internal.current = settled;
				onValueChange?.(settled);
			},
			[current, effectiveStep, isControlled, max, min, onValueChange]
		);

		/** Map a pointer position on the track to a value. */
		const valueAt = useCallback(
			(clientX: number, clientY: number) => {
				const rect = trackRef.current?.getBoundingClientRect();
				if (!rect) return current;
				const fraction =
					orientation === 'vertical'
						? // A vertical slider's maximum is at the top, so the
							// fraction runs the opposite way to the coordinate.
							1 - (clientY - rect.top) / rect.height
						: (clientX - rect.left) / rect.width;
				return min + fraction * (max - min);
			},
			[current, max, min, orientation]
		);

		const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
			if (disabled) return;
			// Capture on the track, so a drag that leaves the element keeps
			// working — releasing outside the window would otherwise strand it.
			event.currentTarget.setPointerCapture(event.pointerId);
			commit(valueAt(event.clientX, event.clientY));
		};

		const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
			if (disabled || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
			commit(valueAt(event.clientX, event.clientY));
		};

		const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
			if (disabled) return;
			const page = Math.max(effectiveStep, (max - min) / 10);
			const moves: Record<string, number> = {
				ArrowRight: effectiveStep,
				ArrowUp: effectiveStep,
				ArrowLeft: -effectiveStep,
				ArrowDown: -effectiveStep,
				PageUp: page,
				PageDown: -page,
			};

			if (event.key === 'Home') {
				event.preventDefault();
				commit(min);
				return;
			}
			if (event.key === 'End') {
				event.preventDefault();
				commit(max);
				return;
			}
			const delta = moves[event.key];
			if (delta === undefined) return;
			event.preventDefault();
			commit(current + delta);
		};

		const percent = max > min ? ((current - min) / (max - min)) * 100 : 0;
		const labelledBy = label ? labelId : ariaLabelledBy;

		return (
			<div
				className={mergeClasses(
					styles.slider,
					styles[`slider--${orientation}`],
					styles[`slider--${size}`],
					disabled && styles['slider--disabled'],
					className,
					classes?.root
				)}
			>
				{label && (
					<span id={labelId} className={mergeClasses(styles.label, classes?.label)}>
						{label}
					</span>
				)}

				<div className={styles.trackArea}>
					<div
						ref={trackRef}
						className={mergeClasses(styles.track, classes?.track)}
						onPointerDown={handlePointerDown}
						onPointerMove={handlePointerMove}
					>
						<div
							ref={ref}
							role="slider"
							tabIndex={disabled ? -1 : 0}
							aria-valuenow={current}
							aria-valuemin={min}
							aria-valuemax={max}
							aria-valuetext={valueText}
							aria-orientation={orientation}
							aria-disabled={disabled || undefined}
							aria-label={labelledBy ? undefined : ariaLabel}
							aria-labelledby={labelledBy}
							onKeyDown={handleKeyDown}
							className={mergeClasses(
								styles.thumb,
								ticks ? styles['thumb--pointed'] : styles['thumb--plain'],
								classes?.thumb
							)}
							style={
								orientation === 'vertical' ? { bottom: `${percent}%` } : { left: `${percent}%` }
							}
						/>
					</div>

					{ticks !== undefined && ticks > 1 && (
						<div className={mergeClasses(styles.ticks, classes?.ticks)} aria-hidden="true">
							{Array.from({ length: ticks }, (_, i) => (
								<span
									key={i}
									className={styles.tick}
									style={
										orientation === 'vertical'
											? { bottom: `${(i / (ticks - 1)) * 100}%` }
											: { left: `${(i / (ticks - 1)) * 100}%` }
									}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		);
	}
);

Slider.displayName = 'Slider';

export default Slider;
