// C35-03 e C34-04 (decisione del PO «Rendili copribili»): un settore dove arriva pressione (un evento dell'ondata o
// l'effetto di una risposta) deve essere coperto da almeno un tipo di unità dell'episodio, cioè con efficacia > 0 sul
// suo tipo (la copertura è la somma delle efficacie, src/logica/missione.ts:201). Prima: e21 «Vie del quartiere» di
// tipo quartiere, nessuna unità con efficacia (scoperto in ondata 4 1000 partite su 1000); e17 Piazza del municipio di
// tipo strada, steward a efficacia 0. Prova sui dati veri: verde coi dati corretti, rosso coi dati di prima.
import { describe, expect, it } from 'vitest';
import { leggiDati } from '../tools/dati-disco.mjs';
import type { Missione } from '../src/logica/tipi.ts';
import { follaDellOndata } from '../src/resa/mappa/folla.ts';

const d = leggiDati() as Record<string, unknown>;
const missioni = Object.entries(d).filter(([k]) => /^missioni\/e\d+\.json$/.test(k)).map(([, m]) => m as Missione);
const chiCopre = (m: Missione, tipo: string) => Object.entries(m.mappa.risorse).filter(([, r]) => (r.efficacia[tipo] ?? 0) > 0).map(([id]) => id);

/** Settori che ricevono pressione: eventi delle ondate ed effetti «pressione» positivi delle risposte. */
function settoriConPressione(m: Missione): Set<string> {
  const out = new Set<string>();
  for (const o of m.ondate) {
    for (const ev of o.eventi) if (ev.pressione > 0) out.add(ev.settore);
    for (const c of o.chiamate ?? []) for (const op of c.opzioni) for (const e of op.effetti) if ('pressione' in e && e.valore > 0) out.add(e.pressione);
  }
  return out;
}

describe('C35-03 ogni settore con pressione è copribile da almeno un tipo di unità', () => {
  it('ci sono tutti gli episodi e01-e36', () => expect(missioni.length).toBe(36));
  it('e01-e36: nessun settore senza unità che lo coprano', () => {
    const scoperti = missioni.flatMap((m) => m.mappa.settori.filter((s) => settoriConPressione(m).has(s.id) && !chiCopre(m, s.tipo).length)
      .map((s) => `${m.id} ${s.id} (${s.tipo})`));
    expect(scoperti).toEqual([]);
  });
  it('e21 «Vie del quartiere»: gli steward (le risposte li mandano lì) le coprono', () => {
    const m = missioni.find((x) => x.id === 'e21')!;
    expect(chiCopre(m, m.mappa.settori.find((s) => s.id === 'quartiere')!.tipo)).toContain('steward');
  });
});

describe('C34-04 e17 Piazza del municipio', () => {
  const m = missioni.find((x) => x.id === 'e17')!;
  const piazza = m.mappa.settori.find((s) => s.id === 'piazza_municipio')!;
  it('è una piazza, come in e30, e la coprono squadre e steward', () => {
    expect(piazza.tipo).toBe('piazza');
    expect(chiCopre(m, piazza.tipo)).toEqual(expect.arrayContaining(['squadre', 'steward']));
  });
  it('le squadre valgono quanto prima (2, come sulla strada)', () => expect(m.mappa.risorse.squadre!.efficacia[piazza.tipo]).toBe(2));
});

describe('C35-05 un evento «curva» (testo «curva agitata») sta solo su un settore curva', () => {
  // e13 ondata 2: cori_ospiti di tipo curva sul Piazzale dello stadio, il rapporto scriveva «Curva agitata» sul piazzale.
  it('e01-e36: nessun evento curva fuori da una curva', () => {
    const fuori = missioni.flatMap((m) => m.ondate.flatMap((o, i) => o.eventi.filter((ev) => ev.tipo === 'curva' && m.mappa.settori.find((s) => s.id === ev.settore)?.tipo !== 'curva')
      .map((ev) => `${m.id} o${i + 1} ${ev.id} su ${ev.settore}`)));
    expect(fuori).toEqual([]);
  });
  it('e13 ondata 2 resta «partita» (spalti pieni: i cori di casa in curva Kiln restano un evento curva)', () => {
    expect(follaDellOndata(missioni.find((x) => x.id === 'e13')!, 2).spalti).toBe('pieni');
  });
});
