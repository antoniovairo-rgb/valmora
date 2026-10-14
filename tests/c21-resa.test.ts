// C-021 resa: C21-05/06 (cerimonia, minaccia, lite e faida non sono tifo né rissa), C21-09 (un evento con «se» conta
// solo se la condizione è vera), C21-04 (con tre curve lo stadio è fra le due della partita, e15).
import { readFileSync, readdirSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { gruppoEvento } from '../src/resa/vignette-evento.tsx';
import { disponi } from '../src/resa/mappa/sfondo.ts';
import { valuta, variabiliIniziali } from '../src/logica/condizioni.ts';
import type { Missione } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { for (const x of ['C50G01', 'C50S01', 'C50C01']) delete g[`__NO_${x}`]; });
const missioni = readdirSync('data/missioni').map((f) => JSON.parse(readFileSync(`data/missioni/${f}`, 'utf8')) as Missione);
const stato = JSON.parse(readFileSync('data/stato.json', 'utf8')) as { variabili: Parameters<typeof variabiliIniziali>[0] extends Iterable<infer D> ? D[] : never };
const v0 = variabiliIniziali(stato.variabili);
const club = Object.fromEntries(readdirSync('data/club').map((f) => JSON.parse(readFileSync(`data/club/${f}`, 'utf8'))).map((c) => [c.id, c.colori]));
const chiamate = missioni.flatMap((m) => m.ondate.flatMap((o) => (o.chiamate ?? []).map((c) => ({ m, o, c }))));

/** Chiamate il cui settore ha SOLO eventi cerimonia/minaccia/lite/faida (veri con v0), e che diventano tifo o rissa. */
const sbagliate = () => chiamate.filter(({ m, o, c }) => {
  const ev = o.eventi.filter((e) => e.settore === c.settore && (!e.se || valuta(e.se, v0)));
  return ev.length && ev.every((e) => ['cerimonia', 'minaccia', 'lite', 'faida'].includes(e.tipo));
}).map(({ m, c }) => [m.id, c.id, gruppoEvento(m, c, v0)] as const);
/** Chiamate il cui gruppo cambierebbe ignorando «se»: il gruppo deve venire solo dagli eventi veri. */
const condizionate = () => chiamate.filter(({ o, c }) => o.eventi.some((e) => e.settore === c.settore && e.se && !valuta(e.se, v0))).map(({ m, o, c }) => {
  const veri = new Set(o.eventi.filter((e) => e.settore === c.settore && (!e.se || valuta(e.se, v0))).map((e) => e.tipo));
  return { id: `${m.id}:${c.id}`, gruppo: gruppoEvento(m, c, v0), veri: veri.size };
});

describe('C-021 resa', () => {
  it('C21-05/06: cerimonia, minaccia, lite e faida sono «gente»', () => {
    const x = sbagliate();
    expect(x.length).toBeGreaterThan(0);
    expect(x.filter(([, , gr]) => gr !== 'gente')).toEqual([]);
  });
  it('braccio rosso __NO_C50G01: tornano tifo e rissa', () => { g.__NO_C50G01 = true; expect(sbagliate().some(([, , gr]) => gr === 'tifo' || gr === 'scontro')).toBe(true); });
  it('C21-09: senza eventi veri sul settore, nessun gruppo', () => {
    const x = condizionate();
    expect(x.length).toBeGreaterThan(0);
    expect(x.filter((y) => y.veri === 0 && y.gruppo !== null).map((y) => y.id)).toEqual([]);
  });
  it('braccio rosso __NO_C50S01: l\'evento condizionato conta anche se falso', () => { g.__NO_C50S01 = true; expect(condizionate().some((y) => y.veri === 0 && y.gruppo !== null)).toBe(true); });
  const e15 = () => { const m = missioni.find((x) => x.id === 'e15')!; return disponi(400, 400, m.mappa.settori.map((s) => ({ id: s.id, tipo: s.tipo, x: (s.pos?.x ?? 0) * 4, y: (s.pos?.y ?? 0) * 4, colori: s.club ? club[s.club] : undefined }))); };
  it('C21-04: in e15 gli spalti sono Cinderwick e Rovers', () => {
    const d = e15();
    expect([d.club.sx?.primario, d.club.dx?.primario].sort()).toEqual([club.calderholt_rovers.primario, club.cinderwick_united.primario].sort());
  });
  it('braccio rosso __NO_C50C01: l\'arancio del Cinderwick manca', () => { g.__NO_C50C01 = true; const d = e15(); expect([d.club.sx?.primario, d.club.dx?.primario]).not.toContain(club.cinderwick_united.primario); });
});
