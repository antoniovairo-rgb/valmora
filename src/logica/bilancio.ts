// Bilancio di fine episodio (D-085, PO-036): «cosa ha aiutato, cosa ha pesato, perché queste stelle».
// Puro: legge le scelte fatte, i rapporti delle ondate e le condizioni delle stelle. Nessun testo: la resa
// traduce settori, risorse e variabili con le sue etichette. Rosso: __NO_C10B01 (bilancio vuoto).
// C38-03 (D-172): con il confronto (src/logica/confronto.ts) aiuto o peso si decide contro le altre risposte della stessa
// chiamata, non col saldo degli effetti della sola risposta. Rosso __NO_C38B01: di nuovo il saldo locale.
import { valuta } from './condizioni.ts';
import type { Confronto } from './confronto.ts';
import { spento } from '../interruttori.ts';
import { settoriDegenerati, type EsitoMissione } from './missione.ts';
import type { Condizione, EffettoMissione, Missione, Valore, Variabili } from './tipi.ts';

export interface Impatto { tipo: 'credito' | 'pressione' | 'tensione' | 'riserva'; dove?: string; valore: number; buono: boolean }
export interface VoceScelta { ondata: number; chiamata: string; opzione: string; impatti: Impatto[]; saldo: number; confronto?: Confronto; caricaColpito?: boolean; caricaDegenerato?: boolean; controcorrente?: boolean }
export interface Scoperto { ondata: number; settore: string; scoperto: number; tensione: number }
export interface Requisito { var: string; confronto: 'almeno' | 'al_massimo' | 'uguale' | 'altro'; soglia?: Valore; valore?: Valore; ok: boolean }
export interface Bilancio { aiuti: VoceScelta[]; pesi: VoceScelta[]; scoperti: Scoperto[]; altriScoperti?: number; stelle: { due: Requisito[]; tre: Requisito[] } }

// Peso di ogni effetto nel saldo di una scelta: positivo = ti ha aiutato.
function impatto(e: EffettoMissione): Impatto | null {
  if ('tensione' in e) return { tipo: 'tensione', dove: e.tensione, valore: e.valore, buono: e.valore < 0 };
  if ('pressione' in e) return { tipo: 'pressione', dove: e.pressione, valore: e.valore, buono: e.valore < 0 };
  if ('riserva' in e) return { tipo: 'riserva', dove: e.riserva, valore: e.valore, buono: e.valore > 0 };
  if ('aggiungi' in e && e.aggiungi === 'credito') return { tipo: 'credito', valore: e.valore, buono: e.valore > 0 };
  return null; // le variabili della storia non sono né buone né cattive: sono storia
}
const PESO = { credito: 1, pressione: 1, tensione: 1.5, riserva: 1 } as const;
/** C38-03: sotto questo saldo del confronto (punti di fallite + tacche di tensione) la risposta non ha aiutato né pesato.
 *  Misurato (stabilita-confronto.mjs): con 200 partite e soglia 5, aiuto↔peso opposto al riferimento di 800 in 3/1012. */
export const SOGLIA_CONFRONTO = 5;
const punti = (i: Impatto) => PESO[i.tipo] * Math.abs(i.valore) * (i.buono ? 1 : -1);

/** Le condizioni di una stella, una per riga, con il valore che hai ottenuto. */
export function requisiti(c: Condizione, v: Variabili): Requisito[] {
  if ('tutte' in c) return c.tutte.flatMap((x) => requisiti(x, v));
  if (!('var' in c)) return Object.keys(c).length ? [{ var: '?', confronto: 'altro', ok: valuta(c, v) }] : [];
  const confronto = 'almeno' in c ? 'almeno' : 'al_massimo' in c ? 'al_massimo' : 'uguale';
  const soglia = 'almeno' in c ? c.almeno : 'al_massimo' in c ? c.al_massimo : c.uguale;
  return [{ var: c.var, confronto, soglia, valore: v[c.var], ok: valuta(c, v) }];
}

export function bilancio(m: Missione, r: EsitoMissione, quante = 3, confronto?: Map<string, Confronto>): Bilancio {
  const stelle = { due: requisiti(m.stelle.due, r.variabili), tre: requisiti(m.stelle.tre, r.variabili) };
  if (spento('C10B01')) return { aiuti: [], pesi: [], scoperti: [], stelle };
  const opzioni = new Map(m.ondate.flatMap((o) => (o.chiamate ?? []).flatMap((c) => c.opzioni.map((x) => [`${c.id}/${x.id}`, x] as const))));
  const conConfronto = confronto && !spento('C38B01');
  const voci: VoceScelta[] = r.scelte.map((s) => {
    // C42-01 (D-185): all'ultima ondata le unità non si pagano più: la riserva non si conta come spesa. Rosso __NO_C42B01.
    const ultima = s.ondata === m.ondate.length && !spento('C42B01');
    const impatti = (opzioni.get(`${s.chiamata}/${s.opzione}`)?.effetti ?? []).map(impatto)
      .filter((x): x is Impatto => !!x && !(ultima && x.tipo === 'riserva' && x.valore < 0));
    if (!conConfronto) return { ...s, impatti, saldo: impatti.reduce((t, i) => t + punti(i), 0) };
    const c = confronto.get(`${s.chiamata}/${s.opzione}`); // senza alternative giocate: né aiuto né peso
    return { ...s, impatti, saldo: c?.saldo ?? 0, ...(c ? { confronto: c } : {}) };
  });
  if (conConfronto && !spento('C40B01')) { // C40-01 (D-180): il confronto non smentisce la partita giocata. Rosso __NO_C40B01.
    for (const x of voci) {
      const colpiti = new Set(r.rapporti.filter((o) => o.n >= x.ondata).flatMap((o) => Object.entries(o.scoperto).filter(([, n]) => n > 0).map(([k]) => k)));
      const sui = x.impatti.filter((i) => (i.tipo === 'pressione' || i.tipo === 'tensione') && i.dove && colpiti.has(i.dove));
      // ha caricato un settore poi scoperto (o degenerato): non è un aiuto; l'ha scaricato: non è un peso
      if ((x.saldo > 0 && sui.some((i) => i.valore > 0)) || (x.saldo < 0 && sui.some((i) => i.valore < 0))) x.saldo = 0;
      // C41-01 (D-182): mai un peso che tocca solo settori rimasti sotto controllo. Rosso __NO_C41B01.
      const settori = x.impatti.filter((i) => (i.tipo === 'pressione' || i.tipo === 'tensione') && i.dove);
      if (!spento('C41B01') && x.saldo < 0 && settori.length && !sui.length) x.saldo = 0;
      // C41-02 (D-182): una risposta senza effetti visibili non è né aiuto né peso. Rosso __NO_C41B02.
      if (!spento('C41B02') && !x.impatti.length) x.saldo = 0;
      if (!spento('C41B01')) x.caricaColpito = sui.some((i) => i.valore > 0);
      // C42-05 (D-185): non è un aiuto una risposta su un settore rimasto scoperto nella stessa ondata. Rosso __NO_C42B05.
      const scopertiOra = new Set(Object.entries(r.rapporti.find((o) => o.n === x.ondata)?.scoperto ?? {}).filter(([, n]) => n > 0).map(([k]) => k));
      if (!spento('C42B05') && x.saldo > 0 && settori.some((i) => scopertiOra.has(i.dove!))) x.saldo = 0;
      // C42-03: ha caricato un settore che poi degenera (quest'ondata o dopo)
      const degenerati = new Set(r.rapporti.filter((o) => o.n >= x.ondata).flatMap((o) => settoriDegenerati(m, o)));
      // (e non ha scaricato un settore colpito: per C40-01 quella non è mai un peso)
      x.caricaDegenerato = settori.some((i) => i.valore > 0 && degenerati.has(i.dove!)) && !sui.some((i) => i.valore < 0);
    }
  }
  if (conConfronto) { // sotto soglia né aiuto né peso; se non resta nulla, la sola risposta col confronto più forte (D-085)
    const forte = voci.reduce<VoceScelta | null>((a, x) => (Math.abs(x.saldo) > Math.abs(a?.saldo ?? 0) ? x : a), null);
    for (const x of voci) if (Math.abs(x.saldo) < SOGLIA_CONFRONTO && (x !== forte || Math.abs(x.saldo) === 0 || voci.some((y) => Math.abs(y.saldo) >= SOGLIA_CONFRONTO))) x.saldo = 0;
    // C42-03 (D-185): chi ha caricato un settore poi degenerato è un peso anche sotto soglia (fino a `quante`), dopo i pesi
    // sopra soglia; fra loro conta il confronto. Solo se il confronto è davvero sotto soglia e non lo dice migliore delle altre
    // di 5 punti di fallite (C38-03). Rosso __NO_C42B03.
    if (!spento('C42B03')) for (const x of voci) {
      const c = x.confronto;
      if (x.caricaDegenerato && x.saldo === 0 && (!c || (c.saldo < SOGLIA_CONFRONTO && c.falliteAltre - c.falliteSe < 5))) x.saldo = -0.01 - Math.max(0, -(c?.saldo ?? 0)) / 1000;
    }
  }
  const scoperti = r.rapporti.flatMap((x) => Object.entries(x.scoperto).filter(([, n]) => n > 0)
    .map(([settore, n]) => ({ ondata: x.n, settore, scoperto: n, tensione: x.tensione[settore] ?? 0 })));
  const ordinati = scoperti.sort((a, b) => b.scoperto - a.scoperto || a.ondata - b.ondata); const mostrati = ordinati.slice(0, quante);
  // C45-03 (D-203): un aiuto i cui effetti, sommati, non aiutano (e36 «+2 pressione») o un peso che non pesa (e05 «+1 fiducia,
  // +1 pressione») sta nella lista per il confronto con le altre risposte (D-172): la resa lo dice. Rosso __NO_C4503.
  if (conConfronto && !spento('C4503')) for (const x of voci) {
    const locale = x.impatti.reduce((t, i) => t + punti(i), 0);
    // solo se la lista viene davvero dal confronto (non dal peso C42-03 di chi ha caricato un settore degenerato)
    const dalConfronto = !!x.confronto && Math.sign(x.confronto.saldo) === Math.sign(x.saldo);
    if (dalConfronto && x.impatti.length && ((x.saldo > 0 && locale <= 0) || (x.saldo < 0 && locale >= 0))) x.controcorrente = true;
  }
  return {
    aiuti: voci.filter((x) => x.saldo > 0).sort((a, b) => b.saldo - a.saldo).slice(0, quante),
    // C41-01: prima i pesi che hanno caricato un settore poi scoperto o degenerato, poi gli altri; dentro, per saldo
    pesi: voci.filter((x) => x.saldo < 0).sort((a, b) => Number(!!b.caricaColpito) - Number(!!a.caricaColpito) || a.saldo - b.saldo).slice(0, quante),
    scoperti: mostrati,
    // C42-04 (D-185): settori scoperti che la lista tagliata non nomina («e altri N settori»). Rosso __NO_C42B04: 0.
    altriScoperti: spento('C42B04') ? 0 : new Set(ordinati.filter((x) => !mostrati.some((y) => y.settore === x.settore)).map((x) => x.settore)).size,
    stelle,
  };
}
