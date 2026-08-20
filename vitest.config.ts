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
			// Thresholds so coverage can't quietly regress. Raise these as
			// coverage improves; they are a ratchet, not a target.
			thresholds: {
				statements: 70,
				branches: 74,
				functions: 55,
				lines: 70,
			},
		},
	},
});