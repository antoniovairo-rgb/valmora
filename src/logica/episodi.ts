// Esito di un episodio, stelle e registro della mappa degli episodi (D-059…D-062). Puro.
// - Fallito (esito con «fallita»): 0 stelle, l'episodio va rigiocato; la partita non cambia la storia.
// - Superato: 1 stella; 2 se vale «stelle.due»; 3 se vale «stelle.tre» (dati della missione), entro
//   «stelle_min»/«stelle_max» dell'esito (D-064: «a fatica» al massimo 2, «contenuto» almeno 2).
// - Rigioco: resta il risultato migliore (più stelle; a parità, il primo ottenuto). Le variabili della
//   storia vengono dalla partita migliore solo se l'episodio è l'ultimo concluso (D-062).
import { valuta } from './condizioni.ts';
import type { EsitoMissione } from './missione.ts';
import type { Missione, Variabili } from './tipi.ts';

export type Stelle = 0 | 1 | 2 | 3;

export interface Risultato { esito: string; fallita: boolean; stelle: Stelle }

export function valutaEpisodio(m: Missione, r: EsitoMissione): Risultato {
  const fallita = !!r.esito.fallita;
  const base = fallita ? 0 : valuta(m.stelle.tre, r.variabili) ? 3 : valuta(m.stelle.due, r.variabili) ? 2 : 1;
  // le stelle seguono l'esito (D-064): un esito può fissare un minimo e un massimo
  const stelle = (fallita ? 0 : Math.min(r.esito.stelle_max ?? 3, Math.max(r.esito.stelle_min ?? 1, base))) as Stelle;
  return { esito: r.esito.id, fallita, stelle };
}

export interface VoceRegistro {
  migliore: Risultato | null;       // null finché l'episodio non è mai stato superato
  tentativi: number;
  variabili_prima: Variabili;        // da qui riparte ogni tentativo
  variabili_dopo: Variabili | null;  // della partita migliore superata
}

export type Registro = Record<string, VoceRegistro>;

export const superato = (reg: Registro, id: string) => !!reg[id]?.migliore;

/** Variabili da cui parte un tentativo: quelle fissate al primo ingresso nell'episodio. */
export const variabiliDiPartenza = (reg: Registro, id: string, attuali: Variabili): Variabili => reg[id]?.variabili_prima ?? attuali;

/** Registra un tentativo; restituisce il registro nuovo e se il risultato è il nuovo migliore. */
export function registra(reg: Registro, id: string, prima: Variabili, r: Risultato, dopo: Variabili): { registro: Registro; migliore: boolean } {
  const voce = reg[id] ?? { migliore: null, tentativi: 0, variabili_prima: prima, variabili_dopo: null };
  const migliore = !r.fallita && (!voce.migliore || r.stelle > voce.migliore.stelle);
  const nuova: VoceRegistro = {
    ...voce, tentativi: voce.tentativi + 1,
    migliore: migliore ? r : voce.migliore,
    variabili_dopo: migliore ? dopo : voce.variabili_dopo,
  };
  return { registro: { ...reg, [id]: nuova }, migliore };
}
