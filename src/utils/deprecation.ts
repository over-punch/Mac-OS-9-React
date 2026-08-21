// Development-only deprecation warnings.
//
// A renamed prop keeps working for one major version before it is removed, so
// consumers get a migration window rather than a build break. Silently
// accepting the old name would leave them unaware they are on a removal path,
// so each use warns once in development and costs nothing in production.
//
// 2.0 removed everything 1.0 deprecated. What remains here is the mechanism,
// plus `warnMissingProp`, which is not about renames at all.

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
 * @param removedIn - Major version that removes it. Defaults to the next one.
 */
export function warnDeprecatedProp(
	component: string,
	oldName: string,
	newName: string,
	removedIn = '3.0'
): void {
	if (process.env.NODE_ENV === 'production') return;

	const key = `${component}.${oldName}`;
	if (warned.has(key)) return;
	warned.add(key);

	console.warn(
		`[mac-os9-ui] ${component}: \`${oldName}\` is deprecated and will be removed in ${removedIn}. ` +
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
