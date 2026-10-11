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
export interface Corteo { settore: string; verso: 'entra' | 'esce' }
export interface Folla { spalti: Spalti; cortei: Corteo[] }

/** Eventi che vogliono dire gente che cammina in strada. */
const IN_STRADA = new Set(['corteo', 'arrivo', 'deflusso', 'folla', 'raduno', 'movimento', 'fuga']);

export function follaDellOndata(m: Missione, n: number): Folla {
  const strade = m.mappa.settori.filter((s) => s.tipo === 'strada').map((s) => s.id);
  if (spento('C11F01')) return { spalti: 'pieni', cortei: strade.slice(0, 1).map((settore) => ({ settore, verso: 'entra' })) };
  const eventi = m.ondate[n - 1]?.eventi ?? [];
  const partita = (k: number) => (m.ondate[k - 1]?.eventi ?? []).some((e) => e.tipo === 'curva');
  if (partita(n)) return { spalti: 'pieni', cortei: [] };
  const dopo = eventi.some((e) => e.tipo === 'deflusso') || m.ondate.slice(0, n - 1).some((o) => o.eventi.some((e) => e.tipo === 'curva'));
  const cortei = [...new Set(eventi.filter((e) => IN_STRADA.has(e.tipo) && strade.includes(e.settore)).map((e) => e.settore))]
    .map((settore): Corteo => ({ settore, verso: dopo ? 'esce' : 'entra' }));
  return { spalti: dopo ? 'deflusso' : 'arrivo', cortei };
}
