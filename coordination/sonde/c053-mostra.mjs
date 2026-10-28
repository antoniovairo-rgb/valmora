import { readFileSync } from 'node:fs';
const R = JSON.parse(readFileSync('coordination/collaudi/c053/dati/testi-nuovi.json', 'utf8'));
const eps = process.argv[2].split(','), sole = process.argv[3];
for (const r of R.filter((x) => eps.includes(x.ep) && (!sole || x.tipo.startsWith(sole)))) console.log(`### ${r.ep} o${r.ondata} ${r.tipo} ${r.id} [${r.fonte}/${r.settore}]${r.finestra ? ' fin ' + r.finestra : r.dopo ? ' dopo ' + r.dopo : ''}\n${r.testo}\n> ${r.commento ?? ''}\n` + r.opzioni.map((o) => `- ${o.testo} (${o.costo ?? ''}) → ${o.risposta}`).join('\n') + '\n');
