// C41-01/02 (D-182): su 36 episodi × 20 partite del casuale (+ attenta, equilibrata, peggiore) conta nel bilancio:
// A) pesi che toccano solo settori rimasti sotto controllo da quell'ondata in poi; B) voci senza effetti visibili fra aiuti
// e pesi (righe «Ondata N ·» vuote); C) pesi esclusi dal limite di 3 che hanno caricato un settore poi scoperto mentre fra i
// 3 c'è un peso che non l'ha fatto; D) bilanci vuoti con scelte. Uso: node … [rosso: C41B01,C41B02]
import { readFileSync } from 'node:fs';
import { leggiDati } from '../../../tools/dati-disco.mjs';
import { variabiliIniziali } from '../../../src/logica/condizioni.ts';
import { giocaMissione } from '../../../src/logica/missione.ts';
import { STRATEGIE } from '../../../src/logica/bot.ts';
import { creaCaso } from '../../../src/logica/caso.ts';
import { bilancio } from '../../../src/logica/bilancio.ts';
import { daTabella } from '../../../src/logica/confronto.ts';
for (const r of (process.argv[2] ?? '').split(',').filter(Boolean)) globalThis[`__NO_${r}`] = true;
const d = leggiDati(); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x])); const v0 = variabiliIniziali(dich.values());
const tab = JSON.parse(readFileSync('src/logica/confronti.json', 'utf8'));
const ms = Object.entries(d).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m);
const colpiti = (r, n) => new Set(r.rapporti.filter((o) => o.n >= n).flatMap((o) => Object.entries(o.scoperto).filter(([, x]) => x > 0).map(([k]) => k)));
const settori = (v) => v.impatti.filter((i) => (i.tipo === 'pressione' || i.tipo === 'tensione') && i.dove);
let A = 0, B = 0, C = 0, D = 0, voci = 0, partite = 0; const es = { A: [], B: [], C: [] };
for (const m of ms) { const c = daTabella(tab, m.id);
  const giochi = [...Array.from({ length: 20 }, (_, s) => ['casuale', s + 1]), ['attenta', 1], ['equilibrata', 1], ['peggiore', 1]];
  for (const [n, s] of giochi) {
    const r = giocaMissione(m, v0, dich, STRATEGIE[n](creaCaso(`c41:${m.id}:${n}:${s}`), dich)); if (!r.scelte.length) continue; partite++;
    const b = bilancio(m, r, 3, c); const tutti = bilancio(m, r, 99, c);
    voci += b.aiuti.length + b.pesi.length; if (!b.aiuti.length && !b.pesi.length) D++;
    for (const v of [...b.aiuti, ...b.pesi]) if (!v.impatti.length) { B++; es.B.push(`${m.id} ${v.opzione}`); }
    for (const v of b.pesi) { const sx = settori(v); if (sx.length && sx.every((i) => !colpiti(r, v.ondata).has(i.dove))) { A++; es.A.push(`${m.id} ${v.opzione}`); } }
    const carica = (v) => settori(v).some((i) => i.valore > 0 && colpiti(r, v.ondata).has(i.dove));
    const fuori = tutti.pesi.filter((v) => !b.pesi.some((x) => x.chiamata === v.chiamata && x.ondata === v.ondata) && carica(v));
    if (fuori.length && b.pesi.some((v) => !carica(v))) { C++; es.C.push(`${m.id} ${fuori.map((v) => v.opzione).join('+')}`); }
  } }
console.log(`${partite} partite, ${voci} voci: A pesi solo su settori sotto controllo ${A}; B voci senza effetti ${B}; C verbali con un peso decisivo lasciato fuori ${C}; D bilanci vuoti ${D}`);
for (const k of ['A', 'B', 'C']) console.log(k, [...new Set(es[k])].slice(0, 8).join(' | '));
