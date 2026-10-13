// PO-101: ogni ondata ha una riga «eXX.ondataN.i» (≤ 90 caratteri) che spiega il momento della serata, mostrata dall'icona
// «i» accanto al titolo. Non è un suggerimento (D-116): il guardiano controlla presenza e lunghezza, la rilettura il resto.
import { describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import type { Missione } from '../src/logica/tipi.ts';

const d = leggiDati() as Record<string, unknown>;
export const INFO_MAX = 90;

export function righeMancanti(dati: Record<string, unknown>) {
  const fuori: string[] = [];
  for (const [k, v] of Object.entries(dati)) {
    if (!k.startsWith('missioni/')) continue;
    const m = v as Missione; const t = (dati[`testi/it/${m.id}.json`] ?? {}) as Record<string, string>;
    for (const o of m.ondate) {
      const chiave = `${(o.titolo ?? `testi:${m.id}.ondata${o.n}`).replace(/^testi:/, '')}.i`;
      const x = t[chiave];
      if (!x) fuori.push(`${m.id} ondata ${o.n}: manca «${chiave}»`);
      else if (x.length > INFO_MAX) fuori.push(`${m.id} ondata ${o.n}: ${x.length} caratteri`);
    }
  }
  return fuori;
}

describe('ogni ondata spiega il suo momento (PO-101)', () => {
  it('ogni ondata di ogni episodio ha la sua riga «i» di al massimo 90 caratteri', () => {
    expect(righeMancanti(d)).toEqual([]);
  });
  it('braccio rosso: una riga tolta viene segnalata', () => {
    const t = { ...(d['testi/it/e07.json'] as Record<string, string>) };
    delete t['e07.ondata2.i'];
    expect(righeMancanti({ ...d, 'testi/it/e07.json': t })).toContain('e07 ondata 2: manca «e07.ondata2.i»');
  });
});
