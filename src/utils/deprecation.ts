// Development-only deprecation warnings.
//
// The 1.0 API renames several props (camelCase ARIA → hyphenated, onChange →
// onValueChange, errorMessage → error, and so on). The old names still work
// for one major version, but silently accepting them would leave consumers
// unaware they are on a removal path — so each use warns once in development
// and costs nothing in production.

/** Names already warned about, so a re-rendering component warns only once. */
const warned = new Set<string>();

/**
 * Warn that `oldName` is deprecated in favour of `newName`.
 *
 * No-ops in production builds and after the first warning for a given pair.
 *
 * @param component - Component the prop belongs to, e.g. 'Button'
 * @param oldName - The deprecated prop name
 * @param newName - The replacement prop name
 */
export function warnDeprecatedProp(component: string, oldName: string, newName: string): void {
	if (process.env.NODE_ENV === 'production') return;

	const key = `${component}.${oldName}`;
	if (warned.has(key)) return;
	warned.add(key);

	console.warn(
		`[mac-os9-ui] ${component}: \`${oldName}\` is deprecated and will be removed in 2.0. ` +
			`Use \`${newName}\` instead.`
	);
}

/**
 * Warn about a missing prop that the component needs to behave correctly.
 *
 * Used where a silently-wrong default is worse than a loud complaint, e.g.
 * an icon-only button with no accessible name (issue #123) or a Scrollbar
 * with no real viewport ratio (issue #122).
 *
 * @param component - Component reporting the problem
 * @param message - What is wrong and how to fix it
 */
export function warnMissingProp(component: string, message: string): void {
	if (process.env.NODE_ENV === 'production') return;

	const key = `${component}:${message}`;
	if (warned.has(key)) return;
	warned.add(key);

	console.warn(`[mac-os9-ui] ${component}: ${message}`);
}

/** Reset warning state. Test-only. */
export function resetDeprecationWarnings(): void {
	warned.clear();
}
