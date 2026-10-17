// Sonda C-037 (sola lettura): C34-01 nelle conferme a più passi (Tripla «rigioca» in città, «nuova partita» al titolo).
// Solo tastiera: Tab fino al «Sì» del passo, Invio; poi altri Invio SENZA Tab: quanti passi avanzano? Dove sta il fuoco
// (elemento, dentro la finestra)? Se il fuoco resta sul «Sì», Invio ripetuti attraverserebbero le 3 conferme.
// Uso: W=1366 H=768 [ROSSI=C104R01] node coordination/sonde/c37-tripla.mjs <radice con dist/>
import { createServer } from 'node:http'; import { readFileSync, existsSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const W = Number(process.env.W ?? 1366), H = Number(process.env.H ?? 768); const ROSSI = (process.env.ROSSI ?? '').split(',').filter(Boolean);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { let f = join(R, 'dist', decodeURIComponent(q.url.split('?')[0])); if (!existsSync(f) || f.endsWith('/')) f = join(R, 'dist', 'index.html'); r.writeHead(200, { 'content-type': T[extname(f)] ?? 'application/octet-stream' }); r.end(readFileSync(f)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1, reducedMotion: 'reduce' }); const errori = []; p.on('pageerror', (e) => errori.push(e.message));
if (ROSSI.length) await p.addInitScript((r) => { for (const x of r) globalThis[`__NO_${x}`] = true; }, ROSSI);
const sc = (n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 30000 });
const att = () => p.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return 'body'; const r = a.getBoundingClientRect(); return `${a.tagName}.${String(a.className).split(' ')[0]}${a.dataset.azione ? '[' + a.dataset.azione + ']' : ''}${r.bottom > innerHeight || r.top < 0 ? ' FUORI' : ''}`; });
const passo = () => p.evaluate(() => document.querySelector('[data-conferma-passo]')?.dataset.confermaPasso ?? (document.querySelector('.scena')?.dataset.scena));
const tabFino = async (sel, max = 300) => { for (let n = 0; n <= max; n++) { if (await p.evaluate((s) => document.activeElement?.matches(s), sel)) return n; await p.keyboard.press('Tab'); await p.waitForTimeout(10); } return -1; };
const prova = async (nome, si) => {
  const tab = await tabFino(si); await p.keyboard.press('Enter'); await p.waitForTimeout(600);
  const righe = [`Tab ${tab}, Invio → passo ${await passo()}, fuoco ${await att()}`];
  for (let k = 0; k < 3; k++) { await p.keyboard.press('Enter'); await p.waitForTimeout(600); righe.push(`Invio senza Tab → passo ${await passo()}, fuoco ${await att()}`); }
  console.log(`${W}×${H}${ROSSI.length ? ' rosso ' + ROSSI : ''} ${nome}: ${righe.join(' | ')}`);
};
await p.goto(URL); await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(salvataggioTutti(missioni, v0))); await p.reload(); await sc('titolo');
await p.getByRole('button', { name: 'Riprendi' }).focus(); await p.keyboard.press('Enter'); await sc('citta'); await p.waitForTimeout(300);
if (await p.locator('[data-stagione="1"]').count()) { await tabFino('[data-stagione="1"]'); await p.keyboard.press('Enter'); await p.waitForTimeout(300); }
await tabFino('[data-episodio="e01"] .settore-punto'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
await tabFino('[data-azione="avvia-episodio"]'); await p.keyboard.press('Enter'); await p.waitForTimeout(600);
await prova('rigioca e01 (Tripla)', '[data-azione="conferma-passo"], [data-azione="conferma-rigioca"]');
await p.goto(URL); await sc('titolo');
const nuova = p.getByRole('button', { name: /Nuova partita/i }); if (await nuova.count()) { await nuova.first().focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(800);
  console.log(`${W}×${H} titolo, dopo «Nuova partita»: scena ${await passo()}, fuoco ${await att()}`);
  if (await p.locator('[data-azione="conferma-passo"]').count()) await prova('nuova partita (Tripla)', '[data-azione="conferma-passo"], [data-azione="conferma-nuova"]'); }
console.log(`errori ${errori.length} ${errori.slice(0, 3).join(' | ')}`); await b.close(); srv.close();
