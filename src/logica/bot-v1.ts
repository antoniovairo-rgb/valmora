// TEMPORANEO: bot della e01 0.1.0, usato solo da tools/foto.mjs finché la resa v2 non sostituisce la plancia (D-053).
// Bot di partita: scelgono le disposizioni a partire da un seme. Servono a provare che
// una missione finisce sempre (nessun soft-lock) e a tarare i numeri (D-036).
import type { Caso } from './caso.ts';
import { risolviOndata } from './plancia.ts';
import type { Disposizione, Missione, Variabili } from './tipi.ts';

export type Strategia = (m: Missione, n: number, v: Variabili, caso: Caso) => Disposizione;

const vuota = (m: Missione): Disposizione => Object.fromEntries(Object.keys(m.mappa.risorse).map((r) => [r, {}]));
const metti = (d: Disposizione, r: string, s: string) => { d[r]![s] = (d[r]![s] ?? 0) + 1; };

/** Ogni unità in un settore a caso. */
export const casuale: Strategia = (m, _n, _v, caso) => {
  const d = vuota(m);
  for (const [r, ris] of Object.entries(m.mappa.risorse)) for (let i = 0; i < ris.quantita; i++) metti(d, r, caso.scegli(m.mappa.settori).id);
  return d;
};

/** Tutte le unità nel settore con meno pressione: il giocatore peggiore che non esce dalle regole. */
export const peggiore: Strategia = (m, n, v) => {
  const d = vuota(m);
  const pressione = (s: string) => m.ondate[n - 1]!.eventi.filter((e) => e.settore === s).reduce((t, e) => t + e.pressione, 0);
  const s = [...m.mappa.settori].sort((a, b) => pressione(a.id) - pressione(b.id) || a.id.localeCompare(b.id))[0]!.id;
  for (const [r, ris] of Object.entries(m.mappa.risorse)) d[r]![s] = ris.quantita;
  void v;
  return d;
};

/** Avida: mette un'unità per volta dove riduce di più la tensione dell'ondata (a parità, ordine fisso). */
export const attenta: Strategia = (m, n, v) => {
  const d = vuota(m);
  const unita = Object.entries(m.mappa.risorse).flatMap(([r, ris]) => Array<string>(ris.quantita).fill(r));
  for (const r of unita) {
    let migliore = { s: m.mappa.settori[0]!.id, t: Infinity };
    for (const { id } of m.mappa.settori) {
      metti(d, r, id);
      const t = risolviOndata(m, n, d, v).tensione;
      d[r]![id]! -= 1;
      if (t < migliore.t) migliore = { s: id, t };
    }
    metti(d, r, migliore.s);
  }
  return d;
};

export const STRATEGIE: Record<string, Strategia> = { casuale, peggiore, attenta };
