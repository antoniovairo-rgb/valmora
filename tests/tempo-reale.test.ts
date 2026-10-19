// PROTOTIPO S-14 (PO-022): tempo reale fuori dal percorso deterministico. Spento di norma; scadi senza soft-lock;
// orologio simulato con seme: stessa partita a ogni giro.
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { attenta, casuale } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiamateAperte, iniziaMissione, missioneFinita, rispondi, schiera, chiudiOndata, concludiMissione } from '../src/logica/missione.ts';
import { giocaConOrologio, modoTempo, predefinita, scadi } from '../src/logica/tempo.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__VALMORA_TEMPO_REALE; });
const m = JSON.parse(readFileSync('data/missioni/e02.json', 'utf8')) as Missione;
const e01 = JSON.parse(readFileSync('data/missioni/e01.json', 'utf8')) as Missione;
const dich = new Map((JSON.parse(readFileSync('data/stato.json', 'utf8')).variabili as Dichiarazione[]).map((d) => [d.id, d]));
const v0 = variabiliIniziali(dich.values());

describe('S-14 tempo reale (prototipo)', () => {
  it('spento di norma; acceso solo su e02', () => {
    expect(modoTempo(m)).toBeNull();
    g.__VALMORA_TEMPO_REALE = 'a';
    expect(modoTempo(m)).toBe('a'); expect(modoTempo(e01)).toBeNull();
  });
  it('lasciando scadere ogni chiamata la missione finisce sempre con un esito (nessun soft-lock)', () => {
    let s = iniziaMissione(m, v0, dich); const g1 = attenta(creaCaso(1), dich);
    while (!missioneFinita(m, s)) {
      s = schiera(m, s, g1.schiera(m, s));
      for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) { expect(c.opzioni.map((o) => o.id)).toContain(predefinita(m, s, c)); s = scadi(m, s, c.id, dich); }
      s = chiudiOndata(m, s, dich);
    }
    expect(s.scelte.every((x) => (x as { scaduta?: boolean }).scaduta)).toBe(true);
    expect(concludiMissione(m, s, dich).esito.id).toBeTruthy();
  });
  it('scadi = rispondi con la predefinita, più il segno «scaduta»', () => {
    const g1 = attenta(creaCaso(1), dich); let s = iniziaMissione(m, v0, dich); s = schiera(m, s, g1.schiera(m, s));
    const c = chiamateAperte(m, s)[0]!;
    const a = scadi(m, s, c.id, dich), b = rispondi(m, s, c.id, predefinita(m, s, c), dich);
    expect({ ...a, scelte: [] }).toEqual({ ...b, scelte: [] });
  });
  it('orologio simulato con seme: stessa partita a ogni giro, nei tre modi', () => {
    for (const modo of ['a', 'b', 'c'] as const) for (const seme of [1, 7, 42]) {
      const giro = () => giocaConOrologio(m, v0, dich, casuale(creaCaso(seme), dich), { modo, pScade: 0.3, minutiMax: 4, caso: creaCaso(`o${seme}`) });
      expect(giro()).toEqual(giro());
    }
  });
});
