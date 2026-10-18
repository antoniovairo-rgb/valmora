// C37-08 (D-166): le unità impegnate da una risposta non contano come copertura del settore (D-056: coprono solo quelle
// schierate). In e24 il rapporto diceva «nessuna unità a coprirlo» subito dopo che il giocatore aveva mandato uno steward
// ai tornelli. Qui si contano le unità che le risposte dell'ondata hanno impegnato su un settore, per dirlo nel rapporto.
import type { InCorso } from '../logica/missione.ts';
import type { Missione } from '../logica/tipi.ts';
import { spento } from '../interruttori.ts';

/** Unità impegnate dalle risposte sul settore fino all'ondata `n` (chiamate di quel settore, effetti di riserva negativi).
 *  C39-02 (collaudo C-039, e25 o2→o3): le unità tolte dalla riserva restano impegnate per il resto della sera, quindi
 *  contano anche le risposte delle ondate prima. Rosso C116R01: solo l'ondata `n`, come prima. */
export function impegnateDaRisposte(m: Missione, scelte: InCorso['scelte'], n: number, settore: string): number {
  let tot = 0;
  const prima = !spento('C116R01');
  for (const s of scelte) {
    if (prima ? s.ondata > n : s.ondata !== n) continue;
    const c = m.ondate[s.ondata - 1]?.chiamate?.find((x) => x.id === s.chiamata);
    if (!c || c.settore !== settore) continue;
    for (const e of c.opzioni.find((o) => o.id === s.opzione)?.effetti ?? []) if ('riserva' in e && e.valore < 0) tot -= e.valore;
  }
  return tot;
}
