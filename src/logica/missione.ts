// Missione a scene (D-048, D-053, D-056). Pura e deterministica: ogni passo prende uno stato e ne
// restituisce uno nuovo, serializzabile (finisce nel salvataggio fra un passo e l'altro).
//
// Per ogni ondata: schiera → rispondi alle chiamate aperte → chiudiOndata.
// - La tensione di ogni settore (0-10) passa all'ondata dopo: se il settore è presidiato (almeno un'unità)
//   e non resta scoperto si dimezza (per difetto); se è vuoto resta com'è; se è scoperto si somma (C01-O01).
// - Lo schieramento si fa una volta per ondata, prima delle chiamate (C01-A01). Rinforzi e perdite
//   (effetto «riserva») contano dall'ondata successiva; la riserva non scende sotto −quantità (C01-A04).
// - Le unità rimaste in un settore scoperto vanno a riposo per l'ondata successiva (D-056).
// - «tensione_max» = tensione di settore più alta vista nella missione; decide l'esito con le variabili.
// - Risorse «fissa» (transenne, D-082): le unità piazzate restano nel settore per tutte le ondate dopo;
//   non tornano disponibili e non vanno a riposo. Rosso: __NO_C09F01 (si comportano come unità normali).
import { applica, valuta } from './condizioni.ts';
import { spento } from '../interruttori.ts';
import type { Chiamata, Condizione, Dichiarazione, Disposizione, EffettoMissione, Esito, Missione, Variabili } from './tipi.ts';

export const VAR_TENSIONE = 'tensione_max';
export const TENSIONE_MAX = 10;
/** PO-094: tensione da cui un settore «degenera» e costa fiducia (come l'esito peggiore, oltre 6). */
export const DEGENERA = 7;
// D-105: a inizio episodio la fiducia («credito») risale almeno a FIDUCIA_MIN, applicata alle variabili di partenza
// di ogni tentativo (D-062). Tarata coi bot: il valore più basso con 3★ raggiungibili in 36/36. Rosso __NO_C23F01.
export const VAR_FIDUCIA = 'credito';
export const FIDUCIA_MIN = 3; // D-110: il PO sceglie 3 (con 2 le 3★ erano possibili ma rare)
const lim = (x: number) => Math.max(0, Math.min(TENSIONE_MAX, x));
type Dich = Map<string, Dichiarazione>;

// picco = tensione più alta del settore nell'ondata (prima del dimezzamento): è quella che conta per «tensione_max» e
// per le stelle, quindi il rapporto la mostra (C09-01). Assente nei rapporti salvati prima; rosso __NO_C10P01.
export interface RapportoOndata { n: number; scoperto: Record<string, number>; tensione: Record<string, number>; aRiposo: Record<string, number>; picco?: Record<string, number>; fiducia?: number }

export interface InCorso {
  missione: string;
  ondata: number;                       // ondata in corso, da 1
  tensione: Record<string, number>;     // per settore
  riserva: Record<string, number>;      // variazione permanente delle unità, per risorsa
  riposo: Record<string, number>;       // unità a riposo in questa ondata, per risorsa
  disposizione: Disposizione | null;    // schieramento dell'ondata in corso
  modifiche: Record<string, number>;    // variazioni di pressione dell'ondata in corso, per settore
  risposte: Record<string, string>;     // chiamata → opzione, ondata in corso
  scelte: { ondata: number; chiamata: string; opzione: string }[];
  rapporti: RapportoOndata[];
  variabili: Variabili;
  fisse?: Disposizione;                 // unità fisse già piazzate, per risorsa e settore (D-082); assente nei salvataggi vecchi
  partenze?: Record<number, InCorso>;   // stato all'inizio di ogni ondata, per ripartire da lì (PO-060); assente nei salvataggi vecchi
}

const ondataDi = (m: Missione, s: InCorso) => {
  const o = m.ondate[s.ondata - 1];
  if (!o) throw new Error(`${m.id}: l'ondata ${s.ondata} non esiste`);
  return o;
};

/** Fiducia minima a inizio episodio (D-105); solo se lo stato dichiara la variabile. */
export function fiduciaMinima(v: Variabili, d: Dich): Variabili {
  const f = v[VAR_FIDUCIA];
  if (spento('C23F01') || !d.has(VAR_FIDUCIA) || typeof f !== 'number' || f >= FIDUCIA_MIN) return v;
  return { ...v, [VAR_FIDUCIA]: FIDUCIA_MIN };
}

export function iniziaMissione(m: Missione, iniziali: Variabili, d: Dich): InCorso {
  if (!d.has(VAR_TENSIONE)) throw new Error(`stato.json deve dichiarare «${VAR_TENSIONE}»`);
  const zero = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, 0]));
  const risorse = Object.keys(m.mappa.risorse);
  const s: InCorso = {
    missione: m.id, ondata: 1, tensione: zero(m.mappa.settori.map((x) => x.id)), riserva: zero(risorse), riposo: zero(risorse),
    disposizione: null, modifiche: {}, risposte: {}, scelte: [], rapporti: [], variabili: fiduciaMinima({ ...iniziali, [VAR_TENSIONE]: 0 }, d),
  };
  return { ...s, partenze: { 1: s } };
}

export const missioneFinita = (m: Missione, s: InCorso): boolean => s.ondata > m.ondate.length;

/** Unità che si possono schierare in questa ondata. */
const somma = (ps: Record<string, number> | undefined) => Object.values(ps ?? {}).reduce((a, b) => a + b, 0);
const fisse = (s: InCorso): Disposizione => (spento('C09F01') ? {} : s.fisse ?? {});

export function disponibili(m: Missione, s: InCorso): Record<string, number> {
  return Object.fromEntries(Object.entries(m.mappa.risorse).map(([r, x]) => [r, Math.max(0, x.quantita + (s.riserva[r] ?? 0) - (s.riposo[r] ?? 0) - somma(fisse(s)[r]))]));
}

/** Settori dove una risorsa si può mettere: le fisse solo dove servono (efficacia > 0, D-082: niente transenne sugli spalti). */
export function settoriAmmessi(m: Missione, r: string): string[] {
  const x = m.mappa.risorse[r];
  return m.mappa.settori.filter((k) => spento('C09F02') || !x?.fissa || (x.efficacia[k.tipo] ?? 0) > 0).map((k) => k.id);
}

/** Schieramento che conta davvero: quello dell'ondata più le unità fisse già piazzate (D-082). */
export function inCampo(s: InCorso, d: Disposizione): Disposizione {
  const out = structuredClone(d);
  for (const [r, ps] of Object.entries(fisse(s))) for (const [k, n] of Object.entries(ps)) (out[r] ??= {})[k] = (out[r]![k] ?? 0) + n;
  return out;
}

const oggetto = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);

export function controllaDisposizione(m: Missione, s: InCorso, d: Disposizione): string[] {
  if (!spento('C02N04') && !oggetto(d)) return ['la disposizione non è un elenco di risorse'];
  const p: string[] = [];
  const settori = new Set(m.mappa.settori.map((x) => x.id));
  const disp = disponibili(m, s);
  for (const [r, perSettore] of Object.entries(d)) {
    if (spento('C01A05') ? !(r in disp) : !Object.hasOwn(disp, r)) { p.push(`risorsa «${r}» non disponibile in ${m.id}`); continue; }
    if (!spento('C02N04') && !oggetto(perSettore)) { p.push(`${r}: serve un elenco settore → unità`); continue; }
    let tot = 0;
    for (const [settore, n] of Object.entries(perSettore)) {
      if (!settori.has(settore)) p.push(`settore «${settore}» non è nella mappa di ${m.id}`);
      else if (n > 0 && !settoriAmmessi(m, r).includes(settore)) p.push(`${r}: in «${settore}» non hanno effetto, non si montano`);
      if (!Number.isInteger(n) || n < 0) p.push(`${r} in ${settore}: ${n} non è un intero ≥ 0`);
      tot += n;
    }
    if (tot > disp[r]!) p.push(`${r}: ${tot} unità disposte, disponibili ${disp[r]}`);
  }
  return p;
}

export function schiera(m: Missione, s: InCorso, d: Disposizione): InCorso {
  if (missioneFinita(m, s)) throw new Error(`${m.id}: missione già finita`);
  if (!spento('C01A01') && Object.keys(s.risposte).length) throw new Error(`${m.id}: lo schieramento si fa prima delle chiamate (ondata ${s.ondata})`);
  const errori = controllaDisposizione(m, s, d);
  if (errori.length) throw new Error(errori.join('; '));
  return { ...s, disposizione: structuredClone(d) };
}

/** Chiamate dell'ondata in corso ancora senza risposta, nell'ordine dei dati. */
export function chiamateAperte(m: Missione, s: InCorso): Chiamata[] {
  if (missioneFinita(m, s)) return [];
  return (ondataDi(m, s).chiamate ?? []).filter((c) => !(c.id in s.risposte) && (!c.se || valuta(c.se, s.variabili)));
}

export const opzioniValide = (c: Chiamata, s: InCorso) => c.opzioni.filter((o) => !o.se || valuta(o.se, s.variabili));

function applicaEffetto(m: Missione, s: InCorso, e: EffettoMissione, d: Dich): InCorso {
  if ('tensione' in e) return { ...s, tensione: { ...s.tensione, [e.tensione]: lim((s.tensione[e.tensione] ?? 0) + e.valore) } };
  if ('pressione' in e) return { ...s, modifiche: { ...s.modifiche, [e.pressione]: (s.modifiche[e.pressione] ?? 0) + e.valore } };
  if ('riserva' in e) {
    const q = m.mappa.risorse[e.riserva]?.quantita ?? 0;
    const v = (s.riserva[e.riserva] ?? 0) + e.valore;
    return { ...s, riserva: { ...s.riserva, [e.riserva]: spento('C01A04') ? v : Math.max(-q, v) } };
  }
  return { ...s, variabili: applica(e, s.variabili, d) };
}

export function rispondi(m: Missione, s: InCorso, chiamata: string, opzione: string, d: Dich): InCorso {
  if (!s.disposizione) throw new Error(`${m.id}: prima si schiera, poi si risponde`);
  const c = chiamateAperte(m, s).find((x) => x.id === chiamata);
  if (!c) throw new Error(`${m.id}: la chiamata «${chiamata}» non è aperta`);
  const o = opzioniValide(c, s).find((x) => x.id === opzione);
  if (!o) throw new Error(`${m.id}: l'opzione «${opzione}» non è valida per «${chiamata}»`);
  let t: InCorso = { ...s, risposte: { ...s.risposte, [chiamata]: opzione }, scelte: [...s.scelte, { ondata: s.ondata, chiamata, opzione }] };
  for (const e of o.effetti) t = applicaEffetto(m, t, e, d);
  return t;
}

/** Risolve l'ondata in corso (schierata, chiamate tutte risposte) e passa alla successiva. */
export function chiudiOndata(m: Missione, s: InCorso, d: Dich): InCorso {
  const o = ondataDi(m, s);
  if (!s.disposizione) throw new Error(`${m.id}: ondata ${s.ondata} non schierata`);
  if (chiamateAperte(m, s).length) throw new Error(`${m.id}: ondata ${s.ondata} con chiamate senza risposta`);
  const disp = inCampo(s, s.disposizione);
  const scoperto: Record<string, number> = {};
  const tensione: Record<string, number> = {};
  const aRiposo: Record<string, number> = {};
  for (const settore of m.mappa.settori) {
    const unita = Object.entries(disp).map(([r, ps]) => ({ r, ris: m.mappa.risorse[r]!, n: ps[settore.id] ?? 0 })).filter((u) => u.n > 0);
    let pressione = s.modifiche[settore.id] ?? 0;
    for (const ev of o.eventi) {
      if (ev.settore !== settore.id || (ev.se && !valuta(ev.se, s.variabili))) continue;
      let p = ev.pressione;
      const dimezzatori = unita.filter((u) => u.ris.dimezza?.includes(ev.tipo)).reduce((t, u) => t + u.n, 0);
      for (let i = 0; i < dimezzatori; i++) p = Math.floor(p / 2);
      pressione += p;
    }
    const copertura = unita.reduce((t, u) => t + u.n * (u.ris.efficacia[settore.tipo] ?? 0), 0);
    const sc = Math.max(0, pressione - copertura);
    const prima = s.tensione[settore.id] ?? 0;
    scoperto[settore.id] = sc;
    // qualunque unità presidia, anche il mediatore (C02-N05); rossi: C01O01 = sempre, C02N05 = solo con copertura
    const presidiato = spento('C01O01') || (spento('C02N05') ? copertura > 0 : unita.length > 0);
    tensione[settore.id] = lim(sc > 0 ? prima + sc : presidiato ? Math.floor(prima / 2) : prima);
    if (sc > 0) for (const u of unita) if (spento('C09F01') || !u.ris.fissa) aRiposo[u.r] = (aRiposo[u.r] ?? 0) + u.n;
  }
  const massimo = Math.max(s.variabili[VAR_TENSIONE] as number, ...Object.values(tensione), ...Object.values(s.tensione));
  const picco = Object.fromEntries(m.mappa.settori.map(({ id }) => [id, Math.max(s.tensione[id] ?? 0, tensione[id] ?? 0)]));
  // PO-094 (D-113): la fiducia premia il risultato dell'ondata: +1 se nessun settore è scoperto, −1 per ogni settore che degenera.
  // Prima la davano solo le scelte, e chi proteggeva la città la perdeva. Rosso __NO_PO094.
  const premio = spento('PO094') || !d.has(VAR_FIDUCIA) ? 0 : Object.values(tensione).some((x) => x >= DEGENERA) ? -Object.values(tensione).filter((x) => x >= DEGENERA).length : Object.values(scoperto).every((x) => x === 0) ? 1 : 0;
  const base: RapportoOndata = spento('C10P01') ? { n: s.ondata, scoperto, tensione, aRiposo } : { n: s.ondata, scoperto, tensione, aRiposo, picco };
  const rapporto: RapportoOndata = premio ? { ...base, fiducia: premio } : base;
  const conTensione = applica({ imposta: VAR_TENSIONE, valore: massimo }, s.variabili, d);
  const dopo: InCorso = {
    ...s, ondata: s.ondata + 1, tensione, riposo: aRiposo, disposizione: null,
    fisse: Object.fromEntries(Object.entries(m.mappa.risorse).filter(([, x]) => x.fissa).map(([r]) => [r, { ...(disp[r] ?? {}) }])), modifiche: {}, risposte: {},
    rapporti: [...s.rapporti, rapporto], variabili: premio ? applica({ aggiungi: VAR_FIDUCIA, valore: premio }, conTensione, d) : conTensione,
  };
  // PO-060: copia dello stato all'inizio dell'ondata dopo (senza le copie annidate), per poter ripartire da lì
  const { partenze, ...senza } = dopo;
  return missioneFinita(m, dopo) ? dopo : { ...dopo, partenze: { ...(partenze ?? {}), [dopo.ondata]: senza } };
}

/** Soglia di tensione oltre la quale nessun esito non fallito è più possibile: il più alto «al_massimo» su tensione_max
 *  fra gli esiti non falliti (Infinity se un esito non fallito non lo limita). C-016: tensione_max non scende mai. */
export function sogliaTensione(m: Missione): number {
  const tetto = (c: Condizione): number => ('tutte' in c ? Math.min(Infinity, ...c.tutte.map(tetto))
    : 'almeno_una' in c ? Math.max(-Infinity, ...c.almeno_una.map(tetto))
    : 'var' in c && c.var === VAR_TENSIONE && 'al_massimo' in c ? c.al_massimo : Infinity);
  return Math.max(-Infinity, ...m.esiti.filter((e) => !e.fallita).map((e) => tetto(e.se)));
}

/** Ondata da cui ripartire dopo un episodio perso (PO-060): quella in cui la tensione ha superato per la prima volta la
 *  soglia oltre cui non si vince più (C16-01: prima si cercava il massimo FINALE, e in un caso su quattro si ripartiva
 *  da un'ondata già persa; rosso __NO_C16R02). Senza la missione, o senza soglia: la prima che tocca il massimo finale.
 *  Rosso __NO_C16R01: sempre dall'inizio. */
export function ondataDaRiprendere(r: { rapporti: RapportoOndata[]; variabili: Variabili }, m?: Missione): number {
  if (spento('C16R01')) return 1;
  const picco = (x: RapportoOndata) => Math.max(...Object.values(x.picco ?? x.tensione));
  const soglia = m && !spento('C16R02') ? sogliaTensione(m) : Infinity;
  const oltre = Number.isFinite(soglia) ? r.rapporti.find((x) => picco(x) > soglia) : undefined;
  if (oltre) return oltre.n;
  const max = Number(r.variabili[VAR_TENSIONE] ?? 0);
  const k = r.rapporti.find((x) => picco(x) >= max);
  return k ? k.n : 1;
}

/** Stato per rigiocare dall'ondata n (PO-060); null se il salvataggio non ha la copia (salvataggi vecchi: si riparte dall'inizio). */
export function riprendiDallOndata(s: InCorso, n: number): InCorso | null {
  const p = s.partenze?.[n];
  if (!p) return null;
  return { ...p, partenze: Object.fromEntries(Object.entries(s.partenze ?? {}).filter(([k]) => Number(k) <= n)) };
}

export interface EsitoMissione { esito: Esito; variabili: Variabili; rapporti: RapportoOndata[]; scelte: InCorso['scelte'] }

export function concludiMissione(m: Missione, s: InCorso, d: Dich): EsitoMissione {
  if (!missioneFinita(m, s)) throw new Error(`${m.id}: giocate ${s.ondata - 1} ondate su ${m.ondate.length}`);
  const esito = m.esiti.find((e) => valuta(e.se, s.variabili));
  if (!esito) throw new Error(`${m.id}: nessun esito vero (soft-lock)`);
  let v = s.variabili;
  for (const e of esito.effetti) v = applica(e, v, d);
  return { esito, variabili: v, rapporti: s.rapporti, scelte: s.scelte };
}

/** Chi gioca: persona o bot. */
export interface Giocatore {
  schiera(m: Missione, s: InCorso): Disposizione;
  scegli(m: Missione, s: InCorso, c: Chiamata): string;
}

export function giocaMissione(m: Missione, iniziali: Variabili, d: Dich, g: Giocatore): EsitoMissione {
  let s = iniziaMissione(m, iniziali, d);
  while (!missioneFinita(m, s)) {
    s = schiera(m, s, g.schiera(m, s));
    for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = rispondi(m, s, c.id, g.scegli(m, s, c), d);
    s = chiudiOndata(m, s, d);
  }
  return concludiMissione(m, s, d);
}
