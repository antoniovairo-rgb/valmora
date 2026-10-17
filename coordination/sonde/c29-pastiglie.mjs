// Sonda C-029 (sola lettura): C27-06 e C28-14, pastiglie sopra i nomi dei settori in ogni ondata di ogni episodio, con le
// unità del bot attento già messe (stessi stati e stessa misura del guardiano: partenzeAttente e mappaSchieramento di
// tools/foto-schieramenti.mjs), a 360×760, 375×667 e 412×915. Uso: [ROSSI=C81P01] node coordination/sonde/c29-pastiglie.mjs <radice con dist/> <uscita.json> [cartella foto]
import { createServer } from 'node:http'; import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const OUT = process.argv[3] ?? 'c29-pastiglie.json'; const FOTO = process.argv[4]; if (FOTO) mkdirSync(FOTO, { recursive: true });
const ROSSI = (process.env.ROSSI ?? '').split(',').filter(Boolean);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { partenzeAttente, mappaSchieramento } = await import(`${R}/tools/foto-schieramenti.mjs`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const base = salvataggioTutti(missioni, v0); const stati = partenzeAttente(join(R, 'data')); const RIS = []; const errori = [];
for (const [W, H] of [[360, 760], [375, 667], [412, 915]]) {
  const p = await b.newPage({ viewport: { width: W, height: H }, reducedMotion: 'reduce' });
  if (ROSSI.length) await p.addInitScript((r) => { for (const x of r) globalThis[`__NO_${x}`] = true; }, ROSSI);
  p.on('pageerror', (e) => errori.push(`${W}: ${e.message.slice(0, 160)}`)); p.on('console', (x) => { if (x.type() === 'error') errori.push(`${W}: ${x.text().slice(0, 160)}`); });
  await p.goto(URL);
  for (const st of stati) {
    await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify({ ...base, in_corso: st.s, bozza: { missione: st.s.missione, ondata: st.s.ondata, d: st.d } }));
    await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click();
    if (!(await p.waitForSelector('[data-barra]', { timeout: 5000 }).then(() => true, () => false))) { RIS.push({ W, ep: st.m.id, n: st.n, aperto: false }); continue; }
    await p.waitForTimeout(150); const r = await mappaSchieramento(p); RIS.push({ W, ep: st.m.id, n: st.n, ...r });
    if (FOTO && r.suNomi.length) await p.locator('.mappa:not(.citta)').screenshot({ path: `${FOTO}/pastiglie-${W}${ROSSI.length ? '-rosso' : ''}-${st.m.id}-o${st.n}.png` });
  }
  await p.close();
  const qui = RIS.filter((x) => x.W === W);
  console.log(`${W}×${H}: ondate ${qui.length}, con pastiglie sopra i nomi ${qui.filter((x) => x.suNomi?.length).length}, nomi su nomi ${qui.filter((x) => x.sopra?.length).length}, pastiglie col centro coperto ${qui.filter((x) => x.coperte?.length).length}, fuori dalla mappa ${qui.filter((x) => x.fuori?.length).length}, non aperte ${qui.filter((x) => x.aperto === false).length}`);
  for (const x of qui.filter((x) => x.suNomi?.length)) console.log(`  ${x.ep} o${x.n}: ${x.suNomi.join('; ')}`);
}
await b.close(); srv.close(); writeFileSync(OUT, JSON.stringify({ ROSSI, RIS, errori })); console.log(`errori ${errori.length}`, errori.slice(0, 5));
