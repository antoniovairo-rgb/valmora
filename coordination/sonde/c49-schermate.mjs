// C-049: città (36 episodi), tre chiamate di e36 ondata 1 e verbale di e36 a 6 formati (360×640, 375×667, 412×640, 360/375/412×760).
// Misura scorrimento verticale/orizzontale, errori di console, foto. Uso: node coordination/sonde/c49-schermate.mjs <cartella>
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { servi } from '../../tools/foto.mjs';
import { salvataggioTutti, missioniDai } from '../../tools/foto-bozze.mjs';
import { partenzeAttente } from '../../tools/foto-schieramenti.mjs';
import { attenta } from '../../src/logica/bot.ts';
import { creaCaso } from '../../src/logica/caso.ts';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { leggiDati } from '../../tools/dati-disco.mjs';
import { chiamateAperte, rispondi, schiera, chiudiOndata, missioneFinita, iniziaMissione } from '../../src/logica/missione.ts';
const cart = process.argv[2]; mkdirSync(cart, { recursive: true });
const CH = 'valmora-salvataggio';
const dati = leggiDati('data'), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), v0 = variabiliIniziali(dich.values());
const { missioni } = missioniDai('data'), partenze = partenzeAttente('data');
const tutti = salvataggioTutti(missioni, v0);
function chiamataN(ep, n, k) { // stato davanti alla k-esima chiamata (0-based) dell'ondata n; risposte del bot attento
  const st = partenze.find((x) => x.m.id === ep && x.n === n), bot = attenta(creaCaso(1), dich); let s = schiera(st.m, st.s, st.d);
  for (let i = 0; i < k; i++) { const c = chiamateAperte(st.m, s)[0]; s = rispondi(st.m, s, c.id, bot.scegli(st.m, s, c), dich); }
  const c = chiamateAperte(st.m, s)[0]; return [JSON.stringify({ ...tutti, missioni_concluse: tutti.missioni_concluse.filter((x) => x !== ep), in_corso: s }), c.id];
}
function finita(ep) { const m = missioni.find((x) => x.id === ep), g = attenta(creaCaso(1), dich); let s = iniziaMissione(m, v0, dich);
  while (!missioneFinita(m, s)) { s = schiera(m, s, g.schiera(m, s)); for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = rispondi(m, s, c.id, g.scegli(m, s, c), dich); s = chiudiOndata(m, s, dich); }
  return JSON.stringify({ ...salvataggioTutti(missioni.filter((x) => x.episodio < m.episodio), v0), in_corso: s }); }
const srv = await servi('dist'), url = `http://127.0.0.1:${srv.address().port}/`;
const browser = await chromium.launch({ executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
const out = [];
async function pagina(w, h, salv) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, reducedMotion: 'reduce' }), p = await ctx.newPage();
  p.errori = []; p.on('console', (x) => { if (x.type() === 'error') p.errori.push(x.text()); }); p.on('pageerror', (e) => p.errori.push(e.message));
  await p.addInitScript(() => { globalThis.__VALMORA_SECONDO_MS = 1; });
  await p.goto(url); await p.evaluate(([k, v]) => localStorage.setItem(k, v), [CH, salv]); await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click(); return [ctx, p];
}
const mis = (p) => p.evaluate(() => ({ scroll_y: document.documentElement.scrollHeight - innerHeight, orizz: document.documentElement.scrollWidth - innerWidth, cta: [...document.querySelectorAll('[data-opzione],[data-azione="avanti"],[data-azione="passo"],[data-azione="continua"]')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.bottom > innerHeight; }).length }));
for (const [w, h] of [[360, 640], [375, 667], [412, 640], [360, 760], [375, 760], [412, 760]]) {
  { const [ctx, p] = await pagina(w, h, JSON.stringify(tutti)); await p.waitForTimeout(800);
    for (const s of [1, 3]) { await p.locator(`[data-stagione="${s}"]`).click(); await p.waitForTimeout(300); out.push({ w, h, schermata: `città-s${s}`, ...await mis(p), errori: p.errori.length }); await p.screenshot({ path: join(cart, `citta-s${s}-${w}x${h}.jpg`), type: 'jpeg', quality: 55 }); } await ctx.close(); }
  for (const k of [0, 1, 2]) { const [salv, id] = chiamataN('e36', 1, k), [ctx, p] = await pagina(w, h, salv);
    await p.waitForSelector(`[data-messaggio="chiamata-${id}"]`, { timeout: 15000 }); await p.waitForTimeout(500);
    out.push({ w, h, schermata: `chiamata-e36-o1-${k + 1}:${id}`, ...await mis(p), errori: p.errori.length }); await p.screenshot({ path: join(cart, `chiamata-${k + 1}-${id}-${w}x${h}.jpg`), type: 'jpeg', quality: 55 }); await ctx.close(); }
  { const [ctx, p] = await pagina(w, h, finita('e36')); await p.waitForTimeout(1200);
    for (let i = 0; i < 8; i++) { const sc = await p.getAttribute('.scena', 'data-scena').catch(() => null);
      out.push({ w, h, schermata: `${sc}-${i}`, ...await mis(p), errori: p.errori.length, testo: (await p.locator('.scena').first().innerText().catch(() => '')).replace(/\n+/g, ' | ').slice(0, 200) });
      if (i < 4) await p.screenshot({ path: join(cart, `${sc}-e36-${i}-${w}x${h}.jpg`), type: 'jpeg', quality: 55 });
      const nx = p.locator('.scena [data-azione="rapporto"], .scena [data-azione="avanti"], .scena [data-azione="passo"]').first(); if (!(await nx.count())) break; await nx.click({ timeout: 2000 }).catch(() => {}); await p.waitForTimeout(400); }
    await ctx.close(); }
}
await browser.close(); srv.close(); writeFileSync(join(cart, 'schermate.json'), JSON.stringify(out, null, 1));
for (const r of out) console.log(`${r.w}x${r.h} ${r.schermata} y=${r.scroll_y} x=${r.orizz} cta_sotto=${r.cta} err=${r.errori}${r.testo ? ' · ' + r.testo.slice(0, 90) : ''}`);
