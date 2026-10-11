// Generatore casuale con seme: UNICO punto di casualità della logica.
// Math.random è vietato in src/logica (guardiano «confini» della catena logica).
// Algoritmo: mulberry32 (stato a 32 bit). Lo stato è un intero serializzabile,
// quindi si salva e si riprende la sequenza esattamente dove era rimasta.

export interface Caso {
  /** numero in [0, 1) */
  numero(): number;
  /** intero in [min, max], estremi inclusi */
  intero(min: number, max: number): number;
  /** elemento della lista, scelto con probabilità uniforme */
  scegli<T>(lista: readonly T[]): T;
  /** stato corrente (uint32) da mettere nel salvataggio */
  stato(): number;
}

/** Un passo puro: dallo stato al valore e allo stato successivo. */
export function passo(stato: number): { valore: number; stato: number } {
  const s = (stato + 0x6d2b79f5) >>> 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const valore = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { valore, stato: s };
}

/** Riduce un seme qualsiasi (intero o stringa) a uno stato uint32. */
export function statoDaSeme(seme: number | string): number {
  if (typeof seme === 'number') {
    if (!Number.isInteger(seme)) throw new Error(`seme non intero: ${seme}`);
    return seme >>> 0;
  }
  let h = 2166136261; // FNV-1a
  for (let i = 0; i < seme.length; i++) h = Math.imul(h ^ seme.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Riprende un generatore da uno stato salvato. */
export function daStato(stato: number): Caso {
  let s = stato >>> 0;
  const numero = (): number => {
    const p = passo(s);
    s = p.stato;
    return p.valore;
  };
  return {
    numero,
    intero(min, max) {
      if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) throw new Error(`intervallo non valido [${min}, ${max}]`);
      return min + Math.floor(numero() * (max - min + 1));
    },
    scegli(lista) {
      if (lista.length === 0) throw new Error('scegli: lista vuota');
      return lista[Math.floor(numero() * lista.length)] as (typeof lista)[number];
    },
    stato: () => s,
  };
}

export const creaCaso = (seme: number | string): Caso => daStato(statoDaSeme(seme));
