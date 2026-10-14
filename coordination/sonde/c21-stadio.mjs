// C-021: foto ingrandite (2×) della mappa in sala per gli episodi in EP (default e15,e27,e09,e13,e23,e35), per vedere
// i colori di spalti e cortei. Legge anche data-colori-cortei e data-folla. Uso: node coordination/sonde/c21-stadio.mjs <radice> <foto>
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c21'; mkdirSync(DIR, { recursive: true });
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
await p.goto(`http://127.0.0.1:${srv.address().port}/`);
const base = salvataggioTutti(missioni, v0);
for (const id of (process.env.EP ?? 'e15,e27,e09,e13,e23,e35').split(',')) for (const n of (process.env.ONDATE ?? '1').split(',').map(Number)) {
  const m = missioni.find((x) => x.id === id); const g = B.attenta(creaCaso(1), dich);
  let s = M.iniziaMissione(m, { ...v0 }, dich);
  while (s.ondata < n) { s = M.schiera(m, s, g.schiera(m, s)); for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) s = M.rispondi(m, s, c.id, g.scegli(m, s, c), dich); s = M.chiudiOndata(m, s, dich); }
  await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify({ ...base, in_corso: s }));
  await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click();
  await p.waitForSelector('.scena[data-scena="schieramento"]'); await p.waitForSelector('.mappa[data-pronta="si"]').catch(() => {}); await p.waitForTimeout(600);
  const a = await p.evaluate(() => ({ colori: document.querySelector('.mappa').dataset.coloriCortei, folla: document.querySelector('.mappa').dataset.folla }));
  console.log(`${id} ondata ${n}: ${JSON.stringify(a)}`);
  await p.locator('.mappa').first().screenshot({ path: `${DIR}/412x2-${id}-o${n}-mappa.jpg`, type: 'jpeg', quality: 80 });
}
await b.close(); srv.close();
