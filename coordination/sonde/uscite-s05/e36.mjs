import { leggiDati } from '../../../tools/dati-disco.mjs';
import { giraBot } from '../../../tools/bot.mjs';
const d = leggiDati(); const agg = process.argv.slice(2); // es. gol_derby/festa_libera
const x = Object.fromEntries(Object.entries(d).filter(([k]) => !k.startsWith('missioni/') || k === 'missioni/e36.json'));
const m = structuredClone(x['missioni/e36.json']);
for (const a of agg) { const [c, o] = a.split('/'); m.ondate.flatMap((w) => w.chiamate ?? []).find((q) => q.id === c).opzioni.find((q) => q.id === o).effetti.push({ aggiungi: 'credito', valore: -1 }); }
x['missioni/e36.json'] = m;
const tot = {}; for (const r of giraBot(x, 1000)) for (const [e, n] of Object.entries(r.esiti)) tot[e] = (tot[e] ?? 0) + n;
console.log(agg.join(' '), JSON.stringify(tot));
