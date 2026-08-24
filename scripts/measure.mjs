// Measures every size figure the README quotes, from the current dist/.
//
// The README's numbers have been wrong before — written from memory, or
// carried across a release that changed them. Anything quoted there should
// come out of this script, so `npm run measure` is the only source.
//
// Run after `npm run build`.

import { execFileSync } from 'node:child_process';
import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync, statSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Every file under `dir` matching `ext`, recursively. */
function walk(dir, ext, out = []) {
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) walk(path, ext, out);
		else if (entry.name.endsWith(ext)) out.push(path);
	}
	return out;
}

/** Decimal kB, the unit npm itself reports, rounded to whole units. */
const kB = bytes => `${Math.round(bytes / 1000)} kB`;

/** Raw and gzipped size of a set of files taken together. */
function weigh(files) {
	const buf = Buffer.concat(files.map(f => readFileSync(f)));
	return { raw: buf.length, gzip: gzipSync(buf, { level: 9 }).length };
}

/**
 * What a bundler actually emits for a given import, after tree-shaking.
 * React is external — it is a peer dependency, not part of what we ship.
 */
function bundleSize(source) {
	const dir = mkdtempSync(join(tmpdir(), 'macos9-measure-'));
	try {
		const entry = join(dir, 'entry.js');
		writeFileSync(entry, source);
		const result = esbuild.buildSync({
			entryPoints: [entry],
			bundle: true,
			minify: true,
			format: 'esm',
			write: false,
			external: ['react', 'react-dom', 'react/jsx-runtime'],
			loader: { '.css': 'empty' },
			// preserveModules leaves bare `import '../Icon/Icon.js'` statements
			// behind; esbuild warns that it is dropping them because `sideEffects`
			// says they have none. That is the tree-shaking working, not a fault.
			logLevel: 'silent',
		});
		return result.outputFiles[0].contents.length;
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

const esm = weigh(walk(join(ROOT, 'dist'), '.js'));
const css = weigh([join(ROOT, 'dist', 'index.css')]);

const indexPath = JSON.stringify(join(ROOT, 'dist', 'index.js'));
const buttonOnly = bundleSize(`import { Button } from ${indexPath};\nconsole.log(Button);`);
const everything = bundleSize(`import * as all from ${indexPath};\nconsole.log(all);`);

const packed = JSON.parse(
	execFileSync('npm', ['pack', '--dry-run', '--json'], { cwd: ROOT, encoding: 'utf8' })
)[0];

const registry = readFileSync(join(ROOT, 'src/components/Icon/registry.ts'), 'utf8');
const icons = (registry.match(/^\t[a-zA-Z]\w*:/gm) ?? []).length;

console.log(`Whole library (ESM)   ${kB(esm.raw)}, ${kB(esm.gzip)} gzipped`);
console.log(`Stylesheet            ${kB(css.raw)}, ${kB(css.gzip)} gzipped`);
console.log(`Published tarball     ${kB(packed.size)} (${kB(packed.unpackedSize)} unpacked)`);
console.log(`Button-only import    ${kB(buttonOnly)} minified`);
console.log(`Everything imported   ${kB(everything)} minified`);
console.log(`Icons in the registry ${icons}`);
