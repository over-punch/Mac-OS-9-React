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
import { readFileSync, rmSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default [
	// Main build for ESM and CJS
	{
		input: 'src/index.ts',
		output: [
			{
				file: packageJson.module,
				format: 'esm',
				// Source maps are deliberately off for the published build: they
				// leak absolute TS source paths and roughly double the tarball
				// for no consumer benefit, since the sources aren't shipped.
				sourcemap: false,
				banner: '"use client";',
			},
			{
				file: packageJson.main,
				format: 'cjs',
				sourcemap: false,
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
					// Rewrite font references to the stable dist/fonts/Pixel/*
					// paths written by the copy plugin below.
					//
					// This used to be `url: 'copy'` with content hashing, which
					// emitted a SECOND copy of every face under an unguessable
					// name — so each font shipped twice and the public
					// `./fonts/*` export subpath pointed at files whose names
					// nobody could predict.
					postcssUrl({
						url: (asset) => {
							const match = /fonts\/Pixel\/(.+)$/.exec(asset.url);
							return match ? `fonts/Pixel/${match[1]}` : asset.url;
						},
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
				// Source maps off — see the note on the JS outputs above
				sourceMap: false,
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

			// Copy the web font files to dist so the `./fonts/*` export subpath
			// resolves. The previous targets pointed at src/fonts/pixelOperator,
			// a directory that does not exist — the glob silently matched
			// nothing and no fonts were copied at all.
			// With `flatten: false` the plugin preserves each match's path minus
			// its first segment ('src/'), so 'src/fonts/Pixel/Normal/Pixel.woff'
			// lands at '<dest>/fonts/Pixel/Normal/Pixel.woff'. dest is therefore
			// 'dist', not 'dist/fonts'.
			copy({
				targets: [
					{
						src: 'src/fonts/Pixel/**/*.{woff,woff2}',
						dest: 'dist',
					},
					{
						src: 'src/fonts/README.md',
						dest: 'dist',
					},
				],
				flatten: false,
			}),

		],

		// `react/jsx-runtime` is a subpath of the `react` package, so the
		// existing `react` peerDependency already covers it — it does not need
		// its own peerDependencies entry.
		external: ['react', 'react-dom', 'react/jsx-runtime'],
	},

	// Standalone CSS entry points, each exposed through a package.json export
	// subpath so consumers can take exactly the layer they want:
	//
	//   ./base      global html/body element styles (opt in)
	//   ./tokens    design tokens only — no @font-face, no font downloads
	//   ./webfonts  the Google Fonts request (opt in; not bundled by default)
	...['base', 'tokens', 'webfonts'].map((name) => ({
		input: `src/styles/${name}.css`,
		output: {
			file: `dist/${name}.css`,
		},
		plugins: [
			postcss({
				plugins: [postcssImport()],
				extract: true,
				minimize: false,
				sourceMap: false,
			}),
		],
	})),

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
		plugins: [
			dts(),
			// The per-file declaration tree under dist/types exists only as the
			// input to this bundling step. Shipping it as well as the bundled
			// dist/index.d.ts duplicated every type and roughly tripled the
			// declaration payload, so remove it once the bundle is written.
			{
				name: 'remove-intermediate-declarations',
				writeBundle: {
					sequential: true,
					order: 'post',
					handler() {
						rmSync('dist/types', { recursive: true, force: true });
					},
				},
			},
		],
		external: [/\.css$/],
	},
];
