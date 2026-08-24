// The Platinum demo page must stay React-free.
//
// The page's entire claim is that the Mac OS 9 interface works without a
// framework. A stray React import would not break the build or fail any other
// test — the page would still render, and the claim would quietly become
// false. So it is asserted here.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const SCRIPT = readFileSync(join(process.cwd(), 'site/src/platinum-page.ts'), 'utf-8');
const HTML = readFileSync(join(process.cwd(), 'site/platinum.html'), 'utf-8');

describe('the Platinum demo page', () => {
	it('imports nothing but the framework-free layer', () => {
		const imports = [...SCRIPT.matchAll(/from '([^']+)'/g)].map((m) => m[1] as string);
		expect(imports).toEqual(['@lib/platinum']);
	});

	it('names no React API', () => {
		expect(SCRIPT).not.toMatch(/\b(useState|useEffect|createRoot|ReactDOM)\b/);
	});

	it('uses the layer, not the React components', () => {
		// Importing from @lib/components here would drag the framework in
		// through a component even without naming React.
		expect(SCRIPT).not.toContain('@lib/components');
	});

	it('exercises all four behaviours, so the page proves the whole layer', () => {
		for (const behaviour of ['disclosure', 'menu', 'balloon', 'stepper']) {
			expect(SCRIPT, `${behaviour} should be demonstrated`).toContain(`${behaviour}(`);
		}
	});

	it('is plain markup with the layer’s own class names', () => {
		// A handful of the published classes, to catch the page drifting onto
		// hand-rolled styles that no longer demonstrate the layer.
		for (const cls of ['mac-groupbox', 'mac-button', 'mac-menu', 'mac-disclosure', 'mac-window']) {
			expect(HTML, `${cls} should appear on the page`).toContain(cls);
		}
	});

	it('links back to the honest account of what is still React-only', () => {
		expect(HTML).toContain('without-react.md');
	});
});
