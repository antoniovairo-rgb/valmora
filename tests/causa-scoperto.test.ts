// PO-087: «perché mi dà scoperto un posto se non ci sono stati eventi particolari ed è pattugliato?». Ogni «scoperto» nel
// rapporto porta la sua causa: cosa ha pesato (eventi dell'ondata, risposte) e la copertura messa.
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { giocaMissione } from '../src/logica/missione.ts';
import { STRATEGIE } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const d = leggiDati() as Record<string, unknown>;
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const ms = Object.entries(d).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m as Missione);
const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_PO087; });

const conta = () => {
  let scoperti = 0, senza = 0;
  for (const m of ms) for (let k = 1; k <= 5; k++) {
    const r = giocaMissione(m, v0, dich, STRATEGIE.casuale!(creaCaso(`c87:${m.id}:${k}`), dich));
    for (const x of r.rapporti) for (const [s, n] of Object.entries(x.scoperto)) if (n > 0) {
      scoperti++; const c = x.causa?.[s];
      if (!c || c.pressione <= c.copertura || (!c.eventi.length && c.risposte <= 0)) senza++;
    }
  }
  return { scoperti, senza };
};

describe('ogni «scoperto» ha la sua causa (PO-087)', () => {
  it('su 36 episodi × 5 partite casuali nessun settore scoperto senza causa leggibile', () => {
    const x = conta();
    console.log(`PO-087: settori scoperti ${x.scoperti}, senza causa ${x.senza}`);
    expect(x.scoperti).toBeGreaterThan(50); expect(x.senza).toBe(0);
  });
  it('braccio rosso __NO_PO087: senza causa nel rapporto il guardiano li conta tutti', () => {
    g.__NO_PO087 = true;
    const x = conta(); expect(x.senza).toBe(x.scoperti);
  });
});
