// Foto a mano delle mappe senza stadio (S-09), con e senza ripiego (rosso C14M01), da dist/ già costruita.
// Uso: node tools/foto-mappe.mjs <cartella> [ROSSO]
import { createServer } from 'node:http';
import { readFileSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from 'playwright-core';
import { missioniDai, salvataggioTutti, apriDallaCitta } from './foto-bozze.mjs';
const [out, rosso] = process.argv.slice(2); mkdirSync(out, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const dir = 'dist';
const srv = createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const p = join(dir, u === '/' ? 'index.html' : u); try { r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); } catch { r.writeHead(404); r.end(); } });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const pg = await b.newPage({ viewport: { width: 360, height: 760 }, reducedMotion: 'reduce' });
if (rosso) await pg.addInitScript((x) => { globalThis[`__NO_${x}`] = true; }, rosso);
const { missioni, v0 } = missioniDai('data');
await pg.goto(`http://127.0.0.1:${srv.address().port}/`);
for (const id of ['e11', 'e17', 'e30', 'e35']) {
  const m = missioni.find((x) => x.id === id);
  await pg.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(salvataggioTutti(missioni, v0)));
  await pg.reload(); await pg.getByRole('button', { name: 'Riprendi' }).click(); await pg.waitForSelector('[data-scena="citta"]');
  await apriDallaCitta(pg, m, () => {});
  await pg.waitForSelector('[data-scena="sala"]'); await pg.waitForSelector('.mappa[data-pronta="si"]'); await pg.waitForTimeout(400);
  await pg.locator('.mappa').screenshot({ path: join(out, `360-${id}-mappa.png`) });
}
await b.close(); srv.close();
