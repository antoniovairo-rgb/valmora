// Controlli del consolidamento (D-100, D-101). Uso: node tools/consolidamento.mjs [eNN …] — esce 1 se ci sono problemi.
// 1) lunghezze: battute/chiamate/risposte/informazioni/accenni ≤ 140 caratteri, verbali ≤ 220, introduzione ≤ 2 battute;
// 2) variabili di storia (stato.json, tranne tensione_max e credito): ognuna impostata da almeno un'opzione e letta da almeno
//    un episodio successivo (condizione «se» di chiamata/opzione/evento o esito);
// 3) nessuna missione resta «bozza».
import { leggiDati } from './dati-disco.mjs';
export const MAX = { breve: 140, verbale: 220, intro: 2 };
export function controllaConsolidamento(dati, soli = null) {
  const p = []; const T = Object.assign({}, ...Object.entries(dati).filter(([k]) => k.startsWith('testi/')).map(([, v]) => v));
  const testo = (rif) => (rif && T[rif.replace(/^testi:/, '')]) ?? '';
  const ms = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m).sort((a, b) => a.episodio - b.episodio);
  const imposta = {}, legge = {};
  const leggi = (c, ep) => { if (!c || typeof c !== 'object') return; if ('var' in c) (legge[c.var] ??= []).push(ep);
    for (const k of ['tutte', 'almeno_una']) (c[k] ?? []).forEach((x) => leggi(x, ep)); if (c.non) leggi(c.non, ep); };
  for (const m of ms) {
    const mio = !soli || soli.includes(m.id); const ep = m.episodio;
    if (mio && m.bozza) p.push(`${m.id}: è ancora una bozza`);
    if (mio && (m.introduzione ?? []).length > MAX.intro) p.push(`${m.id}: introduzione di ${m.introduzione.length} battute (max ${MAX.intro})`);
    const brevi = [...(m.introduzione ?? []), ...m.briefing.map((b) => b.testo)];
    for (const o of m.ondate) for (const c of o.chiamate ?? []) {
      brevi.push(c.testo, c.commento); leggi(c.se, ep);
      for (const x of c.opzioni) { brevi.push(x.testo, x.costo, x.risposta); leggi(x.se, ep);
        for (const e of x.effetti) if ('imposta' in e || 'aggiungi' in e) (imposta[e.imposta ?? e.aggiungi] ??= []).push(ep); }
    }
    for (const o of m.ondate) for (const e of o.eventi) leggi(e.se, ep);
    for (const e of m.esiti) { leggi(e.se, ep); if (mio && testo(e.verbale).length > MAX.verbale) p.push(`${m.id}: verbale «${e.id}» di ${testo(e.verbale).length} caratteri (max ${MAX.verbale})`);
      for (const x of e.effetti) (imposta[x.imposta ?? x.aggiungi] ??= []).push(ep); }
    if (mio) for (const r of brevi.filter(Boolean)) { const n = testo(r).length; if (n > MAX.breve) p.push(`${m.id}: «${r.replace('testi:', '')}» di ${n} caratteri (max ${MAX.breve})`); }
  }
  // D-102: il capo curva è Tano Ferrigno «il Fabbro», mai «Dessì»
  for (const [k, v] of Object.entries(T)) if (/Dess[iì]/.test(v) && (!soli || soli.some((e) => k.startsWith(e + '.')))) p.push(`testo «${k}» dice ancora «Dessì» (D-102)`);
  if (!soli) for (const v of dati['stato.json'].variabili) {
    if (['tensione_max', 'credito'].includes(v.id)) continue;
    const i = Math.min(...(imposta[v.id] ?? [Infinity])), l = Math.max(...(legge[v.id] ?? [-Infinity]));
    if (i === Infinity) p.push(`variabile «${v.id}»: nessuna scelta la imposta`);
    else if (!(l > i)) p.push(`variabile «${v.id}»: impostata in e${String(i).padStart(2, '0')} ma nessun episodio dopo la legge`);
  }
  return p;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const soli = process.argv.slice(2).length ? process.argv.slice(2) : null;
  const p = controllaConsolidamento(leggiDati(), soli); for (const x of p) console.log('✗ ' + x);
  console.log(`${p.length} problemi`); process.exit(p.length ? 1 : 0);
}
