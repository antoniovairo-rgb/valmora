// D-209 (rifinitura e01–e03, S-19): misure ripetibili. Uso: node tools/misura-d209.mjs [bot|guardiani|fiducia|transenne]…
// bot: stelle per episodio e strategia (1000 semi, e01–e03). guardiani: D-160 (perverse, 200 partite, soglia 30), D-162,
// D-154 (serie del casuale e01–e12), D-172, D-180, 3★ del bot attento. fiducia: tools/misura-fiducia.mjs su e03 (1000 semi),
// le sei risposte della scheda (punto 4). transenne: e03 con le due transenne forzate in ogni posizione all'ondata 1.
import { readFileSync } from 'node:fs';
import { leggiDati } from './dati-disco.mjs';
import { giraBot } from './bot.mjs';
import { controllaCrescita, quoteCasuale, quoteDistratto } from './crescita.mjs';
import { correlazioniCasuale, datiD160, deltaFallite, misura, perversa, perverseRapide } from './misura-fiducia.mjs';
import { creaCaso } from '../src/logica/caso.ts';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, iniziaMissione, missioneFinita, rispondi, schiera, settoriAmmessi } from '../src/logica/missione.ts';
import { attenta, casuale, equilibrata } from '../src/logica/bot.ts';
import { valutaEpisodio } from '../src/logica/episodi.ts';

const cosa = process.argv.slice(2).length ? process.argv.slice(2) : ['bot', 'guardiani'];
const d = leggiDati();
const solo = (ids) => Object.fromEntries(Object.entries(d).filter(([k, m]) => !k.startsWith('missioni/') || ids.includes(m.id)));
const tolte = JSON.parse(readFileSync('tests/dati/fiducia-d160.json', 'utf8')).tolte;

if (cosa.includes('bot')) {
  const r = giraBot(solo(['e01', 'e02', 'e03']), 1000);
  console.log('episodio | strategia | fallite % | stelle medie | 3★ %');
  for (const x of r) {
    if (x.strategia.includes('[')) continue;
    const n = Object.values(x.stelle).reduce((a, b) => a + b, 0), m = Object.entries(x.stelle).reduce((a, [k, v]) => a + k * v, 0) / n;
    console.log(`${x.missione} | ${x.strategia} | ${(100 * x.stelle[0] / n).toFixed(1)} | ${m.toFixed(2)} | ${(100 * x.stelle[3] / n).toFixed(1)}`);
  }
}
if (cosa.includes('guardiani')) {
  const dd = datiD160(d, tolte);
  const pv = perverseRapide(dd, 200);
  console.log(`D-160 perverse (200 partite, soglia 30): ${pv.length}; in e01–e03: ${pv.filter((o) => /^e0[123]\//.test(o.chiave)).map((o) => o.chiave).join(', ') || 'nessuna'}`);
  const media = (q) => [1, 2, 3].map((st) => { const v = Object.values(q).filter(([s]) => s === st).map(([, x]) => x); return v.reduce((a, b) => a + b, 0) / v.length; });
  const r = giraBot(d, 1000), qc = quoteCasuale(r, d), qd = quoteDistratto(d);
  const mc = media(qc), md = media(qd);
  console.log(`D-162 casuale per stagione: ${mc.map((x) => x.toFixed(2)).join(' / ')} ${controllaCrescita(qc, 'casuale').join('; ') || 'verde'}`);
  console.log(`D-162 distratto per stagione: ${md.map((x) => x.toFixed(2)).join(' / ')} ${controllaCrescita(qd, 'distratto').join('; ') || 'verde'}`);
  const s1 = Object.entries(qc).filter(([, [s]]) => s === 1).sort(([a], [b]) => a.localeCompare(b));
  const cali = s1.slice(1).filter(([, [, q]], i) => q < s1[i][1][1] - 1).map(([k]) => k);
  console.log(`D-154 casuale e01–e12 % fallite: ${s1.map(([k, [, q]]) => `${k} ${q.toFixed(1)}`).join(', ')}; cali > 1 punto: ${cali.join(',') || 'nessuno'}`);
  const cor = correlazioniCasuale(dd), del = deltaFallite(dd);
  const cr = Object.entries(cor).filter(([, x]) => x === null || x >= 0), dr = Object.entries(del).filter(([, x]) => x !== null && x > 0);
  console.log(`D-172 episodi con correlazione ≥ 0: ${cr.length} ${cr.map(([k]) => k).join(',')} · e01–e03: ${['e01', 'e02', 'e03'].map((k) => `${k} ${cor[k]}`).join(', ')}`);
  console.log(`D-180 episodi con Δ fallite > 0: ${dr.length} ${dr.map(([k]) => k).join(',')} · e01–e03: ${['e01', 'e02', 'e03'].map((k) => `${k} ${del[k]?.toFixed(3)}`).join(', ')}`);
  console.log(`3★ del bot attento: ${r.filter((x) => x.strategia === 'attenta' && x.stelle[3] > 0).length}/36`);
}
if (cosa.includes('fiducia')) {
  const SEI = ['finestre/comunicato_residenti', 'troupe_notte/commento_tv', 'rigori_curve/confida_curve', 'cartelloni/promessa', 'ospiti_arrivano/dove_capita', 'auto_in_sosta/multe'];
  const m = misura(datiD160(solo(['e03']), tolte), 1000);
  console.log('risposta | n | fiducia nominale | Δ medio | fallite se scelta % | fallite con le altre % | z | perversa (D-160)');
  for (const o of m.opzioni) {
    const sei = SEI.includes(o.chiave.replace(/^e03\//, ''));
    if (!o.nominale && !sei) continue;
    console.log(`${o.chiave} | ${o.n} | ${o.nominale} | ${o.deltaMedio} | ${o.falliteSe} | ${o.falliteAltre} | ${o.z} | ${perversa(o) ? 'SÌ' : 'no'}${sei ? ' · scheda' : ''}`);
  }
}
if (cosa.includes('transenne')) {
  const m = d['missioni/e03.json'], dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x])), v0 = variabiliIniziali(dich.values());
  const amm = settoriAmmessi(m, 'transenne'), q = m.mappa.risorse.transenne.quantita;
  const pos = (n, da = 0) => (n ? amm.slice(da).flatMap((k, i) => pos(n - 1, da + i).map((r) => [k, ...r])) : [[]]);
  const gioca = (g, p) => {
    let s = iniziaMissione(m, v0, dich), primo = true;
    while (!missioneFinita(m, s)) {
      const dd = structuredClone(g.schiera(m, s));
      if (primo) { dd.transenne = {}; for (const k of p) dd.transenne[k] = (dd.transenne[k] ?? 0) + 1; primo = false; }
      s = schiera(m, s, dd);
      for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = rispondi(m, s, c.id, g.scegli(m, s, c), dich);
      s = chiudiOndata(m, s, dich);
    }
    return valutaEpisodio(m, concludiMissione(m, s, dich));
  };
  const tipo = Object.fromEntries(m.mappa.settori.map((k) => [k.id, k.tipo]));
  console.log(`settori ammessi: ${amm.map((k) => `${k} (${tipo[k]})`).join(', ')}`);
  console.log('transenne | nel quartiere | attenta ★ | equilibrata ★ | casuale fallite % | casuale stelle medie (1000 semi)');
  for (const p of pos(q)) {
    const nq = p.filter((k) => tipo[k] === 'quartiere').length;
    const at = gioca(attenta(creaCaso(1), dich), p).stelle, eq = gioca(equilibrata(creaCaso(1), dich), p).stelle;
    let ko = 0, st = 0;
    for (let seme = 1; seme <= 1000; seme++) { const v = gioca(casuale(creaCaso(`${m.id}:casuale:${seme}`), dich), p); ko += +v.fallita; st += v.stelle; }
    console.log(`${p.join('+')} | ${nq} | ${at} | ${eq} | ${(ko / 10).toFixed(1)} | ${(st / 1000).toFixed(2)}`);
  }
}
