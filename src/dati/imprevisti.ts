// Imprevisti (PO-022, D-190): una volta per ondata una chiamata arriva fuori ordine, interrompe la sequenza e va risolta
// subito, senza tempo. Stanno in data/imprevisti/<episodio>.json, separati dalle missioni, e si innestano al caricamento
// nella lista delle chiamate dell'ondata, dopo «dopo» chiamate: da lì in poi sono chiamate come le altre (stesso motore,
// stesso bot, stesse regole di uscita), col segno «imprevisto».
// D-241 (PO-152): ogni ondata può avere un mazzo di 2-3 carte; la prima del file è la classica (al posto «dopo»), le
// altre si accodano in fondo all'ondata (dopo le varianti) con «carta» 1, 2. Ogni carta può dichiarare la «finestra» [da, a] dei posti
// possibili. «varianti»: un'altra versione di una chiamata della missione (stessi effetti, altro racconto), accodata con
// «variante_di». Cosa arriva davvero e dove lo decide il seme di partita (src/logica/partita.ts): deterministico.
// Rosso __NO_S14I01: nessun innesto (il gioco di prima).
import { spento } from '../interruttori.ts';
import type { Chiamata, Missione } from '../logica/tipi.ts';

export interface Imprevisto { ondata: number; dopo?: number; finestra?: [number, number]; chiamata: Chiamata }
export interface Variante { ondata: number; di: string; chiamata: Chiamata }
export interface FileImprevisti { id: string; imprevisti: Imprevisto[]; varianti?: Variante[] }

/** La missione con gli imprevisti innestati (copia; la missione di partenza non cambia). */
export function innestaMissione(m: Missione, f?: FileImprevisti): Missione {
  if (!f || spento('S14I01')) return m;
  const ondate = m.ondate.map((o) => {
    if ((o.chiamate ?? []).some((c) => c.imprevisto || c.variante_di)) return o; // idempotente: già innestato
    const carte = f.imprevisti.filter((i) => i.ondata === o.n), varianti = (f.varianti ?? []).filter((v) => v.ondata === o.n);
    if (!carte.length && !varianti.length) return o;
    const chiamate = [...(o.chiamate ?? [])];
    const [x, ...altre] = carte;
    const finestra = (i: Imprevisto): [number, number] => i.finestra ?? [i.dopo ?? 1, i.dopo ?? 1];
    if (x) chiamate.splice(x.dopo ?? 1, 0, { ...x.chiamata, imprevisto: true, finestra: finestra(x) });
    // D-241 idea C: le opzioni della variante ereditano gli effetti ritardati dell'originale (stessa chiamata, altro racconto)
    const eredita = (v: Variante) => { const orig = (o.chiamate ?? []).find((c) => c.id === v.di);
      return v.chiamata.opzioni.map((x) => { const e = orig?.opzioni.find((y) => y.id === x.id)?.effetti_dopo; return e && !x.effetti_dopo ? { ...x, effetti_dopo: e } : x; }); };
    for (const v of varianti) chiamate.push({ ...v.chiamata, opzioni: eredita(v), variante_di: v.di });
    altre.forEach((i, k) => chiamate.push({ ...i.chiamata, imprevisto: true, finestra: finestra(i), carta: k + 1 }));
    return { ...o, chiamate };
  });
  return { ...m, ondate };
}

/** Su una mappa «percorso relativo a data/ → contenuto»: le missioni con i loro imprevisti innestati, e i testi degli
 *  imprevisti (D-192: testi/it/imp_eNN.json, fuori dai testi rifiniti) uniti a quelli dell'episodio, così ogni guardiano
 *  che legge «testi/it/eNN.json» li vede. */
export function innesta(file: Record<string, unknown>): Record<string, unknown> {
  const out = { ...file };
  for (const [k, v] of Object.entries(file)) {
    const ep = /^testi\/it\/imp_(e\d+)\.json$/.exec(k)?.[1];
    if (!ep) continue;
    out[`testi/it/${ep}.json`] = { ...(out[`testi/it/${ep}.json`] as object | undefined), ...(v as object) };
    delete out[k];
  }
  for (const [k, v] of Object.entries(file)) {
    const id = /^imprevisti\/([a-z0-9_]+)\.json$/.exec(k)?.[1];
    const m = id && out[`missioni/${id}.json`];
    if (m) out[`missioni/${id}.json`] = innestaMissione(m as Missione, v as FileImprevisti);
  }
  return out;
}

/** Controlli di significato (la struttura la controlla lo schema). Vale sui file grezzi e su quelli già innestati. */
export function controllaImprevisti(file: Record<string, unknown>): string[] {
  const p: string[] = [];
  for (const [k, v] of Object.entries(file)) {
    if (!/^imprevisti\//.test(k)) continue;
    const f = v as FileImprevisti, m = file[`missioni/${f.id}.json`] as Missione | undefined;
    if (!m) { p.push(`${k}: la missione «${f.id}» non esiste`); continue; }
    const viste = new Map<number, number>();
    const usato = (id: string, ok: (c: Chiamata, n: number) => boolean) => m.ondate.some((y) => (y.chiamate ?? []).some((c) => c.id === id && !ok(c, y.n)));
    const idNuovi = new Set<string>();
    f.imprevisti.forEach((x, i) => {
      const dove = `${k}.imprevisti[${i}]`, o = m.ondate.find((y) => y.n === x.ondata);
      const carta = viste.get(x.ondata) ?? 0;
      viste.set(x.ondata, carta + 1);
      // D-241: un mazzo di 1-3 carte per ondata; la prima (la classica) ha il suo posto «dopo»
      if (carta >= 3) p.push(`${dove}: al massimo 3 imprevisti per ondata (mazzo D-241), ondata ${x.ondata}`);
      if (carta === 0 && x.dopo === undefined) p.push(`${dove}: la prima carta dell'ondata ${x.ondata} è la classica e dichiara «dopo»`);
      if (x.dopo === undefined && !x.finestra) p.push(`${dove}: serve «dopo» o «finestra»`);
      if (!o) { p.push(`${dove}: l'ondata ${x.ondata} non esiste in ${f.id}`); return; }
      const n = (o.chiamate ?? []).filter((c) => !c.imprevisto && !c.variante_di).length;
      // interrompe: almeno una chiamata prima e una dopo, sia al posto classico sia in tutta la finestra
      if (x.dopo !== undefined && x.dopo >= n) p.push(`${dove}: «dopo» ${x.dopo} con ${n} chiamate nell'ondata: deve interrompere, non chiudere (al massimo ${n - 1})`);
      if (x.finestra) {
        const [da, a] = x.finestra;
        if (da < 1 || a > n - 1 || da > a) p.push(`${dove}: finestra [${da}, ${a}] fuori da [1, ${n - 1}] (deve interrompere, D-241)`);
        if (x.dopo !== undefined && (x.dopo < da || x.dopo > a)) p.push(`${dove}: «dopo» ${x.dopo} fuori dalla sua finestra [${da}, ${a}]`);
      }
      if (x.chiamata.se || x.chiamata.dopo || x.chiamata.senza) p.push(`${dove}: l'imprevisto arriva sempre (niente «se», «dopo», «senza»)`);
      if (idNuovi.has(x.chiamata.id) || usato(x.chiamata.id, (c, n2) => !!c.imprevisto && n2 === x.ondata)) p.push(`${dove}: id «${x.chiamata.id}» già usato da una chiamata di ${f.id}`);
      idNuovi.add(x.chiamata.id);
      // «risposte senza fiducia gratuita» (D-190, D-160): un imprevisto non dà mai fiducia; può toglierla (a chi lascia correre)
      // C42-01/05: all'ultima ondata non c'è una prossima, un'unità impegnata non costerebbe nulla
      const ultima = x.ondata === Math.max(...m.ondate.map((y) => y.n));
      x.chiamata.opzioni.forEach((o2, h) => {
        if (ultima && o2.effetti.some((e) => 'riserva' in e && e.valore < 0)) p.push(`${dove}.opzioni[${h}]: all'ultima ondata un imprevisto non impegna unità (C42-01)`);
        if (o2.effetti.some((e) => ('imposta' in e && e.imposta === 'credito') || ('aggiungi' in e && e.aggiungi === 'credito' && e.valore > 0))) p.push(`${dove}.opzioni[${h}]: un imprevisto non dà fiducia (D-190)`);
        if (o2.se) p.push(`${dove}.opzioni[${h}]: le opzioni di un imprevisto non hanno condizioni (uscita sempre garantita)`);
      });
      p.push(...modelloImprevisto(x.chiamata, dove));
    });
    p.push(...controllaVarianti(k, f, m, idNuovi));
  }
  return p;
}

const uguali = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

/** D-241: una variante è la stessa chiamata raccontata in un altro modo. Stessi settore, condizioni e opzioni (id, effetti,
 *  condizioni), testi diversi; al massimo una per ondata; l'originale non è citato da nessun «dopo» (la variante lo
 *  sostituisce: un «gia»/«mai» su di lui cambierebbe la partita). */
function controllaVarianti(k: string, f: FileImprevisti, m: Missione, idNuovi: Set<string>): string[] {
  const p: string[] = [], ondate = new Set<number>();
  const citati = new Set<string>();
  const cita = (x?: { gia?: string[]; mai?: string[] }) => [...(x?.gia ?? []), ...(x?.mai ?? [])].forEach((y) => citati.add(y.split('/')[0]!));
  for (const o of m.ondate) for (const c of o.chiamate ?? []) { cita(c.dopo); c.opzioni.forEach((x) => cita(x.dopo)); }
  m.esiti.forEach((e) => cita(e.dopo));
  (f.varianti ?? []).forEach((v, i) => {
    const dove = `${k}.varianti[${i}]`, c = v.chiamata;
    const orig = m.ondate.find((y) => y.n === v.ondata)?.chiamate?.find((x) => x.id === v.di && !x.imprevisto && !x.variante_di);
    if (ondate.has(v.ondata)) p.push(`${dove}: una sola variante per ondata (D-241), ondata ${v.ondata} ripetuta`);
    ondate.add(v.ondata);
    if (!orig) { p.push(`${dove}: la chiamata «${v.di}» non è nell'ondata ${v.ondata} di ${f.id}`); return; }
    if (idNuovi.has(c.id) || m.ondate.some((y) => (y.chiamate ?? []).some((x) => x.id === c.id && x.variante_di !== v.di))) p.push(`${dove}: id «${c.id}» già usato in ${f.id}`);
    idNuovi.add(c.id);
    if (citati.has(v.di)) p.push(`${dove}: «${v.di}» è citata da un «dopo»: la variante cambierebbe la partita`);
    for (const campo of ['settore', 'se', 'dopo', 'senza'] as const) if (!uguali(c[campo], orig[campo])) p.push(`${dove}: «${campo}» diverso da «${v.di}» (stessa chiamata, altro racconto)`);
    if (c.testo === orig.testo) p.push(`${dove}: stesso testo di «${v.di}»`);
    if (c.opzioni.length !== orig.opzioni.length) p.push(`${dove}: ${c.opzioni.length} opzioni invece di ${orig.opzioni.length}`);
    else c.opzioni.forEach((x, h) => {
      const y = orig.opzioni[h]!;
      if (x.id !== y.id || !uguali(x.effetti, y.effetti) || !uguali(x.se, y.se) || !uguali(x.dopo, y.dopo)) p.push(`${dove}.opzioni[${h}]: id, effetti e condizioni come «${v.di}/${y.id}»`);
      if (x.effetti_dopo) p.push(`${dove}.opzioni[${h}]: «effetti_dopo» non si scrive nella variante, lo eredita da «${v.di}/${y.id}»`);
    });
  });
  return p;
}

/** C44-01 (D-194, D-201): lo stesso modello in tutti i 36 episodi. Tre risposte, solo pressione e tensione (nessuna unità
 *  impegnata; la fiducia segue la regola qui sopra); la pressione si muove solo sul settore dell'imprevisto, da −3 a +1
 *  (quanto lo tara l'episodio; +1 nelle trappole).
 *  [0] «intervieni»: +1/+2 di tensione su UN altro settore; [1] «arrangia»: +1 sul settore; [2] «lascia correre»: niente. */
export function modelloImprevisto(c: Chiamata, dove: string): string[] {
  const p: string[] = [], s = c.settore, o = c.opzioni;
  if (o.length !== 3) return [`${dove}: tre risposte (intervieni, arrangia, lascia correre), non ${o.length}`];
  o.forEach((x, h) => {
    for (const e of x.effetti) {
      if ('aggiungi' in e && e.aggiungi === 'credito') continue; // la fiducia la regola D-190 qui sopra (toglierla si può)
      if (!('pressione' in e) && !('tensione' in e)) p.push(`${dove}.opzioni[${h}]: solo pressione e tensione, niente ${JSON.stringify(e)} (unità impegnate, D-194)`);
      else if ('pressione' in e && (e.pressione !== s || e.valore < -3 || e.valore > 1)) p.push(`${dove}.opzioni[${h}]: la pressione si muove solo sul settore dell'imprevisto, da −3 a +1 (trappole)`);
    }
  });
  const tensioni = (h: number) => o[h]!.effetti.flatMap((e) => ('tensione' in e ? [e] : []));
  const [t0, t1] = [tensioni(0), tensioni(1)];
  if (t0.length !== 1 || t0[0]!.tensione === s || t0[0]!.valore < 1 || t0[0]!.valore > 2) p.push(`${dove}.opzioni[0]: «intervieni» alza di 1-2 la tensione su un altro settore`);
  if (t1.length !== 1 || t1[0]!.tensione !== s || t1[0]!.valore !== 1) p.push(`${dove}.opzioni[1]: «arrangia» alza di 1 la tensione sul settore`);
  if (o[2]!.effetti.length) p.push(`${dove}.opzioni[2]: «lascia correre» senza effetti (D-194)`);
  return p;
}
