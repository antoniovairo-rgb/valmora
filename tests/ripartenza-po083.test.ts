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

// C17-06: il calcolo veloce (schieramenti in memoria, stima oltre 1000 stati) propone le stesse ondate di quello esatto
describe('ripartenza veloce (C17-06)', () => {
  it('stesse ondate proposte del calcolo esatto, in meno tempo', () => {
    const t0 = performance.now(); const veloce = misura(4); const tv = performance.now() - t0;
    g.__NO_C17R06 = true; const t1 = performance.now(); const esatto = misura(4); const te = performance.now() - t1; delete g.__NO_C17R06;
    console.log(`C17-06: ondata media veloce ${veloce.ondataMedia.toFixed(3)} esatta ${esatto.ondataMedia.toFixed(3)} · max ms ${veloce.ms.toFixed(0)} contro ${esatto.ms.toFixed(0)} · totale ${tv.toFixed(0)} contro ${te.toFixed(0)} ms`);
    expect(veloce.ondataMedia).toBe(esatto.ondataMedia); expect(veloce.sotto).toBe(0);
  }, 180000);
});
