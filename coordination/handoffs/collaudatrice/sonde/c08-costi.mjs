// Sonda C-08: tabella opzione → effetti → accenno di costo (D-078) per tutte le missioni. Solo lettura.
// Uso: node coordination/handoffs/collaudatrice/sonde/c08-costi.mjs
import { readFileSync, readdirSync } from 'node:fs';
const comune = JSON.parse(readFileSync('data/testi/it/comune.json', 'utf8'));
let tot = 0, senza = 0;
for (const f of readdirSync('data/missioni').filter((x) => x.endsWith('.json')).sort()) {
  const m = JSON.parse(readFileSync(`data/missioni/${f}`, 'utf8')); const t = { ...comune, ...JSON.parse(readFileSync(`data/testi/it/${m.id}.json`, 'utf8')) };
  const T = (k) => (k ? t[k.replace('testi:', '')] ?? `[[${k}]]` : null);
  for (const o of m.ondate) for (const c of o.chiamate ?? []) for (const x of c.opzioni) {
    tot++; if (!x.costo) senza++;
    const eff = x.effetti.map((e) => 'tensione' in e ? `tensione ${e.tensione} ${e.valore > 0 ? '+' : ''}${e.valore}` : 'pressione' in e ? `pressione ${e.pressione} ${e.valore > 0 ? '+' : ''}${e.valore}` : 'riserva' in e ? `riserva ${e.riserva} ${e.valore > 0 ? '+' : ''}${e.valore}` : 'aggiungi' in e ? `${e.aggiungi} ${e.valore > 0 ? '+' : ''}${e.valore}` : `${e.imposta}=${e.valore}`).join('; ') || '(nessuno)';
    const costo = T(x.costo); const cf = x.costo ? t[`${x.costo.replace('testi:', '')}@f`] : undefined;
    console.log(`${m.id}\t${c.id}.${x.id}\t${x.costo ?? '—'}\t${eff}\t${costo}${cf ? `\t@f: ${cf}` : ''}`);
  }
}
console.log(`totale opzioni ${tot}, senza accenno ${senza}`);
