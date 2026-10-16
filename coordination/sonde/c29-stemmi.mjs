// Sonda C-029 (sola lettura): stemmi di D-128 nel gioco vero (build dist/), sulla mappa della città, riga della sfida.
// Per W in 360, 375, 412 e DPR 1 e 3: salvataggio con tutti gli episodi aperti, «Riprendi», scelta dell'episodio in cui il
// club gioca (e08 Square, e06 Garden, e16 Pinegrove, e25 Belltower), foto ritagliata della riga «Stasera» e misure:
// lato dello stemma e del simbolo disegnato in px CSS e px fisici, spessore delle scaglie della pigna in px fisici,
// contrasto simbolo/forma. Uso: node coordination/sonde/c29-stemmi.mjs <radice con dist/> <cartella foto> <uscita.json>
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c29'; const OUT = process.argv[4] ?? 'c29-stemmi.json'; mkdirSync(DIR, { recursive: true });
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
const CASI = [['e08', 'calderholt_rovers'], ['e06', 'quillhaven_albion'], ['e16', 'pinegrove_rangers'], ['e25', 'belltower_harriers']];
const RIS = []; const errori = [];
for (const W of [360, 375, 412]) for (const dpr of [1, 3]) {
  const H = { 360: 760, 375: 667, 412: 915 }[W];
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: dpr, hasTouch: true, reducedMotion: 'reduce' });
  p.on('pageerror', (e) => errori.push(`${W}@${dpr}: ${e.message.slice(0, 160)}`)); p.on('console', (x) => { if (x.type() === 'error') errori.push(`${W}@${dpr}: ${x.text().slice(0, 160)}`); });
  await p.goto(URL); await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(salvataggioTutti(missioni, v0))); await p.reload(); await sc(p, 'titolo');
  await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta'); await p.waitForTimeout(400);
  for (const [ep, club] of CASI) {
    const m = missioni.find((x) => x.id === ep);
    if (await p.locator(`[data-stagione="${m.stagione}"]`).count()) await p.click(`[data-stagione="${m.stagione}"]`);
    await p.click(`[data-episodio="${ep}"] .settore-punto`); await p.waitForTimeout(400);
    const sf = p.locator('.sfida'); await sf.scrollIntoViewIfNeeded();
    const mis = await p.evaluate((club) => {
      const s = document.querySelector(`.sfida svg.stemma[data-stemma="${club}"]`); if (!s) return null; const r = s.getBoundingClientRect();
      const g = s.querySelector('g[data-simbolo]'); const gr = g.getBBox(); const k = Math.min(r.width / 40, r.height / 50); // unità del disegno → px CSS
      const rgb = (c) => (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number); const lum = (v) => { const [a, b2, c] = v.map((u) => { u /= 255; return u <= 0.03928 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4; }); return 0.2126 * a + 0.7152 * b2 + 0.0722 * c; };
      const rap = (a, b2) => { const [l1, l2] = [lum(rgb(a)), lum(rgb(b2))].sort((x, y) => y - x); return +((l1 + 0.05) / (l2 + 0.05)).toFixed(2); };
      const forma = getComputedStyle(s.querySelector('.stemma-forma')).fill, simb = getComputedStyle(g).fill;
      const scaglie = [...g.querySelectorAll('path')].find((x) => x.getAttribute('stroke') === 'currentColor');
      return { disegno: g.dataset.simbolo, stemma: `${r.width.toFixed(1)}×${r.height.toFixed(1)}`, scala: +k.toFixed(3), simbolo: `${(gr.width * k).toFixed(1)}×${(gr.height * k).toFixed(1)}`,
        contrasto: rap(forma, simb), scaglieCss: scaglie ? +(parseFloat(scaglie.getAttribute('stroke-width')) * k).toFixed(2) : null, alone: s.querySelector('[data-alone-stemma]')?.dataset.aloneStemma ?? null };
    }, club);
    const box = await sf.boundingBox(); const st = await p.locator(`.sfida svg.stemma[data-stemma="${club}"]`).boundingBox();
    const f1 = `${DIR}/stemmi-${W}-dpr${dpr}-${ep}.png`; await p.screenshot({ path: f1, clip: box });
    const f2 = `${DIR}/stemma-${W}-dpr${dpr}-${club}.png`; await p.screenshot({ path: f2, clip: { x: st.x - 2, y: st.y - 2, width: st.width + 4, height: st.height + 4 } });
    RIS.push({ W, dpr, ep, club, ...mis, scaglieFisici: mis?.scaglieCss ? +(mis.scaglieCss * dpr).toFixed(2) : null, foto: [f1, f2] });
    console.log(W, dpr, ep, JSON.stringify(mis));
  }
  await p.close();
}
await b.close(); srv.close(); writeFileSync(OUT, JSON.stringify({ RIS, errori }, null, 1)); console.log(`errori ${errori.length}`, errori.slice(0, 5));
