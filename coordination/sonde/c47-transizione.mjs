// C-047: altezza del documento nel passaggio rapporto -> schieramento (sospetto: 899-1003 px letti a scena «rapporto» nel giro a mano).
// Stato: e02, bot attento, fine dell'ondata 1 (chiudiOndata). Campiona scrollHeight ogni 50 ms per 4 s dopo il tocco su «Prossima ondata».
// Uso: npx vite build && node coordination/sonde/c47-transizione.mjs
import { existsSync } from 'node:fs';
import { chromium } from 'playwright-core';
import { servi } from '../../tools/foto.mjs';
import { salvataggioTutti, missioniDai } from '../../tools/foto-bozze.mjs';
import { leggiDati } from '../../tools/dati-disco.mjs';
import { attenta } from '../../src/logica/bot.ts';
import { creaCaso } from '../../src/logica/caso.ts';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { iniziaMissione, schiera, chiamateAperte, rispondi, chiudiOndata } from '../../src/logica/missione.ts';
const dati = leggiDati('data'), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), v0 = variabiliIniziali(dich.values());
const { missioni } = missioniDai('data'); const m = missioni.find((x) => x.id === 'e02');
const g = attenta(creaCaso(1), dich); let s = iniziaMissione(m, v0, dich); s = schiera(m, s, g.schiera(m, s));
for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = rispondi(m, s, c.id, g.scegli(m, s, c), dich);
s = chiudiOndata(m, s, dich);
const salv = JSON.stringify({ ...salvataggioTutti(missioni.filter((x) => x.episodio < 2), v0), in_corso: s });
const srv = await servi('dist'), url = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
for (const ridotto of ['reduce', 'no-preference']) {
  const p = await (await b.newContext({ viewport: { width: 360, height: 760 }, hasTouch: true, reducedMotion: ridotto })).newPage();
  await p.addInitScript(() => { globalThis.__VALMORA_SECONDO_MS = 1; });
  await p.goto(url); await p.evaluate(([k, v]) => localStorage.setItem(k, v), ['valmora-salvataggio', salv]); await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForTimeout(1200);
  const prima = await p.evaluate(() => ({ scena: document.querySelector('.scena')?.dataset.scena, sh: document.documentElement.scrollHeight }));
  const bt = p.locator('.scena button:has-text("Prossima ondata"), .scena [data-azione="avanti"]').first();
  const camp = []; if (await bt.count()) { await bt.click({ timeout: 3000 }).catch((e) => camp.push('click: ' + e.message.split('\n')[0])); }
  for (let i = 0; i < 80; i++) { camp.push(await p.evaluate(() => `${document.querySelector('.scena')?.dataset.scena}:${document.documentElement.scrollHeight}:${document.querySelectorAll('.scena').length}`)); await p.waitForTimeout(50); }
  const distinti = [...new Set(camp)]; console.log(JSON.stringify({ movimento: ridotto, prima, campioni: camp.length, distinti }));
}
await b.close(); srv.close();
