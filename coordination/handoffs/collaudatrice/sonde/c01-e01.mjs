// Sonde C-01 parte B: dati di e01 v2. Solo lettura.
// Uso: node coordination/handoffs/collaudatrice/sonde/c01-e01.mjs <radice del ramo della principale>
// (la radice deve avere node_modules; i moduli si caricano da lì, così si prova esattamente quel commit)
import { resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.');
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { variabiliIniziali } = await import(`${R}/src/logica/condizioni.ts`);
const M = await import(`${R}/src/logica/missione.ts`);
const { attenta, casuale } = await import(`${R}/src/logica/bot.ts`);
process.chdir(R);
const dati = leggiDati(); const m = dati['missioni/e01.json'];
const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const v0 = variabiliIniziali(dich.values());
const att = attenta(creaCaso(1), dich);

// B1 · esplorazione completa delle risposte (13 chiamate), schieramento «attento» a ogni ondata.
const combinazioni = (cs) => cs.reduce((acc, c) => acc.flatMap((a) => c.opzioni.map((o) => [...a, [c.id, o.id]])), [[]]);
const foglie = [];
function giro(s, scelte) {
  if (M.missioneFinita(m, s)) { const r = M.concludiMissione(m, s, dich); foglie.push({ scelte, esito: r.esito.id, t: r.variabili.tensione_max, cr: r.variabili.credito }); return; }
  const sc = M.schiera(m, s, att.schiera(m, s));
  for (const comb of combinazioni(M.chiamateAperte(m, sc))) {
    let t = sc; for (const [c, o] of comb) t = M.rispondi(m, t, c, o, dich);
    giro(M.chiudiOndata(m, t, dich), [...scelte, ...comb.map(([c, o]) => `${c}.${o}`)]);
  }
}
giro(M.iniziaMissione(m, v0, dich), []);
const conta = (xs, f) => xs.reduce((a, x) => ((a[f(x)] = (a[f(x)] ?? 0) + 1), a), {});
console.log(`B1 · combinazioni di risposte: ${foglie.length} · esiti ${JSON.stringify(conta(foglie, (f) => f.esito))}`);
console.log(`B1 · tensione_max ${JSON.stringify(conta(foglie, (f) => f.t))} · credito finale ${JSON.stringify(conta(foglie, (f) => f.cr))}`);
// per opzione: quota di «contenuto» fra le combinazioni che la contengono
const opz = {};
for (const f of foglie) for (const x of f.scelte) { const o = (opz[x] ??= { n: 0, contenuto: 0, degenerato: 0 }); o.n++; if (f.esito === 'contenuto') o.contenuto++; if (f.esito === 'degenerato') o.degenerato++; }
console.log('B1 · per opzione: % contenuto / % degenerato fra le combinazioni che la contengono');
for (const [k, o] of Object.entries(opz)) console.log(`   ${k.padEnd(28)} ${(100 * o.contenuto / o.n).toFixed(1).padStart(5)}% / ${(100 * o.degenerato / o.n).toFixed(1).padStart(5)}%`);

// B2 · opzioni dominate: B domina A se, effetto per effetto, non è peggiore e almeno una volta è migliore
// (pressione/tensione: meno è meglio; riserva/credito: più è meglio). Variabili di storia (bool) = asse a parte.
const vettore = (o) => { const v = {}; for (const e of o.effetti) {
  if ('pressione' in e) v[`p:${e.pressione}`] = (v[`p:${e.pressione}`] ?? 0) - e.valore;
  else if ('tensione' in e) v[`t:${e.tensione}`] = (v[`t:${e.tensione}`] ?? 0) - e.valore;
  else if ('riserva' in e) v[`r:${e.riserva}`] = (v[`r:${e.riserva}`] ?? 0) + e.valore;
  else if ('aggiungi' in e) v[`v:${e.aggiungi}`] = (v[`v:${e.aggiungi}`] ?? 0) + e.valore;
  else v[`storia:${e.imposta}=${e.valore}`] = 1; } return v; };
for (const o of m.ondate) for (const c of o.chiamate) for (const a of c.opzioni) for (const b of c.opzioni) {
  if (a === b) continue; const va = vettore(a), vb = vettore(b); const assi = new Set([...Object.keys(va), ...Object.keys(vb)]);
  if ([...assi].some((k) => k.startsWith('storia:') && (va[k] ?? 0) !== (vb[k] ?? 0))) continue;
  const d = [...assi].map((k) => (vb[k] ?? 0) - (va[k] ?? 0));
  if (d.every((x) => x >= 0) && d.some((x) => x > 0)) console.log(`B2 · ${c.id}: «${b.id}» domina «${a.id}» (${JSON.stringify(a.effetti)} contro ${JSON.stringify(b.effetti)})`);
}

// B3 · risorse con effetto nullo dopo l'uso: dove serve ancora il mediatore?
const tipi = m.ondate.map((o) => [...new Set(o.eventi.map((e) => e.tipo))]);
console.log(`B3 · tipi di evento per ondata ${JSON.stringify(tipi)}; il mediatore dimezza ${JSON.stringify(m.mappa.risorse.mediatore.dimezza)}, efficacia ${JSON.stringify(m.mappa.risorse.mediatore.efficacia)}`);

// B4 · decisioni per missione (proxy della durata, in passi).
const unita = Object.values(m.mappa.risorse).reduce((t, r) => t + r.quantita, 0);
console.log(`B4 · ondate ${m.ondate.length}, chiamate ${m.ondate.map((o) => o.chiamate.length).join('+')} = ${m.ondate.reduce((t, o) => t + o.chiamate.length, 0)}, schieramenti ${m.ondate.length}, unità da piazzare per ondata ≤ ${unita}, briefing ${m.briefing.length}, introduzione ${m.introduzione?.length ?? 0} battute`);

// B5 · le scelte contano anche con schieramento «umano» (casuale) e con l'attento: esiti per strategia di risposta.
for (const [nome, rispo] of Object.entries({ prima_opzione: (c) => c.opzioni[0].id, ultima_opzione: (c) => c.opzioni.at(-1).id })) {
  const r = M.giocaMissione(m, v0, dich, { schiera: att.schiera, scegli: (_m, _s, c) => rispo(c) });
  console.log(`B5 · schieramento attento + ${nome}: ${r.esito.id} (tensione_max ${r.variabili.tensione_max}, credito ${r.variabili.credito})`);
}
{
  const esiti = {};
  for (let seme = 1; seme <= 1000; seme++) { const caso = creaCaso(`b5:${seme}`); const g = casuale(caso, dich);
    const r = M.giocaMissione(m, v0, dich, { schiera: g.schiera, scegli: (mm, s, c) => att.scegli(mm, s, c) }); esiti[r.esito.id] = (esiti[r.esito.id] ?? 0) + 1; }
  console.log(`B5 · schieramento casuale + risposte attente, 1000 semi: ${JSON.stringify(esiti)}`);
}

// B6 · perché «contenuto_a_fatica»: tensione > 3 o credito < 3?
{
  const fat = foglie.filter((f) => f.esito === 'contenuto_a_fatica');
  console.log(`B6 · fatica per tensione>3: ${fat.filter((f) => f.t > 3).length}, solo per credito<3 (tensione ≤3): ${fat.filter((f) => f.t <= 3 && f.cr < 3).length}, su ${fat.length}`);
}
// B7 · influenza di ogni chiamata: quota di combinazioni in cui cambiare SOLO quella risposta cambia l'esito.
{
  const idx = new Map(foglie.map((f) => [f.scelte.join(','), f.esito]));
  const chiamate = m.ondate.flatMap((o) => o.chiamate);
  for (const c of chiamate) {
    let cambia = 0, tot = 0;
    for (const f of foglie) { const i = f.scelte.findIndex((x) => x.startsWith(`${c.id}.`));
      for (const o of c.opzioni) { if (f.scelte[i] === `${c.id}.${o.id}`) continue; const alt = [...f.scelte]; alt[i] = `${c.id}.${o.id}`;
        // l'indice vale solo se lo schieramento attento non cambia: confrontiamo per chiave, le foglie sono tutte presenti
        tot++; if (idx.get(alt.join(',')) !== f.esito) cambia++; } }
    console.log(`B7 · ${c.id.padEnd(16)} cambiare solo questa risposta cambia l'esito in ${(100 * cambia / tot).toFixed(1)}% dei casi`);
  }
}
// B8 · strategia «più credito» (a parità, la più bassa per tensione stimata) con schieramento attento.
{
  const piuCredito = (mm, s, c) => { const val = (o) => o.effetti.reduce((t, e) => t + ('aggiungi' in e && e.aggiungi === 'credito' ? e.valore : 0), 0);
    const best = Math.max(...c.opzioni.map(val)); const cand = { ...c, opzioni: c.opzioni.filter((o) => val(o) === best) }; return att.scegli(mm, s, cand); };
  const r = M.giocaMissione(m, v0, dich, { schiera: att.schiera, scegli: piuCredito });
  console.log(`B8 · schieramento attento + «più credito»: ${r.esito.id} (tensione_max ${r.variabili.tensione_max}, credito ${r.variabili.credito}); scelte ${r.scelte.map((x) => x.opzione).join(',')}`);
  const esiti = {};
  for (let seme = 1; seme <= 1000; seme++) { const g = casuale(creaCaso(`b8:${seme}`), dich);
    const z = M.giocaMissione(m, v0, dich, { schiera: g.schiera, scegli: piuCredito }); esiti[z.esito.id] = (esiti[z.esito.id] ?? 0) + 1; }
  console.log(`B8 · schieramento casuale + «più credito», 1000 semi: ${JSON.stringify(esiti)}`);
}
// B9 · peggior risposta possibile con schieramento attento: si arriva a «degenerato»?
console.log(`B9 · con schieramento attento, «degenerato» in ${foglie.filter((f) => f.esito === 'degenerato').length} combinazioni su ${foglie.length}; tensione_max massima ${Math.max(...foglie.map((f) => f.t))}`);

// B10 · C01-A01/A02 su e01 vera: «chiedi i rinforzi» e ri-schiera con 6 squadre già nell'ondata 1.
{
  let s = M.schiera(m, M.iniziaMissione(m, v0, dich), { squadre: { strada_cinderwick: 4 }, steward: {}, mediatore: {} });
  s = M.rispondi(m, s, 'rinforzi', 'chiedi', dich);
  const r = (() => { try { return 'ACCETTATO: ' + JSON.stringify(M.schiera(m, s, { squadre: { strada_cinderwick: 3, strada_larkspire: 2, piazzale: 1 }, steward: {}, mediatore: {} }).disposizione); } catch (e) { return 'rifiutato: ' + e.message; } })();
  console.log(`B10 · ondata 1, dopo «chiedi»: disponibili ${JSON.stringify(M.disponibili(m, s))}; ri-schiero 6 squadre → ${r}`);
}
