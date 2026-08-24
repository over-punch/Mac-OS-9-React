// The framework-agnostic layer's contract.
//
// Unlike the CSS-module class names the React components use, the class names
// in platinum.css ARE a public API: they are hand-written, versioned with the
// package, and renaming one is a breaking change. This file is what makes that
// claim enforceable rather than aspirational.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const CSS = readFileSync(join(process.cwd(), 'src/styles/platinum.css'), 'utf-8');
const TOKENS = readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf-8');

/** Every class the layer defines. */
function definedClasses(): Set<string> {
	return new Set([...CSS.matchAll(/\.(mac-[a-z0-9_-]+)/g)].map((m) => m[1] as string));
}

/**
 * The published surface. Removing or renaming anything here is a breaking
 * change and must be a major version — that is the whole point of the list
 * being written down rather than inferred.
 */
const PUBLISHED = [
	'mac-root',
	'mac-text',
	'mac-bevel',
	'mac-well',
	'mac-button',
	'mac-bevelbutton',
	'mac-field',
	'mac-input',
	'mac-groupbox',
	'mac-separator',
	'mac-windowheader',
	'mac-placard',
	'mac-progress',
	'mac-chasing',
	'mac-disclosure',
	'mac-littlearrows',
	'mac-menu',
	'mac-menuitem',
	'mac-balloon',
	'mac-window',
];

describe('platinum.css', () => {
	it.each(PUBLISHED)('still defines .%s', (name) => {
		expect(definedClasses().has(name)).toBe(true);
	});

	it('prefixes every class, so it cannot collide with a host page', () => {
		const stray = [...CSS.matchAll(/^\.([a-z][a-z0-9_-]*)/gm)]
			.map((m) => m[1] as string)
			.filter((name) => !name.startsWith('mac-'));

		expect([...new Set(stray)], 'every class in this layer must start with mac-').toEqual([]);
	});

	it('only uses tokens the package publishes', () => {
		const defined = new Set(
			[...TOKENS.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1] as string)
		);
		// Locally-scoped custom properties are declared in this file itself.
		const local = new Set([...CSS.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1] as string));
		const used = new Set([...CSS.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1] as string));

		const missing = [...used].filter((token) => !defined.has(token) && !local.has(token));

		expect(missing, 'these tokens are used but never defined').toEqual([]);
	});

	it('carries no content-hashed class from the React build', () => {
		// A hashed name here would tie the stable layer to an unstable one.
		expect(CSS).not.toMatch(/_[a-z][A-Za-z]*_[a-z0-9]{5}/);
	});

	it('answers reduced motion and high contrast', () => {
		expect(CSS).toContain('prefers-reduced-motion');
		expect(CSS).toContain('prefers-contrast');
	});
});
