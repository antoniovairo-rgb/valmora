// Conseguenza visibile subito (PO-085, D-112 punto 3): dopo una risposta, sul settore toccato compare per un attimo
// il segno dell'effetto. ▲/▼ per pressione e tensione (su = peggio, giù = meglio), la squadra che parte o torna.
// Niente numeri (D-055): solo verso e tipo. Rosso C39E01: nessun segno.
import { spento } from '../../interruttori.ts';
import type { InCorso } from '../../logica/missione.ts';
import type { Chiamata, Opzione } from '../../logica/tipi.ts';

export interface Segno { settore: string; tipo: 'pressione' | 'tensione' | 'squadra'; verso: 'su' | 'giu' }

/** I segni di una risposta: gli effetti su un settore, e le unità impegnate (o liberate) sul settore della chiamata.
 *  C20-07: con lo stato prima e dopo la risposta, niente segno se il valore non cambia (tensione già a 0 o a 10,
 *  riserva al tetto); una chiamata senza settore mette il segno delle squadre al centro in basso della mappa (settore
 *  «»), dove parte il volo dalla centrale. Rossi C44E01 (segno anche se non cambia) e C44E02 (niente segno senza settore). */
export function segniDi(c: Chiamata, o: Opzione, prima?: InCorso, dopo?: InCorso): Segno[] {
  if (spento('C39E01')) return [];
  const cambia = (a: number | undefined, b: number | undefined) => !prima || !dopo || spento('C44E01') || (a ?? 0) !== (b ?? 0);
  const segni: Segno[] = [];
  for (const e of o.effetti) {
    if ('pressione' in e && e.valore) segni.push({ settore: e.pressione, tipo: 'pressione', verso: e.valore > 0 ? 'su' : 'giu' });
    else if ('tensione' in e && e.valore) { if (cambia(prima?.tensione[e.tensione], dopo?.tensione[e.tensione])) segni.push({ settore: e.tensione, tipo: 'tensione', verso: e.valore > 0 ? 'su' : 'giu' }); }
    else if ('riserva' in e && e.valore && (c.settore || !spento('C44E02')) && cambia(prima?.riserva[e.riserva], dopo?.riserva[e.riserva])) segni.push({ settore: c.settore ?? '', tipo: 'squadra', verso: e.valore < 0 ? 'su' : 'giu' });
  }
  return segni;
}

/** C20-07: il segno delle squadre dice anche il verso: «+⚑» in arrivo, «−⚑» richiamate. Rosso C44E03: «⚑» per tutti e due. */
export const simboloSegno = (s: Segno) => (s.tipo === 'squadra' ? (spento('C44E03') ? '⚑' : s.verso === 'su' ? '+⚑' : '−⚑') : s.verso === 'su' ? '▲' : '▼');

/** Testo del segno (per i lettori di schermo e per il guardiano), in parole. */
export const parolaSegno = (s: Segno) => (s.tipo === 'squadra' ? (s.verso === 'su' ? 'squadre in arrivo' : 'squadre richiamate')
  : `${s.tipo} in ${s.verso === 'su' ? 'salita' : 'discesa'}`);
