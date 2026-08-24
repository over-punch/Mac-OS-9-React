// Dependency layering.
//
// The library has a primitives-and-compounds structure, but it was implicit —
// nothing recorded which components were allowed to depend on which, or
// stopped a cycle forming (issue #119). Reorganising the directories into
// `primitives/` and `compound/` would have moved every file to encode
// information a test can assert directly, without churning paths.
//
// So the layering is declared here and checked against the real imports. Add
// a component and this fails until you say which layer it belongs to.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const COMPONENTS_DIR = join(process.cwd(), 'src/components');

/**
 * Components that must not depend on any other component. These are the
 * bottom of the graph: they can be rendered in isolation and are safe to use
 * from anywhere.
 */
const PRIMITIVES = [
	'Button',
	'Checkbox',
	'DisclosureTriangle',
	'GroupBox',
	'WindowHeader',
	'Slider',
	'LittleArrows',
	'Icon',
	'ListView',
	'MenuBar',
	'Radio',
	'Progress',
	'Scrollbar',
	'Select',
	'Separator',
	'Tabs',
	'TextField',
	'WindowManager',
] as const;

/**
 * Components assembled from others, with the dependencies each is allowed.
 * Anything outside this list is a layering violation.
 */
const COMPOUNDS: Record<string, readonly string[]> = {
	Window: ['WindowManager'],
	Dialog: ['Window'],
	// Alert is the Mac OS 9 alert arrangement over Dialog — icon, message,
	// buttons bottom-right — not a second modal implementation.
	Alert: ['Dialog', 'Button', 'Icon'],
	FolderList: ['ListView', 'Window'],
	IconButton: ['Button'],
};

/** Every component directory on disk. */
function componentNames(): string[] {
	return readdirSync(COMPONENTS_DIR).filter((name) =>
		statSync(join(COMPONENTS_DIR, name)).isDirectory()
	);
}

/** Source files of a component, excluding tests and stories. */
function sourceFiles(component: string): string[] {
	const dir = join(COMPONENTS_DIR, component);
	const out: string[] = [];
	const walk = (path: string) => {
		for (const entry of readdirSync(path)) {
			const full = join(path, entry);
			if (statSync(full).isDirectory()) {
				walk(full);
			} else if (/\.tsx?$/.test(entry) && !/\.(test|stories)\./.test(entry)) {
				out.push(full);
			}
		}
	};
	walk(dir);
	return out;
}

/** Which other components a component imports from. */
function dependenciesOf(component: string): string[] {
	const found = new Set<string>();
	for (const file of sourceFiles(component)) {
		const src = readFileSync(file, 'utf-8');
		for (const match of src.matchAll(/from '\.\.\/(\w+)\//g)) {
			const target = match[1];
			if (target && target !== component) found.add(target);
		}
	}
	return [...found].sort();
}

describe('component layering', () => {
	it('every component is assigned to a layer', () => {
		const declared = new Set<string>([...PRIMITIVES, ...Object.keys(COMPOUNDS)]);
		const undeclared = componentNames().filter((name) => !declared.has(name));

		expect(undeclared, 'add these to PRIMITIVES or COMPOUNDS in this file').toEqual([]);
	});

	it.each(PRIMITIVES)('%s is a primitive and depends on no other component', (component) => {
		expect(dependenciesOf(component)).toEqual([]);
	});

	it.each(Object.entries(COMPOUNDS))(
		'%s depends only on what it declares',
		(component, allowed) => {
			const actual = dependenciesOf(component);
			const unexpected = actual.filter((dep) => !allowed.includes(dep));

			expect(unexpected, `${component} imports a component it does not declare`).toEqual([]);
		}
	);

	it('has no dependency cycles', () => {
		const graph = new Map(componentNames().map((name) => [name, dependenciesOf(name)]));
		const cycles: string[][] = [];
		const visiting: string[] = [];
		const done = new Set<string>();

		const visit = (node: string) => {
			if (visiting.includes(node)) {
				cycles.push([...visiting.slice(visiting.indexOf(node)), node]);
				return;
			}
			if (done.has(node)) return;

			visiting.push(node);
			for (const next of graph.get(node) ?? []) visit(next);
			visiting.pop();
			done.add(node);
		};

		for (const node of graph.keys()) visit(node);

		expect(cycles.map((c) => c.join(' -> '))).toEqual([]);
	});
});

describe('shared code stays below the components', () => {
	const sharedDirs = ['src/utils', 'src/hooks'];

	it.each(sharedDirs)('%s does not import a component', (dir) => {
		const offenders: string[] = [];
		const full = join(process.cwd(), dir);

		for (const entry of readdirSync(full)) {
			if (!/\.tsx?$/.test(entry) || /\.(test|stories)\./.test(entry)) continue;
			const src = readFileSync(join(full, entry), 'utf-8');
			if (/from '\.\.\/components\//.test(src)) offenders.push(entry);
		}

		// A helper reaching back up into a component is how a cycle starts.
		expect(offenders).toEqual([]);
	});
});
