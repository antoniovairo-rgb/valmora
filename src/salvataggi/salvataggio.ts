// Formato del salvataggio e migrazioni retrocompatibili.
// Regola: ogni campo nuovo = SAVE_VERSION + 1 e una migrazione MIGRAZIONI[v] che porta v → v+1.
// Ogni versione vecchia deve avere almeno un salvataggio vero in tests/salvataggi-reali/
// (passo «salvataggi-reali» della catena logica).

export const SAVE_VERSION = 1;

export type ValoreVariabile = boolean | number | string;

export interface Salvataggio {
  save_version: number;
  /** GAME_VERSION che ha scritto il file: solo informativo, non guida la migrazione */
  game_version: string;
  /** seme della partita (D-006: tutto ciò che è riproducibile nasce da qui) */
  seme: number;
  /** stato del generatore casuale (caso.ts), per riprendere la stessa sequenza */
  caso: number;
  /** valori delle variabili narrative dichiarate in data/stato.json */
  variabili: Record<string, ValoreVariabile>;
  /** id delle missioni concluse, in ordine */
  missioni_concluse: string[];
}

type Grezzo = Record<string, unknown>;

/** MIGRAZIONI[v] trasforma un salvataggio v in v+1. Vuoto finché SAVE_VERSION = 1. */
export const MIGRAZIONI: Record<number, (s: Grezzo) => Grezzo> = {};

const isUint32 = (n: unknown): n is number => Number.isInteger(n) && (n as number) >= 0 && (n as number) <= 0xffffffff;

export function controllaSalvataggio(s: Grezzo): string[] {
  const p: string[] = [];
  if (s.save_version !== SAVE_VERSION) p.push(`save_version ${String(s.save_version)} invece di ${SAVE_VERSION}`);
  if (typeof s.game_version !== 'string') p.push('game_version mancante');
  if (!isUint32(s.seme)) p.push('seme non uint32');
  if (!isUint32(s.caso)) p.push('caso non uint32');
  const v = s.variabili;
  if (typeof v !== 'object' || v === null || Array.isArray(v)) p.push('variabili non è un oggetto');
  else for (const [k, x] of Object.entries(v)) if (!['boolean', 'number', 'string'].includes(typeof x)) p.push(`variabile ${k}: tipo ${typeof x}`);
  if (!Array.isArray(s.missioni_concluse) || s.missioni_concluse.some((m) => typeof m !== 'string')) p.push('missioni_concluse non è un elenco di id');
  return p;
}

/** Porta un salvataggio di qualunque versione nota alla versione corrente, o lancia un errore. */
export function migra(dati: unknown): Salvataggio {
  if (typeof dati !== 'object' || dati === null || Array.isArray(dati)) throw new Error('salvataggio non è un oggetto');
  let s = { ...(dati as Grezzo) };
  const v0 = s.save_version;
  if (!Number.isInteger(v0) || (v0 as number) < 1) throw new Error(`save_version non valida: ${String(v0)}`);
  if ((v0 as number) > SAVE_VERSION) throw new Error(`salvataggio di una versione futura (${String(v0)} > ${SAVE_VERSION})`);
  for (let v = v0 as number; v < SAVE_VERSION; v++) {
    const m = MIGRAZIONI[v];
    if (!m) throw new Error(`manca la migrazione ${v} → ${v + 1}`);
    s = { ...m(s), save_version: v + 1 };
  }
  const problemi = controllaSalvataggio(s);
  if (problemi.length) throw new Error(`salvataggio non valido: ${problemi.join('; ')}`);
  return s as unknown as Salvataggio;
}
