// Sonda C-023 (sola lettura): PO-103, vignetta della chiamata ingrandita. Per ogni chiamata di LISTA apre la chiamata
// (412×915, scala 3) e fotografa il solo SVG [data-vignetta^="chiamata-"]; conta nel DOM le figure [data-figura]
// (omino = testa e busto, pallino = persona piatta) e gli elementi con le braccia degli omini (path «M-7 4 L-11 -10»).
// Uso: node coordination/sonde/c23-vignette.mjs <radice> <foto> · env LISTA=e09:pullman_fermi,... ROSSO=C48P01
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c23'; mkdirSync(DIR, { recursive: true });
const ROSSI = process.env.ROSSO?.split(',').filter(Boolean) ?? []; const suff = ROSSI.length ? '-rosso' : '';
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(R, 'data'));
const LISTA = (process.env.LISTA ?? 'e09:pullman_fermi,e34:commissione_schieramento,e15:mille,e18:telefonata').split(',');
const stati = new Map();
for (const k of LISTA) {
  const [id, cid] = k.split(':'); const m = missioni.find((x) => x.id === id);
  cerca: for (const [, st] of Object.entries(B.STRATEGIE)) for (let seme = 1; seme <= 40; seme++) {
    const g = st(creaCaso(seme * 7919 + m.episodio), dich); let s = M.iniziaMissione(m, { ...v0 }, dich), passi = 0;
    while (!M.missioneFinita(m, s) && passi++ < 400) {
      s = M.schiera(m, s, g.schiera(m, s));
      for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { if (c.id === cid) { stati.set(k, s); break cerca; } s = M.rispondi(m, s, c.id, g.scegli(m, s, c), dich); }
      s = M.chiudiOndata(m, s, dich);
    }
  }
}
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errori = [];
const p = await b.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 3, reducedMotion: 'reduce' });
if (ROSSI.length) await p.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, ROSSI);
p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text().slice(0, 160)); }); p.on('pageerror', (e) => errori.push(e.message.slice(0, 160)));
await p.goto(`http://127.0.0.1:${srv.address().port}/`);
const base = salvataggioTutti(missioni, v0);
for (const [k, s] of stati) {
  await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify({ ...base, in_corso: s }));
  await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click();
  await p.waitForSelector('.scena[data-scena="chiamata"] [data-vignetta^="chiamata-"]'); await p.waitForTimeout(400);
  const v = await p.evaluate(() => { const vg = document.querySelector('.scena [data-vignetta^="chiamata-"]');
    return { evento: vg.dataset.evento, omini: vg.querySelectorAll('[data-figura="omino"]').length, pallini: vg.querySelectorAll('[data-figura="pallino"]').length, braccia: [...vg.querySelectorAll('path')].filter((x) => (x.getAttribute('d') ?? '').startsWith('M-7 4 L-11 -10')).length }; });
  console.log(`${k}: ${JSON.stringify(v)} · testimone=${s.variabili?.testimone}`);
  await p.locator('.scena [data-vignetta^="chiamata-"]').first().screenshot({ path: `${DIR}/vignetta-${k.replace(':', '-')}${suff}.png` });
}
console.log(`trovate ${stati.size}/${LISTA.length}; errori di console ${errori.length}`);
await b.close(); srv.close();
