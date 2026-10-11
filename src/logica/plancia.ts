// Plancia: risoluzione delle ondate e della missione (D-035, D-037, D-038). Pura e deterministica.
//
// Per ogni ondata il giocatore ridistribuisce tutte le risorse (D-038). In ogni settore:
// - ogni unità con «dimezza» che contiene il tipo di un evento lo dimezza (per difetto), una volta per unità;
// - copertura = somma di unità × efficacia[tipo del settore];
// - scoperto = max(0, pressione degli eventi attivi − copertura).
// La tensione dell'ondata è la somma degli scoperti; «tensione_max» è la massima della missione (D-039).
import { applica, valuta } from './condizioni.ts';
import type { Dichiarazione, Disposizione, Esito, Missione, Variabili } from './tipi.ts';

export const VAR_TENSIONE = 'tensione_max';

export function controllaDisposizione(m: Missione, d: Disposizione): string[] {
  const p: string[] = [];
  const settori = new Set(m.mappa.settori.map((s) => s.id));
  for (const [risorsa, perSettore] of Object.entries(d)) {
    const r = m.mappa.risorse[risorsa];
    if (!r) { p.push(`risorsa «${risorsa}» non disponibile in ${m.id}`); continue; }
    let totale = 0;
    for (const [settore, n] of Object.entries(perSettore)) {
      if (!settori.has(settore)) p.push(`settore «${settore}» non è nella mappa di ${m.id}`);
      if (!Number.isInteger(n) || n < 0) p.push(`${risorsa} in ${settore}: ${n} non è un intero ≥ 0`);
      totale += n;
    }
    if (totale > r.quantita) p.push(`${risorsa}: ${totale} unità disposte, ne hai ${r.quantita}`);
  }
  return p;
}

export interface EsitoOndata { n: number; scoperto: Record<string, number>; tensione: number }

export function risolviOndata(m: Missione, n: number, d: Disposizione, v: Variabili): EsitoOndata {
  const ondata = m.ondate[n - 1];
  if (!ondata) throw new Error(`${m.id}: l'ondata ${n} non esiste`);
  const errori = controllaDisposizione(m, d);
  if (errori.length) throw new Error(errori.join('; '));
  const scoperto: Record<string, number> = {};
  let tensione = 0;
  for (const settore of m.mappa.settori) {
    const unita = Object.entries(d).map(([r, ps]) => ({ r: m.mappa.risorse[r]!, n: ps[settore.id] ?? 0 })).filter((x) => x.n > 0);
    const dimezzatori = (tipo: string) => unita.filter((u) => u.r.dimezza?.includes(tipo)).reduce((s, u) => s + u.n, 0);
    let pressione = 0;
    for (const ev of ondata.eventi) {
      if (ev.settore !== settore.id || (ev.se && !valuta(ev.se, v))) continue;
      let p = ev.pressione;
      for (let i = 0; i < dimezzatori(ev.tipo); i++) p = Math.floor(p / 2);
      pressione += p;
    }
    const copertura = unita.reduce((s, u) => s + u.n * (u.r.efficacia[settore.tipo] ?? 0), 0);
    scoperto[settore.id] = Math.max(0, pressione - copertura);
    tensione += scoperto[settore.id]!;
  }
  return { n, scoperto, tensione };
}

export interface EsitoMissione { ondate: EsitoOndata[]; esito: Esito; variabili: Variabili }

/** Gioca la missione con una disposizione per ondata, scelta da chi gioca (persona o bot). */
export function giocaMissione(
  m: Missione, iniziali: Variabili, dichiarate: Map<string, Dichiarazione>,
  scegli: (n: number, v: Variabili, precedenti: EsitoOndata[]) => Disposizione,
): EsitoMissione {
  if (!dichiarate.has(VAR_TENSIONE)) throw new Error(`stato.json deve dichiarare «${VAR_TENSIONE}»`);
  let v: Variabili = { ...iniziali, [VAR_TENSIONE]: 0 };
  const ondate: EsitoOndata[] = [];
  for (const o of m.ondate) {
    const r = risolviOndata(m, o.n, scegli(o.n, v, ondate), v);
    ondate.push(r);
    v = applica({ imposta: VAR_TENSIONE, valore: Math.max(v[VAR_TENSIONE] as number, r.tensione) }, v, dichiarate);
  }
  const esito = m.esiti.find((e) => valuta(e.se, v));
  if (!esito) throw new Error(`${m.id}: nessun esito vero (soft-lock)`);
  for (const e of esito.effetti) v = applica(e, v, dichiarate);
  return { ondate, esito, variabili: v };
}
