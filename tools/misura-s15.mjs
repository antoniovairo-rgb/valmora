// Misura S-15 (D-189, rifinitura e25–e36): sola misura, legge data/ e usa src/logica senza cambiarla.
// - per e25–e36 e per strategia: esiti e stelle (giraBot, stessi semi di tools/bot.mjs);
// - curva D-154/D-108: fallite del casuale per episodio della stagione 3 e violazioni (controllaDifficolta);
// - fiducia D-160: opzioni nel verso sbagliato (perverseRapide, 200 partite) e Δ fallite / correlazione del casuale;
// - carriere: campagna e01→e36 con variabili portate avanti; un episodio fallito si rigioca (seme nuovo) fino a 5 volte,
//   poi la storia resta quella di prima (src/logica/episodi.ts). Carriera = esito di e36 (confermato/prorogato/sostituito).
// Uso: node tools/misura-s15.mjs [semi=1000] [campagne=300] [uscita.json]
import { writeFileSync } from 'node:fs';
import { leggiDati } from './dati-disco.mjs';
import { giraBot } from './bot.mjs';
import { controllaDifficolta } from './passi-logica.mjs';
import { correlazioniCasuale, deltaFallite, perverseRapide } from './misura-fiducia.mjs';
import { creaCaso } from '../src/logica/caso.ts';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { giocaMissione } from '../src/logica/missione.ts';
import { STRATEGIE } from '../src/logica/bot.ts';
import { valutaEpisodio } from '../src/logica/episodi.ts';

const IDS = Array.from({ length: 12 }, (_, i) => `e${25 + i}`);
const carriera = (id) => id.split('_')[0];

export function campagne(dati, n = 300) {
  const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
  const ordinate = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m).sort((a, b) => a.episodio - b.episodio);
  const out = {};
  for (const [nome, strategia] of Object.entries(STRATEGIE)) {
    const conta = {}; const fili = {};
    for (let seme = 1; seme <= n; seme++) {
      let v = variabiliIniziali(dich.values()); let ultimo = null;
      for (const m of ordinate) {
        for (let t = 0; t < 5; t++) {
          const r = giocaMissione(m, v, dich, strategia(creaCaso(`s15:${m.id}:${nome}:${seme}:${t}`), dich));
          if (!valutaEpisodio(m, r).fallita) { v = { ...r.variabili, tensione_max: 0 }; ultimo = r.esito.id; break; }
          ultimo = r.esito.id;
        }
      }
      const c = carriera(ultimo); conta[c] = (conta[c] ?? 0) + 1;
      const f = `talpa=${v.sospetti_talpa} testimone=${v.testimone} fascicolo=${v.fascicolo}${'carte' in v ? ` carte=${v.carte}` : ''}`;
      (fili[f] ??= {})[c] = (fili[f][c] ?? 0) + 1;
    }
    out[nome] = { carriere: conta, perFili: fili };
  }
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const semi = Number(process.argv[2] ?? 1000), nc = Number(process.argv[3] ?? 300), uscita = process.argv[4];
  const dati = leggiDati();
  const r = giraBot(dati, semi);
  const ep = {};
  for (const x of r.filter((x) => IDS.includes(x.missione))) (ep[x.missione] ??= {})[x.strategia] = { esiti: x.esiti, stelle: x.stelle };
  const fallite = Object.fromEntries(IDS.map((id) => { const x = r.find((y) => y.missione === id && y.strategia === 'casuale'); return [id, +(100 * x.stelle[0] / x.semi).toFixed(1)]; }));
  const curva = [1, 2, 3].flatMap((st) => controllaDifficolta(r, dati, st));
  const perverse = perverseRapide(dati, 200);
  const df = deltaFallite(dati); const co = correlazioniCasuale(dati);
  const fiducia = { perverse: perverse.length, perverseS3: perverse.filter((o) => IDS.includes(o.chiave.split('/')[0])).map((o) => `${o.chiave} nom ${o.nominale} z ${o.z}`),
    deltaFallite: Object.fromEntries(IDS.map((id) => [id, df[id] === null ? null : +df[id].toFixed(2)])), corr: Object.fromEntries(IDS.map((id) => [id, co[id]])),
    deltaFallitePositivi: Object.entries(df).filter(([, x]) => x !== null && x > 0).map(([k]) => k), corrNonNegative: Object.entries(co).filter(([, x]) => x === null || x >= 0).map(([k]) => k) };
  const car = campagne(dati, nc);
  const tutto = { semi, campagne: nc, episodi: ep, fallite, curva, fiducia, carriere: car };
  if (uscita) writeFileSync(uscita, JSON.stringify(tutto, null, 1));
  console.log('fallite casuale %', JSON.stringify(fallite));
  console.log('curva', curva.length ? curva : 'verde');
  console.log('fiducia', JSON.stringify({ perverse: fiducia.perverse, perverseS3: fiducia.perverseS3, dfPos: fiducia.deltaFallitePositivi, corr: fiducia.corrNonNegative }));
  for (const [id, e] of Object.entries(ep)) for (const [s, x] of Object.entries(e)) if (!s.includes('[')) console.log(`${id} ${s} esiti ${JSON.stringify(x.esiti)} stelle ${JSON.stringify(x.stelle)}`);
  for (const [s, x] of Object.entries(car)) console.log(`carriere ${s}: ${JSON.stringify(x.carriere)}`);
}
