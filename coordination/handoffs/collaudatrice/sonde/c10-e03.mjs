// Sonde C-10: transenne fisse (D-082), picco nel rapporto (C09-01), bilancio di fine episodio (D-085). Solo lettura.
// Uso (dalla radice del repo): node coordination/handoffs/collaudatrice/sonde/c10-e03.mjs [partite]
import { leggiDati } from '../../../../tools/dati-disco.mjs';
import { creaCaso } from '../../../../src/logica/caso.ts';
import { variabiliIniziali } from '../../../../src/logica/condizioni.ts';
import * as M from '../../../../src/logica/missione.ts';
import { STRATEGIE, casuale } from '../../../../src/logica/bot.ts';
import { bilancio } from '../../../../src/logica/bilancio.ts';
import { valutaEpisodio } from '../../../../src/logica/episodi.ts';

const N = Number(process.argv[2] ?? 50);
const dati = leggiDati(); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const v0 = variabiliIniziali(dich.values());
const e03 = dati['missioni/e03.json'];
const prova = (f) => { try { return { ok: true, v: f() }; } catch (e) { return { ok: false, e: e.message }; } };
const riga = (id, cosa, esito) => console.log(`${id} · ${cosa} → ${esito}`);
const J = (x) => JSON.parse(JSON.stringify(x));
const vuota = () => Object.fromEntries(Object.keys(e03.mappa.risorse).map((r) => [r, {}]));

// T1 · settori ammessi per le transenne e montaggio vietato
riga('T1', 'settori ammessi per transenne (efficacia > 0)', JSON.stringify(M.settoriAmmessi(e03, 'transenne')));
for (const s of e03.mappa.settori.map((x) => x.id)) { const d = vuota(); d.transenne = { [s]: 1 }; const r = prova(() => M.schiera(e03, M.iniziaMissione(e03, v0, dich), d));
  riga('T1', `transenne in ${s}`, r.ok ? 'accettato' : `rifiutato: ${r.e}`); }

// Una partita guidata: ondata 1 con 2 transenne in quartiere, poi risposte scelte per toccare la riserva.
function avanza(s, d, scegli) { s = M.schiera(e03, s, d); for (let c = M.chiamateAperte(e03, s)[0]; c; c = M.chiamateAperte(e03, s)[0]) s = M.rispondi(e03, s, c.id, scegli(c, s), dich); return M.chiudiOndata(e03, s, dich); }
const prima = (c, s) => M.opzioniValide(c, s)[0].id;

// T2 · transenne piazzate, poi riserva transenne negativa (effetto forzato: nessuna opzione dei dati la tocca)
{
  let s = M.iniziaMissione(e03, v0, dich); const d = vuota(); d.transenne = { quartiere: 2 };
  s = avanza(s, d, prima);
  const dopo1 = { fisse: s.fisse.transenne, disp: M.disponibili(e03, s).transenne };
  const s2 = { ...s, riserva: { ...s.riserva, transenne: -2 } };
  const disp2 = M.disponibili(e03, s2); const s3 = avanza(s2, vuota(), prima);
  riga('T2', 'dopo ondata 1 con 2 transenne in quartiere; poi riserva transenne −2', `fisse ${JSON.stringify(dopo1.fisse)}, disponibili ${dopo1.disp}; con riserva −2: disponibili ${disp2.transenne}, fisse dopo ondata 2 ${JSON.stringify(s3.fisse.transenne)}, copertura quartiere nel rapporto 2 scoperto=${s3.rapporti[1].scoperto.quartiere}`);
  const opz = e03.ondate.flatMap((o) => o.chiamate.flatMap((c) => c.opzioni.filter((x) => x.effetti.some((e) => e.riserva === 'transenne')).map((x) => `${c.id}.${x.id}`)));
  riga('T2', 'opzioni dei dati che toccano la riserva di transenne', opz.length ? opz.join(', ') : 'nessuna');
}
// T3 · rinforzi di transenne (+1) dopo averle montate tutte
{
  let s = M.iniziaMissione(e03, v0, dich); const d = vuota(); d.transenne = { quartiere: 2 }; s = avanza(s, d, prima);
  const s2 = { ...s, riserva: { ...s.riserva, transenne: 1 } }; const d2 = vuota(); d2.transenne = { parcheggi: 1 };
  const r = prova(() => avanza(s2, d2, prima));
  riga('T3', 'riserva transenne +1 dopo 2 montate; monto la terza in parcheggi', r.ok ? `ok: fisse ${JSON.stringify(r.v.fisse.transenne)}, disponibili ora ${M.disponibili(e03, r.v).transenne}` : r.e);
  const d3 = vuota(); d3.transenne = { parcheggi: 2 }; const r2 = prova(() => M.schiera(e03, s2, d3)); riga('T3', 'monto 2 transenne con 1 sola disponibile', r2.ok ? 'ACCETTATO' : `rifiutato: ${r2.e}`);
}
// T4 · salvataggio a metà ondata e ripresa: `fisse` presente (JSON) e assente (salvataggio vecchio)
{
  let s = M.iniziaMissione(e03, v0, dich); const d = vuota(); d.transenne = { quartiere: 1 }; s = avanza(s, d, prima);
  const sc = M.schiera(e03, s, vuota()); const rip = J(sc); const finisci = (x) => { for (let c = M.chiamateAperte(e03, x)[0]; c; c = M.chiamateAperte(e03, x)[0]) x = M.rispondi(e03, x, c.id, prima(c, x), dich); return M.chiudiOndata(e03, x, dich); };
  const a = finisci(sc), b = finisci(rip); const senza = { ...J(sc) }; delete senza.fisse; const c = finisci(senza);
  riga('T4', 'ondata 2 ripresa da JSON (fisse presenti)', JSON.stringify(a) === JSON.stringify(b) ? 'identica' : 'DIVERSA');
  riga('T4', 'ondata 2 ripresa senza campo fisse (salvataggio vecchio a metà)', `scoperto quartiere ${c.rapporti[1].scoperto.quartiere} (con fisse ${a.rapporti[1].scoperto.quartiere}); fisse dopo ${JSON.stringify(c.fisse.transenne)}; disponibili transenne ondata 3 ${M.disponibili(e03, c).transenne} (con fisse ${M.disponibili(e03, a).transenne})`);
  // transenne a riposo? settore scoperto con transenne dentro
  let t = M.iniziaMissione(e03, v0, dich); const dq = vuota(); dq.transenne = { piazzale: 1 }; t = avanza(t, dq, prima);
  riga('T4', 'transenna sola in piazzale (folla 3, efficacia 1): riposo dopo ondata 1', `scoperto piazzale ${t.rapporti[0].scoperto.piazzale}; aRiposo ${JSON.stringify(t.riposo)}; fisse ${JSON.stringify(t.fisse.transenne)}`);
}
// T5 · invarianti su partite vere: transenne mai disponibili oltre quantità − fisse; mai a riposo; fisse non diminuiscono
for (const [nome, S] of Object.entries(STRATEGIE)) { let viol = 0, blocchi = 0;
  for (let seme = 1; seme <= 300; seme++) { const r = prova(() => { const g = S(creaCaso(`c10:${nome}:${seme}`), dich); let s = M.iniziaMissione(e03, v0, dich); let prec = 0;
    while (!M.missioneFinita(e03, s)) { const tot = Object.values(s.fisse?.transenne ?? {}).reduce((a, b) => a + b, 0); if (tot < prec) viol++; prec = tot;
      if (M.disponibili(e03, s).transenne > Math.max(0, e03.mappa.risorse.transenne.quantita + (s.riserva.transenne ?? 0) - tot)) viol++; if (s.riposo.transenne) viol++;
      s = M.schiera(e03, s, g.schiera(e03, s)); for (let c = M.chiamateAperte(e03, s)[0]; c; c = M.chiamateAperte(e03, s)[0]) s = M.rispondi(e03, s, c.id, g.scegli(e03, s, c), dich); s = M.chiudiOndata(e03, s, dich); }
    return M.concludiMissione(e03, s, dich); }); if (!r.ok) blocchi++; }
  riga('T5', `e03 · ${nome} · 300 semi`, `blocchi ${blocchi}, violazioni ${viol}`); }

// P1 · picco nel rapporto: max dei picchi = tensione_max, su partite vere di e01-e03 (4 strategie × 300 semi)
for (const id of ['e01', 'e02', 'e03']) { const m = dati[`missioni/${id}.json`]; let diversi = 0, n = 0, nascosti = 0;
  for (const [nome, S] of Object.entries(STRATEGIE)) for (let seme = 1; seme <= 300; seme++) {
    const r = M.giocaMissione(m, v0, dich, S(creaCaso(`c10p:${id}:${nome}:${seme}`), dich)); n++;
    const mp = Math.max(0, ...r.rapporti.flatMap((x) => Object.values(x.picco ?? {}))); if (mp !== r.variabili.tensione_max) diversi++;
    nascosti += r.rapporti.flatMap((x) => Object.keys(x.tensione).filter((k) => (x.picco?.[k] ?? 0) > x.tensione[k])).length; }
  riga('P1', `${id}: max dei picchi = tensione_max`, `${n - diversi} su ${n} (diversi ${diversi}); settori-ondata con picco > tensione di fine ondata: ${nascosti}`); }

// B1 · bilancio su N partite casuali per episodio
for (const id of ['e01', 'e02', 'e03']) { const m = dati[`missioni/${id}.json`]; const prob = []; const conti = { fallite: 0, superate: 0 };
  for (let seme = 1; seme <= N; seme++) { const r = M.giocaMissione(m, v0, dich, casuale(creaCaso(`c10b:${id}:${seme}`), dich)); const b = bilancio(m, r); const st = valutaEpisodio(m, r).stelle;
    if (r.esito.fallita) { conti.fallite++; if (!b.pesi.length && !b.scoperti.length) prob.push(`seme ${seme}: fallita senza pesi né scoperti`); } else conti.superate++;
    if (b.aiuti.some((x) => x.saldo <= 0) || b.pesi.some((x) => x.saldo >= 0)) prob.push(`seme ${seme}: segno del saldo sbagliato`);
    const due = b.stelle.due.every((x) => x.ok), tre = b.stelle.tre.every((x) => x.ok);
    if (!r.esito.fallita && ((st >= 2) !== due || (st === 3) !== tre)) prob.push(`seme ${seme}: ${st}★ ma requisiti due=${due} tre=${tre} (esito ${r.esito.id})`);
    if (st === 3 && b.scoperti.length) prob.push(`seme ${seme}: 3★ con settori scoperti ${JSON.stringify(b.scoperti)}`);
    for (const x of [...b.aiuti, ...b.pesi]) if (!r.scelte.some((y) => y.chiamata === x.chiamata && y.opzione === x.opzione)) prob.push(`seme ${seme}: voce non giocata ${x.chiamata}/${x.opzione}`);
    if (b.scoperti.some((x) => !(r.rapporti[x.ondata - 1]?.scoperto[x.settore] > 0))) prob.push(`seme ${seme}: scoperto non presente nel rapporto`); }
  riga('B1', `${id}: ${N} partite casuali ${JSON.stringify(conti)}`, prob.length ? `${prob.length} problemi: ${prob.slice(0, 5).join(' | ')}` : 'nessun problema'); }
