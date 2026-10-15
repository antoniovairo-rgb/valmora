// D-127 (C24-07): il corteo va nel verso che dicono i dati. e30: «Il corteo si muove in silenzio dallo stadio verso il
// municipio»; e17 ondata 4: dopo il fischio si torna a casa. Rosso __NO_C73V01: «verso lo stadio», il difetto del collaudo.
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { esceDinamica, follaDellOndata } from '../src/resa/mappa/folla.ts';
import type { Missione } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C73V01; delete g.__NO_C74D01; });
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

// C27-01: il corteo della chiamata (dinamica PO-089) andava verso lo stadio mentre quello dell'ondata ne usciva.
describe('C27-01 il corteo della chiamata va col corteo dell\'ondata', () => {
  const esce = (id: string, n: number, settore: string) => esceDinamica(follaDellOndata(ep(id), n), settore);
  it('e30 ondate 2 e 4, e17 ondata 4: via dallo stadio anche la chiamata', () => {
    expect(esce('e30', 2, 'strada_cinderwick')).toBe(true);
    expect(esce('e30', 4, 'strada_cinderwick')).toBe(true);
    expect(esce('e17', 4, 'strada_cinderwick')).toBe(true);
    expect(esce('e17', 4, 'piazza_municipio')).toBe(true);
  });
  it('senza corteo dell\'ondata decide la partita, come prima (e01 ondata 1: verso lo stadio)', () => {
    for (const s of ep('e01').mappa.settori) expect(esce('e01', 1, s.id)).toBe(false);
  });
  it('braccio rosso __NO_C74D01: e30 ondata 2, la chiamata torna verso lo stadio (il difetto del collaudo)', () => {
    g.__NO_C74D01 = true;
    expect(esce('e30', 2, 'strada_cinderwick')).toBe(false);
  });
});
