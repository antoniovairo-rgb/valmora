// PO-083: si riparte da un'ondata solo se da lì si può davvero vincere. «Possibilità» = probabilità di arrivare a un
// esito non fallito schierando con criterio (bot attento) e rispondendo alle chiamate a caso, opzioni equiprobabili:
// calcolata esatta sull'albero delle risposte (con memoria), niente sorteggi → deterministica.
import { spento } from '../interruttori.ts';
import { attenta } from './bot.ts';
import { creaCaso } from './caso.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, missioneFinita, ondataDaRiprendere, opzioniValide, riprendiDallOndata, rispondi, schiera, sogliaTensione, type EsitoMissione, type InCorso } from './missione.ts';
import type { Condizione, Dichiarazione, Missione } from './tipi.ts';

type Dich = Map<string, Dichiarazione>;

/** Sotto questa possibilità l'ondata non si propone (D-111: una su tre). */
export const POSSIBILITA_MIN = 1 / 3;

export function possibilita(m: Missione, s: InCorso, d: Dich): number {
  const att = attenta(creaCaso(1), d); const soglia = sogliaTensione(m); const memo = new Map<string, number>();
  // C17-06: lo schieramento attento dipende solo da ondata, unità, tensioni, modifiche e dalle variabili lette dagli eventi:
  // lo si calcola una volta per combinazione invece che a ogni stato (era il grosso del costo). Rosso __NO_C17R06.
  const lette = new Set<string>(); const giu = (c?: Condizione): void => { if (!c) return; if ('var' in c) lette.add(c.var); for (const x of ('tutte' in c ? c.tutte : 'almeno_una' in c ? c.almeno_una : [])) giu(x); if ('non' in c) giu(c.non); };
  for (const o of m.ondate) for (const e of o.eventi) giu(e.se);
  const schieramenti = new Map<string, ReturnType<typeof att.schiera>>();
  const schieraAtt = (x: InCorso) => {
    if (spento('C17R06')) return att.schiera(m, x);
    const k = JSON.stringify([x.ondata, x.tensione, x.riserva, x.riposo, x.modifiche, x.fisse, [...lette].map((v) => x.variabili[v])]);
    let r = schieramenti.get(k); if (!r) { r = att.schiera(m, x); schieramenti.set(k, r); } return r;
  };
  const p = (x: InCorso): number => {
    if (missioneFinita(m, x)) return concludiMissione(m, x, d).esito.fallita ? 0 : 1;
    if (Number(x.variabili.tensione_max) > soglia) return 0;
    const k = JSON.stringify([x.ondata, x.tensione, x.riserva, x.riposo, x.disposizione, x.modifiche, x.risposte, x.variabili, x.fisse]);
    const noto = memo.get(k); if (noto !== undefined) return noto;
    let v: number;
    if (!x.disposizione) v = p(schiera(m, x, schieraAtt(x)));
    else {
      const c = chiamateAperte(m, x)[0];
      if (!c) v = p(chiudiOndata(m, x, d));
      else { const o = opzioniValide(c, x, m); v = o.reduce((t, y) => t + p(rispondi(m, x, c.id, y.id, d)), 0) / o.length; }
    }
    memo.set(k, v); if (memo.size > LIMITE && !spento('C17R06')) throw TROPPI; return v;
  };
  const s0 = { ...s, partenze: undefined };
  try { return p(s0); } catch (e) { if (e !== TROPPI) throw e; }
  // Albero troppo grande (ondate iniziali): stima con PARTITE partite a risposte casuali da semi fissi, deterministica.
  let vinte = 0;
  for (let i = 1; i <= PARTITE; i++) {
    const caso = creaCaso(`possibilita:${m.id}:${i}`); let x: InCorso = s0;
    while (!missioneFinita(m, x)) {
      x = schiera(m, x, schieraAtt(x));
      for (let c = chiamateAperte(m, x)[0]; c; c = chiamateAperte(m, x)[0]) x = rispondi(m, x, c.id, caso.scegli(opzioniValide(c, x, m)).id, d);
      x = chiudiOndata(m, x, d);
    }
    if (!concludiMissione(m, x, d).esito.fallita) vinte++;
  }
  return vinte / PARTITE;
}
/** C17-06: oltre LIMITE stati distinti il calcolo esatto si ferma e si stima con PARTITE partite (tetto al tempo sul telefono). */
const LIMITE = 1000, PARTITE = 150, TROPPI = new Error('troppi stati');

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
