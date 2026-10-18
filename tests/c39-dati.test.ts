// C-039 (D-174): C39-06 «Fine stagione 1» e il furgone del rapporto di e12; C39-07 quale settore è degenerato;
// C39-08 e35 «un'altra squadra sul nastro». Verde coi dati e il codice corretti, rosso coi dati di prima.
import { describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { giocaMissione, opzioniValide, settoriDegenerati } from '../src/logica/missione.ts';
import { attenta, casuale } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import { fineStagione } from '../src/logica/epilogo.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const d = leggiDati() as Record<string, unknown>;
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const ms = Object.entries(d).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m as Missione);
const ep = (id: string, dati = d) => dati[`missioni/${id}.json`] as Missione;

/** e12 con furgone_visto falso, «Metti tutto nel rapporto»; il filo del furgone a «Fine stagione 1». */
function furgoneAFineStagione(dati: Record<string, unknown>) {
  const m = ep('e12', dati); const caso = creaCaso('c39:e12');
  const r = giocaMissione(m, { ...v0, furgone_visto: false }, dich, { schiera: attenta(caso, dich).schiera,
    scegli: (mm, s, c) => { const o = opzioniValide(c, s, mm); return (o.find((x) => x.id === 'tutto_rapporto') ?? o[0]!).id; } });
  expect(r.scelte.some((x) => x.opzione === 'tutto_rapporto')).toBe(true);
  const reg = Object.fromEntries(ms.filter((x) => x.stagione === 1).map((x) => [x.id, { migliore: { esito: 'contenuto', fallita: false, stelle: 1 } }]));
  return fineStagione(ms, reg as never, r.variabili, dich.values(), 1).aperti.concat(fineStagione(ms, reg as never, r.variabili, dich.values(), 1).chiusi).find((f) => f.id === 'furgone_visto')?.valore;
}

describe('C39-06 e12: il furgone messo nel rapporto è annotato', () => {
  it('dopo «Metti tutto nel rapporto» il filo del furgone vale true', () => expect(furgoneAFineStagione(d)).toBe(true));
  it('rosso: senza l\'effetto il filo resta «Mai annotato»', () => {
    const x = structuredClone(d); const op = ep('e12', x).ondate.flatMap((o) => o.chiamate ?? []).flatMap((c) => c.opzioni).find((o) => o.id === 'tutto_rapporto')!;
    op.effetti = op.effetti.filter((e) => !('imposta' in e && e.imposta === 'furgone_visto'));
    expect(furgoneAFineStagione(x)).toBe(false);
  });
});

describe('C39-07 i settori degenerati di un rapporto sono tanti quanto la fiducia persa', () => {
  it('e13 ed e35, bot casuale: settoriDegenerati ha −fiducia nomi in ogni rapporto con fiducia < 0', () => {
    let visti = 0;
    for (const id of ['e13', 'e35']) for (let s = 1; s <= 50; s++) {
      const m = ep(id); const r = giocaMissione(m, v0, dich, casuale(creaCaso(`c39:${id}:${s}`), dich));
      for (const x of r.rapporti) if ((x.fiducia ?? 0) < 0) { visti++; expect(settoriDegenerati(m, x)).toHaveLength(-(x.fiducia ?? 0)); }
    }
    expect(visti).toBeGreaterThan(0);
  });
});

describe('C39-08 e35: il costo di sposta_nastro vale in tutti i casi', () => {
  it('nessuna «altra squadra»', () => expect((d['testi/it/e35.json'] as Record<string, string>)['e35.op.sposta_nastro.c']).not.toMatch(/altra squadra/));
});

describe('C39-07 resa: la riga della fiducia nomina il settore degenerato', async () => {
  const { createElement } = await import('react');
  const { renderToStaticMarkup } = await import('react-dom/server');
  const { Rapporto } = await import('../src/resa/schermate/Rapporto.tsx');
  const g = globalThis as Record<string, unknown>;
  const testi = d['testi/it/comune.json'] as Record<string, string>;
  const riga = (m: Missione, r: Parameters<typeof settoriDegenerati>[1] & { n: number; fiducia?: number }) =>
    renderToStaticMarkup(createElement(Rapporto, { m, r: { aRiposo: {}, ...r } as never, ultima: false, prossime: {}, avanti: () => {} })).match(/data-premio-fiducia="[^"]*">([^<]*(?:<!-- -->[^<]*)*)</)?.[1]?.replace(/<!-- -->/g, '') ?? '';
  it('e13: nomi dei settori al posto di «un settore è degenerato»; rosso __NO_C39R07: come prima', () => {
    const m = ep('e13');
    for (let s = 1; s <= 50; s++) {
      const r = giocaMissione(m, v0, dich, casuale(creaCaso(`c39:e13:${s}`), dich)).rapporti.find((x) => (x.fiducia ?? 0) < 0);
      if (!r) continue;
      const nomi = settoriDegenerati(m, r).map((x) => testi[`settore.${x}`] ?? (d['testi/it/e13.json'] as Record<string, string>)[`settore.${x}`]);
      const testo = riga(m, r);
      for (const n of nomi) expect(testo).toContain(n);
      expect(testo).not.toMatch(/un settore è degenerato|settori sono degenerati/);
      g.__NO_C39R07 = true;
      try { expect(riga(m, r)).toMatch(/un settore è degenerato|settori sono degenerati/); } finally { delete g.__NO_C39R07; }
      return;
    }
    throw new Error('nessun rapporto con fiducia persa in 50 partite');
  });
});
