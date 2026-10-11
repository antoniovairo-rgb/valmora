// Dati di gioco per la resa: i JSON di data/ (già validati dalla catena «logica») e i testi.
import { scegliTesto, type Genere } from '../dati/testi.ts';
import type { Dichiarazione, Missione } from '../logica/tipi.ts';

// «@dati» = data/ (alias in vite.config.ts). Le chiavi arrivano come «/data/missioni/e01.json».
const file = import.meta.glob('@dati/**/*.json', { eager: true, import: 'default' }) as Record<string, unknown>;
const perPercorso = (prefisso: string) => Object.entries(file).filter(([k]) => k.includes(`/${prefisso}`)).map(([, v]) => v);

const testi: Record<string, string> = Object.assign({}, ...perPercorso('testi/it/') as Record<string, string>[]);

// Genere della partita in corso (D-063): lo fissa App a ogni disegno, prima delle schermate.
let genere: Genere = 'm';
export const impostaGenere = (g: Genere) => { genere = g; };

/** «testi:e01.titolo» o «e01.titolo» → testo (variante «@f» se c'è e la protagonista è donna);
 *  chiave mancante = errore visibile, mai un vuoto. */
export const t = (chiave: string): string => scegliTesto(testi, chiave, genere) ?? `[[${chiave}]]`;

export const dichiarate = new Map<string, Dichiarazione>(
  ((perPercorso('stato.json')[0] as { variabili: Dichiarazione[] }).variabili).map((d) => [d.id, d]),
);

// D-090: gli abbozzi (bozza: true, D-087) restano nascosti finché la resa non ha città per stagione e segno «bozza»
// (S-09); si vedono con «?bozze=1» nell'indirizzo. Fuori dal browser (test in node) si vedono tutti.
const conBozze = typeof location === 'undefined' || new URLSearchParams(location.search).has('bozze');
/** Club (D-086, D-088): colori e stemma sono dati, non token d'interfaccia. Lo stemma può mancare (club nuovi). */
export interface Colori { primario: string; secondario: string }
export interface Club { id: string; nome: string; colori?: Colori; stemma?: { forma: 'scudo' | 'tondo' | 'rombo'; simbolo: string } }
export const club = new Map((perPercorso('club/') as Club[]).map((c) => [c.id, c]));

export const missioni = (perPercorso('missioni/') as Missione[]).filter((m) => conBozze || !m.bozza).sort((a, b) => a.episodio - b.episodio);
export const missione = (id: string): Missione => {
  const m = missioni.find((x) => x.id === id);
  if (!m) throw new Error(`missione «${id}» non trovata`);
  return m;
};
