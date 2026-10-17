// C35-06 (D-159): una risposta che impegna un'unità non si offre se di quell'unità non ce n'è nessuna schierabile
// (disponibili: riserva meno unità a riposo e fisse). Prima: «costa uno steward» con 0 steward schierabili (e21 o3,
// collaudo C-035; 72 casi distinti in 300 semi × 2 bot). Partite vere dei bot casuale e attento su tutti gli episodi.
// Rosso __NO_C153B01: conta tutta la riserva, come prima.
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, disponibili, iniziaMissione, missioneFinita, opzioniValide, rispondi, schiera } from '../src/logica/missione.ts';
import { attenta, casuale } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C153B01; });
const d = leggiDati() as Record<string, unknown>;
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const missioni = Object.entries(d).filter(([k]) => /^missioni\/e\d+\.json$/.test(k)).map(([, m]) => m as Missione);

function offerteSenzaUnita(N: number): string[] {
  const out = new Set<string>();
  for (const m of missioni) for (const [nome, st] of [['casuale', casuale], ['attenta', attenta]] as const) for (let seme = 1; seme <= N; seme++) {
    const caso = creaCaso(`c3506:${m.id}:${seme}`); const gioc = st(caso, dich); let s = iniziaMissione(m, v0, dich);
    while (!missioneFinita(m, s)) {
      s = schiera(m, s, gioc.schiera(m, s)); const disp = disponibili(m, s);
      for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) {
        for (const o of opzioniValide(c, s, m)) for (const e of o.effetti) if ('riserva' in e && e.valore < 0 && (disp[e.riserva] ?? 0) <= 0) out.add(`${m.id} o${s.ondata} ${c.id}/${o.id}`);
        s = rispondi(m, s, c.id, nome === 'attenta' ? gioc.scegli(m, s, c) : caso.scegli(opzioniValide(c, s, m)).id, dich);
      }
      s = chiudiOndata(m, s, dich);
    }
  }
  return [...out];
}

describe('C35-06 nessuna risposta che costa un\'unità con 0 unità schierabili', () => {
  it('e01-e36, bot casuale e attento, 30 semi', () => expect(offerteSenzaUnita(30)).toEqual([]));
  it('braccio rosso __NO_C153B01: tornano le offerte senza unità', () => { g.__NO_C153B01 = true; expect(offerteSenzaUnita(30).length).toBeGreaterThan(0); });
});
