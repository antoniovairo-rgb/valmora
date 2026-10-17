// Sonda C-035 (C34-10 su tutti gli episodi): chiamate in cui C17-03 nasconde un'opzione perché l'unità che impegna è
// finita (haUnita), con quante opzioni restano. Bot casuale e attento, semi 1…N, tutte le missioni.
// Uso: node coordination/sonde/c35-opzioni-sparite.mjs <radice dati> [N=300]
import { join } from 'node:path';
import { leggiDati } from '../../tools/dati-disco.mjs';
import { variabiliIniziali, valuta } from '../../src/logica/condizioni.ts';
import { chiamateAperte, chiudiOndata, iniziaMissione, missioneFinita, opzioniValide, rispondi, schiera } from '../../src/logica/missione.ts';
import { casuale, attenta } from '../../src/logica/bot.ts';
import { creaCaso } from '../../src/logica/caso.ts';
const R = process.argv[2] ?? '.'; const N = Number(process.argv[3] ?? 300);
const d = leggiDati(join(R, 'data')); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x])); const v0 = variabiliIniziali(dich.values());
const fatte = (s) => new Set(s.scelte.map((y) => `${y.chiamata}/${y.opzione}`));
const senzaUnita = (c, s) => c.opzioni.filter((o) => (!o.se || valuta(o.se, s.variabili)) && (!o.dopo || (!(o.dopo.mai ?? []).some((k) => fatte(s).has(k)) && (o.dopo.gia ?? []).every((k) => fatte(s).has(k)))));
const tot = {};
for (const [k, m] of Object.entries(d).filter(([k]) => k.startsWith('missioni/')).sort()) for (const [nome, st] of [['casuale', casuale], ['attenta', attenta]]) for (let seme = 1; seme <= N; seme++) {
  const caso = creaCaso(`c35o:${m.id}:${seme}`); const g = st(caso, dich); let s = iniziaMissione(m, v0, dich);
  while (!missioneFinita(m, s)) { s = schiera(m, s, g.schiera(m, s));
    for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) {
      const ok = opzioniValide(c, s, m); const tutte = senzaUnita(c, s);
      if (ok.length < tutte.length) { const x = `${m.id} o${s.ondata} ${c.id}: restano ${ok.length} (${ok.map((o) => o.id)}) di ${tutte.length}, nascoste ${tutte.filter((o) => !ok.includes(o)).map((o) => o.id)}`; tot[x] ??= { casuale: 0, attenta: 0 }; tot[x][nome]++; }
      s = rispondi(m, s, c.id, (nome === 'attenta' ? g.scegli(m, s, c) : caso.scegli(ok).id), dich);
    }
    s = chiudiOndata(m, s, dich); }
}
const righe = Object.entries(tot).sort(); console.log(`chiamate con opzioni nascoste da C17-03 (semi ${N} × 2 bot): ${righe.length} casi distinti; con una sola opzione rimasta: ${righe.filter(([k]) => / restano 1 /.test(k)).length}`);
for (const [k, v] of righe) console.log(`${k} · casuale ${v.casuale}/${N}, attenta ${v.attenta}/${N}`);
