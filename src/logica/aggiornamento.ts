// Salvataggi scritti con dati di gioco più vecchi (collaudo C-014). Puro: si applica al caricamento.
// - C14-03: variabili di storia dichiarate dopo il salvataggio → si completano col valore iniziale dichiarato,
//   ovunque il salvataggio porta variabili (partita, episodio in corso, sue partenze, registro D-062).
//   Vale per ogni variabile futura senza toccare SAVE_VERSION: il formato non cambia, cambiano i dati.
//   Rosso: __NO_C14V01 (nessun completamento: «variabile … senza valore» o NaN).
// - C14-02: episodio in corso che nomina missione, ondata, chiamate, opzioni, settori o risorse che i dati
//   attuali non hanno → l'episodio riparte dal suo inizio con le variabili di partenza del registro (D-062);
//   se la missione non esiste più, nessun episodio in corso (si torna alla città). Rosso: __NO_C14I01.
import { spento } from '../interruttori.ts';
import { variabiliDiPartenza, type Registro } from './episodi.ts';
import { iniziaMissione, type InCorso } from './missione.ts';
import type { Dichiarazione, Disposizione, Missione, Variabili } from './tipi.ts';

/** La parte del salvataggio che dipende dai dati di gioco. */
export interface Partita { variabili: Variabili; episodi: Registro; in_corso: InCorso | null; rapporto_aperto: number | null }

/** Variabili con in più ogni dichiarata che manca, al suo valore iniziale; quelle presenti restano. */
export function completaVariabili(v: Variabili, dichiarate: Iterable<Dichiarazione>): Variabili {
  const out = { ...v };
  for (const d of dichiarate) if (!(d.id in out)) out[d.id] = d.iniziale;
  return out;
}

const completaInCorso = (ic: InCorso, d: Dichiarazione[]): InCorso => ({
  ...ic, variabili: completaVariabili(ic.variabili, d),
  ...(ic.partenze ? { partenze: Object.fromEntries(Object.entries(ic.partenze).map(([n, p]) => [n, completaInCorso(p, d)])) } : {}),
});

export function completaPartita<S extends Partita>(s: S, dichiarate: Iterable<Dichiarazione>): S {
  if (spento('C14V01')) return s;
  const d = [...dichiarate];
  return {
    ...s,
    variabili: completaVariabili(s.variabili, d),
    in_corso: s.in_corso && completaInCorso(s.in_corso, d),
    episodi: Object.fromEntries(Object.entries(s.episodi).map(([id, x]) => [id, {
      ...x, variabili_prima: completaVariabili(x.variabili_prima, d), variabili_dopo: x.variabili_dopo && completaVariabili(x.variabili_dopo, d),
    }])),
  };
}

/** Cosa dell'episodio in corso non esiste più nei dati della missione (vuoto = compatibile). */
export function incompatibilita(ic: InCorso, m: Missione | undefined): string[] {
  if (!m) return [`la missione «${ic.missione}» non esiste`];
  const p: string[] = [];
  if (ic.ondata > m.ondate.length + 1) p.push(`ondata ${ic.ondata} oltre le ${m.ondate.length} della missione`);
  const opzione = (n: number, c: string, o: string) => m.ondate[n - 1]?.chiamate?.find((x) => x.id === c)?.opzioni.some((x) => x.id === o);
  for (const [c, o] of Object.entries(ic.risposte)) if (!opzione(ic.ondata, c, o)) p.push(`risposta ${c}/${o} dell'ondata ${ic.ondata}`);
  for (const x of ic.scelte) if (!opzione(x.ondata, x.chiamata, x.opzione)) p.push(`scelta ${x.chiamata}/${x.opzione} dell'ondata ${x.ondata}`);
  const settori = m.mappa.settori.map((x) => x.id);
  const tesi = Object.keys(ic.tensione);
  if (tesi.length !== settori.length || !settori.every((k) => tesi.includes(k))) p.push(`settori ${tesi.join(',')} invece di ${settori.join(',')}`);
  for (const d of [ic.disposizione, ic.fisse] as (Disposizione | null | undefined)[]) for (const [r, ps] of Object.entries(d ?? {})) {
    if (!(r in m.mappa.risorse)) p.push(`risorsa «${r}»`);
    for (const k of Object.keys(ps)) if (!settori.includes(k)) p.push(`settore «${k}»`);
  }
  return p;
}

/**
 * Se l'episodio in corso non è compatibile coi dati, riparte dal suo inizio (o sparisce se la missione non
 * c'è più) e si chiude il rapporto aperto. «motivi» vuoto = salvataggio invariato.
 */
export function riparaInCorso<S extends Partita>(s: S, missioni: Missione[], dichiarate: Map<string, Dichiarazione>): { salvataggio: S; motivi: string[] } {
  const ic = s.in_corso;
  if (!ic || spento('C14I01')) return { salvataggio: s, motivi: [] };
  const m = missioni.find((x) => x.id === ic.missione);
  const motivi = incompatibilita(ic, m);
  if (!motivi.length) return { salvataggio: s, motivi };
  const da_capo = m ? iniziaMissione(m, variabiliDiPartenza(s.episodi, m.id, s.variabili), dichiarate) : null;
  return { salvataggio: { ...s, in_corso: da_capo, rapporto_aperto: null }, motivi };
}
