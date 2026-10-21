// C-048 (C47-03): nella città con 36 episodi concluse, area (px²) in cui le stelle di un episodio coprono il disco di un altro,
// e dischi sovrapposti fra loro; per stagione e formato. Uso: node coordination/sonde/c48-citta.mjs <cartella-foto>
import { existsSync, mkdirSync } from 'node:fs'; import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { servi } from '../../tools/foto.mjs';
import { salvataggioTutti, missioniDai } from '../../tools/foto-bozze.mjs';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { leggiDati } from '../../tools/dati-disco.mjs';
const cart = process.argv[2]; mkdirSync(cart, { recursive: true });
const dati = leggiDati('data'), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), v0 = variabiliIniziali(dich.values());
const { missioni } = missioniDai('data'); const tutti = salvataggioTutti(missioni, v0);
const srv = await servi('dist'), url = `http://127.0.0.1:${srv.address().port}/`;
const br = await chromium.launch({ executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
for (const [w, h] of [[360, 640], [360, 760], [375, 667], [375, 760], [412, 760]]) {
  const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: true, reducedMotion: 'reduce' }), p = await ctx.newPage(); const err = [];
  p.on('console', (x) => x.type() === 'error' && err.push(x.text())); p.on('pageerror', (e) => err.push(e.message));
  await p.goto(url); await p.evaluate(([k, v]) => localStorage.setItem(k, v), ['valmora-salvataggio', JSON.stringify(tutti)]); await p.reload();
  await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForSelector('[data-scena="citta"]'); await p.waitForTimeout(500);
  for (const s of [1, 2, 3]) {
    await p.click(`[data-stagione="${s}"]`); await p.waitForTimeout(300);
    const r = await p.evaluate(() => {
      const a = (x, y) => Math.max(0, Math.min(x.right, y.right) - Math.max(x.left, y.left)) * Math.max(0, Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top));
      const ep = [...document.querySelectorAll('[data-episodio]')]; let stelle = 0, dischi = 0, nst = 0;
      for (const e of ep) { const st = e.querySelector('.stelle')?.getBoundingClientRect(); if (st) nst++; for (const f of ep) if (f !== e) { if (st) stelle += a(st, f.querySelector('.settore-punto').getBoundingClientRect()); if (e.compareDocumentPosition(f) & 4) dischi += a(e.querySelector('.settore-punto').getBoundingClientRect(), f.querySelector('.settore-punto').getBoundingClientRect()); } }
      return { episodi: ep.length, con_stelle: nst, stelle_su_dischi_px2: Math.round(stelle), dischi_sovrapposti_px2: Math.round(dischi), scroll_y: document.documentElement.scrollHeight - innerHeight };
    });
    console.log(JSON.stringify({ w, h, stagione: s, ...r, errori: err.length }));
    if (h === 760 || h === 667) await p.screenshot({ path: join(cart, `citta36-s${s}-${w}x${h}.jpg`), type: 'jpeg', quality: 55 });
  }
  await ctx.close();
}
await br.close(); srv.close();
