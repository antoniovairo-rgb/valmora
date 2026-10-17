// Sonda C-035: riassunto delle uscite di c29-schermate.mjs (blocchi di c35-schermate-blocchi.sh) per finestra:
// schermate, scorrimenti orizzontali, tagli, nomi vecchi, tocchi coperti (con dettaglio), episodi bloccati, errori.
// Uso: node coordination/sonde/c35-riassunto-schermate.mjs <cartella uscite> [suffisso, es. -C96A01]
import { readFileSync, readdirSync } from 'node:fs'; import { join } from 'node:path';
const D = process.argv[2]; const SUF = process.argv[3] ?? '';
for (const m of ['360x760', '375x667', '412x915', '1366x768']) {
  const f = readdirSync(D).filter((x) => new RegExp(`^${m}${SUF}-b\\d\\.json$`).test(x)).sort(); if (!f.length) continue;
  let n = 0, oriz = 0, tagli = 0, vecchi = 0, cop = [], err = [], eps = new Set();
  for (const x of f) { const o = JSON.parse(readFileSync(join(D, x), 'utf8')); err.push(...o.errori);
    for (const r of o.RIS) { n++; eps.add(r.ep); if (r.oriz > 0) oriz++; if (r.tagli?.length) tagli++; if (r.vecchi?.length) vecchi++; for (const c of r.coperti ?? []) cop.push(`${r.ep} ${r.scena}: ${typeof c === 'string' ? c : JSON.stringify(c)}`.slice(0, 200)); } }
  console.log(`${m}: blocchi ${f.length}, episodi ${eps.size}, schermate ${n}, scorr.orizz ${oriz}, tagli ${tagli}, nomi vecchi ${vecchi}, tocchi coperti ${cop.length}, errori ${err.length}`);
  for (const c of cop) console.log(`   coperto: ${c}`); for (const e of err) console.log(`   errore: ${e}`);
}
