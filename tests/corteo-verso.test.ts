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
  // C30-01: con la «meta» sul municipio (C27-02) il viale finisce lì: l'ondata 2 («dallo stadio verso il municipio») va
  // nel verso del viale, cioè «entra» verso la meta; l'ondata 4 (fiaccolata dal municipio al porto) se ne allontana.
  it('e30 ondata 2 verso la meta (municipio), ondata 4 ed e17 ondata 4 via', () => {
    expect(verso('e30', 2)).toBe('entra');
    // D-141 (C33-02): e30 ondata 4 è «dalla_meta» (dal municipio verso lo stadio): rispetto allo stadio entra
    expect(verso('e30', 4)).toBe('entra');
    expect(verso('e17', 4)).toBe('esce');
  });
  it('senza campo verso non cambia (e01 ondata 1: verso lo stadio)', () => {
    for (const c of follaDellOndata(ep('e01'), 1).cortei) expect(c.verso).toBe('entra');
  });
  it('braccio rosso __NO_C73V01: e17 ondata 4 verso lo stadio, il difetto del collaudo (e30 o4 è ora «dalla_meta», D-141)', () => {
    g.__NO_C73V01 = true;
    expect(verso('e17', 4)).toBe('entra');
  });
});

// C27-01: il corteo della chiamata (dinamica PO-089) andava verso lo stadio mentre quello dell'ondata ne usciva.
describe('C27-01 il corteo della chiamata va col corteo dell\'ondata', () => {
  const esce = (id: string, n: number, settore: string) => esceDinamica(follaDellOndata(ep(id), n), settore);
  it('e30 ondata 2 verso il municipio come l\'ondata; ondata 4 ed e17 ondata 4 via', () => {
    expect(esce('e30', 2, 'strada_cinderwick')).toBe(false);
    expect(esce('e30', 4, 'strada_cinderwick')).toBe(false); // D-141: «dalla_meta», verso lo stadio
    expect(esce('e17', 4, 'strada_cinderwick')).toBe(true);
    expect(esce('e17', 4, 'piazza_municipio')).toBe(true);
  });
  it('senza corteo dell\'ondata decide la partita, come prima (e01 ondata 1: verso lo stadio)', () => {
    for (const s of ep('e01').mappa.settori) expect(esce('e01', 1, s.id)).toBe(false);
  });
  it('braccio rosso __NO_C74D01: e17 ondata 4, la chiamata torna verso lo stadio (il difetto del collaudo)', () => {
    g.__NO_C74D01 = true;
    expect(esce('e17', 4, 'strada_cinderwick')).toBe(false);
  });
});
