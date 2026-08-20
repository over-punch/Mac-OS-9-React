// Pixel-map icon factory - Mac OS 9 React UI
//
// Mac OS 9 icons were hand-placed pixels, not curves. Describing them as
// character maps keeps that literal — each icon reads as a picture in the
// source — and produces crisp <rect> output that never smooths at small
// sizes the way a traced path does.

import React from 'react';
import { Icon } from './Icon';

/**
 * One row of an icon per string, one character per pixel.
 *
 * Recognised characters:
 *
 * - `#` — the icon's own colour (`currentColor`, so it inherits text colour)
 * - `o` — highlight, the light edge of a Mac OS 9 bevel
 * - `x` — shade, the dark edge of a bevel
 * - `.` or a space — transparent
 */
export type PixelMap = readonly string[];

/** Character → fill. Anything not listed here is left transparent. */
const PIXEL_FILLS: Readonly<Record<string, string>> = {
	'#': 'currentColor',
	o: 'var(--color-gray-100)',
	x: 'var(--color-gray-550)',
};

/**
 * Expands a pixel map into `<rect>` elements.
 *
 * Horizontally adjacent pixels of the same colour are merged into a single
 * wider rect. A 16×16 icon is 256 potential nodes; run-length merging
 * typically cuts that by three quarters, which matters when a list view
 * renders one icon per row.
 */
function pixelsToRects(map: PixelMap): React.ReactElement[] {
	const rects: React.ReactElement[] = [];

	map.forEach((row, y) => {
		let runStart = -1;
		let runFill: string | undefined;

		const flush = (endX: number) => {
			if (runStart === -1 || !runFill) return;
			rects.push(
				<rect
					key={`${runStart}-${y}`}
					x={runStart}
					y={y}
					width={endX - runStart}
					height={1}
					fill={runFill}
				/>
			);
			runStart = -1;
			runFill = undefined;
		};

		for (let x = 0; x < row.length; x += 1) {
			const fill = PIXEL_FILLS[row[x] ?? '.'];
			if (fill !== runFill) {
				flush(x);
				if (fill) {
					runStart = x;
					runFill = fill;
				}
			}
		}
		flush(row.length);
	});

	return rects;
}

/**
 * Builds an icon component from a pixel map.
 *
 * @param displayName - React display name, e.g. `FolderIcon`
 * @param label - Default accessible name
 * @param map - The pixel map, one string per row
 * @param gridSize - Width/height of the square pixel grid
 */
export function createPixelIcon(
	displayName: string,
	label: string,
	map: PixelMap,
	gridSize: number = 16
): React.FC<PixelIconProps> {
	const rects = pixelsToRects(map);

	const Component: React.FC<PixelIconProps> = ({ label: labelOverride, ...props }) => (
		<Icon
			viewBox={`0 0 ${gridSize} ${gridSize}`}
			shapeRendering="crispEdges"
			label={labelOverride === null ? undefined : (labelOverride ?? label)}
			{...props}
		>
			{rects}
		</Icon>
	);

	Component.displayName = displayName;
	return Component;
}

/**
 * Props accepted by every generated pixel icon.
 *
 * Pass `label={null}` for a purely decorative icon that sits next to its own
 * text — repeating the name to a screen reader is noise.
 */
export interface PixelIconProps extends Omit<React.ComponentProps<typeof Icon>, 'children' | 'label'> {
	/** Accessible name. Defaults to the icon's own name; `null` hides it. */
	label?: string | null;
}
