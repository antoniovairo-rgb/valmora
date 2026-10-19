// Dove si trova il giocatore dentro una missione: si ricava SOLO dallo stato salvato (InCorso),
// così una ricarica a metà ondata riporta esattamente alla stessa scena.
import { spento } from '../interruttori.ts';
import { chiamateAperte, DEGENERA, missioneFinita, type InCorso } from '../logica/missione.ts';
import type { Chiamata, Condizione, Esito, Missione } from '../logica/tipi.ts';

export type Fase =
  | { tipo: 'schieramento' }
  | { tipo: 'chiamata'; chiamata: Chiamata; numero: number; totale: number }
  | { tipo: 'chiusura' }      // schierati, chiamate finite: l'ondata si chiude col rapporto
  | { tipo: 'fine' };         // tutte le ondate chiuse: resta il rapporto finale, poi il verbale

export function faseDi(m: Missione, s: InCorso): Fase {
  if (missioneFinita(m, s)) return { tipo: 'fine' };
  if (!s.disposizione) return { tipo: 'schieramento' };
  const aperte = chiamateAperte(m, s);
  const risposte = Object.keys(s.risposte).length;
  if (aperte.length) return { tipo: 'chiamata', chiamata: aperte[0]!, numero: risposte + 1, totale: risposte + aperte.length };
  return { tipo: 'chiusura' };
}

/** Livello di colore 0-5 per una tensione di settore 0-10 (D-055: si mostra il colore, mai il numero). */
export const livello = (tensione: number): number => (tensione <= 0 ? 0 : Math.min(5, Math.ceil(tensione / 2)));

/** PO-101: la riga «i» dell'ondata n («eXX.ondataN.i» dei dati, dalla chiave del titolo); null se manca: niente icona.
 *  Rosso C43I01: mai. */
export const infoOndata = (m: Missione, n: number, testo: (k: string) => string | null): string | null => {
  const o = m.ondate[n - 1];
  return o && !spento('C43I01') ? testo(`${(o.titolo ?? `testi:${m.id}.ondata${o.n}`).replace(/^testi:/, '')}.i`) : null;
};

/** C17-05: lo stato di un settore nel rapporto. Coperto ma a tensione da degenerato (≥ DEGENERA) non è «sotto
 *  controllo» e basta: è «caldo». Rosso C42C01: solo «scoperto» o «sotto controllo», come prima. */
export const statoSettore = (tensione: number, scoperto: boolean): 'scoperto' | 'caldo' | 'controllo' =>
  (scoperto ? 'scoperto' : tensione >= DEGENERA && !spento('C42C01') ? 'caldo' : 'controllo');

/** Tono dell'esito: il primo della lista è il migliore, l'ultimo il peggiore (ordine dei dati). Le versioni di un
 *  esito («confermato_procura» di «confermato», D-106) hanno il tono dell'esito di cui sono versione.
 *  Rosso C24T01: solo la posizione, e «Confermato» con procura/stampa/comando esce col colore medio. */
export function tono(m: Missione, e: Esito): 'bene' | 'medio' | 'male' {
  // versione = id dell'esito + «_» + un valore che la sua condizione confronta con «uguale» (es. fascicolo = procura)
  const valori = (c: Condizione): string[] => ('tutte' in c ? c.tutte.flatMap(valori) : 'almeno_una' in c ? c.almeno_una.flatMap(valori)
    : 'uguale' in c && typeof c.uguale === 'string' ? [c.uguale] : []);
  const base = (q: Esito) => { const v = spento('C24T01') ? undefined : valori(q.se).find((x) => q.id.endsWith(`_${x}`) && m.esiti.some((z) => z.id === q.id.slice(0, -x.length - 1)));
    return m.esiti.findIndex((x) => x.id === (v ? q.id.slice(0, -v.length - 1) : q.id)); };
  const i = base(e);
  // C41-07: «male» è anche l'esito più basso fra quelli non falliti (l'ultimo esito dei dati è sempre il fallito, 36/36),
  // così la posa «male» del verbale compare in partita. Rosso C41T07: solo il fallito e l'ultimo, come prima.
  const peggiore = spento('C41T07') ? m.esiti.length - 1 : Math.max(...m.esiti.filter((x) => !x.fallita).map(base));
  if (e.fallita || i === m.esiti.length - 1) return 'male';
  return i === 0 ? 'bene' : i === peggiore ? 'male' : 'medio';
}

/**
 * Peso di una scelta per il verbale (C-005 R03, PROGETTO_E01_V2 §4): somma dei valori assoluti dei suoi
 * effetti su tensione e pressione dei settori e sul credito. Rinforzi e variabili della storia non contano.
 */
export function pesoScelta(m: Missione, x: InCorso['scelte'][number]): number {
  const o = sceltaLeggibile(m, x).opzione;
  return (o?.effetti ?? []).reduce((a, e) => {
    if ('tensione' in e || 'pressione' in e) return a + Math.abs(e.valore);
    if (('aggiungi' in e && e.aggiungi === 'credito') || ('imposta' in e && e.imposta === 'credito')) return a + Math.abs(Number(e.valore) || 0);
    return a;
  }, 0);
}

/** Le scelte che hanno pesato di più: al massimo «quante», peso > 0, a parità di peso la prima fatta. */
export function scelteDecisive(m: Missione, scelte: InCorso['scelte'], quante = 3) {
  return scelte.map((x, i) => ({ x, i, peso: pesoScelta(m, x) })).filter((s) => s.peso > 0)
    .sort((a, b) => b.peso - a.peso || a.i - b.i).slice(0, quante).sort((a, b) => a.i - b.i).map((s) => s.x);
}

/** Testi della chiamata e dell'opzione scelta, per il verbale. */
export function sceltaLeggibile(m: Missione, x: InCorso['scelte'][number]) {
  const c = m.ondate[x.ondata - 1]?.chiamate?.find((k) => k.id === x.chiamata);
  return { chiamata: c, opzione: c?.opzioni.find((o) => o.id === x.opzione) };
}
