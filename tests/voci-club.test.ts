// C32-03/04 (dati veri): dopo D-138 il presidente dello Skyfield non compare più in e07/e08, e le offerte di steward
// le fanno i responsabili della sicurezza dei club: chi parla in prima persona per un club non è il vice. Rosso:
// rimettere `fonte: "vice"`. (C32-04, la condizione presidente_incontrato, resta: toglierla rende e08 più facile di
// e07 per il bot casuale, 63,8% → 55,6% di fallite, contro D-108.)
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { Missione } from '../src/logica/tipi.ts';

const ep = (id: string) => JSON.parse(readFileSync(`data/missioni/${id}.json`, 'utf8')) as Missione;
const chiamata = (id: string, c: string) => ep(id).ondate.flatMap((o) => o.chiamate).find((x) => x?.id === c)!;

describe('C32-03 offerte di steward dai club', () => {
  it.each([
    ['e07', 'immagine_club', 'ufficio_sicurezza_larkspire'],
    ['e08', 'consiglio_presidente', 'ufficio_sicurezza_cinderwick'],
  ])('%s %s: parla la sicurezza del club', (e, c, fonte) => {
    expect((chiamata(e, c) as { fonte: string }).fonte).toBe(fonte);
  });
});
