// Episodi nella resa (D-059…D-062): quali si possono giocare, da quali variabili parte un tentativo,
// come si chiude nel salvataggio. I calcoli di stelle e registro stanno in src/logica/episodi.ts.
import { valuta } from '../logica/condizioni.ts';
import { registra, superato, valutaEpisodio, variabiliDiPartenza, type Risultato } from '../logica/episodi.ts';
import { iniziaMissione, type EsitoMissione, type InCorso } from '../logica/missione.ts';
import type { Missione } from '../logica/tipi.ts';
import type { Salvataggio } from '../salvataggi/salvataggio.ts';
import { dichiarate, missioni } from './dati.ts';

export type StatoEpisodio = 'superato' | 'da_rigiocare' | 'disponibile' | 'futuro';

/** Un episodio si gioca se i precedenti sono superati e la sua condizione è vera; superato = rigiocabile. */
export function statoEpisodio(s: Salvataggio, m: Missione): StatoEpisodio {
  if (superato(s.episodi, m.id)) return 'superato';
  const prima = missioni.filter((x) => x.episodio < m.episodio);
  if (!prima.every((x) => superato(s.episodi, x.id)) || !valuta(m.disponibile_se, s.variabili)) return 'futuro';
  return (s.episodi[m.id]?.tentativi ?? 0) > 0 ? 'da_rigiocare' : 'disponibile';
}

/** Il primo episodio ancora da superare, se c'è. */
export const prossimoEpisodio = (s: Salvataggio) => missioni.find((m) => statoEpisodio(s, m) !== 'superato' && statoEpisodio(s, m) !== 'futuro') ?? null;

/** Ogni tentativo parte dalle variabili di prima del primo tentativo (D-062). */
export const iniziaEpisodio = (s: Salvataggio, m: Missione): InCorso => iniziaMissione(m, variabiliDiPartenza(s.episodi, m.id, s.variabili), dichiarate);

/**
 * Chiude un tentativo nel salvataggio. Le variabili della storia cambiano solo se il tentativo è il
 * nuovo migliore E l'episodio è l'ultimo superato (nessun episodio dopo è superato): così rigiocare un
 * episodio vecchio non costringe a ricalcolare quelli dopo (D-062). Un fallimento non cambia la storia.
 */
export function chiudiEpisodio(s: Salvataggio, m: Missione, e: EsitoMissione): { salvataggio: Salvataggio; risultato: Risultato; migliore: boolean } {
  const risultato = valutaEpisodio(m, e);
  const prima = variabiliDiPartenza(s.episodi, m.id, s.variabili);
  const { registro, migliore } = registra(s.episodi, m.id, prima, risultato, e.variabili);
  const ultimo = !missioni.some((x) => x.episodio > m.episodio && superato(registro, x.id));
  const concluse = migliore && !s.missioni_concluse.includes(m.id) ? [...s.missioni_concluse, m.id] : s.missioni_concluse;
  return {
    salvataggio: { ...s, episodi: registro, missioni_concluse: concluse, variabili: migliore && ultimo ? e.variabili : s.variabili, in_corso: null },
    risultato, migliore,
  };
}
