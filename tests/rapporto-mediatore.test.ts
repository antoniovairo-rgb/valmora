// C38-01 (D-173, collaudo C-038): il mediatore schierato presidia il settore ma non lo copre (efficacia nulla); se il
// settore resta scoperto il rapporto dice «presidiato, ma il mediatore qui non basta», non «nessuna unità a coprirlo».
// Casi esatti del collaudo: e14 ondata 1 mediatore alla biglietteria; e17 ondata 3 mediatore alla piazza del municipio
// (ondate prima col bot attento). Partita vera del motore, rapporto disegnato dalla resa. Rosso __NO_C115M01: come prima.
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Rapporto } from '../src/resa/schermate/Rapporto.tsx';
import { chiamateAperte, chiudiOndata, disponibili, iniziaMissione, rispondi, schiera, type InCorso } from '../src/logica/missione.ts';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { attenta } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import type { Missione } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C115M01; });
const stato = JSON.parse(readFileSync('data/stato.json', 'utf8')), dich = new Map(stato.variabili.map((d: { id: string }) => [d.id, d]));
const carica = (id: string) => JSON.parse(readFileSync(`data/missioni/${id}.json`, 'utf8')) as Missione;

/** Gioca fino all'ondata n col bot attento; nell'ondata n il mediatore va su `dove`, le altre unità dove le mette il bot
 *  ma mai su `dove`; risposte del bot. Restituisce il rapporto dell'ondata n disegnato. */
function gioca(m: Missione, n: number, dove: string) {
  const b = attenta(creaCaso(1), dich as never);
  let s: InCorso = iniziaMissione(m, variabiliIniziali(dich.values() as never), dich as never);
  for (let o = 1; o <= n; o++) {
    let d = b.schiera(m, s);
    if (o === n) {
      d = Object.fromEntries(Object.entries(d).map(([r, ps]) => [r, Object.fromEntries(Object.entries(ps).filter(([x]) => x !== dove))]));
      d.mediatore = { [dove]: Math.min(1, disponibili(m, s).mediatore ?? 0) };
    }
    s = schiera(m, s, d);
    // C40-04 (D-180): qui si prova il mediatore da solo; una risposta che impegna unità sullo stesso settore rende giusto
    // «le unità qui non bastano» (test in rapporto-c40.test.ts), quindi nell'ondata n il bot non la sceglie
    const impegna = (c: { settore?: string }, id: string) => c.settore === dove && (m.ondate[o - 1]?.chiamate?.find((x) => x === c)?.opzioni.find((x) => x.id === id)?.effetti ?? []).some((e) => 'riserva' in e && e.valore < 0);
    for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) {
      let x = b.scegli(m, s, c);
      if (o === n && impegna(c, x)) x = c.opzioni.find((y) => !impegna(c, y.id))?.id ?? x;
      s = rispondi(m, s, c.id, x, dich as never);
    }
    s = chiudiOndata(m, s, dich as never);
  }
  const r = s.rapporti[n - 1]!;
  return { r, testo: () => renderToStaticMarkup(createElement(Rapporto, { m, r, scelte: s.scelte, ultima: false, prossime: {}, avanti: () => {} })) };
}

describe('C38-01 mediatore che presidia un settore scoperto (D-173)', () => {
  for (const [id, n, dove] of [['e14', 1, 'biglietteria'], ['e17', 3, 'piazza_municipio']] as const) {
    it(`${id} ondata ${n}: ${dove}`, () => {
      const { r, testo } = gioca(carica(id), n, dove);
      expect(r.scoperto[dove]).toBeGreaterThan(0);
      expect(r.causa?.[dove]?.presenti).toEqual(['mediatore']);
      expect(testo()).toContain('presidiato, ma il mediatore qui non basta');
      g.__NO_C115M01 = true;
      expect(testo()).not.toContain('presidiato, ma il mediatore'); expect(testo()).toContain('nessuna unità a coprirlo');
    });
  }
});
