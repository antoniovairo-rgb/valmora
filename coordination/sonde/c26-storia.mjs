// C-026 (sola lettura): credibilità della storia coi 16 club della 0.20.0 (PO-109, D-125).
// Per episodio: club nei dati (campo `club` di settori ed eventi), fonti di club, club nominati nei testi (prefissi e
// suffissi), confronto con la mappa approvata (docs/proposte/13-club.md §4.1), fonti di club che non tornano col testo,
// nomi vecchi in ogni capitalizzazione, articoli davanti ai 16 nomi, lunghezze coi limiti dei guardiani.
// Uso: node coordination/sonde/c26-storia.mjs [uscita.json]
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const VECCHI = ['cinderwick', 'larkspire', 'calderholt', 'mossgarth', 'ollerbrook', 'quillhaven', 'saltmere'];
// prefisso -> id, articolo singolare/plurale atteso, suffisso
const C = {
  Kiln: ['cinderwick_united', 'il', 'i', 'United'], Skyfield: ['larkspire_athletic', 'lo', 'gli', 'Athletic'],
  Square: ['calderholt_rovers', 'lo', 'gli', 'Rovers'], Arches: ['mossgarth_town', "l'", 'gli', 'Town'],
  Studio: ['ollerbrook_town', 'lo', 'gli', 'Town'], Garden: ['quillhaven_albion', 'il', 'i', 'Albion'],
  Stoneway: ['saltmere_wanderers', 'lo', 'gli', 'Wanderers'], Pinegrove: ['pinegrove_rangers', 'il', 'i', 'Rangers'],
  Belltower: ['belltower_harriers', 'il', 'i', 'Harriers'], Waterline: ['waterline_city', 'il', 'i', 'City'],
  Lookout: ['lookout_fc', 'il', 'i', 'FC'], Domepark: ['domepark_villa', 'il', 'i', 'Villa'],
  Tramway: ['tramway_borough', 'il', 'i', 'Borough'], Railhead: ['railhead_county', 'il', 'i', 'County'],
  Southwind: ['southwind_town', 'il', 'i', 'Town'], Wallgate: ['wallgate_rovers', 'il', 'i', 'Rovers'],
};
const idPref = Object.fromEntries(Object.entries(C).map(([p, v]) => [v[0], p]));
const ESTERNI = ['Railhead', 'Southwind', 'Wallgate'];
// mappa approvata (13-club.md §4.1 e tabella 1.1 per gli episodi invariati): club attesi per episodio
const ATTESI = {
  e01: 'Kiln Skyfield', e02: 'Skyfield Railhead', e03: 'Skyfield Garden', e04: 'Kiln Square', e05: 'Skyfield Domepark',
  e06: 'Kiln Garden Skyfield', e07: 'Skyfield Southwind', e08: 'Kiln Square Skyfield', e09: 'Skyfield Belltower', e10: 'Skyfield Kiln',
  e11: 'Kiln Skyfield Wallgate', e12: 'Kiln Southwind Skyfield', e13: 'Kiln Tramway', e14: 'Skyfield Waterline',
  e15: 'Kiln Wallgate Railhead', e16: 'Kiln Pinegrove', e17: 'Kiln Tramway Skyfield', e18: 'Skyfield Lookout', e19: 'Kiln Studio',
  e20: 'Kiln Skyfield', e21: 'Kiln Pinegrove Southwind', e22: 'Kiln Skyfield', e23: 'Kiln Southwind', e24: 'Skyfield Stoneway',
  e25: 'Kiln Belltower', e26: 'Skyfield Domepark', e27: 'Kiln Waterline Railhead', e28: 'Kiln Arches', e29: 'Kiln Stoneway',
  e30: 'Kiln Studio Skyfield', e31: 'Skyfield Railhead', e32: 'Kiln Skyfield', e33: 'Skyfield Arches Kiln', e34: 'Kiln Lookout',
  e35: '', e36: 'Kiln Skyfield',
};
const FAM = {
  il: ['il', 'del', 'al', 'dal', 'nel', 'sul', 'col'], lo: ['lo', 'dello', 'allo', 'dallo', 'nello', 'sullo'],
  "l'": ["l'", "dell'", "all'", "dall'", "nell'", "sull'"], i: ['i', 'dei', 'ai', 'dai', 'nei', 'sui', 'coi'],
  gli: ['gli', 'degli', 'agli', 'dagli', 'negli', 'sugli'],
};
const famDi = (p) => Object.entries(FAM).find(([, v]) => v.includes(p.toLowerCase()))?.[0];
const PREF = Object.keys(C);
const SUFF = [...new Set(Object.values(C).map((v) => v[3]))];
const RE = new RegExp(`(?:^|[^\\p{L}'’])((?:${Object.values(FAM).flat().map((x) => x.replace("'", "['’]")).join('|')})\\s*)?(${PREF.join('|')})(?:\\s+(${SUFF.join('|')}))?(?![\\p{L}])`, 'gu');

const dir = 'data/testi/it';
const testi = {}; // chiave -> {f, v}
for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) for (const [k, v] of Object.entries(JSON.parse(readFileSync(join(dir, f), 'utf8')))) testi[k] = { f, v: String(v) };
const T = (ref) => testi[String(ref).replace(/^testi:/, '')]?.v;

// 1. nomi vecchi in ogni capitalizzazione: nei valori dei testi, nelle chiavi mostrate no (sono id)
const residui = [];
for (const [k, { f, v }] of Object.entries(testi)) for (const n of VECCHI) if (v.toLowerCase().includes(n)) residui.push({ f, k, n, v });

// 2. articoli
const occorrenze = [], sospetti = [];
for (const [k, { v }] of Object.entries(testi)) for (const m of v.matchAll(RE)) {
  const art = (m[1] ?? '').trim().replace('’', "'"), nome = m[2], suff = m[3] ?? '';
  const fam = art ? famDi(art) : '';
  const o = { k, art, nome, suff, frase: v.slice(Math.max(0, m.index - 30), m.index + m[0].length + 30) };
  occorrenze.push(o);
  if (fam && fam !== C[nome][1] && fam !== C[nome][2]) sospetti.push({ ...o, atteso: `${C[nome][1]}/${C[nome][2]}` });
  if (suff && suff !== C[nome][3]) sospetti.push({ ...o, atteso: `suffisso ${C[nome][3]}` });
}

// 3. per episodio
const episodi = readdirSync('data/missioni').filter((x) => /^e\d\d\.json$/.test(x)).sort().map((f) => JSON.parse(readFileSync(join('data/missioni', f), 'utf8')));
const per = [];
const clubDati = (o, out = [], via = '') => {
  if (Array.isArray(o)) o.forEach((x, i) => clubDati(x, out, `${via}[${i}]`));
  else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { if (k === 'club' && typeof v === 'string') out.push({ club: v, via, id: o.id ?? o.tipo }); else clubDati(v, out, `${via}.${k}`); }
  return out;
};
const nominati = (s) => { const r = new Set(); for (const m of s.matchAll(RE)) r.add(m[2]); return r; };
const fontiStorte = [];
for (const m of episodi) {
  const chiavi = Object.keys(testi).filter((k) => k.startsWith(`${m.id}.`));
  const nom = {}; for (const k of chiavi) for (const p of nominati(testi[k].v)) (nom[p] ??= []).push(k);
  const suffissi = {}; for (const k of chiavi) for (const s of SUFF) if (new RegExp(`\\b${s}\\b`).test(testi[k].v)) (suffissi[s] ??= []).push(k);
  const dati = clubDati(m).map((d) => ({ ...d, pref: idPref[d.club] ?? `?${d.club}` }));
  const prefDati = new Set(dati.map((d) => d.pref));
  const attesi = new Set(ATTESI[m.id].split(' ').filter(Boolean));
  // fonti: testo con fonte di club
  const voci = [...m.briefing.map((b) => ({ ...b, dove: 'briefing' })), ...m.ondate.flatMap((o) => (o.chiamate ?? []).map((c) => ({ ...c, dove: `ondata${o.n}` })))];
  for (const x of voci) {
    const f = String(x.fonte ?? '');
    const fm = f.match(/^club_(\w+)$/);
    const nomeFonte = testi[`fonte.${f}`]?.v ?? '';
    const prefFonte = PREF.find((p) => nomeFonte.includes(p));
    const t = T(x.testo) ?? '';
    const nt = [...nominati(t)];
    if (fm || /ufficio_sicurezza|gemellati|ufficio_porto/.test(f)) {
      const altri = nt.filter((p) => p !== prefFonte && p !== 'Kiln' && p !== 'Skyfield');
      if (prefFonte && !attesi.has(prefFonte)) fontiStorte.push({ ep: m.id, k: x.testo, fonte: f, nomeFonte, motivo: 'club della fonte fuori dagli attesi', t });
      if (altri.length) fontiStorte.push({ ep: m.id, k: x.testo, fonte: f, nomeFonte, motivo: `testo nomina ${altri.join(',')}`, t });
      if (/^(In rete|Comando|Centrale radio|Ferrovie)/.test(t)) fontiStorte.push({ ep: m.id, k: x.testo, fonte: f, nomeFonte, motivo: 'il testo si presenta come altra fonte', t });
    }
  }
  const inTesto = new Set(Object.keys(nom));
  per.push({
    ep: m.id, stagione: m.stagione, attesi: [...attesi], dati: dati.map((d) => `${d.pref}${d.via.includes('eventi') ? '(ev)' : ''}`),
    nominati: Object.fromEntries(Object.entries(nom).map(([p, ks]) => [p, ks.length])), suffissi: Object.fromEntries(Object.entries(suffissi).map(([s, ks]) => [s, ks])),
    fuoriPiano: [...new Set([...inTesto, ...prefDati])].filter((p) => !attesi.has(p)).map((p) => ({ p, chiavi: nom[p] ?? [], dati: prefDati.has(p) })),
    mancanti: [...attesi].filter((p) => !inTesto.has(p) && !prefDati.has(p)),
    soloTesto: [...attesi].filter((p) => inTesto.has(p) && !prefDati.has(p)),
    intro: (m.introduzione ?? []).map(T),
  });
}

// 4. 13 club di Valmora: in quanti episodi compaiono (testo o dati), per stagione; presentazione
const presenze = {};
for (const e of per) for (const p of new Set([...Object.keys(e.nominati), ...e.dati.map((d) => d.replace('(ev)', ''))])) (presenze[p] ??= []).push(e.ep);

// 5. lunghezze (tests/brevita.test.ts, tests/ondata-info.test.ts)
const LIM = { fonte: 80, chiamata: 100, i: 90 };
const s1 = (id) => Number(id.slice(1)) <= 12;
const lunghe = [], vicine = [];
for (const m of episodi) {
  const val = (ref) => [ref, `${ref}@f`].map((r) => [r, T(r)]).filter(([, v]) => v);
  const pz = [];
  for (const b of m.briefing) for (const [k, x] of val(b.testo)) pz.push({ tipo: 'fonte', k, x });
  for (const o of m.ondate) for (const c of o.chiamate ?? []) for (const [k, x] of val(c.testo)) pz.push({ tipo: 'chiamata', k, x });
  for (const o of m.ondate) { const k = `${(o.titolo ?? `testi:${m.id}.ondata${o.n}`)}.i`; const x = T(k); if (x) pz.push({ tipo: 'i', k, x }); }
  for (const p of pz) if (p.tipo === 'i' || s1(m.id)) {
    if (p.x.length > LIM[p.tipo]) lunghe.push({ ep: m.id, ...p, n: p.x.length });
    else if (LIM[p.tipo] - p.x.length <= 3 && nominati(p.x).size) vicine.push({ ep: m.id, tipo: p.tipo, k: p.k, n: p.x.length, lim: LIM[p.tipo] });
  }
}

// 6. simboli degli stemmi presenti nel disegno
const stemmaSrc = readFileSync('src/resa/stemma.tsx', 'utf8');
const stemmi = readdirSync('data/club').map((f) => JSON.parse(readFileSync(join('data/club', f), 'utf8'))).map((c) => ({ id: c.id, nome: T(c.nome), forma: c.stemma?.forma, simbolo: c.stemma?.simbolo, disegnato: c.stemma?.simbolo ? new RegExp(`\\b${c.stemma.simbolo}\\s*:`).test(stemmaSrc) : false, colori: c.colori }));

const r = { residui, occorrenze: occorrenze.length, sospetti, per, presenze, fontiStorte, lunghe, vicine, stemmi };
console.log(`testi ${Object.keys(testi).length}; nomi vecchi (ogni maiuscola) ${residui.length}; occorrenze dei 16 nomi ${occorrenze.length}; articoli/suffissi sospetti ${sospetti.length}; fonti di club che non tornano ${fontiStorte.length}; oltre i limiti ${lunghe.length}; vicini al limite col nome ${vicine.length}`);
for (const s of residui) console.log(`RESIDUO ${s.f}:${s.k} (${s.n}): ${s.v}`);
for (const s of sospetti) console.log(`SOSPETTO ${s.k}: «${s.art} ${s.nome} ${s.suff}» atteso ${s.atteso} … ${s.frase}`);
for (const e of per) {
  const fp = e.fuoriPiano.map((x) => `${x.p}${x.dati ? '[dati]' : ''}(${x.chiavi.join(',')})`).join(' ');
  console.log(`${e.ep} s${e.stagione} attesi=${e.attesi.join('+') || '-'} dati=${e.dati.join(',') || '-'} testo=${JSON.stringify(e.nominati)}${fp ? ` FUORI_PIANO=${fp}` : ''}${e.mancanti.length ? ` MANCANTI=${e.mancanti}` : ''}${e.soloTesto.length ? ` soloTesto=${e.soloTesto}` : ''}`);
}
console.log('PRESENZE'); for (const p of PREF) console.log(`  ${p}${ESTERNI.includes(p) ? ' (esterno)' : ''}: ${(presenze[p] ?? []).length} ${(presenze[p] ?? []).join(' ')}`);
for (const f of fontiStorte) console.log(`FONTE ${f.ep} ${f.k} ${f.fonte} «${f.nomeFonte}»: ${f.motivo} :: ${f.t}`);
for (const l of lunghe) console.log(`LUNGO ${l.ep} ${l.tipo} ${l.k} ${l.n}`);
for (const l of vicine) console.log(`VICINO ${l.ep} ${l.tipo} ${l.k} ${l.n}/${l.lim}`);
for (const s of stemmi) console.log(`STEMMA ${s.id} ${s.nome} ${s.forma}/${s.simbolo} disegnato=${s.disegnato}`);
if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(r, null, 1));
