// Shared helper and error text for form controls.
//
// TextField and Select had an `error` boolean plus an `errorMessage` slot;
// Checkbox and Radio had the boolean and nowhere to say what was wrong, so a
// consumer had to render their own text and wire up aria-describedby by hand —
// and usually didn't. This is that markup, once, for all of them.
//
// The live region stays mounted whether or not there is an error: assistive
// tech announces changes *within* a region that already existed, and inserting
// the region and its text in the same commit is frequently missed entirely.

import type { ReactNode } from 'react';
import { mergeClasses } from '../utils/classNames';

/** How politely an error is announced when it appears. */
export type ErrorLiveRegion = 'polite' | 'assertive' | 'off';

export interface FieldMessageProps {
	/** Id for the helper text, referenced by the control's aria-describedby. */
	helperId: string;
	/** Id for the error text, referenced by the control's aria-describedby. */
	errorId: string;
	/** Whether the control is in an error state. */
	error?: boolean;
	/** What is wrong. Shown only while `error` is true. */
	errorMessage?: ReactNode;
	/** Guidance shown while there is no error. */
	helperText?: ReactNode;
	/** Announcement politeness. `'off'` renders the text without a live region. */
	errorLiveRegion?: ErrorLiveRegion;
	/** Class for the helper paragraph. */
	helperClassName?: string;
	/** Class for the error paragraph. */
	errorClassName?: string;
}

/**
 * Renders the helper and error text for a form control.
 *
 * Returns `null` when the control has neither, so a field that never uses them
 * costs nothing.
 */
export function FieldMessage({
	helperId,
	errorId,
	error,
	errorMessage,
	helperText,
	errorLiveRegion = 'polite',
	helperClassName,
	errorClassName,
}: FieldMessageProps) {
	const showError = Boolean(error && errorMessage);

	// Nothing to render, and nothing to keep mounted for announcements.
	if (!helperText && !errorMessage) return null;

	return (
		<>
			{helperText && !error ? (
				<p id={helperId} className={mergeClasses(helperClassName)}>
					{helperText}
				</p>
			) : null}

			{errorMessage ? (
				<p
					id={errorId}
					className={mergeClasses(errorClassName)}
					role={errorLiveRegion === 'off' ? undefined : 'status'}
					aria-live={errorLiveRegion === 'off' ? undefined : errorLiveRegion}
					hidden={!showError}
				>
					{showError ? errorMessage : null}
				</p>
			) : null}
		</>
	);
}

/**
 * Builds the `aria-describedby` value for a control, merging the ids this
 * component owns with whatever the caller supplied.
 */
export function describedBy(options: {
	helperId: string;
	errorId: string;
	helperText?: ReactNode;
	error?: boolean;
	errorMessage?: ReactNode;
	callerDescribedBy?: string;
}): string | undefined {
	const ids = [
		options.helperText && !options.error ? options.helperId : undefined,
		options.error && options.errorMessage ? options.errorId : undefined,
		options.callerDescribedBy,
	].filter(Boolean);

	return ids.length > 0 ? ids.join(' ') : undefined;
}
