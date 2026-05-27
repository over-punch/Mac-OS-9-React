// Rollup configuration for Mac OS 9 React UI library
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import postcssImport from 'postcss-import';
import postcssUrl from 'postcss-url';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import dts from 'rollup-plugin-dts';
import copy from 'rollup-plugin-copy';
import { readFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default [
	// Main build for ESM and CJS
	{
		input: 'src/index.ts',
		output: [
			{
				file: packageJson.module,
				format: 'esm',
				sourcemap: true,
				banner: '"use client";',
			},
			{
				file: packageJson.main,
				format: 'cjs',
				sourcemap: true,
				banner: '"use client";',
				exports: 'named',
			},
		],
		plugins: [
			// Automatically externalize peer dependencies
			peerDepsExternal(),

			// Resolve node modules
			resolve({
				extensions: ['.ts', '.tsx', '.js', '.jsx'],
			}),

			// Convert CommonJS modules to ES6
			commonjs(),

			// Process CSS with modules support
			postcss({
				plugins: [
					// Process @import statements - MUST be first
					postcssImport(),
					// Copy font files referenced in CSS
					postcssUrl({
						url: 'copy',
						assetsPath: 'fonts',
						useHash: true,
					}),
				],
				modules: {
					// Generate scoped class names
					generateScopedName: '[name]_[local]',
				},
				// Extract CSS to separate file
				extract: 'index.css',
				// Explicitly set the output path for correct relative path calculation
				to: 'dist/index.css',
				// Minimize CSS in production
				minimize: false,
				// Enable source maps
				sourceMap: true,
				// Auto-prefix CSS
				autoModules: true,
				// Process .css and .module.css files
				test: /\.css$/,
			}),

			// Compile TypeScript
			typescript({
				tsconfig: './tsconfig.json',
				declaration: true,
				declarationDir: 'dist/types',
				declarationMap: false,
				exclude: [
					'**/*.test.tsx',
					'**/*.test.ts',
					'**/*.stories.tsx',
					'node_modules',
					'dist',
				],
			}),

			// Copy font files to dist
			copy({
				targets: [
					{
						src: 'src/fonts/pixelOperator/*.ttf',
						dest: 'dist/fonts/pixelOperator',
					},
					{
						src: 'src/fonts/pixelOperator/LICENSE.txt',
						dest: 'dist/fonts/pixelOperator',
					},
				],
			}),

			// Custom plugin to fix CSS paths
			{
				name: 'fix-css-font-paths',
				generateBundle(options, bundle) {
					// Find the CSS asset
					const cssFileName = 'index.css';
					// Note: rollup-plugin-postcss emits assets with keys relative to output dir if extract is true ??
					// Actually, let's look for any .css asset in the bundle
					for (const fileName in bundle) {
						if (fileName.endsWith('.css')) {
							const asset = bundle[fileName];
							if (asset.type === 'asset' && typeof asset.source === 'string') {
								// Correct the font paths
								// Replace "dist/fonts/" with "fonts/"
								asset.source = asset.source.replace(/url\s*\(\s*["']?(?:\.?\/?dist\/)?fonts\//g, 'url("fonts/');
								console.log(`Fixed font paths in ${fileName}`);
							}
						}
					}
				},
			},
		],
		external: ['react', 'react-dom', 'react/jsx-runtime'],
	},

	// Build base.css separately (optional global styles)
	{
		input: 'src/styles/base.css',
		output: {
			file: 'dist/base.css',
		},
		plugins: [
			postcss({
				plugins: [
					postcssImport(),
				],
				extract: true,
				minimize: false,
				sourceMap: true,
			}),
		],
	},

	// Bundle TypeScript declaration files.
	//
	// We emit BOTH dist/index.d.ts (for the ESM conditional export and the
	// top-level `types` field) and dist/index.d.cts (for the CJS conditional
	// export). Under TypeScript's node16/nodenext module resolution, CJS
	// consumers resolve types via the `require.types` conditional, which
	// package.json points at `./dist/index.d.cts`. Without the .d.cts file
	// those consumers get "Cannot find type definitions" errors.
	{
		input: 'dist/types/index.d.ts',
		output: [
			{
				file: 'dist/index.d.ts',
				format: 'esm',
			},
			{
				file: 'dist/index.d.cts',
				format: 'cjs',
			},
		],
		plugins: [dts()],
		external: [/\.css$/],
	},
];
