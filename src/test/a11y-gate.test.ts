// The machine-checkable half of the manual accessibility gate.
//
// RELEASING.md carries a checklist of things automated rules cannot judge.
// Several of its items turned out to be checkable after all — not whether a
// focus ring is *legible*, which needs eyes, but whether one is defined at
// all, and whether a component that animates has an answer for someone who
// asked for less motion.
//
// Those are exactly the items that rot: they stay unticked for six releases
// because nobody can action them in a hurry. Automating them leaves the
// checklist holding only what genuinely needs a human.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const COMPONENTS_DIR = join(process.cwd(), 'src/components');

/**
 * Components that render another component and inherit its chrome, so the
 * styles are expected to live in the parent's stylesheet rather than their own.
 * This mirrors the COMPOUNDS map in architecture.test.ts.
 */
const INHERITS_FROM: Record<string, string> = {
	IconButton: 'Button',
	Alert: 'Dialog',
	FolderList: 'Window',
};

/** Every component's stylesheet, keyed by component name. */
function stylesheets(): Array<{ name: string; css: string }> {
	const found: Array<{ name: string; css: string }> = [];
	for (const name of readdirSync(COMPONENTS_DIR)) {
		const dir = join(COMPONENTS_DIR, name);
		if (!statSync(dir).isDirectory()) continue;
		const file = join(dir, `${name}.module.css`);
		try {
			found.push({ name, css: readFileSync(file, 'utf-8') });
		} catch {
			// Not every component has a stylesheet of its own.
		}
	}
	return found;
}

/**
 * Components with something the user can focus. Anything here must define a
 * focus style, or a keyboard user cannot see where they are.
 */
const FOCUSABLE = [
	'Button',
	'IconButton',
	'Checkbox',
	'Radio',
	'TextField',
	'Select',
	'Slider',
	'LittleArrows',
	'DisclosureTriangle',
	'BevelButton',
	'ImageWell',
	'Placard',
	'TreeView',
	'Tabs',
	'ListView',
	'Scrollbar',
	'MenuBar',
	'Window',
];

describe('focus is always visible', () => {
	const byName = new Map(stylesheets().map((s) => [s.name, s.css]));

	it.each(FOCUSABLE)('%s defines a focus style', (name) => {
		// A component that renders another inherits its chrome — IconButton
		// carries no focus rule of its own because it renders a Button.
		const source = byName.get(name) ?? '';
		const inherited = byName.get(INHERITS_FROM[name] ?? '') ?? '';
		const css = source + inherited;

		expect(css, `${name} has no stylesheet`).not.toBe('');
		// :focus-visible for most; TextField deliberately uses plain :focus,
		// because you need to know where you are typing however you got there.
		expect(css).toMatch(/:focus(-visible)?/);
	});
});

describe('motion has an answer for people who asked for less', () => {
	/** Rules that move something rather than merely recolouring it. */
	const MOVES = /animation:|animation-name:|transition:\s*transform|transform:\s*rotate|@keyframes/;

	it.each(
		stylesheets()
			.filter(({ css }) => MOVES.test(css))
			.map(({ name }) => name)
	)('%s answers prefers-reduced-motion', (name) => {
		const css = stylesheets().find((s) => s.name === name)?.css ?? '';
		expect(css).toContain('prefers-reduced-motion');
	});
});

describe('high contrast', () => {
	/** Components whose look is carried by a bevel rather than a border. */
	const BEVELLED = ['Button', 'IconButton', 'BevelButton', 'Placard', 'WindowHeader', 'Slider'];

	it.each(BEVELLED)('%s has a high-contrast fallback for its bevel', (name) => {
		const own = stylesheets().find((s) => s.name === name)?.css ?? '';
		const inherited = stylesheets().find((s) => s.name === INHERITS_FROM[name])?.css ?? '';
		const css = own + inherited;
		// A bevel is a box-shadow, which disappears in forced-colours mode —
		// so these need a real border when contrast is turned up.
		expect(css).toContain('prefers-contrast');
	});
});
