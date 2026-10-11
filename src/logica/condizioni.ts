// Valutazione delle condizioni e applicazione degli effetti (schema/comune.schema.json). Pure.
import type { Condizione, Dichiarazione, Effetto, Variabili } from './tipi.ts';

export function valuta(c: Condizione, v: Variabili): boolean {
  if ('tutte' in c) return c.tutte.every((x) => valuta(x, v));
  if ('almeno_una' in c) return c.almeno_una.some((x) => valuta(x, v));
  if ('non' in c) return !valuta(c.non, v);
  if (!('var' in c)) return true; // {} = sempre vera
  const x = v[c.var];
  if (x === undefined) throw new Error(`variabile «${c.var}» senza valore`);
  if ('uguale' in c) return x === c.uguale;
  if ('almeno' in c) return (x as number) >= c.almeno;
  return (x as number) <= c.al_massimo;
}

/** Applica un effetto restituendo variabili nuove; gli int restano dentro [min, max]. */
export function applica(e: Effetto, v: Variabili, dichiarate: Map<string, Dichiarazione>): Variabili {
  const id = 'imposta' in e ? e.imposta : e.aggiungi;
  const d = dichiarate.get(id);
  if (!d) throw new Error(`variabile «${id}» non dichiarata`);
  let nuovo = 'imposta' in e ? e.valore : (v[id] as number) + e.valore;
  if (d.tipo === 'int') nuovo = Math.min(d.max!, Math.max(d.min!, nuovo as number));
  return { ...v, [id]: nuovo };
}

export const variabiliIniziali = (dichiarate: Iterable<Dichiarazione>): Variabili =>
  Object.fromEntries([...dichiarate].map((d) => [d.id, d.iniziale]));
