// C37-08 (D-166): le unità impegnate da una risposta non contano come copertura del settore (D-056: coprono solo quelle
// schierate). In e24 il rapporto diceva «nessuna unità a coprirlo» subito dopo che il giocatore aveva mandato uno steward
// ai tornelli. Qui si contano le unità che le risposte dell'ondata hanno impegnato su un settore, per dirlo nel rapporto.
import type { InCorso } from '../logica/missione.ts';
import type { Missione } from '../logica/tipi.ts';

/** Unità impegnate dalle risposte dell'ondata `n` sul settore (chiamate di quel settore, effetti di riserva negativi). */
export function impegnateDaRisposte(m: Missione, scelte: InCorso['scelte'], n: number, settore: string): number {
  let tot = 0;
  for (const s of scelte) {
    if (s.ondata !== n) continue;
    const c = m.ondate[n - 1]?.chiamate?.find((x) => x.id === s.chiamata);
    if (!c || c.settore !== settore) continue;
    for (const e of c.opzioni.find((o) => o.id === s.opzione)?.effetti ?? []) if ('riserva' in e && e.valore < 0) tot -= e.valore;
  }
  return tot;
}
