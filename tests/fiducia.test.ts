// D-105: fiducia minima a ogni episodio. Rosso __NO_C23F01.
import { afterEach, describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { registra, variabiliDiPartenza } from '../src/logica/episodi.ts';
import { FIDUCIA_MIN, VAR_FIDUCIA, iniziaMissione } from '../src/logica/missione.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const leggi = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const dich = new Map<string, Dichiarazione>(leggi('data/stato.json').variabili.map((d: Dichiarazione) => [d.id, d]));
const v0 = variabiliIniziali(dich.values());
const missioni: Missione[] = readdirSync('data/missioni').map((f) => leggi(`data/missioni/${f}`));
const m = missioni.find((x) => x.id === 'e02')!;
const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C23F01; });

describe('fiducia minima a inizio episodio (D-105)', () => {
  it('sotto il minimo risale al minimo, in tutti i 36 episodi', () => {
    expect(missioni).toHaveLength(36);
    for (const x of missioni) expect(iniziaMissione(x, { ...v0, [VAR_FIDUCIA]: 0 }, dich).variabili[VAR_FIDUCIA]).toBe(FIDUCIA_MIN);
  });
  it('sopra il minimo resta com\'è', () => {
    expect(iniziaMissione(m, { ...v0, [VAR_FIDUCIA]: FIDUCIA_MIN + 3 }, dich).variabili[VAR_FIDUCIA]).toBe(FIDUCIA_MIN + 3);
  });
  it('si applica alle variabili di prima del primo tentativo (D-062), anche nella copia per ripartire', () => {
    const prima = { ...v0, [VAR_FIDUCIA]: 0 };
    const reg = registra({}, m.id, prima, { esito: 'deg', fallita: true, stelle: 0 }, { ...v0, [VAR_FIDUCIA]: 9 }).registro;
    const s = iniziaMissione(m, variabiliDiPartenza(reg, m.id, { ...v0, [VAR_FIDUCIA]: 9 }), dich);
    expect(s.variabili[VAR_FIDUCIA]).toBe(FIDUCIA_MIN);
    expect(s.partenze?.[1]?.variabili[VAR_FIDUCIA]).toBe(FIDUCIA_MIN);
    expect(reg[m.id]!.variabili_prima[VAR_FIDUCIA]).toBe(0); // il registro non cambia
  });
  it('senza la variabile dichiarata non tocca niente', () => {
    expect(iniziaMissione(m, { ...v0, [VAR_FIDUCIA]: 0 }, new Map([...dich].filter(([k]) => k !== VAR_FIDUCIA))).variabili[VAR_FIDUCIA]).toBe(0);
  });
  it('rosso __NO_C23F01: la fiducia entra com\'è', () => {
    g.__NO_C23F01 = true;
    expect(iniziaMissione(m, { ...v0, [VAR_FIDUCIA]: 0 }, dich).variabili[VAR_FIDUCIA]).toBe(0);
  });
});
