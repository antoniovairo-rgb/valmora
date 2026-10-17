// Sonda C-028: tabella del verso dei cortei della chiamata e dell'ondata dalle uscite (log) di c27-pixel.mjs.
// Uso: node coordination/sonde/c28-verso-tabella.mjs <etichetta>=<log di c27-pixel> [...]
import { readFileSync } from 'node:fs';
const leggi = (f) => readFileSync(f, 'utf8').split('\n').filter((l) => l.startsWith('{')).map((l) => JSON.parse(l));
const B = Object.fromEntries(process.argv.slice(2).map((a) => a.split('=')).map(([k, f]) => [k, leggi(f)]));
const f = (x) => (x ? `${x.meno} verso / ${x.piu} via (n ${x.n})` : '—');
for (const [k, L] of Object.entries(B)) { console.log(`== ${k}`);
  for (const r of L) { if (!/chiamata/.test(r.scena)) continue; const d = r.pixi?.dinamica; const o = r.pixi?.ondata?.find((c) => d && c.corteo.startsWith(d.quale.replace('corteo:', '')));
    console.log(`${r.ep} o${r.ondata} ${r.scena.padEnd(30)} dinamica=${(r.dinamica||'-').padEnd(30)} data-folla=${r.folla.padEnd(36)} chiamata: ${f(d?.stadio).padEnd(26)} ondata stessa strada: ${f(o?.stadio)}`); } }
