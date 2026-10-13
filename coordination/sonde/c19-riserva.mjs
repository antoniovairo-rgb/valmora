// Sonda C-019 (C17-14): quanti steward si possono avere in e05 («Ne hai tre su sei»). Due giocatori: «avido» sceglie
// sempre, se offerta, l'opzione che fa rientrare unità; «casuale» risponde a caso. Variabili di partenza a caso
// (anche presidente_incontrato, che apre «straordinari»). Misura il massimo di quantità + riserva dopo ogni risposta
// e le unità disponibili allo schieramento (disponibili()).
// Uso: node coordination/sonde/c19-riserva.mjs [partite=2000]   (rosso: node --import 'data:text/javascript,globalThis.__NO_C17R14=true' …)
import { leggiDati } from '../../tools/dati-disco.mjs';
import { creaCaso } from '../../src/logica/caso.ts';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, disponibili, iniziaMissione, missioneFinita, opzioniValide, rispondi, schiera } from '../../src/logica/missione.ts';
import { attenta } from '../../src/logica/bot.ts';

const N = Number(process.argv[2] ?? 2000);
const d = leggiDati(process.env.DATI ?? 'data'); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const m = d['missioni/e05.json'];
for (const avido of [true, false]) {
  let max = 0, maxDisp = 0; const freq = {}; let rientri = 0;
  for (let k = 0; k < N; k++) {
    const caso = creaCaso(`c19r:${avido}:${k}`); const g = attenta(caso, dich);
    let s = iniziaMissione(m, { ...v0, presidente_incontrato: caso.scegli([true, false]), informatore_pagato: caso.scegli([true, false]) }, dich); let picco = 0;
    while (!missioneFinita(m, s)) {
      maxDisp = Math.max(maxDisp, disponibili(m, s).steward ?? 0);
      s = schiera(m, s, g.schiera(m, s));
      for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) {
        const ops = opzioniValide(c, s, m);
        const r = ops.find((x) => x.effetti.some((e) => e.riserva === 'steward' && e.valore > 0));
        const o = avido && r ? r : caso.scegli(ops);
        if (o.effetti.some((e) => e.riserva === 'steward' && e.valore > 0)) rientri++;
        s = rispondi(m, s, c.id, o.id, dich);
        picco = Math.max(picco, m.mappa.risorse.steward.quantita + (s.riserva.steward ?? 0));
      }
      s = chiudiOndata(m, s, dich);
    }
    max = Math.max(max, picco); freq[picco] = (freq[picco] ?? 0) + 1;
  }
  console.log(`${globalThis.__NO_C17R14 ? 'ROSSO' : 'VERDE'} e05 ${avido ? 'avido' : 'casuale'} · ${N} partite · rientri scelti ${rientri} · massimo steward (quantità+riserva) ${max} · massimo disponibili allo schieramento ${maxDisp} · distribuzione del picco ${JSON.stringify(freq)} · tetto dichiarato ${m.mappa.risorse.steward.massimo}`);
}
