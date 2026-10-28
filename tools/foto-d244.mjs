// D-244 (PO-153): foto di titolo, città e privacy a 360×760 dalla build in dist/, per il prima/dopo del nome.
// Uso: node tools/foto-d244.mjs <cartella>
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';
import { servi } from './foto.mjs';

const cartella = process.argv[2] ?? 'out/foto-d244';
mkdirSync(cartella, { recursive: true });
const srv = await servi('dist'), url = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: process.env.VALMORA_CHROME ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined) });
try {
  const p = await b.newPage({ viewport: { width: 360, height: 760 }, reducedMotion: 'reduce' });
  const scena = (n) => p.waitForFunction((x) => document.querySelector(`.scena[data-scena="${x}"]`) && document.querySelectorAll('.scena').length === 1 && getComputedStyle(document.querySelector('.scena')).opacity === '1', n, { timeout: 15000 });
  const foto = async (n) => { await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400); await p.screenshot({ path: join(cartella, `360-${n}.png`), fullPage: true }); };
  await p.goto(url); await p.evaluate(() => localStorage.clear()); await p.reload(); await scena('titolo'); await foto('titolo');
  await p.getByRole('button', { name: 'Nuova partita' }).click(); await scena('genere'); await p.click('[data-genere="m"]');
  await scena('guida'); await p.click('[data-azione="guida-salta"]'); await scena('citta');
  await p.waitForFunction(() => [...document.querySelectorAll('.mappa')].every((y) => y.dataset.pronta === 'si'), null, { timeout: 15000 }).catch(() => {});
  await foto('citta');
  await p.goto(`${url}privacy/index.html`); await p.waitForLoadState('load'); await foto('privacy');
  console.log(`foto in ${cartella}: titolo (${await p.title()}), citta, privacy`);
} finally { await b.close(); srv.close(); }
