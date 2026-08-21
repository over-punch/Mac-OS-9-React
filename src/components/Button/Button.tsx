// Button component - Mac OS 9 style
// Polymorphic button/link with loading states, icon support, and an
// `asChild` escape hatch for router link components.

import React, {
	forwardRef,
	isValidElement,
	cloneElement,
	Children,
	ButtonHTMLAttributes,
	AnchorHTMLAttributes,
	AriaAttributes,
} from 'react';
import { sanitizeUrl } from '../../utils/url';
import { mergeClasses } from '../../utils/classNames';
import { type Size, type Variant } from '../../types';
import styles from './Button.module.css';

/**
 * The ARIA attributes Button computes for itself.
 *
 * Typed explicitly rather than as `Record<string, any>` so a typo in an
 * attribute name is a compile error and the values are checked.
 */
type ComputedAriaAttributes = Pick<
	AriaAttributes,
	'aria-label' | 'aria-describedby' | 'aria-pressed' | 'aria-disabled' | 'aria-busy'
>;

/**
 * Classes for targeting Button sub-elements.
 */
export interface ButtonClasses {
	/** Root element — the button, anchor, or asChild target. */
	root?: string;
	/** Wrapper around the button's text. */
	text?: string;
	/** Wrapper around `leftIcon`. */
	iconLeft?: string;
	/** Wrapper around `rightIcon`. */
	iconRight?: string;
	/** Wrapper used when `iconOnly` is set. */
	iconOnly?: string;
	/** The loading indicator. */
	spinner?: string;
}

// Common props shared by button and link variants
interface BaseButtonProps {
	/**
	 * Button variant
	 * @default 'default'
	 */
	variant?: Variant;

	/**
	 * Button size
	 * @default 'md'
	 */
	size?: Size;

	/**
	 * Whether the button is disabled
	 * @default false
	 */
	disabled?: boolean;

	/**
	 * Whether the button should take full width
	 * @default false
	 */
	fullWidth?: boolean;

	/**
	 * Loading state - shows loading indicator and disables interaction
	 * @default false
	 */
	loading?: boolean;

	/**
	 * Text to show when loading (replaces children)
	 */
	loadingText?: string;

	/**
	 * Use Mac OS 9 style watch cursor during loading
	 * @default false
	 */
	useCursorLoading?: boolean;

	/**
	 * Icon to display before the button text
	 */
	leftIcon?: React.ReactNode;

	/**
	 * Icon to display after the button text
	 */
	rightIcon?: React.ReactNode;

	/**
	 * If true, only displays the icon.
	 *
	 * An icon-only button has no visible text, so it needs an accessible name.
	 * Supply `aria-label`. If `children` happens to be a plain string it is
	 * used as a fallback, but any other node type — an `<svg>`, a component,
	 * a fragment — cannot produce a name, and in development the component
	 * logs an error rather than shipping an unlabelled control.
	 */
	iconOnly?: boolean;

	/**
	 * Render the child element instead of a `<button>`, merging Button's
	 * className and props into it.
	 *
	 * This is the integration point for router link components — Next.js
	 * `<Link>`, React Router `<Link>`, TanStack Router, and so on — which
	 * need to own the element they render.
	 *
	 * Expects exactly one React element child.
	 *
	 * @default false
	 *
	 * @example
	 * ```tsx
	 * import Link from 'next/link';
	 *
	 * <Button asChild variant="primary">
	 *   <Link href="/dashboard">Go to Dashboard</Link>
	 * </Button>
	 * ```
	 */
	asChild?: boolean;

	/**
	 * Override aria-label.
	 * @deprecated Use the standard `aria-label` attribute instead. This alias
	 * remains for backwards compatibility; `aria-label` wins if both are set.
	 */
	ariaLabel?: string;

	/**
	 * ID of element that describes this button.
	 * @deprecated Use the standard `aria-describedby` attribute instead.
	 */
	ariaDescribedBy?: string;

	/**
	 * For toggle buttons - indicates pressed state.
	 * @deprecated Use the standard `aria-pressed` attribute instead.
	 */
	ariaPressed?: boolean;

	/**
	 * Additional CSS class names
	 */
	className?: string;

	/**
	 * Classes for targeting sub-elements, so you are not guessing at hashed
	 * CSS-module names. The keys are typed, so a misspelled slot is a compile
	 * error rather than a class that silently does nothing.
	 */
	classes?: ButtonClasses;

	/**
	 * Button content
	 */
	children: React.ReactNode;
}

// Button-specific props
interface ButtonAsButton
	extends BaseButtonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> {
	/**
	 * Render as button element
	 * @default 'button'
	 */
	as?: 'button';

	/**
	 * Associate button with a form by ID
	 */
	form?: string;

	/**
	 * Override form action URL
	 */
	formAction?: string;

	/**
	 * Override form method
	 */
	formMethod?: 'get' | 'post';

	/**
	 * Skip form validation
	 */
	formNoValidate?: boolean;

	/**
	 * Where to display form response
	 */
	formTarget?: string;
}

// Link-specific props
interface ButtonAsLink
	extends BaseButtonProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> {
	/**
	 * Render as anchor element
	 */
	as: 'a';

	/**
	 * URL for the link
	 */
	href: string;

	/**
	 * Where to open the link
	 */
	target?: '_blank' | '_self' | '_parent' | '_top';

	/**
	 * Relationship of linked resource
	 * Auto-fills "noopener noreferrer" for external links if not provided
	 */
	rel?: string;

	/**
	 * Prompt to download the linked resource
	 */
	download?: boolean | string;
}

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Call signature for Button.
 *
 * `forwardRef` can only be given one ref type, so a polymorphic component
 * declared with it ends up with `HTMLButtonElement | HTMLAnchorElement` and
 * every consumer has to cast their ref. Overloading the call signature lets
 * the `as` prop pick the ref type instead, so `useRef<HTMLAnchorElement>`
 * type-checks against `<Button as="a">` with no cast.
 */
interface ButtonComponent {
	(props: ButtonAsLink & { ref?: React.Ref<HTMLAnchorElement> }): React.ReactElement | null;
	(props: ButtonAsButton & { ref?: React.Ref<HTMLButtonElement> }): React.ReactElement | null;
	displayName?: string;
}

/**
 * Mac OS 9 style Button component
 *
 * Polymorphic component that can render as button or link with consistent styling.
 *
 * Features:
 * - Classic 3-layer bevel effect (highlight, shadow, drop shadow)
 * - Polymorphic - renders as `<button>` or `<a>` based on the `as` prop, or
 *   defers to a router link via `asChild`
 * - Loading states with optional Mac OS 9 watch cursor
 * - Icon support (left, right, or icon-only)
 * - Standard `aria-*` attributes pass straight through
 * - Form integration props
 * - Auto-security for external links
 *
 * @example
 * ```tsx
 * // Button
 * <Button onClick={handleClick}>Click Me</Button>
 * <Button variant="primary" size="lg">Primary Action</Button>
 * <Button loading loadingText="Saving...">Save</Button>
 *
 * // Link styled as button
 * <Button as="a" href="/dashboard">Go to Dashboard</Button>
 * <Button as="a" href="https://example.com" target="_blank">
 *   External Link
 * </Button>
 *
 * // Router link
 * <Button asChild>
 *   <Link href="/dashboard">Go to Dashboard</Link>
 * </Button>
 *
 * // With icons
 * <Button leftIcon={<FolderIcon />}>Open</Button>
 * <Button iconOnly aria-label="Close">
 *   <CloseIcon />
 * </Button>
 * ```
 */
const ButtonImpl = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>((props, ref) => {
	const {
		variant = 'default',
		size = 'md',
		disabled = false,
		fullWidth = false,
		loading = false,
		loadingText,
		useCursorLoading = false,
		leftIcon,
		rightIcon,
		iconOnly = false,
		asChild = false,
		ariaLabel,
		ariaDescribedBy,
		ariaPressed,
		className = '',
		classes,
		children,
		...restProps
	} = props;

	// Standard aria-* attributes win over the deprecated camelCase aliases.
	const {
		'aria-label': ariaLabelAttr,
		'aria-describedby': ariaDescribedByAttr,
		'aria-pressed': ariaPressedAttr,
		...domProps
	} = restProps as Record<string, unknown> & ComputedAriaAttributes;

	const resolvedAriaLabel = (ariaLabelAttr as string | undefined) ?? ariaLabel;
	const resolvedAriaDescribedBy = (ariaDescribedByAttr as string | undefined) ?? ariaDescribedBy;
	const resolvedAriaPressed = (ariaPressedAttr as boolean | undefined) ?? ariaPressed;

	// An icon-only button with no resolvable accessible name is a control a
	// screen reader announces as just "button". Fail loudly in development
	// instead of shipping it silently.
	const iconOnlyFallbackLabel = typeof children === 'string' ? children : undefined;
	if (
		process.env.NODE_ENV !== 'production' &&
		iconOnly &&
		!resolvedAriaLabel &&
		!iconOnlyFallbackLabel
	) {
		console.error(
			'Button: `iconOnly` was set but no accessible name could be determined. ' +
				'Pass `aria-label`, because non-string children cannot supply one.'
		);
	}

	// Determine if rendering as link
	const isLink = props.as === 'a';

	// Build class names
	const classNames = mergeClasses(
		styles.button,
		styles[`button--${variant}`],
		styles[`button--${size}`],
		fullWidth && styles['button--full-width'],
		disabled && styles['button--disabled'],
		loading && styles['button--loading'],
		loading && useCursorLoading && styles['button--cursor-loading'],
		iconOnly && styles['button--icon-only'],
		(leftIcon || rightIcon) && styles['button--with-icon'],
		className,
		classes?.root
	);

	// Shared ARIA. These are spread AFTER the caller's remaining props so a
	// stray `aria-disabled`/`aria-busy` in the rest props can't contradict the
	// component's own `disabled`/`loading` state.
	//
	// The library's rule for disabled state, applied consistently across every
	// component:
	//
	//   - An element with a native disabled attribute (button, input, select,
	//     textarea) uses that alone. It already removes the element from the
	//     accessibility tree and the tab order, and a redundant aria-disabled
	//     is one more thing that can drift out of sync with it.
	//   - An element with no native equivalent (an anchor, a RadioGroup
	//     wrapper, an asChild target) carries aria-disabled instead, with the
	//     behaviour enforced in the event handler.
	//
	// aria-disabled is set here for the anchor and asChild branches; the
	// <button> branch below clears it.
	const sharedAria: ComputedAriaAttributes = {
		'aria-label': iconOnly ? (resolvedAriaLabel ?? iconOnlyFallbackLabel) : resolvedAriaLabel,
		'aria-describedby': resolvedAriaDescribedBy,
		'aria-pressed': resolvedAriaPressed,
		'aria-disabled': disabled || loading || undefined,
		'aria-busy': loading || undefined,
	};

	// Render button content with icons and loading state
	function renderButtonContent() {
		// Show loading state
		if (loading) {
			return (
				<>
					{!useCursorLoading && (
						<span
							className={mergeClasses(styles['button__loading-spinner'], classes?.spinner)}
							aria-hidden="true"
						>
							⏳
						</span>
					)}
					<span className={mergeClasses(styles['button__text'], classes?.text)}>
						{loadingText || children}
					</span>
				</>
			);
		}

		// Icon-only button
		if (iconOnly) {
			return (
				<span className={mergeClasses(styles['button__icon-only'], classes?.iconOnly)}>
					{children}
				</span>
			);
		}

		// Button with icons
		return (
			<>
				{leftIcon && (
					<span
						className={mergeClasses(styles['button__icon-left'], classes?.iconLeft)}
						aria-hidden="true"
					>
						{leftIcon}
					</span>
				)}
				<span className={mergeClasses(styles['button__text'], classes?.text)}>{children}</span>
				{rightIcon && (
					<span
						className={mergeClasses(styles['button__icon-right'], classes?.iconRight)}
						aria-hidden="true"
					>
						{rightIcon}
					</span>
				)}
			</>
		);
	}

	// --- asChild: hand rendering to the caller's element -------------------
	//
	// The child owns the element and its own href/navigation; Button only
	// contributes styling, ARIA, and the disabled/loading behaviour.
	if (asChild) {
		const child = Children.only(children);

		if (!isValidElement(child)) {
			if (process.env.NODE_ENV !== 'production') {
				console.error('Button: `asChild` expects a single React element child.');
			}
			return null;
		}

		const childProps = child.props as { className?: string; onClick?: React.MouseEventHandler };

		return cloneElement(child, {
			...domProps,
			...sharedAria,
			ref,
			className: mergeClasses(classNames, childProps.className),
			onClick: (event: React.MouseEvent) => {
				if (disabled || loading) {
					event.preventDefault();
					return;
				}
				childProps.onClick?.(event);
			},
		} as React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<unknown> });
	}

	// --- Anchor ------------------------------------------------------------
	if (isLink) {
		const { href, target, rel, download, onClick, ...linkProps } =
			domProps as unknown as ButtonAsLink;

		// Block javascript:/data:/vbscript: hrefs before they reach the DOM.
		// sanitizeUrl returns undefined for unsafe schemes; an anchor with no
		// href is non-functional but still visible, which is the desired
		// fail-closed behavior for untrusted input.
		const safeHref = sanitizeUrl(href);

		// Auto-add security rel for external links
		let finalRel = rel;
		if (target === '_blank' && !rel) {
			finalRel = 'noopener noreferrer';
		}

		// Anchors have no native disabled state, so aria-disabled carries the
		// meaning and the click handler enforces it.
		const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
			if (disabled || loading) {
				event.preventDefault();
				return;
			}
			onClick?.(event);
		};

		return (
			<a
				{...linkProps}
				ref={ref as React.Ref<HTMLAnchorElement>}
				href={disabled || loading ? undefined : safeHref}
				target={target}
				rel={finalRel}
				download={download}
				className={classNames}
				onClick={handleClick}
				{...sharedAria}
			>
				{renderButtonContent()}
			</a>
		);
	}

	// --- Button ------------------------------------------------------------
	const {
		type = 'button',
		form,
		formAction,
		formMethod,
		formNoValidate,
		formTarget,
		...buttonProps
	} = domProps as unknown as ButtonAsButton;

	return (
		<button
			{...buttonProps}
			ref={ref as React.Ref<HTMLButtonElement>}
			type={type}
			disabled={disabled || loading}
			form={form}
			formAction={formAction}
			formMethod={formMethod}
			formNoValidate={formNoValidate}
			formTarget={formTarget}
			className={classNames}
			{...sharedAria}
			// Applied after the spread so it wins: native disabled is
			// authoritative on a <button>. See the note above.
			aria-disabled={undefined}
		>
			{renderButtonContent()}
		</button>
	);
});

ButtonImpl.displayName = 'Button';

export const Button = ButtonImpl as unknown as ButtonComponent;

export default Button;
