import { chromium } from 'playwright-core';
import { servi } from './foto.mjs';
import { leggiDati } from './dati-disco.mjs';
import { salvataggioTutti } from './foto-bozze.mjs';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { GAME_VERSION } from '../src/versione.ts';
const dati = leggiDati('data'), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), v0 = variabiliIniziali(dich.values());
const ms = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x);
const zero = JSON.stringify({ save_version: 2, game_version: GAME_VERSION, seme: 1, caso: 1, variabili: v0, missioni_concluse: [], episodi: {}, genere: 'm', rapporto_aperto: null, in_corso: null });
const tutti = JSON.stringify({ ...salvataggioTutti(ms, v0), in_corso: null, rapporto_aperto: null });
const srv = await servi('dist'), url = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: process.env.VALMORA_CHROME }); const F = process.env.FOTO;
for (const [w, h] of [[360, 760], [375, 760], [412, 760], [360, 640], [375, 667]]) for (const [nome, sal] of [['0', zero], ['36', tutti]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  await p.goto(url); await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), sal); await p.reload(); await p.waitForSelector('[data-home-vignetta]');
  await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForSelector('main[data-schermata="citta"]'); await p.waitForTimeout(900);
  const x = await p.evaluate(() => { const r = (s) => document.querySelector(s)?.getBoundingClientRect(); return { sc: document.scrollingElement.scrollHeight - innerHeight, st: Math.round(r('[data-citta-striscia]')?.height ?? 0), mappa: Math.round(r('.mappa.citta').height), gap: r('[data-citta-striscia]') ? Math.round(r('[data-stagioni]').top - r('[data-citta-striscia]').bottom) : '-' }; });
  console.log(`città ${w}x${h} salv ${nome}: scorre ${x.sc} (striscia ${x.st}, mappa ${x.mappa}, spazio ${x.gap})`);
  if (F && h === 760) await p.screenshot({ path: `${F}/dopo-citta${nome}-${w}x${h}.png`, fullPage: true });
  await p.close(); }
for (const [w, h] of [[360, 760], [375, 760], [412, 760], [360, 640]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  await p.goto(url); await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), zero); await p.reload(); await p.waitForSelector('[data-home-vignetta]');
  await p.click('[data-azione="guida"]'); await p.waitForSelector('[data-guida="1"]'); await p.waitForTimeout(800);
  const x = await p.evaluate(() => ({ sc: document.scrollingElement.scrollHeight - innerHeight, h: Math.round(document.querySelector('[data-guida-testata]')?.getBoundingClientRect().height ?? 0) }));
  console.log(`guida 1 ${w}x${h}: scorre ${x.sc}, testata ${x.h}`); if (F && h === 760) await p.screenshot({ path: `${F}/dopo-guida-${w}x${h}.png`, fullPage: true }); await p.close(); }
await b.close(); srv.close();
