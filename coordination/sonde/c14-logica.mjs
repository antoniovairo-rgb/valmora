// Sonda C-014 (collaudatrice, sola lettura): logica di tutti i 36 episodi sulla build 2459e64.
// Uso: node coordination/sonde/c14-logica.mjs [semi casuali per episodio, default 2000]
// L1 campagna intera e01→e36 per strategia (variabili della storia portate avanti come in src/resa/episodi.ts)
// L2 esiti e stelle raggiungibili per episodio (fiducia d'ingresso 0…10)
// L3 soft-lock: chiamate visibili con tutte le opzioni non valide (enumerazione delle variabili citate)
// L4 salvataggio/ripresa a OGNI passo (JSON + migra) e ripartenza dall'ondata (PO-060) contro la partita intera
// L5 salvataggi vecchi/corrotti/vuoti attraverso migra()
// L6 variabili dichiarate in stato.json e mai lette/scritte; salvataggio 0.4.0 contro stato.json 0.5.0
import { leggiDati } from '../../tools/dati-disco.mjs';
import { creaCaso } from '../../src/logica/caso.ts';
import { valuta, variabiliIniziali } from '../../src/logica/condizioni.ts';
import * as M from '../../src/logica/missione.ts';
import { STRATEGIE } from '../../src/logica/bot.ts';
import { registra, valutaEpisodio, variabiliDiPartenza, superato } from '../../src/logica/episodi.ts';
import { migra, SAVE_VERSION } from '../../src/salvataggi/salvataggio.ts';
import { readFileSync } from 'node:fs';

const SEMI = Number(process.argv[2] ?? 2000);
const dati = leggiDati('data');
const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
const V0 = variabiliIniziali(dich.values());
const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, m]) => m).sort((a, b) => a.episodio - b.episodio);
const h = (t) => console.log(`\n## ${t}`);

// ---------- L1 campagna ----------
h('L1 campagna e01→e36 (chiudiEpisodio come src/resa/episodi.ts:31-41)');
function campagna(nome, seme, tentativiMax = 20) {
  let reg = {}; let vars = { ...V0 }; const righe = []; let tentTot = 0;
  for (const m of missioni) {
    if (!valuta(m.disponibile_se, vars)) return { blocco: `${m.id}: disponibile_se falsa`, righe };
    let ok = false;
    for (let k = 0; k < tentativiMax && !ok; k++) {
      const prima = variabiliDiPartenza(reg, m.id, vars);
      const g = STRATEGIE[nome](creaCaso(`${m.id}:${nome}:${seme}:${k}`), dich);
      let e;
      try { e = M.giocaMissione(m, prima, dich, g); } catch (x) { return { blocco: `${m.id}: ${x.message}`, righe }; }
      const r = valutaEpisodio(m, e); tentTot++;
      const { registro, migliore } = registra(reg, m.id, prima, r, e.variabili);
      reg = registro;
      const ultimo = !missioni.some((x) => x.episodio > m.episodio && superato(reg, x.id));
      if (migliore && ultimo) vars = e.variabili;
      ok = !r.fallita;
      righe.push({ id: m.id, k, esito: r.esito, stelle: r.stelle, fiduciaPrima: prima.credito, fiduciaDopo: e.variabili.credito, tmax: e.variabili.tensione_max });
    }
    if (!ok) return { blocco: `${m.id}: ${tentativiMax} tentativi tutti falliti`, righe, tentTot };
  }
  return { blocco: null, righe, tentTot };
}
for (const nome of ['attenta', 'equilibrata', 'peggiore']) {
  const c = campagna(nome, 1, 1);
  const st = c.righe.map((r) => r.stelle).join('');
  const fid = c.righe.map((r) => r.fiduciaDopo).join(',');
  console.log(`${nome}: ${c.blocco ? 'FERMA a ' + c.blocco : 'arriva a e36'} · episodi giocati ${c.righe.length} · stelle ${st} · fiducia dopo ogni episodio ${fid}`);
}
{
  const N = Math.min(SEMI, 300); let finite = 0; const blocchi = {}; const tent = []; const fidFine = []; const stelleTot = [];
  for (let s = 1; s <= N; s++) {
    const c = campagna('casuale', s, 50);
    if (!c.blocco) { finite++; tent.push(c.tentTot); fidFine.push(c.righe.at(-1).fiduciaDopo); stelleTot.push(c.righe.filter((r) => !r.k || r.stelle).reduce((a, r) => a + r.stelle, 0)); }
    else { const k = c.blocco.replace(/\d+ tentativi/, 'N tentativi'); blocchi[k] = (blocchi[k] ?? 0) + 1; }
  }
  const med = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
  console.log(`casuale (fino a 50 tentativi per episodio), ${N} campagne: finite ${finite}/${N}; blocchi ${JSON.stringify(blocchi)}`);
  if (tent.length) console.log(`  tentativi totali per finire 36 episodi: mediana ${med(tent)}, min ${Math.min(...tent)}, max ${Math.max(...tent)}; fiducia finale mediana ${med(fidFine)} (min ${Math.min(...fidFine)}, max ${Math.max(...fidFine)})`);
}

// ---------- L2 esiti e stelle per episodio ----------
h('L2 esiti/stelle raggiungibili per episodio; casuale × semi + 3 deterministiche, fiducia d\'ingresso 0, 5, 10');
const tabella = [];
for (const m of missioni) {
  const riga = { id: m.id };
  for (const f of [0, 5, 10]) {
    const v = { ...V0, credito: f }; const esiti = {}; const stelle = [0, 0, 0, 0]; let blocchi = 0;
    for (const [nome, st] of Object.entries(STRATEGIE)) {
      const n = nome === 'casuale' ? SEMI : 1;
      for (let s = 1; s <= n; s++) {
        try { const e = M.giocaMissione(m, v, dich, st(creaCaso(`${m.id}:${nome}:${s}:${f}`), dich)); esiti[e.esito.id] = (esiti[e.esito.id] ?? 0) + 1; stelle[valutaEpisodio(m, e).stelle]++; }
        catch { blocchi++; }
      }
    }
    const mai = m.esiti.map((e) => e.id).filter((id) => !esiti[id]);
    riga[`f${f}`] = { stelle, mai, blocchi };
  }
  tabella.push(riga);
}
console.log('episodio | fiducia 0: stelle0/1/2/3 | fiducia 5 | fiducia 10 | esiti mai visti | blocchi');
for (const r of tabella) console.log(`${r.id} | ${r.f0.stelle.join('/')} | ${r.f5.stelle.join('/')} | ${r.f10.stelle.join('/')} | ${[...new Set([...r.f0.mai, ...r.f5.mai, ...r.f10.mai])].join(',') || '—'} | ${r.f0.blocchi + r.f5.blocchi + r.f10.blocchi}`);
const no3 = tabella.filter((r) => !r.f5.stelle[3]).map((r) => r.id);
const no3f0 = tabella.filter((r) => !r.f0.stelle[3]).map((r) => r.id);
console.log(`3★ mai trovate con fiducia d'ingresso 5: ${no3.join(',') || 'nessuno'}`);
console.log(`3★ mai trovate con fiducia d'ingresso 0: ${no3f0.length}/36 (${no3f0.join(',')})`);
const peggioreOk = tabella.filter((r) => true);

// ---------- L2b peggiore e attenta: margine ----------
h('L2b strategia «peggiore» (ogni unità nel settore più calmo, risposte che alzano la tensione): esito per episodio, fiducia 5');
{
  const out = [];
  for (const m of missioni) {
    const e = M.giocaMissione(m, V0, dich, STRATEGIE.peggiore(creaCaso(1), dich));
    const a = M.giocaMissione(m, V0, dich, STRATEGIE.attenta(creaCaso(1), dich));
    out.push(`${m.id}:${e.esito.id === 'degenerato' ? 'P-fallisce' : 'P-' + e.esito.id}/A-${a.esito.id}(${valutaEpisodio(m, a).stelle}★,t${a.variabili.tensione_max})`);
  }
  console.log(out.join(' '));
  const passaPeggiore = out.filter((x) => !x.includes('P-fallisce'));
  console.log(`episodi superati anche dal giocatore peggiore: ${passaPeggiore.length}/36 ${passaPeggiore.map((x) => x.split(':')[0]).join(',')}`);
}

// ---------- L3 soft-lock ----------
h('L3 soft-lock: chiamata visibile con 0 opzioni valide; ondata senza unità schierabili');
const citate = (c, acc = new Set()) => { if (!c) return acc; if ('tutte' in c) c.tutte.forEach((x) => citate(x, acc)); else if ('almeno_una' in c) c.almeno_una.forEach((x) => citate(x, acc)); else if ('non' in c) citate(c.non, acc); else if ('var' in c) acc.add(c.var); return acc; };
const dominio = (id) => { const d = dich.get(id); if (d.tipo === 'bool') return [false, true]; if (d.tipo === 'enum') return d.valori; const xs = []; for (let i = d.min; i <= d.max; i++) xs.push(i); return xs; };
function* combinazioni(ids) { if (!ids.length) { yield {}; return; } const [a, ...r] = ids; for (const x of dominio(a)) for (const resto of combinazioni(r)) yield { [a]: x, ...resto }; }
let chiamate = 0, conSe = 0; const lock = [];
for (const m of missioni) for (const o of m.ondate) for (const c of o.chiamate ?? []) {
  chiamate++;
  const vars = new Set([...citate(c.se), ...c.opzioni.flatMap((x) => [...citate(x.se)])]);
  if (!c.opzioni.some((x) => x.se)) continue; conSe++;
  for (const comb of combinazioni([...vars])) {
    const v = { ...V0, ...comb };
    if (c.se && !valuta(c.se, v)) continue;
    if (!c.opzioni.some((x) => !x.se || valuta(x.se, v))) { lock.push(`${m.id}/${c.id} con ${JSON.stringify(comb)}`); break; }
  }
}
console.log(`chiamate ${chiamate}, con opzioni condizionate ${conSe}; soft-lock trovati: ${lock.length ? lock.join('; ') : 'nessuno'}`);
// ondata senza unità disponibili (tutto a riposo): si può solo confermare vuoto. Conto i casi nelle partite del casuale.
{
  let vuote = 0, tot = 0; const dove = new Set();
  for (const m of missioni) for (let s = 1; s <= 200; s++) {
    const g = STRATEGIE.casuale(creaCaso(`vuote:${m.id}:${s}`), dich); let st = M.iniziaMissione(m, V0, dich);
    while (!M.missioneFinita(m, st)) { tot++; if (Object.values(M.disponibili(m, st)).every((n) => n === 0)) { vuote++; dove.add(`${m.id}/o${st.ondata}`); }
      st = M.schiera(m, st, g.schiera(m, st)); for (let c = M.chiamateAperte(m, st)[0]; c; c = M.chiamateAperte(m, st)[0]) st = M.rispondi(m, st, c.id, g.scegli(m, st, c), dich); st = M.chiudiOndata(m, st, dich); }
  }
  console.log(`ondate con 0 unità schierabili (casuale, 200 semi × 36): ${vuote}/${tot} ${[...dove].slice(0, 12).join(',')}${dove.size > 12 ? '…' : ''}`);
}

// ---------- L4 salvataggio/ripresa a ogni passo, ripartenza PO-060 ----------
h('L4 salva → JSON → migra → riprendi a ogni passo; ripartenza dall\'ondata (PO-060)');
{
  let passi = 0, diversi = 0, errori = []; let rip = 0, ripDiv = 0;
  const salvataggio = (ic) => ({ save_version: SAVE_VERSION, game_version: '0.5.0', seme: 1, caso: 1, variabili: V0, missioni_concluse: [], episodi: {}, genere: 'm', in_corso: ic, rapporto_aperto: null });
  for (const m of missioni) for (const nome of ['attenta', 'casuale']) for (let seme = 1; seme <= (nome === 'casuale' ? 20 : 1); seme++) {
    const giocatore = () => STRATEGIE[nome](creaCaso(`${m.id}:${seme}`), dich);
    const intera = M.giocaMissione(m, V0, dich, giocatore());
    // a pezzi: dopo ogni passo il motore riparte dallo stato riletto dal disco
    const g = giocatore(); let s = M.iniziaMissione(m, V0, dich);
    const giro = (x) => { passi++; try { return migra(JSON.parse(JSON.stringify(salvataggio(x)))).in_corso; } catch (e) { errori.push(`${m.id}: ${e.message}`); return x; } };
    s = giro(s);
    while (!M.missioneFinita(m, s)) {
      s = giro(M.schiera(m, s, g.schiera(m, s)));
      for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) s = giro(M.rispondi(m, s, c.id, g.scegli(m, s, c), dich));
      s = giro(M.chiudiOndata(m, s, dich));
    }
    const pezzi = M.concludiMissione(m, s, dich);
    if (pezzi.esito.id !== intera.esito.id || JSON.stringify(pezzi.variabili) !== JSON.stringify(intera.variabili)) diversi++;
    // PO-060: da ogni ondata salvata, rigiocando le stesse scelte, si arriva allo stesso esito
    for (const n of Object.keys(s.partenze ?? {}).map(Number)) {
      const r = M.riprendiDallOndata(s, n); rip++;
      if (!r) { ripDiv++; continue; }
      const g2 = giocatore(); let t = M.iniziaMissione(m, V0, dich);
      // stesse scelte del bot deterministico/casuale: rigioco l'intera partita fino all'ondata n con g2, poi confronto lo stato
      while (t.ondata < n) { t = M.schiera(m, t, g2.schiera(m, t)); for (let c = M.chiamateAperte(m, t)[0]; c; c = M.chiamateAperte(m, t)[0]) t = M.rispondi(m, t, c.id, g2.scegli(m, t, c), dich); t = M.chiudiOndata(m, t, dich); }
      const { partenze: _a, ...ra } = r; const { partenze: _b, ...ta } = t;
      if (JSON.stringify(ra) !== JSON.stringify(ta)) ripDiv++;
    }
  }
  console.log(`passi salvati e riletti: ${passi}; partite a pezzi con esito/variabili diversi dalla partita intera: ${diversi}; errori di migra: ${errori.length} ${errori.slice(0, 3).join(' | ')}`);
  console.log(`ripartenze dall'ondata n confrontate: ${rip}; stati diversi da quelli della partita giocata fino a n: ${ripDiv}`);
  // ondataDaRiprendere sulle partite fallite del casuale
  let fallite = 0; const dist = {};
  for (const m of missioni) for (let seme = 1; seme <= 200; seme++) {
    const g = STRATEGIE.casuale(creaCaso(`r:${m.id}:${seme}`), dich); let s2 = M.iniziaMissione(m, V0, dich);
    while (!M.missioneFinita(m, s2)) { s2 = M.schiera(m, s2, g.schiera(m, s2)); for (let c = M.chiamateAperte(m, s2)[0]; c; c = M.chiamateAperte(m, s2)[0]) s2 = M.rispondi(m, s2, c.id, g.scegli(m, s2, c), dich); s2 = M.chiudiOndata(m, s2, dich); }
    const e = M.concludiMissione(m, s2, dich);
    if (!e.esito.fallita) continue; fallite++;
    const n = M.ondataDaRiprendere(e); dist[n] = (dist[n] ?? 0) + 1;
  }
  console.log(`ondataDaRiprendere sulle ${fallite} partite fallite del casuale (200 semi × 36): ${JSON.stringify(dist)}`);
}

// ---------- L5 salvataggi vecchi/corrotti/vuoti ----------
h('L5 salvataggi vecchi/corrotti/vuoti attraverso migra (src/salvataggi/salvataggio.ts:220)');
{
  const buono = { save_version: 2, game_version: '0.5.0', seme: 7, caso: 7, variabili: V0, missioni_concluse: [], episodi: {}, genere: 'f', in_corso: M.iniziaMissione(missioni[0], V0, dich), rapporto_aperto: null };
  const casi = {
    'vuoto {}': {}, 'null': null, 'array': [], 'save_version 3 (futuro)': { ...buono, save_version: 3 },
    'v1 reale (tests/salvataggi-reali/v1-dopo-ondata-1.json)': JSON.parse(readFileSync('tests/salvataggi-reali/v1-dopo-ondata-1.json', 'utf8')),
    'in_corso.missione inesistente «e99»': { ...buono, in_corso: { ...buono.in_corso, missione: 'e99' } },
    'in_corso.ondata 99': { ...buono, in_corso: { ...buono.in_corso, ondata: 99 } },
    'in_corso.disposizione con risorsa inesistente': { ...buono, in_corso: { ...buono.in_corso, disposizione: { carri: { piazzale: 3 } } } },
    'in_corso.tensione con valore stringa': { ...buono, in_corso: { ...buono.in_corso, tensione: { piazzale: 'alta' } } },
    'variabile credito = 99': { ...buono, variabili: { ...V0, credito: 99 } },
    'variabili senza «credito»': { ...buono, variabili: Object.fromEntries(Object.entries(V0).filter(([k]) => k !== 'credito')) },
    'episodi.e01 superato con stelle 3 ma tentativi 0': { ...buono, episodi: { e01: { migliore: { esito: 'contenuto', fallita: false, stelle: 3 }, tentativi: 0, variabili_prima: V0, variabili_dopo: V0 } } },
    'rapporto_aperto 5 senza in_corso': { ...buono, in_corso: null, rapporto_aperto: 5 },
  };
  for (const [nome, x] of Object.entries(casi)) {
    let r; try { const s = migra(x); r = `ACCETTATO (in_corso ${s.in_corso ? s.in_corso.missione + '/o' + s.in_corso.ondata : 'null'})`; } catch (e) { r = `rifiutato: ${e.message.slice(0, 110)}`; }
    console.log(`- ${nome} → ${r}`);
  }
}

// ---------- L6 variabili di stato.json ----------
h('L6 variabili dichiarate in data/stato.json: lette (condizioni) e scritte (effetti) da qualche episodio?');
{
  const lette = new Set(), scritte = new Set();
  const visita = (x) => { if (Array.isArray(x)) return x.forEach(visita); if (x && typeof x === 'object') { if (typeof x.var === 'string') lette.add(x.var); if (typeof x.imposta === 'string') scritte.add(x.imposta); if (typeof x.aggiungi === 'string') scritte.add(x.aggiungi); Object.values(x).forEach(visita); } };
  missioni.forEach(visita);
  for (const d of dich.values()) console.log(`- ${d.id}: lette ${lette.has(d.id) ? 'sì' : 'NO'}, scritte ${scritte.has(d.id) ? 'sì' : 'NO'}`);
  // salvataggio scritto dalla 0.4.0 (stato.json di origin/main, 5 variabili) caricato dalla 0.5.0
  const v040 = Object.fromEntries(Object.entries(V0).filter(([k]) => ['tensione_max', 'credito', 'informatore_pagato', 'presidente_incontrato', 'furgone_visto'].includes(k)));
  const s040 = { save_version: 2, game_version: '0.4.0', seme: 1, caso: 1, variabili: v040, missioni_concluse: [], episodi: {}, genere: 'm', in_corso: null, rapporto_aperto: null };
  const s = migra(s040); const mancano = [...dich.keys()].filter((k) => !(k in s.variabili));
  console.log(`salvataggio 0.4.0 caricato dalla 0.5.0: accettato; variabili mancanti dopo migra: ${mancano.join(',') || 'nessuna'}`);
  try { valuta({ var: 'testimone', uguale: 'protetto' }, s.variabili); console.log('valuta(testimone) su quel salvataggio: ok'); } catch (e) { console.log(`valuta({var:"testimone"}) su quel salvataggio: ECCEZIONE «${e.message}»`); }
}
