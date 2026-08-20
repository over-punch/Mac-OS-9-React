// Captures the desktop section at several viewport widths.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';

const ROOT = join(process.cwd(), 'site-dist');
const OUT = process.argv[2] ?? '.';
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const server = createServer(async (req, res) => {
	try {
		const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
		// Resolve first, then take the extension: extname('/') is empty, which
		// served index.html as a download instead of a page.
		const path = join(ROOT, url === '/' ? '/index.html' : url);
		const data = await readFile(path);
		res.writeHead(200, { 'Content-Type': MIME[extname(path)] ?? 'application/octet-stream' });
		res.end(data);
	} catch { res.writeHead(404); res.end('nf'); }
});
await new Promise((r) => server.listen(0, r));
const { port } = server.address();
const browser = await chromium.launch();
for (const [name, width, height] of [['mobile', 390, 844], ['tablet', 834, 1112]]) {
	const page = await browser.newPage({ viewport: { width, height } });
	await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
	await page.evaluate(() => document.fonts.ready);
	await page.waitForTimeout(400);
	await page.screenshot({ path: `${OUT}/site-${name}-hero.png` });
	await page.evaluate(() => document.getElementById('desktop').scrollIntoView());
	await page.waitForTimeout(400);
	await page.screenshot({ path: `${OUT}/site-${name}-desktop.png` });
	// Horizontal overflow check
	const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
	console.log(name, width, 'horizontal overflow:', overflow, 'px');
	await page.close();
}
await browser.close(); server.close();
