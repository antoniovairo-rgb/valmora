// Guardiani della resa che non serve il browser per controllare.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { leggiDati, leggiSchemi } from '../tools/dati-disco.mjs';
import { attenta } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { giocaMissione } from '../src/logica/missione.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';
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
  it('il giocatore attento arriva all\'esito migliore', () => {
    const dich = new Map(((dati['stato.json'] as { variabili: Dichiarazione[] }).variabili).map((d) => [d.id, d]));
    const m = dati['missioni/m_prova.json'] as Missione;
    expect(giocaMissione(m, variabiliIniziali(dich.values()), dich, attenta(creaCaso(1), dich)).esito.id).toBe('esito_buono');
  });
});
