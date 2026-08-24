// BevelButton component - Mac OS 9 style
//
// "A rectangular control with a beveled edge that gives the button a
// three-dimensional appearance." What makes it its own control rather than a
// skin on Button is the second half of the guidelines' description: a bevel
// button can behave as a push button, a radio button, a checkbox, or a pop-up
// menu button. Toolbars and palettes were built out of these.
//
// Boundary with IconButton: IconButton is a push button that happens to show
// an icon. BevelButton is a surface whose *behaviour* is chosen — sticky,
// mutually exclusive, or menu-bearing. If all you want is a push button with
// an icon in it, IconButton is the smaller thing and the right one.

import { forwardRef, type ReactNode } from 'react';
import { mergeClasses } from '../../utils/classNames';
import { type Size } from '../../types';
import styles from './BevelButton.module.css';

/**
 * Classes for targeting BevelButton sub-elements.
 */
export interface BevelButtonClasses {
	/** The beveled surface. */
	root?: string;
	/** The content row. */
	content?: string;
	/** The pop-up arrow, when present. */
	arrow?: string;
}

/**
 * How the button behaves — which is what decides its semantics, not just its
 * look.
 *
 * - `push` — a momentary action.
 * - `toggle` — sticks in or out. Announced as a pressed toggle button.
 * - `radio` — one of a mutually exclusive set. Announced as a radio.
 * - `popup` — opens a menu. Announced as having a popup.
 */
export type BevelButtonBehaviour = 'push' | 'toggle' | 'radio' | 'popup';

export interface BevelButtonProps {
	/**
	 * What the button does, and therefore how it is announced.
	 * @default 'push'
	 */
	behaviour?: BevelButtonBehaviour;

	/**
	 * Whether the button is currently in.
	 *
	 * Required in spirit for `toggle` and `radio`, meaningless for `push`.
	 */
	selected?: boolean;

	/**
	 * Whether an open menu is showing. Only meaningful for `popup`.
	 * @default false
	 */
	expanded?: boolean;

	/**
	 * Icon, picture or text. The guidelines allow any of them, singly or
	 * together.
	 */
	children?: ReactNode;

	/**
	 * Accessible name, for a button whose content is an icon with no text.
	 */
	'aria-label'?: string;

	/**
	 * Edge depth. Mac OS 9 offered small, medium and large bevels, and the
	 * depth is the control's whole character.
	 * @default 'md'
	 */
	bevel?: Size;

	/**
	 * Whether the button can be pressed.
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Called on press. For `toggle` and `radio`, flip `selected` in response
	 * rather than expecting the button to remember.
	 */
	onClick?: () => void;

	/**
	 * Additional CSS class names.
	 */
	className?: string;

	/**
	 * Classes for targeting sub-elements.
	 */
	classes?: BevelButtonClasses;
}

/**
 * Mac OS 9 style bevel button.
 *
 * @example
 * ```tsx
 * // A palette of mutually exclusive tools.
 * <BevelButton behaviour="radio" selected={tool === 'pen'} onClick={() => setTool('pen')}>
 *   <PenIcon label={null} />
 * </BevelButton>
 *
 * // A sticky option.
 * <BevelButton behaviour="toggle" selected={bold} onClick={() => setBold(!bold)}>B</BevelButton>
 * ```
 */
export const BevelButton = forwardRef<HTMLButtonElement, BevelButtonProps>(
	(
		{
			behaviour = 'push',
			selected,
			expanded = false,
			children,
			bevel = 'md',
			disabled = false,
			onClick,
			className = '',
			classes,
			'aria-label': ariaLabel,
		},
		ref
	) => {
		// The behaviour picks the semantics. A radio is a radio, not a button
		// that looks pressed — a screen-reader user needs to hear that exactly
		// one of the set applies.
		const isRadio = behaviour === 'radio';
		const isToggle = behaviour === 'toggle';
		const isPopup = behaviour === 'popup';

		return (
			<button
				ref={ref}
				type="button"
				role={isRadio ? 'radio' : undefined}
				aria-checked={isRadio ? Boolean(selected) : undefined}
				aria-pressed={isToggle ? Boolean(selected) : undefined}
				aria-haspopup={isPopup ? 'menu' : undefined}
				aria-expanded={isPopup ? expanded : undefined}
				aria-label={ariaLabel}
				disabled={disabled}
				onClick={onClick}
				className={mergeClasses(
					styles.bevel,
					styles[`bevel--${bevel}`],
					// Only sticky behaviours can look pressed-in at rest. A push
					// button that stayed down would be lying about its state.
					(isRadio || isToggle) && selected && styles['bevel--selected'],
					className,
					classes?.root
				)}
			>
				<span className={mergeClasses(styles.content, classes?.content)}>{children}</span>
				{isPopup && (
					<span className={mergeClasses(styles.arrow, classes?.arrow)} aria-hidden="true" />
				)}
			</button>
		);
	}
);

BevelButton.displayName = 'BevelButton';

export default BevelButton;
