// C41-05 (collaudo C-041, D-182): nella tavola «La busta» del finale la busta consegnata ha la patta aperta e niente
// sigillo, perché in e24 si può aprire prima di consegnarla («Aprila adesso») e la tavola vale per tutti e due i casi.
// La busta tenuta resta sigillata. Rosso __NO_C41B05: sigillata anche consegnata, come prima.
import { afterEach, describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TavolaFilo } from '../src/resa/tavole-finale.tsx';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C41B05; });
const busta = (valore: string) => renderToStaticMarkup(createElement(TavolaFilo, { tavola: 'busta', valore }));

describe('C41-05: la busta consegnata non è sigillata', () => {
  it('consegnata: patta aperta, nessun sigillo; tenuta: sigillo', () => {
    expect(busta('consegnata')).toContain('data-patta="aperta"');
    expect(busta('consegnata')).not.toContain('data-sigillo');
    expect(busta('tenuta')).toContain('data-sigillo');
  });
  it('rosso C41B05: consegnata col sigillo, come prima', () => {
    g.__NO_C41B05 = true;
    expect(busta('consegnata')).toContain('data-sigillo');
    expect(busta('consegnata')).not.toContain('data-patta');
  });
});
