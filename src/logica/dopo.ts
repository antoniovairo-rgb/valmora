// D-241 idea C (PO-152): «il nessun costo morde dopo». Un'opzione può avere «effetti_dopo»: effetti che arrivano più tardi.
// Regola: una scelta fatta nell'ondata k con «ondate: n» morde alla chiusura dell'ondata k + n; se la missione ha meno
// ondate, alla chiusura dell'ultima (la fine della missione, prima dell'esito). Gli effetti si applicano all'inizio della
// chiusura, prima di risolvere l'ondata: una pressione pesa sull'ondata in cui morde, una tensione parte da lì, una
// riserva conta dall'ondata dopo, la fiducia cambia subito. Il rapporto dell'ondata li racconta («radio»).
// Lo stato in attesa è «scelte» (ondata, chiamata, opzione), già nel salvataggio: il formato non cambia e ogni ondata si
// chiude una volta sola, quindi ogni morso arriva una volta sola (anche ripartendo da un'ondata: le scelte dopo si tolgono).
// Rosso __NO_C241C01: gli effetti ritardati non si applicano.
import { spento } from '../interruttori.ts';
import type { EffettoDopo, Missione } from './tipi.ts';

export interface Morso { ondata: number; chiamata: string; opzione: string; dopo: EffettoDopo }

/** Ondata alla cui chiusura morde una scelta fatta nell'ondata «scelta» con «ondate» di ritardo. */
export const ondataDelMorso = (m: Missione, scelta: number, ondate: number): number => Math.min(scelta + ondate, m.ondate.length);

/** Le scelte con effetto ritardato che mordono alla chiusura dell'ondata n, nell'ordine in cui sono state fatte. */
export function morsiDellOndata(m: Missione, scelte: { ondata: number; chiamata: string; opzione: string }[], n: number): Morso[] {
  if (spento('C241C01')) return [];
  const out: Morso[] = [];
  for (const x of scelte) {
    const dopo = m.ondate[x.ondata - 1]?.chiamate?.find((c) => c.id === x.chiamata)?.opzioni.find((o) => o.id === x.opzione)?.effetti_dopo;
    if (dopo && ondataDelMorso(m, x.ondata, dopo.ondate) === n) out.push({ ...x, dopo });
  }
  return out;
}
