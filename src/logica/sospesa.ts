// PO-121 (D-148), PO-148 (D-236): la risposta a una chiamata resta «in sospeso» finché il giocatore non la conferma o la annulla.
// La logica non conosce il tempo: sa solo se la risposta è confermata o annullata. Quella in sospeso non entra nello
// stato della missione (InCorso) né quindi nel salvataggio: se il gioco si chiude prima della conferma, alla ripresa
// la chiamata è ancora aperta, con le stesse opzioni, e nessun effetto è stato applicato.
import { chiamateAperte, opzioniValide, rispondi, type InCorso } from './missione.ts';
import type { Dichiarazione, Missione } from './tipi.ts';

export interface InSospeso { chiamata: string; opzione: string; ondata: number; risposte: number }
export type Decisione = 'confermata' | 'annullata';

/** La scelta del giocatore, controllata come in rispondi ma senza applicarla. */
export function sospendi(m: Missione, s: InCorso, chiamata: string, opzione: string): InSospeso {
  const c = chiamateAperte(m, s).find((x) => x.id === chiamata);
  if (!c) throw new Error(`${m.id}: la chiamata «${chiamata}» non è aperta`);
  if (!opzioniValide(c, s, m).some((x) => x.id === opzione)) throw new Error(`${m.id}: l'opzione «${opzione}» non è valida per «${chiamata}»`);
  return { chiamata, opzione, ondata: s.ondata, risposte: Object.keys(s.risposte).length };
}

/** Vale ancora per questo stato (stessa ondata, nessuna risposta data nel frattempo)? */
export const valida = (s: InCorso, p: InSospeso) => s.ondata === p.ondata && Object.keys(s.risposte).length === p.risposte;

/** Annullata: lo stato resta quello di prima, identico. Confermata: come rispondi. */
export function decidi(m: Missione, s: InCorso, p: InSospeso, esito: Decisione, d: Map<string, Dichiarazione>): InCorso {
  if (esito === 'annullata') return s;
  if (!valida(s, p)) throw new Error(`${m.id}: la risposta in sospeso a «${p.chiamata}» non vale più`);
  return rispondi(m, s, p.chiamata, p.opzione, d);
}
