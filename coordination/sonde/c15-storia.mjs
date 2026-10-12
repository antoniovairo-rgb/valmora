// Sonda C-015 (collaudo, sola lettura): storia sulla campagna intera, dai dati.
// Uso: node coordination/sonde/c15-storia.mjs [radice]   (radice = cartella del repository, predefinita «.»)
// Misura: (1) dove le sei variabili di D-100 si impostano e si leggono, e letture prima di ogni scrittura;
// (2) nomi (Dessì, Ferrigno/Fabbro, Malvasi, Lavezzari, Varrone) nei testi; (3) lunghezze (D-101);
// (4) chiavi di testo citate dai dati e mancanti, o presenti e mai citate.
import { leggiDati } from '../../tools/dati-disco.mjs';
import { join, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.');
const dati = leggiDati(join(R, 'data'));
const testi = Object.assign({}, ...Object.entries(dati).filter(([k]) => k.startsWith('testi/it/')).map(([, v]) => v));
const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, v]) => v).sort((a, b) => a.episodio - b.episodio);
const SEI = ['rapporto_dessi', 'testimone', 'busta', 'pista_cattura', 'fascicolo', 'sospetti_talpa'];
const k = (x) => (typeof x === 'string' ? x.replace(/^testi:/, '') : null);

// --- 1. variabili
const letture = (c, out = []) => { if (!c || typeof c !== 'object') return out;
  if (c.tutte) c.tutte.forEach((x) => letture(x, out)); if (c.almeno_una) c.almeno_una.forEach((x) => letture(x, out)); if (c.non) letture(c.non, out);
  if (c.var) out.push(c); return out; };
const uso = Object.fromEntries(SEI.map((v) => [v, { scrive: [], legge: [] }]));
for (const m of missioni) {
  const scr = (dove, effetti) => { for (const e of effetti ?? []) { const v = e.imposta ?? e.aggiungi; if (uso[v]) uso[v].scrive.push(`${m.id}:${dove}=${e.imposta ? '' : '+'}${e.valore}`); } };
  const leg = (dove, c) => { for (const x of letture(c)) if (uso[x.var]) uso[x.var].legge.push(`${m.id}:${dove}(${'uguale' in x ? '=' + x.uguale : 'almeno' in x ? '≥' + x.almeno : '≤' + x.al_massimo})`); };
  leg('disponibile_se', m.disponibile_se); leg('stelle.due', m.stelle?.due); leg('stelle.tre', m.stelle?.tre);
  m.ondate.forEach((o, i) => { for (const ev of o.eventi ?? []) leg(`o${i + 1}.evento.${ev.id}`, ev.se);
    for (const c of o.chiamate ?? []) { leg(`o${i + 1}.${c.id}`, c.se); for (const op of c.opzioni) { leg(`o${i + 1}.${c.id}.${op.id}`, op.se); scr(`o${i + 1}.${c.id}.${op.id}`, op.effetti); } } });
  for (const e of m.esiti) { leg(`esito.${e.id}`, e.se); scr(`esito.${e.id}`, e.effetti); }
}
console.log('== 1. variabili di storia (D-100): scritture e letture');
const ep = (s) => Number(s.slice(1, 3));
for (const v of SEI) {
  const { scrive, legge } = uso[v];
  const primaScrittura = Math.min(...scrive.map(ep));
  const presto = legge.filter((x) => ep(x) <= primaScrittura);
  console.log(`${v}: scritta in ${[...new Set(scrive.map((x) => x.slice(0, 3)))].join(',') || '—'} (${scrive.length} effetti); letta in ${[...new Set(legge.map((x) => x.slice(0, 3)))].join(',') || '—'} (${legge.length} condizioni)`);
  console.log(`   scritture: ${scrive.join(' | ')}`);
  console.log(`   letture:   ${legge.join(' | ')}`);
  if (presto.length) console.log(`   ATTENZIONE letture non successive alla prima scrittura (e${primaScrittura}): ${presto.join(' | ')}`);
  const valori = dati['stato.json'].variabili.find((d) => d.id === v);
  if (valori.valori) { const lettiV = new Set(legge.map((x) => x.match(/=(\w+)\)/)?.[1]).filter(Boolean)); const scrittiV = new Set(scrive.map((x) => x.split('=').at(-1)));
    console.log(`   valori dichiarati ${valori.valori.join(',')} · scritti ${[...scrittiV].join(',')} · letti ${[...lettiV].join(',')}`); }
}

// --- 2. nomi
console.log('\n== 2. nomi nei testi (chiave: testo)');
const cerca = (re) => Object.entries(testi).filter(([, t]) => re.test(t));
for (const [nome, re] of [['Dessì/Dessi', /dess[iì]/i], ['Ferrigno', /ferrigno/i], ['Fabbro', /fabbro/i], ['Malvasi', /malvasi/i], ['Lavezzari', /lavezzar/i], ['Varrone', /varron/i], ['Sorbello', /sorbell/i], ['credito (D-097)', /\bcredit/i]]) {
  const x = cerca(re); console.log(`${nome}: ${x.length} testi${x.length ? ' — es. ' + x.slice(0, 3).map(([kk]) => kk).join(', ') : ''}`);
}
// varianti scritte male dei nomi (distanza di una lettera)
const parole = new Set(Object.values(testi).flatMap((t) => t.match(/\b[A-ZÀ-Ý][a-zà-ÿ]+\b/g) ?? []));
const vicino = (a, b) => { if (a === b || Math.abs(a.length - b.length) > 1) return false; let i = 0, j = 0, d = 0; while (i < a.length && j < b.length) { if (a[i] === b[j]) { i++; j++; continue; } d++; if (d > 1) return false; if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; } } return d + (a.length - i) + (b.length - j) <= 1; };
for (const n of ['Ferrigno', 'Malvasi', 'Lavezzari', 'Varrone', 'Tullio', 'Gianni', 'Ettore', 'Tano']) {
  const v = [...parole].filter((p) => vicino(p, n)); if (v.length) console.log(`ATTENZIONE variante di «${n}»: ${v.join(', ')}`);
}
// «Ferrigno» nei dialoghi (D-102: nome nei rapporti e verbali, soprannome nei dialoghi)
const nelDialogo = Object.entries(testi).filter(([kk, t]) => /ferrigno/i.test(t) && /«[^»]*ferrigno[^»]*»/i.test(t));
console.log(`«Ferrigno» dentro le virgolette di un dialogo: ${nelDialogo.length}${nelDialogo.length ? ' — ' + nelDialogo.map(([kk, t]) => `${kk}: ${t}`).join(' || ') : ''}`);

// --- 3. lunghezze (D-101)
console.log('\n== 3. lunghezze (D-101: ≤140, verbali ≤220, introduzione di 2 battute)');
const lunghi = []; const introNon2 = [];
const misura = (m, chiave, lim, cosa) => { for (const kk of [chiave, `${chiave}@f`]) { const t = testi[kk]; if (t && t.length > lim) lunghi.push(`${kk} (${cosa}) ${t.length}>${lim}`); } };
for (const m of missioni) {
  if ((m.introduzione ?? []).length !== 2) introNon2.push(`${m.id}:${(m.introduzione ?? []).length}`);
  for (const x of m.introduzione ?? []) misura(m, k(x.testo ?? x), 140, 'introduzione');
  for (const b of m.briefing) misura(m, k(b.testo), 140, 'informazione');
  for (const o of m.ondate) { if (o.titolo) misura(m, k(o.titolo), 140, 'titolo ondata');
    for (const c of o.chiamate ?? []) { misura(m, k(c.testo), 140, 'chiamata'); if (c.commento) misura(m, k(c.commento), 140, 'commento');
      for (const op of c.opzioni) { misura(m, k(op.testo), 140, 'opzione'); if (op.costo) misura(m, k(op.costo), 140, 'accenno'); if (op.risposta) misura(m, k(op.risposta), 140, 'risposta'); } } }
  for (const e of m.esiti) misura(m, k(e.verbale), 220, 'verbale');
}
console.log(`testi oltre il limite: ${lunghi.length}${lunghi.length ? '\n  ' + lunghi.join('\n  ') : ''}`);
console.log(`episodi con introduzione ≠ 2 battute: ${introNon2.length ? introNon2.join(', ') : 0}`);

// --- 4. chiavi citate e mancanti
console.log('\n== 4. chiavi di testo citate dai dati');
const citate = new Set(); const giro = (x) => { if (typeof x === 'string' && x.startsWith('testi:')) citate.add(k(x)); else if (x && typeof x === 'object') Object.values(x).forEach(giro); };
missioni.forEach(giro);
const mancanti = [...citate].filter((c) => !(c in testi));
console.log(`citate ${citate.size}, mancanti ${mancanti.length}${mancanti.length ? ': ' + mancanti.join(', ') : ''}`);
const fem = Object.keys(testi).filter((x) => x.endsWith('@f') && !(x.slice(0, -2) in testi));
console.log(`varianti @f senza forma base: ${fem.length}${fem.length ? ': ' + fem.join(', ') : ''}`);
