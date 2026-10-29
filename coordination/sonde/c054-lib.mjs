// C-054: pilota Playwright comune (build qualsiasi: dist/ della 0.57.0 o le build storiche 0.54.0 / 0.55.0). Solo lettura del repository.
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from 'playwright-core';
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.jpg': 'image/jpeg' };
export function servi(dir) {
  const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(dir, u === '/' ? 'index.html' : u.endsWith('/') ? u + 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok({ srv, url: `http://127.0.0.1:${srv.address().port}/` })));
}
export async function apri(url, W = 360, H = 640, { veloce = true, ...opz } = {}) {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, reducedMotion: 'reduce', ...opz });
  const p = await ctx.newPage(); p.setDefaultTimeout(6000); const errori = [];
  p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text().slice(0, 200)); }); p.on('pageerror', (e) => errori.push(e.message.slice(0, 200)));
  if (veloce) await p.addInitScript(() => { globalThis.__VALMORA_SECONDO_MS = 1; }); // veloce=false: tempi reali (le interstizie di Tono.tsx durano davvero)
  await p.goto(url); return { browser, p, errori };
}
// durante la dissolvenza ci sono due .scena (quella che esce e quella che entra): si aspetta che ce ne sia una sola, opaca (come c25-ripresa.mjs)
export const scena = async (p) => { await p.waitForFunction(() => { const s = document.querySelectorAll('.scena'); return s.length <= 1 && (!s[0] || getComputedStyle(s[0]).opacity === '1'); }, null, { timeout: 4000 }).catch(() => {}); return p.evaluate(() => document.querySelector('.scena')?.dataset.scena ?? null); };
export const testo = (p) => p.evaluate(() => (document.querySelector('.scena')?.innerText ?? document.body.innerText).replace(/\n{2,}/g, '\n'));
export const scorr = (p) => p.evaluate(() => ({ y: document.documentElement.scrollHeight - innerHeight, x: document.documentElement.scrollWidth - innerWidth, scena: (() => { const e = document.querySelector('.scena'); return e ? e.scrollHeight - e.clientHeight : null; })() }));
export const bottoni = (p) => p.evaluate(() => [...document.querySelectorAll('button')].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0; }).map((b) => (b.dataset.azione ? `azione=${b.dataset.azione}` : b.dataset.opzione ? `opzione=${b.dataset.opzione}` : b.dataset.stagione ? `stagione=${b.dataset.stagione}` : `testo=${b.innerText.trim().slice(0, 30)}`) + (b.disabled ? '(off)' : '')));
const NEUTRI = '[data-azione="continua"], [data-azione="rapporto"], [data-azione="avanti"], [data-azione="passo"], [data-azione="inizia"], [data-azione="prossimo"], [data-azione="avvia-episodio"], [data-azione="conferma-passo"], [data-azione="conferma-rigioca"]';
/** schiera a giro sui settori e conferma */
export async function schiera(p) {
  const sett = await p.evaluate(() => [...document.querySelectorAll('[data-settore]')].map((e) => e.dataset.settore)); let i = 0;
  for (const r of ['squadre', 'steward', 'mediatore']) for (let k = 0; k < 14; k++) {
    if (!(await p.locator(`[data-risorsa="${r}"]:not([disabled])`).count())) break;
    if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]:not([disabled])`);
    const q = await p.evaluate((x) => document.querySelector(`[data-risorsa="${x}"]`)?.innerText.split('\n').filter(Boolean)[1], r); if (Number(q) === 0) break;
    await p.click(`[data-settore="${sett[i++ % sett.length]}"] .settore-punto`);
  }
  await p.click('[data-azione="conferma"]', { timeout: 2000 }).catch(() => {}); await p.click('[data-azione="conferma-davvero"]', { timeout: 2000 }).catch(() => {});
}
/** un passo: se c'è una decisione e `scelta` la sceglie, altrimenti preme il tasto neutro. Ritorna la scena. */
export async function passo(p, scelta) {
  const sc = await scena(p);
  if (sc === 'schieramento') { await schiera(p); await p.waitForTimeout(120); return sc; }
  const opz = p.locator('.opzioni > [data-opzione]:not([disabled])');
  if (await opz.count()) { if (scelta) await scelta(opz, p); else await opz.first().click(); await p.waitForTimeout(150); const cf = p.locator('[data-azione="conferma-scelta"], [data-azione="conferma-risposta"], [data-azione="conferma"]').first(); if (await cf.count()) await cf.click({ timeout: 1500 }).catch(() => {}); return sc; }
  const b = p.locator(NEUTRI).first(); if (await b.count()) await b.click({ timeout: 1500 }).catch(() => {}); else await p.waitForTimeout(150);
  await p.waitForTimeout(100); return sc;
}
