// C-048: riepilogo dello schieramento (C47-02/D-221): scorrimento verticale a 6 formati, e36/e22/e01 ondata 1; D-219 «Home» su e36; privacy.
// Uso: npx vite build && node coordination/sonde/c48-riepilogo.mjs <cartella-foto>
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { servi } from '../../tools/foto.mjs';
import { salvataggioTutti, missioniDai } from '../../tools/foto-bozze.mjs';
import { partenzeAttente } from '../../tools/foto-schieramenti.mjs';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { leggiDati } from '../../tools/dati-disco.mjs';
const cart = process.argv[2]; mkdirSync(cart, { recursive: true });
const dati = leggiDati('data'), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), v0 = variabiliIniziali(dich.values());
const { missioni } = missioniDai('data'); const partenze = partenzeAttente('data');
const srv = await servi('dist'), url = `http://127.0.0.1:${srv.address().port}/`;
const browser = await chromium.launch({ executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
const out = { riepilogo: [], privacy: [] };
const F = [[360, 640], [375, 667], [360, 760], [375, 760], [412, 760], [412, 830]];
const COMBO = [];
for (const [w, h] of F) for (const ep of ['e36', 'e22', 'e01']) COMBO.push([w, h, ep, 1]);
for (const [w, h] of [[360, 760], [375, 760], [412, 760]]) for (const n of [2, 3, 4, 5]) if (partenze.find((x) => x.m.id === 'e36' && x.n === n)) COMBO.push([w, h, 'e36', n]);
for (const [w, h, ep, nn] of COMBO) {
  const st = partenze.find((x) => x.m.id === ep && x.n === nn);
  const prec = salvataggioTutti(missioni.filter((x) => x.episodio < st.m.episodio), v0);
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, reducedMotion: 'reduce' }), p = await ctx.newPage();
  const err = []; p.on('console', (x) => { if (x.type() === 'error') err.push(x.text()); }); p.on('pageerror', (e) => err.push(e.message));
  await p.addInitScript(() => { globalThis.__VALMORA_SECONDO_MS = 1; });
  await p.goto(url); await p.evaluate(([k, v]) => localStorage.setItem(k, v), ['valmora-salvataggio', JSON.stringify({ ...prec, in_corso: st.s })]); await p.reload();
  await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForTimeout(300);
  for (let i = 0; i < 12 && !(await p.locator('[data-azione="conferma"]').count()); i++) { const b = p.locator('.scena [data-azione="inizia"], .scena [data-azione="avanti"], .scena [data-azione="continua"], .scena [data-azione="prossimo"], .scena [data-azione="passo"]').first(); if (await b.count()) await b.click(); await p.waitForTimeout(150); }
  let r = null;
  try {
    for (const [ris, per] of Object.entries(st.d)) for (const [sett, n] of Object.entries(per)) for (let k = 0; k < n; k++) {
      if ((await p.getAttribute(`[data-risorsa="${ris}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${ris}"]:not([disabled])`);
      await p.click(`[data-settore="${sett}"] .settore-punto`);
    }
    await p.click('[data-azione="conferma"]'); await p.waitForSelector('[data-riepilogo]'); await p.waitForTimeout(300);
    r = await p.evaluate(() => { const b = document.querySelector('[data-azione="conferma-davvero"]')?.getBoundingClientRect(); const hm = document.querySelector('.tasto-home')?.getBoundingClientRect(); let ov = 0; if (hm) for (const n of document.querySelectorAll('.settore-nome')) { const g = document.createRange(); g.selectNodeContents(n); for (const q of g.getClientRects()) { const a = Math.max(0, Math.min(q.right, hm.right) - Math.max(q.left, hm.left)) * Math.max(0, Math.min(q.bottom, hm.bottom) - Math.max(q.top, hm.top)); ov += a; } } return { home_su_nomi_px2: hm ? Math.round(ov) : 'nessun tasto home', scroll_y: document.documentElement.scrollHeight - innerHeight, orizz: document.documentElement.scrollWidth - innerWidth, conferma_visibile: !!b && b.bottom <= innerHeight && b.top >= 0 }; });
    await p.screenshot({ path: join(cart, `riepilogo-${ep}-o${nn}-${w}x${h}.jpg`), type: 'jpeg', quality: 55 });
  } catch (e) { r = { errore: e.message.split('\n')[0] }; }
  out.riepilogo.push({ w, h, ep, ondata: nn, ...r, errori: err.length }); await ctx.close();
}
// privacy + menu Altro + D-219 home su e36 verbale
for (const w of [360, 375, 412]) for (const h of [640, 667, 760]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, reducedMotion: 'reduce' }), p = await ctx.newPage();
  const err = []; p.on('console', (x) => { if (x.type() === 'error') err.push(x.text()); }); p.on('pageerror', (e) => err.push(e.message));
  await p.goto(url); await p.waitForTimeout(400);
  const m = () => p.evaluate(() => ({ scroll_y: document.documentElement.scrollHeight - innerHeight, orizz: document.documentElement.scrollWidth - innerWidth }));
  const titolo = await m(); await p.screenshot({ path: join(cart, `titolo-${w}x${h}.jpg`), type: 'jpeg', quality: 55 });
  await p.click('[data-azione="altro"]'); await p.waitForTimeout(200);
  const voce = await p.evaluate(() => [...document.querySelectorAll('[data-altro] button')].map((b) => b.innerText.trim()));
  const altro = await m(); await p.screenshot({ path: join(cart, `altro-${w}x${h}.jpg`), type: 'jpeg', quality: 55 });
  await p.click('[data-altro] [data-azione="privacy"]'); await p.waitForTimeout(300);
  const testo = await p.evaluate(() => document.querySelector('[data-privacy-testo]')?.innerText ?? ''); const pr = await m();
  await p.screenshot({ path: join(cart, `privacy-${w}x${h}.jpg`), type: 'jpeg', quality: 55, fullPage: true });
  const chiocciola = (await p.evaluate(() => document.body.innerText)).includes('@');
  await p.click('[data-azione="privacy-indietro"]'); await p.waitForTimeout(200);
  const tornato = await p.locator('[data-azione="altro"], [data-azione="nuova"]').count();
  out.privacy.push({ w, h, voce, titolo, altro, privacy: pr, chiocciola_nel_gioco: chiocciola, tornato_al_titolo: tornato > 0, errori: err.length, testo: w === 360 && h === 760 ? testo : undefined }); await ctx.close();
}
await browser.close(); srv.close();
writeFileSync(join(cart, 'riepilogo.json'), JSON.stringify(out, null, 1));
for (const x of out.riepilogo) console.log(JSON.stringify(x));
for (const x of out.privacy) console.log(JSON.stringify({ ...x, testo: undefined }));
