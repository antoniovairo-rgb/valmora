// D-241 (PO-152, idea D): misure della partita col seme. Uso: node tools/misura-d241.mjs [semi=300] [coppie=100]
// - diversità: per episodio, su N coppie di semi di partita, quota di partite con sequenza di chiamate (imprevisti e varianti
//   compresi, nell'ordine in cui arrivano) diversa; stesso giocatore deterministico (attento), cambia solo il seme;
// - blocchi: 4 strategie × «semi» semi di partita, eccezioni o nessun esito;
// - vittorie (esito non fallito): prima = partita classica (seme 0, il gioco della 0.52), dopo = semi di partita 1…semi.
import { leggiDati } from './dati-disco.mjs';
import { creaCaso } from '../src/logica/caso.ts';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { giocaMissione } from '../src/logica/missione.ts';
import { semeDa } from '../src/logica/partita.ts';
import { DETERMINISTICHE, STRATEGIE, attenta } from '../src/logica/bot.ts';

const contesto = (dati) => {
  const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
  const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m).sort((a, b) => a.episodio - b.episodio);
  return { dich, iniziali: variabiliIniziali(dich.values()), missioni };
};

/** Sequenza delle chiamate di una partita giocata dal bot attento col seme dato. */
export const sequenza = (m, dich, iniziali, seme) => giocaMissione(m, iniziali, dich, attenta(creaCaso(1), dich), seme).scelte.map((x) => `${x.ondata}:${x.chiamata}`).join(' ');

/** Quota (0-1) di coppie di semi con sequenza di chiamate diversa, per ogni missione. */
export function diversita(dati, coppie = 100) {
  const { dich, iniziali, missioni } = contesto(dati);
  return missioni.map((m) => {
    let diverse = 0;
    for (let i = 0; i < coppie; i++) if (sequenza(m, dich, iniziali, semeDa(`d241:${m.id}:${i}:a`)) !== sequenza(m, dich, iniziali, semeDa(`d241:${m.id}:${i}:b`))) diverse++;
    return { missione: m.id, coppie, diverse, quota: diverse / coppie };
  });
}

/** Ogni strategia su «semi» semi di partita: blocchi e vittorie; più la partita classica (prima). */
export function partite(dati, semi = 300) {
  const { dich, iniziali, missioni } = contesto(dati);
  return missioni.map((m) => {
    const r = { missione: m.id, stagione: m.stagione, blocchi: [], prima: {}, dopo: {} };
    for (const [nome, strategia] of Object.entries(STRATEGIE)) {
      let vintePrima = 0, vinteDopo = 0, giocatePrima = 0;
      for (let s = 1; s <= semi; s++) {
        const g = () => strategia(creaCaso(`${m.id}:${nome}:${s}`), dich);
        if (!DETERMINISTICHE.has(nome) || s === 1) { giocatePrima++; vintePrima += +!giocaMissione(m, iniziali, dich, g(), 0).esito.fallita; }
        try { vinteDopo += +!giocaMissione(m, iniziali, dich, g(), semeDa(`d241:${m.id}:${nome}:${s}`)).esito.fallita; } catch (e) { r.blocchi.push(`${nome} seme ${s}: ${e.message}`); }
      }
      r.prima[nome] = vintePrima / giocatePrima; r.dopo[nome] = vinteDopo / semi;
    }
    return r;
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dati = leggiDati(), semi = Number(process.argv[2] ?? 300), coppie = Number(process.argv[3] ?? 100);
  const div = diversita(dati, coppie), par = partite(dati, semi);
  const pc = (x) => `${(100 * x).toFixed(1)}%`;
  console.log(`| episodio | partite diverse su ${coppie} coppie | blocchi su ${semi}×4 | casuale vince prima → dopo | attenta | equilibrata | peggiore |`);
  console.log('|---|---|---|---|---|---|---|');
  for (const [i, r] of par.entries()) console.log(`| ${r.missione} | ${div[i].diverse}/${coppie} | ${r.blocchi.length} | ${pc(r.prima.casuale)} → ${pc(r.dopo.casuale)} | ${pc(r.prima.attenta)} → ${pc(r.dopo.attenta)} | ${pc(r.prima.equilibrata)} → ${pc(r.dopo.equilibrata)} | ${pc(r.prima.peggiore)} → ${pc(r.dopo.peggiore)} |`);
  const q = div.map((x) => x.quota).sort((a, b) => a - b), med = (a) => a.reduce((s, x) => s + x, 0) / a.length;
  const sd = Math.sqrt(med(q.map((x) => (x - med(q)) ** 2)));
  console.log(`diversità: min ${pc(q[0])}, mediana ${pc(q[Math.floor(q.length / 2)])}, media ${pc(med(q))}, dispersione (dev. std) ${pc(sd)}, ${q.length} episodi × ${coppie} coppie`);
  console.log(`blocchi totali: ${par.reduce((s, r) => s + r.blocchi.length, 0)} su ${par.length * semi * 4} partite`);
  for (const r of par) for (const b of r.blocchi.slice(0, 3)) console.log(`  ${r.missione} ${b}`);
}
