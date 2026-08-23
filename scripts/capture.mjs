// README visual capture.
//
// Serves the built site and screenshots each `.scene` from capture.html, plus
// the landing page hero and desktop, into assets/. Every image in the README
// comes from here, so `npm run capture` regenerates the lot.
//
// It also writes site/public/og.png — the social card. That one goes into the
// site's own public/ rather than assets/, because it has to be fetchable at a
// stable URL for Slack, Discord and Twitter to unfurl it, and assets/ is
// deliberately kept out of the published tarball and off Pages.
//
// Note the ordering: this screenshots the *built* site, so og.png lands in
// site/public after that build. Run site:build once more afterwards if you
// need the new card in site-dist — the deploy workflow builds from the
// committed file, so committing it is what actually ships it.
//
//   npm run site:build && node scripts/capture.mjs && npm run site:build

import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';

const ROOT = join(process.cwd(), 'site-dist');
const OUT = join(process.cwd(), 'assets');
const PUBLIC = join(process.cwd(), 'site', 'public');
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
await mkdir(PUBLIC, { recursive: true });

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

	// The desktop is inside the machine now, reached by finishing the zoom
	// rather than by scrolling to a separate section.
	await page.evaluate(() => {
		const track = document.querySelector('.zoomTrack');
		window.scrollTo({ top: track.offsetHeight - window.innerHeight, behavior: 'instant' });
	});
	await page.waitForTimeout(900);
	await page.screenshot({ path: join(OUT, 'desktop.png') });
	console.log('captured assets/desktop.png');
	await page.close();
}

// --- The social card ------------------------------------------------------
{
	// 1200x630 is what every unfurler crops to. Shot at 1x for the same reason
	// as the hero: this file is fetched by chat clients on every paste, so its
	// weight is the one that actually matters.
	const page = await browser.newPage({
		deviceScaleFactor: 1,
		viewport: { width: 1200, height: 630 },
	});
	await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
	await page.evaluate(() => document.fonts.ready);
	// Hold the machine at the tilt it reaches with the pointer up and to the
	// right — square-on reads as a flat product shot, and the whole point of
	// the card is that the thing has dimension.
	//
	// Driven by moving the pointer rather than by setting a custom property:
	// the machine is WebGL now, and the tilt is a camera orbit rather than a
	// CSS transform. Nudging the real input is also the only way to be sure
	// the card shows what a visitor would actually see.
	await page.mouse.move(1140, 150);
	await page.waitForTimeout(900);
	await page.screenshot({ path: join(PUBLIC, 'og.png') });
	console.log('captured site/public/og.png');
	await page.close();
}

await browser.close();
server.close();
