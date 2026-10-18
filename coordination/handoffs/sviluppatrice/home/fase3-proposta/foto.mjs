// PO-140, seconda fase (SOLO PROPOSTA): la vignetta della home come testata di città e guida. Nessun codice del gioco
// cambia: la vignetta vera della home (già nel gioco) si copia nella pagina vera di città e guida e si fotografa,
// prima e dopo, a 360/375/412 × 760. Uso: node coordination/handoffs/sviluppatrice/home/fase3-proposta/foto.mjs
import { createServer } from 'vite';
import { chromium } from 'playwright-core';
import { resolve } from 'node:path';
import { GAME_VERSION } from '../../../../../src/versione.ts';

const qui = resolve('coordination/handoffs/sviluppatrice/home/fase3-proposta');
const server = await createServer({ server: { port: 5197, strictPort: true }, logLevel: 'error' }); await server.listen();
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const sal = JSON.stringify({ save_version: 2, game_version: GAME_VERSION, seme: 1, caso: 1, variabili: {}, missioni_concluse: [], episodi: {}, genere: 'm', rapporto_aperto: null, in_corso: null });
const righe = [];
for (const w of [360, 375, 412]) for (const dove of (process.env.VARIANTE ? ['striscia', 'guida2'] : ['citta', 'guida'])) {
  const p = await browser.newPage({ viewport: { width: w, height: 760 }, deviceScaleFactor: 2, reducedMotion: 'reduce' });
  await p.goto('http://localhost:5197/'); await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), sal); await p.reload();
  await p.waitForSelector('[data-home-vignetta]'); await p.evaluate(() => document.fonts.ready);
  const vignetta = await p.evaluate(() => document.querySelector('[data-home-vignetta]').outerHTML);
  if (dove === 'citta' || dove === 'striscia') { await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForSelector('main[data-schermata="citta"]'); }
  else { await p.click('[data-azione="guida"]'); await p.waitForSelector('.vignetta'); }
  await p.waitForTimeout(1500);
  if (dove === 'guida2') { await p.getByRole('button', { name: 'Avanti' }).click(); await p.waitForTimeout(800); await p.screenshot({ path: `${qui}/guida-passo2-${w}.png`, fullPage: true }); righe.push({ dove, w, prima: 0, dopo: await p.evaluate(() => document.documentElement.scrollHeight), piu: 0 }); await p.close(); continue; }
  const alta = () => p.evaluate(() => document.documentElement.scrollHeight);
  const prima = await alta(); await p.screenshot({ path: `${qui}/${dove}-prima-${w}.png`, fullPage: true });
  await p.evaluate(([html, dove]) => {
    const t = document.createElement('div'); t.innerHTML = html; const f = t.firstElementChild; f.classList.add('testata-proposta');
    if (dove === 'striscia') f.querySelector('svg').style.maxHeight = 'var(--home-vignetta-min)';
    f.querySelector('figcaption').textContent = dove !== 'guida' ? 'La città · stasera si gioca' : 'La città e il gioco';
    if (dove === 'guida') document.querySelector('main .scena .vignetta')?.remove(); // la vignetta del passo lascia il posto alla testata
    const s = document.querySelector('main .scena'); s.insertBefore(f, s.firstChild);
  }, [vignetta, dove]);
  await p.waitForTimeout(500);
  const dopo = await alta(); await p.screenshot({ path: `${qui}/${dove}-dopo-${w}.png`, fullPage: true });
  righe.push({ dove, w, prima, dopo, piu: dopo - prima }); await p.close();
}
console.table(righe);
await browser.close(); await server.close();
