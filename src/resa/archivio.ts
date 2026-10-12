// Salvataggio nel telefono (localStorage). Il formato e le migrazioni stanno in src/salvataggi.
import { completaPartita, riparaInCorso } from '../logica/aggiornamento.ts';
import { migra, type Salvataggio } from '../salvataggi/salvataggio.ts';
import { dichiarate, missioni } from './dati.ts';

const CHIAVE = 'valmora-salvataggio';

export const AVVISO_RIPARTE = 'Il gioco è stato aggiornato: l\'episodio riparte dall\'inizio.';
export const AVVISO_SPARITO = 'Il gioco è stato aggiornato: l\'episodio interrotto non c\'è più, si riparte dalla città.';

/**
 * Adatta un salvataggio ai dati di gioco attuali (C-014): completa le variabili dichiarate dopo (C14-03) e
 * fa ripartire un episodio in corso che nomina cose sparite (C14-02). Mai un'eccezione verso la resa: se
 * l'adattamento fallisce, l'episodio in corso si lascia e si torna alla città.
 */
export function adattaAiDati(s: Salvataggio): { salvataggio: Salvataggio; avviso: string | null } {
  try {
    const { salvataggio, motivi } = riparaInCorso(completaPartita(s, dichiarate.values()), missioni, dichiarate);
    if (!motivi.length) return { salvataggio, avviso: null };
    console.warn(`episodio in corso incompatibile coi dati attuali: ${motivi.join('; ')}`);
    return { salvataggio, avviso: salvataggio.in_corso ? AVVISO_RIPARTE : AVVISO_SPARITO };
  } catch (e) {
    console.warn(`adattamento non riuscito, episodio in corso lasciato: ${(e as Error).message}`);
    return { salvataggio: { ...s, in_corso: null, rapporto_aperto: null }, avviso: AVVISO_SPARITO };
  }
}

/** Avviso dell'ultimo caricamento (da mostrare in home), o null. */
let avvisoCaricamento: string | null = null;
export const ultimoAvviso = () => avvisoCaricamento;

export function carica(): Salvataggio | null {
  try {
    const grezzo = localStorage.getItem(CHIAVE);
    if (!grezzo) return null;
    const { salvataggio, avviso } = adattaAiDati(migra(JSON.parse(grezzo)));
    avvisoCaricamento = avviso;
    if (avviso) salva(salvataggio); // l'avviso compare una volta sola: il salvataggio riparato è già scritto
    return salvataggio;
  } catch (e) {
    console.warn(`salvataggio illeggibile, si riparte: ${(e as Error).message}`);
    return null;
  }
}

export function salva(s: Salvataggio): void {
  try { localStorage.setItem(CHIAVE, JSON.stringify(s)); } catch (e) { console.warn(`salvataggio non riuscito: ${(e as Error).message}`); }
}

export function nuovoSeme(): number {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a); // il seme nasce qui una volta; da lì in poi tutto è deterministico
  return a[0]!;
}

