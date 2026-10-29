// C-054 · nome: nessun «Valmora»/«Varcalda» visibile in nessuna schermata (testo, aria-label, title, alt) giocando e01 a 375×667,
// più titolo, privacy e manifesto. Uso: node c054-nome.mjs <cartella-foto>
import { mkdirSync } from 'node:fs';
import { servi, apri, scena, testo, bottoni, passo } from './c054-lib.mjs';
const cart = process.argv[2]; mkdirSync(cart, { recursive: true });
const RE = /valmor|varcald/i;
const { srv, url } = await servi('dist'); const { browser, p, errori } = await apri(url, 375, 667);
const viste = {}, trovati = [];
const scansiona = async (etichetta) => {
  const r = await p.evaluate(() => ({ testo: document.body.innerText, attr: [...document.querySelectorAll('[aria-label],[title],[alt],[placeholder]')].map((e) => [e.getAttribute('aria-label'), e.getAttribute('title'), e.getAttribute('alt'), e.getAttribute('placeholder')].filter(Boolean).join(' | ')).join(' || '), titolo: document.title }));
  viste[etichetta] = (viste[etichetta] ?? 0) + 1;
  for (const [dove, s] of Object.entries(r)) if (RE.test(s)) trovati.push({ etichetta, dove, estratto: s.match(new RegExp(`.{0,40}(${RE.source}).{0,40}`, 'is'))?.[0] });
  return r.titolo;
};
await p.waitForTimeout(700); const titolo = await scansiona('titolo'); await p.screenshot({ path: `${cart}/nome-titolo-375x667.jpg`, type: 'jpeg', quality: 60 });
// guida («La città e il gioco») e «Altro»
await p.click('[data-azione="guida"]'); await p.waitForTimeout(500);
for (let k = 0; k < 8 && (await scena(p)) === 'guida'; k++) { await scansiona('guida'); if (k === 0) await p.screenshot({ path: `${cart}/nome-guida-375x667.jpg`, type: 'jpeg', quality: 60 }); const av = p.locator('[data-azione="guida-avanti"]'); if (!(await av.count())) break; await av.click().catch(() => {}); await p.waitForTimeout(250); }
if ((await scena(p)) === 'guida') await p.click('[data-azione="guida-salta"]').catch(() => {});
await p.reload(); await p.waitForTimeout(800);
await p.click('[data-azione="altro"]'); await p.waitForTimeout(500); await scansiona('altro'); await p.screenshot({ path: `${cart}/nome-altro-375x667.jpg`, type: 'jpeg', quality: 60 });
const altro = await bottoni(p);
// partita nuova, e01 intero
await p.reload(); await p.waitForTimeout(600); await p.getByRole('button', { name: /NUOVA PARTITA/i }).click(); await p.waitForTimeout(300); await scansiona('genere');
await p.getByRole('button', { name: /IL NUOVO RESPONSABILE/i }).click(); await p.waitForTimeout(300);
if ((await scena(p)) === 'guida') { await scansiona('guida'); await p.click('[data-azione="guida-salta"]'); await p.waitForTimeout(300); }
for (let g = 0; g < 400; g++) {
  const sc = await scena(p), b = await bottoni(p); await scansiona(sc ?? 'null');
  if (sc === 'citta' && b.includes('azione=avvia-episodio')) { await p.click('[data-azione="avvia-episodio"]').catch(() => {}); await p.waitForTimeout(200); continue; }
  if (sc === 'citta' && !b.includes('azione=passo')) { await p.waitForTimeout(500); await p.click('[data-episodio="e01"] .settore-punto', { force: true }).catch(() => {}); await p.waitForTimeout(400); continue; }
  if (sc === 'verbale') { for (const t of ['avanti']) { for (let k = 0; k < 6; k++) { await scansiona('verbale'); const a = p.locator('[data-azione="passo"], [data-azione="avanti"]').first(); if (!(await a.count())) break; await a.click().catch(() => {}); await p.waitForTimeout(300); } } break; }
  await passo(p);
}
// privacy e manifesto
const base = new URL(url);
await p.goto(new URL('privacy/', base).href); await p.waitForTimeout(500); const tp = await scansiona('privacy'); await p.screenshot({ path: `${cart}/nome-privacy-375x667.jpg`, type: 'jpeg', quality: 60 });
const man = await (await p.request.get(new URL('manifest.webmanifest', base).href)).text();
console.log(JSON.stringify({ titoloPagina: titolo, titoloPrivacy: tp, scenePercorse: viste, occorrenzeVisibili: trovati, bottoniAltro: altro, manifestoContieneVecchi: RE.test(man), errori }, null, 1));
await browser.close(); srv.close();
