// C37-08 (D-166): in e24 lo steward mandato ai tornelli da una risposta (secondo_tempo → steward_t24) non copre il settore;
// se il settore resta scoperto il rapporto dice «le tue risposte non bastano», non «nessuna unità a coprirlo».
// Rosso __NO_C112R01: «nessuna unità a coprirlo», come prima.
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { impegnateDaRisposte } from '../src/resa/causa.ts';
import { Rapporto } from '../src/resa/schermate/Rapporto.tsx';
import type { RapportoOndata } from '../src/logica/missione.ts';
import type { Missione } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C112R01; });
const m = JSON.parse(readFileSync('data/missioni/e24.json', 'utf8')) as Missione;
const scelte = [{ ondata: 3, chiamata: 'secondo_tempo', opzione: 'steward_t24' }];
const r = { n: 3, scoperto: { tornelli: 2 }, tensione: { tornelli: 5 }, aRiposo: {}, causa: { tornelli: { pressione: 2, copertura: 0, eventi: [], risposte: 0 } } } as RapportoOndata;
const testo = () => renderToStaticMarkup(createElement(Rapporto, { m, r, scelte, ultima: false, prossime: {}, avanti: () => {} }));

describe('C37-08 unità impegnate da una risposta', () => {
  it('conta lo steward mandato ai tornelli, non altrove né in altre ondate', () => {
    expect(impegnateDaRisposte(m, scelte, 3, 'tornelli')).toBe(1);
    expect(impegnateDaRisposte(m, scelte, 3, 'piazzale')).toBe(0);
    expect(impegnateDaRisposte(m, scelte, 2, 'tornelli')).toBe(0);
    expect(impegnateDaRisposte(m, [{ ondata: 3, chiamata: 'secondo_tempo', opzione: 'apri24' }], 3, 'tornelli')).toBe(0);
  });
  it('il rapporto dice «le tue risposte non bastano»; rosso: «nessuna unità a coprirlo»', () => {
    expect(testo()).toContain('le tue risposte non bastano'); expect(testo()).not.toContain('nessuna unità a coprirlo');
    g.__NO_C112R01 = true;
    expect(testo()).toContain('nessuna unità a coprirlo');
  });
});

// C38-01 (collaudo C-038, e17 o2): «Steward ai cancelli» senza steward posato ai tornelli; sulla build integrata il
// rapporto deve dire «le tue risposte non bastano» (il caso C37-08 del collaudo)
describe('C38-01 caso e17 o2', () => {
  const m17 = JSON.parse(readFileSync('data/missioni/e17.json', 'utf8')) as Missione;
  const s17 = [{ ondata: 2, chiamata: 'cancelli', opzione: 'steward_cancelli' }];
  const r17 = { n: 2, scoperto: { tornelli: 1 }, tensione: { tornelli: 4 }, aRiposo: {}, causa: { tornelli: { pressione: 1, copertura: 0, eventi: [], risposte: 0 } } } as RapportoOndata;
  it('«le tue risposte non bastano»', () => {
    expect(impegnateDaRisposte(m17, s17, 2, 'tornelli')).toBe(1);
    expect(renderToStaticMarkup(createElement(Rapporto, { m: m17, r: r17, scelte: s17, ultima: false, prossime: {}, avanti: () => {} }))).toContain('le tue risposte non bastano');
  });
});

// C39-02 (collaudo C-039, e25): «Steward fra gli ospiti» in ondata 2 impegna due steward per il resto della sera sul
// piazzale; nel rapporto dell'ondata 3, piazzale scoperto, il testo deve essere «le tue risposte non bastano», non
// «nessuna unità a coprirlo». Rosso __NO_C116R01: solo l'ondata del rapporto, come prima.
describe('C39-02 unità impegnate in un\'ondata precedente', () => {
  const m25 = JSON.parse(readFileSync('data/missioni/e25.json', 'utf8')) as Missione;
  const s25 = [{ ondata: 2, chiamata: 'permesso_mediatore', opzione: 'steward_ospiti' }, { ondata: 3, chiamata: 'rigore_ospiti', opzione: 'steward_sedie' }];
  const r25 = { n: 3, scoperto: { piazzale: 1 }, tensione: { piazzale: 4 }, aRiposo: {}, causa: { piazzale: { pressione: 1, copertura: 0, eventi: [], risposte: -2 } } } as RapportoOndata;
  const t25 = () => renderToStaticMarkup(createElement(Rapporto, { m: m25, r: r25, scelte: s25, ultima: false, prossime: {}, avanti: () => {} }));
  afterEach(() => { delete g.__NO_C116R01; });
  it('conta i due steward dell\'ondata 2 nel rapporto dell\'ondata 3; non quelli di ondate dopo', () => {
    expect(impegnateDaRisposte(m25, s25, 3, 'piazzale')).toBe(2);
    expect(impegnateDaRisposte(m25, s25, 1, 'piazzale')).toBe(0);
    expect(t25()).toContain('le tue risposte non bastano'); expect(t25()).not.toContain('nessuna unità a coprirlo');
  });
  it('rosso: «nessuna unità a coprirlo», come prima', () => {
    g.__NO_C116R01 = true;
    expect(impegnateDaRisposte(m25, s25, 3, 'piazzale')).toBe(0);
    expect(t25()).toContain('nessuna unità a coprirlo');
  });
});
