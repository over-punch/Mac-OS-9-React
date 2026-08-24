// Progress component - Mac OS 9 style
//
// Two indicators in one control, because Mac OS 9 treated them as one:
//
//  - Determinate: a filled bar with a known proportion.
//  - Indeterminate: the barber pole — diagonal stripes marching along a track
//    when the length of the work is unknown.
//
// The distinction is `value`. Pass a number and you get a bar; leave it
// undefined and you get the barber pole. That is deliberate: an indeterminate
// bar rendered at some arbitrary fraction is a lie about progress, and a
// determinate bar with no value is the same lie in the other direction.

import React, { forwardRef } from 'react';
import { mergeClasses } from '../../utils/classNames';
import { type Size } from '../../types';
import styles from './Progress.module.css';

/**
 * Classes for targeting Progress sub-elements.
 */
export interface ProgressClasses {
	/** Root element carrying role="progressbar". */
	root?: string;
	/** The sunken track the bar travels along. */
	track?: string;
	/** The filled portion, or the moving stripes when indeterminate. */
	bar?: string;
	/** The label rendered beside or above the track. */
	label?: string;
}

export interface ProgressProps {
	/**
	 * How far along, from 0 to `max`.
	 *
	 * Omit it for the indeterminate barber pole. There is no default, because
	 * a default would mean rendering a specific claim about progress that
	 * nobody made.
	 */
	value?: number;

	/**
	 * The value representing complete.
	 * @default 100
	 */
	max?: number;

	/**
	 * Accessible name for the indicator. Required unless `label` is visible —
	 * "progress bar" on its own tells a screen-reader user nothing about what
	 * is progressing.
	 */
	'aria-label'?: string;

	/**
	 * ID of an element naming this indicator.
	 */
	'aria-labelledby'?: string;

	/**
	 * Visible text shown above the track.
	 *
	 * When present it also names the control, so a separate `aria-label` is
	 * unnecessary.
	 */
	label?: React.ReactNode;

	/**
	 * Show the percentage beside the label. Ignored when indeterminate, since
	 * there is no percentage to show.
	 * @default false
	 */
	showValue?: boolean;

	/**
	 * Track thickness.
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
	classes?: ProgressClasses;
}

/** Clamp into the track's range so a stray value cannot overflow the bar. */
function clampValue(value: number, max: number): number {
	if (!Number.isFinite(value)) return 0;
	return Math.min(Math.max(value, 0), max);
}

/**
 * Mac OS 9 style progress indicator.
 *
 * @example
 * ```tsx
 * // Determinate — you know how much is left.
 * <Progress value={62} label="Copying files" showValue />
 *
 * // Indeterminate — you do not. The barber pole.
 * <Progress aria-label="Connecting to server" />
 * ```
 */
export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
	(
		{
			value,
			max = 100,
			label,
			showValue = false,
			size = 'md',
			className = '',
			classes,
			'aria-label': ariaLabel,
			'aria-labelledby': ariaLabelledBy,
		},
		ref
	) => {
		const indeterminate = value === undefined;
		const clamped = indeterminate ? 0 : clampValue(value, max);
		const percent = max > 0 ? (clamped / max) * 100 : 0;

		// useId must be called unconditionally.
		const generatedId = React.useId();
		const labelId = `${generatedId}-label`;

		// A visible label names the control, so it does not also need one
		// supplied by hand. Only fall back to aria-label when there is no
		// visible text to point at.
		const labelledBy = label ? labelId : ariaLabelledBy;

		return (
			<div
				className={mergeClasses(styles.progress, styles[`progress--${size}`], className, classes?.root)}
			>
				{(label || (showValue && !indeterminate)) && (
					<div className={mergeClasses(styles.header, classes?.label)}>
						{label && (
							<span id={labelId} className={styles.labelText}>
								{label}
							</span>
						)}
						{showValue && !indeterminate && (
							<span className={styles.value}>{Math.round(percent)}%</span>
						)}
					</div>
				)}

				<div
					ref={ref}
					role="progressbar"
					// An indeterminate progressbar omits aria-valuenow entirely —
					// that absence is what tells assistive tech the length is
					// unknown. Sending 0 would claim no progress instead.
					aria-valuenow={indeterminate ? undefined : clamped}
					aria-valuemin={indeterminate ? undefined : 0}
					aria-valuemax={indeterminate ? undefined : max}
					aria-label={labelledBy ? undefined : ariaLabel}
					aria-labelledby={labelledBy}
					className={mergeClasses(styles.track, classes?.track)}
				>
					<div
						className={mergeClasses(
							styles.bar,
							indeterminate ? styles['bar--indeterminate'] : styles['bar--determinate'],
							classes?.bar
						)}
						style={indeterminate ? undefined : { width: `${percent}%` }}
					/>
				</div>
			</div>
		);
	}
);

Progress.displayName = 'Progress';

export default Progress;
