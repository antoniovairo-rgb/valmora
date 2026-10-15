// C-025 (sola lettura): testi mostrati dopo PO-108 / D-124. Cerca nei VALORI di data/testi/it/*.json e nei letterali
// di src/resa: residui dei nomi vecchi, articoli e preposizioni davanti ai nomi nuovi, lunghezze oltre i limiti dei
// guardiani (fonti s1 ≤ 80, chiamate s1 ≤ 100, righe «i» ≤ 90). Uso: node coordination/sonde/c25-testi.mjs [uscita.json]
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const VECCHI = ['Cinderwick', 'Larkspire', 'Calderholt', 'Mossgarth', 'Ollerbrook', 'Quillhaven', 'Saltmere'];
// prefisso nuovo -> forma corretta dell'articolo determinativo singolare (lo/il/l') e plurale (gli/i)
const NUOVI = {
  Kiln: { sing: 'il', plur: 'i' }, Skyfield: { sing: 'lo', plur: 'gli' }, Square: { sing: 'lo', plur: 'gli' },
  Arches: { sing: "l'", plur: 'gli' }, Studio: { sing: 'lo', plur: 'gli' }, Garden: { sing: 'il', plur: 'i' },
  Stoneway: { sing: 'lo', plur: 'gli' },
};
// famiglie: forma «il» / «lo» / «l'» / «i» / «gli» di ogni preposizione articolata
const FAM = {
  il: ['il', 'del', 'al', 'dal', 'nel', 'sul', 'col'], lo: ['lo', 'dello', 'allo', 'dallo', 'nello', 'sullo'],
  "l'": ["l'", "dell'", "all'", "dall'", "nell'", "sull'"], i: ['i', 'dei', 'ai', 'dai', 'nei', 'sui', 'coi'],
  gli: ['gli', 'degli', 'agli', 'dagli', 'negli', 'sugli'], un: ['un'], uno: ['uno'],
};
const famDi = (p) => Object.entries(FAM).find(([, v]) => v.includes(p.toLowerCase()))?.[0];
// accetta l'apostrofo dritto e quello tipografico
const RE = new RegExp(`(?:^|[^\\p{L}'’])((?:${Object.values(FAM).flat().map((x) => x.replace("'", "['’]")).join('|')})\\s*)?(${Object.keys(NUOVI).join('|')})(?:\\s+(United|Athletic|Rovers|Town|Albion|Wanderers))?\\b`, 'giu');

const dir = 'data/testi/it';
const testi = {};
for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) for (const [k, v] of Object.entries(JSON.parse(readFileSync(join(dir, f), 'utf8')))) testi[`${f}:${k}`] = String(v);

const residui = [], occorrenze = [], sospetti = [];
for (const [k, v] of Object.entries(testi)) {
  for (const n of VECCHI) if (new RegExp(n, 'i').test(v)) residui.push({ k, n, v });
  for (const m of v.matchAll(RE)) {
    const art = (m[1] ?? '').trim().replace('’', "'"), nome = m[2], suff = m[3] ?? '';
    // «Studio» e «Square» minuscoli o a inizio frase possono essere parole comuni: tengo solo la maiuscola
    if (nome[0] !== nome[0].toUpperCase()) continue;
    const fam = art ? famDi(art) : '';
    const o = { k, art, nome, suff, fam, frase: v.slice(Math.max(0, m.index - 30), m.index + m[0].length + 30) };
    occorrenze.push(o);
    const giusto = NUOVI[nome];
    if (fam && !['un', 'uno'].includes(fam) && fam !== giusto.sing && fam !== giusto.plur) sospetti.push({ ...o, atteso: `${giusto.sing}/${giusto.plur}` });
    if (fam === 'un' && giusto.sing !== 'il') sospetti.push({ ...o, atteso: 'uno' });
    if (fam === 'uno' && giusto.sing === 'il') sospetti.push({ ...o, atteso: 'un' });
  }
}

// lunghezze, con le stesse regole dei guardiani (tests/brevita.test.ts:8-19, tests/ondata-info.test.ts:10-22)
const lunghi = [];
const s1 = Array.from({ length: 12 }, (_, i) => `e${String(i + 1).padStart(2, '0')}`);
const pieni = [];
for (const f of readdirSync('data/missioni').filter((x) => x.endsWith('.json'))) {
  const m = JSON.parse(readFileSync(join('data/missioni', f), 'utf8'));
  const t = JSON.parse(readFileSync(join(dir, `${m.id}.json`), 'utf8'));
  const tx = (k) => [k, `${k}@f`].map((x) => [x, t[x.replace(/^testi:/, '')]]).filter(([, v]) => v);
  const ch = m.ondate.flatMap((o) => o.chiamate ?? []);
  for (const b of m.briefing) for (const [k, x] of tx(b.testo)) pieni.push({ ep: m.id, tipo: 'fonte', k, n: x.length, s1: s1.includes(m.id) });
  for (const c of ch) for (const [k, x] of tx(c.testo)) pieni.push({ ep: m.id, tipo: 'chiamata', k, n: x.length, s1: s1.includes(m.id) });
  for (const o of m.ondate) { const k = `${(o.titolo ?? `testi:${m.id}.ondata${o.n}`).replace(/^testi:/, '')}.i`; if (t[k]) pieni.push({ ep: m.id, tipo: 'i', k, n: t[k].length, s1: s1.includes(m.id) }); }
}
const LIM = { fonte: 80, chiamata: 100, i: 90 };
for (const p of pieni) if (p.n > LIM[p.tipo] && (p.tipo === 'i' || p.s1)) lunghi.push(p);
// stessa misura sulle altre stagioni (fuori dal guardiano), solo come conteggio
const fuoriS1 = pieni.filter((p) => p.tipo !== 'i' && !p.s1 && p.n > LIM[p.tipo]);
// testi col nome nuovo vicini al limite (margine ≤ 3)
const conNome = pieni.filter((p) => (p.tipo === 'i' || p.s1) && LIM[p.tipo] - p.n <= 3 && /Kiln|Skyfield|Square|Arches|Studio|Garden|Stoneway/.test(testi[`${p.ep}.json:${p.k.replace(/^testi:/, '')}`] ?? ''));

// letterali in src/resa
const src = [];
const giro = (d) => { for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) giro(p); else if (/\.(tsx?|css|html)$/.test(e.name)) src.push(p); } };
giro('src/resa'); src.push('index.html');
const resSrc = [];
for (const p of src) readFileSync(p, 'utf8').split('\n').forEach((r, i) => { for (const n of VECCHI) if (new RegExp(n, 'i').test(r)) resSrc.push(`${p}:${i + 1}: ${r.trim().slice(0, 140)}`); });

const conta = {};
for (const o of occorrenze) { const c = `${o.art || '(nessuno)'} ${o.nome}`; conta[c] = (conta[c] ?? 0) + 1; }
const r = { testi: Object.keys(testi).length, residui, occorrenze: occorrenze.length, articoli: conta, sospetti, lunghi, fuoriS1: fuoriS1.length, vicini: conNome, residuiSrc: resSrc };
console.log(`testi ${r.testi}, residui nei valori ${residui.length}, occorrenze dei nomi nuovi ${occorrenze.length}, articoli sospetti ${sospetti.length}, oltre i limiti dei guardiani ${lunghi.length}, vicini al limite (≤3) col nome nuovo ${conNome.length}, righe di src/resa coi nomi vecchi ${resSrc.length}`);
console.log(JSON.stringify(conta, null, 1));
for (const s of sospetti) console.log(`SOSPETTO ${s.k}: «${s.art} ${s.nome}» (atteso ${s.atteso}) … ${s.frase}`);
for (const s of residui) console.log(`RESIDUO ${s.k}: ${s.n}: ${s.v}`);
for (const l of lunghi) console.log(`LUNGO ${l.ep} ${l.tipo} ${l.k} ${l.n}`);
for (const l of conNome) console.log(`VICINO ${l.ep} ${l.tipo} ${l.k} ${l.n}/${LIM[l.tipo]}`);
for (const l of resSrc) console.log(`SRC ${l}`);
if (process.argv[2]) writeFileSync(process.argv[2], JSON.stringify(r, null, 1));
