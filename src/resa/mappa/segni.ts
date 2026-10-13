// Conseguenza visibile subito (PO-085, D-112 punto 3): dopo una risposta, sul settore toccato compare per un attimo
// il segno dell'effetto. ▲/▼ per pressione e tensione (su = peggio, giù = meglio), la squadra che parte o torna.
// Niente numeri (D-055): solo verso e tipo. Rosso C39E01: nessun segno.
import { spento } from '../../interruttori.ts';
import type { Chiamata, Opzione } from '../../logica/tipi.ts';

export interface Segno { settore: string; tipo: 'pressione' | 'tensione' | 'squadra'; verso: 'su' | 'giu' }

/** I segni di una risposta: gli effetti su un settore, e le unità impegnate (o liberate) sul settore della chiamata. */
export function segniDi(c: Chiamata, o: Opzione): Segno[] {
  if (spento('C39E01')) return [];
  const segni: Segno[] = [];
  for (const e of o.effetti) {
    if ('pressione' in e && e.valore) segni.push({ settore: e.pressione, tipo: 'pressione', verso: e.valore > 0 ? 'su' : 'giu' });
    else if ('tensione' in e && e.valore) segni.push({ settore: e.tensione, tipo: 'tensione', verso: e.valore > 0 ? 'su' : 'giu' });
    else if ('riserva' in e && e.valore && c.settore) segni.push({ settore: c.settore, tipo: 'squadra', verso: e.valore < 0 ? 'su' : 'giu' });
  }
  return segni;
}

/** Testo del segno (per i lettori di schermo e per il guardiano), in parole. */
export const parolaSegno = (s: Segno) => (s.tipo === 'squadra' ? (s.verso === 'su' ? 'squadre in arrivo' : 'squadre richiamate')
  : `${s.tipo} in ${s.verso === 'su' ? 'salita' : 'discesa'}`);
