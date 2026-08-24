// Placard component - Mac OS 9 style
//
// "A control that you can use as an information display or as background fill
// for a control area" — the small sunken nub at the bottom-left of a window,
// beside the horizontal scroll bar, showing a page number or a zoom level.
//
// The guidelines give it three states (normal, pressed, disabled), which only
// makes sense because a placard could be pressed: attaching a pop-up menu to
// one was the standard way to offer magnification levels. So it is a button
// when it has an action and plain text when it does not, rather than a
// div that fakes both.

import { forwardRef, type ReactNode } from 'react';
import { mergeClasses } from '../../utils/classNames';
import styles from './Placard.module.css';

export interface PlacardProps {
	/**
	 * What the placard reports.
	 */
	children?: ReactNode;

	/**
	 * Makes the placard pressable.
	 *
	 * Supply this and it renders a real `<button>` — which is what Mac OS 9
	 * placards were when they carried a pop-up menu. Leave it off and it is a
	 * plain readout, not a button that goes nowhere.
	 */
	onClick?: () => void;

	/**
	 * Accessible name, when the placard is pressable and its text alone does
	 * not say what pressing does.
	 */
	'aria-label'?: string;

	/**
	 * Whether a pressable placard can be pressed. Ignored on a plain one,
	 * which has nothing to disable.
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Additional CSS class names.
	 */
	className?: string;
}

/**
 * Mac OS 9 style placard.
 *
 * @example
 * ```tsx
 * <Placard>Page 3 of 12</Placard>
 *
 * // Pressable, the way a magnification placard was.
 * <Placard onClick={cycleZoom} aria-label="Change magnification">100%</Placard>
 * ```
 */
export const Placard = forwardRef<HTMLElement, PlacardProps>(
	({ children, onClick, disabled = false, className = '', 'aria-label': ariaLabel }, ref) => {
		const classes = mergeClasses(
			styles.placard,
			onClick && styles['placard--pressable'],
			className
		);

		if (!onClick) {
			return (
				<span ref={ref as React.Ref<HTMLSpanElement>} className={classes}>
					{children}
				</span>
			);
		}

		return (
			<button
				ref={ref as React.Ref<HTMLButtonElement>}
				type="button"
				onClick={onClick}
				disabled={disabled}
				aria-label={ariaLabel}
				className={classes}
			>
				{children}
			</button>
		);
	}
);

Placard.displayName = 'Placard';

export default Placard;
