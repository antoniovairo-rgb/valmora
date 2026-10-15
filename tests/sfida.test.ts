// C26-01: la sfida «Stasera» è a due; i gemellati (settore «…gemellati») non sono uno sfidante (src/resa/stemma.tsx).
// C26-06 (D-130): col campo «partita» la sfida è casa contro ospiti.
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { sfidanti } from '../src/resa/stemma.tsx';
import type { Missione } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C75G01; delete g.__NO_C79P01; });
const ep = (id: string) => JSON.parse(readFileSync(`data/missioni/${id}.json`, 'utf8')) as Missione;

describe('C26-01 sfida senza i gemellati', () => {
  it('e15 ed e27: due club, nessun gemellato; e01 invariato', () => {
    expect(sfidanti(ep('e15'))).toEqual(['cinderwick_united', 'wallgate_rovers']);
    expect(sfidanti(ep('e27'))).toEqual(['cinderwick_united', 'waterline_city']);
    expect(sfidanti(ep('e01'))).toEqual(['cinderwick_united', 'larkspire_athletic']);
  });
  it('braccio rosso __NO_C75G01: tre club, il difetto del collaudo', () => {
    g.__NO_C75G01 = true;
    expect(sfidanti(ep('e15'))).toHaveLength(3);
  });
});

describe('C26-06 sfida dal campo partita (D-130)', () => {
  it('con «partita» casa contro ospiti, anche senza la curva di uno dei due', () => {
    expect(sfidanti(ep('e13'))).toEqual(['cinderwick_united', 'tramway_borough']);
    expect(sfidanti(ep('e25'))).toEqual(['cinderwick_united', 'belltower_harriers']);
    expect(sfidanti(ep('e07'))).toEqual(['larkspire_athletic', 'southwind_town']);
    expect(sfidanti(ep('e31'))).toEqual(['larkspire_athletic', 'railhead_county']);
  });
  it('braccio rosso __NO_C79P01: dalle curve, un club solo (il difetto del collaudo)', () => {
    g.__NO_C79P01 = true;
    expect(sfidanti(ep('e13'))).toEqual(['cinderwick_united']);
    expect(sfidanti(ep('e07'))).toEqual(['southwind_town']);
  });
});
