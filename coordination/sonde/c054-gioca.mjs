// C-054 · gioca dall'interfaccia (dist/ 0.57.0) N episodi di fila da una partita nuova con una politica sulle opzioni:
//   comoda    = l'opzione con effetti_dopo se la chiamata ne ha una (quella «che non costa subito»), altrimenti la prima; dopo un episodio fallito
//               gioca «giusta» nei tentativi successivi (il giro schiera a turno, senza leggere: con la sola comoda e02 non passa mai)
//   sbagliata = l'opzione col peggior punteggio di effetti immediati (somma di pressione e tensione in aumento, credito in calo, riserve spese)
//   giusta    = l'opzione col MIGLIOR punteggio immediato (l'inverso di sbagliata)
//   mista     = giusta, tranne e02 e e05 dove al PRIMO tentativo gioca sbagliata (2 episodi con scelte sbagliate apposta); ai tentativi dopo, giusta
//   prima     = sempre la prima
// A ogni scena di chiusura ondata registra: ondata, morsi attesi (dal salvataggio + dati), testo mostrato, scorrimento. Foto delle chiusure con morso.
// Uso: node c054-gioca.mjs <larghezza> <altezza> <politica> <n-episodi> <cartella-foto> <uscita.json> [schieramento=giro|attento]
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { leggiDati } from '../../tools/dati-disco.mjs';
import { servi, apri, scena, testo, bottoni, passo, scorr } from './c054-lib.mjs';
const [W, H, politica, nEp, cart, out] = process.argv.slice(2); mkdirSync(cart, { recursive: true });
// dati MERGIATI (missioni + imprevisti/varianti, tools/dati-disco.mjs): le chiamate «_v» e le carte stanno in data/imprevisti/, non in data/missioni/
const dati = leggiDati('data'); const mis = Object.fromEntries(Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => [m.id, m]));
const T = Object.assign({}, ...readdirSync('data/testi/it').map((f) => JSON.parse(readFileSync(`data/testi/it/${f}`, 'utf8'))));
const tt = (k) => T[String(k).replace(/^testi:/, '')] ?? `«${k}»`;
const punteggio = (o) => (o.effetti ?? []).reduce((a, e) => a + (e.pressione || e.tensione ? e.valore : e.aggiungi === 'credito' ? -e.valore : e.riserva ? -e.valore : 0), 0);
const trova = (m, cid) => m.ondate.flatMap((o) => o.chiamate ?? []).find((c) => c.id === cid);
const { srv, url } = await servi('dist'); const { browser, p, errori } = await apri(url, Number(W), Number(H), { veloce: process.env.VELOCE === '1' });
const sav = () => p.evaluate(() => { const k = Object.keys(localStorage).find((x) => /-salvataggio$/.test(x)); return k ? JSON.parse(localStorage.getItem(k)) : null; });
const idCh = () => p.evaluate(() => document.querySelector('[data-messaggio^="chiamata-"]')?.dataset.messaggio?.replace('chiamata-', '') ?? null);
const log = { politica, viewport: `${W}x${H}`, scelte: [], chiusure: [], episodi: [] };
await p.waitForTimeout(600); await p.getByRole('button', { name: /NUOVA PARTITA/i }).click(); await p.waitForTimeout(300);
await p.getByRole('button', { name: /IL NUOVO RESPONSABILE/i }).click(); await p.waitForTimeout(300);
if (await scena(p) === 'guida') { await p.click('[data-azione="guida-salta"]'); await p.waitForTimeout(300); }
let ep = 1, ultimaChiusura = '', fotoN = 0, ultimaSceltaKey = '';
const idEp = (n) => `e${String(n).padStart(2, '0')}`;
for (let g = 0; g < 4000 && ep <= Number(nEp); g++) {
  const sc = await scena(p), b = await bottoni(p);
  if (sc === 'citta') {
    if (b.includes('azione=avvia-episodio')) { await p.click('[data-azione="avvia-episodio"]').catch(() => {}); await p.waitForTimeout(200); continue; }
    if (!b.includes('azione=passo')) { await p.waitForTimeout(500); const st = Math.ceil(ep / 12); if (await p.locator(`[data-stagione="${st}"]`).count()) await p.click(`[data-stagione="${st}"]`).catch(() => {}); await p.click(`[data-episodio="${idEp(ep)}"] .settore-punto`, { force: true }).catch(() => {}); await p.waitForTimeout(400); continue; }
  }
  if (sc === 'verbale' || sc === 'epilogo') {
    const s = await sav(); const e = s?.episodi?.[idEp(ep)];
    log.episodi.push({ ep: idEp(ep), scena: sc, migliore: e?.migliore ?? null, tentativi: e?.tentativi ?? null, testo: (await testo(p)).slice(0, 200).replace(/\n/g, ' | '), scorr: await scorr(p) });
    if (e?.migliore && !e.migliore.fallita) ep++;
    writeFileSync(out, JSON.stringify(log, null, 1)); // log incrementale: se il giro si interrompe resta quanto misurato
    // ritorno alla città: tasto del verbale
    const t = p.locator('[data-azione="citta"], [data-azione="fine"], [data-azione="chiudi"], [data-azione="home"], [data-azione="verbale-citta"]').first();
    for (let k = 0; k < 6 && (await scena(p)) === sc; k++) { const bb = await bottoni(p); const x = bb.find((y) => /azione=(citta|fine|chiudi|torna-citta|verbale-citta|continua|avanti|prossimo)\b/.test(y)); if (x) await p.click(`[data-azione="${x.split('=')[1].replace('(off)', '')}"]`).catch(() => {}); else { const tb = p.getByRole('button', { name: /citt|continua|avanti|chiudi/i }).first(); if (await tb.count()) await tb.click().catch(() => {}); } await p.waitForTimeout(300); }
    continue;
  }
  if (sc === 'rapporto') { // il rapporto dell'ondata appena chiusa registra i morsi («radio»): stesso numero e stessi testi di quelli mostrati in chiusura
    const s = await sav(), r = s?.in_corso?.rapporti?.at(-1), n = s?.in_corso?.rapporti?.length, ult = log.chiusure.at(-1);
    if (r && ult && ult.rapportoN !== n) { ult.rapportoN = n; ult.radioNelRapporto = (r.radio ?? []).length; ult.radioNelRapportoUgualeAiMostrati = JSON.stringify((r.radio ?? []).map(tt).sort()) === JSON.stringify(ult.attesiTesti.slice().sort()); }
  }
  if (sc === 'chiusura') {
    const s = await sav(), ic = s?.in_corso; const m = ic && mis[ic.missione];
    if (m && ic) {
      const N = m.ondate.length, w = ic.ondata, chiave = `${ic.missione}:${w}:${s.episodi?.[ic.missione]?.tentativi ?? ''}:${ic.rapporti?.length}`; await p.waitForTimeout(300);
      const attesi = ic.scelte.filter((x) => { const o = trova(m, x.chiamata)?.opzioni.find((o) => o.id === x.opzione); return o?.effetti_dopo && Math.min(x.ondata + o.effetti_dopo.ondate, N) === w; }).map((x) => ({ scelta: x, testo: tt(trova(m, x.chiamata).opzioni.find((o) => o.id === x.opzione).effetti_dopo.rapporto), chiamataTesto: tt(trova(m, x.chiamata).testo), opzioneTesto: tt(trova(m, x.chiamata).opzioni.find((o) => o.id === x.opzione).testo) }));
      const mostrati = await p.locator('[data-radio-dopo]').allInnerTexts(); if (attesi.length && !mostrati.length) console.log('DBG', await scena(p), (await p.evaluate(() => document.querySelector('.scena')?.innerHTML ?? '')).slice(0, 1500)); const sc2 = await scorr(p);
      const r = { ep: ic.missione, ondata: w, ondate: N, mostratiTesti: mostrati.map((x) => x.trim()), scelteAlMomento: ic.scelte.map((x) => `${x.ondata}:${x.chiamata}/${x.opzione}`), ondataSalvata: ic.ondata, attesi: attesi.length, attesiTesti: attesi.map((a) => a.testo), mostrati: mostrati.length, testiUguali: JSON.stringify(attesi.map((a) => a.testo).sort()) === JSON.stringify(mostrati.map((x) => x.trim()).sort()), scorr: sc2, aCapo: !attesi.length ? tt('x') && (await testo(p)).includes('La radio tace') : null, dettagli: attesi.map((a) => ({ dopoSceltaIn: a.scelta.ondata, chiamata: a.chiamataTesto.slice(0, 90), opzione: a.opzioneTesto.slice(0, 70), messaggio: a.testo })) };
      if (chiave !== ultimaChiusura) { log.chiusure.push(r); ultimaChiusura = chiave; if (attesi.length && fotoN < 14 && (fotoN < 3 || attesi.length >= 2 || sc2.y > 0)) { await p.screenshot({ path: `${cart}/chiusura-${W}x${H}-${politica}-${ic.missione}-o${w}.jpg`, type: 'jpeg', quality: 60 }); fotoN++; } }
    }
  }
  const comuni = await p.locator('.opzioni > [data-opzione]:not([disabled])').count();
  await passo(p, async (opz) => {
    const cid = await idCh(), s = await sav(), m = mis[s?.in_corso?.missione]; const c = m && cid ? trova(m, cid) : null;
    const ids = await opz.evaluateAll((e) => e.map((x) => x.dataset.opzione)); let i = 0;
    if (c) {
      const os = ids.map((id) => c.opzioni.find((o) => o.id === id));
      if (politica === 'comoda' && !(s.episodi?.[m.id]?.tentativi)) i = Math.max(0, os.findIndex((o) => o?.effetti_dopo));
      else if (politica === 'giusta' || politica === 'comoda' || (politica === 'mista' && !(['e02', 'e05'].includes(m.id) && !(s.episodi?.[m.id]?.tentativi)))) i = os.reduce((bi, o, k) => (o && punteggio(o) < punteggio(os[bi] ?? o) ? k : bi), 0);
      else if (politica === 'sbagliata' || politica === 'mista') i = os.reduce((bi, o, k) => (o && punteggio(o) > punteggio(os[bi] ?? o) ? k : bi), 0);
      log.scelte.push({ ep: m.id, ondata: s.in_corso.ondata, chiamata: cid, opzione: ids[i], comoda: !!os[i]?.effetti_dopo, delleOpzioni: ids.length });
    }
    await opz.nth(i).click();
  });
}
log.finale = { scena: await scena(p), ep, errori, salvataggio: (({ game_version, save_version, missioni_concluse }) => ({ game_version, save_version, missioni_concluse }))((await sav()) ?? {}) };
writeFileSync(out, JSON.stringify(log, null, 1));
const cs = log.chiusure; console.log(JSON.stringify({ radioNeiRapportiDiversi: cs.filter((x) => x.attesi && x.radioNelRapportoUgualeAiMostrati === false).length, viewport: log.viewport, politica, episodiGiocati: log.episodi.length, chiusure: cs.length, conMorso: cs.filter((x) => x.attesi).length, morsiAttesi: cs.reduce((a, x) => a + x.attesi, 0), morsiMostrati: cs.reduce((a, x) => a + x.mostrati, 0), testiNonUguali: cs.filter((x) => !x.testiUguali).length, scorrimentoMax: Math.max(0, ...cs.map((x) => Math.max(x.scorr.y, x.scorr.x, x.scorr.scena ?? 0))), errori: errori.length, finale: log.finale }));
await browser.close(); srv.close();
