// C-049: D-224 · menu «Altro» del titolo a 7 formati, con e senza salvataggio: scorrimento, vignetta/obiettivo/premessa nascosti ad aperto e
// tornati a chiuso, voci per riga, voci toccabili (dentro la finestra, ≥44 px, il punto centrale colpisce davvero la voce).
// Uso: node coordination/sonde/c49-titolo.mjs <cartella-foto>
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { servi } from '../../tools/foto.mjs';
import { leggiDati } from '../../tools/dati-disco.mjs';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { GAME_VERSION } from '../../src/versione.ts';

const cart = process.argv[2]; mkdirSync(cart, { recursive: true });
const dati = leggiDati('data'), v0 = variabiliIniziali(dati['stato.json'].variabili);
const salv = JSON.stringify({ save_version: 2, game_version: GAME_VERSION, seme: 1, caso: 1, variabili: v0, missioni_concluse: ['e01', 'e02'], episodi: {}, genere: 'm', rapporto_aperto: null, in_corso: null });
const srv = await servi('dist'), url = `http://127.0.0.1:${srv.address().port}/`;
const browser = await chromium.launch({ executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
const F = [[360, 640], [375, 640], [412, 640], [375, 667], [360, 760], [375, 760], [412, 760]], out = [];
for (const con of [false, true]) for (const [w, h] of F) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, reducedMotion: 'reduce' }), p = await ctx.newPage();
  const err = []; p.on('console', (x) => { if (x.type() === 'error') err.push(x.text()); }); p.on('pageerror', (e) => err.push(e.message));
  await p.goto(url); if (con) await p.evaluate(([k, v]) => localStorage.setItem(k, v), ['valmora-salvataggio', salv]); await p.reload(); await p.waitForTimeout(500);
  const st = () => p.evaluate(() => { const vis = (s) => { const e = document.querySelector(s); if (!e) return 'assente'; const r = e.getBoundingClientRect(), c = getComputedStyle(e); return c.display !== 'none' && c.visibility !== 'hidden' && r.height > 0; };
    return { scorr: document.documentElement.scrollHeight - innerHeight, scorrX: document.documentElement.scrollWidth - innerWidth, vign: vis('.home-vignetta'), obj: vis('.home-obiettivo'), prem: vis('.home-premessa') }; });
  const chiuso = await st(); await p.screenshot({ path: join(cart, `titolo-chiuso-${con ? 'con' : 'senza'}-${w}x${h}.jpg`), type: 'jpeg', quality: 55 });
  await p.click('.home-tasto-altro'); await p.waitForTimeout(300);
  const aperto = await st(); await p.screenshot({ path: join(cart, `titolo-aperto-${con ? 'con' : 'senza'}-${w}x${h}.jpg`), type: 'jpeg', quality: 55 });
  const voci = await p.evaluate(() => { const innerH = innerHeight, innerW = innerWidth; return [...document.querySelectorAll('.home-altro .pulsante')].map((e) => { const r = e.getBoundingClientRect(), cx = r.x + r.width / 2, cy = r.y + r.height / 2, t = document.elementFromPoint(cx, cy);
      return { t: e.innerText.trim(), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), dentro: r.x >= 0 && r.y >= 0 && r.right <= innerW && r.bottom <= innerH, colpisce: t === e || e.contains(t) }; }); });
  const righe = {}; for (const v of voci) righe[v.y] = (righe[v.y] ?? 0) + 1;
  await p.click('.home-tasto-altro'); await p.waitForTimeout(300); const richiuso = await st();
  out.push({ salvataggio: con, w, h, chiuso, aperto, voci: voci.length, per_riga: Object.values(righe).join('+'), tutte_dentro: voci.every((v) => v.dentro), tutte_colpite: voci.every((v) => v.colpisce), min_alt: Math.min(...voci.map((v) => v.h)), min_larg: Math.min(...voci.map((v) => v.w)), richiuso_ok: richiuso.vign === true && richiuso.obj === true && richiuso.prem === true && richiuso.scorr === chiuso.scorr, errori: err.length });
  await ctx.close();
}
console.log(JSON.stringify(out, null, 1)); await browser.close(); srv.close();
