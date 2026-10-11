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

export interface Dichiarazione {
  id: string; tipo: 'bool' | 'int' | 'enum'; iniziale: Valore; min?: number; max?: number; valori?: string[]; descrizione: string;
}

export interface Risorsa { quantita: number; efficacia: Record<string, number>; dimezza?: string[] }
export interface Evento { id: string; tipo: string; settore: string; pressione: number; se?: Condizione }
export interface Esito { id: string; se: Condizione; effetti: Effetto[]; verbale: string }
export interface Informazione { testo: string; fonte: string; affidabilita: 'bassa' | 'media' | 'alta'; vera: boolean }

export interface Missione {
  id: string; stagione: number; episodio: number; titolo: string; disponibile_se: Condizione;
  briefing: Informazione[];
  mappa: { settori: { id: string; tipo: string }[]; risorse: Record<string, Risorsa> };
  ondate: { n: number; eventi: Evento[] }[];
  esiti: Esito[];
  fili: string[];
}

/** Disposizione per un'ondata: risorsa → settore → unità. */
export type Disposizione = Record<string, Record<string, number>>;
