// Sonda C-028: lunghezze dei testi cambiati nella 0.22.0 contro i testi dello stesso tipo nei 36 episodi. Uso: node coordination/sonde/c28-lunghezze.mjs (dalla radice)
import { readFileSync, readdirSync } from 'node:fs';
const T = {}; for (const f of readdirSync('data/testi/it')) Object.assign(T, JSON.parse(readFileSync('data/testi/it/' + f)));
const tipo = (k) => k.replace(/^e\d\d\./, '').replace(/^(op|ch)\.[^.]+/, '$1.X').replace(/\d+/g, 'N').replace(/_[a-z_]+$/, (s) => (/^verbale/.test(k.split('.')[1]) ? '' : s));
const cambiati = ['e08.intro2', 'e21.intro1', 'e32.intro1', 'e32.verbale_degenerato', 'e33.op.parte_mezzanotte.r'];
for (const k of cambiati) { const t = tipo(k); const L = Object.entries(T).filter(([x]) => /^e\d\d\./.test(x) && tipo(x) === t).map(([, v]) => v.length).sort((a, b) => a - b);
  console.log(`${k}: ${T[k].length} car. | stesso tipo «${t}» n=${L.length} mediana ${L[L.length >> 1]} p95 ${L[Math.floor(L.length * 0.95)]} max ${L.at(-1)} | posto ${L.filter((x) => x > T[k].length).length} più lunghi`); }
