// WindowHeader component - Mac OS 9 style
//
// The beveled bar across the top of a Finder window that says what is in it —
// "12 items, 1.2 GB available". The Human Interface Guidelines describe it as
// a beveled rectangle whose outside lines share the same space as the inside
// lines of the window and the scroll bar arrows, which is why it sits flush
// inside the frame rather than floating with a margin.
//
// The list-view variant drops the dividing line beneath it, so the header runs
// straight into the column headings below.

import { forwardRef, type ReactNode } from 'react';
import { mergeClasses } from '../../utils/classNames';
import styles from './WindowHeader.module.css';

/**
 * Classes for targeting WindowHeader sub-elements.
 */
export interface WindowHeaderClasses {
	/** The beveled bar. */
	root?: string;
	/** The leading region. */
	start?: string;
	/** The trailing region. */
	end?: string;
}

export interface WindowHeaderProps {
	/**
	 * Whether the header runs into the content below it.
	 *
	 * `list` drops the dividing rule, which is what Finder did in list view so
	 * the header met the column headings without a seam.
	 * @default 'document'
	 */
	variant?: 'document' | 'list';

	/**
	 * What the window contains. Rendered at the leading edge.
	 */
	children?: ReactNode;

	/**
	 * Secondary information, rendered at the trailing edge — free space, a
	 * count, a status.
	 */
	trailing?: ReactNode;

	/**
	 * Additional CSS class names.
	 */
	className?: string;

	/**
	 * Classes for targeting sub-elements.
	 */
	classes?: WindowHeaderClasses;
}

/**
 * Mac OS 9 style window header.
 *
 * It reports on the window rather than labelling it, so it is not a heading:
 * making it one would put "12 items" into the document outline. It is a plain
 * region, announced only when someone navigates into it.
 *
 * @example
 * ```tsx
 * <WindowHeader trailing="1.2 GB available">12 items</WindowHeader>
 * ```
 */
export const WindowHeader = forwardRef<HTMLDivElement, WindowHeaderProps>(
	({ variant = 'document', children, trailing, className = '', classes }, ref) => (
		<div
			ref={ref}
			className={mergeClasses(
				styles.header,
				styles[`header--${variant}`],
				className,
				classes?.root
			)}
		>
			<span className={mergeClasses(styles.start, classes?.start)}>{children}</span>
			{trailing !== undefined && (
				<span className={mergeClasses(styles.end, classes?.end)}>{trailing}</span>
			)}
		</div>
	)
);

WindowHeader.displayName = 'WindowHeader';

export default WindowHeader;
