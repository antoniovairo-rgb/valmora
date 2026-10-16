// Sonda C-029 (sola lettura): C28-11, posizione della versione rispetto alla colonna del gioco, sul titolo, a più finestre.
// Uso: node coordination/sonde/c29-versione.mjs <radice con dist/>
import { createServer } from 'node:http'; import { readFileSync, existsSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.');
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const [W, H] of [[360, 760], [412, 915], [768, 1024], [1024, 768], [1366, 768], [1920, 1080]]) {
  const p = await b.newPage({ viewport: { width: W, height: H } }); await p.goto(URL); await p.waitForSelector('.versione-angolo');
  const v = await p.evaluate(() => { const a = document.querySelector('#app').getBoundingClientRect(), v = document.querySelector('.versione-angolo').getBoundingClientRect(); return { testo: document.querySelector('.versione-angolo').textContent, colonnaDestra: Math.round(a.right), versioneSinistra: Math.round(v.left), distanza: Math.round(v.left - a.right) }; });
  console.log(`${W}×${H}: ${JSON.stringify(v)}`); await p.close(); }
await b.close(); srv.close();
