// PO-140 fase 1: foto prima (home vera) e dopo (proposte A, B, C) a 360, 375 e 412 px × 760 (telefono di riferimento,
// PO-045), più la misura della scritta della versione: sovrapposizioni con testi e pulsanti, distanza dal bordo.
// Uso: node coordination/handoffs/sviluppatrice/home/proposte/foto.mjs
import { createServer } from 'vite';
import { chromium } from 'playwright-core';
import { resolve } from 'node:path';

const qui = resolve('coordination/handoffs/sviluppatrice/home');
const server = await createServer({ server: { port: 5199, strictPort: true }, logLevel: 'error' });
await server.listen();
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const sal = { save_version: 2, game_version: '0', seme: 1, caso: 1, variabili: {}, missioni_concluse: [], episodi: {}, genere: 'm', rapporto_aperto: null, in_corso: null };
const misure = [];
const casi = [['prima', '/'], ['A', '/coordination/handoffs/sviluppatrice/home/proposte/index.html?v=A'],
  ['B', '/coordination/handoffs/sviluppatrice/home/proposte/index.html?v=B'], ['C', '/coordination/handoffs/sviluppatrice/home/proposte/index.html?v=C']];
for (const [nome, url] of casi) for (const w of [360, 375, 412]) {
  const p = await browser.newPage({ viewport: { width: w, height: 760 }, deviceScaleFactor: 2 });
  const errori = []; p.on('pageerror', (e) => errori.push(String(e)));
  if (nome === 'prima') { await p.goto('http://localhost:5199/'); await p.evaluate((s) => localStorage.setItem('valmora-salvataggio', s), JSON.stringify(sal)); }
  await p.goto(`http://localhost:5199${url}`); await p.waitForTimeout(1500); await p.evaluate(() => document.fonts.ready);
  const m = await p.evaluate(() => {
    const ver = document.querySelector('[data-versione-angolo]')?.getBoundingClientRect();
    const cose = [...document.querySelectorAll('button, a, p, h1, h2, .p-sotto, .logo-sotto, svg.vignetta')].filter((e) => !e.closest('.p-b-mappa')).map((e) => e.getBoundingClientRect());
    const tocca = ver ? cose.filter((r) => r.left < ver.right && r.right > ver.left && r.top < ver.bottom && r.bottom > ver.top).length : -1;
    const fondo = Math.max(...[...document.querySelectorAll('button, p')].map((e) => e.getBoundingClientRect().bottom));
    return { ver: ver && { x: Math.round(ver.left), y: Math.round(ver.top), l: Math.round(ver.width), a: Math.round(ver.height) }, tocca, fondo: Math.round(fondo), alta: document.documentElement.scrollHeight, larga: document.documentElement.scrollWidth };
  });
  // in fondo alla pagina: la versione è fissa (position: fixed), quindi si misura anche dopo lo scorrimento
  await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  const giu = await p.evaluate(() => { const ver = document.querySelector('[data-versione-angolo]')?.getBoundingClientRect();
    return ver ? [...document.querySelectorAll('button, a, p, h1, h2')].filter((e) => !e.closest('.p-b-mappa')).map((e) => e.getBoundingClientRect())
      .filter((r) => r.left < ver.right && r.right > ver.left && r.top < ver.bottom && r.bottom > ver.top).length : -1; });
  await p.evaluate(() => scrollTo(0, 0));
  misure.push({ nome, w, ...m, toccaInFondo: giu, errori: errori.length });
  await p.screenshot({ path: `${qui}/${nome === 'prima' ? 'prima' : `dopo-${nome}`}-${w}.png`, fullPage: true });
  await p.close();
}
console.table(misure.map((x) => ({ ...x, ver: x.ver ? `${x.ver.x},${x.ver.y} ${x.ver.l}×${x.ver.a}` : '-' })));
await browser.close(); await server.close();
