// C38-03 (D-172): tempo di confrontoScelte per episodio (Node, 200 partite), e il caso e14 seduti/in_piedi.
import { leggiDati } from '../../../tools/dati-disco.mjs';
import { confrontoScelte } from '../../../src/logica/confronto.ts';
import { riassunto } from '../../../tools/misura-fiducia.mjs';
const semi = Number(process.argv[2] ?? 200);
const d = leggiDati(); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x]));
const ms = Object.entries(d).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m).sort((a, b) => a.id.localeCompare(b.id));
const tempi = [];
for (const m of ms) { const t = performance.now(); confrontoScelte(m, dich, semi); tempi.push(+(performance.now() - t).toFixed(1)); }
console.log(`ms per episodio (${semi} partite):`, JSON.stringify(riassunto(tempi)), 'max', ms[tempi.indexOf(Math.max(...tempi))].id);
const c = confrontoScelte(ms.find((m) => m.id === 'e14'), dich, semi);
for (const k of ['seduti/in_piedi', 'seduti/settore_lavori', 'quillhaven_posti/cambio_biglietti']) console.log('e14', k, JSON.stringify(c.get(k), (kk, v) => (typeof v === 'number' ? +v.toFixed(2) : v)));
