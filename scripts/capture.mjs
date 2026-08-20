// README visual capture.
//
// Serves the built site and screenshots each `.scene` from capture.html, plus
// the landing page hero and desktop, into assets/. Every image in the README
// comes from here, so `npm run capture` regenerates the lot.
//
//   npm run site:build && node scripts/capture.mjs

import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';

const ROOT = join(process.cwd(), 'site-dist');
const OUT = join(process.cwd(), 'assets');
const MIME = {
	'.html': 'text/html',
	'.js': 'application/javascript',
	'.css': 'text/css',
	'.woff2': 'font/woff2',
	'.woff': 'font/woff',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
};

await mkdir(OUT, { recursive: true });

const server = createServer(async (req, res) => {
	try {
		const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
		const path = join(ROOT, url === '/' ? '/index.html' : url);
		const data = await readFile(path);
		res.writeHead(200, { 'Content-Type': MIME[extname(path)] ?? 'application/octet-stream' });
		res.end(data);
	} catch {
		res.writeHead(404);
		res.end('not found');
	}
});
await new Promise((r) => server.listen(0, r));
const { port } = server.address();

const browser = await chromium.launch();

// --- Scenes from the capture harness --------------------------------------
{
	const page = await browser.newPage({
		deviceScaleFactor: 2,
		viewport: { width: 1200, height: 900 },
	});
	await page.goto(`http://localhost:${port}/capture.html`, { waitUntil: 'networkidle' });
	await page.evaluate(() => document.fonts.ready);
	await page.waitForTimeout(500);

	const ids = await page.$$eval('.scene', (els) => els.map((e) => e.id));
	for (const id of ids) {
		const el = await page.$(`#${id}`);
		await el.screenshot({ path: join(OUT, `${id}.png`) });
		console.log('captured assets/%s.png', id);
	}
	await page.close();
}

// --- Landing page, for the hero -------------------------------------------
{
	// 1x here, not 2x: these are full-viewport shots, and at retina scale the
	// hero alone was over a megabyte — more than the rest of the README's
	// images combined, for no visible gain at the width GitHub renders.
	const page = await browser.newPage({
		deviceScaleFactor: 1,
		viewport: { width: 1600, height: 1000 },
	});
	await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
	await page.evaluate(() => document.fonts.ready);
	await page.waitForTimeout(600);
	await page.screenshot({ path: join(OUT, 'hero.png') });
	console.log('captured assets/hero.png');

	await page.evaluate(() => document.getElementById('desktop').scrollIntoView());
	await page.waitForTimeout(600);
	await page.screenshot({ path: join(OUT, 'desktop.png') });
	console.log('captured assets/desktop.png');
	await page.close();
}

await browser.close();
server.close();
