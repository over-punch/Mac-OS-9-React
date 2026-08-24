// The no-React recipes must keep working.
//
// docs/without-react.md hands people CSS built on the published tokens. Those
// recipes are only as good as the tokens they name: rename one and the doc
// silently starts shipping CSS that resolves to nothing, which fails as a
// missing border rather than as an error anyone would notice.
//
// This reads the token names straight out of the doc's own CSS blocks and
// asserts each one is really in tokens.css.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const DOC = join(process.cwd(), 'docs/without-react.md');
const TOKENS = join(process.cwd(), 'src/styles/tokens.css');

/** Every custom property referenced inside the doc's ```css blocks. */
function tokensUsedInDoc(): string[] {
	const doc = readFileSync(DOC, 'utf-8');
	const blocks = [...doc.matchAll(/```css\n([\s\S]*?)```/g)].map((m) => m[1] as string);
	const used = new Set<string>();
	for (const block of blocks) {
		for (const match of block.matchAll(/var\((--[a-z0-9-]+)/g)) {
			used.add(match[1] as string);
		}
	}
	return [...used].sort();
}

/** Every custom property the published token sheet defines. */
function tokensDefined(): Set<string> {
	const css = readFileSync(TOKENS, 'utf-8');
	return new Set([...css.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)].map((m) => m[1] as string));
}

describe('docs/without-react.md', () => {
	it('only uses tokens the package actually publishes', () => {
		const defined = tokensDefined();
		const missing = tokensUsedInDoc().filter((token) => !defined.has(token));

		expect(missing, 'these tokens are used in the doc but not defined in tokens.css').toEqual([]);
	});

	it('references no CSS-module class from the package', () => {
		const doc = readFileSync(DOC, 'utf-8');
		// Content-hashed class names are not a public API, and a recipe built
		// on one would break on the next release.
		expect(doc).not.toMatch(/_[a-z][A-Za-z]*_[a-z0-9]{5}/);
	});

	it('actually contains recipes', () => {
		// Guards against the extraction above silently matching nothing.
		expect(tokensUsedInDoc().length).toBeGreaterThan(10);
	});
});
