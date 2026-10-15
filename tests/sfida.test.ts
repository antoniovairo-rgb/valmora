// C26-01: la sfida «Stasera» è a due; i gemellati (settore «…gemellati») non sono uno sfidante (src/resa/stemma.tsx).
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { sfidanti } from '../src/resa/stemma.tsx';
import type { Missione } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C75G01; });
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
