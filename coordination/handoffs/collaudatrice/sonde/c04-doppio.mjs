// Sonda C-04 · R01 sulla resa S-03: doppio tocco su due opzioni, con la scena ferma (attesa 1,5 s dopo l'ingresso).
// Uso: node coordination/handoffs/collaudatrice/sonde/c04-doppio.mjs <radice del ramo resa con dist/>
import { createServer } from 'node:http'; import { readFileSync, existsSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2]); const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const [nome, attesa] of [['tocco singolo', null], ['doppio 40 ms', 40], ['doppio 150 ms', 150], ['doppio 300 ms', 300]]) {
  const p = await b.newPage({ viewport: { width: 360, height: 760 }, hasTouch: true });
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
  const sc = (n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n; }, n, { timeout: 8000 });
  await sc('titolo'); await p.getByRole('button', { name: 'Nuova partita' }).click(); await sc('genere'); await p.click('[data-genere="m"]'); await sc('citta');
  await p.click('[data-azione="avvia-episodio"]'); await sc('sala'); await p.click('[data-azione="avanti"]'); await sc('briefing');
  while (await p.locator('[data-azione="prossimo"]').count()) { await p.click('[data-azione="prossimo"]'); await p.waitForTimeout(80); }
  await p.click('[data-azione="inizia"]'); await sc('schieramento'); await p.click('[data-azione="conferma"]'); await sc('chiamata'); await p.waitForTimeout(1500);
  await p.locator('[data-opzione="ferma"]').scrollIntoViewIfNeeded(); await p.waitForTimeout(300); const ra = await p.locator('[data-opzione="scorta"]').boundingBox(); console.log('  riquadri', JSON.stringify(ra), 'finestra 760'); const rb = await p.locator('[data-opzione="ferma"]').boundingBox();
  await p.mouse.click(ra.x + ra.width / 2, ra.y + ra.height / 2);
  let ancora = '-';
  if (attesa !== null) { await p.waitForTimeout(attesa); ancora = await p.locator('[data-opzione="ferma"]').count(); await p.mouse.click(rb.x + rb.width / 2, rb.y + rb.height / 2); }
  await p.waitForTimeout(1200);
  const s = await p.evaluate(() => JSON.parse(localStorage.getItem('valmora-salvataggio')));
  const testo = await p.locator('.scena').innerText().catch(() => '');
  console.log(`${nome}: «ferma» ancora a schermo ${ancora}; salvato ${JSON.stringify(s.in_corso.risposte)}, scelte ${s.in_corso.scelte.length}; scena ${await p.getAttribute('.scena', 'data-scena')}; a schermo «${testo.replace(/\s+/g, ' ').slice(0, 90)}»`);
  await p.close();
}
await b.close(); srv.close();
