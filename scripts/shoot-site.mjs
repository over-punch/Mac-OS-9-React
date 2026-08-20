// Ad-hoc site screenshotter: serves site-dist and captures the page at a set
// of scroll positions, so the zoom can be inspected frame by frame.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';

const ROOT = join(process.cwd(), 'site-dist');
const OUT = process.argv[2] ?? '.';
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml', '.png': 'image/png' };

const server = createServer(async (req, res) => {
	try {
		const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
		const path = join(ROOT, url === '/' ? '/index.html' : url);
		const data = await readFile(path);
		res.writeHead(200, { 'Content-Type': MIME[extname(path)] ?? 'application/octet-stream' });
		res.end(data);
	} catch {
		res.writeHead(404); res.end('nf');
	}
});
await new Promise((r) => server.listen(0, r));
const { port } = server.address();

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);

const shots = [
	['hero', 0],
	['zoom-mid', 0.45],
	['zoom-end', 0.98],
];
const trackHeight = await page.evaluate(() => document.querySelector('.zoomTrack').getBoundingClientRect().height - window.innerHeight);
for (const [name, frac] of shots) {
	await page.evaluate((y) => window.scrollTo(0, y), Math.round(trackHeight * frac));
	await page.waitForTimeout(450);
	await page.screenshot({ path: `${OUT}/site-${name}.png` });
	console.log('shot', name);
}
// Desktop section
await page.evaluate(() => document.getElementById('desktop').scrollIntoView());
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/site-desktop.png` });
console.log('shot desktop');
await page.screenshot({ path: `${OUT}/site-desktop-full.png`, fullPage: true });

if (errors.length) { console.log('PAGE ERRORS:'); errors.slice(0, 10).forEach((e) => console.log(' ', e)); }
else console.log('no console errors');

await browser.close();
server.close();
