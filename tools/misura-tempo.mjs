// S-14 (PO-022): misura del prototipo «tempo reale» su e02 con orologio simulato e seme (src/logica/tempo.ts).
// Per ogni modo (a, b, c) e livello di ritardo: bot attento, equilibrato (deterministici) e casuale su 200 semi.
// Uso: node tools/misura-tempo.mjs [episodio]
import { leggiDati } from './dati-disco.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { creaCaso } from '../src/logica/caso.ts';
import { attenta, casuale, equilibrata } from '../src/logica/bot.ts';
import { valutaEpisodio } from '../src/logica/episodi.ts';
import { giocaMissione } from '../src/logica/missione.ts';
import { giocaConOrologio } from '../src/logica/tempo.ts';

const id = process.argv[2] ?? 'e02';
const dati = leggiDati('data'), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), v0 = variabiliIniziali(dich.values());
const m = dati[`missioni/${id}.json`];
const SEMI = 200;
const riga = (nome, f) => {
  const r = Array.from({ length: SEMI }, (_, i) => f(i + 1));
  const stelle = r.map((x) => x.stelle), media = stelle.reduce((a, b) => a + b, 0) / SEMI;
  const ord = [...stelle].sort((a, b) => a - b), mediana = ord[SEMI / 2];
  const ds = Math.sqrt(stelle.reduce((a, b) => a + (b - media) ** 2, 0) / SEMI);
  const fallite = r.filter((x) => x.fallita).length, tre = stelle.filter((x) => x === 3).length;
  const scad = r.reduce((a, b) => a + (b.scadute ?? 0), 0) / SEMI;
  console.log(`| ${nome} | ${(100 * fallite / SEMI).toFixed(1)}% | ${media.toFixed(2)} | ${mediana} | ${ds.toFixed(2)} | ${(100 * tre / SEMI).toFixed(1)}% | ${scad.toFixed(2)} |`);
};
const gioca = (strategia, seme, orologio) => {
  const g = strategia(creaCaso(`s14:${seme}`), dich);
  const r = orologio ? giocaConOrologio(m, v0, dich, g, { ...orologio, caso: creaCaso(`s14-orologio:${seme}`) }) : giocaMissione(m, v0, dich, g);
  return { ...valutaEpisodio(m, r), scadute: r.scadute ?? 0 };
};
console.log(`${id}, ${SEMI} semi per riga (deterministici: stesso risultato per tutti i semi senza orologio)\n`);
console.log('| giro | fallite | stelle media | mediana | dispersione (ds) | 3★ | scadute/partita |\n|---|---|---|---|---|---|---|');
for (const [nome, st] of [['attento', attenta], ['equilibrato', equilibrata], ['casuale', casuale]]) {
  riga(`${nome}, senza tempo reale`, (s) => gioca(st, s));
  for (const p of [0.1, 0.25, 0.5]) riga(`${nome}, a, p(scade)=${p}`, (s) => gioca(st, s, { modo: 'a', pScade: p, minutiMax: 0 }));
  for (const p of [0.25, 0.5, 1]) riga(`${nome}, b, p(scade)=${p}`, (s) => gioca(st, s, { modo: 'b', pScade: p, minutiMax: 0 }));
  for (const mm of [2, 4, 6]) riga(`${nome}, c, 1-${mm} min/chiamata`, (s) => gioca(st, s, { modo: 'c', pScade: 0, minutiMax: mm }));
}
