// Formato del salvataggio e migrazioni retrocompatibili.
// Regola: ogni campo nuovo = SAVE_VERSION + 1 e una migrazione MIGRAZIONI[v] che porta v → v+1.
// Ogni versione vecchia deve avere almeno un salvataggio vero in tests/salvataggi-reali/
// (passo «salvataggi-reali» della catena logica).
import type { InCorso } from '../logica/missione.ts';

// 2 – in_corso diventa lo stato della missione a scene (missione.ts, D-053); i v1 ripartono dalla missione.
export const SAVE_VERSION = 2;

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
  /** missione interrotta, salvata dopo ogni passo (schieramento, chiamata, ondata), o null (D-040) */
  in_corso: InCorso | null;
}

type Grezzo = Record<string, unknown>;

/** MIGRAZIONI[v] trasforma un salvataggio v in v+1. */
export const MIGRAZIONI: Record<number, (s: Grezzo) => Grezzo> = {
  // v1 → v2: la missione interrotta del motore 0.1.0 (ondate giocate) non ha equivalente nel motore a
  // scene; si butta e la missione riparte dal briefing. Variabili e missioni concluse restano.
  1: (s) => ({ ...s, in_corso: null }),
};

const oggetto = (x: unknown): x is Grezzo => typeof x === 'object' && x !== null && !Array.isArray(x);

function controllaInCorso(ic: Grezzo): string[] {
  const p: string[] = [];
  if (typeof ic.missione !== 'string') p.push('in_corso.missione non è un id');
  if (!Number.isInteger(ic.ondata) || (ic.ondata as number) < 1) p.push('in_corso.ondata non è un intero ≥ 1');
  for (const k of ['tensione', 'riserva', 'riposo', 'modifiche', 'risposte', 'variabili']) if (!oggetto(ic[k])) p.push(`in_corso.${k} non è un oggetto`);
  if (ic.disposizione !== null && !oggetto(ic.disposizione)) p.push('in_corso.disposizione non è un oggetto né null');
  for (const k of ['scelte', 'rapporti']) if (!Array.isArray(ic[k])) p.push(`in_corso.${k} non è un elenco`);
  return p;
}

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
  const ic = s.in_corso as Grezzo | null | undefined;
  if (ic === undefined) p.push('in_corso mancante');
  else if (ic !== null) {
    const q = oggetto(ic) ? controllaInCorso(ic) : ['in_corso non è un oggetto'];
    if (q.length) p.push(`in_corso malformato (${q.join(', ')})`);
  }
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
