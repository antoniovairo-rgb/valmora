// Sonda C-023 (sola lettura): colori VERI dei cortei sulla mappa della chiamata, contati sui pixel (non sugli attributi
// data-*). Per ogni chiamata di LISTA (episodio:chiamata) apre la chiamata nell'interfaccia (412×915, scala 2, riduci
// movimento: i cortei restano fermi), fotografa la sola mappa in PNG e conta i pixel vicini (distanza RGB ≤ TOL) ai
// colori di ogni club e ai due grigi del neutro. Due bracci: normale e con __NO_C32D01 (niente corteo della chiamata,
// src/resa/mappa/dinamica.ts:13): la differenza è il corteo della chiamata. Legge anche data-colori-cortei.
// Uso: node coordination/sonde/c23-colori-ui.mjs <radice> <foto> · env LISTA=e28:ospiti_in_auto,... TOL=14
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c23'; mkdirSync(DIR, { recursive: true });
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(R, 'data'));
const CLUB = Object.fromEntries(readdirSync(join(R, 'data/club')).map((f) => JSON.parse(readFileSync(join(R, 'data/club', f)))).map((c) => [c.id, c.colori]));
const tok = Object.fromEntries([...readFileSync(join(R, 'src/resa/token.css'), 'utf8').matchAll(/(--mappa-[a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map((x) => [x[1], x[2]]));
const COL = { ...Object.fromEntries(Object.entries(CLUB).flatMap(([id, c]) => [[`${id}.1`, c.primario], [`${id}.2`, c.secondario]])), 'neutro.1': tok['--mappa-folla-2'], 'neutro.2': tok['--mappa-folla-3'] };
const TOL = Number(process.env.TOL ?? 14);
const LISTA = (process.env.LISTA ?? 'e28:ospiti_in_auto,e13:corteo_rovers,e15:fratelli,e15:mille,e15:fondo_viale,e06:corteo_cinderwick,e07:coro_imparato,e07:pareggio_casa,e09:a_piedi,e09:pullman_fermi,e23:in_tondo,e07:foto_ricordo').split(',');
// stato in cui la chiamata è la prima aperta
const stati = new Map();
for (const k of LISTA) {
  const [id, cid] = k.split(':'); const m = missioni.find((x) => x.id === id);
  cerca: for (const [nome, st] of Object.entries(B.STRATEGIE)) for (let seme = 1; seme <= 40; seme++) {
    const g = st(creaCaso(seme * 7919 + m.episodio), dich); let s = M.iniziaMissione(m, { ...v0 }, dich), passi = 0;
    while (!M.missioneFinita(m, s) && passi++ < 400) {
      s = M.schiera(m, s, g.schiera(m, s));
      for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { if (c.id === cid) { stati.set(k, { m, c, s: structuredClone(s) }); break cerca; } s = M.rispondi(m, s, c.id, g.scegli(m, s, c), dich); }
      s = M.chiudiOndata(m, s, dich);
    }
  }
}
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const base = salvataggioTutti(missioni, v0); const errori = [];
const conta = await b.newPage();
const contaPixel = (png) => conta.evaluate(async ([b64, COL, TOL]) => {
  const im = new Image(); im.src = `data:image/png;base64,${b64}`; await im.decode();
  const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data; const rgb = Object.entries(COL).map(([k, h]) => [k, [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))]);
  const n = Object.fromEntries(rgb.map(([k]) => [k, 0]));
  for (let i = 0; i < d.length; i += 4) for (const [k, q] of rgb) if (Math.abs(d[i] - q[0]) <= TOL && Math.abs(d[i + 1] - q[1]) <= TOL && Math.abs(d[i + 2] - q[2]) <= TOL) n[k]++;
  return n;
}, [png.toString('base64'), COL, TOL]);
const out = {};
for (const braccio of ['normale', 'C32D01']) {
  const p = await b.newPage({ viewport: { width: 412, height: 915 }, hasTouch: true, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  if (braccio !== 'normale') await p.addInitScript((x) => { globalThis[`__NO_${x}`] = true; }, braccio);
  p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text().slice(0, 160)); }); p.on('pageerror', (e) => errori.push(e.message.slice(0, 160)));
  await p.goto(URL);
  for (const [k, x] of stati) {
    await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify({ ...base, in_corso: x.s }));
    await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click();
    await p.waitForFunction(() => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === 'chiamata' && getComputedStyle(s[0]).opacity === '1'; }, null, { timeout: 10000 });
    await p.waitForSelector('.mappa[data-pronta="si"]', { timeout: 10000 }).catch(() => {}); await p.waitForTimeout(700);
    const a = await p.evaluate(() => { const m = document.querySelector('.mappa'); return { colori: m.dataset.coloriCortei, folla: m.dataset.folla, dinamica: m.dataset.dinamica }; });
    const png = await p.locator('.mappa').first().screenshot({ type: 'png' });
    const n = await contaPixel(png);
    out[k] ??= {}; out[k][braccio] = { ...a, n };
    if (braccio === 'normale') await p.locator('.mappa').first().screenshot({ path: `${DIR}/412x2-${k.replace(':', '-')}-mappa.jpg`, type: 'jpeg', quality: 85 });
  }
  await p.close();
}
for (const [k, o] of Object.entries(out)) {
  const nz = (n) => Object.entries(n).filter(([, v]) => v > 0);
  const diff = Object.keys(COL).map((c) => [c, (o.normale?.n[c] ?? 0) - (o.C32D01?.n[c] ?? 0)]).filter(([, v]) => Math.abs(v) >= 20);
  console.log(`${k}: folla ${o.normale?.folla} · dinamica ${o.normale?.dinamica} · data-colori-cortei ${o.normale?.colori}\n   pixel (normale) ${nz(o.normale?.n ?? {}).map(([c, v]) => `${c}=${v}`).join(' ')}\n   pixel del solo corteo della chiamata (normale − C32D01, |Δ|≥20): ${diff.map(([c, v]) => `${c}=${v}`).join(' ') || 'nessuno'}`);
}
console.log(`chiamate trovate ${stati.size}/${LISTA.length}; errori di console ${errori.length} ${[...new Set(errori)].slice(0, 3).join(' | ')}`);
await b.close(); srv.close();
