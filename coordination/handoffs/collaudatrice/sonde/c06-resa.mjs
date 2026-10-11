// Sonda C-06: correzioni R01-R07 e N01 della resa (C-04) e e02 dalla città, sulla build integrata.
// Uso: SPENTI=C05R01,… node coordination/handoffs/collaudatrice/sonde/c06-resa.mjs <radice con dist/ e node_modules> [larghezze]
// SPENTI accende gli interruttori rossi (globalThis.__NO_<nome>) con addInitScript, come VALMORA_ROSSI di tools/foto.mjs.
import { createServer } from 'node:http'; import { readFileSync, existsSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2]); const LARG = (process.argv[3] ?? '360,375,412').split(',').map(Number);
const SPENTI = (process.env.SPENTI ?? '').split(',').filter(Boolean);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const { attenta } = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
console.log(`interruttori rossi: ${SPENTI.join(',') || 'nessuno (verde)'}`);
const out = (id, larg, cosa, esito) => console.log(`${id} · ${larg}px · ${cosa} → ${esito}`);

async function pagina(larg, ridotto = true) {
  const p = await b.newPage({ viewport: { width: larg, height: 760 }, hasTouch: true, reducedMotion: ridotto ? 'reduce' : 'no-preference' });
  if (SPENTI.length) await p.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, SPENTI);
  const errori = []; p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text()); }); p.on('pageerror', (e) => errori.push(e.message));
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload(); p.errori = errori; return p;
}
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 8000 });
const quale = (p) => p.evaluate(() => document.querySelector('.scena')?.dataset.scena);
const salvato = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('valmora-salvataggio') ?? 'null'));
async function nuova(p, gen = 'm') { await p.getByRole('button', { name: 'Nuova partita' }).click(); await p.waitForTimeout(300);
  if ((await quale(p)) === 'conferma') await p.click('[data-azione="conferma-nuova"]'); await sc(p, 'genere'); await p.click(`[data-genere="${gen}"]`); await sc(p, 'citta'); }
async function allaPrimaOndata(p) { await p.click('[data-azione="avvia-episodio"]'); await sc(p, 'sala'); await p.click('[data-azione="avanti"]'); await sc(p, 'briefing');
  while (await p.locator('[data-azione="prossimo"]').count()) { await p.click('[data-azione="prossimo"]'); await p.waitForTimeout(60); } await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento'); }
const piano = (m, v) => { const g = attenta(creaCaso(1), dich); let s = M.iniziaMissione(m, v, dich); const ond = [];
  while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = []; for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); rs.push([c.id, o]); s = M.rispondi(m, s, c.id, o, dich); } ond.push({ d, rs }); s = M.chiudiOndata(m, s, dich); }
  return { ond, esito: M.concludiMissione(m, s, dich).esito.id }; };
async function schiera(p, d) { for (const [r, ps] of Object.entries(d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`); } }
async function ondata(p, o, controlli) {
  await schiera(p, o.d); if (controlli) await controlli('schieramento'); await p.click('[data-azione="conferma"]');
  for (const [, op] of o.rs) { await sc(p, 'chiamata'); if (controlli) await controlli('chiamata'); await p.click(`[data-opzione="${op}"]`); await p.waitForTimeout(250); if (await p.locator('[data-azione="continua"]').count()) await p.click('[data-azione="continua"]'); }
  await sc(p, 'chiusura'); await p.click('[data-azione="rapporto"]'); await sc(p, 'rapporto'); if (controlli) await controlli('rapporto');
}
// Misure di una schermata: R05 bersagli [data-presenza], R06 caratteri e distanza dei nomi dai bordi della mappa, R07 etichetta della testata, N01 righe del rapporto.
const misura = (p) => p.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
  const testi = [...document.querySelectorAll('main *')].filter((e) => vis(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  const font = Math.min(...testi.map((e) => parseFloat(getComputedStyle(e).fontSize)));
  const pres = [...document.querySelectorAll('[data-presenza]')].map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
  const mappa = document.querySelector('.mappa')?.getBoundingClientRect();
  const bordo = mappa ? Math.min(...[...document.querySelectorAll('.settore-nome')].filter(vis).map((e) => { const r = e.getBoundingClientRect(); return Math.min(r.left - mappa.left, mappa.right - r.right, r.top - mappa.top, mappa.bottom - r.bottom); })) : null;
  const et = document.querySelector('.testata-t small'); const lh = et ? parseFloat(getComputedStyle(et).lineHeight) || parseFloat(getComputedStyle(et).fontSize) * 1.3 : 0;
  const etichetta = et ? { righe: Math.round(et.getBoundingClientRect().height / lh), tagliata: et.scrollWidth > et.clientWidth + 1, testo: et.textContent } : null;
  const righe = [...document.querySelectorAll('[data-esito-settore]')].map((li) => { const a = li.querySelector('.riga-sx').getBoundingClientRect(); const s = li.querySelector('strong').getBoundingClientRect(); return { id: li.dataset.esitoSettore, stessa: Math.abs(a.top - s.top) < a.height }; });
  return { font, pres, bordo: bordo === null ? null : Math.round(bordo), etichetta, righe, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };
});

for (const larg of LARG) {
  // R01 · doppio tocco con movimento non ridotto, opzioni a schermo
  for (const ms of [null, 40, 150, 300]) {
    const p = await pagina(larg, false); await sc(p, 'titolo'); await nuova(p); await allaPrimaOndata(p); await p.click('[data-azione="conferma"]'); await sc(p, 'chiamata');
    await p.locator('[data-opzione="ferma"]').scrollIntoViewIfNeeded(); await p.waitForTimeout(1500);
    const a = await p.locator('[data-opzione="scorta"]').boundingBox(), c = await p.locator('[data-opzione="ferma"]').boundingBox();
    await p.mouse.click(a.x + a.width / 2, a.y + a.height / 2); if (ms !== null) { await p.waitForTimeout(ms); await p.mouse.click(c.x + c.width / 2, c.y + c.height / 2); }
    await p.waitForTimeout(1200); const s = await salvato(p);
    out('R01', larg, ms === null ? 'tocco singolo su «scorta»' : `«scorta» poi «ferma» dopo ${ms} ms`, `salvato ${JSON.stringify(s.in_corso.risposte)}, scelte ${s.in_corso.scelte.length}${p.errori.length ? ' · errori ' + p.errori.join('; ') : ''}`); await p.close();
  }
  // Partita completa e01 (attento) con misure a ogni scena, R04 ricarica sui rapporti, R03 verbale, poi R02 e e02 dalla città
  const p = await pagina(larg); await sc(p, 'titolo'); await nuova(p, larg === 375 ? 'f' : 'm');
  const S = { font: 99, pres: [], bordo: 99, etichette: new Set(), n01: new Set(), scorr: 0 };
  const controlli = async (nome) => { const x = await misura(p); S.font = Math.min(S.font, x.font); S.pres.push(...x.pres); if (x.bordo !== null) S.bordo = Math.min(S.bordo, x.bordo);
    if (x.etichetta && (x.etichetta.righe > 1 || x.etichetta.tagliata)) S.etichette.add(`${nome}: «${x.etichetta.testo}» righe ${x.etichetta.righe}${x.etichetta.tagliata ? ', tagliata' : ''}`);
    x.righe.filter((r) => !r.stessa).forEach((r) => S.n01.add(r.id)); if (x.sw > x.cw) S.scorr++; };
  const e01 = dati['missioni/e01.json']; const pl = piano(e01, (await salvato(p)).variabili); await allaPrimaOndata(p); const r04 = [];
  for (const [i, o] of pl.ond.entries()) { if (i) await sc(p, 'schieramento'); await ondata(p, o, controlli);
    if (i < pl.ond.length - 1) { await p.reload(); await sc(p, 'titolo'); await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForTimeout(700); r04.push(`ondata ${i + 1} → «${await quale(p)}»`); if ((await quale(p)) !== 'rapporto') continue; }
    await p.click('[data-azione="avanti"]'); }
  await sc(p, 'verbale'); const scelte = await p.locator('[data-scelta]').count(); const esito = await p.getAttribute('[data-esito]', 'data-esito');
  out('R04', larg, 'ricarica sui rapporti intermedi, poi «Riprendi»', r04.join(' · '));
  out('R03', larg, 'schede di scelta nel verbale', `${scelte} (esito resa «${esito}», motore «${pl.esito}»)`);
  out('R05', larg, 'bersagli [data-presenza] w×h minimi', S.pres.length ? `${Math.min(...S.pres.map((x) => x[0]))}×${Math.min(...S.pres.map((x) => x[1]))} su ${S.pres.length}` : 'nessuno misurato');
  out('R06', larg, 'carattere minimo; distanza minima dei nomi dai bordi della mappa', `${S.font}px; ${S.bordo}px`);
  out('R07', larg, 'etichette della testata su più righe o tagliate', S.etichette.size ? [...S.etichette].slice(0, 4).join(' | ') : 'nessuna');
  out('N01', larg, 'righe del rapporto con lo stato sotto il nome', S.n01.size ? [...S.n01].join(', ') : 'nessuna');
  out('—', larg, 'scorrimento orizzontale (schermate)', String(S.scorr));
  // e02 dalla città
  await p.click('[data-azione="citta"]'); await sc(p, 'citta');
  const ep = await p.evaluate(() => [...document.querySelectorAll('[data-episodio]')].map((e) => `${e.dataset.episodio}:${e.dataset.stato}`));
  const vs = (await salvato(p)).variabili; let e02r = 'non provata';
  if (ep.some((x) => x.startsWith('e02'))) {
    const pl2 = piano(dati['missioni/e02.json'], vs);
    try { const scelto = await p.locator('[data-azione="avvia-episodio"]').textContent(); await allaPrimaOndata(p);
      for (const [i, o] of pl2.ond.entries()) { if (i) await sc(p, 'schieramento'); await ondata(p, o, null); await p.click('[data-azione="avanti"]'); }
      await sc(p, 'verbale'); e02r = `pulsante «${scelto.trim()}» → verbale «${await p.getAttribute('[data-esito]', 'data-esito')}», motore «${pl2.esito}» (variabili da e01: credito ${vs.credito}, informatore ${vs.informatore_pagato})`;
    } catch (e) { e02r = `ERRORE ${e.message.split('\n')[0]} in «${await quale(p)}»`; } }
  out('E02', larg, `episodi in città ${JSON.stringify(ep)}`, e02r);
  // R02 · «Nuova partita» con una partita salvata
  await p.goto(URL); await sc(p, 'titolo'); const prima = JSON.stringify(await salvato(p)); await p.getByRole('button', { name: 'Nuova partita' }).click(); await p.waitForTimeout(400); const dove = await quale(p);
  let no = '-'; if (dove === 'conferma') { await p.getByRole('button', { name: /No/ }).click(); await p.waitForTimeout(300); no = `«No» → «${await quale(p)}», salvataggio ${JSON.stringify(await salvato(p)) === prima ? 'invariato' : 'CAMBIATO'}`; }
  out('R02', larg, '«Nuova partita» con partita salvata', `scena «${dove}»; ${no}`);
  out('—', larg, 'errori di console', p.errori.length ? p.errori.slice(0, 3).join('; ') : 'nessuno'); await p.close();
}
await b.close(); srv.close();
