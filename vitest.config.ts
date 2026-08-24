import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './vitest.setup.ts',
		css: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'dist/',
				'storybook-static/',
				'**/*.stories.tsx',
				'**/*.test.ts',
				'**/*.test.tsx',
				'**/*.config.ts',
				'**/index.ts',
				'src/test/**',
				'vitest.setup.ts',
			],
			// A ratchet against regression, not a target. Set a few points below
			// the current numbers so ordinary churn does not fail the build,
			// and raised whenever coverage climbs — they had been left at the
			// original baseline while actual coverage rose twenty points past
			// them, which meant they were guarding nothing.
			thresholds: {
				statements: 86,
				branches: 78,
				functions: 90,
				lines: 89,
			},
		},
	},
});
