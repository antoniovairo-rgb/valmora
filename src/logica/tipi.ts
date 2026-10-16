// Tipi dei dati di gioco come li descrive schema/ (i file arrivano già validati da src/dati).

export type Valore = boolean | number | string;
export type Variabili = Record<string, Valore>;

export type Condizione =
  | Record<string, never>
  | { tutte: Condizione[] }
  | { almeno_una: Condizione[] }
  | { non: Condizione }
  | { var: string; uguale: Valore }
  | { var: string; almeno: number }
  | { var: string; al_massimo: number };

export type Effetto = { imposta: string; valore: Valore } | { aggiungi: string; valore: number };

/** Effetti di una scelta durante la missione (D-048): sulla storia, su un settore o sulle risorse. */
export type EffettoMissione = Effetto
  | { tensione: string; valore: number }   // tensione del settore, subito
  | { pressione: string; valore: number }  // pressione del settore nell'ondata in corso
  | { riserva: string; valore: number };   // unità in più (rinforzi) o in meno per il resto della missione

export interface Dichiarazione {
  id: string; tipo: 'bool' | 'int' | 'enum'; iniziale: Valore; min?: number; max?: number; valori?: string[]; descrizione: string;
}

export interface Risorsa { quantita: number; efficacia: Record<string, number>; dimezza?: string[]; fissa?: boolean; massimo?: number }
export interface Evento { id: string; tipo: string; settore: string; pressione: number; se?: Condizione; /** C-021: club dei tifosi in strada */ club?: string; /** D-127: verso del corteo, se i testi lo dicono */ verso?: 'verso_lo_stadio' | 'dallo_stadio' }
export interface Esito { id: string; se: Condizione; effetti: Effetto[]; verbale: string; fallita?: boolean; stelle_min?: number; stelle_max?: number }
export interface Informazione { testo: string; fonte: string; affidabilita: 'bassa' | 'media' | 'alta'; vera: boolean; settore?: string }
/** dopo (PO-086): «chiamata/opzione» già scelte (gia) o mai scelte (mai) in questa partita perché la chiamata o l'opzione compaia. */
export interface Dopo { mai?: string[]; gia?: string[] }
export interface Opzione { id: string; testo: string; costo?: string; risposta?: string; se?: Condizione; dopo?: Dopo; effetti: EffettoMissione[] }
/** senza (PO-095): la chiamata si apre solo se nel settore non c'è nessuna unità schierata (fra le risorse indicate, o tutte). */
export interface Chiamata { id: string; fonte: string; testo: string; commento?: string; settore?: string; se?: Condizione; dopo?: Dopo; senza?: { settore: string; risorse?: string[] }; opzioni: Opzione[] }

export interface Missione {
  id: string; stagione: number; episodio: number; titolo: string; bozza?: boolean; disponibile_se: Condizione; introduzione?: string[];
  briefing: Informazione[];
  mappa: { settori: { id: string; tipo: string; club?: string; /** C27-02 */ meta?: string; pos?: { x: number; y: number } }[]; risorse: Record<string, Risorsa>; ora?: 'giorno' | 'notte'; dettagli?: string[] };
  ondate: { n: number; titolo?: string; /** C27-04 */ fase?: 'prima' | 'partita' | 'dopo'; eventi: Evento[]; chiamate?: Chiamata[] }[];
  esiti: Esito[];
  stelle: { due: Condizione; tre: Condizione };
  luogo?: { x: number; y: number };
  /** D-130 (C26-06): la sfida della serata, se le curve non la dicono */
  partita?: { casa: string; ospiti: string };
  fili: string[];
}

/** Disposizione per un'ondata: risorsa → settore → unità. */
export type Disposizione = Record<string, Record<string, number>>;
