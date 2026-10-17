// Sonda C-035: novità 0.35.0 (solo dati e testi) giocate con la logica vera su molti semi.
//  1. C34-03 e35: barca bloccata / seguita in ondata 1 → chiamata delle banchine in ondata 3, testi a schermo dopo la
//     scelta, verbali; frasi che smentiscono il ramo.
//  2. C34-02 e21 pullman21: pressione e tensione di piazzale e quartiere prima e dopo la risposta, e a fine ondata.
//  3. C34-06 e13/e17 (e e35): partite fallite, ondata e settori degenerati, frasi del verbale di fallimento.
//  4. C34-10 e02 caldo_casa: opzioni a schermo con e senza mediatore col corteo.
// I dati si leggono da <radice>/data (0.35.0 = repository; braccio rosso = worktree della 0.34.0); la logica è quella
// del repository (src/logica non cambia fra 0.34.0 e 0.35.0: git diff acf1151 e7f00cc -- src/logica vuoto).
// Uso: node coordination/sonde/c35-dati.mjs <radice dati> [semi=1000] > uscita.json
import { join } from 'node:path';
import { leggiDati } from '../../tools/dati-disco.mjs';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, DEGENERA, iniziaMissione, missioneFinita, opzioniValide, rispondi, schiera } from '../../src/logica/missione.ts';
import { attenta, casuale } from '../../src/logica/bot.ts';
import { creaCaso } from '../../src/logica/caso.ts';

const R = process.argv[2] ?? '.'; const N = Number(process.argv[3] ?? 1000);
const d = leggiDati(join(R, 'data'));
const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const ep = (id) => d[`missioni/${id}.json`];
const T = (id) => d[`testi/it/${id}.json`];
const t = (id, k) => (k ? T(id)[k.replace(/^testi:/, '')] ?? `?${k}` : '');

/** Partita: schieramento del bot (casuale o attento), risposte forzate dove indicato, il resto a caso. */
function gioca(id, forza, seme, strat = 'casuale') {
  const m = ep(id); const caso = creaCaso(`c35:${id}:${seme}`); const g = (strat === 'attenta' ? attenta : casuale)(caso, dich);
  let s = iniziaMissione(m, v0, dich); const viste = []; const passi = [];
  while (!missioneFinita(m, s)) {
    s = schiera(m, s, g.schiera(m, s));
    for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) {
      const ops = opzioniValide(c, s, m); const o = ops.find((x) => x.id === forza[c.id]) ?? caso.scegli(ops);
      viste.push({ n: s.ondata, c: c.id, settore: c.settore, ops: ops.map((x) => x.id), scelta: o.id, testi: [t(id, c.testo), ...ops.flatMap((x) => [t(id, x.testo), t(id, x.costo)]), t(id, o.risposta)] });
      const prima = s; s = rispondi(m, s, c.id, o.id, dich); passi.push({ c: c.id, o: o.id, prima, dopo: s });
    }
    s = chiudiOndata(m, s, dich);
  }
  return { m, s, viste, passi, esito: concludiMissione(m, s, dich) };
}
const conta = (a) => a.reduce((o, x) => ((o[x] = (o[x] ?? 0) + 1), o), {});
const out = { radice: R, semi: N };

// 1. e35 barca
const SMENTITE = { blocca_barca: [/tornata/i, /barca partita/i, /andata e tornata/i, /lungo la costa/i, /parte\b/i], segui_barca: [/ancora al pontile/i, /ormeggiata/i, /apri.* scatoloni/i] };
out.e35 = {};
for (const barca of ['blocca_barca', 'segui_barca']) {
  const r = { partite: 0, barca_in_o1: 0, chiamate_o3_banchine: {}, opzioni_o3: {}, esiti: {}, smentite: {}, verbali: {} };
  for (let seme = 1; seme <= N; seme++) {
    const g = gioca('e35', { barca_porto: barca }, seme);
    r.partite++; if (g.s.scelte.some((x) => x.chiamata === 'barca_porto' && x.opzione === barca)) r.barca_in_o1++;
    const o3 = g.viste.filter((v) => v.n === 3 && v.settore === 'banchine');
    const k = o3.map((v) => v.c).join('+') || '(nessuna)'; r.chiamate_o3_banchine[k] = (r.chiamate_o3_banchine[k] ?? 0) + 1;
    for (const v of o3) { const j = v.ops.join(','); r.opzioni_o3[j] = (r.opzioni_o3[j] ?? 0) + 1; }
    const e = g.esito.esito; r.esiti[e.id] = (r.esiti[e.id] ?? 0) + 1;
    const verb = t('e35', e.verbale); r.verbali[e.id] = verb;
    const i = g.viste.findIndex((v) => v.c === 'barca_porto');
    for (const x of [...g.viste.slice(i + 1).flatMap((v) => v.testi), verb]) for (const re of SMENTITE[barca]) if (re.test(x)) r.smentite[`${re} «${x}»`] = (r.smentite[`${re} «${x}»`] ?? 0) + 1;
  }
  out.e35[barca] = r;
}
// e35: dopo ferma_uomo, testi che dicono «spariti» (C34-03, faldoni)
out.e35.faldoni_dopo_ferma_uomo = conta(Array.from({ length: Math.min(N, 300) }, (_, i) => gioca('e35', { posto_prenotato: 'ferma_uomo' }, i + 1)).flatMap((g) => { const i = g.viste.findIndex((v) => v.c === 'posto_prenotato'); return [...g.viste.slice(i + 1).flatMap((v) => v.testi), t('e35', g.esito.esito.verbale)].filter((x) => /spari|faldoni/i.test(x)); }));

// 2. e21 pullman21: pressione = eventi dell'ondata + modifiche delle risposte (come chiudiOndata, senza dimezzatori)
const pressioni = (m, s, settore) => (s.modifiche[settore] ?? 0) + m.ondate[s.ondata - 1].eventi.filter((e) => e.settore === settore).reduce((a, e) => a + e.pressione, 0);
out.e21 = {};
for (const strat of ['attenta', 'casuale']) for (const op of ['subito21', 'trattieni21']) {
  const r = { partite: 0, viste: 0, delta: {}, tensione_fine_o4: { piazzale: [], quartiere: [] }, scoperto_o4: { piazzale: 0, quartiere: 0 }, costo: '', risposta: '', bollino: '' };
  for (let seme = 1; seme <= N; seme++) {
    const g = gioca('e21', { pullman21: op }, seme, strat); r.partite++;
    const p = g.passi.find((x) => x.c === 'pullman21'); if (!p || p.o !== op) continue; r.viste++;
    for (const st of ['piazzale', 'quartiere']) {
      const k = `${st}: pressione ${pressioni(g.m, p.prima, st)}→${pressioni(g.m, p.dopo, st)}, tensione ${p.prima.tensione[st] ?? 0}→${p.dopo.tensione[st] ?? 0}`;
      r.delta[k] = (r.delta[k] ?? 0) + 1;
      const o4 = g.s.rapporti[3]; r.tensione_fine_o4[st].push(o4.tensione[st] ?? 0); if (o4.scoperto[st] > 0) r.scoperto_o4[st]++;
    }
  }
  const c = ep('e21').ondate[3].chiamate.find((x) => x.id === 'pullman21'); const o = c.opzioni.find((x) => x.id === op);
  r.costo = t('e21', o.costo); r.risposta = t('e21', o.risposta); r.bollino = c.settore;
  for (const st of ['piazzale', 'quartiere']) { const a = r.tensione_fine_o4[st]; r.tensione_fine_o4[st] = { media: +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(2), min: Math.min(...a), max: Math.max(...a), n: a.length }; }
  out.e21[`${strat}/${op}`] = r;
}
out.e21.ondata1_i = t('e21', 'e21.ondata1.i'); out.e21.info_comune = t('e21', 'e21.info_comune');

// 3. fallimenti: e13, e17, e35 (e casuale = molti fallimenti diversi)
out.fallimenti = {};
for (const id of ['e13', 'e17', 'e35']) {
  const r = { partite: 0, fallite: 0, verbale: '', prima_ondata_oltre_6: {}, degenerati: {}, senza_settore_degenerato: 0, tensione_da_risposta: 0, esempi: [] };
  for (let seme = 1; seme <= N; seme++) {
    const g = gioca(id, {}, seme); r.partite++;
    if (!g.esito.esito.fallita) continue; r.fallite++; r.verbale = t(id, g.esito.esito.verbale);
    const rap = g.s.rapporti;
    const n = rap.find((x) => Math.max(...Object.values(x.picco ?? x.tensione)) >= DEGENERA)?.n ?? '-'; r.prima_ondata_oltre_6[n] = (r.prima_ondata_oltre_6[n] ?? 0) + 1;
    const deg = [...new Set(rap.flatMap((x) => Object.keys(x.tensione).filter((k) => x.tensione[k] >= DEGENERA && x.scoperto[k] > 0)))].sort();
    for (const k of deg) r.degenerati[k] = (r.degenerati[k] ?? 0) + 1;
    if (!deg.length) { r.senza_settore_degenerato++; if (r.esempi.length < 3) r.esempi.push({ seme, rapporti: rap.map((x) => ({ n: x.n, scoperto: Object.fromEntries(Object.entries(x.scoperto).filter(([, v]) => v)), tensione: x.tensione, picco: x.picco })), scelte: g.s.scelte.map((x) => `${x.ondata}:${x.chiamata}/${x.opzione}`) }); }
  }
  out.fallimenti[id] = r;
}

// 4. e02 caldo_casa
out.e02 = {};
for (const cv of ['mediatore_corteo', 'corteo_scortato', 'corteo_no']) {
  const viste = Array.from({ length: Math.min(N, 200) }, (_, i) => gioca('e02', { corteo_viale: cv }, i + 1).viste.find((x) => x.c === 'caldo_casa'));
  out.e02[cv] = conta(viste.map((v) => (v ? v.ops.map((o) => `${o}: «${t('e02', ep('e02').ondate[2].chiamate.find((c) => c.id === 'caldo_casa').opzioni.find((x) => x.id === o).testo)}»`).join(' | ') : '(non vista)')));
}
console.log(JSON.stringify(out, null, 1));
