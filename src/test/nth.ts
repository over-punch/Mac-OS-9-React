// Test helper: index into a query result with a real check.
//
// `screen.getAllByRole(...)[0]` is `HTMLElement | undefined` under
// noUncheckedIndexedAccess. Asserting through the undefined would pass
// vacuously, so this throws with a useful message instead.

export function nth<T>(items: readonly T[], index: number): T {
	const item = items[index];
	if (item === undefined) {
		throw new Error(`Expected an element at index ${index}, but only got ${items.length}`);
	}
	return item;
}
