// Utility for merging CSS class names
// Filters out falsy values and joins valid class names with spaces

/**
 * A value that may be passed to {@link mergeClasses}.
 *
 * Numbers and booleans are accepted because conditional expressions
 * naturally produce them — `count && styles.badge` is `0` when `count` is
 * zero, and `flag && styles.on` is `false` when the flag is off. Only
 * non-empty strings survive into the output.
 */
export type ClassValue = string | number | boolean | null | undefined;

/**
 * Merges multiple class names into a single string.
 *
 * Keeps only non-empty strings. A plain `.filter(Boolean)` would keep a
 * truthy number too, so `mergeClasses(styles.row, itemCount)` would have
 * emitted `class="row 5"`; here the number is dropped.
 *
 * @param classes - Class names to merge
 * @returns Merged class name string
 *
 * @example
 * ```ts
 * mergeClasses('base', isActive && 'active', undefined, 'custom')
 * // Returns: "base active custom"
 * ```
 */
export const mergeClasses = (...classes: ClassValue[]): string => {
	return classes
		.filter((value): value is string => typeof value === 'string' && value !== '')
		.join(' ');
};

/**
 * Creates a class name builder function with a base class
 * Useful for component-level class management
 *
 * @param baseClass - Base class name
 * @returns Function that merges additional classes with base
 *
 * @example
 * ```ts
 * const cn = createClassBuilder('button');
 * cn('primary', isDisabled && 'disabled')
 * // Returns: "button primary disabled"
 * ```
 */
export const createClassBuilder = (baseClass: string) => {
	return (...additionalClasses: ClassValue[]) => {
		return mergeClasses(baseClass, ...additionalClasses);
	};
};
