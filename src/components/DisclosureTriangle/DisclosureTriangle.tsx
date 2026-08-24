// DisclosureTriangle component - Mac OS 9 style
//
// The little triangle that expands a row in a Finder list or a section in a
// dialog. The registry has carried the two glyphs since the beginning — their
// doc comments literally say "disclosure triangle" — but nothing turned them
// into a control, so every consumer rebuilt the button, the rotation and the
// aria-expanded wiring by hand.
//
// It is a real <button>, not a clickable span: it is operated by keyboard,
// it toggles, and it owns the expanded state of something else.

import React, { forwardRef } from 'react';
import { mergeClasses } from '../../utils/classNames';
import { type Size } from '../../types';
import styles from './DisclosureTriangle.module.css';

/**
 * Classes for targeting DisclosureTriangle sub-elements.
 */
export interface DisclosureTriangleClasses {
	/** The button itself. */
	root?: string;
	/** The triangle glyph. */
	triangle?: string;
	/** The label beside the triangle. */
	label?: string;
}

export interface DisclosureTriangleProps
	extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'children'> {
	/**
	 * Whether the region it controls is open. Controlled.
	 */
	expanded?: boolean;

	/**
	 * Starting state when uncontrolled.
	 * @default false
	 */
	defaultExpanded?: boolean;

	/**
	 * Called with the next state when toggled.
	 */
	onExpandedChange?: (expanded: boolean) => void;

	/**
	 * Text shown beside the triangle. When present it names the control.
	 */
	label?: React.ReactNode;

	/**
	 * ID of the region this triangle expands, so assistive tech can associate
	 * the two. Surfaces as `aria-controls`.
	 */
	controls?: string;

	/**
	 * Triangle size.
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
	classes?: DisclosureTriangleClasses;
}

/**
 * Mac OS 9 style disclosure triangle.
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * <DisclosureTriangle
 *   expanded={open}
 *   onExpandedChange={setOpen}
 *   label="Documents"
 *   controls="documents-panel"
 * />
 * <div id="documents-panel" hidden={!open}>…</div>
 * ```
 */
export const DisclosureTriangle = forwardRef<HTMLButtonElement, DisclosureTriangleProps>(
	(
		{
			expanded,
			defaultExpanded = false,
			onExpandedChange,
			label,
			controls,
			size = 'md',
			className = '',
			classes,
			onClick,
			...props
		},
		ref
	) => {
		const [internal, setInternal] = React.useState(defaultExpanded);
		const isControlled = expanded !== undefined;
		const isOpen = isControlled ? expanded : internal;

		const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
			if (!isControlled) setInternal(!isOpen);
			onExpandedChange?.(!isOpen);
			onClick?.(event);
		};

		return (
			<button
				ref={ref}
				type="button"
				aria-expanded={isOpen}
				aria-controls={controls}
				onClick={handleClick}
				className={mergeClasses(
					styles.disclosure,
					styles[`disclosure--${size}`],
					className,
					classes?.root
				)}
				{...props}
			>
				{/* One glyph rotated, rather than two swapped: the rotation is
				    the affordance, and it is what the real control did. */}
				<span
					aria-hidden="true"
					className={mergeClasses(
						styles.triangle,
						isOpen && styles['triangle--expanded'],
						classes?.triangle
					)}
				/>
				{label !== undefined && (
					<span className={mergeClasses(styles.label, classes?.label)}>{label}</span>
				)}
			</button>
		);
	}
);

DisclosureTriangle.displayName = 'DisclosureTriangle';

export default DisclosureTriangle;
