// C-054 · nome, completamento: tutte le pagine della guida, crediti, «Altro», scheda «info-ondata»; origine del 404 in console.
import { servi, apri, scena, bottoni } from './c054-lib.mjs';
const { srv, url } = await servi('dist'); const { browser, p } = await apri(url, 375, 667); const RE = /valmor|varcald/i; const r = { pagineGuida: 0, crediti: null, trovati: [], risorse404: [] };
p.on('response', (x) => { if (x.status() === 404) r.risorse404.push(x.url().replace(url, '/')); });
const leggi = () => p.evaluate(() => document.body.innerText + ' || ' + [...document.querySelectorAll('[aria-label],[title],[alt]')].map((e) => `${e.getAttribute('aria-label') ?? ''} ${e.getAttribute('title') ?? ''} ${e.getAttribute('alt') ?? ''}`).join(' | '));
await p.reload(); await p.waitForTimeout(800);
await p.click('[data-azione="guida"]'); await p.waitForTimeout(500);
for (let k = 0; k < 10; k++) { const t = await leggi(); r.pagineGuida++; if (RE.test(t)) r.trovati.push(`guida ${k + 1}`); const av = p.locator('[data-azione="guida-avanti"]'); if (!(await av.count())) break; const testoBtn = await av.innerText(); await av.click(); await p.waitForTimeout(300); if (!(await p.locator('[data-azione="guida-avanti"], [data-azione="guida-salta"]').count())) break; }
await p.reload(); await p.waitForTimeout(800); await p.click('[data-azione="altro"]'); await p.waitForTimeout(400);
await p.click('[data-azione="crediti"]'); await p.waitForTimeout(500); const c = await leggi(); r.crediti = { scena: await scena(p), contieneVecchi: RE.test(c), titoloSezione: c.match(/Chi ha reso possibile[^\n]*/)?.[0] };
console.log(JSON.stringify(r, null, 1)); await browser.close(); srv.close();
