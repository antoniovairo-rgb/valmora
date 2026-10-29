// D-246 (C53-01, collaudo C-053): la carta d'imprevisto non arriva mai per ultima nell'ondata. Prima il posto «dopo n chiamate»
// contava la lista dei dati, comprese chiamate con «se», «senza» o «dopo» che non arrivano: la carta finiva ultima nel 5% delle
// ondate (10% di quelle con la carta nuova). Ora conta le chiamate che arrivano davvero (src/logica/partita.ts, conCarta).
// Guardiano: 300 semi × 36 episodi × 2 bot (attento, casuale), 0 ondate con la carta per ultima; seme 0 (partita classica)
// invariato e 0; rosso __NO_C246I01 (posto statico, come prima): torna intorno al 5% delle ondate.
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { ultime } from '../tools/misura-d246.mjs';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C246I01; });
const d = leggiDati() as Record<string, unknown>;
const somma = (r: ReturnType<typeof ultime>) => { const o = r.reduce((s, x) => s + x.ondate, 0), u = r.reduce((s, x) => s + x.ultima, 0); return { o, u, quota: u / o }; };

describe('D-246 la carta d\'imprevisto non arriva per ultima', () => {
  it('verde: 0 ondate su 300 semi × 36 episodi × 2 bot; seme 0: 0', () => {
    const r = ultime(d, 300);
    expect(r.filter((x) => x.ultima).map((x) => `${x.missione} ${x.bot} ${x.ultima}: ${x.dove.map(([k, n]) => `${k} ${n}`).join(', ')}`)).toEqual([]);
    expect(somma(r).o).toBe(36 * 2 * 300 * 142 / 36); // 142 ondate × 300 semi × 2 bot: tutte giocate
    expect(somma(ultime(d, 300, true)).u).toBe(0);
  }, 300_000);
  it('rosso __NO_C246I01: col posto statico la carta torna ultima (misurato 5,1% attento, 5,6% casuale)', () => {
    g.__NO_C246I01 = true;
    const { quota } = somma(ultime(d, 300));
    if (process.env.MOSTRA) console.log(`rosso C246I01: ${(100 * quota).toFixed(1)}%`);
    expect(quota).toBeGreaterThan(0.04);
  }, 300_000);
});
