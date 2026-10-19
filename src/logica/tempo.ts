// PROTOTIPO S-14 (PO-022, D-188): eventi in tempo reale. Solo e02, solo con globalThis.__VALMORA_TEMPO_REALE = 'a' | 'b' | 'c'
// (spento di norma: il gioco resta identico). La logica non conosce il tempo reale: riceve «la chiamata è scaduta» o
// «sono passati N minuti di gioco» come azioni, così il bot e le catene giocano con un orologio simulato e un seme.
//  a) ogni chiamata ha un conto alla rovescia; scaduto, vale la risposta predefinita (scadi).
//  b) una chiamata «improvvisa» per ondata interrompe e chiede una risposta entro pochi secondi; scaduta, come a.
//  c) un orologio di partita: ogni MINUTI_PEGGIORA minuti di gioco i settori con un evento, scoperti e non guardati,
//     prendono +1 di pressione nell'ondata in corso (peggiora).
import type { Caso } from './caso.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, iniziaMissione, missioneFinita, opzioniValide, rispondi, schiera, inCampo, type EsitoMissione, type Giocatore, type InCorso } from './missione.ts';
import type { Chiamata, Dichiarazione, Missione, Variabili } from './tipi.ts';

type Dich = Map<string, Dichiarazione>;
export type Modo = 'a' | 'b' | 'c';
export const EPISODI_PROTOTIPO = new Set(['e02']);

/** Modo attivo per questa missione, o null (gioco di sempre). */
export function modoTempo(m: Missione): Modo | null {
  const x = (globalThis as { __VALMORA_TEMPO_REALE?: unknown }).__VALMORA_TEMPO_REALE;
  return (x === 'a' || x === 'b' || x === 'c') && EPISODI_PROTOTIPO.has(m.id) ? x : null;
}

/** Tempo regolabile dal giocatore: moltiplica i secondi; «senza» toglie il conto alla rovescia. */
export const RITMI = { normale: 1, lento: 1.5, molto_lento: 2, senza: Infinity } as const;
export type Ritmo = keyof typeof RITMI;
export const SECONDI_CHIAMATA = 20;   // a
export const SECONDI_IMPROVVISA = 12; // b
export const MINUTI_PEGGIORA = 3;     // c
export const SECONDI_PER_MINUTO = 10; // c: un minuto di gioco ogni 10 s reali a ritmo normale

/** b: la chiamata improvvisa di ogni ondata (e02: dati del prototipo; nella fase 2 un campo dello schema). */
const IMPROVVISE: Record<string, Record<number, string>> = { e02: { 1: 'ritardo', 2: 'corteo_viale', 3: 'fumogeni_ospiti', 4: 'vetrine' } };
export const improvvisa = (m: Missione, n: number, c: Chiamata) => IMPROVVISE[m.id]?.[n] === c.id;

/** Risposta che vale se il tempo scade: «nessuno risponde» o la procedura standard (e02: scelte del prototipo). */
const PREDEFINITE: Record<string, Record<string, string>> = {
  e02: {
    ritardo: 'lasciali', responsabile: 'non_fidarti', selfie: 'ignora_rete', biglietti_voce: 'lascia_vendere',
    secondo_treno: 'normale', tornelli_falsi: 'respingi', corteo_viale: 'corteo_no', comitato_quartiere: 'comunicato', presidente_aiuta: 'declina_aiuto',
    striscione_ospiti: 'ignora_str', fumogeni_ospiti: 'lascia_fumo2', caldo_casa: 'niente', biglietti_rete: 'lascia_perdere',
    risultato: 'trattieni_ospiti', ultimo_treno: 'parte', responsabile_saluta: 'rifiuta_saluto', vetrine: 'chiudi_viale',
  },
};

/** Opzione predefinita valida in questo stato: quella dei dati, altrimenti l'ultima valida (mai nessuna: niente soft-lock). */
export function predefinita(m: Missione, s: InCorso, c: Chiamata): string {
  const valide = opzioniValide(c, s, m);
  const x = PREDEFINITE[m.id]?.[c.id];
  return (valide.find((o) => o.id === x) ?? valide.at(-1)!).id;
}

/** Secondi del conto alla rovescia per la chiamata, o null se non ce l'ha. */
export function secondiPer(modo: Modo | null, m: Missione, s: InCorso, c: Chiamata, ritmo: Ritmo): number | null {
  if (modo === 'a') return ritmo === 'senza' ? null : Math.round(SECONDI_CHIAMATA * RITMI[ritmo]);
  if (modo === 'b' && improvvisa(m, s.ondata, c)) return ritmo === 'senza' ? null : Math.round(SECONDI_IMPROVVISA * RITMI[ritmo]);
  return null;
}

/** Il tempo della chiamata è scaduto: vale la predefinita, segnata «scaduta» fra le scelte. */
export function scadi(m: Missione, s: InCorso, chiamata: string, d: Dich): InCorso {
  const c = chiamateAperte(m, s).find((x) => x.id === chiamata);
  if (!c) throw new Error(`${m.id}: la chiamata «${chiamata}» non è aperta`);
  const t = rispondi(m, s, chiamata, predefinita(m, s, c), d);
  const ultima = { ...t.scelte.at(-1)!, scaduta: true };
  return { ...t, scelte: [...t.scelte.slice(0, -1), ultima] };
}

/** c: settori che peggiorano se passano minuti di gioco mentre si guarda «guardato»: un evento nell'ondata, nessuna unità. */
export function settoriCheCorrono(m: Missione, s: InCorso, guardato?: string): string[] {
  const o = m.ondate[s.ondata - 1];
  if (!o || !s.disposizione) return [];
  const campo = inCampo(s, s.disposizione);
  const presenti = (k: string) => Object.values(campo).some((ps) => (ps[k] ?? 0) > 0);
  return [...new Set(o.eventi.map((e) => e.settore))].filter((k) => k !== guardato && !presenti(k));
}

/** c: passano «minuti» di gioco (da «trascorsi» a «trascorsi + minuti»); ogni soglia di MINUTI_PEGGIORA dà +1 di pressione. */
export function peggiora(m: Missione, s: InCorso, trascorsi: number, minuti: number, guardato?: string): InCorso {
  const scatti = Math.floor((trascorsi + minuti) / MINUTI_PEGGIORA) - Math.floor(trascorsi / MINUTI_PEGGIORA);
  if (scatti <= 0) return s;
  const modifiche = { ...s.modifiche };
  for (const k of settoriCheCorrono(m, s, guardato)) modifiche[k] = (modifiche[k] ?? 0) + scatti;
  return { ...s, modifiche };
}

/** Orologio simulato per bot e catene: con probabilità «pScade» il giocatore non risponde in tempo (a, b); in c ogni
 *  chiamata dura da 1 a «minutiMax» minuti di gioco. Tutto dal seme: stessa partita a ogni giro. */
export interface Orologio { modo: Modo; pScade: number; minutiMax: number; caso: Caso }

export function giocaConOrologio(m: Missione, iniziali: Variabili, d: Dich, g: Giocatore, o: Orologio): EsitoMissione & { scadute: number } {
  let s = iniziaMissione(m, iniziali, d), scadute = 0;
  while (!missioneFinita(m, s)) {
    s = schiera(m, s, g.schiera(m, s));
    let minuti = 0;
    for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) {
      if (o.modo === 'c') { const dm = o.caso.intero(1, o.minutiMax); s = peggiora(m, s, minuti, dm, c.settore); minuti += dm; }
      const aTempo = o.modo === 'a' || (o.modo === 'b' && improvvisa(m, s.ondata, c));
      if (aTempo && o.caso.numero() < o.pScade) { s = scadi(m, s, c.id, d); scadute++; }
      else s = rispondi(m, s, c.id, g.scegli(m, s, c), d);
    }
    s = chiudiOndata(m, s, d);
  }
  return { ...concludiMissione(m, s, d), scadute };
}
