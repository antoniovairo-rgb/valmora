// D-160 (PO-125): le risposte che muovevano la fiducia nel verso opposto al risultato (misura S-04, 155/182) non la toccano più.
// Statico: nessuna delle risposte corrette (tests/dati/fiducia-d160.json) torna ad avere un effetto su `credito`.
// Misurato: con «schieramento attento + scelte a caso» le opzioni nel verso sbagliato restano sotto SOGLIA.
// Rosso __NO_C16001: datiD160 rimette gli effetti tolti.
import { afterEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { leggiDati } from '../tools/dati-disco.mjs';
import { datiD160, perverseRapide } from '../tools/misura-fiducia.mjs';
import type { Missione } from '../src/logica/tipi.ts';

const { tolte } = JSON.parse(readFileSync('tests/dati/fiducia-d160.json', 'utf8')) as { tolte: Record<string, number> };
const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C16001; });
// misurato: verde 11, rosso 102 a 200 partite (a 1000: verde 5, rosso 155)
const SEMI = 200, SOGLIA = 30;

export function tornate(dati: Record<string, unknown>) {
  const fuori: string[] = [];
  for (const k of Object.keys(tolte)) {
    const [ep, ch, op] = k.split('/');
    const o = (dati[`missioni/${ep}.json`] as Missione | undefined)?.ondate.flatMap((x) => x.chiamate ?? []).find((c) => c.id === ch)?.opzioni.find((x) => x.id === op);
    if (!o) fuori.push(`${k}: opzione non trovata (aggiorna tests/dati/fiducia-d160.json)`);
    else if (o.effetti.some((e) => 'aggiungi' in e && e.aggiungi === 'credito')) fuori.push(`${k}: muove di nuovo la fiducia`);
  }
  return fuori;
}

describe('fiducia nel verso del risultato (D-160)', () => {
  it('le 156 risposte corrette non toccano la fiducia', () => {
    expect(Object.keys(tolte)).toHaveLength(156);
    expect(tornate(datiD160(leggiDati(), tolte))).toEqual([]);
  });
  it('rosso __NO_C16001: tornano tutte', () => {
    g.__NO_C16001 = true;
    expect(tornate(datiD160(leggiDati(), tolte))).toHaveLength(156);
  });
  it(`opzioni nel verso sbagliato ≤ ${SOGLIA} (${SEMI} partite per episodio), rosso sopra`, () => {
    const verde = perverseRapide(datiD160(leggiDati(), tolte), SEMI).length;
    g.__NO_C16001 = true;
    const rosso = perverseRapide(datiD160(leggiDati(), tolte), SEMI).length;
    expect(verde).toBeLessThanOrEqual(SOGLIA);
    expect(rosso).toBeGreaterThan(SOGLIA);
  }, 180_000);
});
