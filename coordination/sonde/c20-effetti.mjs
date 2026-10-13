// Sonda C-020 (PO-085 prima parte, C17-05): icone dell'effetto sotto le opzioni e segni ▲/▼/⚑ sul settore dopo la
// risposta, confrontati con gli effetti dei dati; stato «caldo» del rapporto.
// Parte A (tutte le opzioni di tutti gli episodi, stagione 1 a parte): l'attesa è calcolata QUI dai dati, senza usare il
// codice della resa (tensione/pressione ≠ 0 → icona del settore e segno ▲ se > 0, ▼ se < 0; credito ≠ 0 → icona
// fiducia; riserva ≠ 0 → icona della risorsa e segno ⚑ sul settore della chiamata); poi si confronta con vociEffetti
// (src/resa/effetti-opzione.tsx) e segniDi (src/resa/mappa/segni.ts), caricati con vite (ssrLoadModule). Conta anche:
// settori degli effetti che non sono sulla mappa, nomi di settore senza testo, riserve senza settore della chiamata
// (nessun segno), opzioni senza nessuna icona, accenni («costo») che parlano di fiducia/unità senza l'effetto o viceversa.
// Parte B (N partite casuali per episodio, variabili di partenza a caso): per ogni risposta, segni che non corrispondono
// a un cambiamento vero dello stato (tensione già a 0 o 10, riserva al tetto o a zero).
// Parte C (C17-05): nelle stesse partite, settori coperti con tensione ≥ DEGENERA nel rapporto → statoSettore «caldo».
// Uso: node coordination/sonde/c20-effetti.mjs [partite=500]   ·   rosso: ROSSO=1 (accende __NO_C39I01, __NO_C39E01, __NO_C42C01)
import { createServer } from 'vite';
import { leggiDati } from '../../tools/dati-disco.mjs';

const N = Number(process.argv[2] ?? 500);
if (process.env.ROSSO) Object.assign(globalThis, { __NO_C39I01: true, __NO_C39E01: true, __NO_C42C01: true });
const v = await createServer({ root: process.cwd(), server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const E = await v.ssrLoadModule('/src/resa/effetti-opzione.tsx'); const S = await v.ssrLoadModule('/src/resa/mappa/segni.ts');
const P = await v.ssrLoadModule('/src/resa/partita.ts'); const D = await v.ssrLoadModule('/src/resa/dati.ts');
const M = await v.ssrLoadModule('/src/logica/missione.ts'); const B = await v.ssrLoadModule('/src/logica/bot.ts');
const { creaCaso } = await v.ssrLoadModule('/src/logica/caso.ts'); const { variabiliIniziali } = await v.ssrLoadModule('/src/logica/condizioni.ts');
const d = leggiDati('data'); const dich = new Map(d['stato.json'].variabili.map((x) => [x.id, x])); const v0 = variabiliIniziali(dich.values());
const missioni = Object.entries(d).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x).sort((a, b) => a.episodio - b.episodio);

// attesa dai dati (indipendente dalla resa)
const attesaVoci = (c, o) => { const k = new Set(); for (const e of o.effetti) { if (!e.valore) continue;
  if ('tensione' in e) k.add(`settore:${e.tensione}`); else if ('pressione' in e) k.add(`settore:${e.pressione}`);
  else if ('aggiungi' in e && e.aggiungi === 'credito') k.add('fiducia'); else if ('riserva' in e) k.add(`unita:${e.riserva}`); } return [...k].sort(); };
const attesaSegni = (c, o) => o.effetti.filter((e) => e.valore).flatMap((e) => 'tensione' in e ? [`${e.tensione}:tensione:${e.valore > 0 ? 'su' : 'giu'}`]
  : 'pressione' in e ? [`${e.pressione}:pressione:${e.valore > 0 ? 'su' : 'giu'}`] : 'riserva' in e && c.settore ? [`${c.settore}:squadra:${e.valore < 0 ? 'su' : 'giu'}`] : []).sort();

const A = { s1: blank(), tutte: blank() }; const esempi = [];
function blank() { return { opzioni: 0, effetti: 0, vociDiverse: 0, segniDiversi: 0, fuoriMappa: 0, nomeMancante: 0, riservaSenzaSettore: 0, senzaIcone: 0, soloVariabili: 0, costoFiduciaSenzaEffetto: 0, fiduciaSenzaCosto: 0, costoUnitaSenzaEffetto: 0, unitaSenzaCosto: 0, settoreChipNonNelCosto: 0, conTensione: 0, conPressione: 0, conRiserva: 0, conFiducia: 0 }; }
const T = (k) => D.t(k);
for (const m of missioni) {
  D.missione(m.id); const sul = new Set(m.mappa.settori.map((s) => s.id));
  for (const o of m.ondate) for (const c of o.chiamate ?? []) for (const op of c.opzioni) for (const X of m.stagione === 1 ? [A.s1, A.tutte] : [A.tutte]) {
    X.opzioni++; X.effetti += op.effetti.length;
    const att = attesaVoci(c, op); const voci = E.vociEffetti(c, op).map((x) => x.chiave).sort();
    if (JSON.stringify(att) !== JSON.stringify(voci)) { X.vociDiverse++; if (X === A.tutte) esempi.push(`voci ${m.id}/${c.id}/${op.id}: attese ${att} · resa ${voci}`); }
    const segA = attesaSegni(c, op); const seg = S.segniDi(c, op).map((x) => `${x.settore}:${x.tipo}:${x.verso}`).sort();
    if (JSON.stringify(segA) !== JSON.stringify(seg)) { X.segniDiversi++; if (X === A.tutte) esempi.push(`segni ${m.id}/${c.id}/${op.id}: attesi ${segA} · resa ${seg}`); }
    for (const e of op.effetti) { const s = e.tensione ?? e.pressione; if (s && e.valore && !sul.has(s)) { X.fuoriMappa++; if (X === A.tutte) esempi.push(`fuori mappa ${m.id}/${c.id}/${op.id}: ${s}`); }
      if (s && T(`settore.${s}`) === `settore.${s}`) X.nomeMancante++;
      if ('riserva' in e && e.valore && !c.settore) { X.riservaSenzaSettore++; if (X === A.s1) esempi.push(`riserva senza settore della chiamata ${m.id}/${c.id}/${op.id}: ${e.riserva} ${e.valore}`); } }
    if (op.effetti.some((e) => 'tensione' in e && e.valore)) X.conTensione++; if (op.effetti.some((e) => 'pressione' in e && e.valore)) X.conPressione++;
    if (op.effetti.some((e) => 'riserva' in e && e.valore)) X.conRiserva++; if (op.effetti.some((e) => e.aggiungi === 'credito' && e.valore)) X.conFiducia++;
    if (!voci.length) { X.senzaIcone++; if (op.effetti.length) X.soloVariabili++; }
    const costo = op.costo ? T(op.costo.replace(/^testi:/, '')) : '';
    const fid = op.effetti.some((e) => e.aggiungi === 'credito' && e.valore), uni = op.effetti.some((e) => 'riserva' in e && e.valore);
    if (/fiducia/i.test(costo) && !fid) { X.costoFiduciaSenzaEffetto++; if (X === A.s1) esempi.push(`costo cita la fiducia senza effetto ${m.id}/${c.id}/${op.id}: «${costo}»`); }
    if (fid && !/fiducia/i.test(costo)) { X.fiduciaSenzaCosto++; if (X === A.s1) esempi.push(`effetto fiducia non detto nel costo ${m.id}/${c.id}/${op.id}: «${costo}»`); }
    const parolaUnita = /squadr|steward|mediator|transenn|camionett|unità|pattugl|rinforz|agent|uomini|pettorin|collega|carro|idrant/i;
    if (parolaUnita.test(costo) && !uni && /costa|impegn|perdi|manda|serve|occupa|resta|lontan/i.test(costo)) { X.costoUnitaSenzaEffetto++; if (X === A.s1) esempi.push(`costo parla di unità senza effetto riserva ${m.id}/${c.id}/${op.id}: «${costo}»`); }
    if (uni && !parolaUnita.test(costo)) { X.unitaSenzaCosto++; if (X === A.s1) esempi.push(`effetto riserva non detto nel costo ${m.id}/${c.id}/${op.id}: «${costo}» ${JSON.stringify(op.effetti.filter((e) => 'riserva' in e))}`); }
  }
}
console.log('PARTE A – icone e segni contro i dati');
for (const [k, X] of Object.entries(A)) console.log(`  ${k}: ${JSON.stringify(X)}`);
for (const e of esempi.slice(0, 80)) console.log('   · ' + e);

// Parte B e C: partite casuali
const B2 = { s1: { risposte: 0, segni: 0, segniVuoti: 0, perTipo: {} }, tutte: { risposte: 0, segni: 0, segniVuoti: 0, perTipo: {} } }; const vuoti = [];
const C = { rapportiSettori: 0, copertiCaldi: 0, caldoMostrato: 0, coperti: 0, scopertiCaldi: 0 }; let eccezioni = 0, partite = 0;
for (const m of missioni) for (let k = 0; k < N; k++) {
  const caso = creaCaso(`c20e:${m.id}:${k}`); const g = B.casuale(caso, dich); partite++;
  const extra = { informatore_pagato: caso.scegli([true, false]), presidente_incontrato: caso.scegli([true, false]), furgone_visto: caso.scegli([true, false]), rapporto_dessi: caso.scegli(['neutro', 'rispetto', 'ostile']) };
  try {
    let s = M.iniziaMissione(m, { ...v0, ...extra }, dich);
    while (!M.missioneFinita(m, s)) {
      s = M.schiera(m, s, g.schiera(m, s));
      for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) {
        const oid = g.scegli(m, s, c); const op = c.opzioni.find((x) => x.id === oid); const t = M.rispondi(m, s, c.id, oid, dich);
        for (const X of m.stagione === 1 ? [B2.s1, B2.tutte] : [B2.tutte]) { X.risposte++;
          for (const sg of S.segniDi(c, op)) { X.segni++; X.perTipo[sg.tipo] = (X.perTipo[sg.tipo] ?? 0) + 1;
            const e = op.effetti.find((x) => (sg.tipo === 'squadra' ? 'riserva' in x : (x[sg.tipo] === sg.settore)) && x.valore);
            const vuoto = sg.tipo === 'tensione' ? (t.tensione[sg.settore] ?? 0) === (s.tensione[sg.settore] ?? 0) : sg.tipo === 'squadra' ? (t.riserva[e.riserva] ?? 0) === (s.riserva[e.riserva] ?? 0) : false;
            if (vuoto) { X.segniVuoti++; if (vuoti.length < 12 && X === B2.tutte) vuoti.push(`${m.id}/${c.id}/${oid}: ${sg.settore} ${sg.tipo} ${sg.verso} (${sg.tipo === 'tensione' ? `tensione ${s.tensione[sg.settore] ?? 0}` : `riserva ${e.riserva} ${s.riserva[e.riserva] ?? 0}`})`); } } }
        s = t;
      }
      s = M.chiudiOndata(m, s, dich); const r = s.rapporti.at(-1);
      for (const id of Object.keys(r.tensione)) { C.rapportiSettori++; const sc = (r.scoperto[id] ?? 0) > 0; const te = r.tensione[id] ?? 0; const st = P.statoSettore(te, sc);
        if (!sc) { C.coperti++; if (te >= M.DEGENERA) { C.copertiCaldi++; if (st === 'caldo') C.caldoMostrato++; } } else if (st !== 'scoperto') C.scopertiCaldi++; }
    }
    M.concludiMissione(m, s, dich);
  } catch (e) { eccezioni++; if (eccezioni < 4) console.log('eccezione', m.id, k, e.message); }
}
console.log(`PARTE B – segni contro lo stato (${N} partite casuali per episodio, ${partite} partite, ${eccezioni} eccezioni)`);
for (const [k, X] of Object.entries(B2)) console.log(`  ${k}: risposte ${X.risposte}, segni ${X.segni} ${JSON.stringify(X.perTipo)}, segni senza cambiamento dello stato ${X.segniVuoti}`);
for (const x of vuoti) console.log('   · ' + x);
console.log(`PARTE C – C17-05: settori nei rapporti ${C.rapportiSettori}; coperti ${C.coperti}; coperti con tensione ≥ ${M.DEGENERA} ${C.copertiCaldi}, mostrati «caldo» ${C.caldoMostrato}; scoperti non mostrati «scoperto» ${C.scopertiCaldi}`);
await v.close();
