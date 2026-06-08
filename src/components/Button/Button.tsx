// Button component - Mac OS 9 style
// Enhanced with polymorphic support, loading states, and icon support

import React, { forwardRef, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import { sanitizeUrl } from '../../utils/url';
import styles from './Button.module.css';

// Common props shared by button and link variants
interface BaseButtonProps {
	/**
	 * Button variant
	 * @default 'default'
	 */
	variant?: 'default' | 'primary' | 'danger';

	/**
	 * Button size
	 * @default 'md'
	 */
	size?: 'sm' | 'md' | 'lg';

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
	 * If true, only displays icon (children used as aria-label)
	 */
	iconOnly?: boolean;

	/**
	 * Override aria-label
	 */
	ariaLabel?: string;

	/**
	 * ID of element that describes this button
	 */
	ariaDescribedBy?: string;

	/**
	 * For toggle buttons - indicates pressed state
	 */
	ariaPressed?: boolean;

	/**
	 * Additional CSS class names
	 */
	className?: string;

	/**
	 * Button content
	 */
	children: React.ReactNode;
}

// Button-specific props
interface ButtonAsButton extends BaseButtonProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps | 'aria-label' | 'aria-describedby' | 'aria-pressed'> {
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
interface ButtonAsLink extends BaseButtonProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps | 'aria-label' | 'aria-describedby' | 'aria-pressed'> {
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
 * Mac OS 9 style Button component
 * 
 * Polymorphic component that can render as button or link with consistent styling.
 * 
 * Features:
 * - Classic 3-layer bevel effect (highlight, shadow, drop shadow)
 * - Polymorphic - renders as <button> or <a> based on `as` prop
 * - Loading states with optional Mac OS 9 watch cursor
 * - Icon support (left, right, or icon-only)
 * - Full accessibility with ARIA support
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
 * // With icons
 * <Button leftIcon={<FolderIcon />}>Open</Button>
 * <Button iconOnly aria-label="Close">
 *   <CloseIcon />
 * </Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
	(props, ref) => {
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
			ariaLabel,
			ariaDescribedBy,
			ariaPressed,
			className = '',
			children,
			...restProps
		} = props;

		// Determine if rendering as link
		const isLink = props.as === 'a';
		const Component = isLink ? 'a' : 'button';

		// Build class names
		const classNames = [
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
		]
			.filter(Boolean)
			.join(' ');

		// Prepare ARIA attributes
		const ariaAttributes: Record<string, any> = {
			'aria-label': iconOnly ? (ariaLabel || (typeof children === 'string' ? children : undefined)) : ariaLabel,
			'aria-describedby': ariaDescribedBy,
			'aria-pressed': ariaPressed,
			'aria-disabled': disabled || loading,
			'aria-busy': loading,
		};

		// Handle link-specific props
		if (isLink) {
			const { href, target, rel, download, ...linkProps } = restProps as ButtonAsLink;

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

			// Links can't be truly disabled, so prevent default
			const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
				if (disabled || loading) {
					e.preventDefault();
					return;
				}
				linkProps.onClick?.(e);
			};

			return (
				<a
					ref={ref as React.Ref<HTMLAnchorElement>}
					href={disabled || loading ? undefined : safeHref}
					target={target}
					rel={finalRel}
					download={download}
					className={classNames}
					{...ariaAttributes}
					{...linkProps}
					onClick={handleClick}
				>
					{renderButtonContent()}
				</a>
			);
		}

		// Handle button-specific props
		const {
			type = 'button',
			form,
			formAction,
			formMethod,
			formNoValidate,
			formTarget,
			...buttonProps
		} = restProps as ButtonAsButton;

		return (
			<button
				ref={ref as React.Ref<HTMLButtonElement>}
				type={type}
				disabled={disabled || loading}
				form={form}
				formAction={formAction}
				formMethod={formMethod}
				formNoValidate={formNoValidate}
				formTarget={formTarget}
				className={classNames}
				{...ariaAttributes}
				{...buttonProps}
			>
				{renderButtonContent()}
			</button>
		);

		// Render button content with icons and loading state
		function renderButtonContent() {
			// Show loading state
			if (loading) {
				return (
					<>
						{!useCursorLoading && (
							<span className={styles['button__loading-spinner']} aria-hidden="true">
								⏳
							</span>
						)}
						<span className={styles['button__text']}>
							{loadingText || children}
						</span>
					</>
				);
			}

			// Icon-only button
			if (iconOnly) {
				return <span className={styles['button__icon-only']}>{children}</span>;
			}

			// Button with icons
			return (
				<>
					{leftIcon && (
						<span className={styles['button__icon-left']} aria-hidden="true">
							{leftIcon}
						</span>
					)}
					<span className={styles['button__text']}>{children}</span>
					{rightIcon && (
						<span className={styles['button__icon-right']} aria-hidden="true">
							{rightIcon}
						</span>
					)}
				</>
			);
		}
	}
);

Button.displayName = 'Button';

export default Button;
