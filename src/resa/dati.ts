// Dati di gioco per la resa: i JSON di data/ (già validati dalla catena «logica») e i testi.
import type { Dichiarazione, Missione } from '../logica/tipi.ts';

// «@dati» = data/ (alias in vite.config.ts). Le chiavi arrivano come «/data/missioni/e01.json».
const file = import.meta.glob('@dati/**/*.json', { eager: true, import: 'default' }) as Record<string, unknown>;
const perPercorso = (prefisso: string) => Object.entries(file).filter(([k]) => k.includes(`/${prefisso}`)).map(([, v]) => v);

const testi: Record<string, string> = Object.assign({}, ...perPercorso('testi/it/') as Record<string, string>[]);

/** «testi:e01.titolo» o «e01.titolo» → testo; chiave mancante = errore visibile, mai un vuoto. */
export const t = (chiave: string): string => testi[chiave.replace(/^testi:/, '')] ?? `[[${chiave}]]`;

export const dichiarate = new Map<string, Dichiarazione>(
  ((perPercorso('stato.json')[0] as { variabili: Dichiarazione[] }).variabili).map((d) => [d.id, d]),
);

export const missioni = (perPercorso('missioni/') as Missione[]).sort((a, b) => a.episodio - b.episodio);
export const missione = (id: string): Missione => {
  const m = missioni.find((x) => x.id === id);
  if (!m) throw new Error(`missione «${id}» non trovata`);
  return m;
};
