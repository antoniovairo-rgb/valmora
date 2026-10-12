// PO-083: «ripartire dalla 3 alla 2 se ti dà pochissime o nulla possibilità non ha senso». Dall'ondata proposta la
// possibilità di vincere (schieramento attento, risposte a caso) è almeno una su tre; altrimenti solo «Ricomincia».
import { afterEach, describe, expect, it } from 'vitest';
import { misura } from '../tools/sonda-ripartenza.mjs';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_PO083; });

describe('ripartenza vincibile (PO-083)', () => {
  it('su 36 episodi nessuna ondata proposta sotto una possibilità su tre', () => {
    const x = misura(8);
    console.log(`PO-083 verde: perse ${x.tot} · sotto 1/3 ${x.sotto} · impossibili ${x.zero} · mediana ${x.mediana.toFixed(2)} · ondata media ${x.ondataMedia.toFixed(2)} · ms p95 ${x.p95}`);
    expect(x.tot).toBeGreaterThan(100); expect(x.sotto).toBe(0);
  }, 120000);
  it('braccio rosso __NO_PO083: con la sola regola C16-01 alcune ondate proposte sono quasi o del tutto perse', () => {
    g.__NO_PO083 = true;
    const x = misura(8);
    console.log(`PO-083 rosso: sotto 1/3 ${x.sotto} · impossibili ${x.zero}`);
    expect(x.sotto).toBeGreaterThan(0);
  }, 120000);
});
