import { describe, expect, it } from 'vitest';
import { migra, SAVE_VERSION } from '../src/salvataggi/salvataggio.ts';
import { GAME_VERSION } from '../src/versione.ts';

const buono = () => ({ save_version: SAVE_VERSION, game_version: GAME_VERSION, seme: 1, caso: 123, variabili: { a: true, b: 2, c: 'x' }, missioni_concluse: ['e01'] });

describe('salvataggi', () => {
  it('un salvataggio corrente passa invariato', () => expect(migra(buono())).toEqual(buono()));
  it('versione futura rifiutata', () => expect(() => migra({ ...buono(), save_version: SAVE_VERSION + 1 })).toThrow(/futura/));
  it('versione non valida rifiutata', () => expect(() => migra({ ...buono(), save_version: 0 })).toThrow(/non valida/));
  it('non oggetto rifiutato', () => expect(() => migra('ciao')).toThrow());
  it('campi rotti rifiutati', () => expect(() => migra({ ...buono(), caso: -1, variabili: { a: null } })).toThrow(/caso non uint32.*variabile a/));
});
