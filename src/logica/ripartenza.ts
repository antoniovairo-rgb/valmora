// PO-083: si riparte da un'ondata solo se da lì si può davvero vincere. «Possibilità» = probabilità di arrivare a un
// esito non fallito schierando con criterio (bot attento) e rispondendo alle chiamate a caso, opzioni equiprobabili:
// calcolata esatta sull'albero delle risposte (con memoria), niente sorteggi → deterministica.
import { spento } from '../interruttori.ts';
import { attenta } from './bot.ts';
import { creaCaso } from './caso.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, missioneFinita, ondataDaRiprendere, opzioniValide, riprendiDallOndata, rispondi, schiera, sogliaTensione, type EsitoMissione, type InCorso } from './missione.ts';
import type { Dichiarazione, Missione } from './tipi.ts';

type Dich = Map<string, Dichiarazione>;

/** Sotto questa possibilità l'ondata non si propone (D-111: una su tre). */
export const POSSIBILITA_MIN = 1 / 3;

export function possibilita(m: Missione, s: InCorso, d: Dich): number {
  const att = attenta(creaCaso(1), d); const soglia = sogliaTensione(m); const memo = new Map<string, number>();
  const p = (x: InCorso): number => {
    if (missioneFinita(m, x)) return concludiMissione(m, x, d).esito.fallita ? 0 : 1;
    if (Number(x.variabili.tensione_max) > soglia) return 0;
    const k = JSON.stringify([x.ondata, x.tensione, x.riserva, x.riposo, x.disposizione, x.modifiche, x.risposte, x.variabili, x.fisse]);
    const noto = memo.get(k); if (noto !== undefined) return noto;
    let v: number;
    if (!x.disposizione) v = p(schiera(m, x, att.schiera(m, x)));
    else {
      const c = chiamateAperte(m, x)[0];
      if (!c) v = p(chiudiOndata(m, x, d));
      else { const o = opzioniValide(c, x); v = o.reduce((t, y) => t + p(rispondi(m, x, c.id, y.id, d)), 0) / o.length; }
    }
    memo.set(k, v); return v;
  };
  return p({ ...s, partenze: undefined });
}

/** Ondata da proporre dopo una sconfitta: la più recente, a partire da quella che ha deciso l'esito (C16-01) e andando
 *  indietro, da cui la possibilità è almeno POSSIBILITA_MIN; 1 se nessuna (= «Ricomincia»). Rosso __NO_PO083: la regola
 *  C16-01 senza controllo. */
export function ondataVincibile(m: Missione, e: Pick<EsitoMissione, 'rapporti' | 'variabili'>, ic: InCorso, d: Dich): number {
  const n = ondataDaRiprendere(e, m);
  if (spento('PO083')) return n;
  for (let k = n; k > 1; k--) {
    const s = riprendiDallOndata(ic, k);
    if (s && possibilita(m, s, d) >= POSSIBILITA_MIN) return k;
  }
  return 1;
}
