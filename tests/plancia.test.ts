import { describe, expect, it } from 'vitest';
import { applica, valuta, variabiliIniziali } from '../src/logica/condizioni.ts';
import { controllaDisposizione, giocaMissione, risolviOndata } from '../src/logica/plancia.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const dich = new Map<string, Dichiarazione>([
  ['tensione_max', { id: 'tensione_max', tipo: 'int', min: 0, max: 99, iniziale: 0, descrizione: 'prova' }],
  ['b', { id: 'b', tipo: 'bool', iniziale: false, descrizione: 'prova' }],
]);
const v0 = variabiliIniziali(dich.values());
const missione = (): Missione => ({
  id: 'm', stagione: 1, episodio: 1, titolo: 'testi:m.t', disponibile_se: {}, briefing: [], fili: [],
  mappa: { settori: [{ id: 'strada', tipo: 'strada' }, { id: 'curva', tipo: 'curva' }],
    risorse: { squadre: { quantita: 2, efficacia: { strada: 2, curva: 1 } }, mediatore: { quantita: 1, efficacia: {}, dimezza: ['corteo'] } } },
  ondate: [{ n: 1, eventi: [{ id: 'c', tipo: 'corteo', settore: 'strada', pressione: 7 }, { id: 'k', tipo: 'cori', settore: 'curva', pressione: 2, se: { var: 'b', uguale: true } }] }],
  esiti: [{ id: 'ok', se: { var: 'tensione_max', al_massimo: 0 }, effetti: [{ imposta: 'b', valore: true }], verbale: 'testi:m.ok' },
    { id: 'ko', se: {}, effetti: [], verbale: 'testi:m.ko' }],
});

describe('condizioni ed effetti', () => {
  it('operatori', () => {
    const v = { ...v0, tensione_max: 3 };
    expect(valuta({}, v)).toBe(true);
    expect(valuta({ tutte: [{ var: 'tensione_max', almeno: 3 }, { non: { var: 'b', uguale: true } }] }, v)).toBe(true);
    expect(valuta({ almeno_una: [{ var: 'tensione_max', al_massimo: 2 }] }, v)).toBe(false);
  });
  it('aggiungi resta nei limiti', () => expect(applica({ aggiungi: 'tensione_max', valore: 500 }, v0, dich).tensione_max).toBe(99));
});

describe('plancia', () => {
  it('efficacia per tipo di settore e dimezzamento del corteo (7 → 3)', () => {
    const r = risolviOndata(missione(), 1, { squadre: { strada: 1 }, mediatore: { strada: 1 } }, v0);
    expect(r.scoperto).toEqual({ strada: 1, curva: 0 }); // 3 − 2
  });
  it('senza mediatore il corteo pesa intero', () => expect(risolviOndata(missione(), 1, { squadre: { strada: 2 } }, v0).tensione).toBe(3));
  it('evento con condizione falsa non pesa', () => expect(risolviOndata(missione(), 1, { squadre: { strada: 2 }, mediatore: { strada: 1 } }, v0).scoperto.curva).toBe(0));
  it('disposizioni non valide rifiutate', () => {
    expect(controllaDisposizione(missione(), { squadre: { strada: 3 } })).toEqual(['squadre: 3 unità disposte, ne hai 2']);
    expect(controllaDisposizione(missione(), { elicottero: {} }).length).toBe(1);
    expect(controllaDisposizione(missione(), { squadre: { tribuna: 1 } }).length).toBe(1);
  });
  it('missione: primo esito vero, effetti applicati, tensione_max registrata', () => {
    const r = giocaMissione(missione(), v0, dich, () => ({ squadre: { strada: 2 }, mediatore: { strada: 1 } }));
    expect(r.esito.id).toBe('ok');
    expect(r.variabili).toMatchObject({ tensione_max: 0, b: true });
  });
  it('soft-lock dichiarato se nessun esito è vero', () => {
    const m = missione(); m.esiti = [m.esiti[0]!];
    expect(() => giocaMissione(m, v0, dich, () => ({}))).toThrow(/soft-lock/);
  });
});
