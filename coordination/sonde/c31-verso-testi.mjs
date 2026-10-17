// C-031 (sola lettura): per ogni ondata di e01–e36 con un corteo dell'ondata o una chiamata su una strada, il verso VERO
// sulla mappa: da dove parte il viale (stazione o bordo basso) e dove finisce (meta, stadio con la partita, centro),
// come in src/resa/mappa/sfondo.ts:99-111; «entra» = verso la fine del viale, «esce» = verso l'inizio. Il corteo della
// chiamata segue esceDinamica (src/resa/mappa/folla.ts:52-55), non più la sola partita (correzione della colonna
// «chiamata» di c27-verso.mjs e c27-testi-cortei.mjs). Accanto, i testi che il giocatore legge in quell'ondata.
// Uso: node coordination/sonde/c31-verso-testi.mjs <radice> <uscita.md> [uscita.json]
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path'; import { pathToFileURL } from 'node:url';
const [radice = '.', uscita = 'c31-verso-testi.md', uscJ] = process.argv.slice(2);
const F = await import(pathToFileURL(resolve(radice, 'src/resa/mappa/folla.ts')).href);
const testi = {}; for (const f of readdirSync(resolve(radice, 'data/testi/it'))) Object.assign(testi, JSON.parse(readFileSync(resolve(radice, 'data/testi/it', f), 'utf8')));
const tx = (k) => (typeof k === 'string' && k.startsWith('testi:') ? testi[k.slice(6)] ?? `[manca ${k}]` : k ?? '');
const out = []; const righe = [];
for (const f of readdirSync(resolve(radice, 'data/missioni')).filter((x) => /^e\d+\.json$/.test(x)).sort()) {
  const m = JSON.parse(readFileSync(resolve(radice, 'data/missioni', f), 'utf8'));
  const set = m.mappa.settori; const strade = set.filter((s) => s.tipo === 'strada');
  const curve = set.some((s) => s.tipo === 'curva'); const pz = set.some((s) => s.tipo === 'piazzale');
  const stazione = set.find((s) => s.tipo === 'stazione');
  const capi = Object.fromEntries(strade.map((s) => [s.id, { da: stazione ? `stazione(${stazione.id})` : 'bordo basso', a: s.meta ? `meta:${s.meta}` : curve && set.filter((q) => q.tipo === 'curva').length > 1 ? 'stadio' : pz ? 'centro (stadio vuoto)' : 'centro' }]));
  const ids = new Set(strade.map((s) => s.id));
  m.ondate.forEach((o, i) => {
    const fo = F.follaDellOndata(m, i + 1);
    const chs = (o.chiamate ?? []).filter((c) => ids.has(c.settore));
    if (!fo.cortei.length && !chs.length) return;
    const dir = (s, esce) => (esce ? `→ ${capi[s].da}` : `→ ${capi[s].a}`);
    const co = fo.cortei.map((c) => `${c.settore} ${c.verso} ${dir(c.settore, c.verso === 'esce')}`);
    const ch = chs.map((c) => { const e = F.esceDinamica(fo, c.settore); return `${c.id}@${c.settore} ${e ? 'esce' : 'entra'} ${dir(c.settore, e)}`; });
    righe.push({ ep: m.id, ondata: i + 1, fase: o.fase ?? null, spalti: fo.spalti, cortei: co, chiamate: ch });
    out.push(`\n### ${m.id} ondata ${i + 1} — fase ${o.fase ?? '–'}, spalti ${fo.spalti}`);
    out.push(`- corteo dell'ondata: ${co.join('; ') || '—'}`);
    out.push(`- chiamate su strada: ${ch.join('; ') || '—'}`);
    out.push(`- eventi: ${o.eventi.map((e) => `${e.id}:${e.tipo}@${e.settore}${e.verso ? '/' + e.verso : ''}`).join(', ')}`);
    out.push(`- titolo: ${tx(o.titolo)} · «i»: ${tx(o.titolo + '.i')}`);
    for (const c of chs) out.push(`- ch ${c.id}: ${tx(c.testo)}${c.commento ? ' // ' + tx(c.commento) : ''}`);
  });
}
writeFileSync(uscita, out.join('\n')); if (uscJ) writeFileSync(uscJ, JSON.stringify(righe, null, 1));
console.log(`ondate ${righe.length}`);
