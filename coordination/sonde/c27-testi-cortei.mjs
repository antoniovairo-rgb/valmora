// C-027: per ogni ondata con un corteo disegnato (folla.ts) o una chiamata su una strada (dinamica PO-089), i testi che il
// giocatore legge in quell'ondata: titolo dell'ondata, riga «i», testo e commento delle chiamate sulla stessa strada (e le
// risposte). Più le parole di direzione trovate (stadio, casa, municipio, stazione, «verso», «dallo», «tornano», …).
// Uso: node coordination/sonde/c27-testi-cortei.mjs <radice> <uscita.md>
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path'; import { pathToFileURL } from 'node:url';
const [radice = '.', uscita = 'c27-testi-cortei.md'] = process.argv.slice(2);
const { follaDellOndata } = await import(pathToFileURL(resolve(radice, 'src/resa/mappa/folla.ts')).href);
const testi = {}; for (const f of readdirSync(resolve(radice, 'data/testi/it'))) Object.assign(testi, JSON.parse(readFileSync(resolve(radice, 'data/testi/it', f), 'utf8')));
const tx = (k) => (typeof k === 'string' && k.startsWith('testi:') ? testi[k.slice(6)] ?? `[manca ${k}]` : k ?? '');
const out = [];
for (const f of readdirSync(resolve(radice, 'data/missioni')).filter((x) => /^e\d+\.json$/.test(x)).sort()) {
  const m = JSON.parse(readFileSync(resolve(radice, 'data/missioni', f), 'utf8'));
  const strade = new Set(m.mappa.settori.filter((s) => s.tipo === 'strada').map((s) => s.id));
  m.ondate.forEach((o, i) => {
    const fo = follaDellOndata(m, i + 1);
    const chs = (o.chiamate ?? []).filter((c) => strade.has(c.settore));
    if (!fo.cortei.length && !chs.length) return;
    out.push(`\n### ${m.id} ondata ${i + 1} — spalti ${fo.spalti}; corteo dell'ondata: ${fo.cortei.map((c) => `${c.settore}>${c.verso}`).join(', ') || '—'}; chiamate su strada: ${chs.map((c) => `${c.id}@${c.settore}>${fo.spalti === 'deflusso' ? 'esce' : 'entra'}`).join(', ') || '—'}`);
    out.push(`- eventi: ${o.eventi.map((e) => `${e.id}:${e.tipo}@${e.settore}${e.verso ? '/' + e.verso : ''}`).join(', ')}`);
    out.push(`- titolo: ${tx(o.titolo)}`);
    out.push(`- «i»: ${tx(o.titolo + '.i')}`);
    for (const c of o.chiamate ?? []) out.push(`- ch ${c.id}@${c.settore ?? '—'}: ${tx(c.testo)}${c.commento ? ' // ' + tx(c.commento) : ''}`);
  });
}
writeFileSync(uscita, out.join('\n')); console.log(`righe ${out.length}`);
