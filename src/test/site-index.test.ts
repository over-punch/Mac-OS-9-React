// The site's component index has to list every component.
//
// The index in `site/src/sections/Desktop.tsx` is hand-written, and it went
// four components stale the moment 2.2.0 shipped — the site advertised a
// library that no longer matched the package. Nothing caught it, because the
// site builds fine with an incomplete list.
//
// This asserts the list covers the directory. Components that are deliberately
// absent go in EXEMPT, with the reason, so leaving one out is a decision
// somebody wrote down rather than something nobody noticed.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const COMPONENTS_DIR = join(process.cwd(), 'src/components');
const DESKTOP = join(process.cwd(), 'site/src/sections/Desktop.tsx');
const INDEX = join(process.cwd(), 'src/index.ts');

/** Components the index does not list, and why. */
const EXEMPT: Record<string, string> = {
	WindowManager: 'A provider, not something you can look at',
	FieldMessage: 'Internal to the field components; not exported on its own',
};

/** Directory names under src/components. */
function componentNames(): string[] {
	return readdirSync(COMPONENTS_DIR).filter((name) =>
		statSync(join(COMPONENTS_DIR, name)).isDirectory()
	);
}

/**
 * Every name the package exports. Not every component has a directory of its
 * own — MenuItem and MenuDropdown live inside MenuBar, IconLibrary inside
 * Icon — so a name being absent from src/components does not make it a ghost.
 */
function exportedNames(): Set<string> {
	const src = readFileSync(INDEX, 'utf-8');
	const names = new Set<string>();
	for (const block of src.matchAll(/export\s*\{([^}]*)\}/g)) {
		for (const raw of (block[1] as string).split(',')) {
			const name = raw
				.trim()
				.replace(/^type\s+/, '')
				.split(/\s+as\s+/)
				.pop()
				?.trim();
			if (name) names.add(name);
		}
	}
	return names;
}

/** The `name:` values in the site's COMPONENTS array. */
function listedOnSite(): string[] {
	const src = readFileSync(DESKTOP, 'utf-8');
	return [...src.matchAll(/\bname: '([^']+)'/g)].map((m) => m[1] as string);
}

describe('site component index', () => {
	it('lists every component', () => {
		// A row may name more than one export, as "Icon / IconLibrary" does.
		const listed = new Set(listedOnSite().flatMap((name) => name.split('/').map((n) => n.trim())));

		const missing = componentNames().filter((name) => !listed.has(name) && !(name in EXEMPT));

		expect(missing, 'add these to COMPONENTS in site/src/sections/Desktop.tsx').toEqual([]);
	});

	it('does not list anything the package does not export', () => {
		const exported = exportedNames();
		const ghosts = listedOnSite()
			.flatMap((name) => name.split('/').map((n) => n.trim()))
			.filter((name) => !exported.has(name));

		expect(ghosts, 'these are on the site but not exported from src/index.ts').toEqual([]);
	});
});

describe('site story links', () => {
	/**
	 * Every `story:` id the index claims, and the story files that exist.
	 *
	 * Storybook derives a docs id from the meta `title` — 'Components/GroupBox'
	 * becomes 'components-groupbox' — but only emits the `--docs` entry when
	 * the meta carries `tags: ['autodocs']`, because .storybook/main.ts sets
	 * `autodocs: 'tag'`. Miss the tag and the row still renders, still looks
	 * clickable, and opens a Storybook 404. Nine of them nearly shipped.
	 */
	function storyFiles(): Map<string, string> {
		const found = new Map<string, string>();
		for (const dir of readdirSync(COMPONENTS_DIR)) {
			const componentDir = join(COMPONENTS_DIR, dir);
			if (!statSync(componentDir).isDirectory()) continue;
			for (const file of readdirSync(componentDir)) {
				if (!file.endsWith('.stories.tsx')) continue;
				const src = readFileSync(join(componentDir, file), 'utf-8');
				const title = /title:\s*'([^']+)'/.exec(src)?.[1];
				if (title) found.set(title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), src);
			}
		}
		return found;
	}

	it('every story link points at a story that exists', () => {
		const stories = storyFiles();
		const claimed = [
			...new Set(
				[...readFileSync(DESKTOP, 'utf-8').matchAll(/\bstory: '([^']+)'/g)].map(
					(m) => m[1] as string
				)
			),
		];

		const missing = claimed.filter((id) => !stories.has(id));

		expect(missing, 'these story ids have no matching stories file').toEqual([]);
	});

	it('every linked story is tagged for autodocs', () => {
		const stories = storyFiles();
		const claimed = [
			...new Set(
				[...readFileSync(DESKTOP, 'utf-8').matchAll(/\bstory: '([^']+)'/g)].map(
					(m) => m[1] as string
				)
			),
		];

		// The site links to the --docs page specifically, and that page only
		// exists for a tagged story.
		const untagged = claimed.filter((id) => {
			const src = stories.get(id);
			return src !== undefined && !src.includes("tags: ['autodocs']");
		});

		expect(untagged, "add tags: ['autodocs'] to these stories").toEqual([]);
	});
});
