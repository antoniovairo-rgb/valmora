// Bot su tutte le missioni di data/: ogni strategia × semi 1…N. Conta blocchi (eccezioni o
// nessun esito) e la distribuzione degli esiti. Uso: node tools/bot.mjs [N]
import { leggiDati } from './dati-disco.mjs';
import { creaCaso } from '../src/logica/caso.ts';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { giocaMissione } from '../src/logica/plancia.ts';
import { STRATEGIE } from '../src/logica/bot.ts';

export function giraBot(dati, semi = 1000) {
  const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
  const iniziali = variabiliIniziali(dich.values());
  const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m);
  const rapporto = [];
  for (const m of missioni) for (const [nome, strategia] of Object.entries(STRATEGIE)) {
    const esiti = {}; const blocchi = []; const tensioni = [];
    for (let seme = 1; seme <= semi; seme++) {
      const caso = creaCaso(`${m.id}:${nome}:${seme}`);
      try {
        const r = giocaMissione(m, iniziali, dich, (n, v) => strategia(m, n, v, caso));
        esiti[r.esito.id] = (esiti[r.esito.id] ?? 0) + 1;
        tensioni.push(r.variabili.tensione_max);
      } catch (e) { blocchi.push(`seme ${seme}: ${e.message}`); }
    }
    tensioni.sort((a, b) => a - b);
    const media = tensioni.reduce((s, x) => s + x, 0) / (tensioni.length || 1);
    rapporto.push({ missione: m.id, strategia: nome, semi, blocchi, esiti,
      tensione: { media: +media.toFixed(2), mediana: tensioni[Math.floor(tensioni.length / 2)], min: tensioni[0], max: tensioni.at(-1) } });
  }
  return rapporto;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  for (const r of giraBot(leggiDati(), Number(process.argv[2] ?? 1000))) {
    console.log(`${r.missione} · ${r.strategia}: blocchi ${r.blocchi.length}/${r.semi} · esiti ${JSON.stringify(r.esiti)} · tensione_max media ${r.tensione.media}, mediana ${r.tensione.mediana}, min ${r.tensione.min}, max ${r.tensione.max}`);
  }
}
