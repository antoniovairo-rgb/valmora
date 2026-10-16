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
  // I dati di e07 ora hanno «fase» (dai testi): il caso «senza» si prova togliendola.
  const senzaFase = () => { const m = ep('e07'); m.ondate.forEach((o) => { delete (o as { fase?: string }).fase; }); return m; };
  it('senza «fase» nulla cambia (e07 ondata 4 «in arrivo», come prima)', () => expect(follaDellOndata(senzaFase(), 4).spalti).toBe('arrivo'));
  it('dati veri: e07 ondata 4 e e21 ondata 4 «deflusso», e27 ondata 1 non «pieni» (fasi scritte dai testi)', () => {
    expect(follaDellOndata(ep('e07'), 4).spalti).toBe('deflusso');
    expect(follaDellOndata(ep('e21'), 4).spalti).toBe('deflusso');
    // C31-01 (C30-02): e21 ondata 3 «Kiln–Pinegrove in corso»: spalti pieni, non in deflusso
    expect(follaDellOndata(ep('e21'), 3).spalti).toBe('pieni');
    expect(follaDellOndata(ep('e27'), 1).spalti).not.toBe('pieni');
  });
  it('braccio rosso __NO_C84F01: «fase» ignorata, ondata 4 «in arrivo» (il difetto del collaudo)', () => {
    g.__NO_C84F01 = true;
    expect(follaDellOndata(conFase(), 4).spalti).toBe('arrivo');
    expect(follaDellOndata(conFase(), 2).spalti).toBe('arrivo');
  });
});

describe('C32-02 e17: la strada di Kiln va verso il centro del corteo', () => {
  // Senza `meta` il viale finiva al centro e cambiava con l'altezza della tela: «me_lo_dovete» 23 verso/16 via lo
  // stadio. Con la meta sul municipio («corteo in centro», intro2): 29-30 via su 39-40, ondata 4 52-53/69 (360-412).
  it('strada_cinderwick ha meta piazza_municipio', () => {
    expect(ep('e17').mappa.settori.find((s) => s.id === 'strada_cinderwick')?.meta).toBe('piazza_municipio');
  });
});

describe('D-141 (C33-02) verso «dalla_meta» nei dati', () => {
  it('e30 ondata 4: la fiaccolata porta il verso dei dati «dalla_meta»; e17 ondata 4 resta «dallo_stadio»', () => {
    expect(follaDellOndata(ep('e30'), 4).cortei.find((c) => c.settore === 'strada_cinderwick')?.dato).toBe('dalla_meta');
    expect(follaDellOndata(ep('e17'), 4).cortei.find((c) => c.settore === 'strada_cinderwick')?.dato).toBe('dallo_stadio');
  });
});
