// Flat ESLint config for the Mac OS 9 UI library.
//
// ESLint 9 no longer reads .eslintrc.* by default, so the previous
// .eslintrc.cjs was being ignored entirely and `npm run lint` failed with
// "couldn't find an eslint.config file". This is the same rule set, ported.

import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';
import prettier from 'eslint-config-prettier';

export default [
	{
		ignores: ['dist/**', 'node_modules/**', 'storybook-static/**'],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
			},
			parserOptions: {
				ecmaFeatures: { jsx: true },
			},
		},
		plugins: {
			react,
			'react-hooks': reactHooks,
		},
		settings: {
			react: { version: 'detect' },
		},
		rules: {
			...react.configs.recommended.rules,
			...reactHooks.configs.recommended.rules,
			// The JSX transform is automatic; React need not be in scope.
			'react/react-in-jsx-scope': 'off',
			// Prop types are expressed in TypeScript.
			'react/prop-types': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
				},
			],
		},
	},
	...storybook.configs['flat/recommended'],
	prettier,
];
