// Guardiani della resa che non serve il browser per controllare.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { leggiDati, leggiSchemi } from '../tools/dati-disco.mjs';
import { giraBot } from '../tools/bot.mjs';
import { validaDati } from '../src/dati/valida.ts';
import { CREDITI, PACCHETTI } from '../src/resa/crediti.ts';
import { livello } from '../src/resa/partita.ts';

describe('crediti (D-052)', () => {
  const dipendenze = Object.keys(JSON.parse(readFileSync('package.json', 'utf8')).dependencies as Record<string, string>);
  const md = readFileSync('CREDITI.md', 'utf8');
  it('ogni dipendenza di runtime ha la sua voce nella schermata Crediti', () => {
    for (const d of dipendenze) expect(CREDITI.some((c) => c.nome === PACCHETTI[d]), d).toBe(true);
  });
  it('ogni dipendenza di runtime è citata in CREDITI.md', () => {
    for (const d of dipendenze) expect(md.includes(`\`${d}\``), d).toBe(true);
  });
});

describe('tensione a colori (D-055)', () => {
  it('0 è calma, 10 è il livello più alto, sempre fra 0 e 5', () => {
    expect([0, 1, 2, 3, 5, 8, 10].map(livello)).toEqual([0, 1, 1, 2, 3, 4, 5]);
  });
});

describe('missione di prova della resa (tests/resa/dati-prova)', () => {
  const dati = leggiDati('tests/resa/dati-prova');
  it('rispetta lo schema', () => expect(validaDati(leggiSchemi(), dati)).toEqual([]));
  it('0 blocchi e il giocatore attento arriva all\'esito migliore', () => {
    const r = giraBot(dati, 50);
    expect(r.flatMap((x) => x.blocchi)).toEqual([]);
    expect(Object.keys(r.find((x) => x.strategia === 'attenta')!.esiti)).toEqual(['esito_buono']);
  });
});
