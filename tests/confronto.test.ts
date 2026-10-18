// C38-03 (D-172): nel verbale «cosa ti ha aiutato / penalizzato» confronta ogni risposta con le altre della stessa
// chiamata (src/logica/confronto.ts), non il saldo degli effetti della sola risposta. Rosso __NO_C38B01.
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { giocaMissione, opzioniValide } from '../src/logica/missione.ts';
import { STRATEGIE, attenta, casuale, peggiore } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import { bilancio } from '../src/logica/bilancio.ts';
import { confrontoScelte, daTabella, inRighe, type TabellaConfronti } from '../src/logica/confronto.ts';
import { tabellaConfronti } from '../tools/confronti.mjs';
import { readFileSync } from 'node:fs';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const d = leggiDati() as Record<string, unknown>;
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const ms = Object.entries(d).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m as Missione);
const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C38B01; delete g.__NO_C40B01; });

/** Partita con schieramento attento che sceglie `voluta` quando è offerta (le altre risposte a caso). */
const partita = (m: Missione, voluta: string, seme = 1) => {
  const caso = creaCaso(`c38:${m.id}:${seme}`);
  return giocaMissione(m, v0, dich, { schiera: attenta(caso, dich).schiera, scegli: (mm, s, c) => {
    const o = opzioniValide(c, s, mm); return (o.find((x) => x.id === voluta) ?? caso.scegli(o)).id; } });
};
/** Risposte messe fra i pesi che il confronto dice migliori delle altre di almeno 5 punti di fallite (e viceversa). */
function contraddizioni(semi = 20) {
  const fuori: string[] = [];
  for (const m of ms) {
    const c = confrontoScelte(m, dich);
    for (let s = 1; s <= semi; s++) {
      const b = bilancio(m, giocaMissione(m, v0, dich, casuale(creaCaso(`c38b:${m.id}:${s}`), dich)), 3, c);
      for (const v of b.pesi) { const x = c.get(`${v.chiamata}/${v.opzione}`); if (x && x.falliteAltre - x.falliteSe >= 5) fuori.push(`${m.id} peso ${v.chiamata}/${v.opzione}`); }
      for (const v of b.aiuti) { const x = c.get(`${v.chiamata}/${v.opzione}`); if (x && x.falliteSe - x.falliteAltre >= 5) fuori.push(`${m.id} aiuto ${v.chiamata}/${v.opzione}`); }
    }
  }
  return [...new Set(fuori)];
}

describe('bilancio contro le altre risposte (C38-03)', () => {
  const e14 = ms.find((m) => m.id === 'e14')!;
  it('e14 «restino in piedi» (fallite 0 % contro ~10 %) è fra gli aiuti, non fra i pesi; rosso: fra i pesi', () => {
    const r = partita(e14, 'in_piedi');
    expect(r.scelte.some((x) => x.opzione === 'in_piedi')).toBe(true);
    const b = bilancio(e14, r, 10, confrontoScelte(e14, dich));
    expect(b.aiuti.map((x) => x.opzione)).toContain('in_piedi');
    expect(b.pesi.map((x) => x.opzione)).not.toContain('in_piedi');
    g.__NO_C38B01 = true;
    expect(bilancio(e14, r, 10, confrontoScelte(e14, dich)).pesi.map((x) => x.opzione)).toContain('in_piedi');
  });
  it('36 episodi: nessun peso che il confronto dice migliore (né aiuto peggiore) di ≥ 5 punti; rosso: ce ne sono', () => {
    expect(contraddizioni()).toEqual([]);
    g.__NO_C38B01 = true;
    expect(contraddizioni().length).toBeGreaterThan(0);
  }, 180_000);
  it('D-085: una partita con scelte non ha mai il bilancio vuoto (36 episodi, bot deterministici)', () => {
    const vuoti = ms.flatMap((m) => ['attenta', 'equilibrata', 'peggiore'].map((n) => [n, giocaMissione(m, v0, dich, STRATEGIE[n]!(creaCaso(1), dich))] as const)
      .filter(([, r]) => r.scelte.length).filter(([, r]) => { const b = bilancio(m, r, 3, confrontoScelte(m, dich)); return !b.aiuti.length && !b.pesi.length; })
      .map(([n]) => `${m.id} ${n}`));
    expect(vuoti).toEqual([]);
  }, 180_000);
  it('D-174: la tabella precalcolata è uguale al calcolo sui dati di oggi; rosso: dati cambiati', () => {
    const file = JSON.parse(readFileSync('src/logica/confronti.json', 'utf8')) as TabellaConfronti;
    expect(file).toEqual(tabellaConfronti(d));
    expect(daTabella(file, 'e14')!.get('seduti/in_piedi')).toEqual(confrontoScelte(ms.find((m) => m.id === 'e14')!, dich).get('seduti/in_piedi'));
    const x = structuredClone(ms.find((m) => m.id === 'e14')!);
    x.ondate.flatMap((o) => o.chiamate ?? []).find((c) => c.id === 'seduti')!.opzioni.find((o) => o.id === 'in_piedi')!.effetti.push({ tensione: 'curva_larkspire', valore: 5 } as never);
    expect(inRighe(confrontoScelte(x, dich, undefined, false))).not.toEqual(file.episodi.e14);
  }, 180_000);
  // C40-01 (D-180): casi del collaudo C-040, con lo schieramento del bot peggiore e le risposte del giocatore.
  const CASI: Record<string, string[]> = { e35: ['segui_barca', 'stampa_vicina', 'lascia_coda'], e13: ['palco_si', 'lascia_cori', 'senso_unico', 'resistano'], e12: ['scorta12', 'mediatore12', 'rinforzi12'] };
  /** Voci che contraddicono la partita: aiuti che hanno caricato un settore poi scoperto, pesi che l'hanno scaricato. */
  const smentite = (m: Missione, r: ReturnType<typeof giocaMissione>) => {
    const b = bilancio(m, r, 3, confrontoScelte(m, dich)); const fuori: string[] = [];
    for (const [lista, segno] of [[b.aiuti, 1], [b.pesi, -1]] as const) for (const v of lista) {
      const colpiti = new Set(r.rapporti.filter((o) => o.n >= v.ondata).flatMap((o) => Object.entries(o.scoperto).filter(([, n]) => n > 0).map(([k]) => k)));
      if (v.impatti.some((i) => (i.tipo === 'pressione' || i.tipo === 'tensione') && i.dove && colpiti.has(i.dove) && Math.sign(i.valore) === segno)) fuori.push(`${m.id} ${segno > 0 ? 'aiuto' : 'peso'} ${v.opzione}`);
    }
    return fuori;
  };
  const casoCollaudo = (id: string) => { const m = ms.find((x) => x.id === id)!; const b = peggiore(creaCaso(1), dich);
    return [m, giocaMissione(m, v0, dich, { schiera: b.schiera, scegli: (mm, s, c) => { const o = opzioniValide(c, s, mm); return (o.find((x) => CASI[id]!.includes(x.id)) ?? o[0]!).id; } })] as const; };
  it('C40-01 e12, e13, e35 del collaudo: nessuna voce smentita dalla partita; rosso __NO_C40B01: le voci del collaudo', () => {
    for (const id of Object.keys(CASI)) { const [m, r] = casoCollaudo(id); expect(smentite(m, r)).toEqual([]); }
    g.__NO_C40B01 = true;
    const rosso = Object.keys(CASI).flatMap((id) => { const [m, r] = casoCollaudo(id); return smentite(m, r); });
    expect(rosso).toEqual(expect.arrayContaining(['e35 aiuto segui_barca', 'e35 aiuto stampa_vicina', 'e13 aiuto palco_si', 'e13 aiuto lascia_cori', 'e12 peso rinforzi12']));
  });
  it('C40-01 36 episodi × 20 partite del casuale: nessuna voce smentita dalla partita', () => {
    const fuori = ms.flatMap((m) => Array.from({ length: 20 }, (_, s) => smentite(m, giocaMissione(m, v0, dich, casuale(creaCaso(`c40:${m.id}:${s}`), dich)))).flat());
    expect(fuori).toEqual([]);
  }, 180_000);
});
