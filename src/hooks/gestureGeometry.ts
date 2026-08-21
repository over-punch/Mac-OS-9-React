// Geometry helpers shared by the drag and resize hooks.
//
// The original drag maths read `offsetParent` and called
// `getBoundingClientRect()` on it during every pointermove. That forced a
// synchronous layout each frame (issue #23) and produced wrong coordinates
// whenever an ancestor used `transform`, `filter`, `perspective`,
// `will-change` or `contain: paint` — all of which establish the containing
// block for `position: absolute` but are skipped by `offsetParent`, which
// also returns `null` inside a `position: fixed` chain (issue #22).
//
// Both problems go away by measuring once at gesture start and then working
// in pure pointer deltas: a delta in client coordinates is the same delta in
// any untransformed coordinate system, so the containing block never has to
// be identified again mid-gesture.

/** Bounds of the coordinate system a dragged element is positioned within. */
export interface ContainingBlock {
	/** Width of the containing block's content box, in CSS pixels. */
	width: number;
	/** Height of the containing block's content box, in CSS pixels. */
	height: number;
	/**
	 * Scale factor applied by ancestor transforms. Pointer deltas are in
	 * untransformed client pixels, so they are divided by this to get the
	 * element's own local pixels. `1` when no scaling is in play.
	 */
	scale: number;
}

/**
 * Measure the containing block of `element` once, at gesture start.
 *
 * Falls back to the viewport when there is no positioned ancestor, which is
 * what a `position: fixed` element is actually laid out against.
 */
export function measureContainingBlock(element: HTMLElement): ContainingBlock {
	const offsetParent = element.offsetParent as HTMLElement | null;

	// A scaling ancestor makes the rendered size differ from the layout size.
	// The ratio recovers the scale without having to parse transform matrices.
	const rect = element.getBoundingClientRect();
	const scale = element.offsetWidth > 0 ? rect.width / element.offsetWidth : 1;

	if (offsetParent) {
		return {
			width: offsetParent.clientWidth,
			height: offsetParent.clientHeight,
			// Guard against a degenerate 0 scale (element hidden mid-measure).
			scale: scale > 0 ? scale : 1,
		};
	}

	const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : Number.MAX_SAFE_INTEGER;
	const viewportHeight =
		typeof window !== 'undefined' ? window.innerHeight : Number.MAX_SAFE_INTEGER;

	return {
		width: viewportWidth,
		height: viewportHeight,
		scale: scale > 0 ? scale : 1,
	};
}

/**
 * The element's current offset within its containing block, in local pixels.
 *
 * Uses `offsetLeft`/`offsetTop`, which are already expressed in the
 * containing block's coordinate system, so this needs no rect arithmetic and
 * stays correct under transforms.
 */
export function measureOffset(element: HTMLElement): { x: number; y: number } {
	return { x: element.offsetLeft, y: element.offsetTop };
}

/** Clamp `value` into `[min, max]`, tolerating an inverted range. */
export function clamp(value: number, min: number, max: number): number {
	if (max < min) return min;
	return Math.min(max, Math.max(min, value));
}
