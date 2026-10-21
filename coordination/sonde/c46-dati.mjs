// C-046: conteggi sui dati (0.45.0). Uso: node coordination/sonde/c46-dati.mjs   (solo lettura di data/)
import { readFileSync, readdirSync } from 'node:fs';
const T = {}; for (const f of readdirSync('data/testi/it')) Object.assign(T, JSON.parse(readFileSync(`data/testi/it/${f}`, 'utf8')));
const tx = (k) => (typeof k === 'string' && k.startsWith('testi:') ? T[k.slice(6)] ?? `«MANCA ${k}»` : k);
const eps = []; for (const f of readdirSync('data/imprevisti').sort()) { const d = JSON.parse(readFileSync(`data/imprevisti/${f}`, 'utf8')); eps.push(d); }
const out = {};
let nImp = 0, nOpz = 0, riserva = [], correreConEffetto = [], correreTot = 0, scad = [], costi = new Map(), etichetteUnita = [], apprezza = [];
const RE_SCAD = /\b(fra|tra|entro|in)\s+(\w+\s+){0,2}(minut|second|ora\b|ore\b)|scad|subito|\badesso\b|\bora\b|conto alla rovescia|tempo (che )?(scade|resta)/i;
const RE_UNITA = /\b(squadr|steward|mediator)/i;
for (const d of eps) for (const i of d.imprevisti) {
  nImp++; const c = i.chiamata, ops = c.opzioni; const testo = tx(c.testo);
  if (RE_SCAD.test(testo)) scad.push(`${d.id} ${c.id}: ${testo}`);
  ops.forEach((o, k) => {
    nOpz++;
    const ris = (o.effetti ?? []).some((e) => 'riserva' in e); if (ris) riserva.push(`${d.id} ${c.id}/${o.id}`);
    if (k === ops.length - 1) { correreTot++; if ((o.effetti ?? []).length) correreConEffetto.push(`${d.id} ${c.id}/${o.id}`); const cc = tx(o.costo); costi.set(cc, (costi.get(cc) ?? 0) + 1); }
    if (RE_UNITA.test(tx(o.testo)) && !ris) etichetteUnita.push(`${d.id} ${c.id}/${o.id}: «${tx(o.testo)}»`);
  });
}
const ripetuti = [...costi].filter(([, n]) => n > 1);
// «il comando apprezza / è contento / approva» senza fiducia, in costo (.c) e risposta (.r) di TUTTE le opzioni (missioni + imprevisti)
const RE_CMD = /comando\s+(apprezz|è contento|approva|ti dà fiducia|ti copre)|apprezzano|il comando (è )?(soddisfatto|contento)/i;
function opzioniMissione(m) { const r = []; for (const o of m.ondate ?? []) for (const c of o.chiamate ?? []) for (const x of c.opzioni ?? []) r.push([m.id, c.id, x]); return r; }
const miss = readdirSync('data/missioni').filter((f) => /^e\d\d\.json$/.test(f)).sort().map((f) => JSON.parse(readFileSync(`data/missioni/${f}`, 'utf8')));
const tutte = [...miss.flatMap(opzioniMissione), ...eps.flatMap((d) => d.imprevisti.map((i) => i.chiamata).flatMap((c) => c.opzioni.map((x) => [d.id, c.id, x])))];
for (const [e, c, x] of tutte) { const fid = (x.effetti ?? []).some((v) => v.aggiungi === 'credito'); for (const k of ['costo', 'risposta']) { const t = tx(x[k]); if (t && RE_CMD.test(t) && !fid) apprezza.push(`${e} ${c}/${x.id}.${k === 'costo' ? 'c' : 'r'}: ${t}`); } }
// e02 comunicato e verbale degenerato
const e02 = miss.find((m) => m.id === 'e02'); const com = tutte.find(([e, c, x]) => e === 'e02' && x.id === 'comunicato');
const e02deg = JSON.stringify(e02.esiti ?? e02).match(/"testi:e02[^"]*degener[^"]*"/g);
out.imprevisti = nImp; out.opzioni = nOpz;
out.opzioni_con_riserva = riserva.length; out.riserva_elenco = riserva;
out.lascia_correre_totale = correreTot; out.lascia_correre_con_effetto = correreConEffetto.length; out.lascia_correre_con_effetto_elenco = correreConEffetto;
out.scadenze_nei_testi_di_chiamata = scad;
out.costi_lascia_correre_ripetuti = ripetuti; out.costi_lascia_correre_ripetuti_righe = ripetuti.reduce((t, [, n]) => t + n, 0);
out.etichette_con_unita_senza_riserva = etichetteUnita.length; out.etichette_elenco = etichetteUnita;
out.comando_apprezza_senza_fiducia = apprezza;
out.e02_comunicato_effetti = com ? com[2].effetti : 'non trovato'; out.e02_degenerato_chiavi = e02deg;
console.log(JSON.stringify(out, null, 1));
