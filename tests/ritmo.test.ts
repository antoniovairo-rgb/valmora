import { afterEach, describe, expect, it } from 'vitest';
import { controllaRitmo, diStadio } from '../src/dati/ritmo.ts';

const ep = (n: number, curve: number, stagione = 1) => ({ id: `e${n}`, stagione, episodio: n,
  mappa: { settori: [...Array(curve)].map(() => ({ tipo: 'curva' })).concat([{ tipo: 'strada' }]) } });
const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C12R01; });

describe('ritmo della campagna (D-092)', () => {
  it('di stadio = almeno due curve', () => { expect(diStadio(ep(1, 2))).toBe(true); expect(diStadio(ep(1, 1))).toBe(false); });
  it('3 di fila va bene, 4 no; le stagioni sono separate', () => {
    expect(controllaRitmo([ep(1, 2), ep(2, 2), ep(3, 2), ep(4, 0), ep(5, 2)])).toEqual([]);
    expect(controllaRitmo([ep(1, 2), ep(2, 2), ep(3, 2), ep(4, 2)])[0]).toMatch(/4 episodi di stadio di fila/);
    expect(controllaRitmo([ep(1, 2), ep(2, 2), ep(3, 2), ep(4, 2, 2)])).toEqual([]);
  });
  it('braccio rosso __NO_C12R01: nessun controllo', () => {
    g.__NO_C12R01 = true;
    expect(controllaRitmo([ep(1, 2), ep(2, 2), ep(3, 2), ep(4, 2)])).toEqual([]);
  });
});
