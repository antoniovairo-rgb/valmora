// C09-01: una scelta che alza la tensione di un settore presidiato conta per le stelle anche se a fine ondata si dimezza.
// Il rapporto deve mostrarlo: «picco» = tensione più alta dell'ondata, e il massimo dei picchi è «tensione_max».
import { afterEach, describe, expect, it } from 'vitest';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiudiOndata, iniziaMissione, rispondi, schiera } from '../src/logica/missione.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const dich = new Map<string, Dichiarazione>([['tensione_max', { id: 'tensione_max', tipo: 'int', min: 0, max: 10, iniziale: 0, descrizione: 'prova' }]]);
const m: Missione = {
  id: 'm', stagione: 1, episodio: 1, titolo: 'testi:m.t', disponibile_se: {}, briefing: [], fili: [], stelle: { due: {}, tre: {} },
  mappa: { settori: [{ id: 'curva', tipo: 'curva', club: 'c' }], risorse: { steward: { quantita: 2, efficacia: { curva: 2 } } } },
  ondate: [{ n: 1, eventi: [], chiamate: [{ id: 'k', fonte: 'f', testo: 'testi:m.k', opzioni: [
    { id: 'scalda', testo: 'testi:m.a', effetti: [{ tensione: 'curva', valore: 1 }] }, { id: 'niente', testo: 'testi:m.b', effetti: [] }] }] }],
  esiti: [{ id: 'fine', se: {}, effetti: [], verbale: 'testi:m.f' }],
};
const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C10P01; });
const gioca = () => {
  let s = schiera(m, iniziaMissione(m, variabiliIniziali(dich.values()), dich), { steward: { curva: 2 } });
  s = rispondi(m, s, 'k', 'scalda', dich);
  return chiudiOndata(m, s, dich);
};

describe('picco di tensione nel rapporto (C09-01)', () => {
  it('il settore presidiato si calma (0) ma il rapporto mostra il picco (1), lo stesso che conta per le stelle', () => {
    const s = gioca();
    expect(s.rapporti[0]!.tensione.curva).toBe(0);
    expect(s.rapporti[0]!.picco?.curva).toBe(1);
    expect(s.variabili.tensione_max).toBe(1);
  });
  it('braccio rosso __NO_C10P01: senza picco il rapporto dice 0 mentre le stelle contano 1', () => {
    g.__NO_C10P01 = true;
    const s = gioca();
    expect(s.rapporti[0]!.picco).toBeUndefined();
    expect(s.variabili.tensione_max).toBe(1);
  });
});
