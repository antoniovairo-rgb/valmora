// Sonda C-07 · sovrapposizioni sulla mappa: area visibile della pastiglia contro area di tocco (44×44), rispetto ai nomi vicini.
// Uso: node coordination/handoffs/collaudatrice/sonde/c07-sovrapposizioni.mjs <radice con dist/> [larghezza]
import { createServer } from 'node:http'; import { readFileSync, existsSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2]); const L = Number(process.argv[3] ?? 360); const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: L, height: 760 }, reducedMotion: 'reduce' }); await p.goto(`http://127.0.0.1:${srv.address().port}/`); await p.evaluate(() => localStorage.clear()); await p.reload();
const sc = (n) => p.waitForFunction((n) => document.querySelector('.scena')?.dataset.scena === n, n);
await sc('titolo'); await p.getByRole('button', { name: 'Nuova partita' }).click(); await sc('genere'); await p.click('[data-genere="m"]'); await sc('citta'); await p.click('[data-azione="avvia-episodio"]'); await sc('sala');
await p.click('[data-azione="avanti"]'); await sc('briefing'); while (await p.locator('[data-azione="prossimo"]').count()) { await p.click('[data-azione="prossimo"]'); await p.waitForTimeout(60); } await p.click('[data-azione="inizia"]'); await sc('schieramento');
for (const s of ['strada_cinderwick', 'strada_larkspire', 'curva_cinderwick', 'piazzale']) { await p.click('[data-risorsa="squadre"]'); await p.click(`[data-settore="${s}"] .settore-punto`); }
const r = await p.evaluate(() => {
  const inter = (a, c) => Math.round(Math.max(0, Math.min(a.right, c.right) - Math.max(a.left, c.left)) * Math.max(0, Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top)));
  const nomi = [...document.querySelectorAll('.mappa .settore-nome')].map((e) => [e.closest('[data-settore]').dataset.settore, e.getBoundingClientRect()]);
  const res = [];
  for (const t of document.querySelectorAll('.mappa [data-presenza]')) { const vis = t.querySelector('.pastiglia, span, svg')?.closest('span') ?? t.firstElementChild;
    for (const [id, n] of nomi) { const a = inter(t.getBoundingClientRect(), n), v = vis ? inter(vis.getBoundingClientRect(), n) : -1; if (a > 4 || v > 4) res.push(`${t.dataset.presenza} × nome ${id}: area di tocco ${a} px², parte visibile ${v} px²`); } }
  for (let i = 0; i < nomi.length; i++) for (let j = i + 1; j < nomi.length; j++) { const a = inter(nomi[i][1], nomi[j][1]); if (a > 0) res.push(`nome ${nomi[i][0]} × nome ${nomi[j][0]}: ${a} px²`); }
  return res; });
console.log(`${L}px: ${r.length ? r.join(' | ') : 'nessuna sovrapposizione'}`);
await p.screenshot({ path: process.env.FOTO ?? '/dev/null' }).catch(() => {}); await b.close(); srv.close();
