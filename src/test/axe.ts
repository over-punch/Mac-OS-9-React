// Shared axe-core harness for accessibility tests
//
// The library claims WCAG 2.1 AA conformance. This runs the automated
// portion of that claim against real rendered output. Automated checks
// cover roughly a third of WCAG criteria — they catch missing names,
// invalid ARIA, and bad contrast, but not focus order or meaningful
// alternative text — so a clean run here is a floor, not a certificate.

import { axe } from 'vitest-axe';

/**
 * Runs axe against a container using the WCAG 2.1 A + AA rule sets.
 *
 * Colour contrast is disabled: jsdom does not compute layout or resolve CSS
 * custom properties, so every contrast result would be meaningless. Contrast
 * against the palette is checked in the token tests instead.
 */
export async function checkA11y(container: Element) {
	return axe(container, {
		runOnly: {
			type: 'tag',
			values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
		},
		rules: {
			'color-contrast': { enabled: false },
		},
	});
}
