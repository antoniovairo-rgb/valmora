// S-18 C45-01: etichette che nominano unità, su missioni con imprevisti innestati (leggiDati). Uso: npx tsx coordination/sonde/s18-c45-unita.ts
import { leggiDati } from '../../tools/dati-disco.mjs';
const d = leggiDati() as Record<string, any>;
const RE = /\b(squadr[ae]|steward|mediator[ei])\b/i;
let imp = 0, opImp = 0; const hitImp: string[] = [], hitMis: string[] = [];
for (const [k, m] of Object.entries(d)) {
  if (!/^missioni\/e\d+\.json$/.test(k)) continue;
  const t = d[`testi/it/${m.id}.json`] ?? {};
  for (const o of m.ondate) for (const c of o.chiamate ?? []) {
    if (c.imprevisto) imp++;
    for (const op of c.opzioni) {
      if (c.imprevisto) opImp++;
      const tx = t[op.testo.replace(/^testi:/, '')] ?? '';
      const ris = op.effetti.some((e: any) => 'riserva' in e);
      if (RE.test(tx) && !ris) (c.imprevisto ? hitImp : hitMis).push(`${m.id} ${c.id}/${op.id}: «${tx}»`);
    }
  }
}
console.log(JSON.stringify({ imprevisti_scorsi: imp, opzioni_imprevisto: opImp, imprevisti: hitImp, missioni_n: hitMis.length, missioni: hitMis }, null, 1));
