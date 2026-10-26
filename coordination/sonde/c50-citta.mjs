// C-050: città con 36 episodi, 3 stagioni × 7 formati × ogni episodio scelto (clic sul punto): scorrimento V/O, testata visibile?, tasti stagione.
// Uso: node coordination/sonde/c50-citta.mjs <cartella>
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { servi } from '../../tools/foto.mjs';
import { salvataggioTutti, missioniDai } from '../../tools/foto-bozze.mjs';
import { leggiDati } from '../../tools/dati-disco.mjs';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
const cart = process.argv[2]; mkdirSync(cart, { recursive: true });
const dati = leggiDati('data'), v0 = variabiliIniziali(dati['stato.json'].variabili), { missioni } = missioniDai('data');
const salv = JSON.stringify(salvataggioTutti(missioni, v0));
const srv = await servi('dist'), url = `http://127.0.0.1:${srv.address().port}/`;
const browser = await chromium.launch({ executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
const out = [];
for (const [w, h] of [[360, 640], [375, 640], [412, 640], [375, 667], [360, 760], [375, 760], [412, 760]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, reducedMotion: 'reduce' }), p = await ctx.newPage();
  const err = []; p.on('console', (x) => { if (x.type() === 'error') err.push(x.text()); }); p.on('pageerror', (e) => err.push(e.message));
  await p.addInitScript(() => { globalThis.__VALMORA_SECONDO_MS = 1; });
  await p.goto(url); await p.evaluate(([k, v]) => localStorage.setItem(k, v), ['valmora-salvataggio', salv]); await p.reload();
  await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForSelector('.scena[data-scena="citta"]'); await p.waitForTimeout(500);
  for (const s of [1, 2, 3]) {
    await p.locator(`[data-stagione="${s}"]`).click(); await p.waitForTimeout(250);
    const eps = await p.locator('[data-episodio]').evaluateAll((l) => l.map((e) => e.dataset.episodio));
    const mis = () => p.evaluate(() => { const t = document.querySelector('.citta-testata, .scena h1, .scena h2'); const r = t?.getBoundingClientRect(); const tasti = [...document.querySelectorAll('[data-stagione]')].map((e) => ({ s: e.dataset.stagione, t: e.innerText.replace(/\s+/g, ' ').trim(), att: e.getAttribute('aria-pressed') ?? e.getAttribute('aria-selected') ?? e.getAttribute('aria-current') ?? e.className }));
      return { y: document.documentElement.scrollHeight - innerHeight, x: document.documentElement.scrollWidth - innerWidth, testata: t ? { t: t.innerText.replace(/\s+/g, ' ').trim().slice(0, 60), vis: r.height > 1 && getComputedStyle(t).visibility !== 'hidden', h: Math.round(r.height) } : null, tasti }; });
    const base = await mis(); await p.screenshot({ path: join(cart, `citta-s${s}-${w}x${h}.jpg`), type: 'jpeg', quality: 55 });
    let max = base.y, maxx = base.x, n = 0, sel = null;
    for (const e of eps) { await p.locator(`[data-episodio="${e}"] .settore-punto`).click({ timeout: 4000 }).catch(() => {}); await p.waitForTimeout(120); const m = await mis(); n++; if (m.y > max) max = m.y; if (m.x > maxx) maxx = m.x; if (e === eps[0] && w === 360 && h === 640) await p.screenshot({ path: join(cart, `citta-s${s}-scelto-${e}-${w}x${h}.jpg`), type: 'jpeg', quality: 55 }); sel ??= m; }
    out.push({ w, h, stagione: s, episodi: eps.length, scelti: n, base_y: base.y, max_y: max, max_x: maxx, testata: base.testata, tasti: base.tasti, errori: err.length });
  }
  await ctx.close();
}
await browser.close(); srv.close(); writeFileSync(join(cart, 'citta.json'), JSON.stringify(out, null, 1));
for (const r of out) console.log(`${r.w}x${r.h} s${r.stagione} ep=${r.episodi} scelti=${r.scelti} base_y=${r.base_y} max_y=${r.max_y} max_x=${r.max_x} testata=${JSON.stringify(r.testata)} err=${r.errori}`);
console.log(JSON.stringify(out[0].tasti));
