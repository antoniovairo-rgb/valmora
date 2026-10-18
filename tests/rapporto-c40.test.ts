// Collaudo C-040 (D-180). C40-03: con la copertura «le tue risposte non bastano» le cause non ripetono «le tue risposte»
// (e25 o2→o3: «Folla, le tue risposte: le tue risposte non bastano»). Rosso __NO_C119R01: come prima.
// C40-04: mediatore schierato e unità impegnate da una risposta sullo stesso settore (e36 o3, «Steward al cantiere»):
// «presidiato, ma le unità qui non bastano», non «ma il mediatore qui non basta». Rosso __NO_C120U01: come prima.
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Rapporto } from '../src/resa/schermate/Rapporto.tsx';
import type { RapportoOndata } from '../src/logica/missione.ts';
import type { Missione } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C119R01; delete g.__NO_C120U01; });
const carica = (id: string) => JSON.parse(readFileSync(`data/missioni/${id}.json`, 'utf8')) as Missione;
const testo = (m: Missione, r: RapportoOndata, scelte: { ondata: number; chiamata: string; opzione: string }[]) =>
  renderToStaticMarkup(createElement(Rapporto, { m, r, scelte, ultima: false, prossime: {}, avanti: () => {} }));

describe('C40-03 «le tue risposte» una volta sola (e25 o3)', () => {
  const m = carica('e25'), s = [{ ondata: 2, chiamata: 'permesso_mediatore', opzione: 'steward_ospiti' }];
  const r = { n: 3, scoperto: { piazzale: 1 }, tensione: { piazzale: 4 }, aRiposo: {}, causa: { piazzale: { pressione: 3, copertura: 0, eventi: ['folla'], risposte: 1 } } } as RapportoOndata;
  it('verde: «Folla: le tue risposte non bastano»', () => {
    const x = testo(m, r, s); if (process.env.MOSTRA) console.log('C40-03 verde:', x.match(/Folla[^<]*/)?.[0]);
    expect(x).toContain('Folla: le tue risposte non bastano'); expect(x).not.toContain('le tue risposte: le tue risposte');
  });
  it('rosso C119R01: la frase doppia', () => {
    g.__NO_C119R01 = true; const x = testo(m, r, s); if (process.env.MOSTRA) console.log('C40-03 rosso:', x.match(/Folla[^<]*/)?.[0]);
    expect(x).toContain('Folla, le tue risposte: le tue risposte non bastano');
  });
});

describe('C40-04 mediatore e steward mandati da una risposta (e36 o3)', () => {
  const m = carica('e36'), s = [{ ondata: 3, chiamata: 'cantiere_notte', opzione: 'steward_cantiere' }];
  const r = { n: 3, scoperto: { cantiere_stadio_nuovo: 1 }, tensione: { cantiere_stadio_nuovo: 4 }, aRiposo: {}, causa: { cantiere_stadio_nuovo: { pressione: 3, copertura: 0, eventi: ['folla'], risposte: 0, presenti: ['mediatore'] } } } as RapportoOndata;
  it('verde: «presidiato, ma le unità qui non bastano»', () => {
    const x = testo(m, r, s); if (process.env.MOSTRA) console.log('C40-04 verde:', x.match(/Folla[^<]*/)?.[0]);
    expect(x).toContain('presidiato, ma le unità qui non bastano');
  });
  it('rosso C120U01: «presidiato, ma il mediatore qui non basta»', () => {
    g.__NO_C120U01 = true; const x = testo(m, r, s); if (process.env.MOSTRA) console.log('C40-04 rosso:', x.match(/Folla[^<]*/)?.[0]);
    expect(x).toContain('presidiato, ma il mediatore qui non basta');
  });
});
