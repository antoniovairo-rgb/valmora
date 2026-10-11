// Sonda C-11: città per stagioni (PO-044), correzioni C09-02/03/04, abbozzi con ?bozze=1 (D-090). Solo lettura.
// Uso: SPENTI=C13M01 node coordination/handoffs/collaudatrice/sonde/c11-citta.mjs <radice con dist/ e node_modules> <cartella foto> [larghezze] [episodi abbozzo]
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2]); const FOTO = resolve(process.argv[3]); const LARG = (process.argv[4] ?? '360,375,412').split(',').map(Number);
const ABBOZZI = (process.argv[5] ?? 'e04,e13,e25,e36').split(',').filter(Boolean); mkdirSync(FOTO, { recursive: true });
const SPENTI = (process.env.SPENTI ?? '').split(',').filter(Boolean);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { variabiliIniziali } = await import(`${R}/src/logica/condizioni.ts`); const E = await import(`${R}/src/logica/episodi.ts`); const { SAVE_VERSION } = await import(`${R}/src/salvataggi/salvataggio.ts`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m).sort((a, b) => a.episodio - b.episodio);
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const BASE = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const out = (id, larg, cosa, esito) => console.log(`${id} · ${larg}px · ${cosa} → ${esito}`);
console.log(`interruttori rossi: ${SPENTI.join(',') || 'nessuno'}`);
async function pagina(larg, url, sal) {
  const p = await b.newPage({ viewport: { width: larg, height: 760 }, hasTouch: true, reducedMotion: 'reduce' });
  if (SPENTI.length) await p.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, SPENTI);
  p.errori = []; p.on('pageerror', (e) => p.errori.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') p.errori.push(m.text()); });
  await p.goto(url); await p.evaluate((s) => { localStorage.clear(); if (s) localStorage.setItem('valmora-salvataggio', JSON.stringify(s)); }, sal ?? null); await p.reload(); return p;
}
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 10000 });
const quale = (p) => p.evaluate(() => document.querySelector('.scena')?.dataset.scena);
// Salvataggio con gli episodi prima di `fino` superati dal giocatore equilibrato (variabili vere, registro vero).
function salvataggioFino(fino) {
  let v = variabiliIniziali(dich.values()); let reg = {}; const concluse = [];
  for (const m of missioni) { if (m.episodio >= fino) break; const prima = v; const r = M.giocaMissione(m, v, dich, B.equilibrata(creaCaso(1), dich)); const ris = E.valutaEpisodio(m, r);
    if (ris.fallita) throw new Error(`${m.id}: l'equilibrato fallisce`); reg = E.registra(reg, m.id, prima, ris, r.variabili).registro; v = r.variabili; concluse.push(m.id); }
  return { save_version: SAVE_VERSION, game_version: 'collaudo', seme: 1, caso: 1, variabili: v, missioni_concluse: concluse, episodi: reg, genere: 'm', rapporto_aperto: null, in_corso: null };
}
const misuraCitta = (p) => p.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none'; };
  const inter = (a, c) => Math.max(0, Math.min(a.right, c.right) - Math.max(a.left, c.left)) * Math.max(0, Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top));
  const punti = [...document.querySelectorAll('[data-episodio]')].map((e) => ({ id: e.dataset.episodio, stato: e.dataset.stato, p: e.querySelector('.settore-punto').getBoundingClientRect(), n: [...e.querySelectorAll('.settore-nome')].filter(vis).map((x) => x.getBoundingClientRect())[0] }));
  const cop = [];
  for (const a of punti) for (const c of punti) { if (a.id < c.id && inter(a.p, c.p) > 4) cop.push(`punto ${a.id} × punto ${c.id} (${Math.round(inter(a.p, c.p))} px²)`);
    if (a.n && a.id !== c.id && inter(a.n, c.p) > 4) cop.push(`nome ${a.id} × punto ${c.id} (${Math.round(inter(a.n, c.p))} px²)`); }
  const m = document.querySelector('.mappa')?.getBoundingClientRect();
  const fuori = m ? punti.filter((x) => x.p.left < m.left - 1 || x.p.right > m.right + 1 || x.p.top < m.top - 1 || x.p.bottom > m.bottom + 1).map((x) => x.id) : [];
  return { ids: punti.map((x) => `${x.id}:${x.stato}`), nomi: punti.filter((x) => x.n).map((x) => x.id), cop, fuori, stagioni: [...document.querySelectorAll('[data-stagione]')].map((e) => `${e.dataset.stagione}${e.getAttribute('aria-pressed') === 'true' ? '*' : ''}`), sw: document.documentElement.scrollWidth > document.documentElement.clientWidth };
});
const piano = (m, v) => { const g = B.attenta(creaCaso(1), dich); let s = M.iniziaMissione(m, v, dich); const ond = [];
  while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = []; for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); rs.push([c.id, o]); s = M.rispondi(m, s, c.id, o, dich); } ond.push({ d, rs }); s = M.chiudiOndata(m, s, dich); }
  return { ond, esito: M.concludiMissione(m, s, dich).esito.id }; };
// Azione principale visibile senza scorrere (C09-03): pulsante non secondario o indicatore delle opzioni, dentro la finestra.
const piega = (p) => p.evaluate(() => { const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
  const dentro = (e) => { const r = e.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight + 1; };
  const cand = [...document.querySelectorAll('.scena .pulsante:not(.secondario), .scena [data-indicatore="opzioni"], .scena .opzione')].filter(vis);
  return { ok: cand.some(dentro), scrollY: scrollY, nomi: cand.slice(0, 3).map((e) => (e.textContent || e.className).trim().slice(0, 30)) }; });
async function gioca(p, m, v, larg, misura) {
  const pl = piano(m, v); const rilievi = [];
  const controlla = async (nome) => { if (!misura) return; const x = await piega(p); if (!x.ok) rilievi.push(`${nome}: azione principale fuori finestra (${x.nomi.join(' / ')})`); };
  await sc(p, 'sala'); await controlla('sala'); await p.click('[data-azione="avanti"]'); await sc(p, 'briefing'); await controlla('briefing');
  while (await p.locator('[data-azione="prossimo"]').count()) { await p.click('[data-azione="prossimo"]'); await p.waitForTimeout(60); }
  await controlla('briefing-fine'); await p.click('[data-azione="inizia"]');
  const scoperti = [];
  for (const [i, o] of pl.ond.entries()) {
    await sc(p, 'schieramento');
    for (const [r, ps] of Object.entries(o.d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`); }
    await controlla(`schieramento ${i + 1}`); await p.click('[data-azione="conferma"]');
    for (const [, op] of o.rs) { await sc(p, 'chiamata'); await controlla(`chiamata ${i + 1}`); await p.locator(`[data-opzione="${op}"]`).scrollIntoViewIfNeeded(); await p.click(`[data-opzione="${op}"]`); await p.waitForTimeout(200);
      if ((await quale(p)) === 'risposta') { await controlla('risposta'); await p.click('[data-azione="continua"]'); } await p.evaluate(() => scrollTo(0, 0)); }
    await sc(p, 'chiusura'); await controlla('chiusura'); await p.click('[data-azione="rapporto"]'); await sc(p, 'rapporto'); await controlla(`rapporto ${i + 1}`);
    scoperti.push(...await p.evaluate(() => [...document.querySelectorAll('[data-esito-settore]')].filter((li) => li.querySelector('strong').textContent.includes('scoperto') && !li.querySelector('strong').textContent.includes('sotto')).map((li) => ({ s: li.dataset.esitoSettore, liv: Number((li.querySelector('.campione')?.className.match(/liv-(\d)/) ?? [])[1]), mappa: Number((document.querySelector(`.mappa [data-settore="${li.dataset.esitoSettore}"]`)?.className.match(/liv-(\d)/) ?? [])[1]) }))));
    await p.click('[data-azione="avanti"]'); await p.evaluate(() => scrollTo(0, 0));
  }
  await sc(p, 'verbale'); return { esito: await p.getAttribute('[data-esito]', 'data-esito'), atteso: pl.esito, rilievi, scoperti };
}

for (const larg of LARG) {
  // (1)+(3) città senza e con ?bozze=1
  { const p = await pagina(larg, BASE); await sc(p, 'titolo'); await p.click('text=Nuova partita'); await sc(p, 'genere'); await p.click('[data-genere="m"]'); await sc(p, 'citta');
    const x = await misuraCitta(p); out('CITTA', larg, 'senza ?bozze=1', `episodi ${JSON.stringify(x.ids)}; pulsanti stagione ${JSON.stringify(x.stagioni)}; nomi visibili ${JSON.stringify(x.nomi)}; sovrapposizioni ${x.cop.length ? x.cop.join('; ') : 'nessuna'}`);
    await p.screenshot({ path: join(FOTO, `${larg}-citta-pubblica${SPENTI.length ? '-rosso' : ''}.png`), fullPage: true }); await p.close(); }
  { const p = await pagina(larg, `${BASE}?bozze=1`); await sc(p, 'titolo'); await p.click('text=Nuova partita'); await sc(p, 'genere'); await p.click('[data-genere="m"]'); await sc(p, 'citta');
    const x0 = await misuraCitta(p); out('CITTA', larg, '?bozze=1 all\'inizio', `${x0.ids.length} punti a schermo; stagioni ${JSON.stringify(x0.stagioni)}`);
    for (const n of (x0.stagioni.length ? x0.stagioni.map((s) => s.replace('*', '')) : ['1'])) {
      if (x0.stagioni.length) { await p.click(`[data-stagione="${n}"]`); await p.waitForTimeout(400); }
      const x = await misuraCitta(p); out('STAGIONE', larg, `stagione ${n}`, `${x.ids.length} punti (${x.ids.map((i) => i.split(':')[0]).join(',')}); nomi visibili ${JSON.stringify(x.nomi)}; sovrapposizioni ${x.cop.length ? `${x.cop.length}: ${x.cop.slice(0, 4).join('; ')}` : 'nessuna'}; fuori mappa ${x.fuori.length ? x.fuori.join(',') : 'nessuno'}; scorrimento ${x.sw}`);
      await p.screenshot({ path: join(FOTO, `${larg}-citta-bozze-s${n}${SPENTI.length ? '-rosso' : ''}.png`), fullPage: true });
      // un tocco su un punto della stagione: il nome passa a quello scelto
      const primo = x.ids.find((i) => !i.endsWith(':futuro'))?.split(':')[0] ?? x.ids[0]?.split(':')[0];
      if (primo && !SPENTI.length) { const alt = x.ids.map((i) => i.split(':')[0]).find((i) => i !== primo); if (alt) { const dis = await p.locator(`[data-episodio="${alt}"] .settore-punto`).isDisabled(); if (!dis) { await p.click(`[data-episodio="${alt}"] .settore-punto`); await p.waitForTimeout(300); const y = await misuraCitta(p); out('STAGIONE', larg, `stagione ${n}, tocco su ${alt}`, `nomi visibili ${JSON.stringify(y.nomi)}`); } } }
    }
    out('ERRORI', larg, 'città ?bozze=1', p.errori.length ? p.errori.slice(0, 3).join('; ') : 'nessuno'); await p.close(); }
  if (SPENTI.length) continue;
  // (2) C09-02/03/04 su e01 (e03 per la piega con le transenne): partita col piano attento, misure a ogni scena
  for (const id of ['e01', 'e03']) { const m = dati[`missioni/${id}.json`]; const sal = salvataggioFino(m.episodio);
    const p = await pagina(larg, BASE, sal); await sc(p, 'titolo'); await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta');
    await p.click(`[data-episodio="${id}"] .settore-punto`).catch(() => {}); await p.waitForTimeout(200); await p.click('[data-azione="avvia-episodio"]');
    const r = await gioca(p, m, sal.variabili, larg, true);
    out('C09', larg, `${id}: verbale «${r.esito}» (motore «${r.atteso}»)`, `C09-03 fuori finestra: ${r.rilievi.length ? r.rilievi.join('; ') : 'mai'} · C09-02 scoperti (elenco/mappa livello): ${r.scoperti.length ? r.scoperti.map((x) => `${x.s} ${x.liv}/${x.mappa}`).join(', ') : 'nessuno in questa partita'}`);
    out('ERRORI', larg, id, p.errori.length ? p.errori.slice(0, 3).join('; ') : 'nessuno'); await p.close(); }
  // C09-04: unità finita
  { const p = await pagina(larg, BASE); await sc(p, 'titolo'); await p.click('text=Nuova partita'); await sc(p, 'genere'); await p.click('[data-genere="m"]'); await sc(p, 'citta');
    await p.click('[data-azione="avvia-episodio"]'); await sc(p, 'sala'); await p.click('[data-azione="avanti"]'); await sc(p, 'briefing'); while (await p.locator('[data-azione="prossimo"]').count()) { await p.click('[data-azione="prossimo"]'); await p.waitForTimeout(60); } await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento');
    const leggi = () => p.evaluate(() => ({ libere: [...document.querySelectorAll('[data-risorsa]')].map((e) => `${e.dataset.risorsa}:${e.querySelector('strong')?.textContent}`).join(','), qui: [...document.querySelectorAll('[data-settore="curva_cinderwick"] [data-presenza]')].map((e) => `${e.dataset.presenza}=${e.textContent.trim()}`).join(','), avviso: [...document.querySelectorAll('.scena [role="status"], .scena .avviso, .scena [aria-live]')].map((e) => e.textContent.trim()).filter(Boolean).join(' | ') }));
    const passi = []; for (let i = 1; i <= 5; i++) { await p.click('[data-settore="curva_cinderwick"] .settore-punto'); await p.waitForTimeout(300); passi.push(`${i}: ${JSON.stringify(await leggi())}`); }
    await p.screenshot({ path: join(FOTO, `${larg}-c09-04-avviso.png`), fullPage: false }); out('C09-04', larg, '5 tocchi su curva_cinderwick con «Squadre» scelte', passi.join(' || ')); await p.close(); }
  // (3) abbozzi: si aprono e si giocano fino al verbale
  for (const id of ABBOZZI) { const m = dati[`missioni/${id}.json`]; if (!m) { out('ABBOZZO', larg, id, 'non esiste nei dati'); continue; }
    let sal; try { sal = salvataggioFino(m.episodio); } catch (e) { out('ABBOZZO', larg, id, `salvataggio di partenza non costruibile: ${e.message}`); continue; }
    const p = await pagina(larg, `${BASE}?bozze=1`, sal); await sc(p, 'titolo'); await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta');
    if (await p.locator(`[data-stagione="${m.stagione}"]`).count()) { await p.click(`[data-stagione="${m.stagione}"]`); await p.waitForTimeout(300); }
    const stato = await p.getAttribute(`[data-episodio="${id}"]`, 'data-stato').catch(() => 'assente');
    let esito = 'non giocato';
    try { await p.click(`[data-episodio="${id}"] .settore-punto`); await p.waitForTimeout(200); await p.click('[data-azione="avvia-episodio"]'); const r = await gioca(p, m, sal.variabili, larg, false); esito = `verbale «${r.esito}», motore «${r.atteso}»`; await p.screenshot({ path: join(FOTO, `${larg}-${id}-verbale.png`), fullPage: false }); }
    catch (e) { esito = `ERRORE ${e.message.split('\n')[0]} in «${await quale(p)}»`; }
    out('ABBOZZO', larg, `${id} (stagione ${m.stagione}, bozza ${m.bozza ?? '-'})`, `stato in città ${stato}; ${esito}; errori console ${p.errori.length ? p.errori.slice(0, 2).join('; ') : 'nessuno'}`); await p.close(); }
}
await b.close(); srv.close();
