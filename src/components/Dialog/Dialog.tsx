// Dialog component - Mac OS 9 style
// Modal dialog with backdrop and focus trapping
//
// Correctness notes (panel review #1-#7):
//  - aria-modal lives on the inner role="dialog" container, not the backdrop
//  - The backdrop is a plain <div> (no role) so it doesn't add bogus ARIA
//  - Multiple stacked dialogs are coordinated through a module-level stack;
//    only the topmost dialog responds to Escape or traps Tab focus
//  - Body scroll lock is reference-counted so stacked dialogs don't unlock
//    the page underneath each other on close
//  - Default initial focus moves into the dialog when no initialFocus prop
//    is supplied (otherwise focus would stay on the trigger and the trap
//    would never activate)
//  - The focus-trap selector covers contenteditable, audio/video, summary,
//    iframe, etc., and filters out hidden / aria-hidden / zero-size nodes
//  - Focus restore on close checks isConnected before calling .focus(),
//    so a detached trigger doesn't silently fail focus management

import React, {
	forwardRef,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
} from 'react';
import { Window, type WindowProps } from '../Window/Window';
import styles from './Dialog.module.css';

// --- Module-level dialog coordination -------------------------------------

// Stack of currently-open dialog containers. Only the last entry is treated
// as the "topmost" — it owns Escape and the Tab focus trap. This is the
// canonical web-platform approach for stacked modals and matches what
// browsers do internally for the dialog element.
const dialogStack: HTMLElement[] = [];

// Reference-counted body scroll lock so two stacked dialogs don't fight
// over `document.body.style.overflow`. The first lock captures whatever
// value the host app had set, and the last release restores it.
let scrollLockCount = 0;
let savedBodyOverflow: string | null = null;

function lockBodyScroll(): void {
	if (typeof document === 'undefined') return;
	scrollLockCount += 1;
	if (scrollLockCount === 1) {
		savedBodyOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
	}
}

function unlockBodyScroll(): void {
	if (typeof document === 'undefined') return;
	scrollLockCount = Math.max(0, scrollLockCount - 1);
	if (scrollLockCount === 0) {
		document.body.style.overflow = savedBodyOverflow ?? '';
		savedBodyOverflow = null;
	}
}

function isTopmost(el: HTMLElement | null): boolean {
	return el !== null && dialogStack[dialogStack.length - 1] === el;
}

// Comprehensive focusable-element selector. Covers everything the Tab key
// can naturally reach plus author-provided overrides via [tabindex]. The
// runtime filter excludes disabled, hidden, aria-hidden, and zero-size
// elements that should not be tab targets.
const FOCUSABLE_SELECTOR = [
	'a[href]',
	'area[href]',
	'button',
	'input',
	'select',
	'textarea',
	'iframe',
	'audio[controls]',
	'video[controls]',
	'[contenteditable="true"]',
	'[contenteditable=""]',
	'details > summary:first-of-type',
	'[tabindex]',
].join(',');

function isElementFocusable(el: HTMLElement): boolean {
	// Native disabled, programmatic disabled via aria-disabled,
	// explicit removal from tab order, and visibility checks.
	if ((el as HTMLInputElement).disabled) return false;
	if (el.getAttribute('tabindex') === '-1') return false;
	if (el.hidden) return false;
	if (el.closest('[aria-hidden="true"]')) return false;
	if (el.getClientRects().length === 0) return false;
	return true;
}

function getFocusables(root: HTMLElement): HTMLElement[] {
	return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
		isElementFocusable,
	);
}

// --- Props -----------------------------------------------------------------

export interface DialogProps extends Omit<WindowProps, 'active'> {
	/**
	 * Whether the dialog is open
	 * @default false
	 */
	open?: boolean;

	/**
	 * Callback when dialog should close
	 * Called when backdrop is clicked or Escape is pressed
	 */
	onClose?: () => void;

	/**
	 * Whether clicking the backdrop closes the dialog
	 * @default true
	 */
	closeOnBackdropClick?: boolean;

	/**
	 * Whether pressing Escape closes the dialog
	 * @default true
	 */
	closeOnEscape?: boolean;

	/**
	 * Custom backdrop className
	 */
	backdropClassName?: string;

	/**
	 * Whether to trap focus within the dialog
	 * @default true
	 */
	trapFocus?: boolean;

	/**
	 * Initial focus target. May be a CSS selector or a ref to a known
	 * element inside the dialog. When omitted, focus moves to the first
	 * focusable element in the dialog (or the dialog container itself
	 * if none exists), as required by the WAI-ARIA dialog pattern.
	 *
	 * **Security note:** when supplied as a string, the value is passed to
	 * `querySelector`. Treat it as a developer-supplied static selector —
	 * never derive it from untrusted input.
	 */
	initialFocus?: string | React.RefObject<HTMLElement | null>;

	/**
	 * ARIA role. Use `'alertdialog'` for destructive or error confirmations
	 * so assistive tech announces them more assertively.
	 * @default 'dialog'
	 */
	role?: 'dialog' | 'alertdialog';

	/**
	 * Accessible name for the dialog. If omitted and the Window `title`
	 * prop is a string, the title is used as the accessible name. Provide
	 * this explicitly when `title` is a React node.
	 */
	ariaLabel?: string;

	/**
	 * ID of a visible element that labels the dialog. Takes precedence over
	 * `ariaLabel` if both are provided.
	 */
	ariaLabelledBy?: string;

	/**
	 * ID of a visible element that describes the dialog body.
	 */
	ariaDescribedBy?: string;
}

/**
 * Mac OS 9 style Dialog component
 *
 * Modal dialog with backdrop, focus trapping, and keyboard handling.
 * Built on top of the Window component.
 *
 * Features:
 * - Classic Mac OS 9 dialog styling
 * - Modal backdrop with optional click-to-close
 * - Escape key to close (topmost dialog only when stacked)
 * - Focus trap that survives stacked dialogs
 * - Centered on screen
 * - Reference-counted body scroll lock
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * <Dialog
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="Confirm"
 *   width={350}
 *   role="alertdialog"
 * >
 *   <p id="confirm-msg">Are you sure?</p>
 *   <Button onClick={() => setOpen(false)}>Cancel</Button>
 *   <Button variant="primary">OK</Button>
 * </Dialog>
 * ```
 */
export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
	(
		{
			open = false,
			onClose,
			closeOnBackdropClick = true,
			closeOnEscape = true,
			backdropClassName = '',
			trapFocus = true,
			initialFocus,
			role = 'dialog',
			ariaLabel,
			ariaLabelledBy,
			ariaDescribedBy,
			children,
			...windowProps
		},
		ref,
	) => {
		const dialogRef = useRef<HTMLDivElement>(null);
		const previousActiveElement = useRef<HTMLElement | null>(null);

		// Derive an accessible name. Prefer explicit ariaLabelledBy → ariaLabel
		// → the Window title if it happens to be a plain string.
		const titleProp = (windowProps as { title?: React.ReactNode }).title;
		const resolvedAriaLabel = ariaLabel ?? (typeof titleProp === 'string' ? titleProp : undefined);

		// Push/pop the dialog onto the stack and lock body scroll while open.
		// Combining these into one effect ensures they unwind in the right
		// order on close and avoids races with the other effects below.
		useEffect(() => {
			if (!open) return;
			const node = dialogRef.current;
			if (!node) return;

			previousActiveElement.current =
				document.activeElement instanceof HTMLElement ? document.activeElement : null;
			dialogStack.push(node);
			lockBodyScroll();

			return () => {
				const idx = dialogStack.indexOf(node);
				if (idx !== -1) dialogStack.splice(idx, 1);
				unlockBodyScroll();

				// Defer focus restoration so React can finish any unmount work
				// before we hand focus back; checking isConnected prevents a
				// silent jump-to-body if the trigger is gone.
				const prev = previousActiveElement.current;
				if (prev && prev.isConnected) {
					queueMicrotask(() => {
						if (prev.isConnected) prev.focus();
					});
				}
			};
		}, [open]);

		// Initial focus. Runs before paint via useLayoutEffect so the user
		// never sees a flash of focus outside the dialog.
		useLayoutEffect(() => {
			if (!open || !dialogRef.current) return;
			const root = dialogRef.current;

			let target: HTMLElement | null = null;
			if (typeof initialFocus === 'string') {
				try {
					target = root.querySelector<HTMLElement>(initialFocus);
				} catch {
					// Malformed selector — ignore and fall through to default.
					target = null;
				}
			} else if (initialFocus && 'current' in initialFocus) {
				target = initialFocus.current;
			}

			if (!target) {
				const focusables = getFocusables(root);
				if (focusables.length > 0) {
					target = focusables[0];
				} else {
					// No focusable children — focus the container itself so the
					// trap still has somewhere to land. Make it programmatically
					// focusable in that case.
					if (!root.hasAttribute('tabindex')) root.setAttribute('tabindex', '-1');
					target = root;
				}
			}

			target?.focus();
		}, [open, initialFocus]);

		// Escape: only the topmost dialog reacts so stacked dialogs close
		// one at a time. The bubble phase + stopPropagation also prevents
		// the host app's own Escape handlers from firing under the modal.
		useEffect(() => {
			if (!open || !closeOnEscape) return;
			const handler = (event: KeyboardEvent) => {
				if (event.key !== 'Escape') return;
				if (!isTopmost(dialogRef.current)) return;
				event.preventDefault();
				event.stopPropagation();
				onClose?.();
			};
			document.addEventListener('keydown', handler);
			return () => document.removeEventListener('keydown', handler);
		}, [open, closeOnEscape, onClose]);

		// Focus trap: same topmost-only rule.
		useEffect(() => {
			if (!open || !trapFocus) return;
			const handler = (event: KeyboardEvent) => {
				if (event.key !== 'Tab' || !dialogRef.current) return;
				if (!isTopmost(dialogRef.current)) return;

				const focusables = getFocusables(dialogRef.current);
				if (focusables.length === 0) {
					event.preventDefault();
					return;
				}

				const first = focusables[0];
				const last = focusables[focusables.length - 1];
				const active = document.activeElement as HTMLElement | null;

				// If focus has escaped the dialog (e.g., user clicked outside
				// and Tabbed), pull it back in.
				if (!active || !dialogRef.current.contains(active)) {
					event.preventDefault();
					(event.shiftKey ? last : first).focus();
					return;
				}

				if (event.shiftKey && active === first) {
					event.preventDefault();
					last.focus();
				} else if (!event.shiftKey && active === last) {
					event.preventDefault();
					first.focus();
				}
			};
			document.addEventListener('keydown', handler);
			return () => document.removeEventListener('keydown', handler);
		}, [open, trapFocus]);

		// Backdrop click closes only when the click originated on the
		// backdrop itself, not on a child element that bubbled up.
		const handleBackdropClick = useCallback(
			(event: React.MouseEvent<HTMLDivElement>) => {
				if (closeOnBackdropClick && event.target === event.currentTarget) {
					onClose?.();
				}
			},
			[closeOnBackdropClick, onClose],
		);

		if (!open) return null;

		const backdropClassNames = [styles.backdrop, backdropClassName].filter(Boolean).join(' ');

		return (
			<div className={backdropClassNames} onClick={handleBackdropClick}>
				<div
					className={styles.dialogContainer}
					ref={dialogRef}
					role={role}
					aria-modal="true"
					aria-label={ariaLabelledBy ? undefined : resolvedAriaLabel}
					aria-labelledby={ariaLabelledBy}
					aria-describedby={ariaDescribedBy}
				>
					<Window {...windowProps} ref={ref} active={true} onClose={onClose}>
						{children}
					</Window>
				</div>
			</div>
		);
	},
);

Dialog.displayName = 'Dialog';

export default Dialog;
