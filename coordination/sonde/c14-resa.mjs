// Sonda C-014 (collaudatrice, sola lettura): la build nel browser (Chromium headless, playwright-core).
// Uso: node coordination/sonde/c14-resa.mjs <radice con dist/> <cartella uscite> [prove,…]
//   prove: home, schermate, ricarica, doppio, indietro, corrotti, vecchio, rigioco, lunga, offline, tempi (default: tutte)
// Le misure di tempo sono AUSILIARIE (headless su server ≠ telefono).
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const OUT = resolve(process.argv[3] ?? 'out/c14'); mkdirSync(join(OUT, 'foto'), { recursive: true });
const PROVE = new Set((process.argv[4] ?? 'home,schermate,ricarica,doppio,indietro,corrotti,vecchio,rigioco,lunga,offline,tempi').split(','));
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
const MIS = (id) => dati[`missioni/${id}.json`];
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
let rete = true;
const srv = createServer((q, r) => { if (!rete) { r.destroy(); return; } const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const PORTA = srv.address().port; const URL = `http://127.0.0.1:${PORTA}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--enable-precise-memory-info', '--js-flags=--expose-gc'] });
const log = (...x) => console.log(...x);
const h = (t) => log(`\n## ${t}`);

async function pagina(larg = 360, alt = 760, ridotto = true, url = URL) {
  const ctx = await b.newContext({ viewport: { width: larg, height: alt }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, reducedMotion: ridotto ? 'reduce' : 'no-preference' });
  const p = await ctx.newPage();
  const errori = []; p.on('console', (x) => { if (x.type() === 'error' || x.type() === 'warning') errori.push(`${x.type()}: ${x.text().slice(0, 200)}`); }); p.on('pageerror', (e) => errori.push(`pageerror: ${e.message.slice(0, 200)}`));
  await p.goto(url); await p.evaluate(() => localStorage.clear()); await p.reload(); p.errori = errori; return p;
}
const sc = (p, n, timeout = 8000) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && (!n || s[0].dataset.scena === n) && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout, polling: 'raf' });
const quale = (p) => p.evaluate(() => document.querySelector('.scena')?.dataset.scena ?? null);
const salvato = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('valmora-salvataggio') ?? 'null'));
const passi = async (p) => { while (await p.locator('[data-azione="passo"]:visible').count()) { await p.click('[data-azione="passo"]:visible'); await p.waitForTimeout(40); } };
async function nuova(p, gen = 'm') { await sc(p, 'titolo'); await p.getByRole('button', { name: 'Nuova partita' }).click(); await p.waitForTimeout(250);
  if ((await quale(p)) === 'conferma') await p.click('[data-azione="conferma-nuova"]'); await sc(p, 'genere'); await p.click(`[data-genere="${gen}"]`); await sc(p, 'citta'); }
async function allaPrimaOndata(p, foto) {
  await p.click('[data-azione="avvia-episodio"]'); await sc(p, 'sala'); if (foto) await foto('sala'); await passi(p); await p.click('[data-azione="avanti"]'); await sc(p, 'briefing'); if (foto) await foto('briefing');
  await passi(p); await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento');
}
/** Piano di una strategia (bot della logica) dalle variabili della partita in corso. */
function piano(m, v, strategia = 'attenta') {
  const g = B.STRATEGIE[strategia](creaCaso(1), dich); let s = M.iniziaMissione(m, v, dich); const ond = [];
  while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = []; for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); rs.push([c.id, o]); s = M.rispondi(m, s, c.id, o, dich); } ond.push({ d, rs }); s = M.chiudiOndata(m, s, dich); }
  return { ond, esito: M.concludiMissione(m, s, dich).esito.id };
}
async function schiera(p, d) { for (const [r, ps] of Object.entries(d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`); } }
/** Gioca un episodio già avviato (scena schieramento) fino al verbale; «dopo» è chiamata dopo ogni passo con il nome della scena. */
async function giocaEpisodio(p, m, strategia = 'attenta', dopo) {
  const pl = piano(m, (await salvato(p)).in_corso.variabili, strategia);
  for (const [i, o] of pl.ond.entries()) {
    if (i) await sc(p, 'schieramento');
    await schiera(p, o.d); if (dopo && (await dopo('schieramento', i)) === 'rifai') await schiera(p, o.d); await p.click('[data-azione="conferma"]');
    for (const [, op] of o.rs) { await sc(p, 'chiamata'); if (dopo) await dopo('chiamata', i); await p.click(`[data-opzione="${op}"]`); await p.waitForTimeout(30);
      await p.waitForFunction(() => { const s = document.querySelectorAll('.scena'); return s.length === 1 && getComputedStyle(s[0]).opacity === '1' && s[0].dataset.scena !== 'chiamata' || document.querySelectorAll('.scena').length === 1 && document.querySelector('.scena').dataset.scena === 'chiamata' && !document.querySelector('.opzione.scelta'); }, null, { timeout: 8000, polling: 'raf' });
      if ((await quale(p)) === 'risposta') { if (dopo) await dopo('risposta', i); if ((await quale(p)) === 'risposta') await p.click('[data-azione="continua"]'); } }
    await sc(p, 'chiusura'); if (dopo) await dopo('chiusura', i); await p.click('[data-azione="rapporto"]'); await sc(p, 'rapporto'); if (dopo) await dopo('rapporto', i);
    await p.click('[data-azione="avanti"]');
  }
  await sc(p, 'verbale'); if (dopo) await dopo('verbale', pl.ond.length);
  return pl;
}
async function chiudiVerbale(p) { await passi(p); await p.click('[data-azione="citta"]'); await sc(p, 'citta'); }

const misuraTutto = (p) => p.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0' && !e.closest('[hidden]'); };
  const foglie = [...document.querySelectorAll('body *')].filter((e) => vis(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && !e.closest('.mappa-tela'));
  const font = Math.min(...foglie.map((e) => parseFloat(getComputedStyle(e).fontSize)));
  const piccoli = [...document.querySelectorAll('button, a, [role=button]')].filter(vis).map((e) => ({ e, r: e.getBoundingClientRect() })).filter(({ r }) => r.width < 44 || r.height < 44).map(({ e, r }) => `${(e.getAttribute('aria-label') || e.textContent || e.className).trim().slice(0, 22)} ${Math.round(r.width)}×${Math.round(r.height)}`);
  const tagliati = foglie.filter((e) => (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== 'visible') || e.getBoundingClientRect().right > innerWidth + 1).map((e) => e.textContent.trim().slice(0, 30));
  const s = document.scrollingElement;
  const azione = [...document.querySelectorAll('.scena .pulsante:not(.secondario), .scena [data-opzione]')].filter(vis).map((e) => e.getBoundingClientRect());
  const primo = azione.length ? Math.round(azione[0].bottom - innerHeight) : null; // >0 = il primo pulsante d'azione è sotto la piega
  return { verticale: s.scrollHeight - innerHeight, orizzontale: s.scrollWidth - s.clientWidth, font, piccoli, tagliati: tagliati.slice(0, 4), sottoPiega: primo };
});
const RIS = { };

// ---------------------------------------------------------------- home
if (PROVE.has('home')) {
  h('B1 home: versione, build, errori');
  for (const [l, a] of [[360, 760], [375, 812], [412, 915]]) {
    const p = await pagina(l, a); await sc(p, 'titolo');
    const v = await p.textContent('[data-versione]'); const x = await misuraTutto(p);
    await p.screenshot({ path: join(OUT, 'foto', `${l}-home.png`) });
    log(`${l}×${a}: «${v.trim()}» · scorrimento ${x.verticale}px · bersagli <44px: ${x.piccoli.join(' | ') || 'nessuno'} · errori ${p.errori.length} ${p.errori.join(' | ')}`);
    // città: c'è un modo di tornare alla home?
    await nuova(p); const pulsanti = await p.$$eval('.scena button, .scena a', (xs) => xs.map((x) => (x.textContent || x.getAttribute('aria-label') || '').trim()).filter(Boolean));
    log(`  città: pulsanti ${JSON.stringify(pulsanti.slice(0, 12))}; uno porta alla home? ${pulsanti.some((t) => /titolo|home|menu|indietro/i.test(t)) ? 'sì' : 'NO'}`);
    await p.context().close();
  }
}

// ---------------------------------------------------------------- schermate e01, 3 larghezze
if (PROVE.has('schermate')) {
  h('B2 e01 intero a 360×760, 375×812, 412×915: scorrimento, bersagli <44 px, testi tagliati, pulsante d\'azione sotto la piega');
  for (const [l, a] of [[360, 760], [375, 812], [412, 915]]) {
    const p = await pagina(l, a); await nuova(p); const righe = [];
    const foto = async (n) => { const x = await misuraTutto(p); righe.push({ n, ...x }); if (!existsSync(join(OUT, 'foto', `${l}-${n}.png`))) await p.screenshot({ path: join(OUT, 'foto', `${l}-${n}.png`) }); };
    await foto('citta'); await allaPrimaOndata(p, foto);
    await giocaEpisodio(p, MIS('e01'), 'attenta', async (n) => { await p.waitForTimeout(120); await foto(n); });
    for (let i = 0; i < 8 && await p.locator('[data-azione="passo"]:visible').count(); i++) { await foto(`verbale-${i + 1}`); await p.click('[data-azione="passo"]:visible'); await p.waitForTimeout(60); }
    await foto('verbale-fine');
    const agg = {}; for (const r of righe) { const k = r.n.replace(/-\d+$/, ''); const g = (agg[k] ??= { n: 0, maxScroll: 0, maxSotto: -Infinity, piccoli: new Set(), tagliati: new Set(), font: 99 }); g.n++; g.maxScroll = Math.max(g.maxScroll, r.verticale); if (r.sottoPiega !== null) g.maxSotto = Math.max(g.maxSotto, r.sottoPiega); r.piccoli.forEach((x) => g.piccoli.add(x.replace(/\d+×\d+$/, '').trim() + ' ' + x.match(/\d+×\d+$/)[0])); r.tagliati.forEach((x) => g.tagliati.add(x)); g.font = Math.min(g.font, r.font); }
    log(`${l}×${a} (errori console ${p.errori.length}${p.errori.length ? ': ' + p.errori.slice(0, 3).join(' | ') : ''})`);
    for (const [k, g] of Object.entries(agg)) log(`  ${k} ×${g.n}: scorrimento max ${g.maxScroll}px · primo pulsante d'azione ${g.maxSotto > 0 ? g.maxSotto + 'px SOTTO la piega' : 'visibile'} · font min ${g.font}px · <44px: ${[...g.piccoli].slice(0, 5).join(' | ') || '—'}${g.piccoli.size > 5 ? ` (+${g.piccoli.size - 5})` : ''} · tagliati: ${[...g.tagliati].join(' | ') || '—'}`);
    RIS[`schermate${l}`] = agg;
    await p.context().close();
  }
}

// ---------------------------------------------------------------- ricarica a ogni passo
if (PROVE.has('ricarica')) {
  h('B3 ricarica della pagina a OGNI passo di e01 e e02 (Riprendi): scena prima e dopo');
  const p = await pagina(375, 812); await nuova(p); const diff = {}; let tot = 0;
  const conta = (k) => { diff[k] = (diff[k] ?? 0) + 1; };
  for (const id of ['e01', 'e02']) {
    if (id === 'e02' && (await quale(p)) !== 'citta') { await chiudiVerbale(p); }
    await allaPrimaOndata(p);
    await giocaEpisodio(p, MIS(id), 'attenta', async (n) => {
      const prima = await quale(p); const s0 = await salvato(p);
      await p.reload(); await sc(p, 'titolo'); await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForTimeout(400); await sc(p, null);
      const dopo = await quale(p); const s1 = await salvato(p); tot++;
      const stessoSalv = JSON.stringify(s0) === JSON.stringify(s1);
      conta(`${prima} → ${dopo}${stessoSalv ? '' : ' (salvataggio CAMBIATO)'}`);
      if (n === 'schieramento' && dopo === 'schieramento') { // la bozza dello schieramento si perde: rimetto le unità
        return 'rifai';
      }
      if (n === 'verbale') return;
      if (prima !== dopo && !(prima === 'risposta')) log(`  ${id}: ${prima} diventa ${dopo} dopo la ricarica`);
    }).catch((e) => log(`  ${id}: interrotta: ${e.message.split('\n')[0]}`));
  }
  log(`ricariche ${tot}: ${JSON.stringify(diff)}`);
  log(`errori console: ${p.errori.length} ${p.errori.slice(0, 3).join(' | ')}`);
  await p.context().close();
}

// ---------------------------------------------------------------- doppio tocco
if (PROVE.has('doppio')) {
  h('B4 doppio tocco (dblclick e due tocchi a 40 ms) su conferma, opzione, continua, rapporto, inizia, avvia, città');
  for (const modo of ['dblclick', 'tap40']) {
    const p = await pagina(360, 760); await nuova(p);
    const doppio = async (sel) => { if (modo === 'dblclick') await p.dblclick(sel, { timeout: 3000 }).catch(() => {}); else { await p.tap(sel); await p.waitForTimeout(40); await p.tap(sel, { timeout: 500, force: true }).catch(() => {}); } };
    await doppio('[data-azione="avvia-episodio"]'); await sc(p, 'sala'); await passi(p); await doppio('[data-azione="avanti"]'); await sc(p, 'briefing'); await passi(p);
    await doppio('[data-azione="inizia"]'); await sc(p, 'schieramento');
    const m = MIS('e01'); const pl = piano(m, (await salvato(p)).in_corso.variabili); const anomalie = [];
    for (const [i, o] of pl.ond.entries()) {
      if (i) await sc(p, 'schieramento');
      await schiera(p, o.d); await doppio('[data-azione="conferma"]'); await p.waitForTimeout(300);
      let s = await salvato(p); if (!s.in_corso.disposizione) anomalie.push(`o${i + 1}: schieramento non salvato`);
      for (const [c, op] of o.rs) {
        await sc(p, 'chiamata'); const n0 = (await salvato(p)).in_corso.scelte.length;
        await doppio(`[data-opzione="${op}"]`); await p.waitForTimeout(350);
        const s2 = (await salvato(p)).in_corso; if (s2.scelte.length !== n0 + 1) anomalie.push(`o${i + 1}/${c}: scelte ${n0} → ${s2.scelte.length}`);
        if (s2.risposte[c] !== op) anomalie.push(`o${i + 1}/${c}: salvata «${s2.risposte[c]}» invece di «${op}»`);
        if ((await quale(p)) === 'risposta') { await doppio('[data-azione="continua"]'); await p.waitForTimeout(350); }
      }
      await sc(p, 'chiusura'); await doppio('[data-azione="rapporto"]'); await sc(p, 'rapporto');
      s = await salvato(p); if (s.in_corso.rapporti.length !== i + 1) anomalie.push(`o${i + 1}: rapporti ${s.in_corso.rapporti.length}`);
      await doppio('[data-azione="avanti"]'); await p.waitForTimeout(400);
      const q = await quale(p); s = await salvato(p);
      if (i < pl.ond.length - 1 && q !== 'schieramento') anomalie.push(`o${i + 1}: dopo «Prossima ondata» la scena è ${q}`);
    }
    await sc(p, 'verbale'); const s = await salvato(p);
    if (s.episodi.e01?.tentativi !== 1) anomalie.push(`tentativi e01 = ${s.episodi.e01?.tentativi}`);
    await passi(p); await doppio('[data-azione="citta"]'); await sc(p, 'citta');
    log(`${modo}: anomalie ${anomalie.length ? anomalie.join('; ') : 'nessuna'} · errori console ${p.errori.length} ${p.errori.slice(0, 2).join(' | ')}`);
    await p.context().close();
  }
}

// ---------------------------------------------------------------- tasto indietro
if (PROVE.has('indietro')) {
  h('B5 tasto indietro del browser');
  const ctx = await b.newContext({ viewport: { width: 360, height: 760 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  const p = await ctx.newPage(); await p.goto('about:blank'); await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
  await nuova(p); await allaPrimaOndata(p);
  const prima = await p.evaluate(() => history.length);
  await p.goBack({ waitUntil: 'load' }).catch(() => {});
  log(`a metà schieramento di e01 (history.length ${prima}): indietro → ${p.url()}`);
  await p.goForward({ waitUntil: 'load' }).catch(() => {}); await sc(p, null).catch(() => {});
  log(`  avanti → ${p.url()} scena «${await quale(p)}»; salvataggio in_corso ${(await salvato(p))?.in_corso?.missione ?? 'null'} ondata ${(await salvato(p))?.in_corso?.ondata ?? '-'}`);
  // Guida aperta dalla home: il tasto indietro chiude la guida o esce?
  await p.goto('about:blank'); await p.goto(URL); await sc(p, 'titolo'); await p.click('[data-azione="guida"]'); await p.waitForTimeout(300);
  await p.goBack({ waitUntil: 'load' }).catch(() => {}); log(`  guida aperta, indietro → ${p.url()}`);
  await ctx.close();
}

// ---------------------------------------------------------------- salvataggi corrotti
if (PROVE.has('corrotti')) {
  h('B6 salvataggi corrotti/vuoti in localStorage: cosa vede il giocatore');
  const V0 = Object.fromEntries([...dich.values()].map((d) => [d.id, d.iniziale]));
  const ic = M.iniziaMissione(MIS('e01'), V0, dich);
  const buono = { save_version: 2, game_version: '0.5.0', seme: 7, caso: 7, variabili: V0, missioni_concluse: [], episodi: {}, genere: 'm', in_corso: ic, rapporto_aperto: null };
  const casi = {
    'testo non JSON': '{rotto', 'stringa vuota': '', 'null': 'null', '{}': '{}',
    'missione inesistente e99': JSON.stringify({ ...buono, in_corso: { ...ic, missione: 'e99' } }),
    'ondata 99': JSON.stringify({ ...buono, in_corso: { ...ic, ondata: 99 } }),
    'disposizione con risorsa inesistente': JSON.stringify({ ...buono, in_corso: { ...ic, disposizione: { carri: { piazzale: 3 } } } }),
    'tensione stringa': JSON.stringify({ ...buono, in_corso: { ...ic, tensione: { piazzale: 'alta' } } }),
    'rapporto_aperto 5 senza rapporti': JSON.stringify({ ...buono, rapporto_aperto: 5 }),
    'save_version 3': JSON.stringify({ ...buono, save_version: 3 }),
  };
  for (const [nome, grezzo] of Object.entries(casi)) {
    const p = await pagina(360, 760); await p.evaluate((g) => localStorage.setItem('valmora-salvataggio', g), grezzo); await p.reload(); await p.waitForTimeout(700);
    const home = await quale(p); const riprendi = await p.getByRole('button', { name: 'Riprendi' }).count();
    let dopo = '-';
    if (riprendi) { await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForTimeout(800); dopo = `${await quale(p)}`; const testo = (await p.evaluate(() => document.body.innerText.trim().length)); if (!testo) dopo += ' (PAGINA VUOTA)'; }
    await p.reload(); await p.waitForTimeout(600); const ricarica = await quale(p);
    const rimasto = await p.evaluate(() => localStorage.getItem('valmora-salvataggio'));
    log(`- ${nome}: home «${home}», Riprendi ${riprendi ? 'presente' : 'assente'} → «${dopo}»; dopo ricarica «${ricarica}»; salvataggio ${rimasto === grezzo ? 'intatto' : 'cambiato'}; errori ${p.errori.length}: ${p.errori.slice(0, 2).join(' | ')}`);
    await p.context().close();
  }
}

// ---------------------------------------------------------------- salvataggio 0.4.0
if (PROVE.has('vecchio')) {
  h('B7 salvataggio scritto da 0.4.0 (stato.json con 5 variabili) a metà e02, caricato dalla 0.5.0');
  const v040 = { tensione_max: 0, credito: 4, informatore_pagato: true, presidente_incontrato: false, furgone_visto: false };
  const reg = { e01: { migliore: { esito: 'contenuto_a_fatica', fallita: false, stelle: 2 }, tentativi: 1, variabili_prima: { ...v040, credito: 5, informatore_pagato: false }, variabili_dopo: v040 } };
  const ic = M.iniziaMissione(MIS('e02'), v040, dich); delete ic.partenze; // la 0.4.0 non aveva «partenze»? (IPOTESI: si prova senza)
  const s = { save_version: 2, game_version: '0.4.0', seme: 9, caso: 9, variabili: v040, missioni_concluse: ['e01'], episodi: reg, genere: 'f', in_corso: ic, rapporto_aperto: null };
  const p = await pagina(375, 812); await p.evaluate((g) => localStorage.setItem('valmora-salvataggio', g), JSON.stringify(s)); await p.reload(); await sc(p, 'titolo');
  await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'schieramento');
  await giocaEpisodio(p, MIS('e02')); const fine = await salvato(p);
  log(`e02 ripreso e finito: esito registro ${JSON.stringify(fine.episodi.e02?.migliore)}; variabili ${Object.keys(fine.variabili).length} (${Object.keys(fine.variabili).join(',')}); errori ${p.errori.length} ${p.errori.slice(0, 2).join(' | ')}`);
  await chiudiVerbale(p); log(`  città dopo: prossimo episodio scelto «${await p.getAttribute('[data-scheda-episodio]', 'data-scheda-episodio')}»`);
  await p.context().close();
}

// ---------------------------------------------------------------- rigioco
if (PROVE.has('rigioco')) {
  h('B8 rigiocare e01 già superato (dopo e02 superato) e perderlo apposta');
  const p = await pagina(360, 760); await nuova(p);
  await allaPrimaOndata(p); await giocaEpisodio(p, MIS('e01'), 'equilibrata'); await chiudiVerbale(p);
  await allaPrimaOndata(p); await giocaEpisodio(p, MIS('e02'), 'attenta'); await chiudiVerbale(p);
  const prima = await salvato(p);
  // scelgo e01 sulla mappa della città
  await p.click(`[data-stagione="1"]`); await p.click(`[data-episodio="e01"] .settore-punto`);
  await p.waitForTimeout(300); const testo = await p.textContent('[data-scheda-episodio]');
  await allaPrimaOndata(p); await giocaEpisodio(p, MIS('e01'), 'peggiore');
  const verb = await p.textContent('.scena'); await chiudiVerbale(p); const dopo = await salvato(p);
  log(`scheda e01 prima del rigioco: «${testo.replace(/\s+/g, ' ').slice(0, 120)}»`);
  log(`verbale del rigioco perso: ${/fallito/i.test(verb) ? 'dice «fallito»' : 'non dice fallito'}; registro e01 prima ${JSON.stringify(prima.episodi.e01.migliore)} dopo ${JSON.stringify(dopo.episodi.e01.migliore)} (tentativi ${dopo.episodi.e01.tentativi}); variabili invariate: ${JSON.stringify(prima.variabili) === JSON.stringify(dopo.variabili)}; e02 ancora superato: ${!!dopo.episodi.e02?.migliore}`);
  log(`  scena dopo: città, episodio scelto «${await p.getAttribute('[data-scheda-episodio]', 'data-scheda-episodio')}»; errori ${p.errori.length}`);
  await p.context().close();
}

// ---------------------------------------------------------------- sessione lunga
if (PROVE.has('lunga')) {
  h('B9 sessione lunga: e01→e36 in una sola pagina (360×760), memoria e nodi dopo ogni episodio');
  const p = await pagina(360, 760); const cdp = await p.context().newCDPSession(p); await cdp.send('Performance.enable');
  const metr = async () => { await cdp.send('HeapProfiler.collectGarbage').catch(() => {}); const { metrics } = await cdp.send('Performance.getMetrics'); const g = (n) => metrics.find((x) => x.name === n)?.value ?? 0;
    const canvas = await p.evaluate(() => document.querySelectorAll('canvas').length); return { heap: +(g('JSHeapUsedSize') / 1048576).toFixed(1), nodi: g('Nodes'), ascoltatori: g('JSEventListeners'), canvas }; };
  await nuova(p); const serie = [await metr()]; const esiti = []; const t0 = Date.now(); let ferma = null;
  for (let k = 1; k <= 36; k++) {
    const id = `e${String(k).padStart(2, '0')}`;
    try {
      const sch = await p.getAttribute('[data-scheda-episodio]', 'data-scheda-episodio'); if (sch !== id) { ferma = `la città propone ${sch} invece di ${id}`; break; }
      await allaPrimaOndata(p); await giocaEpisodio(p, MIS(id), 'attenta'); const s = await salvato(p);
      esiti.push(`${id}:${s.episodi[id]?.migliore?.stelle ?? 'X'}`); await chiudiVerbale(p); serie.push(await metr());
    } catch (e) { ferma = `${id}: ${e.message.split('\n')[0]}`; await p.screenshot({ path: join(OUT, 'foto', `lunga-ferma-${id}.png`) }); break; }
  }
  log(`episodi: ${esiti.join(' ')}${ferma ? ' · FERMA: ' + ferma : ''} · ${((Date.now() - t0) / 60000).toFixed(1)} min reali (ausiliario)`);
  log(`heap MB dopo ogni episodio: ${serie.map((x) => x.heap).join(',')}`);
  log(`nodi DOM: ${serie.map((x) => x.nodi).join(',')}`);
  log(`ascoltatori JS: ${serie.map((x) => x.ascoltatori).join(',')} · canvas: ${serie.map((x) => x.canvas).join(',')}`);
  log(`errori console: ${p.errori.length} ${[...new Set(p.errori)].slice(0, 4).join(' | ')}`);
  writeFileSync(join(OUT, 'lunga.json'), JSON.stringify({ esiti, serie, ferma }, null, 1));
  await p.context().close();
}

// ---------------------------------------------------------------- offline / service worker
if (PROVE.has('offline')) {
  h('B10 offline: service worker su http://localhost, prima visita poi rete staccata');
  const ctx = await b.newContext({ viewport: { width: 360, height: 760 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  const p = await ctx.newPage(); const errori = []; p.on('pageerror', (e) => errori.push(e.message.slice(0, 150))); p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text().slice(0, 150)); });
  const L = `http://localhost:${PORTA}/`;
  await p.goto(L); await sc(p, 'titolo');
  const sw = await p.evaluate(async () => { const r = await navigator.serviceWorker.ready; return { stato: r.active?.state, controlla: !!navigator.serviceWorker.controller }; }).catch((e) => ({ errore: e.message }));
  await p.waitForTimeout(800); await p.reload(); await sc(p, 'titolo');
  const inCache = await p.evaluate(async () => { const c = await caches.open('valmora-v1'); return (await c.keys()).map((r) => new URL(r.url).pathname); });
  const tutti = (await import('node:fs')).readdirSync(join(R, 'dist', 'assets')); const js = tutti.filter((f) => f.endsWith('.js'));
  const mancano = js.filter((f) => !inCache.some((x) => x.endsWith(f)));
  log(`service worker: ${JSON.stringify(sw)}; file in cache dopo la prima visita (solo home): ${inCache.length}; .js della build non in cache: ${mancano.length}/${js.length} (${mancano.slice(0, 6).join(', ')}${mancano.length > 6 ? '…' : ''})`);
  rete = false; await ctx.setOffline(true);
  await p.reload().catch((e) => errori.push('reload: ' + e.message.slice(0, 80))); await p.waitForTimeout(800);
  let esito = `home offline: «${await quale(p)}»`;
  try { await p.evaluate(() => localStorage.clear()); await p.reload(); await nuova(p); await p.waitForTimeout(800); const canvas = await p.evaluate(() => document.querySelectorAll('canvas').length); esito += ` · città: canvas ${canvas}`;
    await allaPrimaOndata(p); esito += ' · schieramento e01 raggiunto'; await p.screenshot({ path: join(OUT, 'foto', 'offline-schieramento.png') }); const mappa = await p.evaluate(() => document.querySelectorAll('canvas').length); esito += ` (canvas ${mappa})`; } catch (e) { esito += ` · BLOCCATO: ${e.message.split('\n')[0]}`; await p.screenshot({ path: join(OUT, 'foto', 'offline-blocco.png') }); }
  log(`${esito}; errori ${errori.length}: ${[...new Set(errori)].slice(0, 4).join(' | ')}`);
  rete = true; await ctx.close();
}

// ---------------------------------------------------------------- tempi (ausiliari) e spostamenti di layout
if (PROVE.has('tempi')) {
  h('B11 tempi tocco→scena pronta e spostamenti di layout (CLS) con animazioni ATTIVE, 360×760 — AUSILIARI');
  const p = await pagina(360, 760, false);
  await p.evaluate(() => { window.__cls = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls.push({ v: e.value, t: performance.now() }); }).observe({ type: 'layout-shift', buffered: true }); });
  const tempi = {}; const tocca = async (sel, nome) => { const t0 = Date.now(); await p.click(sel); await p.waitForTimeout(16); await sc(p, null, 10000); (tempi[nome] ??= []).push(Date.now() - t0); };
  await sc(p, 'titolo'); await tocca('text=Nuova partita', 'titolo→genere'); await tocca('[data-genere="f"]', 'genere→città');
  for (let giro = 0; giro < 3; giro++) {
    await tocca('[data-azione="avvia-episodio"]', 'città→sala'); await passi(p); await tocca('[data-azione="avanti"]', 'sala→briefing'); await passi(p); await tocca('[data-azione="inizia"]', 'briefing→schieramento');
    const m = MIS(giro === 0 ? 'e01' : giro === 1 ? 'e02' : 'e03'); const pl = piano(m, (await salvato(p)).in_corso.variabili);
    for (const [i, o] of pl.ond.entries()) { if (i) await sc(p, 'schieramento'); await schiera(p, o.d); await tocca('[data-azione="conferma"]', 'conferma→chiamata');
      for (const [, op] of o.rs) { await sc(p, 'chiamata'); await tocca(`[data-opzione="${op}"]`, 'opzione→scena'); if ((await quale(p)) === 'risposta') await tocca('[data-azione="continua"]', 'continua→scena'); }
      await sc(p, 'chiusura'); await tocca('[data-azione="rapporto"]', 'chiusura→rapporto'); await tocca('[data-azione="avanti"]', 'rapporto→dopo'); }
    await passi(p); await tocca('[data-azione="citta"]', 'verbale→città');
  }
  const stat = (xs) => { const s = [...xs].sort((a, b) => a - b); const med = s[Math.floor(s.length / 2)]; const media = s.reduce((a, b) => a + b, 0) / s.length; const ds = Math.sqrt(s.reduce((a, b) => a + (b - media) ** 2, 0) / s.length); return `n=${s.length} mediana ${med} ms, media ${media.toFixed(0)}, dev.st ${ds.toFixed(0)}, min ${s[0]}, max ${s.at(-1)}`; };
  for (const [k, xs] of Object.entries(tempi)) log(`- ${k}: ${stat(xs)}`);
  const cls = await p.evaluate(() => window.__cls); const tot = cls.reduce((a, x) => a + x.v, 0);
  log(`layout shift: ${cls.length} eventi, somma ${tot.toFixed(3)}, il più grande ${Math.max(0, ...cls.map((x) => x.v)).toFixed(3)} (soglia «buono» di Web Vitals per sessione: 0,1)`);
  log(`errori console: ${p.errori.length} ${[...new Set(p.errori)].slice(0, 3).join(' | ')}`);
  await p.context().close();
}

// ---------------------------------------------------------------- città: tocchi incrociati con il nome dell'episodio scelto
if (PROVE.has('citta')) {
  h('B12 città: con l\'episodio A scelto (nome visibile), il tocco al centro del punto B sceglie B? 36 superati, ogni coppia della stagione');
  const V0 = Object.fromEntries([...dich.values()].map((d) => [d.id, d.iniziale]));
  const episodi = Object.fromEntries(Object.keys(dati).filter((k) => k.startsWith('missioni/')).map((k) => [dati[k].id, { migliore: { esito: 'contenuto_a_fatica', fallita: false, stelle: 2 }, tentativi: 1, variabili_prima: V0, variabili_dopo: V0 }]));
  const s = { save_version: 2, game_version: '0.5.0', seme: 1, caso: 1, variabili: V0, missioni_concluse: Object.keys(episodi), episodi, genere: 'm', in_corso: null, rapporto_aperto: null };
  for (const [l, a] of [[360, 760], [375, 812], [412, 915]]) {
    const p = await pagina(l, a); await p.evaluate((g) => localStorage.setItem('valmora-salvataggio', g), JSON.stringify(s)); await p.reload(); await sc(p, 'titolo');
    await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta'); await p.waitForTimeout(500);
    let prove = 0; const falliti = []; const coperti = new Set();
    for (const stg of [1, 2, 3]) {
      await p.click(`[data-stagione="${stg}"]`); await p.waitForTimeout(200);
      const ids = await p.$$eval('[data-episodio]', (xs) => xs.map((x) => x.dataset.episodio));
      for (const A of ids) {
        const cA = await p.$eval(`[data-episodio="${A}"] .settore-punto`, (e) => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
        await p.touchscreen.tap(cA[0], cA[1]); await p.waitForTimeout(60);
        for (const Bid of ids) { if (Bid === A) continue;
          // riscelgo A, poi tocco B
          await p.touchscreen.tap(cA[0], cA[1]); await p.waitForTimeout(30);
          const c = await p.$eval(`[data-episodio="${Bid}"] .settore-punto`, (e) => { const r = e.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; });
          const sopra = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e?.closest('[data-episodio]')?.dataset.episodio + ' ' + (e?.className?.baseVal ?? e?.className ?? ''); }, c);
          await p.touchscreen.tap(c[0], c[1]); await p.waitForTimeout(30); prove++;
          const sel = await p.getAttribute('[data-scheda-episodio]', 'data-scheda-episodio');
          if (sel !== Bid) { falliti.push(`${A}→${Bid} (sotto il dito: ${sopra})`); coperti.add(Bid); }
        }
      }
    }
    log(`${l}×${a}: tocchi ${prove}, falliti ${falliti.length}; episodi a volte non sceglibili: ${[...coperti].join(',') || 'nessuno'}`);
    if (falliti.length) log(`  esempi: ${falliti.slice(0, 6).join(' | ')}`);
    await p.context().close();
  }
}

writeFileSync(join(OUT, 'resa.json'), JSON.stringify(RIS, (k, v) => (v instanceof Set ? [...v] : v), 1));
await b.close(); srv.close();
