// D-172 (C38-04): terzo giro per episodio. Per ogni episodio con r(fiducia finale, fallita) ≥ MARGINE (bot casuale,
// stessi semi di tools/bot.mjs) toglie, una alla volta, la fiducia all'opzione nel verso sbagliato più forte sulle
// partite del casuale (|z| maggiore), finché r < MARGINE. Solo in memoria: stampa l'elenco.
// Uso: node coordination/sonde/uscite-s05/giro3.mjs [semi=1000] [margine=-0.02] [extra=chiave,chiave]
import { leggiDati } from '../../../tools/dati-disco.mjs';
import { giocaTracciata, pearson } from '../../../tools/misura-fiducia.mjs';
import { creaCaso } from '../../../src/logica/caso.ts';
import { variabiliIniziali } from '../../../src/logica/condizioni.ts';
import { casuale } from '../../../src/logica/bot.ts';
const semi = Number(process.argv[2] ?? 1000), MARGINE = Number(process.argv[3] ?? -0.02);
const extra = new Set((process.argv[4] ?? '').split(',').filter(Boolean));
const d = leggiDati(); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x])); const v0 = variabiliIniziali(dich.values());
const togli = (m, ch, op) => { const o = m.ondate.flatMap((w) => w.chiamate ?? []).find((c) => c.id === ch).opzioni.find((x) => x.id === op); o.effetti = o.effetti.filter((e) => e.aggiungi !== 'credito'); };
function gioca(m) {
  const p = []; for (let s = 1; s <= semi; s++) p.push(giocaTracciata(m, v0, dich, casuale(creaCaso(`${m.id}:casuale:${s}`), dich)));
  const r = pearson(p.map((x) => x.fFine), p.map((x) => +x.fallita));
  const tab = new Map();
  for (const x of p) for (const sc of x.scelte) { const k = `${sc.chiamata}/${sc.opzione}`; const t = tab.get(k) ?? { ch: sc.chiamata, op: sc.opzione, n: 0, ko: 0 }; t.n++; t.ko += +x.fallita; tab.set(k, t); }
  const opz = [];
  for (const t of tab.values()) {
    const altre = [...tab.values()].filter((u) => u.ch === t.ch && u !== t); const n2 = altre.reduce((a, u) => a + u.n, 0); if (!n2) continue;
    const ko2 = altre.reduce((a, u) => a + u.ko, 0); const p1 = t.ko / t.n, p2 = ko2 / n2, pp = (t.ko + ko2) / (t.n + n2);
    const z = (p1 - p2) / (Math.sqrt(pp * (1 - pp) * (1 / t.n + 1 / n2)) || Infinity);
    const o = m.ondate.flatMap((w) => w.chiamate ?? []).find((c) => c.id === t.ch).opzioni.find((x) => x.id === t.op);
    const nom = o.effetti.filter((e) => e.aggiungi === 'credito').reduce((a, e) => a + e.valore, 0);
    if (nom) opz.push({ chiave: `${m.id}/${t.ch}/${t.op}`, ch: t.ch, op: t.op, nom, z: +z.toFixed(2), se: +(100 * p1).toFixed(1), altre: +(100 * p2).toFixed(1) });
  }
  return { r, opz };
}
const tolte = [];
for (const [k, m0] of Object.entries(d).filter(([k]) => k.startsWith('missioni/')).sort()) {
  const m = structuredClone(m0);
  for (const x of extra) if (x.startsWith(m.id + '/')) { const [, ch, op] = x.split('/'); togli(m, ch, op); tolte.push({ chiave: x, motivo: 'D-172 (e29)' }); }
  let g = gioca(m); const r0 = g.r;
  while (g.r >= MARGINE) {
    const sbagliate = g.opz.filter((o) => o.nom * o.z > 0).sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
    if (!sbagliate.length) { console.log(`${m.id}: r ${g.r}, nessuna opzione nel verso sbagliato rimasta`); break; }
    const o = sbagliate[0]; togli(m, o.ch, o.op); tolte.push({ chiave: o.chiave, nom: o.nom, z: o.z, se: o.se, altre: o.altre, rPrima: g.r });
    g = gioca(m);
  }
  if (r0 >= MARGINE || g.r !== r0) console.log(`${m.id}: r ${r0} → ${g.r}`);
}
console.log(JSON.stringify(tolte));
