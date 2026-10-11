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
import { applica, valuta } from './condizioni.ts';
import { spento } from '../interruttori.ts';
import type { Chiamata, Dichiarazione, Disposizione, EffettoMissione, Esito, Missione, Variabili } from './tipi.ts';

export const VAR_TENSIONE = 'tensione_max';
export const TENSIONE_MAX = 10;
const lim = (x: number) => Math.max(0, Math.min(TENSIONE_MAX, x));
type Dich = Map<string, Dichiarazione>;

export interface RapportoOndata { n: number; scoperto: Record<string, number>; tensione: Record<string, number>; aRiposo: Record<string, number> }

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
}

const ondataDi = (m: Missione, s: InCorso) => {
  const o = m.ondate[s.ondata - 1];
  if (!o) throw new Error(`${m.id}: l'ondata ${s.ondata} non esiste`);
  return o;
};

export function iniziaMissione(m: Missione, iniziali: Variabili, d: Dich): InCorso {
  if (!d.has(VAR_TENSIONE)) throw new Error(`stato.json deve dichiarare «${VAR_TENSIONE}»`);
  const zero = (ids: string[]) => Object.fromEntries(ids.map((id) => [id, 0]));
  const risorse = Object.keys(m.mappa.risorse);
  return {
    missione: m.id, ondata: 1, tensione: zero(m.mappa.settori.map((x) => x.id)), riserva: zero(risorse), riposo: zero(risorse),
    disposizione: null, modifiche: {}, risposte: {}, scelte: [], rapporti: [], variabili: { ...iniziali, [VAR_TENSIONE]: 0 },
  };
}

export const missioneFinita = (m: Missione, s: InCorso): boolean => s.ondata > m.ondate.length;

/** Unità che si possono schierare in questa ondata. */
export function disponibili(m: Missione, s: InCorso): Record<string, number> {
  return Object.fromEntries(Object.entries(m.mappa.risorse).map(([r, x]) => [r, Math.max(0, x.quantita + (s.riserva[r] ?? 0) - (s.riposo[r] ?? 0))]));
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
  const disp = s.disposizione;
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
    if (sc > 0) for (const u of unita) aRiposo[u.r] = (aRiposo[u.r] ?? 0) + u.n;
  }
  const massimo = Math.max(s.variabili[VAR_TENSIONE] as number, ...Object.values(tensione), ...Object.values(s.tensione));
  const rapporto = { n: s.ondata, scoperto, tensione, aRiposo };
  return {
    ...s, ondata: s.ondata + 1, tensione, riposo: aRiposo, disposizione: null, modifiche: {}, risposte: {},
    rapporti: [...s.rapporti, rapporto], variabili: applica({ imposta: VAR_TENSIONE, valore: massimo }, s.variabili, d),
  };
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
