// Sonda C-029 (sola lettura): con la vignetta della sala che trema (C29-01), quanti clic «da giocatore» vanno a segno?
// In sala (EP) a W×H: per N volte legge dove sta il pulsante «passo» in quel momento, aspetta 120 ms (tempo umano fra
// vedere e cliccare), clicca col mouse in quel punto e guarda se il passo è avanzato. Si ricomincia dalla sala quando i passi finiscono.
// Uso: W=1366 H=768 [EP=e01] [N=30] [ROSSI=…] node coordination/sonde/c29-sala-clic.mjs <radice con dist/>
import { createServer } from 'node:http'; import { readFileSync, existsSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const W = Number(process.env.W ?? 1366), H = Number(process.env.H ?? 768), EP = process.env.EP ?? 'e01', N = Number(process.env.N ?? 30);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const ROSSI = (process.env.ROSSI ?? '').split(',').filter(Boolean); if (ROSSI.length) await p.addInitScript((r) => { for (const x of r) globalThis[`__NO_${x}`] = true; }, ROSSI);
const m = missioni.find((x) => x.id === EP); const salv = JSON.stringify(salvataggioTutti(missioni, v0)); await p.goto(URL);
const sala = async () => { await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), salv); await p.reload(); await sc(p, 'titolo'); await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta'); await p.waitForTimeout(300);
  if (await p.locator(`[data-stagione="${m.stagione}"]`).count()) await p.click(`[data-stagione="${m.stagione}"]`);
  await p.click(`[data-episodio="${EP}"] .settore-punto`); await p.waitForTimeout(300); await p.click('[data-azione="avvia-episodio"]'); await p.waitForTimeout(200);
  for (let k = 0; k < 3 && await p.locator('[data-azione="conferma-passo"]').count(); k++) { await p.click('[data-azione="conferma-passo"]'); await p.waitForTimeout(150); }
  if (await p.locator('[data-azione="conferma-rigioca"]').count()) await p.click('[data-azione="conferma-rigioca"]'); await sc(p, 'sala'); await p.waitForTimeout(600); };
const passo = () => p.evaluate(() => document.querySelector('.scena')?.innerText.length ?? 0);
let segno = 0, fatti = 0; await sala();
for (let i = 0; i < N; i++) { if (!(await p.locator('[data-azione="passo"]').count())) await sala();
  const box = await p.locator('[data-azione="passo"]').boundingBox(); if (!box) { await sala(); continue; }
  const prima = await passo(); await p.waitForTimeout(120); await p.mouse.click(box.x + box.width / 2, box.y + box.height / 2); await p.waitForTimeout(400); fatti++;
  if ((await passo()) !== prima) segno++; }
console.log(`${W}×${H} ${EP}${ROSSI.length ? ' rosso ' + ROSSI : ''}: clic ${fatti}, a segno ${segno}, a vuoto ${fatti - segno}`);
await b.close(); srv.close();
