// PO-145 (D-217): foto e misure della home e della schermata «Privacy» a 360/375/412.
// Per ogni larghezza: guardiano della home (tools/foto-home.mjs: niente scorrimento a 760, menu «Altro»), poi
// «Altro» → «Privacy»: testo visibile, nessuna richiesta di rete fuori dal server locale, «Torna al titolo» riporta alla home.
// Uso: node tools/foto-privacy.mjs [build] [cartella-foto]   (predefinite: dist, out/privacy). Esce 1 se c'è un rosso.
// VALMORA_ROSSI=C145H01 accende il rosso della voce in home.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { servi } from './foto.mjs';
import { apriAltro, controllaHomeA } from './foto-home.mjs';

export async function giraPrivacy(build = 'dist', cartella = 'out/privacy', rossi = (process.env.VALMORA_ROSSI ?? '').split(',').filter(Boolean)) {
  mkdirSync(cartella, { recursive: true });
  const srv = await servi(build), url = `http://127.0.0.1:${srv.address().port}/`;
  const browser = await chromium.launch({ executablePath: process.env.VALMORA_CHROME ?? '/opt/pw-browsers/chromium' });
  const problemi = [], misure = [];
  const atteso = (cosa, ok) => { if (!ok) problemi.push(cosa); };
  try {
    for (const w of [360, 375, 412]) {
      const home = await controllaHomeA(browser, url, cartella, atteso, rossi, w);
      const p = await browser.newPage({ viewport: { width: w, height: 760 }, reducedMotion: 'reduce' });
      if (rossi.length) await p.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, rossi);
      const esterne = [];
      p.on('request', (r) => { const h = new URL(r.url()).hostname; if (/^https?:/.test(r.url()) && h !== '127.0.0.1') esterne.push(r.url()); });
      await p.goto(url); await p.waitForSelector('main[data-schermata="titolo"]', { timeout: 15000 });
      await apriAltro(p);
      const voce = await p.locator('[data-azione="privacy"]').count();
      atteso(`home ${w}: manca la voce «Privacy» nel menu «Altro» (PO-145)`, voce === 1);
      let m = { voce };
      if (voce) {
        await p.click('[data-azione="privacy"]');
        await p.waitForSelector('main[data-schermata="privacy"] [data-privacy-testo]', { timeout: 5000 });
        await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
        m = { ...m, ...(await p.evaluate(() => ({ paragrafi: document.querySelectorAll('[data-privacy-testo] p').length,
          alta: document.scrollingElement.scrollHeight, larga: document.documentElement.scrollWidth - document.documentElement.clientWidth }))) };
        atteso(`privacy ${w}: ${m.paragrafi} paragrafi`, m.paragrafi > 0);
        atteso(`privacy ${w}: scorre di lato di ${m.larga} px`, m.larga <= 0);
        await p.mouse.move(0, 0); await p.screenshot({ path: join(cartella, `privacy-${w}.png`), fullPage: true });
        await p.click('[data-azione="privacy-indietro"]');
        m.torna = await p.waitForSelector('main[data-schermata="titolo"]', { timeout: 5000 }).then(() => true, () => false);
        atteso(`privacy ${w}: «Torna al titolo» non riporta alla home`, m.torna);
      }
      atteso(`privacy ${w}: richieste esterne ${esterne.join(', ')}`, !esterne.length);
      misure.push({ larghezza: w, home: home.map(({ h, scorre, pagina, vignetta }) => ({ h, scorre, pagina, vignetta })), ...m, esterne: esterne.length });
      await p.close();
    }
  } finally { await browser.close(); srv.close(); }
  return { problemi, misure };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [build = 'dist', cartella = 'out/privacy'] = process.argv.slice(2);
  const r = await giraPrivacy(build, cartella);
  console.log(JSON.stringify(r, null, 1));
  process.exit(r.problemi.length ? 1 : 0);
}
