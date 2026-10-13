// C17-14: «Ne hai tre su sei», ma tre opzioni facevano tornare due steward ciascuna: la riserva non aveva tetto verso
// l'alto e si arrivava a nove steward su sei. Ora la risorsa può dichiarare «massimo» e i rientri non lo superano.
// Rosso __NO_C17R14.
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, iniziaMissione, missioneFinita, opzioniValide, rispondi, schiera } from '../src/logica/missione.ts';
import { attenta } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const d = leggiDati() as Record<string, unknown>;
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const ms = Object.entries(d).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m as Missione);
const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C17R14; });

// Partite in cui il bot sceglie sempre, se c'è, l'opzione che fa rientrare unità: misura il massimo raggiunto.
const picco = (m: Missione, n = 30) => {
  const max: Record<string, number> = {};
  for (let k = 0; k < n; k++) {
    const caso = creaCaso(`c17r14:${m.id}:${k}`); const att = attenta(caso, dich);
    let s = iniziaMissione(m, v0, dich);
    while (!missioneFinita(m, s)) {
      s = schiera(m, s, att.schiera(m, s));
      for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) {
        const ops = opzioniValide(c, s, m);
        const o = ops.find((x) => x.effetti.some((e) => 'riserva' in e && e.valore > 0)) ?? caso.scegli(ops);
        s = rispondi(m, s, c.id, o.id, dich);
      }
      for (const [r, x] of Object.entries(m.mappa.risorse)) max[r] = Math.max(max[r] ?? 0, x.quantita + (s.riserva[r] ?? 0));
      s = chiudiOndata(m, s, dich);
    }
  }
  return max;
};

// Copia di e05 com'era prima della correzione: tre rientri da due steward.
const e05 = ms.find((m) => m.id === 'e05')!;
const vecchia = JSON.parse(JSON.stringify(e05).replace(/("riserva":"steward","valore":)1/g, '$12')) as Missione;

describe('i rientri di unità non superano il tetto (C17-14)', () => {
  it('in nessun episodio una risorsa con «massimo» lo supera', () => {
    const oltre: string[] = [];
    for (const m of ms) for (const [r, x] of Object.entries(picco(m, 10))) {
      const t = m.mappa.risorse[r]?.massimo; if (t !== undefined && x > t) oltre.push(`${m.id} ${r}: ${x} su ${t}`);
    }
    expect(oltre).toEqual([]);
  });
  it('e05: «tre su sei» — mai più di sei steward, anche coi rientri da due', () => {
    expect(picco(e05).steward).toBeLessThanOrEqual(6);
    expect(picco(vecchia).steward).toBeLessThanOrEqual(6);
  });
  it('braccio rosso __NO_C17R14: coi rientri da due si torna oltre sei', () => {
    g.__NO_C17R14 = true; expect(picco(vecchia).steward).toBeGreaterThan(6);
  });
});
