// Sonda C-022 (PO-106): foto ingrandite della mappa tattica durante una chiamata, per giudicare a che cosa somigliano
// le persone disegnate da Pixi (corteo del settore citato, folla attorno al punto, cortei dell'ondata, spalti).
// Per ogni episodio EP gioca il piano attento col motore e apre nell'interfaccia vera (dist/) la prima chiamata su una
// strada (corteo) e la prima su un altro settore (folla), a 360 e 412 con DPR 1 e 2, «riduci movimento» (fermo).
// Salva: mappa intera (PNG) e ritaglio 120×120 px CSS attorno al settore citato, ingrandito ×4 a pixel pieni.
// Uso: node coordination/sonde/c22-mappa.mjs <radice con dist/> <cartella foto>
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c22'; mkdirSync(DIR, { recursive: true });
const EP = (process.env.EP ?? 'e01,e04,e07,e13,e18,e26,e34').split(',');
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(R, 'data'));
const scelte = [];
for (const ep of EP) { const m = missioni.find((x) => x.id === ep); const g = B.attenta(creaCaso(1), dich); let s = M.iniziaMissione(m, v0, dich); const presi = {};
  while (!M.missioneFinita(m, s)) { s = M.schiera(m, s, g.schiera(m, s));
    for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const tipo = m.mappa.settori.find((x) => x.id === c.settore)?.tipo; const k = !c.settore ? null : tipo === 'strada' ? 'corteo' : 'folla';
      if (k && !presi[k]) { presi[k] = true; scelte.push({ m, c, k, s: structuredClone(s) }); } s = M.rispondi(m, s, c.id, g.scegli(m, s, c), dich); }
    s = M.chiudiOndata(m, s, dich); } }
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const base = salvataggioTutti(missioni, v0); const errori = []; const zoom = await b.newPage({ viewport: { width: 520, height: 520 } });
for (const [w, h] of [[360, 760], [412, 915]]) for (const dpr of [1, 2]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, deviceScaleFactor: dpr, reducedMotion: 'reduce' });
  p.on('pageerror', (e) => errori.push(e.message.slice(0, 120))); await p.goto(URL);
  for (const x of scelte) {
    await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify({ ...base, in_corso: x.s })); await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click();
    await p.waitForFunction(() => document.querySelector('.scena')?.dataset.scena === 'chiamata', null, { timeout: 15000 }); await p.waitForSelector('.mappa[data-pronta="si"]', { timeout: 15000 }).catch(() => {}); await p.waitForTimeout(600);
    const mp = await p.$('.mappa'); const nome = `${w}${dpr === 2 ? 'x2' : ''}-${x.m.id}-${x.k}-${x.c.id}`;
    const info = await p.evaluate((id) => { const m = document.querySelector('.mappa'); const r = m.getBoundingClientRect(); const s = document.querySelector(`[data-settore="${id}"]`).getBoundingClientRect(); return { mx: r.left, my: r.top, mw: r.width, mh: r.height, sx: s.left - r.left, sy: s.top - r.top, din: m.dataset.dinamica, folla: m.dataset.folla }; }, x.c.settore);
    await mp.screenshot({ path: `${DIR}/mappa-${nome}.png` });
    const L = 120, cx = Math.max(0, Math.min(info.mw - L, info.sx - L / 2)), cy = Math.max(0, Math.min(info.mh - L, info.sy - L / 2));
    const buf = await p.screenshot({ clip: { x: info.mx + cx, y: info.my + cy, width: L, height: L } });
    await zoom.setContent(`<body style="margin:0;background:#000"><img src="data:image/png;base64,${buf.toString('base64')}" style="width:${L * 4}px;height:${L * 4}px;image-rendering:pixelated"></body>`); await zoom.waitForTimeout(100);
    await zoom.screenshot({ path: `${DIR}/zoom4-${nome}.png`, clip: { x: 0, y: 0, width: 480, height: 480 } });
    console.log(`${nome}: dinamica ${info.din}, folla ${info.folla}, mappa ${Math.round(info.mw)}×${Math.round(info.mh)}`);
  }
  await p.close();
}
await b.close(); srv.close(); console.log(`errori ${errori.length} ${[...new Set(errori)].join(' | ')}`);
