// D-106: le versioni di un esito («confermato_procura» di «confermato») hanno il tono dell'esito base.
// Rosso C24T01: tono dalla sola posizione → «Confermato» con procura/stampa/comando esce «medio».
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { tono } from '../src/resa/partita.ts';
import type { Missione } from '../src/logica/tipi.ts';

const dati = leggiDati();
const m = (id: string) => dati[`missioni/${id}.json`] as Missione;
const toni = (x: Missione) => Object.fromEntries(x.esiti.map((e) => [e.id, tono(x, e)]));

describe('tono degli esiti', () => {
  afterEach(() => { delete (globalThis as Record<string, unknown>).__NO_C24T01; });
  it('e36: ogni versione di «confermato» è «bene», il degenerato «male»', () => {
    const t = toni(m('e36'));
    for (const v of ['confermato', 'confermato_procura', 'confermato_stampa', 'confermato_comando']) expect(t[v]).toBe('bene');
    expect(t.prorogato_stampa).toBe('medio');
    expect(t.degenerato).toBe('male');
  });
  it('un id che inizia come un altro non è una versione (e01: contenuto_a_fatica resta «medio»)', () => {
    expect(toni(m('e01')).contenuto_a_fatica).toBe('medio');
  });
  it('rosso C24T01: senza la regola le versioni escono «medio»', () => {
    (globalThis as Record<string, unknown>).__NO_C24T01 = true;
    expect(toni(m('e36')).confermato_procura).toBe('medio');
  });
});
