// PO-084 / PO-085: fonti brevi (≤ 80 caratteri) e chiamate in stile radio (≤ 100), a partire dalla stagione 1
// (e01–e12). Le altre stagioni entrano nell'elenco man mano che vengono riscritte.
import { describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import type { Missione } from '../src/logica/tipi.ts';

const d = leggiDati() as Record<string, unknown>;
const RISCRITTI = Array.from({ length: 12 }, (_, i) => `e${String(i + 1).padStart(2, '0')}`);
export const FONTE_MAX = 80, CHIAMATA_MAX = 100;

const chiamate = (m: Missione) => m.ondate.flatMap((o) => o.chiamate ?? []);
export function troppoLunghi(dati: Record<string, unknown>, episodi: string[]) {
  const fuori: string[] = [];
  for (const ep of episodi) {
    const m = dati[`missioni/${ep}.json`] as Missione; const t = dati[`testi/it/${ep}.json`] as Record<string, string>;
    const testo = (k: string) => [k, `${k}@f`].map((x) => t[x.replace(/^testi:/, '')]).filter(Boolean) as string[];
    for (const b of m.briefing) for (const x of testo(b.testo)) if (x.length > FONTE_MAX) fuori.push(`${ep} fonte ${x.length}: ${x}`);
    for (const c of chiamate(m)) for (const x of testo(c.testo)) if (x.length > CHIAMATA_MAX) fuori.push(`${ep} ${c.id} ${x.length}: ${x}`);
  }
  return fuori;
}

describe('fonti e chiamate brevi (PO-084, PO-085)', () => {
  it('stagione 1: ogni fonte ≤ 80 caratteri, ogni chiamata ≤ 100', () => {
    expect(troppoLunghi(d, RISCRITTI)).toEqual([]);
  });
  it('braccio rosso: un testo lungo viene segnalato', () => {
    const lungo = { ...(d['testi/it/e01.json'] as Record<string, string>) };
    const m = d['missioni/e01.json'] as Missione;
    lungo[m.briefing[0].testo.replace(/^testi:/, '')] = 'x'.repeat(FONTE_MAX + 1);
    expect(troppoLunghi({ ...d, 'testi/it/e01.json': lungo }, ['e01']).length).toBeGreaterThan(0);
  });
});
