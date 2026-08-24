// ChasingArrows component - Mac OS 9 style
//
// Apple's "asynchronous arrows": the small spinning wheel of arrows the
// Finder showed while updating a window. The guidelines are precise about
// when it applies — "an asynchronous background process ... which does not
// display a dialog box that might contain a progress indicator". So it is not
// a smaller Progress. It is what you use when there is no dialog to put a bar
// in, and it deliberately says nothing about how far along the work is.
//
// The animation is the whole control, which makes reduced motion the design
// problem rather than an afterthought: it cannot simply stop, or it would
// read as finished work that has stalled.

import { forwardRef } from 'react';
import { mergeClasses } from '../../utils/classNames';
import { type Size } from '../../types';
import styles from './ChasingArrows.module.css';

export interface ChasingArrowsProps {
	/**
	 * Whether the work is still going.
	 *
	 * When false the control renders nothing at all. An idle spinner is a lie
	 * about the state of a background task.
	 * @default true
	 */
	active?: boolean;

	/**
	 * What is happening, for assistive tech — "Updating window contents".
	 *
	 * Required, because "loading" on its own tells a screen-reader user
	 * nothing they did not already suspect.
	 */
	label: string;

	/**
	 * Size of the wheel.
	 * @default 'md'
	 */
	size?: Size;

	/**
	 * Additional CSS class names.
	 */
	className?: string;
}

/** Quadrant rotations, in degrees. Four arrows chasing each other. */
const ARROWS = [0, 90, 180, 270];

/**
 * Mac OS 9 style asynchronous arrows.
 *
 * Announced politely rather than assertively: background work should not
 * interrupt whatever someone is reading.
 *
 * @example
 * ```tsx
 * <ChasingArrows active={syncing} label="Updating window contents" />
 * ```
 */
export const ChasingArrows = forwardRef<HTMLSpanElement, ChasingArrowsProps>(
	({ active = true, label, size = 'md', className = '' }, ref) => {
		if (!active) return null;

		return (
			<span
				ref={ref}
				role="status"
				aria-live="polite"
				aria-label={label}
				className={mergeClasses(styles.arrows, styles[`arrows--${size}`], className)}
			>
				<span className={styles.wheel} aria-hidden="true">
					{ARROWS.map((angle) => (
						<span
							key={angle}
							className={styles.arrow}
							style={{ transform: `rotate(${angle}deg)` }}
						/>
					))}
				</span>
			</span>
		);
	}
);

ChasingArrows.displayName = 'ChasingArrows';

export default ChasingArrows;
