// Dati di gioco per la resa: i JSON di data/ (già validati dalla catena «logica») e i testi.
import { spento } from '../interruttori.ts';
import { scegliTesto, type Genere } from '../dati/testi.ts';
import type { Dichiarazione, Missione } from '../logica/tipi.ts';
import { innestaMissione, type FileImprevisti } from '../dati/imprevisti.ts';

// «@dati» = data/ (alias in vite.config.ts). Le chiavi arrivano come «/data/missioni/e01.json».
const file = import.meta.glob('@dati/**/*.json', { eager: true, import: 'default' }) as Record<string, unknown>;
const perPercorso = (prefisso: string) => Object.entries(file).filter(([k]) => k.includes(`/${prefisso}`)).map(([, v]) => v);

const testi: Record<string, string> = Object.assign({}, ...perPercorso('testi/it/') as Record<string, string>[]);

// Genere della partita in corso (D-063): lo fissa App a ogni disegno, prima delle schermate.
let genere: Genere = 'm';
export const impostaGenere = (g: Genere) => { genere = g; };
export const genereAttuale = (): Genere => genere;

/** «testi:e01.titolo» o «e01.titolo» → testo (variante «@f» se c'è e la protagonista è donna);
 *  chiave mancante = errore visibile, mai un vuoto. */
export const t = (chiave: string): string => scegliTesto(testi, chiave, genere) ?? `[[${chiave}]]`;
/** Testo facoltativo: null se la chiave non c'è (PO-101, riga «i» dell'ondata). */
export const testoSe = (chiave: string): string | null => scegliTesto(testi, chiave, genere) ?? null;

/** «1 squadra», «3 squadre» (C15-05): forme dai testi «risorsa.<r>.uno» e «risorsa.<r>.molti» (dati); se mancano,
 * il nome della risorsa com'era. Rosso C34T01: sempre il nome, come prima («1 Squadre»). */
export const quante = (n: number, r: string): string => {
  const forma = spento('C34T01') ? null : scegliTesto(testi, `risorsa.${r}.${n === 1 ? 'uno' : 'molti'}`, genere);
  return `${n} ${forma ?? t(`risorsa.${r}`)}`;
};

export const dichiarate = new Map<string, Dichiarazione>(
  ((perPercorso('stato.json')[0] as { variabili: Dichiarazione[] }).variabili).map((d) => [d.id, d]),
);

/** Club (D-086, D-088): colori e stemma sono dati, non token d'interfaccia. Lo stemma può mancare (club nuovi). */
export interface Colori { primario: string; secondario: string }
export interface Club { id: string; nome: string; colori?: Colori; stemma?: { forma: 'scudo' | 'tondo' | 'rombo'; simbolo: string } }
export const club = new Map((perPercorso('club/') as Club[]).map((c) => [c.id, c]));

// Gli abbozzi (bozza: true, D-087) si vedono e si giocano, col segno «bozza» sulla città (S-09: tolto il filtro D-090).
// PO-022 (D-190): gli imprevisti di data/imprevisti/ entrano nelle chiamate delle ondate
const imprevisti = perPercorso('imprevisti/') as FileImprevisti[];
export const missioni = (perPercorso('missioni/') as Missione[]).map((m) => innestaMissione(m, imprevisti.find((f) => f.id === m.id))).sort((a, b) => a.episodio - b.episodio);
export const missione = (id: string): Missione => {
  const m = missioni.find((x) => x.id === id);
  if (!m) throw new Error(`missione «${id}» non trovata`);
  return m;
};
