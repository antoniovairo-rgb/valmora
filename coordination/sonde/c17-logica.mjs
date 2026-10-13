// Sonda C-017 (affidabilità e credibilità della logica), stagione 1 (e01–e12), variabili iniziali di stato.json.
// A) bot per strategia: esiti, stelle, fiducia finale → la fiducia e le stelle premiano il buon gioco?
// B) dopo ogni sconfitta del bot casuale: ondata proposta da «Riparti» (ondataVincibile), tempo di calcolo,
//    possibilità ufficiale (bot attento + risposte a caso), possibilità per chi schiera a caso (Monte Carlo) e
//    vittoria del bot attento completo da lì (PO-083: «deve sempre dare una possibilità reale»).
// Uso: node coordination/sonde/c17-logica.mjs [semi=100] [prove-mc=100]
import { leggiDati } from '../../tools/dati-disco.mjs';
import { creaCaso } from '../../src/logica/caso.ts';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, iniziaMissione, missioneFinita, riprendiDallOndata, rispondi, schiera } from '../../src/logica/missione.ts';
import { STRATEGIE, attenta, casuale } from '../../src/logica/bot.ts';
import { valutaEpisodio } from '../../src/logica/episodi.ts';
import { ondataVincibile, possibilita } from '../../src/logica/ripartenza.ts';

const SEMI = Number(process.argv[2] ?? 100), MC = Number(process.argv[3] ?? 100);
const d = leggiDati('data'); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x])); const v0 = variabiliIniziali(dich.values());
const missioni = Object.values(Object.fromEntries(Object.entries(d).filter(([k]) => k.startsWith('missioni/')))).filter((m) => m.stagione === 1).sort((a, b) => a.episodio - b.episodio);
const gioca = (m, s, g) => { while (!missioneFinita(m, s)) { s = schiera(m, s, g.schiera(m, s)); for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = rispondi(m, s, c.id, g.scegli(m, s, c), dich); s = chiudiOndata(m, s, dich); } return { s, r: concludiMissione(m, s, dich) }; };
const media = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const stat = (xs) => { const o = [...xs].sort((a, b) => a - b); return { n: o.length, media: +media(o).toFixed(2), mediana: +o[o.length >> 1].toFixed(2), min: +o[0].toFixed(2), max: +o.at(-1).toFixed(2), p95: +o[Math.floor(o.length * 0.95)].toFixed(2) }; };

console.log(`# A) strategie, ${SEMI} semi per le casuali`);
console.log('ep | strategia | falliti% | stelle medie | fiducia finale media | fiducia premio ondate medio');
const fallite = [];
for (const m of missioni) for (const nome of Object.keys(STRATEGIE)) {
  const det = nome !== 'casuale'; const R = [];
  for (let seme = 1; seme <= (det ? 1 : SEMI); seme++) {
    const { s, r } = gioca(m, iniziaMissione(m, v0, dich), STRATEGIE[nome](creaCaso(`c17:${m.id}:${nome}:${seme}`), dich));
    const v = valutaEpisodio(m, r);
    R.push({ fallita: v.fallita, stelle: v.stelle, fiducia: Number(r.variabili.credito), premio: r.rapporti.reduce((t, x) => t + (x.fiducia ?? 0), 0) });
    if (nome === 'casuale' && v.fallita) fallite.push({ m, s, r, seme });
  }
  console.log(`${m.id} | ${nome} | ${(100 * R.filter((x) => x.fallita).length / R.length).toFixed(0)} | ${media(R.map((x) => x.stelle)).toFixed(2)} | ${media(R.map((x) => x.fiducia)).toFixed(2)} | ${media(R.map((x) => x.premio)).toFixed(2)}`);
}

console.log(`\n# B) ripartenza dopo ${fallite.length} sconfitte del bot casuale`);
const tempi = [], pUff = [], pMc = [], righe = []; let ricomincia = 0, attentaPerde = 0, mcSotto = 0, n1 = 0;
for (const { m, s, r, seme } of fallite) {
  const t0 = performance.now(); const n = ondataVincibile(m, r, s, dich); tempi.push(performance.now() - t0);
  if (n === 1) { ricomincia++; continue; }
  const st = riprendiDallOndata(s, n);
  const pu = possibilita(m, st, dich); pUff.push(pu);
  let vinte = 0; for (let k = 0; k < MC; k++) vinte += gioca(m, st, casuale(creaCaso(`mc:${m.id}:${seme}:${k}`), dich)).r.esito.fallita ? 0 : 1;
  const pm = vinte / MC; pMc.push(pm); if (pm < 1 / 3) mcSotto++; if (pm === 0) n1++;
  const att = gioca(m, st, attenta(creaCaso(1), dich)).r.esito.fallita; if (att) attentaPerde++;
  righe.push(`${m.id} seme ${seme}: ondata ${n}/${m.ondate.length} · ufficiale ${(pu * 100).toFixed(0)}% · schierando a caso ${(pm * 100).toFixed(0)}% · bot attento completo ${att ? 'PERDE' : 'vince'}`);
}
console.log(`tempo ondataVincibile ms: ${JSON.stringify(stat(tempi))}`);
console.log(`proposte «Ricomincia» (ondata 1): ${ricomincia}/${fallite.length}; proposte «Riparti dall'ondata N»: ${pUff.length}`);
if (pUff.length) {
  console.log(`possibilità ufficiale: ${JSON.stringify(stat(pUff))}`);
  console.log(`possibilità schierando e rispondendo a caso (${MC} prove): ${JSON.stringify(stat(pMc))}; sotto 1/3: ${mcSotto}; zero: ${n1}`);
  console.log(`bot attento completo che perde dall'ondata proposta: ${attentaPerde}`);
  const perEp = {}; for (const x of righe) { const e = x.slice(0, 3); (perEp[e] ??= []).push(x); }
  for (const [e, xs] of Object.entries(perEp)) console.log(`${e}: ${xs.length} proposte; esempi:\n  ${xs.slice(0, 3).join('\n  ')}`);
}
