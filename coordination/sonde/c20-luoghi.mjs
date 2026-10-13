// Sonda C-020 (PO-085, «settore giusto»): per ogni opzione della stagione 1 con effetti di tensione/pressione, i settori
// nominati nell'accenno («costo») contro i settori degli effetti (cioè le icone sotto l'opzione e i segni sulla mappa).
// Riconoscimento per parole chiave (ALIAS sotto, scritte a mano: è un aiuto alla LETTURA, non una misura esatta).
// Stampa: nominati senza effetto (N), effetti senza nome (E), e il settore della chiamata.
// Uso: node coordination/sonde/c20-luoghi.mjs [stagione=1]
import { leggiDati } from '../../tools/dati-disco.mjs';
const ST = Number(process.argv[2] ?? 1); const d = leggiDati('data');
const ALIAS = { curva_cinderwick: /curva cinderwick|curva di casa|\bcurve\b/i, curva_larkspire: /curva larkspire|\bcurve\b/i, curva_ospiti: /curva ospiti|gli ospiti|\bospiti\b|\bcurve\b/i,
  piazzale: /piazzale/i, strada_cinderwick: /strada da cinderwick|strada di cinderwick|\bla strada\b|fonderie/i, strada_larkspire: /strada da larkspire|strada di larkspire|\bla strada\b/i,
  stazione: /stazione|treno|ferrovie/i, viale_stazione: /\bviale\b/i, tornelli: /tornell|coda|ingress/i, quartiere: /quartiere|residenti|comitato/i, parcheggi: /parchegg/i,
  mercato: /mercato|commercianti|banchi/i, piazza_fonderie: /fonderie/i, tangenziale: /tangenziale|coda|corsia/i, piazza_concerto: /\bpiazza\b|concerto|palco/i, viale_concerto: /\bviale\b/i, piazza_comune: /\bpiazza\b|comune/i };
let n = 0, ok = 0; const righe = [];
for (const [k, m] of Object.entries(d)) { if (!k.startsWith('missioni/') || m.stagione !== ST) continue; const t = d[`testi/it/${m.id}.json`]; const T = (x) => t[x.replace(/^testi:/, '')] ?? x;
  for (const o of m.ondate) for (const c of o.chiamate ?? []) for (const op of c.opzioni) {
    const eff = [...new Set(op.effetti.filter((e) => (e.tensione || e.pressione) && e.valore).map((e) => e.tensione ?? e.pressione))]; if (!eff.length) continue; n++;
    const costo = op.costo ? T(op.costo) : ''; const nominati = m.mappa.settori.map((s) => s.id).filter((id) => ALIAS[id]?.test(costo));
    const senzaNome = eff.filter((s) => !ALIAS[s]?.test(costo)); const senzaEffetto = nominati.filter((s) => !eff.includes(s));
    if (!senzaNome.length) ok++; else righe.push(`${m.id}/${c.id}@${c.settore ?? '–'}/${op.id}: «${costo}» effetti=[${op.effetti.filter((e) => (e.tensione || e.pressione) && e.valore).map((e) => `${e.tensione ? 'T' : 'P'}:${e.tensione ?? e.pressione}${e.valore > 0 ? '+' : ''}${e.valore}`)}] E=[${senzaNome}] N=[${senzaEffetto}]`);
  } }
console.log(`stagione ${ST}: opzioni con effetti su un settore ${n}; ogni settore dell'effetto nominato nell'accenno ${ok}; con almeno un settore non nominato ${n - ok}`);
for (const r of righe) console.log('  ' + r);
