// Risorse fisse (D-082, transenne di e03): piazzate una volta, restano per tutte le ondate dopo.
import { afterEach, describe, expect, it } from 'vitest';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiudiOndata, disponibili, iniziaMissione, schiera, settoriAmmessi } from '../src/logica/missione.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const dich = new Map<string, Dichiarazione>([['tensione_max', { id: 'tensione_max', tipo: 'int', min: 0, max: 10, iniziale: 0, descrizione: 'prova' }]]);
const v0 = variabiliIniziali(dich.values());
const ondata = (n: number, p: number) => ({ n, eventi: [{ id: `e${n}`, tipo: 'folla', settore: 'strada', pressione: p }] });
const m: Missione = {
  id: 'm', stagione: 1, episodio: 3, titolo: 'testi:m.t', disponibile_se: {}, briefing: [], fili: [], stelle: { due: {}, tre: {} },
  mappa: { settori: [{ id: 'strada', tipo: 'strada' }, { id: 'curva', tipo: 'curva' }],
    risorse: { transenne: { quantita: 2, efficacia: { strada: 3 }, fissa: true }, squadre: { quantita: 1, efficacia: { strada: 2, curva: 2 } } } },
  ondate: [ondata(1, 3), ondata(2, 3), ondata(3, 5)],
  esiti: [{ id: 'fine', se: {}, effetti: [], verbale: 'testi:m.f' }],
};
const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C09F01; delete g.__NO_C09F02; });

function dueOndate() {
  let s = iniziaMissione(m, v0, dich);
  s = chiudiOndata(m, schiera(m, s, { transenne: { strada: 1 }, squadre: {} }), dich);
  const disp2 = disponibili(m, s);
  s = chiudiOndata(m, schiera(m, s, { transenne: {}, squadre: {} }), dich); // ondata 2: niente schierato a mano
  return { disp2, s };
}

describe('risorse fisse (D-082)', () => {
  it('le transenne piazzate restano: non tornano disponibili e coprono ancora il settore', () => {
    const { disp2, s } = dueOndate();
    expect(disp2).toEqual({ transenne: 1, squadre: 1 });
    expect(s.rapporti[1]!.scoperto.strada).toBe(0);
    expect(s.fisse).toEqual({ transenne: { strada: 1 } });
  });
  it('le transenne in un settore scoperto non vanno a riposo', () => {
    let { s } = dueOndate();
    s = chiudiOndata(m, schiera(m, s, { transenne: {}, squadre: {} }), dich); // ondata 3: pressione 5 > 3
    expect(s.rapporti[2]!.scoperto.strada).toBe(2);
    expect(s.rapporti[2]!.aRiposo.transenne).toBeUndefined();
  });
  it('le transenne si montano solo dove servono, non sugli spalti', () => {
    expect(settoriAmmessi(m, 'transenne')).toEqual(['strada']);
    expect(() => schiera(m, iniziaMissione(m, v0, dich), { transenne: { curva: 1 }, squadre: {} })).toThrow(/non si montano/);
    g.__NO_C09F02 = true;
    expect(() => schiera(m, iniziaMissione(m, v0, dich), { transenne: { curva: 1 }, squadre: {} })).not.toThrow();
  });
  it('braccio rosso __NO_C09F01: le transenne tornano unità normali e la strada resta scoperta', () => {
    g.__NO_C09F01 = true;
    const { disp2, s } = dueOndate();
    expect(disp2.transenne).toBe(2);
    expect(s.rapporti[1]!.scoperto.strada).toBe(3);
  });
});
