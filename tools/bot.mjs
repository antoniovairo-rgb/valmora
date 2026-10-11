// Bot su tutte le missioni di data/: ogni strategia × semi 1…N. Conta blocchi (eccezioni o nessun
// esito), distribuzione degli esiti e tensione massima. Uso: node tools/bot.mjs [N]
import { leggiDati } from './dati-disco.mjs';
import { creaCaso } from '../src/logica/caso.ts';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { giocaMissione, opzioniValide } from '../src/logica/missione.ts';
import { STRATEGIE, attenta, casuale } from '../src/logica/bot.ts';
import { valutaEpisodio } from '../src/logica/episodi.ts';

const contesto = (dati) => {
  const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
  return { dich, iniziali: variabiliIniziali(dich.values()), missioni: Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m) };
};

export function giraBot(dati, semi = 1000) {
  const { dich, iniziali, missioni } = contesto(dati);
  const rapporto = [];
  for (const m of missioni) for (const [nome, strategia] of Object.entries(STRATEGIE)) {
    const esiti = {}; const blocchi = []; const tensioni = []; const stelle = { 0: 0, 1: 0, 2: 0, 3: 0 };
    for (let seme = 1; seme <= semi; seme++) {
      try {
        const r = giocaMissione(m, iniziali, dich, strategia(creaCaso(`${m.id}:${nome}:${seme}`), dich));
        esiti[r.esito.id] = (esiti[r.esito.id] ?? 0) + 1;
        stelle[valutaEpisodio(m, r).stelle] += 1;
        tensioni.push(r.variabili.tensione_max);
      } catch (e) { blocchi.push(`seme ${seme}: ${e.message}`); }
    }
    tensioni.sort((a, b) => a - b);
    const media = tensioni.reduce((s, x) => s + x, 0) / (tensioni.length || 1);
    rapporto.push({ missione: m.id, strategia: nome, semi, blocchi, esiti, stelle,
      tensione: { media: +media.toFixed(2), mediana: tensioni[Math.floor(tensioni.length / 2)], min: tensioni[0], max: tensioni.at(-1) } });
  }
  return rapporto;
}

/** «Le scelte contano»: stesso schieramento (attento), risposte a caso → quanti esiti diversi? */
export function sceltePesano(dati, semi = 300) {
  const { dich, iniziali, missioni } = contesto(dati);
  return missioni.map((m) => {
    const esiti = {};
    for (let seme = 1; seme <= semi; seme++) {
      const caso = creaCaso(`scelte:${m.id}:${seme}`);
      const g = { schiera: attenta(caso, dich).schiera, scegli: (_m, s, c) => caso.scegli(opzioniValide(c, s)).id };
      const r = giocaMissione(m, iniziali, dich, g);
      esiti[r.esito.id] = (esiti[r.esito.id] ?? 0) + 1;
    }
    return { missione: m.id, semi, esiti };
  });
}

/** Campagna: episodi in fila, variabili portate da uno all'altro (giocatore casuale). Quali chiamate compaiono? */
export function chiamateViste(dati, semi = 300) {
  const { dich, iniziali, missioni } = contesto(dati);
  const ordinate = [...missioni].sort((a, b) => a.episodio - b.episodio);
  const viste = new Set();
  for (let seme = 1; seme <= semi; seme++) {
    let v = iniziali;
    for (const m of ordinate) {
      const g = casuale(creaCaso(`campagna:${m.id}:${seme}`), dich);
      const r = giocaMissione(m, v, dich, { schiera: g.schiera, scegli: (mm, s, c) => { viste.add(`${m.id}:${c.id}`); return g.scegli(mm, s, c); } });
      v = r.variabili;
    }
  }
  return ordinate.map((m) => ({ missione: m.id, mai: m.ondate.flatMap((o) => o.chiamate ?? []).filter((c) => !viste.has(`${m.id}:${c.id}`)).map((c) => c.id) }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dati = leggiDati(); const n = Number(process.argv[2] ?? 1000);
  for (const r of giraBot(dati, n)) console.log(`${r.missione} · ${r.strategia}: blocchi ${r.blocchi.length}/${r.semi} · esiti ${JSON.stringify(r.esiti)} · stelle ${JSON.stringify(r.stelle)} · tensione_max media ${r.tensione.media}, mediana ${r.tensione.mediana}, min ${r.tensione.min}, max ${r.tensione.max}`);
  for (const r of chiamateViste(dati)) console.log(`${r.missione} · campagna: chiamate mai comparse ${JSON.stringify(r.mai)}`);
  for (const r of sceltePesano(dati)) console.log(`${r.missione} · scelte a caso con schieramento attento: ${JSON.stringify(r.esiti)}`);
}
