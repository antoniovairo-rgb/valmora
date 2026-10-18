// Misura S-04 (D-155): quanto la fiducia («credito») segue la qualità delle scelte, episodio per episodio.
// Sola misura: legge data/ e usa la logica di src/logica senza cambiarla. Ogni punto di fiducia si attribuisce alla sua
// causa (risposta a una chiamata, premio dell'ondata D-113, effetti dell'esito), misurando il valore prima e dopo ogni passo.
// Bot: «casuale» (stessi semi di tools/bot.mjs, quindi le stesse fallite di controllaDifficolta), «schieramento attento +
// scelte a caso» (isola l'effetto delle risposte, come sceltePesano) e le deterministiche attenta/equilibrata/peggiore.
// Varianti (correzioni candidate) applicate SOLO in memoria: i dati su disco non cambiano.
// Uso: node tools/misura-fiducia.mjs [semi=1000] [uscita.json]
import { writeFileSync } from 'node:fs';
import { leggiDati } from './dati-disco.mjs';
import { creaCaso } from '../src/logica/caso.ts';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { DEGENERA, VAR_FIDUCIA, chiamateAperte, chiudiOndata, concludiMissione, iniziaMissione, missioneFinita, opzioniValide, rispondi, schiera } from '../src/logica/missione.ts';
import { attenta, casuale, equilibrata, peggiore } from '../src/logica/bot.ts';
import { valutaEpisodio } from '../src/logica/episodi.ts';

const F = VAR_FIDUCIA;

// ---------- statistica ----------
export function riassunto(xs) {
  const n = xs.length;
  if (!n) return { n: 0 };
  const o = [...xs].sort((a, b) => a - b);
  const media = xs.reduce((a, b) => a + b, 0) / n;
  const ds = n > 1 ? Math.sqrt(xs.reduce((a, x) => a + (x - media) ** 2, 0) / (n - 1)) : 0;
  const mediana = n % 2 ? o[(n - 1) / 2] : (o[n / 2 - 1] + o[n / 2]) / 2;
  return { n, media: +media.toFixed(2), mediana, ds: +ds.toFixed(2), min: o[0], max: o[n - 1] };
}
export function pearson(xs, ys) {
  const n = xs.length; if (n < 3) return null;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
  return sxx && syy ? +(sxy / Math.sqrt(sxx * syy)).toFixed(3) : null;
}

// ---------- partita tracciata ----------
/** premioOndata(rapporto, prima, dopo) → fiducia dopo l'ondata (variante del motore); null = motore com'è. */
export function giocaTracciata(m, iniziali, dich, g, premioOndata = null) {
  let s = iniziaMissione(m, iniziali, dich);
  const f0 = s.variabili[F];
  const scelte = []; const ondate = [];
  while (!missioneFinita(m, s)) {
    s = schiera(m, s, g.schiera(m, s));
    for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) {
      const op = g.scegli(m, s, c);
      const prima = s.variabili[F];
      s = rispondi(m, s, c.id, op, dich);
      scelte.push({ ondata: s.ondata, chiamata: c.id, opzione: op, delta: s.variabili[F] - prima });
    }
    const prima = s.variabili[F];
    s = chiudiOndata(m, s, dich);
    const r = s.rapporti.at(-1);
    if (premioOndata) s = { ...s, variabili: { ...s.variabili, [F]: premioOndata(r, prima, dich.get(F)) } };
    const scoperti = Object.values(r.scoperto).filter((x) => x > 0).length;
    const degenerati = Object.entries(r.tensione).filter(([k, t]) => t >= DEGENERA && (r.scoperto[k] ?? 0) > 0).length;
    ondate.push({ n: r.n, delta: s.variabili[F] - prima, scoperti, degenerati });
  }
  const primaEsito = s.variabili[F];
  const e = concludiMissione(m, s, dich);
  const v = valutaEpisodio(m, e);
  return {
    esito: e.esito.id, fallita: v.fallita, stelle: v.stelle, tensione: e.variabili.tensione_max, f0, fFine: e.variabili[F],
    daScelte: scelte.reduce((a, x) => a + x.delta, 0), daOndate: ondate.reduce((a, x) => a + x.delta, 0), daEsito: e.variabili[F] - primaEsito,
    scoperti: ondate.reduce((a, x) => a + x.scoperti, 0), degenerati: ondate.reduce((a, x) => a + x.degenerati, 0), scelte, ondate,
  };
}

// ---------- varianti (in memoria) ----------
const clona = (x) => structuredClone(x);
const perOpzione = (dati, fn) => { const d = clona(dati); for (const [k, m] of Object.entries(d)) if (k.startsWith('missioni/')) for (const o of m.ondate) for (const c of o.chiamate ?? []) for (const op of c.opzioni) fn(m, c, op); return d; };
export const VARIANTI = {
  base: { dati: (d) => d },
  /** A: le opzioni misurate come «perverse» (elenco calcolato sulla base) perdono il loro effetto sulla fiducia. */
  A_azzera_perverse: { dati: (d, perverse) => perOpzione(d, (m, c, op) => { if (perverse.has(`${m.id}/${c.id}/${op.id}`)) op.effetti = op.effetti.filter((e) => (e.aggiungi ?? e.imposta) !== F); }) },
  /** B: nessuna risposta muove la fiducia di più di 1 punto (i ±2 diventano ±1). */
  B_scelte_max1: { dati: (d) => perOpzione(d, (_m, _c, op) => { for (const e of op.effetti) if (e.aggiungi === F && Math.abs(e.valore) > 1) e.valore = Math.sign(e.valore); }) },
  /** C: premio dell'ondata più forte (motore): +1 se nessun settore è scoperto, −1 per ogni scoperto, −2 per ogni degenerato. */
  C_ondata_forte: { dati: (d) => d, premio: (r, prima, dich) => {
    const scop = Object.entries(r.scoperto).filter(([, x]) => x > 0);
    const deg = scop.filter(([k]) => (r.tensione[k] ?? 0) >= DEGENERA).length;
    const p = scop.length ? -(scop.length - deg) - 2 * deg : 1;
    return Math.max(dich.min, Math.min(dich.max, prima + p));
  } },
};

// ---------- misura ----------
const contesto = (dati) => {
  const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
  return { dich, iniziali: variabiliIniziali(dich.values()), missioni: Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m).sort((a, b) => a.id.localeCompare(b.id)) };
};
const BOT = {
  casuale: (m, seme, dich) => casuale(creaCaso(`${m.id}:casuale:${seme}`), dich),
  attento_scelte_caso: (m, seme, dich) => { const caso = creaCaso(`fiducia:${m.id}:${seme}`); return { schiera: attenta(caso, dich).schiera, scegli: (mm, s, c) => caso.scegli(opzioniValide(c, s, mm)).id }; },
};
const DET = { attenta, equilibrata, peggiore };

function perEpisodio(partite) {
  const delta = (xs) => riassunto(xs.map((p) => p.fFine - p.f0));
  const ok = partite.filter((p) => !p.fallita), ko = partite.filter((p) => p.fallita);
  const fin = partite.map((p) => p.fFine);
  return {
    n: partite.length, fallite: +(100 * ko.length / partite.length).toFixed(1),
    treStelle: +(100 * partite.filter((p) => p.stelle === 3).length / partite.length).toFixed(1),
    deltaRiuscite: delta(ok), deltaFallite: delta(ko),
    fonti: { scelte: riassunto(partite.map((p) => p.daScelte)), ondate: riassunto(partite.map((p) => p.daOndate)), esito: riassunto(partite.map((p) => p.daEsito)) },
    corr: { fallita: pearson(fin, partite.map((p) => +p.fallita)), degenerati: pearson(fin, partite.map((p) => p.degenerati)), scoperti: pearson(fin, partite.map((p) => p.scoperti)), tensione: pearson(fin, partite.map((p) => p.tensione)) },
  };
}

/** Per ogni opzione: quante volte, effetto medio sulla fiducia, fallite e tensione quando la scegli contro le altre opzioni della stessa chiamata. */
function perOpzioni(m, partite) {
  const tab = new Map();
  for (const p of partite) {
    const viste = new Map(p.scelte.map((x) => [x.chiamata, x]));
    for (const [ch, x] of viste) {
      const k = `${m.id}/${ch}/${x.opzione}`;
      const t = tab.get(k) ?? { chiamata: ch, opzione: x.opzione, n: 0, delta: 0, ko: 0, tens: 0, fin: 0 };
      t.n++; t.delta += x.delta; t.ko += +p.fallita; t.tens += p.tensione; t.fin += p.fFine; tab.set(k, t);
    }
  }
  const out = [];
  for (const [k, t] of tab) {
    const altre = [...tab.values()].filter((u) => u.chiamata === t.chiamata && u !== t);
    const n2 = altre.reduce((a, u) => a + u.n, 0); if (!n2) continue;
    const p1 = t.ko / t.n, p2 = altre.reduce((a, u) => a + u.ko, 0) / n2;
    const pp = (t.ko + altre.reduce((a, u) => a + u.ko, 0)) / (t.n + n2);
    const se = Math.sqrt(pp * (1 - pp) * (1 / t.n + 1 / n2)) || Infinity;
    const op = m.ondate.flatMap((o) => o.chiamate ?? []).find((c) => c.id === t.chiamata)?.opzioni.find((o) => o.id === t.opzione);
    const nominale = (op?.effetti ?? []).filter((e) => e.aggiungi === F).reduce((a, e) => a + e.valore, 0);
    out.push({ chiave: k, n: t.n, nAltre: n2, nominale, deltaMedio: +(t.delta / t.n).toFixed(2),
      falliteSe: +(100 * p1).toFixed(1), falliteAltre: +(100 * p2).toFixed(1), z: +((p1 - p2) / se).toFixed(2),
      tensioneSe: +(t.tens / t.n).toFixed(2), tensioneAltre: +(altre.reduce((a, u) => a + u.tens, 0) / n2).toFixed(2) });
  }
  return out;
}
/** Perversa: muove la fiducia nel verso opposto all'effetto misurato sul risultato (|z| ≥ 2 e almeno 5 punti di fallite). */
export const perversa = (o) => o.n >= 50 && o.nAltre >= 50 && Math.abs(o.falliteSe - o.falliteAltre) >= 5 && Math.abs(o.z) >= 2
  && ((o.nominale > 0 && o.z > 0) || (o.nominale < 0 && o.z < 0));

export function misura(datiBase, semi = 1000, variante = 'base', perverse = new Set(), primo = 1) {
  const V = VARIANTI[variante];
  const dati = V.dati(datiBase, perverse);
  const { dich, iniziali, missioni } = contesto(dati);
  const ep = {}; const opzioni = []; const det = {};
  for (const m of missioni) {
    ep[m.id] = { stagione: m.stagione };
    for (const [nome, bot] of Object.entries(BOT)) {
      const partite = [];
      for (let seme = primo; seme < primo + semi; seme++) partite.push(giocaTracciata(m, iniziali, dich, bot(m, seme, dich), V.premio));
      ep[m.id][nome] = perEpisodio(partite);
      if (nome === 'attento_scelte_caso') opzioni.push(...perOpzioni(m, partite));
    }
    det[m.id] = Object.fromEntries(Object.entries(DET).map(([n, st]) => { const p = giocaTracciata(m, iniziali, dich, st(creaCaso(1), dich), V.premio);
      return [n, { esito: p.esito, fallita: p.fallita, stelle: p.stelle, fFine: p.fFine, daScelte: p.daScelte, daOndate: p.daOndate, degenerati: p.degenerati }]; }));
  }
  // D-108/D-154: fallite del casuale non scendono di più di 1 punto fra episodi consecutivi della stessa stagione
  const violazioni = [];
  for (const st of [1, 2, 3]) {
    const ids = missioni.filter((m) => m.stagione === st).sort((a, b) => a.episodio - b.episodio).map((m) => m.id);
    for (let i = 1; i < ids.length; i++) { const a = ep[ids[i - 1]].casuale.fallite, b = ep[ids[i]].casuale.fallite; if (b < a - 1) violazioni.push(`${ids[i]} ${b}% < ${ids[i - 1]} ${a}%`); }
  }
  return { variante, semi, episodi: ep, opzioni, deterministiche: det, violazioniD108: violazioni };
}

/** D-160 guardiano: solo «schieramento attento + scelte a caso», per le opzioni che muovono la fiducia nel verso opposto al risultato. */
export function perverseRapide(dati, semi = 200) {
  const { dich, iniziali, missioni } = contesto(dati); const out = [];
  for (const m of missioni) {
    const partite = [];
    for (let seme = 1; seme <= semi; seme++) partite.push(giocaTracciata(m, iniziali, dich, BOT.attento_scelte_caso(m, seme, dich)));
    out.push(...perOpzioni(m, partite).filter(perversa));
  }
  return out;
}
/** D-172 (C38-04): r(fiducia finale, episodio fallito) per episodio, bot casuale con i semi di tools/bot.mjs. */
export function correlazioniCasuale(dati, semi = 1000) {
  const { dich, iniziali, missioni } = contesto(dati);
  return Object.fromEntries(missioni.map((m) => {
    const p = []; for (let s = 1; s <= semi; s++) p.push(giocaTracciata(m, iniziali, dich, BOT.casuale(m, s, dich)));
    return [m.id, pearson(p.map((x) => x.fFine), p.map((x) => +x.fallita))];
  }));
}
/** D-160: le risposte corrette non toccano più la fiducia. Rosso __NO_C16001: rimette gli effetti tolti (tolte: chiave → valore). */
export function datiD160(dati, tolte) {
  if (!globalThis.__NO_C16001) return dati;
  return perOpzione(dati, (m, c, op) => { const v = tolte[`${m.id}/${c.id}/${op.id}`]; if (v !== undefined) op.effetti = [...op.effetti, { aggiungi: F, valore: v }]; });
}

/** Rigioca le risposte di una partita vera (elenco di id in ordine) con lo schieramento attento: per ogni chiamata la prima
 *  opzione dell'elenco ancora non usata; se nessuna è offerta, l'attenta (segnata «ripiego»). */
export function rigioca(dati, id, risposte) {
  const { dich, iniziali } = contesto(dati);
  const m = dati[`missioni/${id}.json`]; const att = attenta(creaCaso(1), dich); const resto = [...risposte]; const ripieghi = [];
  const g = { schiera: att.schiera, scegli: (mm, s, c) => {
    const i = resto.findIndex((r) => opzioniValide(c, s, mm).some((o) => o.id === r));
    if (i < 0) { const x = att.scegli(mm, s, c); ripieghi.push(`${c.id}/${x}`); return x; }
    return resto.splice(i, 1)[0];
  } };
  return { ...giocaTracciata(m, iniziali, dich, g), ripieghi, nonUsate: resto };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const semi = Number(process.argv[2] ?? 1000); const uscita = process.argv[3];
  const dati = leggiDati();
  const base = misura(dati, semi);
  const perverse = new Set(base.opzioni.filter(perversa).map((o) => o.chiave));
  const varianti = Object.fromEntries(Object.keys(VARIANTI).filter((v) => v !== 'base').map((v) => [v, misura(dati, semi, v, perverse)]));
  const collaudo = {
    e03: rigioca(dati, 'e03', 'rimozione ascolta_comitato parcheggio_lontano steward_laser pattuglia_vie steward_torcia rinforzi_notte devia_tifosi cordone_curve trattieni_ospiti3 vie_chiuse commento_tv'.split(' ')),
    e28: rigioca(dati, 'e28', 'squadra_magazzino lascia_auto aspetta_testimone lascia_striscione pista_fonderie apri_settore fingi_niente lascia_intendere niente_cordone lascia_corteo nomi_fonti ospiti_primi'.split(' ')),
  };
  const tutto = { base, perverse: [...perverse], varianti, collaudo };
  if (uscita) writeFileSync(uscita, JSON.stringify(tutto, null, 1));
  const riga = (id, e) => `${id} fallite ${e.casuale.fallite}% | Δ riuscite ${e.casuale.deltaRiuscite.media ?? '—'} (med ${e.casuale.deltaRiuscite.mediana ?? '—'}, ds ${e.casuale.deltaRiuscite.ds ?? '—'}, n ${e.casuale.deltaRiuscite.n}) · Δ fallite ${e.casuale.deltaFallite.media ?? '—'} (med ${e.casuale.deltaFallite.mediana ?? '—'}, ds ${e.casuale.deltaFallite.ds ?? '—'}, n ${e.casuale.deltaFallite.n}) | r(fiducia,fallita) ${e.casuale.corr.fallita}`;
  for (const [id, e] of Object.entries(base.episodi)) console.log(riga(id, e));
  console.log(`opzioni perverse: ${perverse.size} su ${base.opzioni.filter((o) => o.nominale).length} che muovono la fiducia`);
  for (const [v, r] of Object.entries({ base, ...varianti })) console.log(`${v}: violazioni D-108 ${r.violazioniD108.length} ${JSON.stringify(r.violazioniD108)}`);
}
