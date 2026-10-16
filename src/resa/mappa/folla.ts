// Folla della mappa aerea secondo gli eventi dell'ondata (S-11, PO-046): nessun dato nuovo, solo
// m.ondate[n].eventi (tipo + settore).
// - ondata di partita (eventi «curva»): spalti pieni, strade vuote;
// - prima della partita: spalti a metà, cortei solo sulle strade con un evento di gente in strada;
// - dopo la partita (evento «deflusso», o l'ondata dopo quella di partita): spalti che si svuotano e
//   cortei che escono dallo stadio.
// Rosso C11F01: come prima, corteo fisso sulla prima strada e spalti sempre pieni.
import { spento } from '../../interruttori.ts';
import type { Missione } from '../../logica/tipi.ts';

export type Spalti = 'pieni' | 'arrivo' | 'deflusso' | 'vuoti';
export interface Corteo { settore: string; verso: 'entra' | 'esce'; /** C-021: club dei tifosi dell'evento (dati), se c'è */ club?: string }
export interface Folla { spalti: Spalti; cortei: Corteo[]; /** C23-01: club dei tifosi per strada, dagli eventi dell'ondata (anche in partita) */ club?: Record<string, string> }

/** Eventi che vogliono dire gente che cammina in strada. */
const IN_STRADA = new Set(['corteo', 'arrivo', 'deflusso', 'folla', 'raduno', 'movimento', 'fuga']);

export function follaDellOndata(m: Missione, n: number): Folla {
  const strade = m.mappa.settori.filter((s) => s.tipo === 'strada').map((s) => s.id);
  if (spento('C11F01')) return { spalti: 'pieni', cortei: strade.slice(0, 1).map((settore) => ({ settore, verso: 'entra' })) };
  const eventi = m.ondate[n - 1]?.eventi ?? [];
  // C27-04: se i dati dicono la fase dell'ondata («prima», «partita», «dopo»), vale quella; senza, la partita si ricava
  // dagli eventi «curva» come prima (e07 non ne ha: la partita non c'era mai). Rosso C84F01: «fase» ignorata.
  const fase = (k: number) => (spento('C84F01') ? undefined : (m.ondate[k - 1] as { fase?: 'prima' | 'partita' | 'dopo' } | undefined)?.fase);
  const partita = (k: number) => (fase(k) ? fase(k) === 'partita' : (m.ondate[k - 1]?.eventi ?? []).some((e) => e.tipo === 'curva'));
  // C23-01: il club dell'evento vale per ogni gente in strada dell'ondata, anche per il corteo della chiamata. Rosso C53D01.
  const club = spento('C53D01') ? {} : Object.fromEntries(eventi.filter((e) => e.club && strade.includes(e.settore)).map((e) => [e.settore, e.club!]));
  if (partita(n)) return { spalti: 'pieni', cortei: [], club };
  // C24-07: episodio senza curve (e04, e11, e17, e30, e35): lo stadio, se c'è, è disegnato vuoto (S-25); gli spalti non
  // sono «in arrivo». Rosso C67S01: «arrivo», come prima.
  const senzaCurve = !m.mappa.settori.some((s) => s.tipo === 'curva') && !spento('C67S01');
  const dopo = fase(n) ? fase(n) === 'dopo' : eventi.some((e) => e.tipo === 'deflusso') || m.ondate.slice(0, n - 1).some((_, k) => partita(k + 1));
  const inStrada = eventi.filter((e) => IN_STRADA.has(e.tipo) && strade.includes(e.settore));
  // C-021: se un evento della strada dice di che club sono i tifosi, il corteo è di quel club. Rosso C49E01: no.
  const cortei = [...new Set(inStrada.map((e) => e.settore))]
    .map((settore): Corteo => {
      const club = spento('C49E01') ? undefined : inStrada.find((e) => e.settore === settore && e.club)?.club;
      // D-127 (C24-07): se i dati dicono il verso del corteo, vale quello; altrimenti lo decide la partita. Rosso C73V01: no.
      const scritto = spento('C73V01') ? undefined : inStrada.find((e) => e.settore === settore && e.verso)?.verso;
      const verso = scritto ? (scritto === 'dallo_stadio' ? 'esce' : 'entra') : dopo ? 'esce' : 'entra';
      return { settore, verso, ...(club ? { club } : {}) };
    });
  return { spalti: senzaCurve ? 'vuoti' : dopo ? 'deflusso' : 'arrivo', cortei, club };
}

/** C21-01: i token dei colori del corteo quando non si sa di chi sia: la stessa famiglia di grigi della folla. Prima era
 *  un arancio (--mappa-corteo-1) a ΔE 8 dal Cinderwick: la gente «neutra» sembrava del Cinderwick. Rosso C49C01. */
export const neutroCorteo = (): [string, string] => (spento('C49C01') ? ['--mappa-corteo-1', '--mappa-corteo-2'] : ['--mappa-folla-2', '--mappa-folla-3']);

/** C27-01: il corteo della chiamata va nello stesso verso del corteo dell'ondata sulla sua strada (D-127); senza corteo
 *  dell'ondata, come prima: via dallo stadio solo a partita finita. Rosso C74D01: solo la partita, come prima. */
export const esceDinamica = (f: Folla, settore: string): boolean => {
  const c = spento('C74D01') ? undefined : f.cortei.find((x) => x.settore === settore);
  return c ? c.verso === 'esce' : f.spalti === 'deflusso';
};
