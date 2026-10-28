// C-053 punto 2: controlli automatici sui testi di tutte le carte e varianti (non sostituiscono la lettura).
import { readFileSync } from 'node:fs';
const R = JSON.parse(readFileSync('coordination/collaudi/c053/dati/testi-nuovi.json', 'utf8'));
const stringhe = [];
for (const r of R) { const dove = `${r.ep} o${r.ondata} ${r.tipo} ${r.id}`; stringhe.push([dove, 'testo', r.testo], [dove, 'commento', r.commento ?? '']);
  for (const o of r.opzioni) stringhe.push([dove, `${o.id}.testo`, o.testo], [dove, `${o.id}.costo`, o.costo ?? ''], [dove, `${o.id}.risposta`, o.risposta]); }
const prob = [];
const add = (k, dove, campo, nota) => prob.push({ k, dove, campo, nota });
const reali = /\b(inter|milan|juventus|juve|roma|lazio|napoli|torino|genoa|sampdoria|fiorentina|atalanta|bologna|polizia di stato|carabinieri|digos|questura|guardia di finanza|ultras? (della|del)|curva sud|curva nord|italia|milano|torino|napoli|stadio olimpico|san siro|daspo|ministero dell'interno|covid|facebook|twitter|instagram|whatsapp|telegram|tiktok|youtube)\b/i;
const violenza = /\b(sangue|sanguin\w*|mort[oi]\b|cadaver\w*|ucciso|uccid\w*|accoltell\w*|coltell\w*|pistol\w*|spar[oi]\b|sparat\w*|fucil\w*|bomb[ae]\b|esplosi\w*|stupr\w*|picchiat\w*|pestat\w*|ossa rotte|ferit[oia]\b|feriti|ferite|lacerat\w*|mazzat\w*|bastonat\w*|manganell\w*|lacrimogen\w*|sassaiol\w*|scontri violenti)\b/i;
for (const [dove, campo, t] of stringhe) {
  if (!t) { if (campo !== 'commento' && !campo.endsWith('costo')) add('vuoto', dove, campo, 'stringa vuota'); continue; }
  if (/\s{2,}/.test(t)) add('spazi', dove, campo, 'spazi doppi');
  if (/\s[,.;:!?]/.test(t)) add('punteggiatura', dove, campo, 'spazio prima della punteggiatura');
  if (/[,.;:]{2,}(?!\.)/.test(t.replace(/\.\.\./g, '…'))) add('punteggiatura', dove, campo, 'punteggiatura doppia: ' + t.match(/.{10}[,.;:]{2,}.{5}/)?.[0]);
  const ap = (t.match(/«/g) ?? []).length, ch = (t.match(/»/g) ?? []).length; if (ap !== ch) add('virgolette', dove, campo, '« » non pari');
  if ((t.match(/"/g) ?? []).length % 2) add('virgolette', dove, campo, '" dispari');
  if ((t.match(/\(/g) ?? []).length !== (t.match(/\)/g) ?? []).length) add('parentesi', dove, campo, 'parentesi non pari');
  if (/\b(\w{3,})\s+\1\b/i.test(t)) add('ripetizione', dove, campo, 'parola doppia: ' + t.match(/\b(\w{3,})\s+\1\b/i)[0]);
  if (reali.test(t)) add('reale', dove, campo, 'possibile riferimento reale: ' + t.match(reali)[0]);
  if (violenza.test(t)) add('violenza', dove, campo, 'parola di violenza: ' + t.match(violenza)[0]);
  if (/\bqual'è\b|\bun po(?!['’\w])/.test(t)) add('refuso', dove, campo, "apostrofo: " + t.match(/\bqual'è\b|\bun po(?!['’\w])/)[0]);
  if (/\b(e'|a'|o'|perche|cosi|piu|gia|citta|pero|poiche|affinche|nonche|finche)\b/.test(t)) add('accento', dove, campo, 'accento mancante: ' + t.match(/\b(e'|a'|o'|perche|cosi|piu|gia|citta|pero|poiche|affinche|nonche|finche)\b/)[0]);
  if (campo === 'testo' || campo.endsWith('risposta')) if (!/[.!?…»”)]$/.test(t.trim())) add('chiusura', dove, campo, 'non finisce con punteggiatura: …' + t.slice(-25));
  if (/^[a-zàèéìòù]/.test(t.trim()) && campo !== 'costo') add('maiuscola', dove, campo, 'inizia in minuscolo: ' + t.slice(0, 25));
  if (/TODO|XXX|lorem|\{\w+\}|\$\{/.test(t)) add('segnaposto', dove, campo, 'segnaposto');
}
// duplicati esatti e quasi
const per = new Map(); for (const [dove, campo, t] of stringhe) { if (t.length < 25) continue; (per.get(t) ?? per.set(t, []).get(t)).push(`${dove}.${campo}`); }
for (const [t, ds] of per) if (ds.length > 1) add('duplicato', ds.join(' | '), '', 'stesso testo: ' + t.slice(0, 80));
// lunghezze
const lung = R.map((r) => ({ id: `${r.ep}.${r.id}`, n: r.testo.length + (r.commento ?? '').length + r.opzioni.reduce((a, o) => a + o.testo.length + (o.costo ?? '').length, 0) })).sort((a, b) => b.n - a.n);
console.log('stringhe', stringhe.length, 'problemi', prob.length);
const gruppi = {}; for (const x of prob) (gruppi[x.k] ??= []).push(x);
for (const [k, xs] of Object.entries(gruppi)) { console.log(`\n== ${k}: ${xs.length}`); for (const x of xs.slice(0, 40)) console.log(`  ${x.dove} [${x.campo}] ${x.nota}`); }
console.log('\nLunghezza chiamata+opzioni (caratteri) min/mediana/max:', lung.at(-1).n, lung[lung.length >> 1].n, lung[0].n, '| più lunghe:', lung.slice(0, 5).map((x) => `${x.id}:${x.n}`).join(' '));
