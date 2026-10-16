// C27-02 (`meta` della strada: il viale finisce sul settore indicato, src/resa/mappa/sfondo.ts) e C27-04 (`fase`
// dell'ondata: spalti e cortei secondo i dati, src/resa/mappa/folla.ts). I campi nei dati li scrive la principale; qui
// si provano su copie di episodi veri con i campi aggiunti. Rossi __NO_C85M01 e __NO_C84F01: campi ignorati.
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { disponi } from '../src/resa/mappa/sfondo.ts';
import { follaDellOndata } from '../src/resa/mappa/folla.ts';
import type { Missione } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C85M01; delete g.__NO_C84F01; });
const ep = (id: string) => JSON.parse(readFileSync(`data/missioni/${id}.json`, 'utf8')) as Missione;

describe('C27-02 il viale finisce sul settore «meta»', () => {
  // e30: niente partita, il viale andava al centro della mappa; la meta è il municipio (un settore dell'episodio)
  const m = ep('e30'), pos = (s: Missione['mappa']['settori'][number], i: number) => s.pos ?? { x: ((i + 1) * 100) / (m.mappa.settori.length + 1), y: 50 };
  const strada = m.mappa.settori.find((s) => s.tipo === 'strada')!, altro = m.mappa.settori.find((s) => s.tipo !== 'strada' && s.tipo !== 'curva')!;
  const settori = (conMeta: boolean) => m.mappa.settori.map((s, i) => ({ id: s.id, tipo: s.tipo, ...pos(s, i), ...(conMeta && s === strada ? { meta: altro.id } : {}) }));
  const fine = () => { const d = disponi(400, 400, settori(true)); return d.viali[d.idViali.indexOf(strada.id)]!.at(-1)!; };
  it('con «meta» l\'ultimo punto del viale è il settore indicato; senza, come prima', () => {
    const a = settori(true).find((s) => s.id === altro.id)!;
    expect(fine()).toEqual({ x: a.x, y: a.y });
    const d0 = disponi(400, 400, settori(false));
    expect(d0.viali[d0.idViali.indexOf(strada.id)]!.at(-1)).toEqual(d0.centro);
  });
  it('braccio rosso __NO_C85M01: «meta» ignorata, il viale va al centro (il difetto del collaudo)', () => {
    g.__NO_C85M01 = true;
    const d = disponi(400, 400, settori(true));
    expect(d.viali[d.idViali.indexOf(strada.id)]!.at(-1)).toEqual(d.centro);
  });
});

describe('C27-04 la fase dell\'ondata dai dati', () => {
  // e07 non ha eventi «curva»: senza «fase» la partita non c'era mai e gli spalti restavano «in arrivo»
  const conFase = () => { const m = ep('e07'); (['prima', 'partita', 'partita', 'dopo'] as const).forEach((f, k) => { if (m.ondate[k]) Object.assign(m.ondate[k]!, { fase: f }); }); return m; };
  it('e07 con le fasi: ondate 2-3 spalti pieni, ondata 4 deflusso', () => {
    const m = conFase();
    expect(follaDellOndata(m, 2).spalti).toBe('pieni');
    expect(follaDellOndata(m, 3).spalti).toBe('pieni');
    expect(follaDellOndata(m, 4).spalti).toBe('deflusso');
    expect(follaDellOndata(m, 1).spalti).toBe('arrivo');
  });
  it('senza «fase» nulla cambia (e07 ondata 4 «in arrivo», come oggi)', () => expect(follaDellOndata(ep('e07'), 4).spalti).toBe('arrivo'));
  it('braccio rosso __NO_C84F01: «fase» ignorata, ondata 4 «in arrivo» (il difetto del collaudo)', () => {
    g.__NO_C84F01 = true;
    expect(follaDellOndata(conFase(), 4).spalti).toBe('arrivo');
    expect(follaDellOndata(conFase(), 2).spalti).toBe('arrivo');
  });
});
