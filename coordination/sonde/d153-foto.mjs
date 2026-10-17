// Foto D-153: la chiamata con la risposta esaurita, a 360/375/412 px, con la build di prima e quella di dopo.
import { createServer } from 'node:http';
import { existsSync, readFileSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from 'playwright-core';
const [build, salvataggio, uscita, etichetta] = process.argv.slice(2);
const TIPI = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp' };
const srv = createServer((req, res) => { const u = decodeURIComponent((req.url ?? '/').split('?')[0]); const p = join(build, u === '/' ? 'index.html' : u); if (!existsSync(p)) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': TIPI[extname(p)] ?? 'application/octet-stream' }); res.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const url = `http://127.0.0.1:${srv.address().port}/`;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
mkdirSync(uscita, { recursive: true });
const sal = readFileSync(salvataggio, 'utf8');
for (const w of [360, 375, 412]) {
  const p = await browser.newPage({ viewport: { width: w, height: 800 }, reducedMotion: 'reduce' });
  const errori = []; p.on('pageerror', (e) => errori.push(e.message));
  await p.goto(url); await p.evaluate((s) => { localStorage.clear(); localStorage.setItem('valmora-salvataggio', s); localStorage.setItem('valmora-guida', 'si'); }, sal); await p.reload();
  await p.getByRole('button', { name: 'Riprendi' }).click({ timeout: 8000 });
  // avanza finché compaiono le opzioni della chiamata
  for (let k = 0; k < 30 && !(await p.locator('.opzioni .opzione').count()); k++) { const av = p.locator('[data-azione="continua"], [data-azione="avanti"], button.pulsante').first(); if (await av.count()) await av.click().catch(() => {}); await p.waitForTimeout(250); }
  await p.waitForTimeout(600);
  const opz = await p.$$eval('.opzioni .opzione', (xs) => xs.map((x) => `${x.dataset.opzione}${x.disabled ? '(disattivata)' : ''}${x.querySelector('.motivo-esaurita') ? ':' + x.querySelector('.motivo-esaurita').textContent : ''}`));
  await p.locator('.opzioni').scrollIntoViewIfNeeded().catch(() => {});
  await p.screenshot({ path: join(uscita, `${etichetta}-${w}.png`), fullPage: false });
  const fuori = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  console.log(`${etichetta} ${w}px: opzioni ${opz.join(', ')} · scorrimento orizzontale ${fuori}px · errori ${errori.length}`);
  await p.close();
}
await browser.close(); srv.close();
