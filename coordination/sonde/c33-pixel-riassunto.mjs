// Sonda C-033: riassunto di un log di c27-pixel.mjs (una riga JSON per scena): per ogni scena il corteo dell'ondata e quello
// della chiamata, con (si avvicinano / si allontanano) rispetto allo stadio e al settore di riferimento (RIF).
// Uso: node coordination/sonde/c33-pixel-riassunto.mjs <log> [episodi separati da virgola]
import { readFileSync } from 'node:fs';
const [log, eps] = process.argv.slice(2); const solo = eps ? eps.split(',') : null;
const c = (x) => (x ? `${x.meno}/${x.piu}` : '–');
for (const l of readFileSync(log, 'utf8').split('\n').filter((x) => x.startsWith('{'))) {
  const d = JSON.parse(l); if (solo && !solo.includes(d.ep)) continue; const p = d.pixi ?? {};
  const o = (p.ondata ?? []).map((x) => `${x.corteo} stadio ${c(x.stadio)} rif ${c(x.rif)}`).join('; ');
  const dn = p.dinamica ? `${p.dinamica.quale} stadio ${c(p.dinamica.stadio)} rif ${c(p.dinamica.rif)}` : '–';
  console.log(`${d.ep} o${d.ondata} ${d.scena} | ondata: ${o || '–'} | chiamata: ${dn}`);
}
console.log('(numeri: si avvicinano / si allontanano)');
