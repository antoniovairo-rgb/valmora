// Collaudo C-016: aiuti comuni alle sonde c16-*.mjs (server locale commutabile fra build, navigazione del gioco,
// piano di gioco dai bot). Solo lettura: non tocca src/ né data/.
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { chromium } from 'playwright-core';
import { leggiDati } from '../../tools/dati-disco.mjs';
import * as M from '../../src/logica/missione.ts';
import { attenta, casuale } from '../../src/logica/bot.ts';
import { creaCaso } from '../../src/logica/caso.ts';

export { M, attenta, casuale, creaCaso };
export const dati = leggiDati();
export const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
export const mis = (id) => dati[`missioni/${id}.json`];
const TIPI = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.webmanifest': 'application/manifest+json' };

/** Server su localhost (contesto sicuro per il service worker); build e rete commutabili. */
export async function server(build) {
  const st = { radice: resolve(build), rete: true, richieste: [] };
  const srv = createServer((q, r) => {
    if (!st.rete) { r.destroy(); return; }
    const u = decodeURIComponent((q.url ?? '/').split('?')[0]);
    st.richieste.push(u);
    const p = join(st.radice, u === '/' ? 'index.html' : u);
    if (!existsSync(p)) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'content-type': TIPI[extname(p)] ?? 'application/octet-stream', 'cache-control': 'no-store' }); r.end(readFileSync(p));
  });
  await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
  st.url = `http://localhost:${srv.address().port}/`;
  st.chiudi = () => srv.close();
  return st;
}

export const browser = () => chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

export async function contesto(b, larg = 360, alt = 760) {
  const ctx = await b.newContext({ viewport: { width: larg, height: alt }, hasTouch: true, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  p.errori = [];
  p.on('pageerror', (e) => p.errori.push(e.message.slice(0, 160)));
  p.on('console', (x) => { if (x.type() === 'error') p.errori.push(`console: ${x.text().slice(0, 160)}`); });
  return { ctx, p };
}

export const sc = (p, n, timeout = 8000) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout });
export const quale = (p) => p.evaluate(() => document.querySelector('.scena')?.dataset.scena ?? (document.querySelector('[data-errore-carica]') ? 'ERRORE-CARICA' : `nessuna scena, ${document.body.innerText.length} caratteri`));
export const salvato = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('valmora-salvataggio') ?? 'null'));
export const testo = (p) => p.evaluate(() => document.body.innerText);

/** Home → Nuova partita (con le tre conferme se serve) → genere. Restituisce la scena dopo il genere. */
export async function nuova(p, gen = 'm') {
  await p.getByRole('button', { name: 'Nuova partita' }).click(); await p.waitForTimeout(300);
  if ((await quale(p)) === 'conferma') { while (await p.locator('[data-azione="conferma-passo"]').count()) await p.click('[data-azione="conferma-passo"]'); await p.click('[data-azione="conferma-nuova"]'); }
  await sc(p, 'genere'); await p.click(`[data-genere="${gen}"]`);
  await p.waitForFunction(() => ['guida', 'citta'].includes(document.querySelector('.scena')?.dataset.scena) || document.querySelector('[data-errore-carica]'), null, { timeout: 8000 }).catch(() => {});
  return quale(p);
}

export async function allaPrimaOndata(p) {
  await p.click('[data-azione="avvia-episodio"]'); await sc(p, 'sala');
  while (await p.locator('[data-azione="passo"]').count()) { await p.click('[data-azione="passo"]'); await p.waitForTimeout(40); }
  await p.click('[data-azione="avanti"]'); await sc(p, 'briefing');
  while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) { await p.click('[data-azione="prossimo"], [data-azione="passo"]'); await p.waitForTimeout(40); }
  await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento');
}

/** Piano di gioco da uno stato: per ogni ondata disposizione e risposte. */
export function piano(m, s, g) {
  const ond = [];
  while (!M.missioneFinita(m, s)) {
    const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = [];
    for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); rs.push([c.id, o]); s = M.rispondi(m, s, c.id, o, dich); }
    ond.push({ d, rs }); s = M.chiudiOndata(m, s, dich);
  }
  return { ond, s, r: M.concludiMissione(m, s, dich) };
}

export async function schiera(p, d) {
  for (const [r, ps] of Object.entries(d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) {
    if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`);
    await p.click(`[data-settore="${s}"] .settore-punto`);
  }
}

/** Gioca un'ondata dalla schermata di schieramento fino al rapporto compreso; poi «avanti». */
export async function ondata(p, o) {
  await sc(p, 'schieramento');
  await schiera(p, o.d); await p.click('[data-azione="conferma"]');
  if (await p.locator('[data-azione="conferma-davvero"]').count()) await p.click('[data-azione="conferma-davvero"]');
  for (const [, op] of o.rs) { await sc(p, 'chiamata'); await p.click(`[data-opzione="${op}"]`); await p.waitForTimeout(250); if (await p.locator('[data-azione="continua"]').count()) await p.click('[data-azione="continua"]'); }
  await sc(p, 'chiusura'); await p.click('[data-azione="rapporto"]'); await sc(p, 'rapporto');
  while (await p.locator('[data-azione="passo"]').count()) { await p.click('[data-azione="passo"]'); await p.waitForTimeout(40); }
  await p.click('[data-azione="avanti"]');
}

/** Misure di usabilità della pagina (come coordination/sonde/rev-schermate.mjs). */
export const misura = (p) => p.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0' && !e.closest('[hidden]'); };
  const foglie = [...document.querySelectorAll('body *')].filter((e) => vis(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && !e.closest('.mappa-tela'));
  const font = Math.min(...foglie.map((e) => parseFloat(getComputedStyle(e).fontSize)));
  const piccoli = [...document.querySelectorAll('button, a, [role=button]')].filter(vis).map((e) => ({ e, r: e.getBoundingClientRect() })).filter(({ r }) => r.width < 44 || r.height < 44).map(({ e, r }) => `${(e.textContent || e.getAttribute('aria-label') || e.className).trim().slice(0, 18)} ${Math.round(r.width)}×${Math.round(r.height)}`);
  const tagliati = foglie.filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible').map((e) => e.textContent.trim().slice(0, 30));
  const R = foglie.map((e) => ({ e, r: e.getBoundingClientRect() })); const sov = [];
  for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) { const a = R[i], b = R[j]; if (a.e.contains(b.e) || b.e.contains(a.e)) continue;
    const ov = Math.max(0, Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left)) * Math.max(0, Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top));
    if (ov > 40) sov.push(`«${a.e.textContent.trim().slice(0, 14)}» × «${b.e.textContent.trim().slice(0, 14)}» ${Math.round(ov)}px²`); }
  const s = document.scrollingElement;
  const fuori = [...document.querySelectorAll('button')].filter(vis).filter((e) => e.getBoundingClientRect().bottom > innerHeight).map((e) => e.textContent.trim().slice(0, 20));
  return { verticale: s.scrollHeight - innerHeight, orizzontale: s.scrollWidth - s.clientWidth, font, piccoli: piccoli.slice(0, 6), tagliati: tagliati.slice(0, 4), sov: sov.slice(0, 6), pulsantiSottoLaPiega: fuori };
});
