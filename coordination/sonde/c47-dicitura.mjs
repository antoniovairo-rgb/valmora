// C-047: dicitura del confronto nel verbale (D-205), conteggio indipendente da tests/c45.test.ts (semi 'c47:…').
// Uso: node coordination/sonde/c47-dicitura.mjs [semi=40]
import { leggiDati } from '../../tools/dati-disco.mjs';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { giocaMissione } from '../../src/logica/missione.ts';
import { STRATEGIE } from '../../src/logica/bot.ts';
import { creaCaso } from '../../src/logica/caso.ts';
import { bilancio } from '../../src/logica/bilancio.ts';
import { daTabella } from '../../src/logica/confronto.ts';
import tabella from '../../src/logica/confronti.json' with { type: 'json' };
const semi = Number(process.argv[2] ?? 40);
const d = leggiDati();
const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const ms = Object.entries(d).filter(([k]) => /^missioni\/e\d+\.json$/.test(k)).map(([, m]) => m);
const tot = { verbali: 0, voci: 0, con_dicitura: 0, tutti_contro_senza_dicitura: 0, miste_con_dicitura: 0, dicitura_aiuto: 0, dicitura_peso: 0, bilanci_vuoti: 0, e05_volontari_no_con_dicitura: 0, e05_volontari_no_visti: 0 };
const dalConf = (v) => !!v.confronto && Math.sign(v.confronto.saldo) === Math.sign(v.saldo);
for (const m of ms) {
  const conf = daTabella(tabella, m.id);
  for (const n of ['casuale', 'attenta', 'peggiore']) for (let s = 1; s <= (n === 'casuale' ? semi : 1); s++) {
    const b = bilancio(m, giocaMissione(m, v0, dich, STRATEGIE[n](creaCaso(`c47:${m.id}:${n}:${s}`), dich)), 3, conf);
    tot.verbali++; if (!b.aiuti.length && !b.pesi.length) tot.bilanci_vuoti++;
    for (const [lista, aiuto] of [[b.aiuti, true], [b.pesi, false]]) for (const v of lista) {
      tot.voci++;
      const tuttiContro = v.impatti.length > 0 && v.impatti.every((i) => i.buono !== aiuto);
      if (v.controcorrente) { tot.con_dicitura++; aiuto ? tot.dicitura_aiuto++ : tot.dicitura_peso++; if (!tuttiContro) tot.miste_con_dicitura++; }
      else if (tuttiContro && dalConf(v)) tot.tutti_contro_senza_dicitura++;
      if (m.id === 'e05' && v.opzione === 'volontari_no') { tot.e05_volontari_no_visti++; if (v.controcorrente) tot.e05_volontari_no_con_dicitura++; }
    }
  }
}
console.log(JSON.stringify(tot, null, 1));
