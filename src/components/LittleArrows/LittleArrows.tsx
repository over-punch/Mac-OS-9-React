// LittleArrows component - Mac OS 9 style
//
// The small stacked up/down arrows Apple called "little arrows" — a stepper,
// almost always sitting immediately to the right of a text field it drives.
//
// It is two buttons, not one control with two halves. That matters: each
// direction needs its own accessible name, and a screen-reader user needs to
// be able to reach and press either one. Where it drives a field, that field
// stays the labelled thing and these stay unlabelled increments of it.

import { forwardRef, useCallback, useEffect, useRef } from 'react';
import { mergeClasses } from '../../utils/classNames';
import { type Size } from '../../types';
import styles from './LittleArrows.module.css';

/** Delay before a held arrow starts repeating, in milliseconds. */
const REPEAT_DELAY = 400;

/** Interval between repeats once started, in milliseconds. */
const REPEAT_INTERVAL = 60;

/**
 * Classes for targeting LittleArrows sub-elements.
 */
export interface LittleArrowsClasses {
	/** The pair. */
	root?: string;
	/** Either arrow button. */
	arrow?: string;
}

export interface LittleArrowsProps {
	/**
	 * Called with `1` to step up and `-1` to step down.
	 *
	 * The value itself is not held here: little arrows drive something else —
	 * a field, a clock, a list — and duplicating its state would give you two
	 * numbers that can disagree.
	 */
	onStep: (direction: 1 | -1) => void;

	/**
	 * ID of the field these arrows drive. Surfaces as `aria-controls`.
	 */
	controls?: string;

	/**
	 * What is being stepped, for the arrows' accessible names — passing
	 * `"volume"` gives "Increase volume" and "Decrease volume".
	 *
	 * Omit it where the arrows sit beside a field that is already labelled,
	 * and they fall back to plain "Increase" and "Decrease".
	 */
	stepLabel?: string;

	/**
	 * Stop the up arrow. Use when the value is already at its maximum.
	 * @default false
	 */
	upDisabled?: boolean;

	/**
	 * Stop the down arrow. Use when the value is already at its minimum.
	 * @default false
	 */
	downDisabled?: boolean;

	/**
	 * Disable both.
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Arrow size. Match it to the field alongside.
	 * @default 'md'
	 */
	size?: Size;

	/**
	 * Additional CSS class names.
	 */
	className?: string;

	/**
	 * Classes for targeting sub-elements.
	 */
	classes?: LittleArrowsClasses;
}

/**
 * Mac OS 9 style little arrows (stepper).
 *
 * Holding an arrow repeats, the way the real control did — after a pause, so
 * a single click cannot accidentally fire twice.
 *
 * @example
 * ```tsx
 * <TextField id="qty" label="Quantity" value={String(qty)} readOnly />
 * <LittleArrows
 *   controls="qty"
 *   stepLabel="quantity"
 *   onStep={(d) => setQty((n) => n + d)}
 * />
 * ```
 */
export const LittleArrows = forwardRef<HTMLDivElement, LittleArrowsProps>(
	(
		{
			onStep,
			controls,
			stepLabel,
			upDisabled = false,
			downDisabled = false,
			disabled = false,
			size = 'md',
			className = '',
			classes,
		},
		ref
	) => {
		// Timers live in a ref rather than state: they must survive a render
		// without causing one, and they have to be cancellable from anywhere.
		const timers = useRef<{ delay?: number; repeat?: number }>({});

		const stopRepeat = useCallback(() => {
			if (timers.current.delay) window.clearTimeout(timers.current.delay);
			if (timers.current.repeat) window.clearInterval(timers.current.repeat);
			timers.current = {};
		}, []);

		// A pointer released outside the button never fires pointerup on it,
		// so the repeat would run forever. Watch the window instead.
		useEffect(() => stopRepeat, [stopRepeat]);

		const startRepeat = useCallback(
			(direction: 1 | -1) => {
				onStep(direction);
				timers.current.delay = window.setTimeout(() => {
					timers.current.repeat = window.setInterval(() => onStep(direction), REPEAT_INTERVAL);
				}, REPEAT_DELAY);
			},
			[onStep]
		);

		const arrow = (direction: 1 | -1, isDisabled: boolean) => {
			const up = direction === 1;
			const verb = up ? 'Increase' : 'Decrease';
			return (
				<button
					type="button"
					// Not a repeat of the field's own label: these are the
					// increment controls for it, so they name the action.
					aria-label={stepLabel ? `${verb} ${stepLabel}` : verb}
					aria-controls={controls}
					disabled={disabled || isDisabled}
					onPointerDown={(event) => {
						// Keep focus where it is — usually the field these
						// drive, which is where typing should still land.
						event.preventDefault();
						if (disabled || isDisabled) return;
						startRepeat(direction);
					}}
					onPointerUp={stopRepeat}
					onPointerLeave={stopRepeat}
					onPointerCancel={stopRepeat}
					// Keyboard users get a plain press with no repeat: holding
					// a key already repeats at the OS level.
					onKeyDown={(event) => {
						if (event.key !== 'Enter' && event.key !== ' ') return;
						event.preventDefault();
						onStep(direction);
					}}
					className={mergeClasses(
						styles.arrow,
						styles[up ? 'arrow--up' : 'arrow--down'],
						classes?.arrow
					)}
				>
					<span className={styles.glyph} aria-hidden="true" />
				</button>
			);
		};

		return (
			<div
				ref={ref}
				className={mergeClasses(styles.arrows, styles[`arrows--${size}`], className, classes?.root)}
			>
				{arrow(1, upDisabled)}
				{arrow(-1, downDisabled)}
			</div>
		);
	}
);

LittleArrows.displayName = 'LittleArrows';

export default LittleArrows;
