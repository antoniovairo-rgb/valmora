// Secondo giro D-160 (D-169): toglie l'effetto su credito alle opzioni elencate e riscrive i testi del costo.
// Uso: node coordination/sonde/uscite-s05/applica-giro2.mjs coordination/sonde/uscite-s05/giro2.json
import fs from 'node:fs';
const { lista, testi } = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const L = new Set(lista); const q = 'tests/dati/fiducia-d160.json'; const reg = JSON.parse(fs.readFileSync(q, 'utf8'));
for (const ep of new Set(lista.map((k) => k.split('/')[0]))) {
  const p = `data/missioni/${ep}.json`; let s = fs.readFileSync(p, 'utf8'); const atteso = JSON.parse(s);
  for (const o of atteso.ondate) for (const c of o.chiamate ?? []) for (const op of c.opzioni) {
    if (!L.has(`${ep}/${c.id}/${op.id}`)) continue;
    reg.tolte[`${ep}/${c.id}/${op.id}`] = op.effetti.find((e) => e.aggiungi === 'credito').valore;
    op.effetti = op.effetti.filter((e) => e.aggiungi !== 'credito');
    const ic = s.indexOf(`"id": "${c.id}"`); const io = s.indexOf(`"id": "${op.id}"`, ic);
    const ia = s.indexOf('"aggiungi": "credito"', s.indexOf('"effetti"', io));
    const a = s.lastIndexOf('{', ia); const b = s.indexOf('}', ia) + 1; let x = a, y = b;
    const dopo = s.slice(b).match(/^\s*,\s*/); if (dopo) y = b + dopo[0].length; else { const prima = s.slice(0, a).match(/,\s*$/); if (prima) x = a - prima[0].length; }
    s = s.slice(0, x) + s.slice(y);
  }
  s = s.replace(/"effetti": \[\n[ \t]*\n[ \t]*\]/g, '"effetti": []');
  if (JSON.stringify(JSON.parse(s)) !== JSON.stringify(atteso)) throw new Error(p); fs.writeFileSync(p, s);
  const pt = `data/testi/it/${ep}.json`; let t = fs.readFileSync(pt, 'utf8'); const tj = JSON.parse(t);
  for (const [k, v] of Object.entries(testi)) if (k.startsWith(`${ep}.`)) { const vec = `${JSON.stringify(k)}: ${JSON.stringify(tj[k])}`; if (!t.includes(vec)) throw new Error(k); t = t.replace(vec, `${JSON.stringify(k)}: ${JSON.stringify(v)}`); }
  JSON.parse(t); fs.writeFileSync(pt, t);
}
reg.nota += process.argv[3] ? `; ${process.argv[3]}` : '';
fs.writeFileSync(q, JSON.stringify(reg, null, 2) + '\n'); console.log(Object.keys(reg.tolte).length);
