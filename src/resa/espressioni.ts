// PO-059: protagonista e vice disegnati dal codice (stile C) con l'espressione che segue la partita: a fine ondata dalla
// tensione (la più alta fra i settori, decisione del PO), al verbale dall'esito. Il vice fa da contrappunto: resta calmo
// quando tu sei teso, si preoccupa con te quando la serata è critica. Modulo puro, senza disegno (lo fa Persona).
// Rosso C96P01: niente vignetta nel rapporto e al verbale solo la bocca, come prima.
import { spento } from '../interruttori.ts';

export interface Espressione { bocca: 'su' | 'giu' | 'dritta'; sopracciglia?: 'su' | 'giu'; braccia?: 'su' | 'nuca' }
export type TonoOndata = 'calmo' | 'teso' | 'critico';
export type TonoEsito = 'bene' | 'medio' | 'male' | 'fallita';

/** Il tono del rapporto dal livello di tensione più alto a fine ondata (0-5, partita.ts): fino a 1 calmo, 2-3 teso, poi critico.
 *  C33-07 (D-145): con almeno un settore scoperto il tono è almeno «teso» (la serata non è «sotto controllo» se un settore
 *  è rimasto scoperto). Rosso C108T01: conta solo la tensione, come prima. */
export const tonoOndata = (livelli: number[], scoperti = 0): TonoOndata => {
  const m = Math.max(0, ...livelli), t = m <= 1 ? 'calmo' : m <= 3 ? 'teso' : 'critico';
  return t === 'calmo' && scoperti > 0 && !spento('C108T01') ? 'teso' : t;
};

const ONDATA: Record<TonoOndata, { tu: Espressione; vice: Espressione; titolo: string }> = {
  calmo: { tu: { bocca: 'su' }, vice: { bocca: 'su' }, titolo: 'serata sotto controllo' },
  teso: { tu: { bocca: 'dritta', sopracciglia: 'giu' }, vice: { bocca: 'su' }, titolo: 'serata tesa' },
  critico: { tu: { bocca: 'giu', sopracciglia: 'giu', braccia: 'nuca' }, vice: { bocca: 'giu', sopracciglia: 'giu' }, titolo: 'serata critica' },
};
const ESITO: Record<TonoEsito, { tu: Espressione; vice: Espressione; titolo: string }> = {
  bene: { tu: { bocca: 'su', sopracciglia: 'su', braccia: 'su' }, vice: { bocca: 'su', braccia: 'su' }, titolo: 'festa' },
  medio: { tu: { bocca: 'dritta' }, vice: { bocca: 'su' }, titolo: 'sollievo' },
  male: { tu: { bocca: 'giu', sopracciglia: 'giu', braccia: 'nuca' }, vice: { bocca: 'dritta' }, titolo: 'preoccupazione' },
  fallita: { tu: { bocca: 'giu', sopracciglia: 'giu' }, vice: { bocca: 'giu', sopracciglia: 'giu' }, titolo: 'sconfitta' },
};
const PRIMA: Record<TonoEsito, { tu: Espressione; vice: Espressione; titolo: string }> = {
  bene: { tu: { bocca: 'su' }, vice: { bocca: 'su' }, titolo: 'festa' }, medio: { tu: { bocca: 'dritta' }, vice: { bocca: 'su' }, titolo: 'sollievo' },
  male: { tu: { bocca: 'giu' }, vice: { bocca: 'dritta' }, titolo: 'preoccupazione' }, fallita: { tu: { bocca: 'giu' }, vice: { bocca: 'giu' }, titolo: 'sconfitta' },
};

export const espressioneOndata = (t: TonoOndata) => ONDATA[t];
export const espressioneEsito = (t: TonoEsito) => (spento('C96P01') ? PRIMA[t] : ESITO[t]);
