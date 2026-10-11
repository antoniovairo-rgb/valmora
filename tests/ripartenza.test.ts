// PO-060: se l'episodio è perso si riparte dall'ondata in cui la tensione ha toccato il massimo, non dall'inizio.
import { afterEach, describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, iniziaMissione, missioneFinita, ondataDaRiprendere, riprendiDallOndata, rispondi, schiera, type Giocatore, type InCorso } from '../src/logica/missione.ts';
import { attenta, casuale } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import type { Dichiarazione, Missione } from '../src/logica/tipi.ts';

const d = leggiDati() as Record<string, unknown>;
const dich = new Map((d['stato.json'] as { variabili: Dichiarazione[] }).variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C16R01; });

function gioca(m: Missione, s: InCorso, gioc: Giocatore) {
  while (!missioneFinita(m, s)) {
    s = schiera(m, s, gioc.schiera(m, s));
    for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = rispondi(m, s, c.id, gioc.scegli(m, s, c), dich);
    s = chiudiOndata(m, s, dich);
  }
  return { s, r: concludiMissione(m, s, dich) };
}

describe('ripartenza dall\'ondata persa (PO-060)', () => {
  const m = d['missioni/e01.json'] as Missione;
  it('dallo stato salvato all\'ondata n, rigiocando le stesse scelte, il risultato è identico', () => {
    for (let seme = 1; seme <= 30; seme++) {
      const { s, r } = gioca(m, iniziaMissione(m, v0, dich), casuale(creaCaso(`rip:${seme}`), dich));
      const n = ondataDaRiprendere(r); const p = riprendiDallOndata(s, n)!;
      expect(p.ondata).toBe(n);
      expect(p.scelte.length).toBe(r.scelte.filter((x) => x.ondata < n).length);
    }
  });
  it('su e01–e03 molte partite perse si salvano rigiocando solo da lì (misura stampata)', () => {
    for (const id of ['e01', 'e02', 'e03']) {
      const mm = d[`missioni/${id}.json`] as Missione; let perse = 0, salvate = 0, ondate = 0;
      for (let seme = 1; seme <= 200; seme++) {
        const { s, r } = gioca(mm, iniziaMissione(mm, v0, dich), casuale(creaCaso(`rip:${id}:${seme}`), dich));
        if (!r.esito.fallita) continue;
        perse++; const n = ondataDaRiprendere(r); ondate += n;
        const { r: r2 } = gioca(mm, riprendiDallOndata(s, n)!, attenta(creaCaso(1), dich));
        if (!r2.esito.fallita) salvate++;
      }
      console.log(`${id}: perse ${perse}/200 · ripartenza media dall'ondata ${(ondate / perse).toFixed(2)} · salvabili da lì col giocatore attento ${salvate}/${perse}`);
      expect(perse).toBeGreaterThan(0);
    }
  });
  it('braccio rosso __NO_C16R01: si riparte sempre dall\'ondata 1', () => {
    g.__NO_C16R01 = true;
    const { r } = gioca(m, iniziaMissione(m, v0, dich), casuale(creaCaso('rip:1'), dich));
    expect(ondataDaRiprendere(r)).toBe(1);
  });
});
