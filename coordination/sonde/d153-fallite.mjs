import { leggiDati } from './tools/dati-disco.mjs';
import { giraBot } from './tools/bot.mjs';
import { controllaDifficolta } from './tools/passi-logica.mjs';
const d = leggiDati(); const r = giraBot(d, 1000);
const out = {};
for (const x of r.filter((y) => y.strategia === 'casuale')) out[x.missione + (x.partenza ? ' ' + x.partenza : '')] = +(100 * (x.stelle?.[0] ?? 0) / x.semi).toFixed(1);
console.log(JSON.stringify(out));
for (const st of [1, 2, 3]) console.log(`stagione ${st}:`, JSON.stringify(controllaDifficolta(r, d, st)));
