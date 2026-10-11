// Bilancio di fine episodio (D-085): su una partita vera di e01 dice cosa ha aiutato, cosa ha pesato e perché le stelle.
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { giocaMissione } from '../src/logica/missione.ts';
import { casuale } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import { bilancio, requisiti } from '../src/logica/bilancio.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const d = leggiDati() as Record<string, unknown>;
const m = d['missioni/e01.json'] as Missione;
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const partita = (seme: number) => giocaMissione(m, variabiliIniziali(dich.values()), dich, casuale(creaCaso(seme), dich));
const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C10B01; });

describe('bilancio di fine episodio (D-085)', () => {
  it('dice cosa ha aiutato e cosa ha pesato, ordinati per peso', () => {
    const b = bilancio(m, partita(7));
    expect(b.aiuti.length + b.pesi.length).toBeGreaterThan(0);
    for (const x of b.aiuti) expect(x.saldo).toBeGreaterThan(0);
    for (const x of b.pesi) expect(x.saldo).toBeLessThan(0);
    expect(b.aiuti.map((x) => x.saldo)).toEqual([...b.aiuti.map((x) => x.saldo)].sort((a, c) => c - a));
  });
  it('spiega le stelle con il valore ottenuto', () => {
    const r = partita(7);
    const due = requisiti(m.stelle.due, r.variabili);
    expect(due[0]).toMatchObject({ var: 'tensione_max', confronto: 'al_massimo', soglia: 3, valore: r.variabili.tensione_max });
    expect(due[0]!.ok).toBe((r.variabili.tensione_max as number) <= 3);
  });
  it('braccio rosso __NO_C10B01: il bilancio resta vuoto', () => {
    g.__NO_C10B01 = true;
    const b = bilancio(m, partita(7));
    expect(b.aiuti.length + b.pesi.length + b.scoperti.length).toBe(0);
  });
});
