// Accessibility + behaviour audit of the built site.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { chromium } from 'playwright';

const ROOT = join(process.cwd(), 'site-dist');
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const server = createServer(async (req, res) => {
	try {
		const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
		const path = join(ROOT, url === '/' ? '/index.html' : url);
		const data = await readFile(path);
		res.writeHead(200, { 'Content-Type': MIME[extname(path)] ?? 'application/octet-stream' });
		res.end(data);
	} catch { res.writeHead(404); res.end('nf'); }
});
await new Promise((r) => server.listen(0, r));
const { port } = server.address();

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => document.getElementById('desktop').scrollIntoView());
await page.waitForTimeout(600);

// axe
await page.addScriptTag({ path: 'node_modules/axe-core/axe.min.js' });
const results = await page.evaluate(async () =>
	await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } })
);
console.log('axe violations:', results.violations.length);
for (const v of results.violations) {
	console.log(`  [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))`);
	console.log(`      e.g. ${v.nodes[0].html.slice(0, 110)}`);
}

// Heading outline
const headings = await page.evaluate(() =>
	[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => `${h.tagName} ${h.textContent.trim().slice(0, 42)}`)
);
console.log('headings:', JSON.stringify(headings, null, 0));

// Keyboard: can we tab to the menu bar and open a menu?
await page.keyboard.press('Tab');
const first = await page.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 30));
console.log('first tab stop:', first);

if (errors.length) { console.log('CONSOLE ERRORS:'); errors.slice(0, 8).forEach((e) => console.log('  ', e)); }
else console.log('no console errors');

await browser.close(); server.close();
