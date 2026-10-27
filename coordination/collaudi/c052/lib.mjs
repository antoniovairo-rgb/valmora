// C-052 (sola lettura): utilità comuni delle sonde. Server statico su dist/, pagina con salvataggio di prova.
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';
import { servi } from '../../../tools/foto.mjs';
import { salvataggioTutti, missioniDai } from '../../../tools/foto-bozze.mjs';
export const { missioni, v0 } = missioniDai('data');
export const CHIAVE = 'valmora-salvataggio';
export const salvTutti = () => salvataggioTutti(missioni, v0);
export const salvNessuno = () => ({ ...salvataggioTutti(missioni, v0), episodi: {}, missioni_concluse: [] });
export async function avvia() {
  const srv = await servi('dist'); const url = `http://127.0.0.1:${srv.address().port}/`;
  const browser = await chromium.launch({ executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
  return { srv, url, browser, chiudi: async () => { await browser.close(); srv.close(); } };
}
export async function apriCitta(browser, url, w, h, sal, opz = {}) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true, reducedMotion: 'reduce', deviceScaleFactor: 1, ...opz });
  const p = await ctx.newPage(); const err = [];
  p.on('console', (x) => { if (x.type() === 'error') err.push(x.text().slice(0, 200)); }); p.on('pageerror', (e) => err.push(e.message.slice(0, 200)));
  await p.addInitScript(() => { globalThis.__VALMORA_SECONDO_MS = 1; });
  await p.goto(url); await p.evaluate(([k, v]) => localStorage.setItem(k, JSON.stringify(v)), [CHIAVE, sal]); await p.reload();
  await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForSelector('.scena[data-scena="citta"]'); await p.waitForTimeout(400);
  return { ctx, p, err };
}
