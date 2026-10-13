// C17-05: nel rapporto un settore coperto ma a tensione da degenerato (≥ DEGENERA) non si scrive «sotto controllo» in
// verde. Partite vere dei bot sugli episodi della stagione 1; il braccio rosso __NO_C42C01 deve rivedere il difetto.
import { afterEach, describe, expect, it } from 'vitest';
import { STRATEGIE } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, DEGENERA, iniziaMissione, missioneFinita, rispondi, schiera, type RapportoOndata } from '../src/logica/missione.ts';
import { dichiarate, missioni } from '../src/resa/dati.ts';
import { statoSettore } from '../src/resa/partita.ts';

const g = globalThis as Record<string, unknown>;
afterEach(() => { delete g.__NO_C42C01; });

/** Rapporti d'ondata di partite dei bot (peggiore e casuale con 20 semi) su e01-e12. */
function rapporti(): RapportoOndata[] {
  const tutti: RapportoOndata[] = [];
  for (const m of missioni.slice(0, 12)) {
    for (const [nome, seme] of [['peggiore', 1], ...Array.from({ length: 20 }, (_, i) => ['casuale', i + 1] as const)] as const) {
      const gg = STRATEGIE[nome]!(creaCaso(seme), dichiarate);
      let s = iniziaMissione(m, variabiliIniziali(dichiarate.values()), dichiarate);
      while (!missioneFinita(m, s)) {
        s = schiera(m, s, gg.schiera(m, s));
        for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = rispondi(m, s, c.id, gg.scegli(m, s, c), dichiarate);
        s = chiudiOndata(m, s, dichiarate);
      }
      tutti.push(...s.rapporti);
    }
  }
  return tutti;
}
/** Settori coperti a tensione da degenerato, con lo stato che il rapporto scriverebbe. */
const caldi = (rr: RapportoOndata[]) => rr.flatMap((r) => Object.entries(r.tensione)
  .filter(([id, t]) => t >= DEGENERA && !((r.scoperto[id] ?? 0) > 0)).map(([, t]) => statoSettore(t, false)));

describe('C17-05: settore coperto ma caldo', () => {
  const rr = rapporti();
  it('nessun settore a tensione ≥ DEGENERA è «sotto controllo» e basta', () => {
    const c = caldi(rr);
    expect(c.length).toBeGreaterThan(0); // il campione contiene il caso, altrimenti il guardiano è cieco
    expect(c.filter((x) => x === 'controllo')).toEqual([]);
  });
  it('braccio rosso __NO_C42C01: torna «sotto controllo»', () => {
    g.__NO_C42C01 = true;
    expect(caldi(rr).every((x) => x === 'controllo')).toBe(true);
  });
  it('scoperto resta scoperto, tensione bassa resta sotto controllo', () => {
    expect(statoSettore(9, true)).toBe('scoperto');
    expect(statoSettore(DEGENERA - 1, false)).toBe('controllo');
  });
});
