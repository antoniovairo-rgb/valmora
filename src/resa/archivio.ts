// Salvataggio nel telefono (localStorage). Il formato e le migrazioni stanno in src/salvataggi.
// S-20 (PO-073): copia di riserva dell'ultimo salvataggio buono sotto una seconda chiave; se il principale è
// illeggibile si riprende dalla copia (e la home lo dice); esporta e importa la partita come file .json.
import { spento } from '../interruttori.ts';
import { migra, type Salvataggio } from '../salvataggi/salvataggio.ts';

const CHIAVE = 'valmora-salvataggio';
const RISERVA = 'valmora-salvataggio-riserva';

/** Vero se l'ultimo carica() ha dovuto usare la copia di riserva (avviso in home). */
export let dallaRiserva = false;

export function carica(): Salvataggio | null {
  dallaRiserva = false;
  let grezzo: string | null = null;
  try {
    grezzo = localStorage.getItem(CHIAVE);
    return grezzo ? migra(JSON.parse(grezzo)) : null;
  } catch (e) {
    console.warn(`salvataggio illeggibile: ${(e as Error).message}`);
  }
  // Rosso C19S01: come prima, si riparte da capo.
  if (spento('C19S01')) return null;
  try {
    const copia = localStorage.getItem(RISERVA);
    if (!copia) return null;
    const s = migra(JSON.parse(copia));
    dallaRiserva = true;
    localStorage.setItem(CHIAVE, copia); // il principale torna buono
    return s;
  } catch (e) {
    console.warn(`anche la copia di riserva è illeggibile, si riparte: ${(e as Error).message}`);
    return null;
  }
}

export function salva(s: Salvataggio): void {
  try {
    const testo = JSON.stringify(s);
    localStorage.setItem(CHIAVE, testo);
    localStorage.setItem(RISERVA, testo); // s viene dal gioco: è buono per costruzione
  } catch (e) { console.warn(`salvataggio non riuscito: ${(e as Error).message}`); }
}

const oggi = () => new Date().toISOString().slice(0, 10);
export const nomeFile = () => `valmora-${oggi()}.json`;

/** Scarica il salvataggio come file .json (nessuna dipendenza: un link «download» su un Blob). */
export function esporta(s: Salvataggio): void {
  const url = URL.createObjectURL(new Blob([JSON.stringify(s, null, 1)], { type: 'application/json' }));
  const a = document.createElement('a');
  a.href = url; a.download = nomeFile(); a.rel = 'noopener';
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Legge un file di salvataggio e lo fa passare da migra(): se non è valido, errore con il motivo. */
export async function importa(file: File): Promise<Salvataggio> {
  const testo = await file.text();
  let dati: unknown;
  try { dati = JSON.parse(testo); } catch { throw new Error('non è un file di salvataggio (JSON non leggibile)'); }
  return migra(dati);
}

export function nuovoSeme(): number {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a); // il seme nasce qui una volta; da lì in poi tutto è deterministico
  return a[0]!;
}
