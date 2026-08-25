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
	useState,
} from 'react';
import { createPortal } from 'react-dom';
import { Window, type WindowProps, type WindowClasses } from '../Window/Window';
import { initialFocusTarget, nextTrapTarget } from '../../core/focus';
import { mergeClasses } from '../../utils/classNames';
import styles from './Dialog.module.css';

/**
 * Elements that can hold focus.
 *
 * `initialFocus` was typed `RefObject<HTMLElement>`, which accepts a ref to
 * any element at all — a `<div>`, a `<span>` — including ones that cannot
 * take focus, so the mistake only showed up at runtime as focus silently
 * staying on the trigger.
 */
export type FocusableElement =
	| HTMLAnchorElement
	| HTMLButtonElement
	| HTMLInputElement
	| HTMLSelectElement
	| HTMLTextAreaElement
	| (HTMLElement & { tabIndex: number });

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
let savedBodyPaddingRight: string | null = null;

function lockBodyScroll(): void {
	if (typeof document === 'undefined') return;
	scrollLockCount += 1;
	if (scrollLockCount !== 1) return;

	const body = document.body;
	savedBodyOverflow = body.style.overflow;
	savedBodyPaddingRight = body.style.paddingRight;

	// Hiding overflow removes the scrollbar, and on platforms where the
	// scrollbar takes up layout space the page underneath jumps sideways by
	// its width the instant a dialog opens. Replacing that width with padding
	// keeps the layout still.
	const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
	if (scrollbarWidth > 0) {
		const currentPadding = parseFloat(window.getComputedStyle(body).paddingRight) || 0;
		body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
	}

	body.style.overflow = 'hidden';
}

function unlockBodyScroll(): void {
	if (typeof document === 'undefined') return;
	scrollLockCount = Math.max(0, scrollLockCount - 1);
	if (scrollLockCount !== 0) return;

	document.body.style.overflow = savedBodyOverflow ?? '';
	document.body.style.paddingRight = savedBodyPaddingRight ?? '';
	savedBodyOverflow = null;
	savedBodyPaddingRight = null;
}

function isTopmost(el: HTMLElement | null): boolean {
	return el !== null && dialogStack[dialogStack.length - 1] === el;
}

// --- Props -----------------------------------------------------------------

/**
 * Classes for targeting Dialog sub-elements.
 *
 * Extends {@link WindowClasses}, because a Dialog renders a Window: the
 * `root`, `titleBar`, `content` and other Window slots are reachable from
 * here too, and are forwarded on.
 */
export interface DialogClasses extends WindowClasses {
	/** The full-screen backdrop behind the dialog. */
	backdrop?: string;
	/** The container carrying role="dialog" and aria-modal. */
	container?: string;
}

export interface DialogProps extends Omit<WindowProps, 'active' | 'classes'> {
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
	 * Classes for targeting sub-elements, including the Window slots the
	 * dialog renders inside.
	 */
	classes?: DialogClasses;

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
	initialFocus?: string | React.RefObject<FocusableElement | null>;

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
	'aria-label'?: string;

	/**
	 * ID of a visible element that labels the dialog. Takes precedence over
	 * `aria-label` if both are provided.
	 */
	'aria-labelledby'?: string;

	/**
	 * ID of a visible element that describes the dialog body.
	 */
	'aria-describedby'?: string;

	/**
	 * Where the dialog is portalled to.
	 *
	 * Defaults to `document.body`. A modal rendered inline sits inside
	 * whatever stacking contexts its ancestors created — a parent with
	 * `transform`, `filter`, `opacity` below 1, or its own `z-index` traps
	 * the backdrop underneath sibling content no matter how high the
	 * dialog's own z-index is. Portalling to the body escapes all of them.
	 *
	 * Pass an element to portal somewhere else, or `null` to render inline
	 * (useful inside a Storybook docs block, or when the host page already
	 * provides a modal root).
	 */
	container?: HTMLElement | null;
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
			classes,
			trapFocus = true,
			initialFocus,
			role = 'dialog',
			'aria-label': label,
			'aria-labelledby': labelledBy,
			'aria-describedby': describedBy,
			container,
			children,
			...windowProps
		},
		ref
	) => {
		const dialogRef = useRef<HTMLDivElement>(null);
		const previousActiveElement = useRef<HTMLElement | null>(null);

		// Resolved after mount: `document` does not exist during a server
		// render, and touching it in the render body would break SSR.
		const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
		useEffect(() => {
			if (container === null) return;
			setPortalTarget(container ?? document.body);
		}, [container]);

		// Derive an accessible name. Prefer an explicit labelledby → label
		// → the Window title if it happens to be a plain string.
		const titleProp = (windowProps as { title?: React.ReactNode }).title;
		const resolvedAriaLabel = label ?? (typeof titleProp === 'string' ? titleProp : undefined);

		// Remember who had focus BEFORE anything in this dialog takes it.
		//
		// This has to be a layout effect, and it has to be declared above the
		// initial-focus effect below: React runs all layout effects before any
		// passive effect, and runs them in declaration order. Capturing this in
		// a passive effect meant initialFocus had already moved focus into the
		// dialog, so what got saved was the dialog's own button — detached by
		// the time restore ran, so `isConnected` was false and focus silently
		// fell to <body>.
		useLayoutEffect(() => {
			if (!open) return;
			previousActiveElement.current =
				document.activeElement instanceof HTMLElement ? document.activeElement : null;
		}, [open]);

		// Push/pop the dialog onto the stack and lock body scroll while open.
		// Combining these into one effect ensures they unwind in the right
		// order on close and avoids races with the other effects below.
		useEffect(() => {
			if (!open) return;
			const node = dialogRef.current;
			if (!node) return;

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
			// portalTarget is a dependency because the dialog element does not
			// exist until the portal has a mount point — on the first render
			// after `open` flips, dialogRef.current is still null.
		}, [open, portalTarget]);

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
				// Shared with the framework-free focusTrap: first focusable,
				// then the container itself so the trap has somewhere to land.
				target = initialFocusTarget(root);
				// The container is only focusable if we make it so.
				if (target === root && !root.hasAttribute('tabindex')) {
					root.setAttribute('tabindex', '-1');
				}
			}

			target?.focus();
		}, [open, initialFocus, portalTarget]);

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

				// Shared with the framework-free focusTrap. It returns null when
				// the browser's own Tab behaviour is already right, which is why
				// preventDefault is conditional: doing it on every Tab would
				// fight the browser and break a trap holding one element.
				const target = nextTrapTarget(dialogRef.current, document.activeElement, event.shiftKey);
				if (!target) return;
				event.preventDefault();
				target.focus();
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
			[closeOnBackdropClick, onClose]
		);

		if (!open) return null;

		// Dialog owns backdrop and container; everything else belongs to Window.
		// `DialogClasses` extends `WindowClasses`, so the one `classes` prop
		// covers both halves.
		const { backdrop, container: containerClass, ...windowClasses } = classes ?? {};

		const backdropClassNames = mergeClasses(styles.backdrop, backdrop);

		const dialogTree = (
			<div className={backdropClassNames} onClick={handleBackdropClick}>
				<div
					className={mergeClasses(styles.dialogContainer, containerClass)}
					ref={dialogRef}
					role={role}
					aria-modal="true"
					aria-label={labelledBy ? undefined : resolvedAriaLabel}
					aria-labelledby={labelledBy}
					aria-describedby={describedBy}
				>
					<Window
						{...windowProps}
						classes={windowClasses}
						ref={ref}
						active={true}
						onClose={onClose}
					>
						{children}
					</Window>
				</div>
			</div>
		);

		// `container === null` opts out of portalling entirely.
		if (container === null) return dialogTree;

		// Before the mount effect resolves a target there is nothing to portal
		// into; rendering null for that first pass keeps SSR output empty and
		// matches what the client produces on hydration.
		return portalTarget ? createPortal(dialogTree, portalTarget) : null;
	}
);

Dialog.displayName = 'Dialog';

export default Dialog;
