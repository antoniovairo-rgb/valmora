// Sonde C-02: motore a scene dopo le correzioni di C-01 (e46eba7). Solo lettura.
// Uso: SPENTI=C01A01,C01A04 node coordination/handoffs/collaudatrice/sonde/c02-motore.mjs [semi]
// SPENTI accende i bracci rossi (globalThis.__NO_<nome> = true) prima di caricare il motore.
for (const n of (process.env.SPENTI ?? '').split(',').filter(Boolean)) globalThis[`__NO_${n}`] = true;
console.log(`interruttori spenti: ${process.env.SPENTI || 'nessuno (braccio verde)'}`);
import { leggiDati } from '../../../../tools/dati-disco.mjs';
import { creaCaso } from '../../../../src/logica/caso.ts';
import { variabiliIniziali } from '../../../../src/logica/condizioni.ts';
import {
  chiamateAperte, chiudiOndata, concludiMissione, controllaDisposizione, disponibili, giocaMissione, iniziaMissione,
  missioneFinita, opzioniValide, rispondi, schiera,
} from '../../../../src/logica/missione.ts';
import { STRATEGIE } from '../../../../src/logica/bot.ts';

const N = Number(process.argv[2] ?? 1000);
const dich = new Map([
  ['tensione_max', { id: 'tensione_max', tipo: 'int', min: 0, max: 99, iniziale: 0, descrizione: 'x' }],
  ['b', { id: 'b', tipo: 'bool', iniziale: false, descrizione: 'x' }],
  ['k', { id: 'k', tipo: 'int', min: 0, max: 5, iniziale: 0, descrizione: 'x' }],
]);
const v0 = variabiliIniziali(dich.values());

// Missione sintetica: 3 ondate, chiamate con tutti i tipi di effetto, una chiamata condizionata.
const sintetica = () => ({
  id: 'sx', stagione: 1, episodio: 1, titolo: 't', disponibile_se: {}, briefing: [], fili: [],
  mappa: { settori: [{ id: 'strada', tipo: 'strada' }, { id: 'curva', tipo: 'curva' }, { id: 'piazzale', tipo: 'piazzale' }],
    risorse: { squadre: { quantita: 3, efficacia: { strada: 2, curva: 1, piazzale: 1 } },
      steward: { quantita: 2, efficacia: { strada: 1, curva: 2, piazzale: 1 } },
      mediatore: { quantita: 1, efficacia: {}, dimezza: ['corteo'] } } },
  ondate: [1, 2, 3].map((n) => ({ n,
    eventi: [{ id: `c${n}`, tipo: 'corteo', settore: 'strada', pressione: 3 + n }, { id: `k${n}`, tipo: 'cori', settore: 'curva', pressione: 2 + n },
      { id: `p${n}`, tipo: 'calca', settore: 'piazzale', pressione: n }],
    chiamate: [
      { id: `a${n}`, fonte: 'radio', testo: 't', opzioni: [
        { id: 'alza', testo: 't', effetti: [{ tensione: 'curva', valore: 3 }, { aggiungi: 'k', valore: 1 }] },
        { id: 'sposta', testo: 't', effetti: [{ pressione: 'piazzale', valore: 2 }, { pressione: 'strada', valore: -2 }] }] },
      { id: `r${n}`, fonte: 'tel', testo: 't', opzioni: [
        { id: 'rinforzi', testo: 't', effetti: [{ riserva: 'squadre', valore: 1 }] },
        { id: 'perdita', testo: 't', effetti: [{ riserva: 'steward', valore: -2 }, { imposta: 'b', valore: true }] },
        { id: 'solo_se_b', testo: 't', se: { var: 'b', uguale: true }, effetti: [{ tensione: 'strada', valore: -5 }] }] },
      { id: `q${n}`, fonte: 'rete', testo: 't', se: { var: 'k', almeno: 1 }, opzioni: [
        { id: 'x', testo: 't', effetti: [{ tensione: 'piazzale', valore: 4 }] }, { id: 'y', testo: 't', effetti: [] }] },
    ] })),
  esiti: [{ id: 'calmo', se: { var: 'tensione_max', al_massimo: 3 }, effetti: [], verbale: 't' },
    { id: 'fatica', se: { tutte: [{ var: 'tensione_max', al_massimo: 6 }, { var: 'b', uguale: false }] }, effetti: [], verbale: 't' },
    { id: 'male', se: {}, effetti: [], verbale: 't' }],
});

const righe = [];
const riga = (id, cosa, esito) => { righe.push({ id, cosa, esito }); console.log(`${id} · ${cosa} → ${esito}`); };
const prova = (f) => { try { return { ok: true, v: f() } } catch (e) { return { ok: false, e: `${e.constructor.name}: ${e.message}` }; } };
const json = (x) => JSON.parse(JSON.stringify(x));

// Giocatore casuale "da salvataggio": a ogni passo lo stato passa da JSON (stringify/parse).
function giocaPasso(m, seme, conJson) {
  const caso = creaCaso(seme); const g = STRATEGIE.casuale(caso, dich);
  let s = iniziaMissione(m, v0, dich); const J = conJson ? json : (x) => x; s = J(s);
  while (!missioneFinita(m, s)) {
    s = J(schiera(m, s, g.schiera(m, s)));
    for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = J(rispondi(m, s, c.id, g.scegli(m, s, c), dich));
    s = J(chiudiOndata(m, s, dich));
  }
  return concludiMissione(m, s, dich);
}

const missioni = { sintetica: sintetica(), ...Object.fromEntries(Object.entries(leggiDati()).filter(([k]) => k.startsWith('missioni/')).map(([k, m]) => [k, m])) };
const dichDati = new Map(leggiDati()['stato.json'].variabili.map((d) => [d.id, d]));

// A1 · soft-lock/eccezioni: 3 strategie × N semi su ogni missione; controlli invarianti a ogni passo.
for (const [nome, m] of Object.entries(missioni)) {
  const D = nome === 'sintetica' ? dich : dichDati; const V = variabiliIniziali(D.values());
  for (const [st, f] of Object.entries(STRATEGIE)) {
    let blocchi = 0, violazioni = 0; const esiti = {}; const primi = [];
    for (let seme = 1; seme <= N; seme++) {
      const r = prova(() => {
        const g = f(creaCaso(`c02:${nome}:${st}:${seme}`), D); let s = iniziaMissione(m, V, D);
        while (!missioneFinita(m, s)) {
          const disp = disponibili(m, s);
          if (Object.values(disp).some((x) => x < 0)) { violazioni++; primi.push(`seme ${seme}: disponibili<0`); }
          s = schiera(m, s, g.schiera(m, s));
          for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = rispondi(m, s, c.id, g.scegli(m, s, c), D);
          const t = s; s = chiudiOndata(m, s, D);
          // D-056: a riposo = unità schierate in settori con scoperto > 0
          const rap = s.rapporti.at(-1); const atteso = {};
          for (const [ris, ps] of Object.entries(t.disposizione)) for (const [sett, n] of Object.entries(ps)) if (n > 0 && rap.scoperto[sett] > 0) atteso[ris] = (atteso[ris] ?? 0) + n;
          if (JSON.stringify(Object.entries(atteso).sort()) !== JSON.stringify(Object.entries(s.riposo).sort())) { violazioni++; primi.push(`seme ${seme}: riposo ${JSON.stringify(s.riposo)} atteso ${JSON.stringify(atteso)}`); }
          // regola della tensione: coperto → floor(prima/2); scoperto → prima+sc; limite 10
          for (const sett of m.mappa.settori.map((x) => x.id)) {
            const prima = t.tensione[sett] ?? 0, sc = rap.scoperto[sett];
            const tipo = m.mappa.settori.find((x) => x.id === sett).tipo;
            const cop = Object.entries(t.disposizione).reduce((a, [ris, ps]) => a + (ps[sett] ?? 0) * (m.mappa.risorse[ris].efficacia[tipo] ?? 0), 0);
            const presidiato = cop > 0 || !!globalThis.__NO_C01O01;
            const att = Math.min(10, sc > 0 ? prima + sc : presidiato ? Math.floor(prima / 2) : prima);
            if (s.tensione[sett] !== att || s.tensione[sett] < 0 || s.tensione[sett] > 10) { violazioni++; primi.push(`seme ${seme}: ${sett} ${s.tensione[sett]} atteso ${att}`); }
          }
        }
        return concludiMissione(m, s, D);
      });
      if (!r.ok) { blocchi++; primi.push(`seme ${seme}: ${r.e}`); } else esiti[r.v.esito.id] = (esiti[r.v.esito.id] ?? 0) + 1;
    }
    riga('A1', `${nome} · ${st} · ${N} semi`, `blocchi ${blocchi}, violazioni ${violazioni}, esiti ${JSON.stringify(esiti)}${primi.length ? ' · primi: ' + primi.slice(0, 3).join(' | ') : ''}`);
  }
}

// A2 · determinismo: stesso seme due volte, e con passaggio da JSON a ogni passo.
{
  const m = sintetica(); let diversi = 0;
  for (let seme = 1; seme <= N; seme++) {
    const a = JSON.stringify(giocaPasso(m, seme, false)), b = JSON.stringify(giocaPasso(m, seme, false)), c = JSON.stringify(giocaPasso(m, seme, true));
    if (a !== b || a !== c) diversi++;
  }
  riga('A2', `determinismo sintetica, ${N} semi × (2 giri + giro con JSON a ogni passo)`, `risultati diversi: ${diversi}`);
}

// A3 · ordine dei passi.
{
  const m = sintetica(); const s0 = iniziaMissione(m, v0, dich);
  riga('A3a', 'rispondere senza schierare', JSON.stringify(prova(() => rispondi(m, s0, 'a1', 'alza', dich))));
  const s1 = schiera(m, s0, { squadre: { strada: 3 }, steward: {}, mediatore: {} });
  riga('A3b', 'chiudere con chiamate aperte', JSON.stringify(prova(() => chiudiOndata(m, s1, dich))));
  const s2 = rispondi(m, s1, 'a1', 'alza', dich);
  riga('A3c', 'rispondere due volte alla stessa chiamata', JSON.stringify(prova(() => rispondi(m, s2, 'a1', 'sposta', dich))));
  riga('A3d', 'rispondere a chiamata di un\'altra ondata (a2)', JSON.stringify(prova(() => rispondi(m, s2, 'a2', 'alza', dich))));
  riga('A3e', 'opzione condizionata non valida (solo_se_b con b=false)', JSON.stringify(prova(() => rispondi(m, s2, 'r1', 'solo_se_b', dich))));
  // ri-schierare dopo aver risposto
  const s3 = prova(() => schiera(m, s2, { squadre: { curva: 3 }, steward: { curva: 2 }, mediatore: { strada: 1 } }));
  riga('A3f', 'ri-schierare nella stessa ondata dopo aver risposto a una chiamata', s3.ok ? `ACCETTATO: disposizione nuova ${JSON.stringify(s3.v.disposizione)}, risposte conservate ${JSON.stringify(s3.v.risposte)}` : s3.e);
  // rinforzi a metà ondata → ri-schierare con più unità nell'ondata in corso
  const s4 = rispondi(m, s2, 'r1', 'rinforzi', dich);
  const s5 = prova(() => schiera(m, s4, { squadre: { strada: 4 }, steward: { curva: 2 }, mediatore: { strada: 1 } }));
  riga('A3g', 'rinforzo (riserva +1) ricevuto da una chiamata usato nella stessa ondata ri-schierando', s5.ok ? `ACCETTATO: 4 squadre schierate su quantita 3 nell'ondata 1; disponibili ora ${JSON.stringify(disponibili(m, s4))}` : s5.e);
  // perdita a metà ondata: la disposizione già fatta resta valida?
  let t = schiera(m, s0, { squadre: { strada: 3 }, steward: { curva: 2 }, mediatore: { strada: 1 } });
  t = rispondi(m, t, 'a1', 'alza', dich); t = rispondi(m, t, 'r1', 'perdita', dich);
  if (chiamateAperte(m, t).length) t = rispondi(m, t, 'q1', 'y', dich);
  const err = controllaDisposizione(m, t, t.disposizione);
  const ch = chiudiOndata(m, t, dich);
  riga('A3h', 'perdita (riserva steward −2) dopo lo schieramento: le 2 steward già schierate coprono ancora?', `controllaDisposizione ora dice ${JSON.stringify(err)}; chiudiOndata accetta: scoperto curva=${ch.rapporti[0].scoperto.curva} (cori 3, 2 steward×2=4 → coperto)`);
  // chiudere a missione finita
  let f = iniziaMissione(m, v0, dich);
  const g = STRATEGIE.casuale(creaCaso(1), dich);
  while (!missioneFinita(m, f)) { f = schiera(m, f, g.schiera(m, f)); for (let c = chiamateAperte(m, f)[0]; c; c = chiamateAperte(m, f)[0]) f = rispondi(m, f, c.id, g.scegli(m, f, c), dich); f = chiudiOndata(m, f, dich); }
  riga('A3i', 'schiera / chiudiOndata / concludi prima del tempo', JSON.stringify([prova(() => schiera(m, f, {})).e ?? 'ok', prova(() => chiudiOndata(m, f, dich)).e ?? 'ok', prova(() => concludiMissione(m, s0, dich)).e ?? 'ok']));
}

// A4 · riserva negativa e disponibili.
{
  const m = sintetica(); let s = iniziaMissione(m, v0, dich);
  const g = { schiera: () => ({ squadre: {}, steward: {}, mediatore: {} }), scegli: (_m, st, c) => (opzioniValide(c, st).find((o) => o.id === 'perdita') ?? opzioniValide(c, st).at(-1)).id };
  const traccia = [];
  while (!missioneFinita(m, s)) { s = schiera(m, s, g.schiera()); for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = rispondi(m, s, c.id, g.scegli(m, s, c), dich); traccia.push(`dopo ondata ${s.ondata - 1}: riserva steward ${s.riserva.steward}, disponibili ${disponibili(m, s).steward}`); s = chiudiOndata(m, s, dich); }
  riga('A4', 'tre «perdita» (steward −2 ciascuna, quantita 2)', traccia.join('; '));
}

// A5 · input non validi a schiera.
{
  const m = sintetica(); const s0 = iniziaMissione(m, v0, dich);
  const casi = {
    'unità negative': { squadre: { strada: -1 } }, 'non intero': { squadre: { strada: 1.5 } }, 'stringa': { squadre: { strada: '1' } },
    'NaN': { squadre: { strada: NaN } }, 'troppe': { squadre: { strada: 4 } }, 'settore ignoto': { squadre: { tribuna: 1 } },
    'risorsa ignota': { blindati: { strada: 1 } }, 'risorsa «constructor»': { constructor: { strada: 1 } },
    'risorsa «toString»': { toString: { strada: 1 } }, 'per-settore numero': { squadre: 5 }, 'per-settore null': { squadre: null },
    'disposizione null': null, 'settore «__proto__» (da JSON)': JSON.parse('{"squadre":{"__proto__":1}}'),
  };
  for (const [nome, d] of Object.entries(casi)) {
    const r = prova(() => schiera(m, s0, d));
    let poi = '';
    if (r.ok) { let t = r.v; for (let c = chiamateAperte(m, t)[0]; c; c = chiamateAperte(m, t)[0]) t = rispondi(m, t, c.id, opzioniValide(c, t)[0].id, dich); const z = prova(() => chiudiOndata(m, t, dich)); poi = z.ok ? ` → chiudiOndata ok (scoperto ${JSON.stringify(z.v.rapporti[0].scoperto)})` : ` → chiudiOndata: ${z.e}`; }
    riga('A5', `schiera «${nome}»`, r.ok ? `ACCETTATO${poi}` : `rifiutato: ${r.e}`);
  }
  riga('A5', 'rispondi con chiamata inesistente / opzione inesistente',
    JSON.stringify([prova(() => rispondi(m, schiera(m, s0, {}), 'zzz', 'alza', dich)).e, prova(() => rispondi(m, schiera(m, s0, {}), 'a1', 'zzz', dich)).e]));
}

// A6 · effetti applicati: per ogni opzione della sintetica, confronto dello stato prima/dopo.
{
  const m = sintetica(); let s = schiera(m, iniziaMissione(m, v0, dich), {});
  const a = rispondi(m, s, 'a1', 'alza', dich), b = rispondi(m, s, 'a1', 'sposta', dich);
  const c = rispondi(m, s, 'r1', 'rinforzi', dich), d = rispondi(m, s, 'r1', 'perdita', dich);
  const e = rispondi(m, d, 'r1' === 'r1' ? 'a1' : '', 'alza', dich);
  riga('A6', 'effetti: tensione/aggiungi, pressione±, riserva±, imposta; chiamata condizionata si apre',
    JSON.stringify({ alza: [a.tensione.curva, a.variabili.k], sposta: b.modifiche, rinforzi: c.riserva.squadre, perdita: [d.riserva.steward, d.variabili.b],
      q1_aperta_dopo_k1: chiamateAperte(m, e).map((x) => x.id) }));
  // tensione effetto oltre i limiti
  let t = s; for (let i = 0; i < 1; i++) t = rispondi(m, t, 'a1', 'alza', dich);
  const neg = rispondi(m, rispondi(m, schiera(m, iniziaMissione(m, v0, dich), {}), 'r1', 'perdita', dich), 'a1', 'alza', dich);
  riga('A6', 'tensione effetto negativo sotto 0 (solo_se_b: strada −5 da 0)', String(prova(() => rispondi(m, { ...neg, risposte: { a1: 'alza' } }, 'r1', 'solo_se_b', dich)).e ?? 'ok'));
}

// A7 · esito: dipende da tensione_max e scelte (sintetica, stessa disposizione, risposte diverse).
{
  const m = sintetica(); const freq = {};
  const disp = { squadre: { strada: 2, curva: 1 }, steward: { curva: 1, piazzale: 1 }, mediatore: { strada: 1 } };
  for (let seme = 1; seme <= N; seme++) {
    const caso = creaCaso(`a7:${seme}`);
    const r = prova(() => giocaMissione(m, v0, dich, { schiera: (mm, s) => { const dd = structuredClone(disp); const dsp = disponibili(mm, s); for (const [r, ps] of Object.entries(dd)) { let tot = 0; for (const k of Object.keys(ps)) { ps[k] = Math.min(ps[k], dsp[r] - tot); tot += ps[k]; } } return dd; }, scegli: (_m, s, c) => caso.scegli(opzioniValide(c, s)).id }));
    const k = r.ok ? `${r.v.esito.id}` : `ERR ${r.e}`; freq[k] = (freq[k] ?? 0) + 1;
  }
  riga('A7', `sintetica: schieramento fisso, risposte a caso, ${N} semi`, JSON.stringify(freq));
}

// C02 · O01: settore vuoto e calmo con tensione ereditata (sintetica a 1 settore vuoto).
{
  const m = { id: 'o', mappa: { settori: [{ id: 'a', tipo: 'a' }, { id: 'b', tipo: 'b' }], risorse: { s: { quantita: 1, efficacia: { a: 1, b: 1 } }, med: { quantita: 1, efficacia: {} } } },
    ondate: [{ n: 1, eventi: [{ id: 'e', tipo: 'x', settore: 'a', pressione: 7 }] }, { n: 2, eventi: [] }, { n: 3, eventi: [] }], esiti: [{ id: 'z', se: {}, effetti: [] }] };
  let s = M_inizia(m);
  s = chiudiOndata(m, schiera(m, s, { s: { b: 1 } }), dich);                 // a: 7 scoperto → 7
  const vuoto = chiudiOndata(m, schiera(m, s, { s: { b: 1 } }), dich).tensione.a;      // a vuoto
  const soloMed = chiudiOndata(m, schiera(m, s, { med: { a: 1 } }), dich).tensione.a; // a con un'unità di efficacia 0
  const presidiato = chiudiOndata(m, schiera(m, s, { s: { a: 1 } }), dich).tensione.a; // a presidiato
  riga('C02-O01', 'tensione 7 ereditata in «a»: vuoto / solo mediatore (efficacia 0) / presidiato', `${vuoto} / ${soloMed} / ${presidiato}`);
}
function M_inizia(m) { return iniziaMissione(m, { tensione_max: 0 }, dich); }
