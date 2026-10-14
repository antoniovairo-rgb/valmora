// Folla della mappa aerea secondo gli eventi dell'ondata (S-11, PO-046): nessun dato nuovo, solo
// m.ondate[n].eventi (tipo + settore).
// - ondata di partita (eventi «curva»): spalti pieni, strade vuote;
// - prima della partita: spalti a metà, cortei solo sulle strade con un evento di gente in strada;
// - dopo la partita (evento «deflusso», o l'ondata dopo quella di partita): spalti che si svuotano e
//   cortei che escono dallo stadio.
// Rosso C11F01: come prima, corteo fisso sulla prima strada e spalti sempre pieni.
import { spento } from '../../interruttori.ts';
import type { Missione } from '../../logica/tipi.ts';

export type Spalti = 'pieni' | 'arrivo' | 'deflusso';
export interface Corteo { settore: string; verso: 'entra' | 'esce'; /** C-021: club dei tifosi dell'evento (dati), se c'è */ club?: string }
export interface Folla { spalti: Spalti; cortei: Corteo[]; /** C23-01: club dei tifosi per strada, dagli eventi dell'ondata (anche in partita) */ club?: Record<string, string> }

/** Eventi che vogliono dire gente che cammina in strada. */
const IN_STRADA = new Set(['corteo', 'arrivo', 'deflusso', 'folla', 'raduno', 'movimento', 'fuga']);

export function follaDellOndata(m: Missione, n: number): Folla {
  const strade = m.mappa.settori.filter((s) => s.tipo === 'strada').map((s) => s.id);
  if (spento('C11F01')) return { spalti: 'pieni', cortei: strade.slice(0, 1).map((settore) => ({ settore, verso: 'entra' })) };
  const eventi = m.ondate[n - 1]?.eventi ?? [];
  const partita = (k: number) => (m.ondate[k - 1]?.eventi ?? []).some((e) => e.tipo === 'curva');
  // C23-01: il club dell'evento vale per ogni gente in strada dell'ondata, anche per il corteo della chiamata. Rosso C53D01.
  const club = spento('C53D01') ? {} : Object.fromEntries(eventi.filter((e) => e.club && strade.includes(e.settore)).map((e) => [e.settore, e.club!]));
  if (partita(n)) return { spalti: 'pieni', cortei: [], club };
  const dopo = eventi.some((e) => e.tipo === 'deflusso') || m.ondate.slice(0, n - 1).some((o) => o.eventi.some((e) => e.tipo === 'curva'));
  const inStrada = eventi.filter((e) => IN_STRADA.has(e.tipo) && strade.includes(e.settore));
  // C-021: se un evento della strada dice di che club sono i tifosi, il corteo è di quel club. Rosso C49E01: no.
  const cortei = [...new Set(inStrada.map((e) => e.settore))]
    .map((settore): Corteo => {
      const club = spento('C49E01') ? undefined : inStrada.find((e) => e.settore === settore && e.club)?.club;
      return { settore, verso: dopo ? 'esce' : 'entra', ...(club ? { club } : {}) };
    });
  return { spalti: dopo ? 'deflusso' : 'arrivo', cortei, club };
}

/** C21-01: i token dei colori del corteo quando non si sa di chi sia: la stessa famiglia di grigi della folla. Prima era
 *  un arancio (--mappa-corteo-1) a ΔE 8 dal Cinderwick: la gente «neutra» sembrava del Cinderwick. Rosso C49C01. */
export const neutroCorteo = (): [string, string] => (spento('C49C01') ? ['--mappa-corteo-1', '--mappa-corteo-2'] : ['--mappa-folla-2', '--mappa-folla-3']);
