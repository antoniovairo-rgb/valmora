// D-158: il verbale «a fatica» di e14 segue il titolo del giorno dopo (tipografia del club o indagini).
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { giocaMissione } from '../src/logica/missione.ts';
import { casuale } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const d = leggiDati() as Record<string, unknown>;
const m = d['missioni/e14.json'] as Missione;
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_PO086; });
/** Partite «a fatica» del bot casuale: esito e risposta a titolo_domani. */
function aFatica(): { id: string; scelta?: string }[] {
  const out = [];
  for (let seme = 1; seme <= 400; seme++) {
    const r = giocaMissione(m, variabiliIniziali(dich.values()), dich, casuale(creaCaso(seme), dich));
    if (r.esito.id.startsWith('contenuto_a_fatica')) out.push({ id: r.esito.id, scelta: r.scelte.find((x) => x.chiamata === 'titolo_domani')?.opzione });
  }
  return out;
}

describe('finale di e14 legato alla scelta (D-158)', () => {
  it('a fatica: indagini ha il suo verbale, tipografia quello di base', () => {
    const p = aFatica();
    for (const x of p) expect(x.id).toBe(x.scelta === 'indagini' ? 'contenuto_a_fatica_indagini' : 'contenuto_a_fatica');
    expect(p.filter((x) => x.scelta === 'indagini').length).toBeGreaterThan(0);
    expect(p.filter((x) => x.scelta === 'tipografia_club').length).toBeGreaterThan(0);
  });
  it('rosso: senza «dopo» (__NO_PO086) le indagini finiscono nel verbale sbagliato', () => {
    g.__NO_PO086 = true;
    const p = aFatica().filter((x) => x.scelta === 'tipografia_club');
    expect(p.some((x) => x.id === 'contenuto_a_fatica_indagini')).toBe(true);
  });
});
