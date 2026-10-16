// Sonda C-030 (sola lettura): C29-01 su sala E verbale. Gioca dall'interfaccia l'episodio EP col piano del bot (attento, seme 1)
// fino alla scena SCENA (sala | verbale); lì, per ogni W×H della griglia (setViewportSize, ATTESA ms, 30 frame), conta i cambi
// di stato della vignetta (mostrata/nascosta o altezza) e dei pulsanti «passo»/«avanti» (y). ORDINE=giu percorre la griglia al
// contrario (per vedere se lo stato dipende dalla finestra precedente). NUOVA=1: per ogni finestra una pagina nuova aperta già a
// quella misura (niente ridimensionamento; lento: rigioca l'episodio ogni volta). ROSSI=… accende i bracci rossi.
// Uso: EP=e01 SCENA=verbale [LARG=…] [ALT=…] [ORDINE=giu] [NUOVA=1] [ROSSI=…] node coordination/sonde/c30-vignette.mjs <radice> <uscita.json>
import { createServer } from 'node:http'; import { readFileSync, existsSync, writeFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const OUT = process.argv[3] ?? 'vignette.json'; const EP = process.env.EP ?? 'e01'; const SCENA = process.env.SCENA ?? 'verbale';
let LARG = (process.env.LARG ?? '320,340,360,375,384,393,400,412,428,480,600,768,800,1024,1280,1366,1440,1920').split(',').map(Number);
let ALT = (process.env.ALT ?? '568,600,640,667,680,700,720,731,740,750,760,780,800,820,844,860,880,900,915,960,1024,1080').split(',').map(Number);
const ATTESA = Number(process.env.ATTESA ?? 600); const FRAME = Number(process.env.FRAME ?? 30); const NUOVA = process.env.NUOVA === '1';
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 20000 });
const ROSSI = (process.env.ROSSI ?? '').split(',').filter(Boolean); const m = missioni.find((x) => x.id === EP);
const piano = () => { const g = B.STRATEGIE.attenta(creaCaso(1), dich); let s = M.iniziaMissione(m, v0, dich); const ond = [];
  while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = []; for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); rs.push([c.id, o]); s = M.rispondi(m, s, c.id, o, dich); } ond.push({ d, rs }); s = M.chiudiOndata(m, s, dich); }
  return ond; };
const PIANO = piano(); const errori = [];
async function schiera(p, d) { for (const [r, ps] of Object.entries(d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`); } }
async function arriva(W, H) {
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, reducedMotion: 'reduce' });
  p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text().slice(0, 160)); }); p.on('pageerror', (e) => errori.push(e.message.slice(0, 160)));
  if (ROSSI.length) await p.addInitScript((r) => { for (const x of r) globalThis[`__NO_${x}`] = true; }, ROSSI);
  await p.goto(URL); await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(salvataggioTutti(missioni, v0))); await p.reload(); await sc(p, 'titolo');
  await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta'); await p.waitForTimeout(300);
  if (await p.locator(`[data-stagione="${m.stagione}"]`).count()) await p.click(`[data-stagione="${m.stagione}"]`);
  await p.click(`[data-episodio="${EP}"] .settore-punto`); await p.waitForTimeout(300); await p.click('[data-azione="avvia-episodio"]'); await p.waitForTimeout(200);
  for (let k = 0; k < 3 && await p.locator('[data-azione="conferma-passo"]').count(); k++) { await p.click('[data-azione="conferma-passo"]'); await p.waitForTimeout(150); }
  if (await p.locator('[data-azione="conferma-rigioca"]').count()) await p.click('[data-azione="conferma-rigioca"]');
  await sc(p, 'sala'); await p.waitForTimeout(500); if (SCENA === 'sala') return p;
  // la sala trema in certe finestre: i clic si fanno a 360×760 e si torna alla misura voluta solo in verbale
  if (W !== 360 || H !== 760) await p.setViewportSize({ width: 360, height: 760 });
  while (await p.locator('[data-azione="passo"]').count()) { await p.click('[data-azione="passo"]'); await p.waitForTimeout(80); }
  await p.click('[data-azione="avanti"]'); await sc(p, 'briefing'); await p.waitForTimeout(200);
  while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) { await p.click('[data-azione="prossimo"], [data-azione="passo"]'); await p.waitForTimeout(80); }
  await p.click('[data-azione="inizia"]');
  for (const [i, o] of PIANO.entries()) { await sc(p, 'schieramento'); await p.waitForTimeout(150); await schiera(p, o.d);
    await p.click('[data-azione="conferma"]'); if (await p.locator('[data-azione="conferma-davvero"]').count()) await p.click('[data-azione="conferma-davvero"]');
    for (const [, op] of o.rs) { await sc(p, 'chiamata'); await p.waitForTimeout(150); await p.click(`[data-opzione="${op}"]`); await p.waitForSelector('[data-azione="continua"]', { timeout: 5000 }).catch(() => {}); await p.waitForTimeout(100); if (await p.locator('[data-azione="continua"]').count()) await p.click('[data-azione="continua"]'); }
    await sc(p, 'chiusura'); await p.click('[data-azione="rapporto"]'); await sc(p, 'rapporto'); await p.waitForTimeout(150); await p.click('[data-azione="avanti"]'); }
  await sc(p, 'verbale'); await p.waitForTimeout(500);
  if (W !== 360 || H !== 760) { await p.setViewportSize({ width: W, height: H }); await p.waitForTimeout(ATTESA); }
  return p; }
const pre = SCENA === 'sala' ? 'apertura' : 'esito';
const leggi = (p) => p.evaluate(([pre, FRAME]) => new Promise((ok) => { const s = []; let n = 0; const f = () => { const g = document.querySelector(`svg.vignetta[data-vignetta^="${pre}"]`); const bt = document.querySelector('[data-azione="passo"], [data-azione="avanti"], [data-azione="prossimo-episodio"]');
  s.push({ v: g ? (g.hasAttribute('data-nascosta') ? 0 : Math.round(g.getBoundingClientRect().height)) : -1, y: bt ? Math.round(bt.getBoundingClientRect().top) : null, pag: document.documentElement.scrollHeight }); if (++n < FRAME) requestAnimationFrame(f); else ok(s); }; requestAnimationFrame(f); }), [pre, FRAME]);
const RIS = []; const griglia = []; for (const W of LARG) for (const H of ALT) griglia.push([W, H]); if (process.env.ORDINE === 'giu') griglia.reverse();
let p = NUOVA ? null : await arriva(360, 760);
for (const [W, H] of griglia) {
  if (NUOVA) { p = await arriva(W, H); await p.waitForTimeout(ATTESA); } else { await p.setViewportSize({ width: W, height: H }); await p.waitForTimeout(ATTESA); }
  const s = await leggi(p); const cv = s.filter((x, i) => i && x.v !== s[i - 1].v).length, cy = s.filter((x, i) => i && x.y !== s[i - 1].y).length;
  RIS.push({ W, H, cambiVignetta: cv, cambiPulsante: cy, stati: [...new Set(s.map((x) => x.v))], seq: s.map((x) => `${x.v}@${x.y}`).filter((x, i, a) => !i || x !== a[i - 1]), pagina: [...new Set(s.map((x) => x.pag))] });
  if (NUOVA) await p.close(); }
await b.close(); srv.close();
const trema = RIS.filter((r) => r.cambiVignetta || r.cambiPulsante);
console.log(`${EP} ${SCENA}${ROSSI.length ? ' rosso ' + ROSSI : ''}${NUOVA ? ' pagina nuova' : ''}${process.env.ORDINE === 'giu' ? ' ordine giù' : ''}: finestre ${RIS.length}, con cambi ${trema.length}${trema.length ? ': ' + trema.map((r) => `${r.W}×${r.H}(${r.cambiVignetta}/${r.cambiPulsante})`).join(' ') : ''}; mostrata ${RIS.filter((r) => r.stati.length === 1 && r.stati[0] > 0).length}, nascosta ${RIS.filter((r) => r.stati.length === 1 && r.stati[0] === 0).length}; errori console ${errori.length}`);
writeFileSync(OUT, JSON.stringify({ EP, SCENA, ROSSI, NUOVA, RIS, errori }));
