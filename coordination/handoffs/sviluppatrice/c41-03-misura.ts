// C41-03: offerte (risposte non spente) che impegnano un'unità senza unità libere sulla mappa (disponibili − schierate ≤ 0),
// sui 36 episodi, per ogni strategia del bot (casuale: 5 semi). Uso: npx vite-node c4103.ts [ROSSO]
import { readFileSync, readdirSync } from 'node:fs';
const R = '/home/user/valmora';
const { STRATEGIE } = await import(`${R}/src/logica/bot.ts`);
const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { variabiliIniziali } = await import(`${R}/src/logica/condizioni.ts`);
const M = await import(`${R}/src/logica/missione.ts`);
if (process.argv[2] === 'ROSSO') (globalThis as Record<string, unknown>).__NO_C41U01 = true;
const stato = JSON.parse(readFileSync(`${R}/data/stato.json`, 'utf8')), dich = new Map(stato.variabili.map((d: { id: string }) => [d.id, d]));
const missioni = readdirSync(`${R}/data/missioni`).map((f) => JSON.parse(readFileSync(`${R}/data/missioni/${f}`, 'utf8')));
const somma = (ps?: Record<string, number>) => Object.values(ps ?? {}).reduce((a, b) => a + b, 0);
let offerte = 0, giocate = 0; const casi = new Set<string>();
for (const [nome, strat] of Object.entries(STRATEGIE)) for (const seme of nome === 'casuale' ? [1, 2, 3, 4, 5] : [1]) for (const m of missioni) {
  const g = (strat as (c: unknown, d: unknown) => { schiera: Function; scegli: Function })(creaCaso(seme), dich);
  let s = M.iniziaMissione(m, variabiliIniziali(dich.values() as never), dich as never);
  while (!M.missioneFinita(m, s)) {
    s = M.schiera(m, s, g.schiera(m, s));
    for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) {
      const libere = (r: string) => (M.disponibili(m, s)[r] ?? 0) - somma(s.disposizione?.[r]);
      for (const o of c.opzioni) if (M.unitaFinita(m, s, o) === undefined && o.effetti.some((e: { riserva?: string; valore: number }) => 'riserva' in e && e.valore < 0 && libere(e.riserva!) <= 0)) { offerte++; casi.add(`${m.id} o${s.ondata} ${c.id}/${o.id}`); }
      s = M.rispondi(m, s, c.id, g.scegli(m, s, c), dich as never); giocate++;
    }
    s = M.chiudiOndata(m, s, dich as never);
  }
}
console.log(`${process.argv[2] ?? 'attuale'}: chiamate ${giocate}, offerte con unità non libere ${offerte}, casi distinti ${casi.size}`);
console.log([...casi].filter((x) => /^e(02|24|33) /.test(x)).slice(0, 12).join('\n'));
