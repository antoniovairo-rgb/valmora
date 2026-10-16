// PO-059: espressioni di protagonista e vice dalla tensione (rapporto) e dall'esito (verbale), src/resa/espressioni.ts.
// Rosso __NO_C96P01: al verbale solo la bocca, come prima.
import { afterEach, describe, expect, it } from 'vitest';
import { espressioneEsito, espressioneOndata, tonoOndata } from '../src/resa/espressioni.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C96P01; });

describe('PO-059 espressioni', () => {
  it('tono del rapporto dal livello più alto: ≤1 calmo, 2-3 teso, ≥4 critico', () => {
    expect(tonoOndata([0, 1, 0])).toBe('calmo'); expect(tonoOndata([1, 3])).toBe('teso'); expect(tonoOndata([2, 4])).toBe('critico'); expect(tonoOndata([])).toBe('calmo');
  });
  it('ogni tono ha un\'espressione diversa per il protagonista', () => {
    const o = (['calmo', 'teso', 'critico'] as const).map((t) => JSON.stringify(espressioneOndata(t).tu));
    const e = (['bene', 'medio', 'male', 'fallita'] as const).map((t) => JSON.stringify(espressioneEsito(t).tu));
    expect(new Set(o).size).toBe(3); expect(new Set(e).size).toBe(4);
    expect(espressioneEsito('bene').tu.braccia).toBe('su'); expect(espressioneOndata('critico').tu.braccia).toBe('nuca');
  });
  it('braccio rosso __NO_C96P01: al verbale solo la bocca', () => {
    g.__NO_C96P01 = true;
    expect(espressioneEsito('bene').tu).toEqual({ bocca: 'su' });
  });
});
