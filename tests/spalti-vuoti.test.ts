// C24-07: negli episodi senza curve lo stadio è disegnato vuoto (S-25): gli spalti sono «vuoti», mai «in arrivo»
// (e30: «Il giorno dopo, niente partita»). Rosso __NO_C67S01: «arrivo», come prima.
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { follaDellOndata } from '../src/resa/mappa/folla.ts';
import type { Missione } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C67S01; });
const ep = (id: string) => JSON.parse(readFileSync(`data/missioni/${id}.json`, 'utf8')) as Missione;

describe('C24-07 spalti negli episodi senza partita', () => {
  it('e30 ed e04, ogni ondata: spalti vuoti', () => {
    for (const id of ['e30', 'e04']) { const m = ep(id); for (let n = 1; n <= m.ondate.length; n++) expect(follaDellOndata(m, n).spalti, `${id} ondata ${n}`).toBe('vuoti'); }
  });
  it('un episodio con le curve non cambia (e01 ondata 1: in arrivo)', () => expect(follaDellOndata(ep('e01'), 1).spalti).toBe('arrivo'));
  it('braccio rosso __NO_C67S01: e30 ondata 2 «in arrivo», il difetto del collaudo', () => {
    g.__NO_C67S01 = true;
    expect(follaDellOndata(ep('e30'), 2).spalti).toBe('arrivo');
  });
});
