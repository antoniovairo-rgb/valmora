// Sonda C-032 (sola lettura): C29-04, il passo 5 della guida («Durante») spiega «Urgente!». Partita nuova da memoria
// vuota: titolo → (genere) → guida introduttiva; «Avanti» fino al passo 5; testo mostrato, testo tagliato, scorrimento,
// pulsanti dentro la finestra e non coperti; foto. Anche la guida aperta dal «?» della partita? No: solo l'introduttiva.
// Uso: node coordination/sonde/c32-guida.mjs <radice con dist/> <foto>
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c32/guida'; mkdirSync(DIR, { recursive: true });
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { let f = join(R, 'dist', decodeURIComponent(q.url.split('?')[0])); if (!existsSync(f) || f.endsWith('/')) f = join(R, 'dist', 'index.html'); r.writeHead(200, { 'content-type': T[extname(f)] ?? 'application/octet-stream' }); r.end(readFileSync(f)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const sc = (p) => p.waitForFunction(() => { const s = document.querySelectorAll('.scena'); return s.length === 1 && getComputedStyle(s[0]).opacity === '1'; }, null, { timeout: 15000 });
let errori = 0;
for (const [W, H] of [[360, 760], [375, 667], [412, 915], [1366, 768]]) {
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, reducedMotion: 'reduce' }); p.on('pageerror', () => errori++); p.on('console', (m) => { if (m.type() === 'error') errori++; });
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload(); await sc(p);
  for (let k = 0; k < 8; k++) { await sc(p); const n = await p.evaluate(() => document.querySelector('.scena').dataset.scena); if (n === 'guida') break;
    const bt = p.locator('.scena button.pulsante:not(.secondario), .scena [data-genere]').first(); await bt.click(); await p.waitForTimeout(300); }
  for (let k = 0; k < 4; k++) { await p.click('[data-azione="guida-avanti"]'); await p.waitForTimeout(250); }
  const m = await p.evaluate(() => { const s = document.querySelector('.scena'); const pp = s.querySelector('p'); const r = pp.getBoundingClientRect();
    const bt = [...s.querySelectorAll('button')].map((e) => { const q = e.getBoundingClientRect(); const top = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return { az: e.dataset.azione, dentro: q.bottom <= innerHeight && q.top >= 0, coperto: !(top && (e === top || e.contains(top))) }; });
    return { etichetta: s.querySelector('.etichetta')?.textContent, testo: pp.textContent, alto: +r.height.toFixed(0), fondoTesto: +r.bottom.toFixed(0), tagliato: pp.scrollHeight > pp.clientHeight + 1, scorre: document.documentElement.scrollHeight - innerHeight, oriz: document.documentElement.scrollWidth - innerWidth, carattere: getComputedStyle(pp).fontSize, bt }; });
  await p.screenshot({ path: `${DIR}/${W}x${H}-guida-5.jpg`, type: 'jpeg', quality: 80 });
  console.log(`${W}×${H}: ${m.etichetta}; «Urgente!» nel testo: ${m.testo.includes('«Urgente!»')}; paragrafo ${m.alto} px (fondo a ${m.fondoTesto}), tagliato ${m.tagliato}, scorrimento verticale ${m.scorre} px, orizzontale ${m.oriz}, carattere ${m.carattere}; pulsanti ${m.bt.map((x) => `${x.az} ${x.dentro ? 'dentro' : 'FUORI'}${x.coperto ? ' COPERTO' : ''}`).join(', ')}`);
  await p.close();
}
console.log(`errori ${errori}`); await b.close(); srv.close();
