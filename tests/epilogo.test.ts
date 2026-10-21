// D-161 (epilogo) e D-164 (fine stagione): riepiloghi calcolati da salvataggi veri (tests/salvataggi-reali), caricati
// come li carica il gioco (migra → adattaAiDati). Testi: uno per ogni valore possibile di ogni filo, ≤ 80 caratteri.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { CARRIERE, EPILOGO, FILI, chiaveFilo, chiudeStagione, epilogo, fineStagione, ultimoEpisodio } from '../src/logica/epilogo.ts';
import type { Dichiarazione } from '../src/logica/tipi.ts';
import { adattaAiDati } from '../src/resa/archivio.ts';
import { dichiarate, missioni } from '../src/resa/dati.ts';
import { migra } from '../src/salvataggi/salvataggio.ts';
import { TAVOLE } from '../src/resa/tavole-finale.tsx';

const reale = (n: string) => adattaAiDati(migra(JSON.parse(readFileSync(`tests/salvataggi-reali/${n}`, 'utf8')))).salvataggio;
const d = leggiDati() as Record<string, unknown>;
const testi = d['testi/it/epilogo.json'] as Record<string, string>;
export const EPILOGO_MAX = 80, FINALE_MAX = 90;

/** Valori possibili di una variabile dichiarata (enum, bool, int fra min e max). */
const valori = (x: Dichiarazione) => x.tipo === 'enum' ? x.valori! : x.tipo === 'bool' ? [true, false] : Array.from({ length: x.max! - x.min! + 1 }, (_, i) => x.min! + i);
/** Testi che mancano o sono troppo lunghi (guardiano dei dati dell'epilogo). */
export function testiEpilogo(t: Record<string, string>, dich: Map<string, Dichiarazione>): string[] {
  const p: string[] = [];
  const serve = (k: string) => { if (!t[k]) p.push(`manca «${k}»`); };
  for (const id of FILI) { serve(`epilogo.${id}.nome`); for (const v of valori(dich.get(id)!)) serve(chiaveFilo({ id, valore: v })); }
  for (const c of [...CARRIERE, 'ignota']) serve(`epilogo.carriera.${c}`);
  for (const [k, x] of Object.entries(t)) if (x.length > EPILOGO_MAX) p.push(`«${k}» ${x.length} caratteri`);
  return p;
}

/** D-165: una didascalia per ogni valore di ogni tavola e per ogni carriera, ≤ 90 caratteri. */
export function testiFinale(t: Record<string, string>, dich: Map<string, Dichiarazione>): string[] {
  const p: string[] = [];
  const serve = (k: string) => { if (!t[k]) p.push(`manca «${k}»`); };
  for (const [tavola, id] of TAVOLE) { serve(`finale.${tavola}`); for (const v of valori(dich.get(id)!)) serve(`finale.${tavola}.${String(v)}`); }
  for (const c of [...CARRIERE, 'ignota']) serve(`finale.bar.${c}`);
  for (const [k, x] of Object.entries(t)) if (x.length > FINALE_MAX) p.push(`«${k}» ${x.length} caratteri`);
  return p;
}

describe('epilogo e fine stagione (D-161, D-164)', () => {
  it('fine stagione solo all\'ultimo episodio delle stagioni 1 e 2 (e12, e24); e36 ha l\'epilogo', () => {
    expect(missioni.filter((m) => chiudeStagione(missioni, m)).map((m) => m.id)).toEqual(['e12', 'e24']);
    expect(ultimoEpisodio(missioni)?.id).toBe('e36');
  });

  it('partita A-Z vera (0.38.0, fine campagna): le sette scelte (D-189), la carriera e le stelle', () => {
    const s = reale('v2-0.38.0-fine-campagna.json');
    const e = epilogo(missioni, s.episodi, s.variabili, dichiarate.values());
    expect(e.esito).toBe('prorogato_procura');
    expect(e.carriera).toBe('prorogato');
    expect(e.scelte.map((f) => [f.id, f.valore])).toEqual([['rapporto_dessi', 'rispetto'], ['testimone', 'protetto'], ['busta', 'consegnata'], ['pista_cattura', 'nessuna'], ['fascicolo', 'procura'], ['sospetti_talpa', 3], ['carte', 'nessuna']]); // D-189: «carte» completata al valore iniziale
    // stelle lette dal registro: S1 2+2+2+2+3+2+2+2+3+3+3+2, S2 3+2+1+3+3+3+1+3+1+3+3+1, S3 1+3+3+2+2+2+2+2+2+3+3+3
    expect(e.stagioni.map((x) => [x.stelle, x.massimo, x.superati])).toEqual([[28, 36, 12], [27, 36, 12], [28, 36, 12]]);
    expect([e.stelle, e.massimo]).toEqual([83, 108]);
  });

  it('fine stagione 1 e 2 sulla stessa partita: fili aperti dove un episodio dopo li legge', () => {
    const s = reale('v2-0.38.0-fine-campagna.json');
    const f1 = fineStagione(missioni, s.episodi, s.variabili, dichiarate.values(), 1);
    expect(f1.aperti.map((f) => `${f.id}>${f.pesa_su}`)).toEqual(['informatore_pagato>e13', 'presidente_incontrato>e14', 'furgone_visto>e13', 'rapporto_dessi>e20', 'sospetti_talpa>e33']);
    expect(f1.chiusi).toEqual([]);
    const f2 = fineStagione(missioni, s.episodi, s.variabili, dichiarate.values(), 2);
    expect(f2.aperti.map((f) => f.id)).toEqual(['informatore_pagato', 'furgone_visto', 'rapporto_dessi', 'testimone', 'busta', 'sospetti_talpa']);
    expect(f2.chiusi.map((f) => f.id)).toEqual(['presidente_incontrato']);
    expect([f2.stelle, f2.massimo]).toEqual([27, 36]);
  });

  it('salvataggi vecchi (v1 della 0.1.0, v2 della 0.4.0): niente eccezioni, carriera ignota, variabili completate', () => {
    for (const n of ['v1-nuova-partita.json', 'v1-dopo-ondata-1.json', 'v2-0.4.0-e02-in-corso.json']) {
      const s = reale(n);
      const e = epilogo(missioni, s.episodi, s.variabili, dichiarate.values());
      expect(e.carriera, n).toBeNull();
      expect(e.scelte.map((f) => f.id), n).toEqual([...EPILOGO]);
      const f = fineStagione(missioni, s.episodi, s.variabili, dichiarate.values(), 1);
      expect(f.aperti.length + f.chiusi.length, n).toBe(5);
    }
    // senza il completamento delle variabili (dati vecchi crudi) i fili mancanti si saltano, non si inventano
    const crudo = fineStagione(missioni, {}, { informatore_pagato: true }, [], 1);
    expect(crudo.aperti.map((f) => f.id)).toEqual(['informatore_pagato']);
  });

  it('C40-05: la busta consegnata non si dice «chiusa» (in e24/e36 si può aprire prima, «Aprila adesso»); braccio rosso', () => {
    const chiusa = (t: Record<string, string>) => Object.entries(t).filter(([k, v]) => /busta\.consegnata$/.test(k) && /chius/i.test(v)).map(([k]) => k);
    const f = d['testi/it/finale.json'] as Record<string, string>;
    expect([...chiusa(testi), ...chiusa(f)]).toEqual([]);
    expect(chiusa({ 'epilogo.busta.consegnata': 'Consegnata chiusa al comando.' })).toEqual(['epilogo.busta.consegnata']);
  });

  it('testi del finale (D-165): una didascalia per ogni valore delle tavole, ≤ 90 caratteri; braccio rosso', () => {
    const f = d['testi/it/finale.json'] as Record<string, string>;
    expect(testiFinale(f, dichiarate)).toEqual([]);
    const rotti = { ...f, 'finale.busta.tenuta': 'x'.repeat(FINALE_MAX + 1) };
    delete (rotti as Record<string, string>)['finale.talpa.4'];
    expect(testiFinale(rotti, dichiarate)).toEqual(['manca «finale.talpa.4»', '«finale.busta.tenuta» 91 caratteri']);
  });

  it('testi dell\'epilogo: uno per ogni valore di ogni filo, ≤ 80 caratteri; braccio rosso', () => {
    expect(testiEpilogo(testi, dichiarate)).toEqual([]);
    const rotti = { ...testi, 'epilogo.busta.tenuta': 'x'.repeat(EPILOGO_MAX + 1) };
    delete (rotti as Record<string, string>)['epilogo.testimone.esposto'];
    expect(testiEpilogo(rotti, dichiarate)).toEqual(['manca «epilogo.testimone.esposto»', '«epilogo.busta.tenuta» 81 caratteri']);
  });
});
