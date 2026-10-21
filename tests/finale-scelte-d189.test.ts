// D-189 regola 3 (S-13): i verbali di e18 ed e24 seguono i fili importanti. e18: col testimone uscito sotto scorta
// (auto_scorta, senza conferma alla stampa) il degenerato non dice che è «sparito». e24: con la busta consegnata i tre
// verbali non la dicono ancora in mano tua. Rosso __NO_C189F01: il test toglie i «dopo» degli esiti (i dati di prima).
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { giocaMissione } from '../src/logica/missione.ts';
import { attenta, casuale, peggiore } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const d = leggiDati() as Record<string, unknown>;
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const testi = (ep: string) => d[`testi/it/${ep}.json`] as Record<string, string>;
const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C189F01; });

const dati = (id: string) => {
  const m = structuredClone(d[`missioni/${id}.json`] as Missione);
  if (g.__NO_C189F01) m.esiti = m.esiti.filter((e) => !e.dopo);
  return m;
};

/** Partite dei bot: verbali che smentiscono il filo scelto. */
function smentite(id: string, smentisce: (scelte: Set<string>, verbale: string) => boolean, N = 300) {
  const m = dati(id); let n = 0, giocate = 0;
  for (const [nome, st] of [['casuale', casuale], ['attenta', attenta], ['peggiore', peggiore]] as const) for (let seme = 1; seme <= N; seme++) {
    const r = giocaMissione(m, variabiliIniziali(dich.values()), dich, st(creaCaso(`d189:${id}:${nome}:${seme}`), dich));
    const scelte = new Set(r.scelte.map((x) => `${x.chiamata}/${x.opzione}`)); giocate++;
    if (smentisce(scelte, testi(id)[r.esito.verbale.slice(6)]!)) n++;
  }
  return { n, giocate };
}

const protetto = (s: Set<string>) => (s.has('con_o_senza/auto_scorta') || s.has('con_o_senza_comando/auto_scorta')) && !s.has('qualcuno_ha_parlato/conferma18');
const e18 = () => smentite('e18', (s, v) => protetto(s) && v.includes('sparito'));
const e24 = () => smentite('e24', (s, v) => s.has('consegna/consegna_chiusa') && /la mette via|ancora nel cassetto|non chiede niente/.test(v));

describe('verbali che seguono i fili (D-189 regola 3)', () => {
  it('e18: testimone protetto, nessun «sparito»; e24: busta consegnata, nessuna busta ancora tua', () => {
    const a = e18(), b = e24();
    console.log(`D-189 verde: e18 smentite ${a.n}/${a.giocate}, e24 smentite ${b.n}/${b.giocate}`);
    expect(a.n).toBe(0); expect(b.n).toBe(0);
  }, 180_000);
  it('braccio rosso __NO_C189F01 (esiti senza «dopo»): le smentite tornano in entrambi', () => {
    g.__NO_C189F01 = true; const a = e18(), b = e24();
    console.log(`D-189 rosso: e18 smentite ${a.n}/${a.giocate}, e24 smentite ${b.n}/${b.giocate}`);
    expect(a.n).toBeGreaterThan(0); expect(b.n).toBeGreaterThan(0);
  }, 180_000);
});
