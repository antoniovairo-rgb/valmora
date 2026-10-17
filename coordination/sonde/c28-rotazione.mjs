// Sonda C-028 (sola lettura): ROTAZIONE e RIDIMENSIONAMENTO della finestra a partita in corso (PO-114).
// Gioca gli episodi EP col piano del bot attento (seme 1) partendo da 768×1024 col mouse e cambia la finestra in quattro punti:
//  A) schieramento a metà (bozza: metà delle unità del piano messe), B) chiamata aperta, C) risposta letta, D) rapporto;
// in ognuno passa per SEQ (tablet orizzontale, PC, telefono, PC grande, di nuovo tablet verticale). Dopo ogni cambio misura:
// scena e chiamata uguali a prima, pastiglie uguali, salvataggio (localStorage) uguale, scorrimento orizzontale, tela Pixi
// uguale alla mappa (±2 px), errori di console. Alla fine ricarica la pagina, «Riprendi», e verifica la stessa chiamata.
// Uso: EP=e01,e19 node coordination/sonde/c28-rotazione.mjs <radice con dist/> <foto> <uscita.json>
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c28'; const OUT = process.argv[4] ?? 'c28-rotazione.json';
mkdirSync(DIR, { recursive: true });
const SEQ = [[1024, 768], [1366, 768], [360, 760], [1920, 1080], [768, 1024]];
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(R, 'data'));
const EP = (process.env.EP ?? 'e01').split(',');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
const piano = (m) => { const g = B.attenta(creaCaso(1), dich); let s = M.iniziaMissione(m, v0, dich); const ond = [];
  while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = []; for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); rs.push([c.id, o]); s = M.rispondi(m, s, c.id, o, dich); } ond.push({ d, rs }); s = M.chiudiOndata(m, s, dich); }
  return ond; };
const p = await b.newPage({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
const errori = []; let dove = 'avvio'; p.on('console', (x) => { if (x.type() === 'error') errori.push(`${dove}: ${x.text().slice(0, 160)}`); }); p.on('pageerror', (e) => errori.push(`${dove}: ${e.message.slice(0, 160)}`));
const stato = () => p.evaluate(() => {
  const mp = document.querySelector('.mappa'); const cv = mp?.querySelector('canvas'); const mr = mp?.getBoundingClientRect(); const cr = cv?.getBoundingClientRect();
  return { scena: document.querySelector('.scena')?.dataset.scena, chiamata: document.querySelector('[data-messaggio^="chiamata-"]')?.dataset.messaggio ?? null,
    pastiglie: [...document.querySelectorAll('[data-presenza]')].map((e) => `${e.dataset.presenza}:${e.textContent.replace(/\D/g, '')}`).sort().join(','),
    salvataggio: localStorage.getItem('valmora-salvataggio'), oriz: document.documentElement.scrollWidth - innerWidth,
    mappa: mr ? `${mr.width.toFixed(0)}×${mr.height.toFixed(0)}` : null, tela: cr ? `${cr.width.toFixed(0)}×${cr.height.toFixed(0)}` : null,
    telaOk: mr && cr ? Math.abs(mr.width - 6 - cr.width) <= 2 && Math.abs(mr.height - 6 - cr.height) <= 2 : null };
});
const RIS = [];
async function gira(ep, punto) {
  const prima = await stato(); await p.screenshot({ path: `${DIR}/rotazione-${ep}-${punto}-768x1024-prima.png` });
  for (const [w, h] of SEQ) { dove = `${ep} ${punto} ${w}×${h}`; await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(700);
    const s = await stato(); const r = { ep, punto, finestra: `${w}×${h}`, scena: s.scena === prima.scena, chiamata: s.chiamata === prima.chiamata, pastiglie: s.pastiglie === prima.pastiglie, salvataggio: s.salvataggio === prima.salvataggio, oriz: s.oriz, mappa: s.mappa, tela: s.tela, telaOk: s.telaOk, prima: { mappa: prima.mappa, tela: prima.tela } };
    RIS.push(r); if (w !== 768) await p.screenshot({ path: `${DIR}/rotazione-${ep}-${punto}-${w}x${h}-dopo.png` }); }
}
await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload(); await sc(p, 'titolo'); await p.waitForTimeout(300);
const FINE = [];
for (const ep of EP) {
  const m = missioni.find((x) => x.id === ep); const ond = piano(m);
  try {
    await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(salvataggioTutti(missioni, v0))); await p.reload(); await sc(p, 'titolo');
    await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta'); await p.waitForTimeout(300);
    if (await p.locator(`[data-stagione="${m.stagione}"]`).count()) await p.click(`[data-stagione="${m.stagione}"]`);
    await p.click(`[data-episodio="${ep}"] .settore-punto`); await p.waitForTimeout(300); await p.click('[data-azione="avvia-episodio"]'); await p.waitForTimeout(200);
    for (let k = 0; k < 3 && await p.locator('[data-azione="conferma-passo"]').count(); k++) { await p.click('[data-azione="conferma-passo"]'); await p.waitForTimeout(150); }
    if (await p.locator('[data-azione="conferma-rigioca"]').count()) await p.click('[data-azione="conferma-rigioca"]');
    await sc(p, 'sala'); while (await p.locator('[data-azione="passo"]').count()) { await p.click('[data-azione="passo"]'); await p.waitForTimeout(100); }
    await p.click('[data-azione="avanti"]'); await sc(p, 'briefing'); while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) { await p.click('[data-azione="prossimo"], [data-azione="passo"]'); await p.waitForTimeout(100); }
    await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento');
    for (const [i, o] of ond.entries()) {
      if (i) await sc(p, 'schieramento'); await p.waitForTimeout(200);
      const mosse = Object.entries(o.d).flatMap(([r, ps]) => Object.entries(ps).flatMap(([s, q]) => Array(q).fill([r, s])));
      for (const [k, [r, s]] of mosse.entries()) {
        if (i === 0 && k === Math.floor(mosse.length / 2)) await gira(ep, 'A-schieramento');
        if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`);
      }
      await p.click('[data-azione="conferma"]'); if (await p.locator('[data-azione="conferma-davvero"]').count()) await p.click('[data-azione="conferma-davvero"]');
      for (const [j, [cid, op]] of o.rs.entries()) {
        await sc(p, 'chiamata'); await p.waitForTimeout(250);
        if (i === 0 && j === 1) { await gira(ep, 'B-chiamata'); dove = `${ep} ricarica`; await p.reload(); await sc(p, 'titolo'); await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'chiamata'); await p.waitForTimeout(250);
          FINE.push({ ep, prova: 'ricarica dopo i cambi di finestra → Riprendi', chiamata: await p.evaluate(() => document.querySelector('[data-messaggio^="chiamata-"]')?.dataset.messaggio ?? null), attesa: `chiamata-${cid}` }); }
        await p.click(`[data-opzione="${op}"]`); await p.waitForSelector('[data-azione="continua"]', { timeout: 5000 }).catch(() => {}); await p.waitForTimeout(150);
        if (i === 0 && j === 0 && await p.locator('[data-azione="continua"]').count()) await gira(ep, 'C-risposta');
        if (await p.locator('[data-azione="continua"]').count()) await p.click('[data-azione="continua"]');
      }
      await sc(p, 'chiusura'); await p.click('[data-azione="rapporto"]'); await sc(p, 'rapporto'); await p.waitForTimeout(200);
      if (i === 0) await gira(ep, 'D-rapporto');
      await p.click('[data-azione="avanti"]');
    }
    await sc(p, 'verbale'); FINE.push({ ep, prova: 'episodio finito dopo i cambi di finestra', ok: true }); console.log(`${ep}: finito`);
  } catch (e) { FINE.push({ ep, prova: 'episodio finito dopo i cambi di finestra', ok: false, errore: e.message.slice(0, 200) }); await p.screenshot({ path: `${DIR}/rotazione-${ep}-blocco.png` }); console.log(`${ep}: BLOCCO ${e.message.slice(0, 160)}`); }
}
await b.close(); srv.close();
writeFileSync(OUT, JSON.stringify({ RIS, FINE, errori }, null, 1));
console.log(`cambi ${RIS.length}: scena diversa ${RIS.filter((r) => !r.scena).length}, chiamata diversa ${RIS.filter((r) => !r.chiamata).length}, pastiglie diverse ${RIS.filter((r) => !r.pastiglie).length}, salvataggio diverso ${RIS.filter((r) => !r.salvataggio).length}, scorrimento orizzontale ${RIS.filter((r) => r.oriz > 0).length}, tela ≠ mappa ${RIS.filter((r) => r.telaOk === false).length}`);
console.log(FINE.map((x) => JSON.stringify(x)).join('\n')); console.log(`errori ${errori.length}${errori.length ? '\n  ' + errori.slice(0, 8).join('\n  ') : ''}`);
