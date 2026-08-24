// GroupBox component - Mac OS 9 style
//
// The etched border that associates, isolates and distinguishes a group of
// related controls. It is the most common structure in a Mac OS 9 control
// panel, and the Human Interface Guidelines define two weights of it:
//
//  - Primary, a two-pixel etched border. The default choice.
//  - Secondary, a one-pixel border, for nesting subsidiary information inside
//    a primary box. The guidelines are explicit that a secondary box is not a
//    substitute for a primary one.
//
// The title has four forms, and they are not decoration: a checkbox title
// says the whole group can be switched off, and a pop-up title says the group
// changes with the selection.

import { forwardRef, useId, type ReactNode } from 'react';
import { mergeClasses } from '../../utils/classNames';
import styles from './GroupBox.module.css';

/**
 * Classes for targeting GroupBox sub-elements.
 */
export interface GroupBoxClasses {
	/** The fieldset carrying the etched border. */
	root?: string;
	/** The legend, when the box has a title. */
	title?: string;
	/** The content region inside the border. */
	content?: string;
}

export interface GroupBoxProps {
	/**
	 * Border weight.
	 *
	 * `primary` is the two-pixel etch and the default. `secondary` is the
	 * one-pixel border, and is for nesting inside a primary box rather than
	 * for standing in for one.
	 * @default 'primary'
	 */
	variant?: 'primary' | 'secondary';

	/**
	 * Text title set into the border.
	 *
	 * Omit it for an untitled box. When `control` is given, this names that
	 * control rather than being rendered on its own.
	 */
	title?: ReactNode;

	/**
	 * A control placed in the title position — a checkbox, or a select.
	 *
	 * A checkbox here means the group can be disabled as a whole; a select
	 * means the group's contents change with the selection. Pass the control
	 * itself, so its own state and handlers stay yours.
	 */
	control?: ReactNode;

	/**
	 * Grey the contents out. The title stays legible, because it is what
	 * tells you the group exists and how to switch it back on.
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * The grouped controls.
	 */
	children?: ReactNode;

	/**
	 * Additional CSS class names.
	 */
	className?: string;

	/**
	 * Classes for targeting sub-elements.
	 */
	classes?: GroupBoxClasses;
}

/**
 * Mac OS 9 style group box.
 *
 * Renders a `<fieldset>` with a `<legend>`, which is what gives assistive
 * technology the grouping for free — a `<div>` with a heading looks the same
 * and announces nothing.
 *
 * @example
 * ```tsx
 * <GroupBox title="Sharing">
 *   <Checkbox label="Share this folder" />
 * </GroupBox>
 *
 * // The group can be switched off as a whole.
 * <GroupBox control={<Checkbox label="Use a proxy server" />}>
 *   <TextField label="Address" />
 * </GroupBox>
 * ```
 */
export const GroupBox = forwardRef<HTMLFieldSetElement, GroupBoxProps>(
	(
		{ variant = 'primary', title, control, disabled = false, children, className = '', classes },
		ref
	) => {
		const generatedId = useId();
		const titleId = `${generatedId}-title`;
		const hasTitle = title !== undefined || control !== undefined;

		return (
			<fieldset
				ref={ref}
				// The fieldset is not disabled even when the group is: disabling
				// it would take the title control down with the contents, and a
				// checkbox title is the thing you need in order to switch the
				// group back on.
				aria-labelledby={hasTitle ? titleId : undefined}
				className={mergeClasses(
					styles.groupBox,
					styles[`groupBox--${variant}`],
					disabled && styles['groupBox--disabled'],
					className,
					classes?.root
				)}
			>
				{hasTitle && (
					<legend id={titleId} className={mergeClasses(styles.title, classes?.title)}>
						{control ?? title}
					</legend>
				)}
				<div
					className={mergeClasses(styles.content, classes?.content)}
					// Contents of a switched-off group are unreachable, but the
					// title control above stays operable.
					{...(disabled ? { inert: '' as unknown as boolean } : {})}
				>
					{children}
				</div>
			</fieldset>
		);
	}
);

GroupBox.displayName = 'GroupBox';

export default GroupBox;
