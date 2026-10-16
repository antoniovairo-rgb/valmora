// Sonda C-028: C78V01 (vignetta della sala misurata dall'impaginazione e non dal riquadro scalato dalla molla d'entrata).
// Apre la sala dell'episodio EP a W×H, GIRI volte (ricarica completa ogni volta), e a ogni passo della sala, dopo 1500 ms,
// legge: altezza della vignetta a schermo e nello stile, se è nascosta, e quanto la pagina scorre in verticale
// (scrollHeight − innerHeight). ROSSI=… accende i bracci rossi. Uso:
// W=360 H=760 EP=e25 GIRI=5 [ROSSI=C78V01] node coordination/sonde/c28-c78v01.mjs <radice con dist/> <uscita.json>
import { createServer } from 'node:http'; import { readFileSync, existsSync, writeFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const OUT = process.argv[3] ?? 'c78v01.json';
const W = Number(process.env.W ?? 360), H = Number(process.env.H ?? 760), EP = process.env.EP ?? 'e25', GIRI = Number(process.env.GIRI ?? 5);
const ROSSI = (process.env.ROSSI ?? '').split(',').filter(Boolean);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
if (ROSSI.length) await p.addInitScript((r) => { for (const x of r) globalThis[`__NO_${x}`] = true; }, ROSSI);
const errori = []; p.on('pageerror', (e) => errori.push(e.message.slice(0, 120)));
const sc = (n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
const m = missioni.find((x) => x.id === EP); const RIS = [];
await p.goto(URL);
for (let g = 0; g < GIRI; g++) {
  await p.evaluate((v) => { localStorage.clear(); localStorage.setItem('valmora-salvataggio', v); }, JSON.stringify(salvataggioTutti(missioni, v0))); await p.reload(); await sc('titolo');
  await p.getByRole('button', { name: 'Riprendi' }).click(); await sc('citta'); await p.waitForTimeout(300);
  if (await p.locator(`[data-stagione="${m.stagione}"]`).count()) await p.click(`[data-stagione="${m.stagione}"]`);
  await p.click(`[data-episodio="${EP}"] .settore-punto`); await p.click('[data-azione="avvia-episodio"]'); await p.waitForTimeout(200);
  for (let k = 0; k < 3 && await p.locator('[data-azione="conferma-passo"]').count(); k++) await p.click('[data-azione="conferma-passo"]');
  if (await p.locator('[data-azione="conferma-rigioca"]').count()) await p.click('[data-azione="conferma-rigioca"]');
  await sc('sala');
  for (let k = 1; ; k++) {
    await p.waitForTimeout(1500);
    RIS.push({ giro: g + 1, passo: k, ...(await p.evaluate(() => { const v = [...document.querySelectorAll('svg.vignetta')].find((x) => !x.closest('.chiamata-corpo') && !x.closest('[data-figura-fonte]'));
      return { nascosta: v ? v.hasAttribute('data-nascosta') : null, schermo: v ? +v.getBoundingClientRect().height.toFixed(1) : null, stile: v ? v.style.height : null, scorre: document.documentElement.scrollHeight - innerHeight }; })) });
    if (!(await p.locator('[data-azione="passo"]').count())) break; await p.click('[data-azione="passo"]');
  }
}
await b.close(); srv.close(); writeFileSync(OUT, JSON.stringify({ W, H, EP, ROSSI, RIS, errori }));
const per = (f) => [...new Set(RIS.map(f))].join(' | ');
console.log(`${EP} ${W}×${H}${ROSSI.length ? ' rossi ' + ROSSI : ''}: misure ${RIS.length}; altezza a schermo ${per((r) => r.schermo)}; scorrimento verticale ${per((r) => r.scorre)}; nascoste ${RIS.filter((r) => r.nascosta).length}; errori ${errori.length}`);
for (const k of [...new Set(RIS.map((r) => r.passo))]) console.log(`  passo ${k}: altezze ${RIS.filter((r) => r.passo === k).map((r) => r.schermo).join(',')} · scorrimento ${RIS.filter((r) => r.passo === k).map((r) => r.scorre).join(',')}`);
