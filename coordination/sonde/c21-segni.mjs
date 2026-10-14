// C-021: C20-07 sui dati. Partite casuali (variabili iniziali), a ogni risposta segniDi(c, o, prima, dopo) di
// src/resa/mappa/segni.ts: segni di tensione o squadra senza un cambiamento dello stato; chiamate senza settore con
// unità che cambiano e nessun segno. Uso: node coordination/sonde/c21-segni.mjs [partite per episodio]
// Rosso: node --import 'data:text/javascript,globalThis.__NO_C44E01=true;globalThis.__NO_C44E02=true' …
import { join, resolve } from 'node:path';
const R = resolve('.'); const N = Number(process.argv[2] ?? 300);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { segniDi, simboloSegno } = await import(`${R}/src/resa/mappa/segni.ts`);
const { missioniDai } = await import(`${R}/tools/foto-bozze.mjs`); const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(R, 'data'));
let risposte = 0, segni = 0, vuoti = 0, senzaSettore = 0, senzaSettoreSegnati = 0, partite = 0; const simboli = {}; const es = [];
for (const m of missioni) for (let k = 1; k <= N; k++) {
  const g = B.casuale(creaCaso(k * 31 + m.episodio), dich); let s = M.iniziaMissione(m, { ...v0 }, dich); partite++;
  while (!M.missioneFinita(m, s)) {
    s = M.schiera(m, s, g.schiera(m, s));
    for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) {
      const oid = g.scegli(m, s, c), o = c.opzioni.find((x) => x.id === oid); const dopo = M.rispondi(m, s, c.id, oid, dich); risposte++;
      for (const x of segniDi(c, o, s, dopo)) {
        segni++; simboli[simboloSegno(x)] = (simboli[simboloSegno(x)] ?? 0) + 1;
        const fermo = x.tipo === 'tensione' ? s.tensione[x.settore] === dopo.tensione[x.settore] : x.tipo === 'squadra' ? Object.keys(m.mappa.risorse).every((r) => s.riserva[r] === dopo.riserva[r]) : false;
        if (fermo) { vuoti++; if (es.length < 5) es.push(`${m.id} ${c.id}/${oid} ${x.tipo} ${x.settore}`); }
      }
      if (!c.settore && Object.keys(m.mappa.risorse).some((r) => s.riserva[r] !== dopo.riserva[r])) { senzaSettore++; if (segniDi(c, o, s, dopo).some((x) => x.tipo === 'squadra')) senzaSettoreSegnati++; }
      s = dopo;
    }
    s = M.chiudiOndata(m, s, dich);
  }
}
console.log(`partite ${partite}, risposte ${risposte}, segni ${segni} ${JSON.stringify(simboli)}; segni senza cambiamento ${vuoti} ${es.join('; ')}`);
console.log(`risposte senza settore che cambiano le unità ${senzaSettore}, con segno delle squadre ${senzaSettoreSegnati}`);
