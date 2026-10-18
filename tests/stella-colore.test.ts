// C38-02 (D-172, collaudo C-038): con soglia e tensione raggiunta dello stesso colore (soglia 3 e tensione 4: livello
// ceil(t/2) = 2, giallo) il verbale diceva «non deve passare il giallo: è arrivata al giallo». Ora dice che la tensione è
// salita troppo dentro quel colore, senza cifre nella frase dei colori (D-055). Prova sulle 72 soglie di tensione delle
// stelle dei dati (tutte «tensione_max al massimo 3»). Rosso __NO_C38G01: la frase di prima.
import { readdirSync, readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { requisitoInParole } from '../src/resa/schermate/Bilancio.tsx';
import { livello } from '../src/resa/partita.ts';
import type { Requisito } from '../src/logica/bilancio.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C38G01; });
const soglie: { id: string; stelle: number; soglia: number }[] = [];
const visita = (o: unknown, id: string, stelle: number) => { if (!o || typeof o !== 'object') return; const x = o as Record<string, unknown>;
  if (typeof x.var === 'string' && x.var.startsWith('tensione') && typeof x.al_massimo === 'number') soglie.push({ id, stelle, soglia: x.al_massimo });
  for (const v of Object.values(x)) visita(v, id, stelle); };
for (const f of readdirSync('data/missioni')) { const m = JSON.parse(readFileSync(`data/missioni/${f}`, 'utf8')); visita(m.stelle?.due, m.id, 2); visita(m.stelle?.tre, m.id, 3); }
// i casi: ogni tensione oltre la soglia ma dello stesso colore
const casi = soglie.flatMap((s) => Array.from({ length: 11 }, (_, v) => v).filter((v) => v > s.soglia && livello(v) === livello(s.soglia)).map((v) => ({ ...s, v })));
const frase = (c: (typeof casi)[number]) => requisitoInParole({ var: 'tensione_max', confronto: 'al_massimo', soglia: c.soglia, valore: c.v, ok: false } as Requisito, c.stelle).split(/ (?:Seconda|Terza) stella:/)[0]!;

describe('C38-02 stessa tinta per soglia e tensione raggiunta', () => {
  it('72 soglie, 72 casi', () => { expect(soglie.length).toBe(72); expect(casi.length).toBe(72); });
  it('la frase dei colori non si contraddice e non ha cifre', () => {
    const male = casi.map(frase).filter((s) => /non deve passare (il|l')\s?(\S+): è arrivata (al|all')\s?\2\./.test(s) || /\d/.test(s) || !/troppo dentro/.test(s));
    expect(male).toEqual([]);
  });
  it('braccio rosso: la frase di prima in 72 casi su 72', () => {
    g.__NO_C38G01 = true;
    expect(casi.map(frase).filter((s) => s.includes('non deve passare il giallo: è arrivata al giallo.')).length).toBe(72);
  });
});
