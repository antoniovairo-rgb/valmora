// Sonda C-030 (sola lettura): per una chiamata o fonte cambiata, stampa il testo nuovo e tutto ciò che lo segue o lo
// richiama: opzioni, costi, risposte, condizioni «se» della chiamata, settore, e le righe di tutti i testi e01–e36 e comune
// che contengono una parola data. Uso: node coordination/sonde/c30-testi-contesto.mjs <chiave> [parola…]
import { readFileSync } from 'node:fs';
const [k, ...parole] = process.argv.slice(2); const ep = k.split('.')[0]; const id = k.split('.').pop();
const T = {}; for (let i = 1; i <= 36; i++) Object.assign(T, JSON.parse(readFileSync(`data/testi/it/e${String(i).padStart(2, '0')}.json`, 'utf8')));
Object.assign(T, JSON.parse(readFileSync('data/testi/it/comune.json', 'utf8')));
const m = JSON.parse(readFileSync(`data/missioni/${ep}.json`, 'utf8')); const t = (s) => (typeof s === 'string' && s.startsWith('testi:') ? T[s.slice(6)] : s);
console.log(`${k}: ${T[k]}`);
for (const o of m.ondate) for (const c of o.chiamate ?? []) if (c.id === id) {
  console.log(`  ondata ${o.n} «${t(o.titolo)}», fonte ${c.fonte}, settore ${c.settore ?? '-'}, se ${JSON.stringify(c.se ?? null)}`);
  for (const p of c.opzioni) console.log(`  · ${t(p.testo)} — costo: ${t(p.costo)}\n      risposta: ${t(p.risposta)}  ${JSON.stringify(p.effetti)}`); }
for (const w of parole) { const re = new RegExp(w, 'i'); console.log(`-- «${w}»`); for (const [kk, v] of Object.entries(T)) if (re.test(v) && kk !== k) console.log(`  ${kk}: ${v}`); }
