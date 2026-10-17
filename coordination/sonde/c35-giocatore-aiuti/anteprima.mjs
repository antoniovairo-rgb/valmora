// anteprima.mjs <ep> <ondata>: info, eventi, chiamate e opzioni (testi veri dei dati), per decidere come una giocatrice che li legge
import { readFileSync, readdirSync } from 'node:fs';
const R = '/home/user/valmora';
const T = {}; for (const f of readdirSync(`${R}/data/testi/it`)) Object.assign(T, JSON.parse(readFileSync(`${R}/data/testi/it/${f}`)));
const [ep, n] = process.argv.slice(2); const m = JSON.parse(readFileSync(`${R}/data/missioni/${ep}.json`)); const o = m.ondate[Number(n) - 1];
const t = (k) => (k ? (T[k.replace(/^testi:/, '') + '@f'] ?? T[k.replace(/^testi:/, '')] ?? k) : '');
console.log(`${ep} o${n}: ${t(o.titolo ?? `testi:${ep}.ondata${n}`)} — ${t(`${ep}.ondata${n}.i`)}`);
for (const c of o.chiamate) console.log(`  [${c.id}] ${c.settore ?? '-'} ${c.se ? 'SE ' + JSON.stringify(c.se) : ''}: ${t(c.testo)}\n${c.opzioni.map((x) => `     ${x.id}: ${t(x.testo)} — ${t(x.costo ?? x.testo + '.c')}`).join('\n')}`);
