// C-027: riassunto delle misure di c27-pixel.mjs. Per ogni misura: verso scritto in data-folla e verso misurato (posizioni
// Pixi a 400 ms) rispetto allo stadio disegnato; corteo della chiamata (dinamica PO-089) contro corteo dell'ondata sulla
// stessa strada; confronto fra due build (stessa scena, stesso corteo).
// Uso: node coordination/sonde/c27-analisi-verso.mjs <nuova.json> [vecchia.json]
import { readFileSync } from 'node:fs';
const [A, B] = process.argv.slice(2).map((f) => f && JSON.parse(readFileSync(f, 'utf8')));
const segno = (v) => v === '+' ? 'via' : v === '−' ? 'verso' : v ?? '?';
const righe = (d) => d.RIS.flatMap((r) => [
  ...(r.pixi?.ondata ?? []).map((c) => ({ k: `${r.ep}|${r.scena}|ondata|${c.corteo.split('>')[0]}`, ep: r.ep, scena: r.scena, chi: 'ondata', settore: c.corteo.split('>')[0], scritto: c.corteo.split('>')[1], stadio: segno(c.verso?.STADIO), verso: c.verso })),
  ...(r.pixi?.dinamica?.quale?.startsWith('corteo:') ? [{ k: `${r.ep}|${r.scena}|chiamata|${r.pixi.dinamica.quale.slice(7)}`, ep: r.ep, scena: r.scena, chi: 'chiamata', settore: r.pixi.dinamica.quale.slice(7), scritto: '(spalti ' + r.folla.split('|')[0] + ')', stadio: segno(r.pixi.dinamica.verso?.STADIO), verso: r.pixi.dinamica.verso }] : []),
]);
const ra = righe(A);
const atteso = { entra: 'verso', esce: 'via' };
const ond = ra.filter((x) => x.chi === 'ondata');
console.log(`misure ${A.RIS.length}, errori ${A.errori.length}; cortei dell'ondata misurati ${ond.length}: concordi col verso scritto ${ond.filter((x) => atteso[x.scritto] === x.stadio).length}, senza stadio o misti ${ond.filter((x) => !['via', 'verso'].includes(x.stadio)).length}, discordi ${ond.filter((x) => ['via', 'verso'].includes(x.stadio) && atteso[x.scritto] !== x.stadio).length}`);
for (const x of ond.filter((x) => ['via', 'verso'].includes(x.stadio) && atteso[x.scritto] !== x.stadio)) console.log('  DISCORDE', x.k, x.scritto, x.stadio);
const din = ra.filter((x) => x.chi === 'chiamata');
const contro = din.filter((x) => { const o = ra.find((y) => y.chi === 'ondata' && y.ep === x.ep && y.scena === x.scena && y.settore === x.settore); return o && ['via', 'verso'].includes(o.stadio) && ['via', 'verso'].includes(x.stadio) && o.stadio !== x.stadio; });
console.log(`cortei della chiamata misurati ${din.length}: verso lo stadio ${din.filter((x) => x.stadio === 'verso').length}, via ${din.filter((x) => x.stadio === 'via').length}, altro ${din.filter((x) => !['via', 'verso'].includes(x.stadio)).length}; in senso opposto al corteo dell'ondata sulla stessa strada ${contro.length}`);
for (const x of contro) console.log('  OPPOSTO', x.k, 'chiamata', x.stadio, '· ondata', ra.find((y) => y.chi === 'ondata' && y.ep === x.ep && y.scena === x.scena && y.settore === x.settore).stadio);
if (B) {
  const rb = new Map(righe(B).map((x) => [x.k, x]));
  const cambi = ra.filter((x) => rb.has(x.k) && rb.get(x.k).stadio !== x.stadio);
  console.log(`confronto: in comune ${ra.filter((x) => rb.has(x.k)).length}, solo nuova ${ra.filter((x) => !rb.has(x.k)).length}, solo vecchia ${[...rb.keys()].filter((k) => !ra.some((x) => x.k === k)).length}, verso misurato cambiato ${cambi.length}`);
  for (const x of cambi) console.log('  CAMBIATO', x.k, rb.get(x.k).stadio, '→', x.stadio);
}
if (process.env.TUTTI) for (const x of ra) console.log(x.k, x.scritto, 'stadio:', x.stadio, JSON.stringify(x.verso));
