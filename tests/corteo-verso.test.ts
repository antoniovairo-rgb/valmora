// D-127 (C24-07): il corteo va nel verso che dicono i dati. e30: «Il corteo si muove in silenzio dallo stadio verso il
// municipio»; e17 ondata 4: dopo il fischio si torna a casa. Rosso __NO_C73V01: «verso lo stadio», il difetto del collaudo.
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { follaDellOndata } from '../src/resa/mappa/folla.ts';
import type { Missione } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C73V01; });
const ep = (id: string) => JSON.parse(readFileSync(`data/missioni/${id}.json`, 'utf8')) as Missione;
const verso = (id: string, n: number) => follaDellOndata(ep(id), n).cortei.find((c) => c.settore === 'strada_cinderwick')?.verso;

describe('D-127 verso del corteo dai dati', () => {
  it('e30 ondate 2 e 4 e e17 ondata 4: via dallo stadio', () => {
    expect(verso('e30', 2)).toBe('esce');
    expect(verso('e30', 4)).toBe('esce');
    expect(verso('e17', 4)).toBe('esce');
  });
  it('senza campo verso non cambia (e01 ondata 1: verso lo stadio)', () => {
    for (const c of follaDellOndata(ep('e01'), 1).cortei) expect(c.verso).toBe('entra');
  });
  it('braccio rosso __NO_C73V01: e30 ondata 2 verso lo stadio, il difetto del collaudo', () => {
    g.__NO_C73V01 = true;
    expect(verso('e30', 2)).toBe('entra');
  });
});
