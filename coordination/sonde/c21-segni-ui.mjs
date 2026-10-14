// C-021: C20-07 nell'interfaccia. Chiamate in CASI (episodio:chiamata:opzione) aperte con lo stato in cui compaiono per
// prime; si scorre a fondo pagina, si tocca l'opzione, e si misura se i segni [data-segno] sono dentro la finestra e
// che simbolo mostrano. Uso: node coordination/sonde/c21-segni-ui.mjs <radice> · ROSSO=C44E04,C44E03
import { createServer } from 'node:http'; import { readFileSync, existsSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const ROSSI = process.env.ROSSO?.split(',').filter(Boolean) ?? [];
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(R, 'data'));
const CASI = (process.env.CASI ?? 'e06:saluto_cantante:saluti_tutti,e01:rinforzi:chiedi,e02:risultato:prima_ospiti,e01:corteo_partito:scorta').split(',').map((x) => x.split(':'));
const stato = (id, cid) => { const m = missioni.find((x) => x.id === id);
  for (let k = 1; k < 500; k++) { const g = B.casuale(creaCaso(k), dich); let s = M.iniziaMissione(m, { ...v0 }, dich);
    while (!M.missioneFinita(m, s)) { s = M.schiera(m, s, g.schiera(m, s)); for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { if (c.id === cid) return s; s = M.rispondi(m, s, c.id, g.scegli(m, s, c), dich); } s = M.chiudiOndata(m, s, dich); } } };
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const base = salvataggioTutti(missioni, v0); let errori = 0;
for (const [w, h] of [[360, 760], [375, 667], [412, 915]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, reducedMotion: 'reduce' });
  if (ROSSI.length) await p.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, ROSSI);
  p.on('pageerror', () => errori++); p.on('console', (x) => { if (x.type() === 'error') errori++; });
  await p.goto(`http://127.0.0.1:${srv.address().port}/`);
  for (const [id, cid, oid] of CASI) {
    const s = stato(id, cid); if (!s) { console.log(`${w} ${id}:${cid} mai aperta`); continue; }
    await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify({ ...base, in_corso: s }));
    await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForSelector('.scena[data-scena="chiamata"]'); await p.waitForTimeout(400);
    if (await p.locator('[data-azione="rispondi"]').count()) await p.click('[data-azione="rispondi"]').catch(() => {});
    const op = p.locator(`[data-opzione="${oid}"]`); if (!(await op.count())) { console.log(`${w} ${id}:${cid}/${oid} opzione non offerta`); continue; }
    await p.evaluate(() => scrollTo(0, document.scrollingElement.scrollHeight)); await p.waitForTimeout(200);
    await op.click(); await p.waitForTimeout(300);
    const x = await p.evaluate(() => [...document.querySelectorAll('[data-segno]')].map((e) => { const r = e.getBoundingClientRect(); return `${e.dataset.segno}«${e.textContent}»${r.bottom > 0 && r.top < innerHeight ? '' : ' FUORI'}`; }));
    console.log(`${w} ${id}:${cid}/${oid}: ${x.join(' ') || 'nessun segno'}`);
  }
  await p.close();
}
console.log(`errori di console ${errori}`); await b.close(); srv.close();
