// Sonda C-028: partita «a mano». Le scelte le fa la collaudatrice leggendo lo schermo: la sonda rigioca da capo le scelte
// già date (SCELTE) e si ferma alla prima decisione senza scelta, stampa quello che il giocatore vede (testo della chiamata,
// opzioni, unità libere, settori) e fa la foto. Schieramento: «r@settore+r@settore…» (vuoto = nessuna unità); chiamata: id
// dell'opzione. Col mouse (page.click). Uso:
// W=1920 H=1080 EP=e02 SCELTE='squadre@piazzale+steward@curva;scorta;…' node coordination/sonde/c28-mano.mjs <radice> <foto>
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c28'; mkdirSync(DIR, { recursive: true });
const W = Number(process.env.W ?? 1920); const H = Number(process.env.H ?? 1080); const EP = process.env.EP ?? 'e02';
const SCELTE = (process.env.SCELTE ?? '').split(';').filter((x, i, a) => x !== '' || i < a.length - 1);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
const errori = []; p.on('pageerror', (e) => errori.push(e.message.slice(0, 120))); p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text().slice(0, 120)); });
const sc = (n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
const quale = () => p.evaluate(() => document.querySelector('.scena')?.dataset.scena);
const m = missioni.find((x) => x.id === EP);
async function fine(cosa) { const f = `${DIR}/mano-${W}x${H}-${EP}-passo${String(k).padStart(2, '0')}.png`; await p.screenshot({ path: f });
  console.log(`PASSO ${k} (${cosa}) foto ${f}\n${(await p.evaluate(() => document.querySelector('main')?.innerText ?? '')).replace(/\n{2,}/g, '\n').slice(0, 1400)}`);
  console.log('COMANDI: ' + (await p.evaluate(() => [...document.querySelectorAll('[data-opzione]')].map((e) => `${e.dataset.opzione}`).join(' | ') + ' || unità: ' + [...document.querySelectorAll('[data-risorsa]')].map((e) => `${e.dataset.risorsa}:${e.textContent.replace(/\D/g, '')}${e.disabled ? '(no)' : ''}`).join(' ') + ' || settori: ' + [...document.querySelectorAll('[data-settore]')].map((e) => e.dataset.settore).join(' '))));
  console.log(`errori ${errori.length}`); await b.close(); srv.close(); process.exit(0); }
let k = 0;
await p.goto(URL); await p.evaluate((v) => { localStorage.clear(); localStorage.setItem('valmora-salvataggio', v); }, JSON.stringify(salvataggioTutti(missioni, v0))); await p.reload(); await sc('titolo');
await p.getByRole('button', { name: 'Riprendi' }).click(); await sc('citta'); await p.waitForTimeout(300);
if (await p.locator(`[data-stagione="${m.stagione}"]`).count()) await p.click(`[data-stagione="${m.stagione}"]`);
await p.click(`[data-episodio="${EP}"] .settore-punto`); await p.click('[data-azione="avvia-episodio"]'); await p.waitForTimeout(200);
for (let i = 0; i < 3 && await p.locator('[data-azione="conferma-passo"]').count(); i++) await p.click('[data-azione="conferma-passo"]');
if (await p.locator('[data-azione="conferma-rigioca"]').count()) await p.click('[data-azione="conferma-rigioca"]');
await sc('sala'); while (await p.locator('[data-azione="passo"]').count()) await p.click('[data-azione="passo"]');
await p.click('[data-azione="avanti"]'); await sc('briefing'); while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) await p.click('[data-azione="prossimo"], [data-azione="passo"]');
await p.click('[data-azione="inizia"]'); await sc('schieramento');
for (;;) {
  await p.waitForTimeout(300); await p.waitForFunction(() => { const x = document.querySelectorAll('.scena'); return x.length === 1 && getComputedStyle(x[0]).opacity === '1'; }); const s = await quale();
  const firma = await p.evaluate(() => `${document.querySelector('.scena')?.dataset.scena}|${document.querySelector('[data-messaggio^="chiamata-"]')?.dataset.messaggio}`);
  const cambia = () => p.waitForFunction((f) => { const x = document.querySelectorAll('.scena'); return x.length === 1 && getComputedStyle(x[0]).opacity === '1' && `${x[0].dataset.scena}|${document.querySelector('[data-messaggio^="chiamata-"]')?.dataset.messaggio}` !== f; }, firma, { timeout: 15000 });
  if (s === 'verbale') { while (await p.locator('[data-azione="passo"]').count()) await p.click('[data-azione="passo"]'); await fine('verbale'); }
  if (s === 'chiusura') { await p.click('[data-azione="rapporto"]'); await sc('rapporto'); await p.click('[data-azione="avanti"]'); await p.waitForFunction(() => { const x = document.querySelectorAll('.scena'); return x.length === 1 && x[0].dataset.scena !== 'rapporto' && getComputedStyle(x[0]).opacity === '1'; }, null, { timeout: 15000 }); continue; }
  if (s === 'rapporto') { await p.click('[data-azione="avanti"]'); await p.waitForFunction(() => { const x = document.querySelectorAll('.scena'); return x.length === 1 && x[0].dataset.scena !== 'rapporto' && getComputedStyle(x[0]).opacity === '1'; }, null, { timeout: 15000 }); continue; }
  if (k >= SCELTE.length) await fine(s);
  const c = SCELTE[k++];
  if (s === 'schieramento') { for (const x of c.split('+').filter(Boolean)) { const [r, st] = x.split('@'); if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${st}"] .settore-punto`); }
    await p.click('[data-azione="conferma"]'); if (await p.locator('[data-azione="conferma-davvero"]').count()) await p.click('[data-azione="conferma-davvero"]'); await cambia(); }
  else if (s === 'chiamata') { await p.click(`[data-opzione="${c}"]`); await sc('risposta'); await p.waitForTimeout(300); await p.click('[data-azione="continua"]');
    await p.waitForFunction(() => { const x = document.querySelectorAll('.scena'); return x.length === 1 && x[0].dataset.scena !== 'risposta' && getComputedStyle(x[0]).opacity === '1'; }, null, { timeout: 15000 }); }
  else throw new Error(`scena inattesa ${s}`);
}
