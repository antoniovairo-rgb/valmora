import { describe, expect, it } from 'vitest';
import { creaCaso, daStato, statoDaSeme } from '../src/logica/caso.ts';

const sequenza = (seme: number | string, n = 5) => { const c = creaCaso(seme); return Array.from({ length: n }, () => c.numero()); };

describe('generatore casuale con seme', () => {
  it('stesso seme, stessa sequenza', () => expect(sequenza(42, 100)).toEqual(sequenza(42, 100)));
  it('semi diversi, sequenze diverse (semi 1…1000)', () => {
    const prime = new Set(Array.from({ length: 1000 }, (_, i) => sequenza(i + 1, 1)[0]));
    expect(prime.size).toBe(1000);
  });
  it('ripresa dallo stato salvato = stessa continuazione', () => {
    const a = creaCaso(7); for (let i = 0; i < 37; i++) a.numero();
    const b = daStato(a.stato());
    expect(Array.from({ length: 20 }, () => b.numero())).toEqual(Array.from({ length: 20 }, () => a.numero()));
  });
  it('seme stringa stabile', () => expect(statoDaSeme('e01')).toBe(statoDaSeme('e01')));
  it('numeri in [0,1), interi nei limiti, scelta uniforme (60.000 tiri, scarto < 3%)', () => {
    const c = creaCaso(2026); const conta = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 60000; i++) {
      const x = c.numero(); expect(x >= 0 && x < 1).toBe(true);
      const d = c.intero(1, 6); conta[d - 1]! += 1;
    }
    for (const k of conta) expect(Math.abs(k - 10000) / 10000).toBeLessThan(0.03);
    expect(['a', 'b', 'c']).toContain(c.scegli(['a', 'b', 'c']));
  });
  it('errori espliciti su ingressi non validi', () => {
    expect(() => creaCaso(1.5)).toThrow(); expect(() => creaCaso(1).intero(3, 1)).toThrow(); expect(() => creaCaso(1).scegli([])).toThrow();
  });
});
