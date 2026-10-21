// C-047: schermate a 360, 375 e 412 px (altezza 760, dito, movimento ridotto): città (con 0 e con 36 episodi), guida, imprevisti, verbale.
// Conta anche lo scorrimento di OGNI imprevisto a 360x760 (D-206/D-207: dichiarati max 331, mediana 278).
// Uso: npx vite build && node coordination/sonde/c47-schermate.mjs <cartella-foto>
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
import { GAME_VERSION } from '../../src/versione.ts';

const cart = process.argv[2]; mkdirSync(cart, { recursive: true });
const CH = 'valmora-salvataggio';
const dati = leggiDati('data'), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), v0 = variabiliIniziali(dich.values());
const { missioni } = missioniDai('data');
const partenze = partenzeAttente('data');
const imprevisti = [];
for (const m of missioni) for (const o of m.ondate) for (const c of o.chiamate ?? []) if (c.imprevisto) imprevisti.push([m.id, o.n, c.id]);
function fino(ep, n, id) {
  const st = partenze.find((x) => x.m.id === ep && x.n === n), bot = attenta(creaCaso(1), dich);
  let s = schiera(st.m, st.s, st.d);
  for (let c = chiamateAperte(st.m, s)[0]; c && c.id !== id; c = chiamateAperte(st.m, s)[0]) s = rispondi(st.m, s, c.id, bot.scegli(st.m, s, c), dich);
  if (chiamateAperte(st.m, s)[0]?.id !== id) throw new Error(`${ep}: ${id} non arriva`);
  return JSON.stringify({ ...salvataggioTutti(missioni, v0), in_corso: s });
}
function finita(ep) { // missione conclusa dal bot attento, salvataggio con in_corso = stato finale (per il verbale)
  const m = missioni.find((x) => x.id === ep), g = attenta(creaCaso(1), dich); let s = iniziaMissione(m, v0, dich);
  while (!missioneFinita(m, s)) { s = schiera(m, s, g.schiera(m, s)); for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = rispondi(m, s, c.id, g.scegli(m, s, c), dich); s = chiudiOndata(m, s, dich); }
  return JSON.stringify({ ...salvataggioTutti(missioni.filter((x) => x.episodio < m.episodio), v0), in_corso: s });
}
const srv = await servi('dist'), url = `http://127.0.0.1:${srv.address().port}/`;
const browser = await chromium.launch({ executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
const out = { versione: GAME_VERSION, citta: [], guida: [], imprevisti_foto: [], imprevisti_tutti_360: [], verbale: [] };
async function pagina(w, salv) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 760 }, hasTouch: true, reducedMotion: 'reduce' }), p = await ctx.newPage();
  p.errori = []; p.on('console', (x) => { if (x.type() === 'error') p.errori.push(x.text()); }); p.on('pageerror', (e) => p.errori.push(e.message));
  await p.addInitScript(() => { globalThis.__VALMORA_SECONDO_MS = 1; });
  await p.goto(url); if (salv) { await p.evaluate(([k, v]) => localStorage.setItem(k, v), [CH, salv]); await p.reload(); }
  return [ctx, p];
}
const mis = (p) => p.evaluate(() => ({ scroll_y: document.documentElement.scrollHeight - innerHeight, orizz: document.documentElement.scrollWidth - innerWidth }));
const tutti = salvataggioTutti(missioni, v0);
try {
  for (const w of [360, 375, 412]) {
    // città con 36 episodi, tre stagioni; e con partita nuova (1 episodio da giocare)
    for (const [nome, salv] of [['36ep', JSON.stringify(tutti)], ['0ep', JSON.stringify({ ...tutti, missioni_concluse: [], episodi: {} })]]) {
      const [ctx, p] = await pagina(w, salv); await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForSelector('[data-scena="citta"], .scena[data-scena="citta"]', { timeout: 8000 }).catch(() => {}); await p.waitForTimeout(600);
      for (const s of [1, 2, 3]) { const b = p.locator(`[data-stagione="${s}"]`); if (await b.count()) { await b.click(); await p.waitForTimeout(300); } out.citta.push({ w, nome, stagione: s, ...await mis(p) }); if (s === 1 || s === 3) await p.screenshot({ path: join(cart, `citta-${nome}-s${s}-${w}.jpg`), type: 'jpeg', quality: 55 }); }
      out.citta.push({ w, nome, errori: p.errori.length }); await ctx.close();
    }
    // guida: vignetta della home + ogni passo
    { const [ctx, p] = await pagina(w, JSON.stringify(tutti)); await p.waitForTimeout(500);
      out.guida.push({ w, passo: 'home', ...await mis(p) }); await p.screenshot({ path: join(cart, `home-${w}.jpg`), type: 'jpeg', quality: 55 });
      await p.getByRole('button', { name: /La città e il gioco/i }).click(); await p.waitForTimeout(500);
      for (let i = 0; i < 12; i++) {
        out.guida.push({ w, passo: i, ...await mis(p), testo: (await p.locator('.scena').first().innerText()).replace(/\n+/g, ' | ').slice(0, 160) });
        if (i < 2) await p.screenshot({ path: join(cart, `guida-${i}-${w}.jpg`), type: 'jpeg', quality: 55 });
        const nx = p.locator('.scena [data-azione="avanti"], .scena [data-azione="passo"], .scena [data-azione="prossimo"]').first(); if (!(await nx.count()) || !(await nx.isVisible())) break; await nx.click(); await p.waitForTimeout(250);
      }
      out.guida.push({ w, errori: p.errori.length }); await ctx.close(); }
    // imprevisti con foto: 3 casi
    for (const [ep, n, id] of [['e01', 1, 'imp_ambulanza'], ['e17', 4, 'imp_lampioni'], ['e30', 2, 'imp_mercatino']]) {
      const [ctx, p] = await pagina(w, fino(ep, n, id)); await p.getByRole('button', { name: 'Riprendi' }).click();
      await p.waitForSelector(`[data-messaggio="chiamata-${id}"]`, { timeout: 15000 }); await p.waitForTimeout(700);
      const x = await p.evaluate(() => ({ vignetta: !!document.querySelector('.messaggio.imprevisto .vignetta, .vignetta-chiamata'), riga: /Imprevisto/i.test(document.querySelector('.scena')?.innerText ?? '') }));
      out.imprevisti_foto.push({ w, ep, id, ...x, ...await mis(p), errori: p.errori.length });
      await p.screenshot({ path: join(cart, `imprevisto-${ep}-${id}-${w}.jpg`), type: 'jpeg', quality: 55 }); await ctx.close();
    }
    // verbale
    for (const ep of ['e03', 'e05']) {
      const [ctx, p] = await pagina(w, finita(ep)); await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForTimeout(1200);
      for (let i = 0; i < 6; i++) {
        const sc = await p.getAttribute('.scena', 'data-scena').catch(() => null);
        out.verbale.push({ w, ep, passo: i, scena: sc, ...await mis(p), testo: (await p.locator('.scena').first().innerText().catch(() => '')).replace(/\n+/g, ' | ').slice(0, 140) });
        await p.screenshot({ path: join(cart, `${sc}-${ep}-${i}-${w}.jpg`), type: 'jpeg', quality: 55 });
        const nx = p.locator('.scena [data-azione="rapporto"], .scena [data-azione="avanti"], .scena [data-azione="passo"]').first(); if (!(await nx.count())) break; await nx.click({ timeout: 2000 }).catch(() => {}); await p.waitForTimeout(400);
      }
      out.verbale.push({ w, ep, errori: p.errori.length }); await ctx.close();
    }
  }
  // tutti gli imprevisti a 360x760
  const [ctx, p] = await pagina(360, null);
  for (const [ep, n, id] of imprevisti) {
    try {
      await p.evaluate(([k, v]) => localStorage.setItem(k, v), [CH, fino(ep, n, id)]); await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click();
      await p.waitForSelector(`[data-messaggio="chiamata-${id}"]`, { timeout: 15000 }); await p.waitForTimeout(500);
      out.imprevisti_tutti_360.push({ ep, n, id, ...await mis(p) });
    } catch (e) { out.imprevisti_tutti_360.push({ ep, n, id, errore: e.message.split('\n')[0] }); }
  }
  out.errori_sweep = p.errori.length; await ctx.close();
} finally { await browser.close(); srv.close(); }
writeFileSync(join(cart, 'schermate.json'), JSON.stringify(out, null, 1));
const sc = out.imprevisti_tutti_360.filter((x) => x.scroll_y !== undefined).map((x) => x.scroll_y).sort((a, b) => a - b);
console.log(`imprevisti misurati ${sc.length}/${imprevisti.length}; scroll min ${sc[0]} mediana ${sc[Math.floor(sc.length / 2)]} max ${sc.at(-1)}; con orizzontale>0: ${out.imprevisti_tutti_360.filter((x) => x.orizz > 0).length}; errori ${out.imprevisti_tutti_360.filter((x) => x.errore).length}`);
