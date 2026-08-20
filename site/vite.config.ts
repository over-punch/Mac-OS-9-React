// Vite config for the Mac OS 9 UI landing site.
//
// The site is built out of the library itself — it imports from `src/` rather
// than from `dist`, so the page you are looking at is the components doing
// their job. That also means a broken component breaks the site build, which
// is a useful early warning.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const libSrc = fileURLToPath(new URL('../src', import.meta.url));

export default defineConfig({
	root: fileURLToPath(new URL('.', import.meta.url)),
	// Served from https://liiift-studio.github.io/Mac-OS-9-React/
	base: process.env.SITE_BASE ?? '/',
	plugins: [react()],
	resolve: {
		alias: {
			'@lib': libSrc,
		},
	},
	build: {
		outDir: fileURLToPath(new URL('../site-dist', import.meta.url)),
		emptyOutDir: true,
		rollupOptions: {
			input: {
				// The landing page, plus the README capture harness. Building the
				// harness with the site keeps the images reproducible from the
				// same component source the site uses.
				index: fileURLToPath(new URL('./index.html', import.meta.url)),
				capture: fileURLToPath(new URL('./capture.html', import.meta.url)),
			},
		},
	},
});
