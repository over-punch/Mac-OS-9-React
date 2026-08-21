// Resolving the standard aria-* props against their deprecated camelCase aliases.
//
// The library originally exposed `ariaLabel`, `ariaLabelledBy`,
// `ariaDescribedBy` and `ariaPressed` instead of the attributes React already
// understands. That meant consumers had to learn a second spelling for
// something standard, and a component spreading `...props` could receive both
// forms with no defined precedence.
//
// Every component now accepts the standard attribute. The camelCase names
// still work — they were public API — but they warn once in development and
// lose to the standard form when both are given.

import { warnDeprecatedProp } from './deprecation';

/**
 * Picks between a standard `aria-*` prop and its deprecated camelCase alias.
 *
 * @param component - Component name, for the warning
 * @param standardName - e.g. `'aria-label'`
 * @param legacyName - e.g. `'ariaLabel'`
 * @param standard - Value of the standard prop
 * @param legacy - Value of the deprecated prop
 * @returns The standard value when present, otherwise the legacy one
 */
export function resolveAria<T>(
	component: string,
	standardName: string,
	legacyName: string,
	standard: T | undefined,
	legacy: T | undefined
): T | undefined {
	if (legacy !== undefined) {
		warnDeprecatedProp(component, legacyName, standardName);
	}
	return standard ?? legacy;
}

/**
 * The camelCase ARIA aliases, kept for backwards compatibility.
 *
 * Components spread this into their props interface so the deprecation is
 * declared in one place rather than restated per component.
 *
 * @deprecated Use the standard `aria-label`, `aria-labelledby`,
 * `aria-describedby` and `aria-pressed` attributes instead.
 */
export interface LegacyAriaProps {
	/** @deprecated Use `aria-label`. */
	ariaLabel?: string;
	/** @deprecated Use `aria-labelledby`. */
	ariaLabelledBy?: string;
	/** @deprecated Use `aria-describedby`. */
	ariaDescribedBy?: string;
	/** @deprecated Use `aria-pressed`. */
	ariaPressed?: boolean;
}
