// C-044 (D-201): misure ripetibili dei rilievi C44-01 e C44-07. Uso: node tools/misura-c44.mjs [modello|ripetizioni|bot|guardiani]…
// modello: per episodio, imprevisti con un'unità impegnata e «lascia correre» (terza risposta) con effetti.
// ripetizioni: costi di «lascia correre» ripetuti identici. bot: stelle per episodio e strategia (1000 semi, e01–e06).
// guardiani: D-160 (perverse, 200 partite), D-162 (medie per stagione, casuale e distratto), D-154, D-172, D-180.
import { readFileSync } from 'node:fs';
import { leggiDati } from './dati-disco.mjs';
import { giraBot } from './bot.mjs';
import { controllaCrescita, quoteCasuale, quoteDistratto } from './crescita.mjs';
import { correlazioniCasuale, datiD160, deltaFallite, perverseRapide } from './misura-fiducia.mjs';

const cosa = process.argv.slice(2).length ? process.argv.slice(2) : ['modello', 'ripetizioni'];
const d = leggiDati();
const file = Object.entries(d).filter(([k]) => k.startsWith('imprevisti/')).map(([, v]) => v).sort((a, b) => a.id.localeCompare(b.id));
const testo = (ep, k) => d[`testi/it/${ep}.json`]?.[k.replace(/^testi:/, '')];

if (cosa.includes('modello')) {
  let tu = 0, tl = 0;
  console.log('episodio | imprevisti | con unità impegnata | «lascia correre» con effetto');
  for (const f of file) {
    const u = f.imprevisti.filter((x) => x.chiamata.opzioni.some((o) => o.effetti.some((e) => 'riserva' in e && e.valore < 0))).length;
    const l = f.imprevisti.filter((x) => x.chiamata.opzioni[2]?.effetti.length).length;
    tu += u; tl += l;
    if (u || l) console.log(`${f.id} | ${f.imprevisti.length} | ${u} | ${l}`);
  }
  console.log(`totale | ${file.reduce((s, f) => s + f.imprevisti.length, 0)} | ${tu} | ${tl}`);
}
if (cosa.includes('ripetizioni')) {
  const conta = new Map();
  for (const f of file) for (const x of f.imprevisti) { const t = testo(f.id, x.chiamata.opzioni[2].costo); conta.set(t, (conta.get(t) ?? 0) + 1); }
  const rip = [...conta].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]);
  console.log(`costi di «lascia correre»: ${[...conta.values()].reduce((a, b) => a + b, 0)}, frasi diverse ${conta.size}; ripetute: ${rip.length} frasi per ${rip.reduce((s, [, n]) => s + n, 0)} costi`);
  for (const [t, n] of rip) console.log(`  ${n}× ${t}`);
}
const tolte = JSON.parse(readFileSync('tests/dati/fiducia-d160.json', 'utf8')).tolte;
if (cosa.includes('bot')) {
  const solo = ['e01', 'e02', 'e03', 'e04', 'e05', 'e06'];
  const r = giraBot(Object.fromEntries(Object.entries(d).filter(([k, m]) => !k.startsWith('missioni/') || solo.includes(m.id))), 1000);
  console.log('episodio | strategia | fallite % | stelle medie | 3★ %');
  for (const x of r) {
    if (x.strategia.includes('[')) continue;
    const n = Object.values(x.stelle).reduce((a, b) => a + b, 0), m = Object.entries(x.stelle).reduce((a, [k, v]) => a + k * v, 0) / n;
    console.log(`${x.missione} | ${x.strategia} | ${(100 * x.stelle[0] / n).toFixed(1)} | ${m.toFixed(2)} | ${(100 * x.stelle[3] / n).toFixed(1)}`);
  }
}
if (cosa.includes('guardiani')) {
  const dd = datiD160(d, tolte);
  console.log(`D-160 perverse (200 partite, soglia 30): ${perverseRapide(dd, 200).length}`);
  const media = (q) => [1, 2, 3].map((st) => { const v = Object.values(q).filter(([s]) => s === st).map(([, x]) => x); return v.reduce((a, b) => a + b, 0) / v.length; });
  const r = giraBot(d, 1000), qc = quoteCasuale(r, d), qd = quoteDistratto(d);
  const mc = media(qc), md = media(qd);
  console.log(`D-162 casuale per stagione: ${mc.map((x) => x.toFixed(2)).join(' / ')} (margine 1→2 ${(mc[1] - mc[0]).toFixed(2)}) ${controllaCrescita(qc, 'casuale').join('; ') || 'verde'}`);
  console.log(`D-162 distratto per stagione: ${md.map((x) => x.toFixed(2)).join(' / ')} (margine 1→2 ${(md[1] - md[0]).toFixed(2)}) ${controllaCrescita(qd, 'distratto').join('; ') || 'verde'}`);
  console.log(`casuale e01–e12 % fallite: ${Object.entries(qc).filter(([, [s]]) => s === 1).map(([k, [, q]]) => `${k} ${q.toFixed(1)}`).join(', ')}`);
  const cor = Object.entries(correlazioniCasuale(dd)).filter(([, x]) => x === null || x >= 0);
  const del = Object.entries(deltaFallite(dd)).filter(([, x]) => x !== null && x > 0);
  console.log(`D-172 episodi con correlazione ≥ 0: ${cor.length} ${cor.map(([k]) => k).join(',')}`);
  console.log(`D-180 episodi con Δ fallite > 0: ${del.length} ${del.map(([k]) => k).join(',')}`);
  const tre = r.filter((x) => x.strategia === 'attenta' && x.stelle[3] > 0).map((x) => x.missione);
  console.log(`3★ del bot attento: ${tre.length}/36`);
}
