// C-053: quante volte l'imprevisto arriva per ultimo (o per primo) dell'ondata giocata, cioè non interrompe nulla (src/dati/imprevisti.ts:1-3).
// Motore puro, bot attento e casuale, 60 semi di partita per episodio.
import * as L from './c053-lib.mjs';
import { giocaMissione } from '../../src/logica/missione.ts';
import { attenta, casuale } from '../../src/logica/bot.ts';
import { creaCaso } from '../../src/logica/caso.ts';
import { semeDa } from '../../src/logica/partita.ts';
const tot = { classica: [0, 0, 0], nuova: [0, 0, 0] }, esempi = [];
const classici = new Set(); for (const m of L.missioni) { const f = L.dati[`imprevisti/${m.id}.json`]; const visti = {}; for (const i of f?.imprevisti ?? []) { if (!visti[i.ondata]) { classici.add(`${m.id}/${i.chiamata.id}`); visti[i.ondata] = 1; } } }
for (const m of L.missioni) {
  for (const strat of [attenta, casuale]) for (let k = 0; k < 60; k++) {
    const seme = semeDa(`c053:${m.id}:${k}`), bot = strat(creaCaso(`p:${m.id}:${k}`), L.dich), per = {};
    giocaMissione(m, L.v0, L.dich, { schiera: bot.schiera, scegli: (mm, s, c) => { (per[s.ondata] ??= []).push(c); return bot.scegli(mm, s, c); } }, seme);
    for (const [o, cs] of Object.entries(per)) { const i = cs.findIndex((c) => c.imprevisto); if (i < 0) continue; const t = tot[classici.has(`${m.id}/${cs[i].id}`) ? 'classica' : 'nuova']; t[0]++; if (i === cs.length - 1) { t[1]++; if (esempi.length < 6) esempi.push(`${m.id} o${o} ${cs[i].id} ultima su ${cs.length}`); } if (i === 0) t[2]++; }
  }
}
for (const [k, [n, ult, prim]] of Object.entries(tot)) console.log(`${k}: ondate con imprevisto ${n}, imprevisto ULTIMO ${ult} (${(100 * ult / n).toFixed(1)}%), PRIMO ${prim}`);
console.log(esempi.join('\n'));
