// D-241 (PO-152, idea D): ogni partita diversa. Il seme di partita (InCorso.seme) sceglie, per ogni ondata:
// - quale imprevisto del mazzo arriva (le carte dell'ondata, src/dati/imprevisti.ts) e dopo quante chiamate, dentro la
//   «finestra» dichiarata nei dati;
// - per ogni chiamata che ha una variante, quale delle due si gioca (stessi effetti, altro racconto).
// Puro e deterministico: lo stesso seme dà la stessa partita, al carattere. Ogni scelta usa un generatore suo
// (seme, episodio, ondata, cosa), così aggiungere una variante non sposta l'imprevisto.
// Seme 0 = partita classica: la carta classica al suo posto «dopo», nessuna variante (i salvataggi di prima della 0.53
// migrano qui e riprendono la stessa partita). Rosso __NO_C241D01: il seme non conta, tutte le partite sono la classica.
import { creaCaso, statoDaSeme } from './caso.ts';
import { spento } from '../interruttori.ts';
import type { Chiamata, Missione } from './tipi.ts';

export const SEME_CLASSICO = 0;
type Ondata = Missione['ondate'][number];

/** Un seme di partita da una chiave qualsiasi; mai 0 (riservato alla partita classica). */
export const semeDa = (chiave: string): number => statoDaSeme(chiave) || 1;
/** All'avvio di un episodio: dal seme del salvataggio, dall'episodio e dal numero del tentativo. */
export const semeEpisodio = (semeSalvataggio: number, episodio: string, tentativi: number): number => semeDa(`episodio:${semeSalvataggio}:${episodio}:${tentativi}`);
/** A ogni ripartenza da un'ondata (PO-060): un seme nuovo, derivato da quello della partita persa. */
export const semeRipartenza = (seme: number, ondata: number): number => semeDa(`ripartenza:${seme}:${ondata}`);

const memo = new WeakMap<Ondata, Map<number, Chiamata[]>>();

/** Le chiamate dell'ondata in questa partita, in ordine: le varianti scelte, una carta del mazzo al suo posto. */
export function chiamateDellaPartita(m: Missione, o: Ondata, seme = SEME_CLASSICO): Chiamata[] {
  const tutte = o.chiamate ?? [];
  if (!seme || spento('C241D01')) return tutte.filter((c) => !c.variante_di && !c.carta);
  let perSeme = memo.get(o);
  if (!perSeme) memo.set(o, (perSeme = new Map()));
  const fatta = perSeme.get(seme);
  if (fatta) return fatta;
  const caso = (cosa: string) => creaCaso(`partita:${seme}:${m.id}:${o.n}:${cosa}`);
  const base = tutte.filter((c) => !c.imprevisto && !c.variante_di).map((c) => {
    const alt = tutte.filter((x) => x.variante_di === c.id);
    return alt.length ? caso(`variante:${c.id}`).scegli([c, ...alt]) : c;
  });
  const x = cartaDellaPartita(m, o, seme);
  if (x) base.splice(Math.min(base.length, x.dopo), 0, x.carta);
  perSeme.set(seme, base);
  return base;
}

/** La carta del mazzo di questa partita e dopo quante chiamate arriva (dentro la sua finestra); null senza mazzo. */
export function cartaDellaPartita(m: Missione, o: Ondata, seme: number): { carta: Chiamata; dopo: number } | null {
  const carte = (o.chiamate ?? []).filter((c) => c.imprevisto);
  if (!carte.length || !seme || spento('C241D01')) return null;
  const g = creaCaso(`partita:${seme}:${m.id}:${o.n}:imprevisto`), carta = g.scegli(carte);
  const base = (o.chiamate ?? []).filter((c) => !c.imprevisto && !c.variante_di).length, [da, a] = carta.finestra ?? [1, Math.max(1, base - 1)];
  return { carta, dopo: g.intero(da, a) };
}

/** D-246 (C53-01): l'imprevisto «dopo n chiamate» conta le chiamate che arrivano davvero in questa partita, non la lista dei
 *  dati: quelle con «se», «senza» o «dopo» possono non arrivare, e la carta finiva per ultima (5% delle ondate). Arriva quando
 *  n chiamate dell'ondata hanno avuto risposta, o prima dell'ultima chiamata ancora aperta: mai per ultima (se nell'ondata arriva
 *  una sola chiamata, l'imprevisto viene prima di lei).
 *  aperte = chiamate dell'ondata ancora aperte, senza la carta. Seme 0: partita classica, posto fisso dei dati.
 *  Rosso __NO_C246I01: il posto della lista statica, come prima. */
export function conCarta(m: Missione, o: Ondata, seme: number | undefined, risposte: Record<string, string>, aperte: Chiamata[]): Chiamata[] {
  const x = seme && !spento('C246I01') ? cartaDellaPartita(m, o, seme) : null;
  if (!x || x.carta.id in risposte) return aperte;
  const fatte = Object.keys(risposte).length;
  return fatte >= x.dopo || aperte.length <= 1 ? [x.carta, ...aperte] : aperte;
}
