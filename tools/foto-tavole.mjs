// Tavole di prova del finale D-165 (parti 2 e 3) per il PO (PO-130), prima che entrino nel gioco.
// Salvataggio vero della partita A-Z (tests/salvataggi-reali/v2-0.38.0-fine-campagna.json) → città → «Rileggi l'epilogo»
// (tavole nel gioco da D-171). Uso: node tools/foto-tavole.mjs <cartella> [larghezze] [genere m|f]   (build in dist/)
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from 'playwright-core';

const [out = 'out/tavole', lar = '360,412', genere] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const TIPI = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const srv = await new Promise((ok) => { const s = createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const p = join('dist', u === '/' ? 'index.html' : u);
  if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TIPI[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); }); s.listen(0, '127.0.0.1', () => ok(s)); });
const sal = JSON.parse(readFileSync('tests/salvataggi-reali/v2-0.38.0-fine-campagna.json', 'utf8'));
if (genere) sal.genere = genere;
const b = await chromium.launch({ executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
const problemi = [];
for (const w of lar.split(',').map(Number)) {
  const pg = await b.newPage({ viewport: { width: w, height: 800 }, reducedMotion: 'reduce' });
  pg.on('pageerror', (e) => problemi.push(`${w}: ${e.message}`)); pg.on('console', (m) => { if (m.type() === 'error') problemi.push(`${w}: ${m.text()}`); });
  await pg.goto(`http://127.0.0.1:${srv.address().port}/`);
  await pg.evaluate((v) => localStorage.setItem('varcalda-salvataggio', v), JSON.stringify(sal));
  await pg.reload(); await pg.getByRole('button', { name: 'Riprendi' }).click(); await pg.waitForSelector('[data-scena="citta"]');
  await pg.click('[data-azione="epilogo"]'); await pg.waitForSelector('[data-scena="epilogo"] .tavola'); await pg.waitForTimeout(500);
  const [c, f] = await pg.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  if (c > f) problemi.push(`${w}: scorrimento orizzontale ${c} > ${f}`);
  const testi = await pg.evaluate(() => document.querySelector('.scena').textContent.match(/\[\[[^\]]+\]\]/g) ?? []);
  if (testi.length) problemi.push(`${w}: testi mancanti ${testi.join(', ')}`);
  const g = genere ? `-${genere}` : '';
  await pg.screenshot({ path: join(out, `${w}${g}-finale-intero.jpg`), fullPage: true, type: 'jpeg', quality: 75 });
  for (const t of await pg.$$('.tavola')) await t.screenshot({ path: join(out, `${w}${g}-tavola-${await t.getAttribute('data-tavola')}.jpg`), type: 'jpeg', quality: 80 });
  await pg.close();
}
await b.close(); srv.close();
console.log(problemi.length ? problemi.join('\n') : 'verde'); process.exit(problemi.length ? 1 : 0);
