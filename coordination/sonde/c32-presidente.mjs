// Sonda C-032 (sola lettura): i testi riscritti da D-138 a schermo. Le chiamate e07 `immagine_club` ed e08
// `consiglio_presidente` compaiono solo con presidente_incontrato (e01, «vai in tribuna»): il bot attento non le apre.
// Salvataggio con tutti gli episodi aperti e presidente_incontrato = true; si gioca e07 ed e08 dall'interfaccia senza
// schierare (Conferma), rispondendo sempre alla prima opzione (o a OP= se c'è), fino alla chiamata cercata; foto della
// chiamata e della risposta. Uso: W=360 H=760 [OP=declina8] node coordination/sonde/c32-presidente.mjs <radice> <foto>
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c32/presidente'; mkdirSync(DIR, { recursive: true });
const W = Number(process.env.W ?? 360); const H = Number(process.env.H ?? 760); const OP = (process.env.OP ?? '').split(',').filter(Boolean);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { let f = join(R, 'dist', decodeURIComponent(q.url.split('?')[0])); if (!existsSync(f) || f.endsWith('/')) f = join(R, 'dist', 'index.html'); r.writeHead(200, { 'content-type': T[extname(f)] ?? 'application/octet-stream' }); r.end(readFileSync(f)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, reducedMotion: 'reduce' }); const errori = []; p.on('pageerror', (e) => errori.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errori.push(m.text()); });
const sc = (n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && (n === '*' || s[0].dataset.scena === n) && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
const v = { ...v0, presidente_incontrato: true }; const s = salvataggioTutti(missioni, v); for (const e of Object.values(s.episodi)) { e.variabili_prima = v; e.variabili_dopo = v; } s.variabili = v;
for (const [ep, cerca] of [['e07', 'immagine_club'], ['e08', 'consiglio_presidente']]) {
  await p.goto(URL); await p.evaluate((x) => localStorage.setItem('valmora-salvataggio', x), JSON.stringify(s)); await p.reload(); await sc('titolo');
  await p.click('button:has-text("Riprendi")'); await sc('citta'); await p.waitForTimeout(300);
  if (await p.locator('[data-stagione="1"]').count()) await p.click('[data-stagione="1"]');
  await p.click(`[data-episodio="${ep}"] .settore-punto`); await p.click('[data-azione="avvia-episodio"]'); await p.waitForTimeout(200);
  for (let k = 0; k < 3 && await p.locator('[data-azione="conferma-passo"]').count(); k++) await p.click('[data-azione="conferma-passo"]');
  if (await p.locator('[data-azione="conferma-rigioca"]').count()) await p.click('[data-azione="conferma-rigioca"]');
  await sc('sala'); while (await p.locator('[data-azione="passo"]').count()) await p.click('[data-azione="passo"]'); await p.click('[data-azione="avanti"]'); await sc('briefing');
  while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) await p.click('[data-azione="prossimo"], [data-azione="passo"]'); await p.click('[data-azione="inizia"]');
  let trovata = false, viste = [], ultima = null;
  for (let passi = 0; passi < 120; passi++) {
    await p.waitForFunction(() => { const s = document.querySelectorAll('.scena'); return s.length === 1 && getComputedStyle(s[0]).opacity === '1' && (s[0].dataset.scena !== 'risposta' || s[0].querySelector('[data-azione]')) && (s[0].dataset.scena !== 'chiamata' || s[0].querySelector('.opzione:not([disabled]), [data-azione="continua"]')); }, null, { timeout: 20000 }); await p.waitForTimeout(250); const scena = await p.evaluate(() => document.querySelector('.scena').dataset.scena);
    if (scena === 'schieramento') { if (!(await p.locator('[data-risorsa]').count())) { await p.screenshot({ path: `${DIR}/debug-${ep}-${passi}.png` }); console.log('debug', await p.evaluate(() => [...document.querySelectorAll('button')].map((b) => b.dataset.azione || b.className).join(' '))); } for (let u = 0; u < 3 && !(await p.locator('[data-azione="conferma"]:not([disabled])').count()); u++) { await p.locator('[data-risorsa]').first().click({ timeout: 5000 }); await p.locator('.settore-punto').nth(u).click(); await p.waitForTimeout(150); } await p.click('[data-azione="conferma"]'); if (await p.locator('[data-azione="conferma-davvero"]').count()) await p.click('[data-azione="conferma-davvero"]'); continue; }
    if (scena === 'chiamata') { const id = await p.evaluate(() => document.querySelector('[data-chiamata]')?.dataset.chiamata ?? document.querySelector('.scena').dataset.chiamata ?? ''); viste.push(id);
      const ops = await p.$$eval('.opzione', (o) => o.map((x) => x.dataset.opzione)); const op = ops.find((x) => OP.includes(x)) ?? ops[0];
      if (ops.some((x) => /accetta7|declina7|accetta8|declina8/.test(x))) { trovata = true; await p.screenshot({ path: `${DIR}/${W}x${H}-${ep}-chiamata-${cerca}.png`, fullPage: true }); console.log(`${ep}: chiamata ${cerca} trovata; testo: ${(await p.locator('.chiamata-corpo, .testo-radio').first().innerText()).replace(/\s+/g, ' ').slice(0, 300)}`); }
      await p.click(`[data-opzione="${op}"]`); if (trovata) ultima = op;
      await p.waitForSelector('[data-azione="continua"]', { timeout: 15000 }).catch(() => {}); await p.waitForTimeout(300);
      if (ultima) { await p.screenshot({ path: `${DIR}/${W}x${H}-${ep}-risposta-${ultima}.png`, fullPage: true }); console.log(`${ep}: risposta ${ultima}: ${(await p.locator('.scena').innerText()).replace(/\s+/g, ' ').slice(-300)}`); break; }
      if (await p.locator('[data-azione="continua"]').count()) await p.click('[data-azione="continua"]'); continue; }
    if (scena === 'risposta') { const ok = await p.locator('[data-azione="continua"]').click({ timeout: 20000 }).then(() => true, () => false); if (!ok) { console.log('risposta: ' + (await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').slice(0, 300)))); await p.screenshot({ path: `${DIR}/debug-${ep}.png` }); break; } continue; }
    if (scena === 'briefing') { const x = p.locator('[data-azione="prossimo"], [data-azione="passo"], [data-azione="inizia"]').first(); await x.click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(300); continue; }
    if (scena === 'chiusura') { await p.click('[data-azione="rapporto"]'); continue; } if (scena === 'rapporto') { await p.click('[data-azione="avanti"]'); continue; }
    console.log(`scena non gestita: ${scena}`); break; }
  if (!trovata) console.log(`${ep}: chiamata ${cerca} NON trovata; chiamate viste: ${viste.join(', ')}`);
}
console.log(`errori ${errori.length} ${errori.slice(0, 3).join(' | ')}`); await b.close(); srv.close();
