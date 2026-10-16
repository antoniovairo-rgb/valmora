// C-031: dalle uscite (log) di c27-pixel.mjs, per ogni scena: persone che si avvicinano / allontanano dal settore di
// riferimento RIF (es. piazza_municipio) e dallo stadio disegnato, nel corteo dell'ondata e in quello della chiamata
// (posizioni della scena Pixi a 400 ms). «verso» = la distanza cala, «via» = cresce.
// Uso: node coordination/sonde/c31-rif-tabella.mjs <log di c27-pixel> [...]
import { readFileSync } from 'node:fs';
const c = (x) => (x ? `${x.meno} verso / ${x.piu} via (n ${x.n})` : '—');
for (const f of process.argv.slice(2)) {
  console.log(`== ${f}`);
  for (const r of readFileSync(f, 'utf8').split('\n').filter((l) => l.startsWith('{"ep"')).map((l) => JSON.parse(l))) {
    const o = r.pixi?.ondata ?? []; const d = r.pixi?.dinamica;
    console.log(`${r.ep} o${r.ondata} ${r.scena.padEnd(30)} folla=${(r.folla ?? '').padEnd(34)} ` +
      o.map((x) => `ONDATA ${x.corteo}: ${r.rif} ${c(x.rif)}; stadio ${c(x.stadio)}`).join(' | ') +
      (d ? ` || CHIAMATA ${d.quale}: ${r.rif} ${c(d.rif)}; stadio ${c(d.stadio)}` : ''));
  }
}
