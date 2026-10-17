// C33-09 (D-146): nel verbale il requisito della stella dice anche il numero, non solo il colore: «… Seconda stella: tensione massima 3 su 10
// (raggiunta: 4).» (D-147) Rosso __NO_C109S01: solo i colori.
import { afterEach, describe, expect, it } from 'vitest';
import { requisitoInParole } from '../src/resa/schermate/Bilancio.tsx';
import type { Requisito } from '../src/logica/bilancio.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C109S01; });
const q = { var: 'tensione_max', confronto: 'al_massimo', soglia: 3, valore: 4, ok: false } as unknown as Requisito;

describe('C33-09 seconda stella col numero', () => {
  it('dice soglia, scala e valore raggiunto', () => {
    const s = requisitoInParole(q, 2);
    expect(s).toContain('Seconda stella: tensione massima 3 su 10 (raggiunta: 4).');
  });
  it('braccio rosso: solo i colori, nessun numero', () => {
    g.__NO_C109S01 = true;
    expect(requisitoInParole(q, 2)).not.toMatch(/\d/);
  });
});
