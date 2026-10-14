// Sonda C-023 (sola lettura, solo dati): elenchi per C21-01/02/03 sulla 0.17.0. Ricalcola fuori dalla resa la regola
// del codice: corteo dell'ondata = eventi IN_STRADA della strada, mai nell'ondata di partita (src/resa/mappa/folla.ts:16-31);
// colori del corteo dell'ondata = club del primo evento della strada con «club» (folla.ts:29) → club della strada →
// curva omonima → neutro grigio (StratoPixi.tsx:76-78, sfondo.ts:121); colori del corteo della CHIAMATA sulla sua
// strada = coloriViali, cioè club della strada → curva omonima → neutro, SENZA il club dell'evento
// (StratoPixi.tsx:98 e 159). Modi:
//  colori  : per ogni strada di ogni episodio e OGNI ondata: eventi, colori del corteo dell'ondata, colori della
//            dinamica delle chiamate su quella strada, testi (briefing con settore, testo d'ondata .i, chiamate).
//  delta   : ΔE76 (CIE76 su L*a*b* D65) fra i grigi del neutro e i colori di ogni club (data/club/).
//  dinamica: chiamate su una strada in cui il corteo dell'ondata e il corteo della chiamata hanno colori diversi.
// Uso: node coordination/sonde/c23-dati.mjs colori|delta|dinamica
import fs from 'node:fs';
const T = {}; for (const f of fs.readdirSync('data/testi/it')) Object.assign(T, JSON.parse(fs.readFileSync('data/testi/it/' + f)));
const tx = (k) => (k ? (k.startsWith('testi:') ? T[k.slice(6)] ?? `?${k}` : k) : '');
const M = fs.readdirSync('data/missioni').sort().map((f) => JSON.parse(fs.readFileSync('data/missioni/' + f)));
const CLUB = Object.fromEntries(fs.readdirSync('data/club').map((f) => JSON.parse(fs.readFileSync('data/club/' + f))).map((c) => [c.id, c]));
const IN_STRADA = new Set(['corteo', 'arrivo', 'deflusso', 'folla', 'raduno', 'movimento', 'fuga']);
const tok = Object.fromEntries([...fs.readFileSync('src/resa/token.css', 'utf8').matchAll(/(--mappa-[a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map((x) => [x[1], x[2]]));
const NEUTRO = [tok['--mappa-folla-2'], tok['--mappa-folla-3']];
const modo = process.argv[2] ?? 'colori';
const viale = (m, s) => { const cu = m.mappa.settori.find((c) => c.tipo === 'curva' && c.id === `curva_${s.id.replace(/^[a-z]+_/, '')}`); return s.club ? `${s.club}(strada)` : cu?.club ? `${cu.club}(curva omonima)` : 'neutro'; };
function lab(h) {
  const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v > 0.04045 ? ((v + 0.055) / 1.055) ** 2.4 : v / 12.92));
  const X = (c[0] * 0.4124 + c[1] * 0.3576 + c[2] * 0.1805) / 0.95047, Y = c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722, Z = (c[0] * 0.0193 + c[1] * 0.1192 + c[2] * 0.9505) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
}
const dE = (a, b) => { const p = lab(a), q = lab(b); return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); };
if (modo === 'delta') {
  console.log(`neutro: --mappa-folla-2 ${NEUTRO[0]}, --mappa-folla-3 ${NEUTRO[1]} (src/resa/token.css); vecchio --mappa-corteo-1 ${tok['--mappa-corteo-1']}`);
  let min = Infinity;
  for (const c of Object.values(CLUB)) {
    const r = NEUTRO.map((n) => [dE(n, c.colori.primario), dE(n, c.colori.secondario)]);
    min = Math.min(min, ...r.map((x) => x[0]));
    console.log(`${c.id.padEnd(20)} primario ${c.colori.primario}: ΔE76 ${r.map((x) => x[0].toFixed(1)).join(' / ')} · secondario ${c.colori.secondario}: ${r.map((x) => x[1].toFixed(1)).join(' / ')} · vecchio arancio→primario ${dE(tok['--mappa-corteo-1'], c.colori.primario).toFixed(1)}`);
  }
  console.log(`minimo ΔE76 neutro↔primario: ${min.toFixed(1)}`);
  process.exit(0);
}
const dinamiche = [];
for (const m of M) {
  const strade = m.mappa.settori.filter((s) => s.tipo === 'strada');
  for (const s of strade) {
    if (modo === 'colori') {
      console.log(`\n## ${m.id} ${s.id} · viale (dinamica delle chiamate): ${viale(m, s)}`);
      for (const b of m.briefing ?? []) if (b.settore === s.id) console.log(`  B[${b.fonte}${b.vera ? '' : ',falsa'}] ${tx(b.testo)}`);
    }
    m.ondate.forEach((o, k) => {
      const partita = o.eventi.some((e) => e.tipo === 'curva');
      const ev = o.eventi.filter((e) => e.settore === s.id);
      const inStrada = ev.filter((e) => IN_STRADA.has(e.tipo));
      const corteo = partita || !inStrada.length ? 'nessun corteo' : (() => { const c = inStrada.find((e) => e.club)?.club; return c ? `${c}(evento)` : viale(m, s); })();
      const ch = (o.chiamate ?? []).filter((c) => c.settore === s.id);
      if (modo === 'colori') {
        console.log(`  o${o.n}${partita ? ' (partita)' : ''}: eventi [${ev.map((e) => `${e.tipo}:${e.id}${e.club ? '@' + e.club : ''}${e.se ? '(se)' : ''}`).join(' ')}] → corteo ondata: ${corteo}${ch.length ? ` · corteo chiamata: ${viale(m, s)}` : ''}`);
        const i = T[`${m.id}.ondata${o.n}.i`]; if (i && i.toLowerCase().includes('')) console.log(`    i: ${i}`);
        for (const c of ch) console.log(`    ${c.id}[${c.fonte}] ${tx(c.testo)}`);
      }
      if (ch.length && !corteo.startsWith('nessun') && corteo.split('(')[0] !== viale(m, s).split('(')[0]) for (const c of ch) dinamiche.push(`${m.id} o${o.n} ${c.id} ${s.id}: ondata ${corteo} ≠ chiamata ${viale(m, s)}`);
    });
  }
}
if (modo === 'dinamica') console.log(`${dinamiche.length} chiamate:\n  ${dinamiche.join('\n  ')}`);
