// Episodi nella resa (src/resa/episodi.ts) sui dati veri di e01: fallimento, rigioco, resta il migliore.
import { describe, expect, it } from 'vitest';
import { STRATEGIE } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, missioneFinita, rispondi, schiera } from '../src/logica/missione.ts';
import type { Missione } from '../src/logica/tipi.ts';
import { dichiarate, missioni } from '../src/resa/dati.ts';
import { chiudiEpisodio, iniziaEpisodio, prossimoEpisodio, statoEpisodio } from '../src/resa/episodi.ts';
import { SAVE_VERSION, type Salvataggio } from '../src/salvataggi/salvataggio.ts';

const m = missioni[0]!;
const nuovo = (): Salvataggio => ({ save_version: SAVE_VERSION, game_version: 'prova', seme: 1, caso: 1, variabili: variabiliIniziali(dichiarate.values()), missioni_concluse: [], episodi: {}, in_corso: null });

/** Gioca un tentativo come farebbe la resa (iniziaEpisodio … concludiMissione) con una strategia dei bot. */
function tentativo(s: Salvataggio, mm: Missione, strategia: string) {
  const g = STRATEGIE[strategia]!(creaCaso(1), dichiarate);
  let ic = iniziaEpisodio(s, mm);
  while (!missioneFinita(mm, ic)) {
    ic = schiera(mm, ic, g.schiera(mm, ic));
    for (let c = chiamateAperte(mm, ic)[0]; c; c = chiamateAperte(mm, ic)[0]) ic = rispondi(mm, ic, c.id, g.scegli(mm, ic, c), dichiarate);
    ic = chiudiOndata(mm, ic, dichiarate);
  }
  return chiudiEpisodio(s, mm, concludiMissione(mm, ic, dichiarate));
}

describe('episodi nella resa', () => {
  it('all\'inizio il primo episodio è disponibile', () => {
    expect(statoEpisodio(nuovo(), m)).toBe('disponibile');
    expect(prossimoEpisodio(nuovo())?.id).toBe(m.id);
  });
  it('fallimento: 0 stelle, da rigiocare, la storia non cambia', () => {
    const s0 = nuovo();
    const f = tentativo(s0, m, 'peggiore');
    expect(f.risultato).toMatchObject({ fallita: true, stelle: 0 });
    expect(f.salvataggio.variabili).toEqual(s0.variabili);
    expect(f.salvataggio.missioni_concluse).toEqual([]);
    expect(statoEpisodio(f.salvataggio, m)).toBe('da_rigiocare');
    expect(prossimoEpisodio(f.salvataggio)?.id).toBe(m.id);
  });
  it('rigioco dopo il fallimento: si riparte dalle variabili di prima e il successo supera l\'episodio', () => {
    const s0 = nuovo();
    const f = tentativo(s0, m, 'peggiore').salvataggio;
    expect(iniziaEpisodio(f, m).variabili).toEqual({ ...s0.variabili, tensione_max: 0 });
    const ok = tentativo(f, m, 'equilibrata');
    expect(ok.risultato.fallita).toBe(false);
    expect(ok.migliore).toBe(true);
    expect(ok.salvataggio.missioni_concluse).toEqual([m.id]);
    expect(ok.salvataggio.episodi[m.id]).toMatchObject({ tentativi: 2, migliore: { stelle: ok.risultato.stelle } });
    expect(statoEpisodio(ok.salvataggio, m)).toBe('superato');
  });
  it('rigiocare peggio non toglie il risultato migliore né cambia la storia', () => {
    const ok = tentativo(nuovo(), m, 'equilibrata').salvataggio;
    const peggio = tentativo(ok, m, 'peggiore');
    expect(peggio.migliore).toBe(false);
    expect(peggio.salvataggio.episodi[m.id]!.migliore).toEqual(ok.episodi[m.id]!.migliore);
    expect(peggio.salvataggio.variabili).toEqual(ok.variabili);
    expect(statoEpisodio(peggio.salvataggio, m)).toBe('superato');
  });
});
