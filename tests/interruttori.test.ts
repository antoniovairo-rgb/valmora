import { afterEach, expect, it } from 'vitest';
import { acceso, spento } from '../src/interruttori.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_PROVA; });

it('interruttore rosso letto da globalThis', () => {
  expect(acceso('PROVA')).toBe(true);
  g.__NO_PROVA = true;
  expect(spento('PROVA')).toBe(true);
});
it('nome non valido rifiutato', () => expect(() => spento('prova')).toThrow());
