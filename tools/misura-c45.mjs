// C45-03 (D-203): nel verbale, aiuti con soli effetti «cattivi» (es. «+2 pressione») e pesi con soli effetti «buoni».
// Uso: node tools/misura-c45.mjs [semi=1000]. 36 episodi × (casuale semi 1…N + attenta/equilibrata/peggiore una volta),
// confronto dalla tabella precalcolata come nel gioco (D-174). Conta le voci e cosa succederebbe con le tre opzioni:
// A tolte dalle liste; B mostrate con la dicitura del confronto; C mostrate senza effetti. Applicata B1 (D-205, MISTI=0):
// conDicitura = voci con controcorrente (src/logica/bilancio.ts), controSenzaDicitura deve essere 0 (rosso __NO_C4503=1).
import { leggiDati } from './dati-disco.mjs';
import { creaCaso } from '../src/logica/caso.ts';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { giocaMissione } from '../src/logica/missione.ts';
import { STRATEGIE } from '../src/logica/bot.ts';
import { bilancio } from '../src/logica/bilancio.ts';
import { daTabella } from '../src/logica/confronto.ts';
import { readFileSync } from 'node:fs';

const semi = Number(process.argv[2] ?? 1000);
if (process.env.ROSSO === '1') globalThis.__NO_C4503 = true;
const d = leggiDati();
const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const tab = JSON.parse(readFileSync('src/logica/confronti.json', 'utf8'));
const ms = Object.entries(d).filter(([k]) => /^missioni\/e\d+\.json$/.test(k)).map(([, m]) => m).sort((a, b) => a.id.localeCompare(b.id));
// MISTI=0 «tutti»: ogni effetto va contro la lista (e36 «+2 pressione» fra gli aiuti); MISTI=1: almeno uno (e05 «+1 fiducia» fra i pesi)
// MISTI=2: il saldo locale degli effetti (pesi del bilancio: tensione 1,5, il resto 1) ha il segno opposto o è zero
const misti = process.env.MISTI ?? '0'; // 0 = l'opzione applicata (B1, D-205); 2 = B2
const PESO = { credito: 1, pressione: 1, tensione: 1.5, riserva: 1 }, locale = (v) => v.impatti.reduce((t, i) => t + PESO[i.tipo] * Math.abs(i.valore) * (i.buono ? 1 : -1), 0);
const contro = (v, aiuto) => v.impatti.length > 0 && (misti === '1' ? v.impatti.some((i) => i.buono !== aiuto) : misti === '2' ? (aiuto ? locale(v) <= 0 : locale(v) >= 0) : v.impatti.every((i) => i.buono !== aiuto));
const c = { partite: 0, conDicitura: 0, controSenzaDicitura: 0, controC4203: 0, verbaliConAiutoContro: 0, aiutiContro: 0, verbaliConPesoContro: 0, pesiContro: 0, A_aiutiVuoti: 0, A_bilancioVuoto: 0, prima_aiutiVuoti: 0, prima_bilancioVuoto: 0 };
const casi = new Map();
for (const m of ms) {
  const conf = daTabella(tab, m.id);
  const giri = [...Array.from({ length: semi }, (_, i) => ['casuale', i + 1]), ['attenta', 1], ['equilibrata', 1], ['peggiore', 1]];
  for (const [n, s] of giri) {
    const r = giocaMissione(m, v0, dich, STRATEGIE[n](creaCaso(`c45:${m.id}:${n}:${s}`), dich));
    if (!r.scelte.length) continue;
    c.partite++;
    const b = bilancio(m, r, 3, conf), tutto = bilancio(m, r, 1000, conf);
    const ac = b.aiuti.filter((v) => contro(v, true)), pc = b.pesi.filter((v) => contro(v, false));
    if (ac.length) c.verbaliConAiutoContro++; if (pc.length) c.verbaliConPesoContro++;
    for (const v of [...ac, ...pc]) { if (v.controcorrente) c.conDicitura++; else if (v.caricaDegenerato && !(v.confronto && Math.sign(v.confronto.saldo) === Math.sign(v.saldo))) c.controC4203++; else c.controSenzaDicitura++; }
    c.aiutiContro += ac.length; c.pesiContro += pc.length;
    for (const v of [...ac.map((x) => ['aiuto', x]), ...pc.map((x) => ['peso', x])]) { const k = `${m.id} ${v[0]} ${v[1].chiamata}/${v[1].opzione}`; casi.set(k, (casi.get(k) ?? 0) + 1); }
    if (!b.aiuti.length) c.prima_aiutiVuoti++; if (!b.aiuti.length && !b.pesi.length) c.prima_bilancioVuoto++;
    const aA = tutto.aiuti.filter((v) => !contro(v, true)).length, pA = tutto.pesi.filter((v) => !contro(v, false)).length; // A: tolte prima del taglio a 3
    if (!aA) c.A_aiutiVuoti++; if (!aA && !pA) c.A_bilancioVuoto++;
  }
}
console.log(JSON.stringify(c));
console.log(`voci diverse: ${casi.size}`);
for (const [k, n] of [...casi].sort((a, b) => b[1] - a[1])) console.log(`  ${n}× ${k}`);
