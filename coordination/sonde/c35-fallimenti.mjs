// Sonda C-035 (C34-06 esteso): nelle partite fallite (bot casuale, semi 1…N), quanti settori sono degenerati
// (scoperti e a tensione ≥ DEGENERA) e se fra questi c'è un settore dato; quanti fallimenti vengono solo da tensione
// aggiunta da una risposta (nessun settore degenerato). Uso: node coordination/sonde/c35-fallimenti.mjs <radice dati> <ep> <settore> [N]
import { join } from 'node:path';
import { leggiDati } from '../../tools/dati-disco.mjs';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { DEGENERA, giocaMissione } from '../../src/logica/missione.ts';
import { casuale, attenta } from '../../src/logica/bot.ts';
import { creaCaso } from '../../src/logica/caso.ts';
const [R, id, sett, n] = process.argv.slice(2); const N = Number(n ?? 1000);
const d = leggiDati(join(R, 'data')); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x])); const v0 = variabiliIniziali(dich.values());
const m = d[`missioni/${id}.json`];
for (const [nome, st] of [['casuale', casuale], ['attenta', attenta]]) {
  const quanti = {}; let fallite = 0, conSett = 0, oltreSoloPicco = 0;
  for (let s = 1; s <= N; s++) {
    const e = giocaMissione(m, v0, dich, st(creaCaso(`c35f:${id}:${s}`), dich)); if (!e.esito.fallita) continue; fallite++;
    const deg = new Set(e.rapporti.flatMap((x) => Object.keys(x.tensione).filter((k) => x.tensione[k] >= DEGENERA && x.scoperto[k] > 0)));
    quanti[deg.size] = (quanti[deg.size] ?? 0) + 1; if (deg.has(sett)) conSett++; if (!deg.size) oltreSoloPicco++;
  }
  console.log(`${id} ${nome}: fallite ${fallite}/${N}; settori degenerati per partita ${JSON.stringify(quanti)}; con ${sett} ${conSett}; senza settore degenerato ${oltreSoloPicco}`);
}
