// D-089: le strategie dichiarate deterministiche giocano la stessa partita con ogni seme. Se una di loro un giorno
// usasse il caso, tools/bot.mjs conterebbe 1000 volte una partita sola: questo test lo impedisce.
import { describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { giocaMissione } from '../src/logica/missione.ts';
import { DETERMINISTICHE, STRATEGIE } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const d = leggiDati() as Record<string, unknown>;
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const missioni = ['e01', 'e02', 'e03'].map((id) => d[`missioni/${id}.json`] as Missione);

describe('strategie deterministiche (D-089)', () => {
  for (const nome of DETERMINISTICHE) it(`${nome}: stessa partita con 20 semi diversi`, () => {
    for (const m of missioni) {
      const firme = new Set(Array.from({ length: 20 }, (_, i) =>
        JSON.stringify(giocaMissione(m, variabiliIniziali(dich.values()), dich, STRATEGIE[nome]!(creaCaso(`t:${i}`), dich)).scelte)));
      expect(firme.size).toBe(1);
    }
  });
  it('braccio rosso: la casuale NON è deterministica (il test sa distinguere)', () => {
    const m = missioni[0]!;
    const firme = new Set(Array.from({ length: 20 }, (_, i) =>
      JSON.stringify(giocaMissione(m, variabiliIniziali(dich.values()), dich, STRATEGIE.casuale!(creaCaso(`t:${i}`), dich)).scelte)));
    expect(firme.size).toBeGreaterThan(1);
  });
});
