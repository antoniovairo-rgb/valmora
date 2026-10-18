// C38-03 (D-172): ogni risposta confrontata con le altre della stessa chiamata, come tools/misura-fiducia.mjs
// (perOpzioni): schieramento attento + risposte a caso, fallite e tensione finale quando la scegli contro quando
// nella stessa chiamata scegli un'altra risposta. Puro e deterministico (semi `confronto:<episodio>:<n>`).
import { attenta } from './bot.ts';
import { creaCaso } from './caso.ts';
import { variabiliIniziali } from './condizioni.ts';
import { giocaMissione, opzioniValide } from './missione.ts';
import type { Dichiarazione, Missione } from './tipi.ts';

export interface Confronto { n: number; nAltre: number; falliteSe: number; falliteAltre: number; tensioneSe: number; tensioneAltre: number; saldo: number }
export const SEMI_CONFRONTO = 200;

interface Conta { n: number; ko: number; tens: number }
const cache = new Map<string, Map<string, Confronto>>();

/** Per ogni `chiamata/opzione` vista: fallite (%) e tensione finale media se la scegli e se scegli le altre.
 *  saldo = (fallite altre − fallite se) in punti + (tensione altre − tensione se): positivo = ti ha aiutato. */
export function confrontoScelte(m: Missione, dich: Map<string, Dichiarazione>, semi = SEMI_CONFRONTO): Map<string, Confronto> {
  const chiave = `${m.id}:${semi}`;
  const pronto = cache.get(chiave); if (pronto) return pronto;
  const iniziali = variabiliIniziali(dich.values());
  const tab = new Map<string, Conta>(); const perChiamata = new Map<string, string[]>();
  for (let s = 1; s <= semi; s++) {
    const caso = creaCaso(`confronto:${m.id}:${s}`);
    const r = giocaMissione(m, iniziali, dich, { schiera: attenta(caso, dich).schiera, scegli: (mm, st, c) => caso.scegli(opzioniValide(c, st, mm)).id });
    const tens = Number(r.variabili.tensione_max ?? 0);
    for (const x of new Map(r.scelte.map((y) => [y.chiamata, y])).values()) {
      const k = `${x.chiamata}/${x.opzione}`; const t = tab.get(k) ?? { n: 0, ko: 0, tens: 0 };
      if (!tab.has(k)) perChiamata.set(x.chiamata, [...(perChiamata.get(x.chiamata) ?? []), k]);
      t.n++; t.ko += r.esito.fallita ? 1 : 0; t.tens += tens; tab.set(k, t);
    }
  }
  const out = new Map<string, Confronto>();
  for (const [k, t] of tab) {
    const altre = (perChiamata.get(k.split('/')[0]!) ?? []).filter((x) => x !== k).map((x) => tab.get(x)!);
    const nAltre = altre.reduce((a, u) => a + u.n, 0); if (!nAltre) continue;
    const falliteSe = (100 * t.ko) / t.n, falliteAltre = (100 * altre.reduce((a, u) => a + u.ko, 0)) / nAltre;
    const tensioneSe = t.tens / t.n, tensioneAltre = altre.reduce((a, u) => a + u.tens, 0) / nAltre;
    out.set(k, { n: t.n, nAltre, falliteSe, falliteAltre, tensioneSe, tensioneAltre, saldo: (falliteAltre - falliteSe) + (tensioneAltre - tensioneSe) });
  }
  cache.set(chiave, out);
  return out;
}
