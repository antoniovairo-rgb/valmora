// D-106: le versioni di un esito («confermato_procura» di «confermato») hanno il tono dell'esito base.
// Rosso C24T01: tono dalla sola posizione → «Confermato» con procura/stampa/comando esce «medio».
// C41-07: l'esito più basso non fallito è «male» (la posa «male» del verbale compare in partita). Rosso C41T07.
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { tono } from '../src/resa/partita.ts';
import type { Missione } from '../src/logica/tipi.ts';

const dati = leggiDati();
const m = (id: string) => dati[`missioni/${id}.json`] as Missione;
const toni = (x: Missione) => Object.fromEntries(x.esiti.map((e) => [e.id, tono(x, e)]));

describe('tono degli esiti', () => {
  afterEach(() => { delete (globalThis as Record<string, unknown>).__NO_C24T01; delete (globalThis as Record<string, unknown>).__NO_C41T07; });
  it('e36: ogni versione di «confermato» è «bene», il degenerato «male»', () => {
    const t = toni(m('e36'));
    for (const v of ['confermato', 'confermato_procura', 'confermato_stampa', 'confermato_comando']) expect(t[v]).toBe('bene');
    expect(t.prorogato_stampa).toBe('medio');
    expect(t.degenerato).toBe('male');
  });
  it('un id che inizia come un altro non è una versione (e01: contenuto_a_fatica non è «bene» come contenuto)', () => {
    (globalThis as Record<string, unknown>).__NO_C41T07 = true; // senza C41-07 resta «medio»
    expect(toni(m('e01')).contenuto_a_fatica).toBe('medio');
  });
  it('C41-07: l\'esito più basso non fallito è «male» (e01 contenuto_a_fatica; e36 sostituito e le sue versioni)', () => {
    expect(toni(m('e01')).contenuto_a_fatica).toBe('male');
    const t = toni(m('e36'));
    for (const v of ['sostituito', 'sostituito_procura', 'sostituito_stampa', 'sostituito_comando']) expect(t[v]).toBe('male');
    expect(t.prorogato).toBe('medio');
    expect(t.confermato).toBe('bene');
    // in ogni episodio almeno un esito non fallito ha il tono «male» (la posa del verbale compare in partita)
    for (const [k, x] of Object.entries(dati)) if (k.startsWith('missioni/')) { const mm = x as Missione; if (mm.esiti.filter((e) => !e.fallita).length > 1) expect(mm.esiti.some((e) => !e.fallita && tono(mm, e) === 'male'), mm.id).toBe(true); }
  });
  it('rosso C41T07: senza la regola nessun esito non fallito è «male» in e01', () => {
    (globalThis as Record<string, unknown>).__NO_C41T07 = true;
    expect(m('e01').esiti.filter((e) => !e.fallita).map((e) => tono(m('e01'), e))).toEqual(['bene', 'medio']);
  });
  it('rosso C24T01: senza la regola le versioni escono «medio»', () => {
    (globalThis as Record<string, unknown>).__NO_C24T01 = true;
    expect(toni(m('e36')).confermato_procura).toBe('medio');
  });
});
