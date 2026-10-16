// Sonda C-029 (sola lettura): D-129 su tutte le 498 chiamate dei dati, «se» ignorato (il caso più largo, come
// tests/urgente.test.ts) e per tipo di evento: quali eventi rendono urgente e quali chiamate con un evento «grave» per tipo
// (rissa, incendio, scontro) restano non urgenti perché la pressione è sotto 4. Uso: node coordination/sonde/c29-urgenza-dati.mjs
import { readdirSync, readFileSync } from 'node:fs';
const ms = readdirSync('data/missioni').sort().map((f) => JSON.parse(readFileSync(`data/missioni/${f}`, 'utf8')));
const testi = (id) => JSON.parse(readFileSync(`data/testi/it/${id}.json`, 'utf8'));
let tot = 0, u = 0, u126 = 0, senza = 0; const perTipo = {}; const gravi = []; const urgLievi = [];
for (const m of ms) { const T = testi(m.id); for (const o of m.ondate) for (const c of o.chiamate ?? []) { tot++; if (!c.settore) { senza++; continue; }
  const e = (o.eventi ?? []).filter((x) => x.settore === c.settore); const a = e.some((x) => x.pressione >= 4); if (a) u++; if (e.length) u126++;
  for (const x of e) { const k = perTipo[x.tipo] ??= { eventi: 0, chiamate: 0, urgenti: 0 }; k.chiamate++; if (a) k.urgenti++; }
  if (!a && e.some((x) => /rissa|incendio|scontro|faida/.test(x.tipo))) gravi.push(`${m.id} o${o.n ?? ''} ${c.id} [${e.map((x) => `${x.tipo}:${x.pressione}`).join(',')}] «${String(T[c.testo] ?? T[`${c.id}`] ?? c.testo ?? '').slice(0, 90)}»`);
  if (a && e.every((x) => /folla|raduno|movimento|arrivo|deflusso|biglietti|sosta|traffico/.test(x.tipo))) urgLievi.push(`${m.id} ${c.id} [${e.map((x) => `${x.tipo}:${x.pressione}`).join(',')}]`);
} }
console.log(`chiamate ${tot}; senza settore ${senza}; urgenti D-129 ${u} (${(100 * u / tot).toFixed(1)} %); D-126 c ${u126} (${(100 * u126 / tot).toFixed(1)} %)`);
console.log('tipo evento | chiamate sul settore | di cui urgenti'); for (const [k, v] of Object.entries(perTipo).sort((a, b) => b[1].chiamate - a[1].chiamate)) console.log(`${k} | ${v.chiamate} | ${v.urgenti}`);
console.log(`\nchiamate NON urgenti con rissa/incendio/scontro/faida sul settore: ${gravi.length}`); for (const g of gravi) console.log('  ' + g);
console.log(`\nchiamate urgenti con soli eventi di gente/traffico/biglietti: ${urgLievi.length}`); for (const g of urgLievi.slice(0, 40)) console.log('  ' + g);
