// Sonde C-05: dati di e02 «Ospiti numerosi» e campagna e01 → e02. Solo lettura.
// Uso (dalla radice del repo): node coordination/handoffs/collaudatrice/sonde/c05-e02.mjs [semi]
import { leggiDati } from '../../../../tools/dati-disco.mjs';
import { chiamateViste } from '../../../../tools/bot.mjs';
import { creaCaso } from '../../../../src/logica/caso.ts';
import { variabiliIniziali } from '../../../../src/logica/condizioni.ts';
import * as M from '../../../../src/logica/missione.ts';
import { attenta, casuale, equilibrata, peggiore } from '../../../../src/logica/bot.ts';
import { valutaEpisodio } from '../../../../src/logica/episodi.ts';

const N = Number(process.argv[2] ?? 1000);
const dati = leggiDati(); const e01 = dati['missioni/e01.json']; const m = dati['missioni/e02.json'];
const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const v0 = variabiliIniziali(dich.values());
const att = attenta(creaCaso(1), dich);
const conta = (xs, f) => xs.reduce((a, x) => ((a[f(x)] = (a[f(x)] ?? 0) + 1), a), {});
const chiamate = m.ondate.flatMap((o) => o.chiamate);

// E1 · esplorazione completa delle risposte con schieramento attento, per un insieme di variabili iniziali.
function esplora(iniziali) {
  const foglie = []; // { k: codice delle scelte, esito, t, cr, stelle }
  const giro = (s, k) => {
    if (M.missioneFinita(m, s)) { const r = M.concludiMissione(m, s, dich); foglie.push({ k, esito: r.esito.id, t: r.variabili.tensione_max, cr: r.variabili.credito, st: valutaEpisodio(m, r).stelle }); return; }
    const sc = M.schiera(m, s, att.schiera(m, s));
    const aperte = M.chiamateAperte(m, sc);
    const combo = aperte.reduce((acc, c) => acc.flatMap((a) => c.opzioni.map((o, i) => [...a, [c.id, o.id, i]])), [[]]);
    for (const cmb of combo) { let t = sc; for (const [c, o] of cmb) t = M.rispondi(m, t, c, o, dich);
      giro(M.chiudiOndata(m, t, dich), k + cmb.map(([c, , i]) => `${c}=${i};`).join('')); }
  };
  giro(M.iniziaMissione(m, iniziali, dich), '');
  return foglie;
}
function analizza(nome, iniziali) {
  const f = esplora(iniziali);
  console.log(`E1 · ${nome}: ${f.length} combinazioni · esiti ${JSON.stringify(conta(f, (x) => x.esito))} · stelle ${JSON.stringify(conta(f, (x) => x.st))} · tensione_max ${JSON.stringify(conta(f, (x) => x.t))}`);
  const fat = f.filter((x) => x.esito === 'contenuto_a_fatica');
  console.log(`E1 · ${nome}: «a fatica» per tensione>3 ${fat.filter((x) => x.t > 3).length}, solo per credito<3 ${fat.filter((x) => x.t <= 3 && x.cr < 3).length}`);
  // E2 · influenza di ogni chiamata e dominanza misurata sulle stelle
  const idx = new Map(f.map((x) => [x.k, x]));
  for (const c of chiamate) {
    let cambia = 0, tot = 0; const dom = [];
    const pez = (x) => x.k.match(new RegExp(`(^|;)${c.id}=(\\d+);`));
    for (const a in c.opzioni) for (const b in c.opzioni) { if (a === b) continue; let meglio = 0, peggio = 0, n = 0;
      for (const x of f) { const p = pez(x); if (!p || p[2] !== a) continue; const y = idx.get(x.k.replace(`${c.id}=${a};`, `${c.id}=${b};`)); n++;
        if (y.esito !== x.esito) cambia++; tot++; if (y.st > x.st) meglio++; else if (y.st < x.st) peggio++; }
      if (n && peggio === 0 && meglio > 0) dom.push(`«${c.opzioni[a].id}»→«${c.opzioni[b].id}» mai peggio, meglio ${meglio}/${n}`); }
    if (tot) console.log(`E2 · ${nome} · ${c.id.padEnd(20)} cambia l'esito in ${(100 * cambia / tot).toFixed(1)}%${dom.length ? ' · DOMINATA: ' + dom.join('; ') : ''}`);
    else console.log(`E2 · ${nome} · ${c.id.padEnd(20)} non compare`);
  }
  return f;
}
analizza('credito 5, informatore non pagato', { ...v0, credito: 5, informatore_pagato: false });
analizza('credito 5, informatore pagato', { ...v0, credito: 5, informatore_pagato: true });

// E3 · strategie e credito iniziale (bot del repo + «più credito»), N semi; variabili iniziali in griglia.
const piuCredito = (caso, d) => ({ schiera: attenta(caso, d).schiera, scegli: (mm, s, c) => { const v = (o) => o.effetti.reduce((t, e) => t + (e.aggiungi === 'credito' ? e.valore : 0), 0);
  const best = Math.max(...M.opzioniValide(c, s).map(v)); return attenta(caso, d).scegli(mm, s, { ...c, opzioni: M.opzioniValide(c, s).filter((o) => v(o) === best) }); } });
const STR = { casuale, attenta, equilibrata, peggiore, piu_credito: piuCredito };
for (const credito of [0, 2, 5, 8, 10]) for (const pagato of [false, true]) {
  const riga = [];
  for (const [nome, S] of Object.entries(STR)) { const st = {}; let blocchi = 0;
    for (let seme = 1; seme <= (nome === 'casuale' ? N : 50); seme++) { try { const r = M.giocaMissione(m, { ...v0, credito, informatore_pagato: pagato }, dich, S(creaCaso(`c05:${nome}:${seme}`), dich));
      const k = valutaEpisodio(m, r).stelle; st[k] = (st[k] ?? 0) + 1; } catch { blocchi++; } }
    riga.push(`${nome} ${JSON.stringify(st)}${blocchi ? ` BLOCCHI ${blocchi}` : ''}`); }
  console.log(`E3 · credito iniziale ${credito}, pagato ${pagato}: stelle → ${riga.join(' · ')}`);
}

// E4 · difficoltà del casuale scomposta (credito 5, non pagato)
for (const [sch, sce] of [['casuale', 'casuale'], ['casuale', 'attenta'], ['attenta', 'casuale']]) { const e = {};
  for (let seme = 1; seme <= N; seme++) { const g = casuale(creaCaso(`c05d:${sch}${sce}:${seme}`), dich);
    const r = M.giocaMissione(m, { ...v0 }, dich, { schiera: sch === 'casuale' ? g.schiera : att.schiera, scegli: sce === 'casuale' ? g.scegli : att.scegli }); const k = r.esito.fallita ? 'fallita' : r.esito.id; e[k] = (e[k] ?? 0) + 1; }
  console.log(`E4 · schieramento ${sch} + risposte ${sce}, ${N} semi: ${JSON.stringify(e)}`); }

// E5 · campagna e01 → e02 con la stessa strategia, e chiamate viste (tools/bot.mjs:chiamateViste)
for (const [nome, S] of Object.entries(STR)) { const cr = {}, pag = {}, st = {}; const semi = nome === 'casuale' ? N : 50;
  for (let seme = 1; seme <= semi; seme++) { const r1 = M.giocaMissione(e01, v0, dich, S(creaCaso(`c05c1:${nome}:${seme}`), dich));
    if (r1.esito.fallita) { st['e01 fallita'] = (st['e01 fallita'] ?? 0) + 1; continue; } // D-059: si rigioca, non si passa a e02
    cr[r1.variabili.credito] = (cr[r1.variabili.credito] ?? 0) + 1; pag[r1.variabili.informatore_pagato] = (pag[r1.variabili.informatore_pagato] ?? 0) + 1;
    const r2 = M.giocaMissione(m, r1.variabili, dich, S(creaCaso(`c05c2:${nome}:${seme}`), dich)); const k = `e02 ${valutaEpisodio(m, r2).stelle}★`; st[k] = (st[k] ?? 0) + 1; }
  console.log(`E5 · campagna ${nome}, ${semi} semi: credito all'uscita di e01 ${JSON.stringify(cr)} · informatore pagato ${JSON.stringify(pag)} · ${JSON.stringify(st)}`); }
console.log(`E5 · chiamateViste (300 semi): ${JSON.stringify(chiamateViste(dati))}`);

// E6 · dominanza effetto per effetto (come B2 di C-01)
const vettore = (o) => { const v = {}; for (const e of o.effetti) { const [k, s] = 'pressione' in e ? [`p:${e.pressione}`, -1] : 'tensione' in e ? [`t:${e.tensione}`, -1] : 'riserva' in e ? [`r:${e.riserva}`, 1] : 'aggiungi' in e ? [`v:${e.aggiungi}`, 1] : [`storia:${e.imposta}=${e.valore}`, 0];
  v[k] = s === 0 ? 1 : (v[k] ?? 0) + s * e.valore; } return v; };
for (const c of chiamate) for (const a of c.opzioni) for (const b of c.opzioni) { if (a === b) continue; const va = vettore(a), vb = vettore(b); const assi = new Set([...Object.keys(va), ...Object.keys(vb)]);
  if ([...assi].some((k) => k.startsWith('storia:') && (va[k] ?? 0) !== (vb[k] ?? 0))) continue; const d = [...assi].map((k) => (vb[k] ?? 0) - (va[k] ?? 0));
  if (d.every((x) => x >= 0) && d.some((x) => x > 0)) console.log(`E6 · ${c.id}: «${b.id}» domina «${a.id}»`); }
console.log(`E6 · tipi di evento per ondata ${JSON.stringify(m.ondate.map((o) => o.eventi.map((e) => e.tipo)))}; chiamate per ondata ${m.ondate.map((o) => o.chiamate.length).join('+')}`);
