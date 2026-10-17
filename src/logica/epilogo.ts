// Epilogo della campagna (D-161) e passo «Fine stagione» (D-164). Puro: legge variabili, registro e missioni.
// - Fili: le variabili di storia che una scelta imposta e un episodio dopo legge (D-100 e quelle di prima).
//   Dove un filo si apre e dove pesa ancora si ricava dai dati delle missioni («imposta»/«aggiungi» e «var»),
//   non da un elenco scritto a mano: a fine stagione N un filo è aperto se un episodio di una stagione dopo lo legge.
// - Carriera: dall'esito migliore dell'ultimo episodio (prima parte dell'id: confermato, prorogato, sostituito).
import { completaVariabili } from './aggiornamento.ts';
import type { Registro } from './episodi.ts';
import type { Dichiarazione, Missione, Valore, Variabili } from './tipi.ts';

/** Fili di storia nell'ordine in cui si mostrano; EPILOGO = le sei scelte di D-100 nominate da D-161. */
export const FILI = ['informatore_pagato', 'presidente_incontrato', 'furgone_visto', 'rapporto_dessi', 'testimone', 'busta', 'pista_cattura', 'fascicolo', 'sospetti_talpa'] as const;
export const EPILOGO = ['rapporto_dessi', 'testimone', 'busta', 'pista_cattura', 'fascicolo', 'sospetti_talpa'] as const;
export const CARRIERE = ['confermato', 'prorogato', 'sostituito'] as const;

export interface Filo { id: string; valore: Valore; aperto: boolean; /** episodio di una stagione dopo che lo legge */ pesa_su: string | null }
export interface Stagione { stagione: number; stelle: number; massimo: number; superati: number; episodi: number }
export interface FineStagione extends Stagione { aperti: Filo[]; chiusi: Filo[] }
export interface Epilogo { carriera: (typeof CARRIERE)[number] | null; esito: string | null; scelte: Filo[]; stagioni: Stagione[]; stelle: number; massimo: number }

type Uso = { imposta: Missione[]; legge: Missione[] };

/** Quali missioni impostano e quali leggono ogni variabile (visita di tutto il JSON della missione). */
export function usiDelleVariabili(missioni: Missione[]): Map<string, Uso> {
  const usi = new Map<string, Uso>();
  const uso = (id: string) => usi.get(id) ?? (usi.set(id, { imposta: [], legge: [] }), usi.get(id)!);
  const segna = (xs: Missione[], m: Missione) => { if (!xs.includes(m)) xs.push(m); };
  const giu = (x: unknown, m: Missione): void => {
    if (Array.isArray(x)) { for (const y of x) giu(y, m); return; }
    if (typeof x !== 'object' || x === null) return;
    const o = x as Record<string, unknown>;
    if (typeof o.var === 'string') segna(uso(o.var).legge, m);
    for (const k of ['imposta', 'aggiungi']) if (typeof o[k] === 'string') segna(uso(o[k] as string).imposta, m);
    for (const v of Object.values(o)) giu(v, m);
  };
  for (const m of missioni) giu(m, m);
  return usi;
}

const ordina = (missioni: Missione[]) => [...missioni].sort((a, b) => a.episodio - b.episodio);

function stagioneDi(missioni: Missione[], reg: Registro, n: number): Stagione {
  const ms = missioni.filter((m) => m.stagione === n);
  const superati = ms.filter((m) => reg[m.id]?.migliore);
  return { stagione: n, episodi: ms.length, superati: superati.length, massimo: 3 * ms.length, stelle: superati.reduce((s, m) => s + (reg[m.id]?.migliore?.stelle ?? 0), 0) };
}

/** L'episodio con cui finisce la stagione di m, se m è quello (e non è l'ultima stagione: lì c'è l'epilogo). */
export function chiudeStagione(missioni: Missione[], m: Missione): boolean {
  const ms = ordina(missioni);
  const ultima = ms.at(-1)?.stagione;
  return m.stagione !== ultima && ms.filter((x) => x.stagione === m.stagione).at(-1)?.id === m.id;
}

export const ultimoEpisodio = (missioni: Missione[]) => ordina(missioni).at(-1) ?? null;

/** Riepilogo a fine stagione n: stelle della stagione e fili già aperti, divisi fra quelli che pesano ancora e no. */
export function fineStagione(missioni: Missione[], reg: Registro, variabili: Variabili, dich: Iterable<Dichiarazione>, n: number): FineStagione {
  const v = completaVariabili(variabili, dich);
  const usi = usiDelleVariabili(missioni);
  const fili: Filo[] = [];
  for (const id of FILI) {
    const u = usi.get(id);
    if (!u || !u.imposta.some((m) => m.stagione <= n) || !(id in v)) continue; // filo non ancora aperto
    const dopo = ordina(u.legge).find((m) => m.stagione > n) ?? null;
    fili.push({ id, valore: v[id]!, aperto: !!dopo, pesa_su: dopo?.id ?? null });
  }
  return { ...stagioneDi(missioni, reg, n), aperti: fili.filter((f) => f.aperto), chiusi: fili.filter((f) => !f.aperto) };
}

/** Epilogo dopo l'ultimo episodio: le sei scelte, la carriera e le stelle di ogni stagione. */
export function epilogo(missioni: Missione[], reg: Registro, variabili: Variabili, dich: Iterable<Dichiarazione>): Epilogo {
  const v = completaVariabili(variabili, dich);
  const ultimo = ultimoEpisodio(missioni);
  const esito = ultimo ? reg[ultimo.id]?.migliore?.esito ?? null : null;
  const prima = esito?.split('_')[0];
  const carriera = CARRIERE.find((c) => c === prima) ?? null;
  const stagioni = [...new Set(missioni.map((m) => m.stagione))].sort((a, b) => a - b).map((n) => stagioneDi(missioni, reg, n));
  return {
    esito, carriera, stagioni,
    scelte: EPILOGO.filter((id) => id in v).map((id) => ({ id, valore: v[id]!, aperto: false, pesa_su: null })),
    stelle: stagioni.reduce((s, x) => s + x.stelle, 0), massimo: stagioni.reduce((s, x) => s + x.massimo, 0),
  };
}

/** Chiave del testo che racconta il valore di un filo: «epilogo.<id>.<valore>». */
export const chiaveFilo = (f: Pick<Filo, 'id' | 'valore'>) => `epilogo.${f.id}.${String(f.valore)}`;
