// C-047: la guida «La città e il gioco» passo per passo a 360, 375, 412 px (altezza 760): scorrimento e testo; foto dei passi.
// Uso: npx vite build && node coordination/sonde/c47-guida.mjs <cartella-foto>
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { servi } from '../../tools/foto.mjs';
const cart = process.argv[2]; mkdirSync(cart, { recursive: true });
const srv = await servi('dist'), url = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
for (const w of [360, 375, 412]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 760 }, hasTouch: true, reducedMotion: 'reduce' })).newPage(); const err = [];
  p.on('console', (x) => x.type() === 'error' && err.push(x.text())); p.on('pageerror', (e) => err.push(e.message));
  await p.goto(url); await p.getByRole('button', { name: /La città e il gioco/i }).click(); await p.waitForTimeout(400);
  for (let i = 1; i <= 8; i++) {
    const m = await p.evaluate(() => ({ s: document.documentElement.scrollHeight - innerHeight, o: document.documentElement.scrollWidth - innerWidth, t: document.querySelector('.scena').innerText.replace(/\n+/g, ' | ').slice(0, 400) }));
    console.log(JSON.stringify({ w, passo: i, scroll_y: m.s, orizz: m.o, testo: m.t }));
    await p.screenshot({ path: join(cart, `guida-passo${i}-${w}.jpg`), type: 'jpeg', quality: 55 });
    const nx = p.getByRole('button', { name: /^Avanti/i }); if (!(await nx.count())) break; await nx.first().click(); await p.waitForTimeout(300);
  }
  console.log(JSON.stringify({ w, errori: err.length }));
}
await b.close(); srv.close();
