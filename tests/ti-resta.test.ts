// C42-06 (D-185, collaudo C-042): l'avviso dello schieramento diceva «Ti restano 1 mediatore». Con una sola unità
// rimasta: «Ti resta». Rosso __NO_C42R01: sempre «Ti restano», come prima.
import { afterEach, describe, expect, it } from 'vitest';
import { tiResta } from '../src/resa/schermate/Schieramento.tsx';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C42R01; });
describe('C42-06 «Ti resta» con una sola unità', () => {
  it('verde', () => { expect(tiResta(1)).toBe('Ti resta'); expect(tiResta(2)).toBe('Ti restano'); });
  it('rosso C42R01', () => { g.__NO_C42R01 = true; expect(tiResta(1)).toBe('Ti restano'); });
});
