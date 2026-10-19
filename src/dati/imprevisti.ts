// Imprevisti (PO-022, D-190): una volta per ondata una chiamata arriva fuori ordine, interrompe la sequenza e va risolta
// subito, senza tempo. Stanno in data/imprevisti/<episodio>.json, separati dalle missioni, e si innestano al caricamento
// nella lista delle chiamate dell'ondata, dopo «dopo» chiamate: da lì in poi sono chiamate come le altre (stesso motore,
// stesso bot, stesse regole di uscita), col segno «imprevisto». Deterministici: la posizione è nei dati.
// Rosso __NO_S14I01: nessun innesto (il gioco di prima).
import { spento } from '../interruttori.ts';
import type { Chiamata, Missione } from '../logica/tipi.ts';

export interface Imprevisto { ondata: number; dopo: number; chiamata: Chiamata }
export interface FileImprevisti { id: string; imprevisti: Imprevisto[] }

/** La missione con gli imprevisti innestati (copia; la missione di partenza non cambia). */
export function innestaMissione(m: Missione, f?: FileImprevisti): Missione {
  if (!f || spento('S14I01')) return m;
  const ondate = m.ondate.map((o) => {
    const x = f.imprevisti.find((i) => i.ondata === o.n);
    if (!x || (o.chiamate ?? []).some((c) => c.id === x.chiamata.id)) return o; // idempotente: già innestato
    const chiamate = [...(o.chiamate ?? [])];
    chiamate.splice(x.dopo, 0, { ...x.chiamata, imprevisto: true });
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
    const viste = new Set<number>();
    f.imprevisti.forEach((x, i) => {
      const dove = `${k}.imprevisti[${i}]`, o = m.ondate.find((y) => y.n === x.ondata);
      if (viste.has(x.ondata)) p.push(`${dove}: un solo imprevisto per ondata (D-190), ondata ${x.ondata} ripetuta`);
      viste.add(x.ondata);
      if (!o) { p.push(`${dove}: l'ondata ${x.ondata} non esiste in ${f.id}`); return; }
      const n = (o.chiamate ?? []).filter((c) => !c.imprevisto).length;
      // interrompe: almeno una chiamata prima e una dopo
      if (x.dopo >= n) p.push(`${dove}: «dopo» ${x.dopo} con ${n} chiamate nell'ondata: deve interrompere, non chiudere (al massimo ${n - 1})`);
      if (x.chiamata.se || x.chiamata.dopo || x.chiamata.senza) p.push(`${dove}: l'imprevisto arriva sempre (niente «se», «dopo», «senza»)`);
      if (m.ondate.some((y) => (y.chiamate ?? []).some((c) => c.id === x.chiamata.id && !(c.imprevisto && y.n === x.ondata)))) p.push(`${dove}: id «${x.chiamata.id}» già usato da una chiamata di ${f.id}`);
      // «risposte senza fiducia gratuita» (D-190, D-160): un imprevisto non dà mai fiducia; può toglierla (a chi lascia correre)
      // C42-01/05: all'ultima ondata non c'è una prossima, un'unità impegnata non costerebbe nulla
      const ultima = x.ondata === Math.max(...m.ondate.map((y) => y.n));
      x.chiamata.opzioni.forEach((o2, h) => {
        if (ultima && o2.effetti.some((e) => 'riserva' in e && e.valore < 0)) p.push(`${dove}.opzioni[${h}]: all'ultima ondata un imprevisto non impegna unità (C42-01)`);
        if (o2.effetti.some((e) => ('imposta' in e && e.imposta === 'credito') || ('aggiungi' in e && e.aggiungi === 'credito' && e.valore > 0))) p.push(`${dove}.opzioni[${h}]: un imprevisto non dà fiducia (D-190)`);
        if (o2.se) p.push(`${dove}.opzioni[${h}]: le opzioni di un imprevisto non hanno condizioni (uscita sempre garantita)`);
      });
    });
  }
  return p;
}
