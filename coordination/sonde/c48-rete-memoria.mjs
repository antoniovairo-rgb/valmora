// C-048 (PO-145): dichiarazioni della privacy messe alla prova: richieste di rete fuori dall'origine locale e chiavi di memoria dopo guida + una partita + ripresa.
import { existsSync } from 'node:fs'; import { chromium } from 'playwright-core'; import { servi } from '../../tools/foto.mjs';
const srv = await servi('dist'), url = `http://127.0.0.1:${srv.address().port}/`;
const br = await chromium.launch({ executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
const ctx = await br.newContext({ viewport: { width: 360, height: 760 }, hasTouch: true, reducedMotion: 'reduce' }), p = await ctx.newPage(); const esterne = [], tutte = []; const err = [];
p.on('request', (r) => { tutte.push(r.url()); if (!r.url().startsWith(url) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) esterne.push(r.url()); });
p.on('console', (x) => x.type() === 'error' && err.push(x.text())); p.on('pageerror', (e) => err.push(e.message));
await p.addInitScript(() => { globalThis.__VALMORA_SECONDO_MS = 1; });
await p.goto(url); await p.getByRole('button', { name: /nuova partita/i }).click(); await p.getByRole('button', { name: /nuovo responsabile/i }).click(); await p.waitForTimeout(500);
for (let i = 0; i < 10; i++) { const b = p.locator('[data-azione="avanti"], [data-azione="saltaguida"], button:has-text("Salta")').first(); if (!(await b.count())) break; await b.click().catch(() => {}); await p.waitForTimeout(200); }
await p.click('[data-azione="avvia-episodio"]').catch(() => {}); await p.waitForTimeout(800);
const chiavi = await p.evaluate(() => ({ local: Object.keys(localStorage), session: Object.keys(sessionStorage), cookie: document.cookie, idb: indexedDB.databases ? null : 'n/d' }));
const idb = await p.evaluate(async () => (indexedDB.databases ? (await indexedDB.databases()).map((d) => d.name) : 'n/d'));
console.log(JSON.stringify({ richieste: tutte.length, esterne, chiavi, idb, errori: err.length }));
await br.close(); srv.close();
