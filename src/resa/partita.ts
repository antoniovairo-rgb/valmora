// Dove si trova il giocatore dentro una missione: si ricava SOLO dallo stato salvato (InCorso),
// così una ricarica a metà ondata riporta esattamente alla stessa scena.
import { chiamateAperte, missioneFinita, type InCorso } from '../logica/missione.ts';
import type { Chiamata, Esito, Missione } from '../logica/tipi.ts';

export type Fase =
  | { tipo: 'schieramento' }
  | { tipo: 'chiamata'; chiamata: Chiamata; numero: number; totale: number }
  | { tipo: 'chiusura' }      // schierati, chiamate finite: l'ondata si chiude col rapporto
  | { tipo: 'fine' };         // tutte le ondate chiuse: resta il rapporto finale, poi il verbale

export function faseDi(m: Missione, s: InCorso): Fase {
  if (missioneFinita(m, s)) return { tipo: 'fine' };
  if (!s.disposizione) return { tipo: 'schieramento' };
  const aperte = chiamateAperte(m, s);
  const risposte = Object.keys(s.risposte).length;
  if (aperte.length) return { tipo: 'chiamata', chiamata: aperte[0]!, numero: risposte + 1, totale: risposte + aperte.length };
  return { tipo: 'chiusura' };
}

/** Livello di colore 0-5 per una tensione di settore 0-10 (D-055: si mostra il colore, mai il numero). */
export const livello = (tensione: number): number => (tensione <= 0 ? 0 : Math.min(5, Math.ceil(tensione / 2)));

/** Tono dell'esito: il primo della lista è il migliore, l'ultimo il peggiore (ordine dei dati). */
export function tono(m: Missione, e: Esito): 'bene' | 'medio' | 'male' {
  const i = m.esiti.findIndex((x) => x.id === e.id);
  return i === 0 ? 'bene' : i === m.esiti.length - 1 ? 'male' : 'medio';
}

/** Testi della chiamata e dell'opzione scelta, per il verbale. */
export function sceltaLeggibile(m: Missione, x: InCorso['scelte'][number]) {
  const c = m.ondate[x.ondata - 1]?.chiamate?.find((k) => k.id === x.chiamata);
  return { chiamata: c, opzione: c?.opzioni.find((o) => o.id === x.opzione) };
}
