// Sonda C-029 (sola lettura): tremolio della vignetta della sala al variare della finestra. Arrivati in sala (EP), per ogni
// W×H della griglia: setViewportSize, 600 ms di attesa, 30 frame letti; «trema» = la vignetta cambia stato (mostrata /
// nascosta) almeno una volta nei 30 frame. Uso: [EP=e01,e13] [ROSSI=…] node coordination/sonde/c29-sala-sweep.mjs <radice> <uscita.json>
import { createServer } from 'node:http'; import { readFileSync, existsSync, writeFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const OUT = process.argv[3] ?? 'sweep.json'; const EP = (process.env.EP ?? 'e01').split(',');
const LARG = (process.env.LARG ?? '360,375,393,412,480,768,1024,1366').split(',').map(Number); const ALT = (process.env.ALT ?? '640,667,700,720,740,760,780,800,820,840,860,880,900,915,960,1024').split(',').map(Number);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
const ROSSI = (process.env.ROSSI ?? '').split(',').filter(Boolean); const RIS = [];
for (const ep of EP) { const m = missioni.find((x) => x.id === ep);
  const p = await b.newPage({ viewport: { width: 360, height: 760 }, deviceScaleFactor: 1, hasTouch: true, reducedMotion: 'reduce' });
  if (ROSSI.length) await p.addInitScript((r) => { for (const x of r) globalThis[`__NO_${x}`] = true; }, ROSSI);
  await p.goto(URL); await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(salvataggioTutti(missioni, v0))); await p.reload(); await sc(p, 'titolo');
  await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta'); await p.waitForTimeout(300);
  if (await p.locator(`[data-stagione="${m.stagione}"]`).count()) await p.click(`[data-stagione="${m.stagione}"]`);
  await p.click(`[data-episodio="${ep}"] .settore-punto`); await p.waitForTimeout(300); await p.click('[data-azione="avvia-episodio"]'); await p.waitForTimeout(200);
  for (let k = 0; k < 3 && await p.locator('[data-azione="conferma-passo"]').count(); k++) { await p.click('[data-azione="conferma-passo"]'); await p.waitForTimeout(150); }
  if (await p.locator('[data-azione="conferma-rigioca"]').count()) await p.click('[data-azione="conferma-rigioca"]');
  await sc(p, 'sala'); await p.waitForTimeout(500);
  for (const W of LARG) for (const H of ALT) {
    await p.setViewportSize({ width: W, height: H }); await p.waitForTimeout(600);
    const v = await p.evaluate(() => new Promise((ok) => { const s = []; let n = 0; const f = () => { const g = document.querySelector('svg.vignetta[data-vignetta^="apertura"]'); s.push(g ? (g.hasAttribute('data-nascosta') ? 0 : Math.round(g.getBoundingClientRect().height)) : -1); if (++n < 30) requestAnimationFrame(f); else ok(s); }; requestAnimationFrame(f); }));
    const cambi = v.filter((x, i) => i && x !== v[i - 1]).length; RIS.push({ ep, W, H, cambi, stati: [...new Set(v)] });
  }
  await p.close(); }
await b.close(); srv.close(); writeFileSync(OUT, JSON.stringify({ ROSSI, RIS }));
for (const ep of EP) { console.log(`${ep}${ROSSI.length ? ' rosso ' + ROSSI : ''}: tremano ${RIS.filter((r) => r.ep === ep && r.cambi).length}/${RIS.filter((r) => r.ep === ep).length} finestre`); for (const W of LARG) console.log(`  ${W}: ${RIS.filter((r) => r.ep === ep && r.W === W).map((r) => `${r.H}${r.cambi ? `✗(${r.stati.join('/')})` : `·${r.stati[0]}`}`).join(' ')}`); }
