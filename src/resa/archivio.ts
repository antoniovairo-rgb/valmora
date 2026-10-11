// Salvataggio nel telefono (localStorage). Il formato e le migrazioni stanno in src/salvataggi.
import { migra, type Salvataggio } from '../salvataggi/salvataggio.ts';

const CHIAVE = 'valmora-salvataggio';

export function carica(): Salvataggio | null {
  try {
    const grezzo = localStorage.getItem(CHIAVE);
    return grezzo ? migra(JSON.parse(grezzo)) : null;
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
