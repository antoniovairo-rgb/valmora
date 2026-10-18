// D-174 (C38-03, opzione a): precalcola le tabelle del confronto delle risposte (src/logica/confronto.ts) per i 36 episodi
// e le scrive in src/logica/confronti.json, che la resa legge al posto di calcolarle. Il guardiano tests/confronto.test.ts
// fallisce se il file non è uguale al calcolo sui dati di oggi: dopo ogni cambio dei dati, rilanciare questo comando.
// Uso: node tools/confronti.mjs
import { writeFileSync } from 'node:fs';
import { leggiDati } from './dati-disco.mjs';
import { SEMI_CONFRONTO, confrontoScelte, inRighe } from '../src/logica/confronto.ts';

export function tabellaConfronti(dati = leggiDati()) {
  const dich = new Map(dati['stato.json'].variabili.map((x) => [x.id, x]));
  const ms = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m).sort((a, b) => a.id.localeCompare(b.id));
  return { semi: SEMI_CONFRONTO, episodi: Object.fromEntries(ms.map((m) => [m.id, inRighe(confrontoScelte(m, dich, SEMI_CONFRONTO, false))])) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const t = performance.now(); const tab = tabellaConfronti();
  writeFileSync('src/logica/confronti.json', JSON.stringify(tab) + '\n');
  console.log(`src/logica/confronti.json: ${Object.keys(tab.episodi).length} episodi, ${((performance.now() - t) / 1000).toFixed(1)} s`);
}
