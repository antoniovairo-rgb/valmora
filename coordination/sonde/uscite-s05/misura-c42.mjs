// C42-01/03/04/05 (D-185): su 36 episodi × 20 partite del casuale (+ attenta, equilibrata, peggiore) conta nel bilancio:
// P1) verbali di partite fallite con ≤ 1 peso; P1x) di questi, con una risposta che ha caricato un settore poi degenerato
// rimasta fuori; A5) aiuti che toccano un settore scoperto nella stessa ondata; S4) verbali con settori scoperti taciuti
// (oltre i 3 mostrati) senza riga «e altri»; R1) voci dell'ultima ondata che mostrano «di riserva» speso;
// X) voci contraddette dal confronto (≥ 5 punti nel verso opposto). Uso: node … [rossi separati da virgola]
import { readFileSync } from 'node:fs';
import { leggiDati } from '../../../tools/dati-disco.mjs';
import { variabiliIniziali } from '../../../src/logica/condizioni.ts';
import { giocaMissione, settoriDegenerati } from '../../../src/logica/missione.ts';
import { STRATEGIE } from '../../../src/logica/bot.ts';
import { creaCaso } from '../../../src/logica/caso.ts';
import { bilancio } from '../../../src/logica/bilancio.ts';
import { daTabella } from '../../../src/logica/confronto.ts';
for (const r of (process.argv[2] ?? '').split(',').filter(Boolean)) globalThis[`__NO_${r}`] = true;
const d = leggiDati(); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x])); const v0 = variabiliIniziali(dich.values());
const tab = JSON.parse(readFileSync('src/logica/confronti.json', 'utf8'));
const ms = Object.entries(d).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m);
const sett = (v) => v.impatti.filter((i) => (i.tipo === 'pressione' || i.tipo === 'tensione') && i.dove);
let fallite = 0, P1 = 0, P1x = 0, A5 = 0, S4 = 0, R1 = 0, X = 0, voci = 0, partite = 0; const ep = new Set();
for (const m of ms) { const c = daTabella(tab, m.id); const ultima = m.ondate.length;
  const giochi = [...Array.from({ length: 20 }, (_, s) => ['casuale', s + 1]), ['attenta', 1], ['equilibrata', 1], ['peggiore', 1]];
  for (const [n, s] of giochi) {
    const r = giocaMissione(m, v0, dich, STRATEGIE[n](creaCaso(`c42:${m.id}:${n}:${s}`), dich)); if (!r.scelte.length) continue; partite++;
    const b = bilancio(m, r, 3, c); voci += b.aiuti.length + b.pesi.length;
    const degenerati = (k) => new Set(r.rapporti.filter((o) => o.n >= k).flatMap((o) => settoriDegenerati(m, o)));
    if (r.esito.fallita) { fallite++;
      if (b.pesi.length <= 1) { P1++; ep.add(m.id);
        const tutte = bilancio(m, r, 99, c); const opz = new Map(m.ondate.flatMap((o) => (o.chiamate ?? []).flatMap((cc) => cc.opzioni.map((x) => [`${cc.id}/${x.id}`, x]))));
        const caricanti = r.scelte.filter((sc) => (opz.get(`${sc.chiamata}/${sc.opzione}`)?.effetti ?? []).some((e) => ((e.pressione ?? e.tensione) && e.valore > 0) && degenerati(sc.ondata).has(e.pressione ?? e.tensione)));
        if (caricanti.some((sc) => !b.pesi.some((v) => v.chiamata === sc.chiamata && v.ondata === sc.ondata))) P1x++; } }
    for (const v of b.aiuti) { const scop = new Set(Object.entries(r.rapporti.find((o) => o.n === v.ondata)?.scoperto ?? {}).filter(([, x]) => x > 0).map(([k]) => k));
      if (sett(v).some((i) => scop.has(i.dove))) A5++; }
    const tuttiScop = new Set(r.rapporti.flatMap((o) => Object.entries(o.scoperto).filter(([, x]) => x > 0).map(([k]) => k)));
    const mostrati = new Set(b.scoperti.map((x) => x.settore)); if ([...tuttiScop].some((k) => !mostrati.has(k)) && !(b.altriScoperti > 0)) S4++;
    for (const v of [...b.aiuti, ...b.pesi]) { if (v.ondata === ultima && v.impatti.some((i) => i.tipo === 'riserva' && i.valore < 0)) R1++;
      const x = v.confronto; if (x && ((b.pesi.includes(v) && x.falliteAltre - x.falliteSe >= 5) || (b.aiuti.includes(v) && x.falliteSe - x.falliteAltre >= 5))) X++; }
  } }
console.log(`${partite} partite (${fallite} fallite), ${voci} voci: P1 fallite con ≤1 peso ${P1} (in ${ep.size} episodi), P1x con un caricante del degenerato fuori ${P1x}; A5 aiuti su settore scoperto nella stessa ondata ${A5}; S4 verbali con settori scoperti taciuti ${S4}; R1 voci ultima ondata con riserva spesa ${R1}; X voci contraddette ${X}`);
