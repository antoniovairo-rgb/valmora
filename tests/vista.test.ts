// C25-08: l'icona di chi chiama tagliata dal fondo della finestra si porta in vista (src/resa/vista.ts).
import { afterEach, describe, expect, it } from 'vitest';
import { scorriPerIntero } from '../src/resa/vista.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C71S01; });

describe('C25-08 riquadro tagliato dal fondo della finestra', () => {
  it('tagliato: scorre quanto basta più il margine; intero o tutto sotto: fermo', () => {
    expect(scorriPerIntero(640, 673, 667, 8)).toBe(14); // il caso del collaudo: bordo alto a 640 su 667
    expect(scorriPerIntero(500, 533, 667, 8)).toBe(0);
    expect(scorriPerIntero(700, 733, 667, 8)).toBe(0);
  });
  it('braccio rosso __NO_C71S01: resta tagliato', () => {
    g.__NO_C71S01 = true;
    expect(scorriPerIntero(640, 673, 667, 8)).toBe(0);
  });
});
