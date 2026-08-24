// ClockControl component - Mac OS 9 style
//
// The time field with little arrows attached, as the Date & Time control panel
// used. Mac OS 9 edited it a segment at a time: you selected hours or minutes
// and the arrows stepped that segment, rather than typing a whole timestamp.
//
// Each segment is a spinbutton, which is the accessible pattern that matches
// what the control actually is — a number you step, with a range that wraps.
// One spinbutton for the whole time would have no meaningful min and max.

import { forwardRef, useCallback, useId, useMemo, useState, type KeyboardEvent } from 'react';
import { mergeClasses } from '../../utils/classNames';
import { LittleArrows } from '../LittleArrows';
import styles from './ClockControl.module.css';

/**
 * Classes for targeting ClockControl sub-elements.
 */
export interface ClockControlClasses {
	/** The wrapper. */
	root?: string;
	/** The sunken field holding the segments. */
	field?: string;
	/** Each editable segment. */
	segment?: string;
	/** The little arrows. */
	arrows?: string;
}

/** Which part of the time is being edited. */
type Segment = 'hours' | 'minutes' | 'seconds';

export interface ClockControlProps {
	/**
	 * Time of day, as minutes-and-seconds past midnight in 24-hour terms.
	 * Controlled.
	 */
	value: { hours: number; minutes: number; seconds?: number };

	/**
	 * Show seconds as a third segment.
	 * @default false
	 */
	showSeconds?: boolean;

	/**
	 * Display as 12-hour with an AM/PM suffix. The value stays 24-hour either
	 * way, so switching the display cannot change the time.
	 * @default false
	 */
	hour12?: boolean;

	/**
	 * What this clock sets, e.g. "Alarm time". Names the group.
	 */
	label: string;

	/**
	 * Whether the clock can be changed.
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Called with the new time.
	 */
	onValueChange?: (value: { hours: number; minutes: number; seconds: number }) => void;

	/**
	 * Additional CSS class names.
	 */
	className?: string;

	/**
	 * Classes for targeting sub-elements.
	 */
	classes?: ClockControlClasses;
}

/** Upper bound of each segment. Hours are 0-23; the rest are 0-59. */
const LIMIT: Record<Segment, number> = { hours: 24, minutes: 60, seconds: 60 };

/** Two digits, always — 9:5 is not a time. */
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Mac OS 9 style clock control.
 *
 * @example
 * ```tsx
 * <ClockControl
 *   label="Alarm time"
 *   value={{ hours: 7, minutes: 30 }}
 *   onValueChange={setAlarm}
 * />
 * ```
 */
export const ClockControl = forwardRef<HTMLDivElement, ClockControlProps>(
	(
		{
			value,
			showSeconds = false,
			hour12 = false,
			label,
			disabled = false,
			onValueChange,
			className = '',
			classes,
		},
		ref
	) => {
		const [active, setActive] = useState<Segment>('hours');
		const generatedId = useId();
		const groupId = `${generatedId}-label`;

		const segments: Segment[] = showSeconds
			? ['hours', 'minutes', 'seconds']
			: ['hours', 'minutes'];

		// Memoised because `step` depends on it: a fresh object every render
		// would make the callback's identity change every render too, which
		// defeats the point of wrapping it.
		const current = useMemo(
			() => ({
				hours: value.hours,
				minutes: value.minutes,
				seconds: value.seconds ?? 0,
			}),
			[value.hours, value.minutes, value.seconds]
		);

		const step = useCallback(
			(segment: Segment, direction: 1 | -1) => {
				if (disabled) return;
				const limit = LIMIT[segment];
				// Wrapping is what the real control did: stepping past 23:59
				// came back to 00:00 rather than stopping.
				const next = (current[segment] + direction + limit) % limit;
				onValueChange?.({ ...current, [segment]: next });
			},
			[current, disabled, onValueChange]
		);

		const handleKeyDown = (segment: Segment) => (event: KeyboardEvent<HTMLSpanElement>) => {
			const index = segments.indexOf(segment);
			switch (event.key) {
				case 'ArrowUp':
					event.preventDefault();
					step(segment, 1);
					break;
				case 'ArrowDown':
					event.preventDefault();
					step(segment, -1);
					break;
				case 'ArrowLeft':
				case 'ArrowRight': {
					event.preventDefault();
					const delta = event.key === 'ArrowRight' ? 1 : -1;
					const target = segments[(index + delta + segments.length) % segments.length];
					if (target) setActive(target);
					break;
				}
				default:
					break;
			}
		};

		/** Displayed value for a segment, which differs from the stored one
		 *  only for hours in 12-hour mode. */
		const shown = (segment: Segment) => {
			if (segment !== 'hours' || !hour12) return pad(current[segment]);
			const h = current.hours % 12;
			return pad(h === 0 ? 12 : h);
		};

		return (
			<div
				ref={ref}
				role="group"
				aria-labelledby={groupId}
				className={mergeClasses(
					styles.clock,
					disabled && styles['clock--disabled'],
					className,
					classes?.root
				)}
			>
				<span id={groupId} className={styles.label}>
					{label}
				</span>

				<div className={styles.row}>
					<div className={mergeClasses(styles.field, classes?.field)}>
						{segments.map((segment, i) => (
							<span key={segment} className={styles.segmentWrap}>
								{i > 0 && (
									<span className={styles.colon} aria-hidden="true">
										:
									</span>
								)}
								<span
									role="spinbutton"
									tabIndex={disabled ? -1 : 0}
									aria-label={segment}
									aria-valuenow={current[segment]}
									aria-valuemin={0}
									aria-valuemax={LIMIT[segment] - 1}
									aria-valuetext={shown(segment)}
									aria-disabled={disabled || undefined}
									onFocus={() => setActive(segment)}
									onKeyDown={handleKeyDown(segment)}
									className={mergeClasses(
										styles.segment,
										active === segment && styles['segment--active'],
										classes?.segment
									)}
								>
									{shown(segment)}
								</span>
							</span>
						))}

						{hour12 && (
							<span className={styles.meridiem} aria-hidden="true">
								{current.hours < 12 ? 'AM' : 'PM'}
							</span>
						)}
					</div>

					{/* The arrows step whichever segment is selected, which is
					    how the original worked — one pair, not one per field. */}
					<LittleArrows
						onStep={(direction) => step(active, direction)}
						stepLabel={active}
						disabled={disabled}
						className={classes?.arrows}
					/>
				</div>
			</div>
		);
	}
);

ClockControl.displayName = 'ClockControl';

export default ClockControl;
