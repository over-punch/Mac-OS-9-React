// Index arithmetic for keyboard navigation. No framework, no DOM.
//
// Every list control in the library steps an index and wraps at the ends, and
// several of them also have to skip entries that cannot be landed on —
// separators and disabled items. Written by hand each time, that is where the
// off-by-one lives.

/**
 * Bring `index` into `[0, length)`, wrapping at both ends.
 *
 * Returns 0 for an empty list rather than NaN, so a caller stepping through
 * nothing gets a harmless answer instead of a broken one.
 */
export function wrap(index: number, length: number): number {
	if (length <= 0) return 0;
	return ((index % length) + length) % length;
}

/**
 * Step from `current` by `delta`, moving only between the indices in
 * `enabled` and wrapping around the ends of that subset.
 *
 * `current` need not itself be enabled — a menu can open with the highlight on
 * an item that later becomes disabled, and the next arrow press still has to
 * go somewhere sensible. When it is not in the set, the step is measured from
 * the nearest enabled entry at or after it.
 *
 * @param current - The index the caller is on now
 * @param delta - How far to move, usually 1 or -1
 * @param enabled - Indices that can be landed on, in ascending order
 * @returns The next index, or `current` when nothing is selectable
 */
export function stepThrough(current: number, delta: number, enabled: number[]): number {
	if (enabled.length === 0) return current;

	let position = enabled.indexOf(current);
	if (position === -1) {
		// Not on an enabled entry. Anchor to the next one along so that a
		// forward step lands on it rather than skipping past.
		const after = enabled.findIndex((index) => index >= current);
		position = after === -1 ? enabled.length - 1 : after;
		// Stepping forward from an anchor that is already ahead of us would
		// skip an item, so the first move only closes the gap.
		if (delta > 0 && (enabled[position] as number) > current) delta -= 1;
	}

	return enabled[wrap(position + delta, enabled.length)] as number;
}
