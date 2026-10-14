// C20-07: il segno della conseguenza c'è solo se lo stato cambia davvero (tensione già a 0 o a 10, riserva al tetto:
// niente segno), e una chiamata senza settore mostra comunque le squadre (segno «centrale», settore vuoto).
// Partite vere dei bot (peggiore, attenta e 20 semi casuali) su e01-e12; i rossi devono rivedere i difetti.
import { afterEach, describe, expect, it } from 'vitest';
import { STRATEGIE } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, iniziaMissione, missioneFinita, rispondi, schiera, type InCorso } from '../src/logica/missione.ts';
import type { Chiamata, Opzione } from '../src/logica/tipi.ts';
import { dichiarate, missioni } from '../src/resa/dati.ts';
import { segniDi, simboloSegno } from '../src/resa/mappa/segni.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C44E01; delete g.__NO_C44E02; delete g.__NO_C44E03; });

/** Ogni risposta delle partite di prova, con lo stato prima e dopo. */
function risposte() {
  const tutte: { c: Chiamata; o: Opzione; prima: InCorso; dopo: InCorso }[] = [];
  for (const m of missioni.slice(0, 12)) {
    for (const [nome, seme] of [['peggiore', 1], ['attenta', 1], ...Array.from({ length: 20 }, (_, i) => ['casuale', i + 1] as const)] as const) {
      const gg = STRATEGIE[nome]!(creaCaso(seme), dichiarate);
      let s = iniziaMissione(m, variabiliIniziali(dichiarate.values()), dichiarate);
      while (!missioneFinita(m, s)) {
        s = schiera(m, s, gg.schiera(m, s));
        for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) {
          const id = gg.scegli(m, s, c), dopo = rispondi(m, s, c.id, id, dichiarate);
          tutte.push({ c, o: c.opzioni.find((x) => x.id === id)!, prima: s, dopo }); s = dopo;
        }
        s = chiudiOndata(m, s, dichiarate);
      }
    }
  }
  return tutte;
}
/** Segni su uno stato che non cambia, e riserve che cambiano in chiamate senza settore ma senza segno. */
function difetti(rr: ReturnType<typeof risposte>) {
  let fermi = 0, senzaSettore = 0, casiFermi = 0, casiSenza = 0;
  for (const { c, o, prima, dopo } of rr) {
    const ss = segniDi(c, o, prima, dopo);
    for (const e of o.effetti) {
      if ('tensione' in e && e.valore && (prima.tensione[e.tensione] ?? 0) === (dopo.tensione[e.tensione] ?? 0)) { casiFermi++; if (ss.some((x) => x.tipo === 'tensione' && x.settore === e.tensione)) fermi++; }
      if ('riserva' in e && e.valore && (prima.riserva[e.riserva] ?? 0) === (dopo.riserva[e.riserva] ?? 0)) { casiFermi++; if (ss.some((x) => x.tipo === 'squadra')) fermi++; }
      if ('riserva' in e && e.valore && !c.settore && (prima.riserva[e.riserva] ?? 0) !== (dopo.riserva[e.riserva] ?? 0)) { casiSenza++; if (!ss.some((x) => x.tipo === 'squadra' && x.settore === '')) senzaSettore++; }
    }
  }
  return { fermi, senzaSettore, casiFermi, casiSenza };
}

describe('C20-07: segni solo se lo stato cambia', () => {
  const rr = risposte();
  it('nessun segno su uno stato fermo; le chiamate senza settore mostrano le squadre', () => {
    const d = difetti(rr);
    expect(d.casiFermi).toBeGreaterThan(0); // il campione contiene i casi, altrimenti il guardiano è cieco
    expect(d.casiSenza).toBeGreaterThan(0);
    expect(d.fermi).toBe(0);
    expect(d.senzaSettore).toBe(0);
  });
  it('braccio rosso __NO_C44E01: tornano i segni sugli stati fermi', () => {
    g.__NO_C44E01 = true;
    expect(difetti(rr).fermi).toBeGreaterThan(0);
  });
  it('braccio rosso __NO_C44E02: tornano le chiamate senza settore senza segno', () => {
    g.__NO_C44E02 = true;
    expect(difetti(rr).senzaSettore).toBeGreaterThan(0);
  });
  it('squadre in arrivo e richiamate hanno simboli diversi (rosso __NO_C44E03: uguali)', () => {
    const su = { settore: 'x', tipo: 'squadra', verso: 'su' } as const, giu = { ...su, verso: 'giu' } as const;
    expect(simboloSegno(su)).not.toBe(simboloSegno(giu));
    g.__NO_C44E03 = true;
    expect(simboloSegno(su)).toBe(simboloSegno(giu));
  });
});
