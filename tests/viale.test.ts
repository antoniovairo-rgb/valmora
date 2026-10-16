// C29-02 (C28-05): il viale parte dal bordo della mappa più vicino alla strada, dalla parte opposta alla fine (sfondo.ts,
// bordoLontano). e04, parcheggi in alto: col bordo basso il corteo «entra» si allontanava dallo stadio (62/69 nel collaudo).
// Rosso __NO_C93V01: sempre dal bordo basso.
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { bezier, disponi } from '../src/resa/mappa/sfondo.ts';
import type { Missione } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C93V01; delete g.__NO_C95S01; });
const ep = (id: string) => JSON.parse(readFileSync(`data/missioni/${id}.json`, 'utf8')) as Missione;
const L = 322, M = 22, SOTTO = 20; // tela a 360 px; margine = mezzo punto del settore, sotto lo spazio dei nomi (come StratoPixi)
function disp(id: string) {
  const m = ep(id);
  return disponi(L, L, m.mappa.settori.map((s) => ({ id: s.id, tipo: s.tipo, x: M + ((L - 2 * M) * s.pos!.x) / 100, y: M + ((L - 2 * M - SOTTO) * s.pos!.y) / 100, meta: (s as { meta?: string }).meta })));
}
/** Quota dei passi del corteo «entra» (parametro 0 → 0,75, come StratoPixi) che si avvicinano allo stadio disegnato. */
function avvicina(id: string, strada: string) {
  const m = ep(id);
  const d = disponi(L, L, m.mappa.settori.map((s) => ({ id: s.id, tipo: s.tipo, x: M + ((L - 2 * M) * s.pos!.x) / 100, y: M + ((L - 2 * M - SOTTO) * s.pos!.y) / 100, meta: (s as { meta?: string }).meta })));
  const v = d.viali[d.idViali.indexOf(strada)]!, c = { x: d.stadio!.cx, y: d.stadio!.cy };
  const dist = (t: number) => { const p = bezier(v, t); return Math.hypot(p.x - c.x, p.y - c.y); };
  let si = 0; const n = 60;
  for (let k = 0; k < n; k++) if (dist(((k + 1) / n) * 0.75) < dist((k / n) * 0.75)) si++;
  return si / n;
}

describe('C29-02 viale dal bordo giusto', () => {
  it('e04 parcheggi: il corteo «entra» si avvicina allo stadio in quasi tutti i passi', () => expect(avvicina('e04', 'parcheggi')).toBeGreaterThanOrEqual(0.9));
  it('e01 (strade in basso) invariato: entra avvicinandosi', () => expect(avvicina('e01', 'strada_cinderwick')).toBeGreaterThanOrEqual(0.9));
  it('braccio rosso __NO_C93V01: e04 dal bordo basso, il corteo si allontana (il difetto del collaudo)', () => {
    g.__NO_C93V01 = true;
    expect(avvicina('e04', 'parcheggi')).toBeLessThan(0.5);
  });
});

// C31-02: e30, strada con meta (municipio) e stadio disegnato: il viale parte dallo stadio e il corteo va verso la meta
// (via dallo stadio) in ogni ondata. Rosso __NO_C95S01: dal bordo basso, il corteo si avvicina allo stadio (57/69).
describe('C31-02 viale con la meta che parte dallo stadio', () => {
  const via = () => { const d = disp('e30'), k = d.idViali.indexOf('strada_cinderwick'), v = d.viali[k]!, c = { x: d.stadio!.cx, y: d.stadio!.cy };
    const dist = (t: number) => { const p = bezier(v, t); return Math.hypot(p.x - c.x, p.y - c.y); };
    let si = 0; for (let j = 0; j < 60; j++) if (dist(((j + 1) / 60) * 0.75) > dist((j / 60) * 0.75)) si++;
    return { quota: si / 60, versoMeta: d.versoMeta[k] }; };
  it('e30 strada_cinderwick: il corteo in avanti si allontana dallo stadio, verso la meta', () => {
    const r = via(); expect(r.versoMeta).toBe(true); expect(r.quota).toBeGreaterThanOrEqual(0.9);
  });
  it('braccio rosso __NO_C95S01: dal bordo basso, verso fisso spento', () => {
    g.__NO_C95S01 = true; const r = via(); expect(r.versoMeta).toBe(false); expect(r.quota).toBeLessThan(0.5);
  });
});
