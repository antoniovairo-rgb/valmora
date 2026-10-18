// C38-03: quante risposte cambiano classe (aiuto / peso / niente) con N partite rispetto a 800 (riferimento).
import { leggiDati } from '../../../tools/dati-disco.mjs';
import { confrontoScelte } from '../../../src/logica/confronto.ts';
import { SOGLIA_CONFRONTO } from '../../../src/logica/bilancio.ts';
const d = leggiDati(); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x]));
const ms = Object.entries(d).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m);
const S = Number(process.argv[2] ?? SOGLIA_CONFRONTO);
const classe = (c) => (!c || Math.abs(c.saldo) < S ? 0 : Math.sign(c.saldo));
const rif = new Map(ms.map((m) => [m.id, confrontoScelte(m, dich, 800)]));
for (const n of (process.argv[3] ?? '100,200,400').split(',').map(Number)) {
  let tot = 0, diverse = 0, opposte = 0;
  for (const m of ms) { const a = confrontoScelte(m, dich, n), r = rif.get(m.id); for (const [k, c] of r) { tot++; const x = classe(a.get(k)), y = classe(c); if (x !== y) diverse++; if (x * y < 0) opposte++; } }
  console.log(`soglia ${S}, ${n} partite: classe diversa da 800 in ${diverse}/${tot}, opposta (aiuto↔peso) in ${opposte}/${tot}`);
}
