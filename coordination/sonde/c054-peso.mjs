// C-054 · «la scelta comoda ora pesa?»: stesso schieramento (bot attenta), tre politiche sulle chiamate: comoda (opzione con effetti_dopo),
// non comoda (una senza effetti_dopo se c'è), a caso. Esiti e stelle per politica, con morsi accesi e con __NO_C241C01. Uso: node c054-peso.mjs [semi=60]
import { leggiDati } from '../../tools/dati-disco.mjs';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { attenta } from '../../src/logica/bot.ts';
import { creaCaso } from '../../src/logica/caso.ts';
import { valutaEpisodio } from '../../src/logica/episodi.ts';
import { iniziaMissione, schiera, chiamateAperte, rispondi, chiudiOndata, missioneFinita, opzioniValide, concludiMissione } from '../../src/logica/missione.ts';
const semi = Number(process.argv[2] ?? 60);
const dati = leggiDati('data'), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x).sort((a, b) => a.episodio - b.episodio);
const v0 = variabiliIniziali(dich.values());
const media = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const pol = { comoda: (ok, r) => ok.find((o) => o.effetti_dopo) ?? r.scegli(ok), non_comoda: (ok, r) => { const x = ok.filter((o) => !o.effetti_dopo); return x.length ? r.scegli(x) : r.scegli(ok); }, a_caso: (ok, r) => r.scegli(ok) };
const out = {};
for (const rosso of [false, true]) { globalThis.__NO_C241C01 = rosso; for (const [nome, f] of Object.entries(pol)) {
  const st = [], cr = [], fall = []; let ep = 0;
  for (const m of missioni) for (let seme = 1; seme <= semi; seme++) {
    const g = attenta(creaCaso(seme), dich), r = creaCaso(seme * 31 + 3); let s = iniziaMissione(m, v0, dich, seme);
    while (!missioneFinita(m, s)) { s = schiera(m, s, g.schiera(m, s)); for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = rispondi(m, s, c.id, f(opzioniValide(c, s, m), r).id, dich); s = chiudiOndata(m, s, dich); }
    const e = concludiMissione(m, s, dich); ep++; st.push(valutaEpisodio(m, e).stelle); cr.push(e.variabili.credito ?? NaN); fall.push(e.esito.fallita ? 1 : 0);
  }
  out[`${rosso ? 'ROSSO(senza morsi)' : 'verde'} · ${nome}`] = { episodi: ep, stelleMedia: +media(st).toFixed(3), creditoFinaleMedia: +media(cr).toFixed(3), falliti: +(100 * media(fall)).toFixed(1) + '%' };
} }
console.log(JSON.stringify(out, null, 1));
