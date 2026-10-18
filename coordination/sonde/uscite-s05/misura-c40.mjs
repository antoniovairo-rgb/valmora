// C40-01 (D-180): su 36 episodi × 20 partite del casuale, voci del bilancio prima (rosso __NO_C40B01) e dopo la regola
// «il confronto non smentisce la partita»: quante voci cambiano, quante erano smentite, bilanci vuoti.
import { readFileSync } from 'node:fs';
import { leggiDati } from '../../../tools/dati-disco.mjs';
import { variabiliIniziali } from '../../../src/logica/condizioni.ts';
import { giocaMissione } from '../../../src/logica/missione.ts';
import { casuale } from '../../../src/logica/bot.ts';
import { creaCaso } from '../../../src/logica/caso.ts';
import { bilancio } from '../../../src/logica/bilancio.ts';
import { daTabella } from '../../../src/logica/confronto.ts';
const d = leggiDati(); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x])); const v0 = variabiliIniziali(dich.values());
const tab = JSON.parse(readFileSync('src/logica/confronti.json', 'utf8'));
const ms = Object.entries(d).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m);
const chiavi = (b) => [...b.aiuti.map((v) => `+${v.ondata}/${v.chiamata}/${v.opzione}`), ...b.pesi.map((v) => `-${v.ondata}/${v.chiamata}/${v.opzione}`)];
const smentite = (r, b) => { let n = 0; for (const [l, sg] of [[b.aiuti, 1], [b.pesi, -1]]) for (const v of l) {
  const col = new Set(r.rapporti.filter((o) => o.n >= v.ondata).flatMap((o) => Object.entries(o.scoperto).filter(([, x]) => x > 0).map(([k]) => k)));
  if (v.impatti.some((i) => (i.tipo === 'pressione' || i.tipo === 'tensione') && i.dove && col.has(i.dove) && Math.sign(i.valore) === sg)) n++; } return n; };
let voci0 = 0, voci1 = 0, cambiate = 0, uscite = 0, entrate = 0, sm0 = 0, sm1 = 0, vuoti0 = 0, vuoti1 = 0, partite = 0;
for (const m of ms) { const c = daTabella(tab, m.id); for (let s = 1; s <= 20; s++) {
  const r = giocaMissione(m, v0, dich, casuale(creaCaso(`c38b:${m.id}:${s}`), dich)); partite++;
  globalThis.__NO_C40B01 = true; const b0 = bilancio(m, r, 3, c); delete globalThis.__NO_C40B01; const b1 = bilancio(m, r, 3, c);
  const k0 = chiavi(b0), k1 = chiavi(b1); voci0 += k0.length; voci1 += k1.length; sm0 += smentite(r, b0); sm1 += smentite(r, b1);
  if (r.scelte.length && !k0.length) vuoti0++; if (r.scelte.length && !k1.length) vuoti1++;
  const u = k0.filter((x) => !k1.includes(x)).length, e = k1.filter((x) => !k0.includes(x)).length; uscite += u; entrate += e; if (u || e) cambiate++; } }
console.log(`${partite} partite: voci ${voci0} → ${voci1}; voci uscite ${uscite}, entrate ${entrate}; verbali cambiati ${cambiate}/${partite}; voci smentite dalla partita ${sm0} → ${sm1}; bilanci vuoti con scelte ${vuoti0} → ${vuoti1}`);
