// The core's boundary.
//
// src/core holds the behaviour both implementations share — the React
// components and the framework-free platinum modules. Its whole value is that
// there is one copy of each decision, so two things worth enforcing:
//
//   1. It must not import React, or the platinum layer would drag a framework
//      in through the back door.
//   2. It must not touch the DOM, so the logic stays testable and portable.
//
// And the reason it exists: the constants it owns must not reappear as
// literals somewhere else, which is exactly how the duplication started.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CORE_DIR = join(process.cwd(), 'src/core');

/** Source of every non-test module in the core. */
function coreModules(): Array<{ name: string; source: string }> {
	return readdirSync(CORE_DIR)
		.filter((file) => file.endsWith('.ts') && !file.includes('.test.'))
		.map((file) => ({ name: file, source: readFileSync(join(CORE_DIR, file), 'utf-8') }));
}

describe('the shared core', () => {
	it('imports no framework', () => {
		const offenders = coreModules()
			.filter(({ source }) => /from '(react|react-dom)/.test(source))
			.map(({ name }) => name);

		expect(offenders, 'src/core must stay framework-free').toEqual([]);
	});

	it('touches no DOM', () => {
		// `document` and `window` would make the core untestable without a
		// browser and unusable from a worker or the server.
		const offenders = coreModules()
			.filter(({ source }) => /\b(document|window)\./.test(source))
			.map(({ name }) => name);

		expect(offenders, 'src/core must not reach for the DOM').toEqual([]);
	});

	it('is the only place the shared timings are written down', () => {
		// Each of these was a literal in two files before the extraction.
		const consumers = [
			'src/components/LittleArrows/LittleArrows.tsx',
			'src/platinum/stepper.ts',
			'src/components/BalloonHelp/BalloonHelp.tsx',
			'src/platinum/balloon.ts',
		];

		const offenders = consumers.filter((path) => {
			const source = readFileSync(join(process.cwd(), path), 'utf-8');
			// A bare 400 or 60 as a timing constant declaration.
			return /const\s+(REPEAT_DELAY|REPEAT_INTERVAL|OPEN_DELAY)\s*=/.test(source);
		});

		expect(offenders, 'these re-declare a timing the core owns').toEqual([]);
	});

	it('is used by both implementations, not just one', () => {
		// A core with a single consumer is not shared code, it is indirection.
		const react = readFileSync(
			join(process.cwd(), 'src/components/LittleArrows/LittleArrows.tsx'),
			'utf-8'
		);
		const vanilla = readFileSync(join(process.cwd(), 'src/platinum/stepper.ts'), 'utf-8');

		expect(react).toContain("from '../../core/repeat'");
		expect(vanilla).toContain("from '../core/repeat'");
	});
});
