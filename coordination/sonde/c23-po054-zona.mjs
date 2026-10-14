// Sonda C-023 (sola lettura): PO-054, zona di tocco della pastiglia [data-presenza] (griglia di punti 1 px su 61×61
// attorno al centro, elementFromPoint, come la sonda C20-06 di c21-c20.mjs) a 360/375/412, e01 ondata 1, 2 squadre su
// curva_cinderwick e 2 steward sulla stessa curva (due pastiglie affiancate). Uso: node coordination/sonde/c23-po054-zona.mjs <radice>
import { createServer } from 'node:http'; import { readFileSync, existsSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.');
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const M = await import(`${R}/src/logica/missione.ts`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const m = missioni.find((x) => x.id === 'e01'); const base = salvataggioTutti(missioni, v0);
for (const [w, h] of [[360, 760], [375, 667], [412, 915]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, reducedMotion: 'reduce' });
  await p.goto(`http://127.0.0.1:${srv.address().port}/`);
  await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify({ ...base, in_corso: M.iniziaMissione(m, { ...v0 }, dich) }));
  await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForSelector('.scena[data-scena="schieramento"]'); await p.waitForTimeout(300);
  for (const r of ['squadre', 'steward']) for (let k = 0; k < 2; k++) { await p.click(`[data-risorsa="${r}"]`); await p.click('[data-settore="curva_cinderwick"] .settore-punto'); }
  await p.waitForTimeout(200);
  for (const r of ['squadre', 'steward']) {
    const x = await p.evaluate((sel) => { const e = document.querySelector(sel); const q = e.getBoundingClientRect(), v = e.querySelector('.pastiglia').getBoundingClientRect(); const cx = q.left + q.width / 2, cy = q.top + q.height / 2;
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, n = 0;
      for (let dx = -30; dx <= 30; dx++) for (let dy = -30; dy <= 30; dy++) { const t = document.elementFromPoint(cx + dx, cy + dy); if (t && (t === e || e.contains(t))) { n++; x0 = Math.min(x0, dx); x1 = Math.max(x1, dx); y0 = Math.min(y0, dy); y1 = Math.max(y1, dy); } }
      return { pastiglia: `${Math.round(v.width)}×${Math.round(v.height)}`, zona: `${x1 - x0 + 1}×${y1 - y0 + 1}`, punti: n }; }, `[data-presenza="${r}@curva_cinderwick"]`);
    console.log(`${w} ${r}@curva_cinderwick: ${JSON.stringify(x)}`);
  }
  await p.close();
}
await b.close(); srv.close();
