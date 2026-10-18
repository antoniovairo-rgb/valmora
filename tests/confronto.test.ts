// C38-03 (D-172): nel verbale «cosa ti ha aiutato / penalizzato» confronta ogni risposta con le altre della stessa
// chiamata (src/logica/confronto.ts), non il saldo degli effetti della sola risposta. Rosso __NO_C38B01.
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { giocaMissione, opzioniValide } from '../src/logica/missione.ts';
import { STRATEGIE, attenta, casuale } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import { bilancio } from '../src/logica/bilancio.ts';
import { confrontoScelte } from '../src/logica/confronto.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const d = leggiDati() as Record<string, unknown>;
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const ms = Object.entries(d).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m as Missione);
const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C38B01; });

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
});
