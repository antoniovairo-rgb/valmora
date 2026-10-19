// C41-03 (D-183, collaudo C-041): le unità che una risposta impegna escono dalla prossima ondata; il costo lo dice.
// Su tutti i 36 episodi ogni risposta con costo in unità ha «Ti costa N <unità> dalla prossima ondata», con tutte le
// unità che impegna. Rosso __NO_C183Q01: nessuna risposta lo dice, come nella 0.41.0.
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { quandoCosta } from '../src/resa/effetti-opzione.tsx';
import { quante } from '../src/resa/dati.ts';
import type { Missione } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C183Q01; });
const d = leggiDati() as Record<string, unknown>;
const missioni = Object.entries(d).filter(([k]) => /^missioni\/e\d+\.json$/.test(k)).map(([, m]) => m as Missione);
const conCosto = missioni.flatMap((m) => m.ondate.flatMap((o) => (o.chiamate ?? []).flatMap((c) => c.opzioni.filter((x) => x.effetti.some((e) => 'riserva' in e && e.valore < 0)).map((x) => ({ id: `${m.id} ${c.id}/${x.id}`, o: x })))));
const male = () => conCosto.filter(({ o }) => { const s = quandoCosta(o);
  return !s || !s.includes('dalla prossima ondata') || o.effetti.some((e) => 'riserva' in e && e.valore < 0 && !s.includes(quante(-e.valore, e.riserva))); }).map((x) => x.id);

describe('C41-03 il costo in unità dice da quando vale', () => {
  it('verde: tutte le risposte con costo in unità', () => {
    if (process.env.MOSTRA) console.log(`risposte con costo in unità: ${conCosto.length}; esempio: ${quandoCosta(conCosto[0]!.o)}`);
    expect(conCosto.length).toBeGreaterThan(100); expect(male()).toEqual([]);
  });
  it('rosso C183Q01: nessuna', () => { g.__NO_C183Q01 = true; expect(male().length).toBe(conCosto.length); });
});
