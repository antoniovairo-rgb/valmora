import { describe, expect, it } from 'vitest';
import { registra, superato, valutaEpisodio, variabiliDiPartenza, type Registro } from '../src/logica/episodi.ts';
import type { EsitoMissione } from '../src/logica/missione.ts';
import type { Missione } from '../src/logica/tipi.ts';

const m = { stelle: { due: { var: 't', al_massimo: 3 }, tre: { tutte: [{ var: 't', al_massimo: 3 }, { var: 'c', almeno: 5 }] } } } as unknown as Missione;
const esito = (id: string, fallita: boolean, v: Record<string, number>) => ({ esito: { id, fallita, se: {}, effetti: [], verbale: '' }, variabili: v, rapporti: [], scelte: [] }) as EsitoMissione;

describe('stelle', () => {
  it('fallito = 0 stelle', () => expect(valutaEpisodio(m, esito('deg', true, { t: 0, c: 9 }))).toEqual({ esito: 'deg', fallita: true, stelle: 0 }));
  it('superato = 1, tensione bassa = 2, tensione bassa e credito salvato = 3', () => {
    expect(valutaEpisodio(m, esito('ok', false, { t: 5, c: 9 })).stelle).toBe(1);
    expect(valutaEpisodio(m, esito('ok', false, { t: 2, c: 4 })).stelle).toBe(2);
    expect(valutaEpisodio(m, esito('ok', false, { t: 2, c: 5 })).stelle).toBe(3);
  });
});

describe('registro della mappa degli episodi', () => {
  const prima = { c: 5 };
  it('un fallimento conta come tentativo ma non supera l\'episodio', () => {
    const { registro, migliore } = registra({}, 'e01', prima, { esito: 'deg', fallita: true, stelle: 0 }, { c: 1 });
    expect(migliore).toBe(false);
    expect(superato(registro, 'e01')).toBe(false);
    expect(registro.e01!.tentativi).toBe(1);
    expect(variabiliDiPartenza(registro, 'e01', { c: 99 })).toEqual(prima); // si riparte da prima del primo tentativo
  });
  it('resta il risultato migliore; a parità di stelle resta il primo', () => {
    let reg: Registro = {};
    reg = registra(reg, 'e01', prima, { esito: 'a', fallita: false, stelle: 2 }, { c: 4 }).registro;
    reg = registra(reg, 'e01', prima, { esito: 'b', fallita: false, stelle: 1 }, { c: 3 }).registro;
    expect(reg.e01!.migliore!.esito).toBe('a');
    const r = registra(reg, 'e01', prima, { esito: 'c', fallita: false, stelle: 2 }, { c: 2 });
    expect(r.migliore).toBe(false);
    reg = registra(r.registro, 'e01', prima, { esito: 'd', fallita: false, stelle: 3 }, { c: 6 }).registro;
    expect(reg.e01).toMatchObject({ tentativi: 4, migliore: { esito: 'd', stelle: 3 }, variabili_dopo: { c: 6 } });
  });
});
