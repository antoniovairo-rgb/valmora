import { expect, it } from 'vitest';
import { scegliTesto } from '../src/dati/testi.ts';

const testi = { 'e.a': 'Benvenuto', 'e.a@f': 'Benvenuta', 'e.b': 'Ciao' };
it('variante femminile se c\'è, altrimenti la forma base', () => {
  expect(scegliTesto(testi, 'testi:e.a', 'f')).toBe('Benvenuta');
  expect(scegliTesto(testi, 'e.a', 'm')).toBe('Benvenuto');
  expect(scegliTesto(testi, 'e.b', 'f')).toBe('Ciao');
  expect(scegliTesto(testi, 'e.z', 'f')).toBeUndefined();
});
