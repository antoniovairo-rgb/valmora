// Bilancio di fine episodio (D-085, PO-036): «cosa ha aiutato, cosa ha pesato, perché queste stelle».
// Puro: legge le scelte fatte, i rapporti delle ondate e le condizioni delle stelle. Nessun testo: la resa
// traduce settori, risorse e variabili con le sue etichette. Rosso: __NO_C10B01 (bilancio vuoto).
// C38-03 (D-172): con il confronto (src/logica/confronto.ts) aiuto o peso si decide contro le altre risposte della stessa
// chiamata, non col saldo degli effetti della sola risposta. Rosso __NO_C38B01: di nuovo il saldo locale.
import { valuta } from './condizioni.ts';
import type { Confronto } from './confronto.ts';
import { spento } from '../interruttori.ts';
import type { EsitoMissione } from './missione.ts';
import type { Condizione, EffettoMissione, Missione, Valore, Variabili } from './tipi.ts';

export interface Impatto { tipo: 'credito' | 'pressione' | 'tensione' | 'riserva'; dove?: string; valore: number; buono: boolean }
export interface VoceScelta { ondata: number; chiamata: string; opzione: string; impatti: Impatto[]; saldo: number; confronto?: Confronto }
export interface Scoperto { ondata: number; settore: string; scoperto: number; tensione: number }
export interface Requisito { var: string; confronto: 'almeno' | 'al_massimo' | 'uguale' | 'altro'; soglia?: Valore; valore?: Valore; ok: boolean }
export interface Bilancio { aiuti: VoceScelta[]; pesi: VoceScelta[]; scoperti: Scoperto[]; stelle: { due: Requisito[]; tre: Requisito[] } }

// Peso di ogni effetto nel saldo di una scelta: positivo = ti ha aiutato.
function impatto(e: EffettoMissione): Impatto | null {
  if ('tensione' in e) return { tipo: 'tensione', dove: e.tensione, valore: e.valore, buono: e.valore < 0 };
  if ('pressione' in e) return { tipo: 'pressione', dove: e.pressione, valore: e.valore, buono: e.valore < 0 };
  if ('riserva' in e) return { tipo: 'riserva', dove: e.riserva, valore: e.valore, buono: e.valore > 0 };
  if ('aggiungi' in e && e.aggiungi === 'credito') return { tipo: 'credito', valore: e.valore, buono: e.valore > 0 };
  return null; // le variabili della storia non sono né buone né cattive: sono storia
}
const PESO = { credito: 1, pressione: 1, tensione: 1.5, riserva: 1 } as const;
/** C38-03: sotto questo saldo del confronto (punti di fallite + tacche di tensione) la risposta non ha aiutato né pesato.
 *  Misurato (stabilita-confronto.mjs): con 200 partite e soglia 5, aiuto↔peso opposto al riferimento di 800 in 3/1012. */
export const SOGLIA_CONFRONTO = 5;
const punti = (i: Impatto) => PESO[i.tipo] * Math.abs(i.valore) * (i.buono ? 1 : -1);

/** Le condizioni di una stella, una per riga, con il valore che hai ottenuto. */
export function requisiti(c: Condizione, v: Variabili): Requisito[] {
  if ('tutte' in c) return c.tutte.flatMap((x) => requisiti(x, v));
  if (!('var' in c)) return Object.keys(c).length ? [{ var: '?', confronto: 'altro', ok: valuta(c, v) }] : [];
  const confronto = 'almeno' in c ? 'almeno' : 'al_massimo' in c ? 'al_massimo' : 'uguale';
  const soglia = 'almeno' in c ? c.almeno : 'al_massimo' in c ? c.al_massimo : c.uguale;
  return [{ var: c.var, confronto, soglia, valore: v[c.var], ok: valuta(c, v) }];
}

export function bilancio(m: Missione, r: EsitoMissione, quante = 3, confronto?: Map<string, Confronto>): Bilancio {
  const stelle = { due: requisiti(m.stelle.due, r.variabili), tre: requisiti(m.stelle.tre, r.variabili) };
  if (spento('C10B01')) return { aiuti: [], pesi: [], scoperti: [], stelle };
  const opzioni = new Map(m.ondate.flatMap((o) => (o.chiamate ?? []).flatMap((c) => c.opzioni.map((x) => [`${c.id}/${x.id}`, x] as const))));
  const conConfronto = confronto && !spento('C38B01');
  const voci: VoceScelta[] = r.scelte.map((s) => {
    const impatti = (opzioni.get(`${s.chiamata}/${s.opzione}`)?.effetti ?? []).map(impatto).filter((x): x is Impatto => !!x);
    if (!conConfronto) return { ...s, impatti, saldo: impatti.reduce((t, i) => t + punti(i), 0) };
    const c = confronto.get(`${s.chiamata}/${s.opzione}`); // senza alternative giocate: né aiuto né peso
    const saldo = c && Math.abs(c.saldo) >= SOGLIA_CONFRONTO ? c.saldo : 0;
    return { ...s, impatti, saldo, ...(c ? { confronto: c } : {}) };
  });
  const scoperti = r.rapporti.flatMap((x) => Object.entries(x.scoperto).filter(([, n]) => n > 0)
    .map(([settore, n]) => ({ ondata: x.n, settore, scoperto: n, tensione: x.tensione[settore] ?? 0 })));
  return {
    aiuti: voci.filter((x) => x.saldo > 0).sort((a, b) => b.saldo - a.saldo).slice(0, quante),
    pesi: voci.filter((x) => x.saldo < 0).sort((a, b) => a.saldo - b.saldo).slice(0, quante),
    scoperti: scoperti.sort((a, b) => b.scoperto - a.scoperto || a.ondata - b.ondata).slice(0, quante),
    stelle,
  };
}
