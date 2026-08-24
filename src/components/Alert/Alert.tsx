// Alert component - Mac OS 9 style
//
// Mac OS 9 alerts had a fixed anatomy, and it was fixed for a reason: the
// icon told you the severity before you read anything, and the buttons were
// always bottom-right with the default one rightmost, so your hand knew where
// to go. Dialog gives you a modal; it does not give you that arrangement.
//
// This is a thin compound over Dialog rather than a parallel implementation —
// the focus trap, scroll lock, Escape handling and focus restore all come from
// there unchanged.

import React, { forwardRef } from 'react';
import { Dialog, type DialogProps } from '../Dialog';
import { Button } from '../Button';
import { ErrorIcon, AlertIcon, InfoIcon, QuestionIcon, type PixelIconProps } from '../Icon';
import { mergeClasses } from '../../utils/classNames';
import styles from './Alert.module.css';

/** The four severities Mac OS 9 shipped, each with its own icon. */
export type AlertSeverity = 'stop' | 'caution' | 'note' | 'question';

/**
 * Classes for targeting Alert sub-elements.
 */
export interface AlertClasses {
	/** The dialog root. */
	root?: string;
	/** Row holding the icon and the message. */
	body?: string;
	/** The severity icon. */
	icon?: string;
	/** The message column. */
	message?: string;
	/** The bold first line. */
	heading?: string;
	/** The action row. */
	actions?: string;
}

export interface AlertProps
	extends Omit<DialogProps, 'children' | 'classes' | 'title' | 'width'> {
	/**
	 * Which icon is shown, and what the alert is claiming.
	 *
	 * `stop` means the action cannot proceed. `caution` means it can, but
	 * something will be lost. `note` is informational. `question` asks.
	 * @default 'caution'
	 */
	severity?: AlertSeverity;

	/**
	 * The one-line summary, set bold. Mac OS 9 put the question here and the
	 * detail beneath — "Are you sure you want to erase the disk?" then the
	 * consequences.
	 */
	heading: React.ReactNode;

	/**
	 * Supporting detail beneath the heading.
	 */
	message?: React.ReactNode;

	/**
	 * Label for the confirming button, which sits rightmost and is focused
	 * when the alert opens.
	 * @default 'OK'
	 */
	confirmLabel?: string;

	/**
	 * Label for the dismissing button. Omit it for a one-button alert — a
	 * note that only needs acknowledging does not need a Cancel.
	 */
	cancelLabel?: string;

	/**
	 * Called when the confirming button is pressed.
	 */
	onConfirm?: () => void;

	/**
	 * Marks the confirming action as destructive, which colours it as such.
	 * @default false
	 */
	destructive?: boolean;

	/**
	 * Dialog width.
	 * @default 340
	 */
	width?: number;

	/**
	 * Classes for targeting sub-elements.
	 */
	classes?: AlertClasses;
}

/** Severity to the icon that has always been in the registry for it. */
// `stop` maps to ErrorIcon, not StopIcon: StopIcon is the media transport
// control — a filled square — while ErrorIcon is the circular stop-alert glyph
// Mac OS 9 actually showed, and matches the other three in the set.
const ICONS: Record<AlertSeverity, React.FC<PixelIconProps>> = {
	stop: ErrorIcon,
	caution: AlertIcon,
	note: InfoIcon,
	question: QuestionIcon,
};

/**
 * Mac OS 9 style alert.
 *
 * @example
 * ```tsx
 * <Alert
 *   open={open}
 *   severity="caution"
 *   heading="Are you sure you want to erase “Macintosh HD”?"
 *   message="This cannot be undone."
 *   confirmLabel="Erase"
 *   cancelLabel="Cancel"
 *   destructive
 *   onConfirm={erase}
 *   onClose={() => setOpen(false)}
 * />
 * ```
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(
	(
		{
			severity = 'caution',
			heading,
			message,
			confirmLabel = 'OK',
			cancelLabel,
			onConfirm,
			destructive = false,
			width = 340,
			className = '',
			classes,
			onClose,
			...dialogProps
		},
		ref
	) => {
		const generatedId = React.useId();
		const headingId = `${generatedId}-heading`;
		const messageId = `${generatedId}-message`;

		const SeverityIcon = ICONS[severity];

		const handleConfirm = () => {
			onConfirm?.();
			onClose?.();
		};

		return (
			<Dialog
				ref={ref}
				role="alertdialog"
				onClose={onClose}
				width={width}
				title=""
				aria-labelledby={headingId}
				aria-describedby={message ? messageId : undefined}
				// The confirming button is what Mac OS 9 focused, so Return
				// commits and Escape cancels without moving your hands.
				initialFocus="[data-alert-confirm]"
				className={mergeClasses(styles.alert, className, classes?.root)}
				{...dialogProps}
			>
				<div className={mergeClasses(styles.body, classes?.body)}>
					<span className={mergeClasses(styles.icon, classes?.icon)} aria-hidden="true">
						<SeverityIcon size="xl" label={null} />
					</span>

					<div className={mergeClasses(styles.message, classes?.message)}>
						<p id={headingId} className={mergeClasses(styles.heading, classes?.heading)}>
							{heading}
						</p>
						{message && (
							<p id={messageId} className={styles.detail}>
								{message}
							</p>
						)}
					</div>
				</div>

				{/* Bottom-right, default rightmost — the arrangement is the
				    point of the component. */}
				<div className={mergeClasses(styles.actions, classes?.actions)}>
					{cancelLabel && <Button onClick={onClose}>{cancelLabel}</Button>}
					<Button
						variant={destructive ? 'danger' : 'primary'}
						onClick={handleConfirm}
						data-alert-confirm=""
					>
						{confirmLabel}
					</Button>
				</div>
			</Dialog>
		);
	}
);

Alert.displayName = 'Alert';

export default Alert;
