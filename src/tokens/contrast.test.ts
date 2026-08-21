// Colour contrast checks for the palette (WCAG 1.4.3 / 1.4.11).
//
// The axe sweep in src/test/a11y.test.tsx runs with `color-contrast` disabled,
// because jsdom performs no layout and resolves no CSS custom properties, so
// every result there would be meaningless. Contrast is therefore checked here
// instead, against the token values directly — which is also where a
// regression would actually originate.
//
// The Mac OS 9 palette is low-contrast by design: grey chrome on grey chrome
// is the aesthetic. These tests pin the pairs that carry *text*, which is
// where the standard applies, and deliberately do not assert on decorative
// chrome such as bevel highlights or the title bar pinstripe.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { colors } from './index';

/** Relative luminance per WCAG 2.1, from an #rrggbb string. */
function luminance(hex: string): number {
	const value = hex.replace('#', '');
	const channels = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
	const linear = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
	return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
}

/** Contrast ratio between two hex colours, 1 to 21. */
function contrast(a: string, b: string): number {
	const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (light! + 0.05) / (dark! + 0.05);
}

/** WCAG AA thresholds. */
const AA_NORMAL_TEXT = 4.5;
const AA_NON_TEXT = 3;

describe('contrast helper', () => {
	it('computes the reference ratios', () => {
		expect(contrast('#000000', '#ffffff')).toBeCloseTo(21, 1);
		expect(contrast('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
		// A known AA-passing pair.
		expect(contrast('#767676', '#ffffff')).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
	});
});

describe('palette contrast (WCAG 1.4.3)', () => {
	const textPairs: ReadonlyArray<readonly [string, string, string]> = [
		['body text on the page background', colors.text, colors.background],
		['body text on a surface', colors.text, colors.surface],
		['body text on an inset surface', colors.text, colors.surfaceInset],
		['body text on a raised surface', colors.text, colors.surfaceRaised],
		['inverse text on the selection highlight', colors.highlightText, colors.highlight],
		['error text on a surface', colors.error, colors.surface],
	];

	it.each(textPairs)('%s meets AA for normal text', (_label, fg, bg) => {
		expect(contrast(fg, bg)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
	});

	it('the title bar carries legible text', () => {
		// --window-titlebar-bg is gray-450 and its text is --color-text.
		expect(contrast(colors.text, colors.gray450)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
	});

	it('placeholder and secondary text meets AA on a surface', () => {
		expect(contrast(colors.gray600, colors.surfaceInset)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
	});
});

describe('component boundaries (WCAG 1.4.11)', () => {
	it('borders are distinguishable from the surfaces they enclose', () => {
		expect(contrast(colors.border, colors.surface)).toBeGreaterThanOrEqual(AA_NON_TEXT);
		expect(contrast(colors.border, colors.surfaceInset)).toBeGreaterThanOrEqual(AA_NON_TEXT);
	});

	it('the focus ring is visible against the surfaces it appears on', () => {
		expect(contrast(colors.focus, colors.surface)).toBeGreaterThanOrEqual(AA_NON_TEXT);
		expect(contrast(colors.focus, colors.surfaceInset)).toBeGreaterThanOrEqual(AA_NON_TEXT);
	});
});

describe('the spacing and size scales are not bypassed', () => {
	const css = readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf-8');

	it('declares every font size the components reference', () => {
		// A component reaching for a size the scale does not define is how a
		// hardcoded px literal gets reintroduced.
		const declared = new Set([...css.matchAll(/^\t(--font-size-[\w-]+):/gm)].map((m) => m[1]));

		for (const name of ['--font-size-2xs', '--font-size-xs', '--font-size-md']) {
			expect(declared.has(name), `${name} is missing from tokens.css`).toBe(true);
		}
	});

	it('declares the border widths the components reference', () => {
		const declared = new Set([...css.matchAll(/^\t(--border-width-[\w-]+):/gm)].map((m) => m[1]));
		for (const name of ['--border-width-thin', '--border-width-medium', '--border-width-thick']) {
			expect(declared.has(name), `${name} is missing from tokens.css`).toBe(true);
		}
	});
});

describe('tokens.css and the TypeScript export agree', () => {
	// The two are maintained side by side, and have drifted before (#17, #106).
	// Vitest transforms import.meta.url to a non-file URL, so resolve from cwd.
	const css = readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf-8');

	const cssValue = (name: string): string | undefined =>
		new RegExp(`^\\t${name}:\\s*(#[0-9a-fA-F]{6});`, 'm').exec(css)?.[1]?.toLowerCase();

	const mirrored: ReadonlyArray<readonly [string, string]> = [
		['--color-gray-100', colors.gray100],
		['--color-gray-200', colors.gray200],
		['--color-gray-300', colors.gray300],
		['--color-gray-400', colors.gray400],
		['--color-gray-450', colors.gray450],
		['--color-gray-475', colors.gray475],
		['--color-gray-500', colors.gray500],
		['--color-gray-550', colors.gray550],
		['--color-gray-600', colors.gray600],
		['--color-gray-650', colors.gray650],
		['--color-gray-700', colors.gray700],
		['--color-gray-800', colors.gray800],
		['--color-gray-900', colors.gray900],
		['--color-blue-highlight', colors.blueHighlight],
		['--color-focus', colors.focus],
		['--color-error', colors.error],
	];

	it.each(mirrored)('%s matches the TypeScript token', (name, tsValue) => {
		expect(cssValue(name)).toBe(tsValue.toLowerCase());
	});
});
