// Sonda C-07: e02 sulla mappa aerea, città degli episodi (stati, tentativi, stelle). Solo lettura.
// Uso: node coordination/handoffs/collaudatrice/sonde/c07-e02-citta.mjs <radice con dist/ e node_modules> <cartella foto> [larghezze]
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2]); const FOTO = resolve(process.argv[3]); const LARG = (process.argv[4] ?? '360,375,412').split(',').map(Number); mkdirSync(FOTO, { recursive: true });
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const out = (id, larg, cosa, esito) => console.log(`${id} · ${larg}px · ${cosa} → ${esito}`);
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 8000 });
const salvato = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('valmora-salvataggio') ?? 'null'));
const piano = (m, v, strat) => { const g = B[strat](creaCaso(1), dich); let s = M.iniziaMissione(m, v, dich); const ond = [];
  while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = []; for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); rs.push([c.id, o]); s = M.rispondi(m, s, c.id, o, dich); } ond.push({ d, rs }); s = M.chiudiOndata(m, s, dich); }
  return { ond, esito: M.concludiMissione(m, s, dich).esito.id }; };
// Mappa di gioco: sovrapposizioni fra nomi e unità (anche di settori diversi), bersagli, tagli, caratteri.
const misuraMappa = (p) => p.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
  const box = (e) => e.getBoundingClientRect(); const inter = (a, c) => Math.max(0, Math.min(a.right, c.right) - Math.max(a.left, c.left)) * Math.max(0, Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top));
  const nomi = [...document.querySelectorAll('.mappa .settore-nome')].filter(vis).map((e) => ({ id: e.closest('[data-settore]').dataset.settore, r: box(e) }));
  const unita = [...document.querySelectorAll('.mappa .settore-unita')].filter(vis).map((e) => ({ id: e.closest('[data-settore]').dataset.settore, r: box(e) }));
  const punti = [...document.querySelectorAll('.mappa .settore-punto')].filter(vis).map((e) => ({ id: e.closest('[data-settore]').dataset.settore, r: box(e) }));
  const cop = [];
  for (const n of nomi) { for (const u of unita) if (inter(n.r, u.r) > 4) cop.push(`nome ${n.id} × unità ${u.id} (${Math.round(inter(n.r, u.r))} px²)`);
    for (const q of nomi) if (q.id < n.id && inter(n.r, q.r) > 4) cop.push(`nome ${n.id} × nome ${q.id}`);
    for (const q of punti) if (q.id !== n.id && inter(n.r, q.r) > 4) cop.push(`nome ${n.id} × punto ${q.id}`); }
  for (const u of unita) for (const v of unita) if (u.id < v.id && inter(u.r, v.r) > 4) cop.push(`unità ${u.id} × unità ${v.id}`);
  const m = document.querySelector('.mappa').getBoundingClientRect();
  const fuori = [...nomi, ...unita].filter((x) => x.r.left < m.left - 1 || x.r.right > m.right + 1 || x.r.top < m.top - 1 || x.r.bottom > m.bottom + 1).map((x) => x.id);
  const bers = [...document.querySelectorAll('.mappa [data-presenza], .mappa .settore-punto')].filter(vis).map(box).map((r) => [Math.round(r.width), Math.round(r.height)]);
  const testi = [...document.querySelectorAll('main *')].filter((e) => vis(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
  const tagliati = testi.filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible').map((e) => e.className || e.tagName);
  return { cop, fuori, bers: bers.length ? [Math.min(...bers.map((x) => x[0])), Math.min(...bers.map((x) => x[1]))] : null, font: Math.min(...testi.map((e) => parseFloat(getComputedStyle(e).fontSize))), tagliati, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };
});
// Città: stato dei punti, stelle del punto e della scheda (piene = classe «piena» e riempimento calcolato non «none»), testo dei tentativi.
const citta = (p) => p.evaluate(() => {
  const stelle = (el) => el ? [...el.querySelectorAll('.stella')].map((s) => ({ piena: s.classList.contains('piena'), fill: getComputedStyle(s).fill })) : null;
  const punti = [...document.querySelectorAll('[data-episodio]')].map((e) => ({ id: e.dataset.episodio, stato: e.dataset.stato, dataStelle: e.querySelector('[data-stelle]')?.dataset.stelle ?? null, stelle: stelle(e.querySelector('.stelle')), aria: e.querySelector('.settore-punto').getAttribute('aria-label') }));
  const s = document.querySelector('[data-scheda-episodio]');
  return { punti, scheda: s ? { id: s.dataset.schedaEpisodio, tentativi: s.querySelector('.riga .tenue')?.textContent, dataStelle: s.querySelector('[data-stelle]')?.dataset.stelle ?? null, stelle: stelle(s.querySelector('.stelle')) } : null };
});
const piene = (xs) => xs ? `${xs.filter((x) => x.piena).length} piene (fill ${[...new Set(xs.map((x) => x.fill))].join('/')})` : '—';

for (const larg of LARG) {
  const p = await b.newPage({ viewport: { width: larg, height: 760 }, hasTouch: true, reducedMotion: 'reduce' }); const err = []; p.on('console', (x) => { if (x.type() === 'error') err.push(x.text()); }); p.on('pageerror', (e) => err.push(e.message));
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload(); await sc(p, 'titolo');
  await p.getByRole('button', { name: 'Nuova partita' }).click(); await sc(p, 'genere'); await p.click('[data-genere="m"]'); await sc(p, 'citta');
  const leggiCitta = async (quando) => { const c = await citta(p); const sv = await salvato(p);
    for (const x of c.punti) out('CITTA', larg, `${quando} · punto ${x.id}`, `stato ${x.stato}; registro ${JSON.stringify(sv.episodi?.[x.id]?.migliore?.stelle ?? null)}★, tentativi ${sv.episodi?.[x.id]?.tentativi ?? 0}; punto data-stelle ${x.dataStelle}, ${piene(x.stelle)}; aria «${x.aria}»`);
    if (c.scheda) out('CITTA', larg, `${quando} · scheda ${c.scheda.id}`, `«${c.scheda.tentativi}»; data-stelle ${c.scheda.dataStelle}, ${piene(c.scheda.stelle)}`); };
  await leggiCitta('inizio'); await p.screenshot({ path: join(FOTO, `${larg}-01-citta-inizio.png`), fullPage: true });
  const gioca = async (id, strat, foto) => {
    const sv = await salvato(p); const pl = piano(dati[`missioni/${id}.json`], sv.variabili, strat);
    await p.click(`[data-episodio="${id}"] .settore-punto`); await p.waitForTimeout(200); await p.click('[data-azione="avvia-episodio"]'); await sc(p, 'sala'); await p.click('[data-azione="avanti"]'); await sc(p, 'briefing');
    while (await p.locator('[data-azione="prossimo"]').count()) { await p.click('[data-azione="prossimo"]'); await p.waitForTimeout(60); } await p.click('[data-azione="inizia"]');
    const mis = { cop: new Set(), fuori: new Set(), bers: [99, 99], font: 99, tagliati: new Set(), sw: 0 }; let k = 0;
    const misura = async (nome) => { const x = await misuraMappa(p); x.cop.forEach((c) => mis.cop.add(`${nome}: ${c}`)); x.fuori.forEach((f) => mis.fuori.add(`${nome}: ${f}`)); if (x.bers) mis.bers = [Math.min(mis.bers[0], x.bers[0]), Math.min(mis.bers[1], x.bers[1])]; mis.font = Math.min(mis.font, x.font); x.tagliati.forEach((t) => mis.tagliati.add(`${nome}: ${t}`)); if (x.sw > x.cw) mis.sw++;
      if (foto && (nome.startsWith('schieramento') || nome === 'chiamata-1')) await p.screenshot({ path: join(FOTO, `${larg}-${id}-${String(++k).padStart(2, '0')}-${nome}.png`), fullPage: true }); };
    for (const [i, o] of pl.ond.entries()) {
      await sc(p, 'schieramento'); for (const [r, ps] of Object.entries(o.d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`); }
      await misura(`schieramento-${i + 1}`); await p.click('[data-azione="conferma"]');
      for (const [j, [, op]] of o.rs.entries()) { await sc(p, 'chiamata'); if (j === 0) await misura(`chiamata-${i + 1}`); await p.click(`[data-opzione="${op}"]`); await p.waitForTimeout(250); if (await p.locator('[data-azione="continua"]').count()) await p.click('[data-azione="continua"]'); }
      await sc(p, 'chiusura'); await p.click('[data-azione="rapporto"]'); await sc(p, 'rapporto'); await misura(`rapporto-${i + 1}`); await p.click('[data-azione="avanti"]');
    }
    await sc(p, 'verbale'); const es = await p.getAttribute('[data-esito]', 'data-esito'); const st = await p.getAttribute('.scena [data-stelle]', 'data-stelle').catch(() => null);
    out('GIOCO', larg, `${id} (${strat})`, `verbale «${es}» ${st}★, motore «${pl.esito}»; sovrapposizioni ${mis.cop.size ? [...mis.cop].slice(0, 6).join('; ') : 'nessuna'}; fuori mappa ${mis.fuori.size ? [...mis.fuori].join('; ') : 'nessuno'}; bersagli minimi ${mis.bers.join('×')}; carattere minimo ${mis.font}px; tagliati ${mis.tagliati.size ? [...mis.tagliati].slice(0, 4).join('; ') : 'nessuno'}; scorrimento ${mis.sw}`);
    await p.click('[data-azione="citta"]'); await sc(p, 'citta');
  };
  await gioca('e01', 'equilibrata', true); await leggiCitta('dopo e01'); await p.screenshot({ path: join(FOTO, `${larg}-02-citta-dopo-e01.png`), fullPage: true });
  await gioca('e02', 'attenta', true); await leggiCitta('dopo e02 (1° tentativo)'); await p.screenshot({ path: join(FOTO, `${larg}-03-citta-dopo-e02.png`), fullPage: true });
  await gioca('e02', 'peggiore', false); await leggiCitta('dopo e02 (2° tentativo, fallito)'); await p.screenshot({ path: join(FOTO, `${larg}-04-citta-e02-due-tentativi.png`), fullPage: true });
  out('—', larg, 'errori di console', err.length ? err.slice(0, 3).join('; ') : 'nessuno'); await p.close();
}
await b.close(); srv.close();
