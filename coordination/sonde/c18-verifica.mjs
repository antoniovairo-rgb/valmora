// Sonda C-018 (logica): verifica di PO-095, PO-086 e C17-03 su e01–e12, braccio verde e braccio rosso.
// Giocatore casuale (unità in settori a caso, risposte a caso), N partite per episodio, variabili di partenza a caso
// (informatore_pagato, presidente_incontrato, furgone_visto, rapporto_dessi) per aprire anche le chiamate condizionate.
//  - PO-095: ogni chiamata con «senza» aperta → nel settore non c'è nessuna unità delle risorse indicate (violazioni);
//  - PO-086: ogni scelta fatta rispetta il «dopo» della sua chiamata e della sua opzione (violazioni);
//  - C17-03: ogni opzione scelta con riserva negativa ha ancora almeno un'unità di quella risorsa (violazioni).
// Uso: node coordination/sonde/c18-verifica.mjs [partite=500]   (rosso: ROSSO=1 accende __NO_PO095/__NO_PO086/__NO_C17R03)
import { leggiDati } from '../../tools/dati-disco.mjs';
import { creaCaso } from '../../src/logica/caso.ts';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, iniziaMissione, missioneFinita, opzioniValide, rispondi, schiera } from '../../src/logica/missione.ts';
import { casuale } from '../../src/logica/bot.ts';

if (process.env.ROSSO) Object.assign(globalThis, { __NO_PO095: true, __NO_PO086: true, __NO_C17R03: true });
const N = Number(process.argv[2] ?? 500);
const d = leggiDati('data'); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const tot = { partite: 0, senzaAperte: 0, senzaViol: 0, dopoScelte: 0, dopoViol: 0, impegni: 0, impegniViol: 0, eccezioni: 0 };
for (let i = 1; i <= 12; i++) {
  const ep = `e${String(i).padStart(2, '0')}`; const m = d[`missioni/${ep}.json`];
  const tutte = m.ondate.flatMap((o) => o.chiamate ?? []);
  for (let k = 0; k < N; k++) {
    const caso = creaCaso(`c18v:${ep}:${k}`); const g = casuale(caso, dich);
    const extra = { informatore_pagato: caso.scegli([true, false]), presidente_incontrato: caso.scegli([true, false]), furgone_visto: caso.scegli([true, false]), rapporto_dessi: caso.scegli(['neutro', 'rispetto', 'ostile']) };
    try {
      let s = iniziaMissione(m, { ...v0, ...extra }, dich);
      while (!missioneFinita(m, s)) {
        s = schiera(m, s, g.schiera(m, s));
        for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) {
          if (c.senza) {
            tot.senzaAperte++;
            const dentro = Object.entries(s.disposizione ?? {}).concat(Object.entries(s.fisse ?? {})).some(([r, ps]) => (!c.senza.risorse || c.senza.risorse.includes(r)) && (ps[c.senza.settore] ?? 0) > 0);
            if (dentro) tot.senzaViol++;
          }
          const fatte = new Set(s.scelte.map((y) => `${y.chiamata}/${y.opzione}`));
          const ok = (x) => !x || (!(x.mai ?? []).some((q) => fatte.has(q)) && (x.gia ?? []).every((q) => fatte.has(q)));
          const oid = g.scegli(m, s, c); const o = c.opzioni.find((x) => x.id === oid);
          if (c.dopo || o.dopo) { tot.dopoScelte++; if (!ok(c.dopo) || !ok(o.dopo)) tot.dopoViol++; }
          for (const e of o.effetti) if ('riserva' in e && e.valore < 0) { tot.impegni++; if ((m.mappa.risorse[e.riserva]?.quantita ?? 0) + (s.riserva[e.riserva] ?? 0) <= 0) tot.impegniViol++; }
          s = rispondi(m, s, c.id, oid, dich);
        }
        s = chiudiOndata(m, s, dich);
      }
      concludiMissione(m, s, dich); tot.partite++;
    } catch (e) { tot.eccezioni++; if (tot.eccezioni < 4) console.log(`${ep} ${k}: ${e.message}`); }
  }
  void tutte;
}
console.log(`${process.env.ROSSO ? 'ROSSO' : 'VERDE'} · ${JSON.stringify(tot)}`);
