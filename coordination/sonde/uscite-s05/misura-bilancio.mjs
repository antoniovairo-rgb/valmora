// C38-03: su 36 episodi × 20 partite del bot casuale, voci di aiuto/peso e contraddizioni col confronto
// (peso con fallite altre − se ≥ 5 punti, o aiuto con se − altre ≥ 5), con il saldo locale (prima) e col confronto (dopo).
import { leggiDati } from '../../../tools/dati-disco.mjs';
import { variabiliIniziali } from '../../../src/logica/condizioni.ts';
import { giocaMissione } from '../../../src/logica/missione.ts';
import { casuale } from '../../../src/logica/bot.ts';
import { creaCaso } from '../../../src/logica/caso.ts';
import { bilancio } from '../../../src/logica/bilancio.ts';
import { confrontoScelte } from '../../../src/logica/confronto.ts';
import { riassunto } from '../../../tools/misura-fiducia.mjs';
const d = leggiDati(); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x])); const v0 = variabiliIniziali(dich.values());
const ms = Object.entries(d).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m);
for (const [nome, rosso] of [['prima (saldo locale, __NO_C38B01)', true], ['dopo (confronto)', false]]) {
  globalThis.__NO_C38B01 = rosso; const aiuti = [], pesi = []; let contr = 0, voci = 0;
  for (const m of ms) { const c = confrontoScelte(m, dich); for (let s = 1; s <= 20; s++) {
    const b = bilancio(m, giocaMissione(m, v0, dich, casuale(creaCaso(`c38b:${m.id}:${s}`), dich)), 3, c); aiuti.push(b.aiuti.length); pesi.push(b.pesi.length);
    for (const v of b.pesi) { voci++; const x = c.get(`${v.chiamata}/${v.opzione}`); if (x && x.falliteAltre - x.falliteSe >= 5) contr++; }
    for (const v of b.aiuti) { voci++; const x = c.get(`${v.chiamata}/${v.opzione}`); if (x && x.falliteSe - x.falliteAltre >= 5) contr++; } } }
  console.log(nome, '· aiuti per verbale', JSON.stringify(riassunto(aiuti)), '· pesi', JSON.stringify(riassunto(pesi)), `· voci contraddette ${contr}/${voci}`);
}
