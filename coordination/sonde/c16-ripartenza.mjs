// Collaudo C-016 (PO-070), sonda di sola lettura sulla logica di «Riparti dall'ondata N» (S-17, PO-060).
// Per ogni episodio gioca N partite col giocatore casuale (seme `c16:<id>:<k>`); per ogni partita persa misura:
//  - n = ondataDaRiprendere(esito) e lo stato riprendiDallOndata(s, n);
//  - se in quello stato tensione_max è già > 6: la sconfitta è certa (tensione_max non scende mai, nessun effetto
//    dei dati la tocca; tutti gli esiti non falliti chiedono tensione_max ≤ 6);
//  - k = prima ondata in cui la tensione ha superato 6 (dove la sconfitta si è decisa davvero);
//  - quante partite da n le salva il giocatore attento, e quante da k;
//  - fiducia (credito) nello stato ripreso.
// Uso: node coordination/sonde/c16-ripartenza.mjs [N=300]
import { leggiDati } from '../../tools/dati-disco.mjs';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, concludiMissione, iniziaMissione, missioneFinita, ondataDaRiprendere, riprendiDallOndata, rispondi, schiera } from '../../src/logica/missione.ts';
import { attenta, casuale } from '../../src/logica/bot.ts';
import { creaCaso } from '../../src/logica/caso.ts';

const N = Number(process.argv[2] ?? 300);
const d = leggiDati();
const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x]));
const v0 = variabiliIniziali(dich.values());
const SOGLIA = 6; // esiti non falliti: tensione_max ≤ 6 (data/missioni/*.json, esiti)

function gioca(m, s, g) {
  while (!missioneFinita(m, s)) {
    s = schiera(m, s, g.schiera(m, s));
    for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = rispondi(m, s, c.id, g.scegli(m, s, c), dich);
    s = chiudiOndata(m, s, dich);
  }
  return { s, r: concludiMissione(m, s, dich) };
}

const righe = [];
let tot = { perse: 0, certe: 0, salvN: 0, salvK: 0, diverse: 0, fiduciaSotto3: 0, n1: 0 };
const esempi = [];
for (let i = 1; i <= 36; i++) {
  const id = `e${String(i).padStart(2, '0')}`;
  const m = d[`missioni/${id}.json`];
  const x = { id, perse: 0, certe: 0, salvN: 0, salvK: 0, diverse: 0, fiduciaSotto3: 0, n1: 0 };
  for (let k = 1; k <= N; k++) {
    const { s, r } = gioca(m, iniziaMissione(m, v0, dich), casuale(creaCaso(`c16:${id}:${k}`), dich));
    if (!r.esito.fallita) continue;
    x.perse++;
    const n = ondataDaRiprendere(r);
    if (n === 1) x.n1++;
    const p = riprendiDallOndata(s, n);
    const decisa = r.rapporti.find((q) => Math.max(...Object.values(q.picco ?? q.tensione)) > SOGLIA).n;
    if (decisa !== n) x.diverse++;
    if (p.variabili.tensione_max > SOGLIA) { x.certe++; if (esempi.length < 3) esempi.push({ id, seme: `c16:${id}:${k}`, n, decisa, tensione_max_nello_stato: p.variabili.tensione_max, massimo_finale: r.variabili.tensione_max, picchi: r.rapporti.map((q) => Math.max(...Object.values(q.picco))) }); }
    if (Number(p.variabili.credito) < 3) x.fiduciaSotto3++;
    if (!gioca(m, p, attenta(creaCaso(1), dich)).r.esito.fallita) x.salvN++;
    const pk = riprendiDallOndata(s, decisa);
    if (pk && !gioca(m, pk, attenta(creaCaso(1), dich)).r.esito.fallita) x.salvK++;
  }
  righe.push(x);
  for (const c of Object.keys(tot)) tot[c] += x[c];
}
console.log(`partite per episodio: ${N} (giocatore casuale, semi c16:<id>:1…${N}); ripresa col giocatore attento (seme 1)`);
console.log('ep   perse  n=1  n≠decisa  certe(tmax>6 nello stato ripreso)  salvate da n  salvate da «decisa»  fiducia<3 nello stato');
for (const x of righe) console.log(`${x.id}  ${String(x.perse).padStart(5)}  ${String(x.n1).padStart(3)}  ${String(x.diverse).padStart(8)}  ${String(x.certe).padStart(5)}  ${String(x.salvN).padStart(12)}  ${String(x.salvK).padStart(12)}  ${String(x.fiduciaSotto3).padStart(8)}`);
console.log('TOTALE', JSON.stringify(tot));
console.log('ESEMPI', JSON.stringify(esempi, null, 1));
