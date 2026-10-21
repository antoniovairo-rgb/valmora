// C42-01 (D-185): foto della chiamata con costo in unità dell'ultima ondata di e02 (ondata 4),
// a 360/375/412; ROSSI=C183Q01,C183P01 per il prima. Uso: node c41-foto.mjs <repo> <cartella>
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3]; mkdirSync(DIR, { recursive: true });
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const { salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`);
const { variabiliIniziali } = await import(`${R}/src/logica/condizioni.ts`);
const M = await import(`${R}/src/logica/missione.ts`);
const { attenta } = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const dati = leggiDati(join(R, 'data')), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), v0 = variabiliIniziali(dich.values());
const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x), m = missioni.find((x) => x.id === 'e02');
const g = attenta(creaCaso(1), dich); let s = M.iniziaMissione(m, v0, dich);
while (s.ondata < m.ondate.length) { s = M.schiera(m, s, g.schiera(m, s)); for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) s = M.rispondi(m, s, c.id, g.scegli(m, s, c), dich); s = M.chiudiOndata(m, s, dich); }
const prima = s; let dopo = M.schiera(m, s, g.schiera(m, s));
for (let c = M.chiamateAperte(m, dopo)[0]; c && !c.opzioni.some((o) => o.effetti.some((e) => 'riserva' in e && e.valore < 0)); c = M.chiamateAperte(m, dopo)[0]) dopo = M.rispondi(m, dopo, c.id, g.scegli(m, dopo, c), dich);
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const url = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const rossi = (process.env.ROSSI ?? '').split(',').filter(Boolean);
for (const [w, h] of [[360, 760], [375, 812], [412, 915]]) for (const [nome, st] of [['ultima-ondata-chiamata', dopo]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  if (rossi.length) await p.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, rossi);
  await p.goto(url); await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify({ ...salvataggioTutti(missioni, v0), in_corso: st })); await p.reload();
  await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForTimeout(1500);
  const info = await p.evaluate(() => ({ quando: [...document.querySelectorAll('[data-quando]')].map((x) => x.textContent), nota: document.querySelector('[data-nota-unita]')?.textContent ?? null, alta: document.documentElement.scrollHeight }));
  console.log(`${w} ${nome}: ${JSON.stringify(info)}`);
  await p.screenshot({ path: join(DIR, `${nome}-${w}.png`) }); await p.close();
}
await b.close(); srv.close();
