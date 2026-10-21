// D-180 (C40-02): quarto giro per episodio. Criteri sul bot casuale (semi di tools/bot.mjs): Δ fiducia media nelle partite
// fallite ≤ MARGINE_D e r(fiducia finale, fallita) < MARGINE_R. Finché uno dei due non vale, toglie la fiducia a un'opzione:
// prima quelle nel verso sbagliato (|z| maggiore sulle partite del casuale), poi quelle che danno fiducia (+) e sono scelte
// più spesso nelle fallite (contributo = valore × (quota nelle fallite − quota nelle riuscite)); se non basta, quelle che danno
// fiducia (+) con il peso maggiore nelle fallite (valore × quota nelle fallite), purché non chiaramente utili (z ≥ −2).
// Solo in memoria: stampa l'elenco.
// Uso: node coordination/sonde/uscite-s05/giro4.mjs [semi=1000] [margineD=-0.05] [margineR=-0.02] [solo misura: 1]
import { leggiDati } from '../../../tools/dati-disco.mjs';
import { giocaTracciata, pearson } from '../../../tools/misura-fiducia.mjs';
import { creaCaso } from '../../../src/logica/caso.ts';
import { variabiliIniziali } from '../../../src/logica/condizioni.ts';
import { casuale } from '../../../src/logica/bot.ts';
const semi = Number(process.argv[2] ?? 1000), MD = Number(process.argv[3] ?? -0.05), MR = Number(process.argv[4] ?? -0.02), solo = process.argv[5] === '1';
const d = leggiDati(); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x])); const v0 = variabiliIniziali(dich.values());
const opz = (m, ch, op) => m.ondate.flatMap((w) => w.chiamate ?? []).find((c) => c.id === ch).opzioni.find((x) => x.id === op);
const togli = (m, ch, op) => { const o = opz(m, ch, op); o.effetti = o.effetti.filter((e) => e.aggiungi !== 'credito'); };
function gioca(m) {
  const p = []; for (let s = 1; s <= semi; s++) p.push(giocaTracciata(m, v0, dich, casuale(creaCaso(`${m.id}:casuale:${s}`), dich)));
  const ko = p.filter((x) => x.fallita), ok = p.filter((x) => !x.fallita);
  const media = (xs) => xs.length ? xs.reduce((a, x) => a + (x.fFine - x.f0), 0) / xs.length : 0;
  const r = pearson(p.map((x) => x.fFine), p.map((x) => +x.fallita));
  const tab = new Map();
  for (const x of p) for (const sc of x.scelte) { const k = `${sc.chiamata}/${sc.opzione}`; const t = tab.get(k) ?? { ch: sc.chiamata, op: sc.opzione, n: 0, ko: 0 }; t.n++; t.ko += +x.fallita; tab.set(k, t); }
  const lista = [];
  for (const t of tab.values()) {
    const nom = opz(m, t.ch, t.op).effetti.filter((e) => e.aggiungi === 'credito').reduce((a, e) => a + e.valore, 0); if (!nom) continue;
    const altre = [...tab.values()].filter((u) => u.ch === t.ch && u !== t); const n2 = altre.reduce((a, u) => a + u.n, 0);
    const ko2 = altre.reduce((a, u) => a + u.ko, 0); const p1 = t.ko / t.n, p2 = n2 ? ko2 / n2 : p1, pp = (t.ko + ko2) / (t.n + n2 || 1);
    const z = n2 ? (p1 - p2) / (Math.sqrt(pp * (1 - pp) * (1 / t.n + 1 / n2)) || Infinity) : 0;
    const contributo = nom * (t.ko / (ko.length || 1) - (t.n - t.ko) / (ok.length || 1));
    lista.push({ chiave: `${m.id}/${t.ch}/${t.op}`, ch: t.ch, op: t.op, nom, z: +z.toFixed(2), contributo: +contributo.toFixed(3), inFallite: +(nom * t.ko / (ko.length || 1)).toFixed(3) });
  }
  return { r, dF: media(ko), dR: media(ok), fallite: ko.length, lista };
}
const tolte = []; const righe = [];
for (const [, m0] of Object.entries(d).filter(([k]) => k.startsWith('missioni/')).sort()) {
  const m = structuredClone(m0); let g = gioca(m); const g0 = g;
  while (!solo && (g.dF > MD || g.r >= MR)) {
    const sbagliate = g.lista.filter((o) => o.nom * o.z > 0).sort((a, b) => Math.abs(b.z) - Math.abs(a.z));
    const positive = g.lista.filter((o) => o.nom > 0 && o.contributo > 0).sort((a, b) => b.contributo - a.contributo);
    const neutre = g.lista.filter((o) => o.nom > 0 && o.z >= -2).sort((a, b) => b.inFallite - a.inFallite);
    const o = sbagliate[0] ?? positive[0] ?? neutre[0];
    if (!o) { console.log(`${m.id}: nessuna opzione da togliere (ΔF ${g.dF.toFixed(3)}, r ${g.r})`); break; }
    togli(m, o.ch, o.op); tolte.push({ chiave: o.chiave, nom: o.nom, z: o.z, contributo: o.contributo, perche: sbagliate[0] ? 'verso' : positive[0] ? 'fallite' : 'peso nelle fallite', inFallite: o.inFallite });
    g = gioca(m);
  }
  righe.push(`${m.id} ΔF ${g0.dF.toFixed(3)}→${g.dF.toFixed(3)} ΔR ${g0.dR.toFixed(3)}→${g.dR.toFixed(3)} r ${g0.r}→${g.r}`);
}
console.log(righe.filter((x) => solo || /→/.test(x)).join('\n'));
console.log('ΔF > 0 prima:', righe.filter((x) => Number(x.split(' ')[2].split('→')[0]) > 0).map((x) => x.split(' ')[0]).join(','));
if (!solo) console.log(JSON.stringify(tolte));
