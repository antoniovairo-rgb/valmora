// Sonda PO-083: dopo una sconfitta, che possibilità di vincere dall'ondata proposta? Uso: node tools/sonda-ripartenza.mjs [semi]
import { leggiDati } from './dati-disco.mjs';
import { creaCaso } from '../src/logica/caso.ts';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, iniziaMissione, missioneFinita, riprendiDallOndata, rispondi, schiera } from '../src/logica/missione.ts';
import { casuale } from '../src/logica/bot.ts';
import { ondataVincibile, possibilita } from '../src/logica/ripartenza.ts';
const d = leggiDati(); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x])); const v0 = variabiliIniziali(dich.values());
const gioca = (m, s, g) => { while (!missioneFinita(m, s)) { s = schiera(m, s, g.schiera(m, s)); for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = rispondi(m, s, c.id, g.scegli(m, s, c), dich); s = chiudiOndata(m, s, dich); } return { s, r: concludiMissione(m, s, dich) }; };
export function misura(semi = 20) {
  const pr = []; const tempi = []; const lenti = []; let tot = 0, ricomincia = 0, ms = 0, somma = 0; const peggiori = [];
  for (const [k, m] of Object.entries(d).filter(([k]) => k.startsWith('missioni/'))) for (let seme = 1; seme <= semi; seme++) {
    const { s, r } = gioca(m, iniziaMissione(m, v0, dich), casuale(creaCaso(`c16:${k}:${seme}`), dich)); if (!r.esito.fallita) continue; tot++;
    const t0 = performance.now(); const n = ondataVincibile(m, r, s, dich); const dt = performance.now() - t0; ms = Math.max(ms, dt); tempi.push(dt); if (dt > 150) lenti.push(`${m.id} s${seme} ${dt.toFixed(0)}ms → ondata ${n} (proposta C16 ${r.rapporti.length})`);
    const p = possibilita(m, n > 1 ? riprendiDallOndata(s, n) : iniziaMissione(m, v0, dich), dich);
    if (n === 1) ricomincia++; somma += n; pr.push(p); peggiori.push([p, `${m.id} seme ${seme} ondata ${n}`]);
  }
  pr.sort((a, b) => a - b); peggiori.sort((a, b) => a[0] - b[0]);
  tempi.sort((a, b) => a - b); return { lenti, p50: +tempi[tempi.length >> 1].toFixed(1), p95: +tempi[Math.floor(tempi.length * 0.95)].toFixed(0), tot, sotto: pr.filter((x) => x < 1 / 3).length, zero: pr.filter((x) => x === 0).length, mediana: pr[pr.length >> 1], min: pr[0], ricomincia, ondataMedia: somma / tot, ms, peggiori: peggiori.slice(0, 5) };
}
if (import.meta.url === `file://${process.argv[1]}`) { const x = misura(Number(process.argv[2] ?? 20)); console.log(JSON.stringify({ ...x, ms: +x.ms.toFixed(0), peggiori: x.peggiori.map(([p, t]) => `${(p * 100).toFixed(0)}% ${t}`) }, null, 1)); }
