// C-054 · impressione del giocatore sul morso: la barra FIDUCIA cambia quando la centrale lo annuncia? Gioca e01 con le scelte comode
// (corteo_partito/osserva, presidente/aspetti, troupe/niente) e a ogni cambio di scena registra scena, ondata, valore della barra.
import { servi, apri, scena, testo, passo } from './c054-lib.mjs';
const { srv, url } = await servi('dist'); const { browser, p } = await apri(url, 375, 667, { veloce: true });
await p.waitForTimeout(600); await p.getByRole('button', { name: /NUOVA PARTITA/i }).click(); await p.waitForTimeout(300);
await p.getByRole('button', { name: /IL NUOVO RESPONSABILE/i }).click(); await p.waitForTimeout(300);
if (await scena(p) === 'guida') { await p.click('[data-azione="guida-salta"]'); await p.waitForTimeout(300); }
const COMODE = ['osserva', 'aspetti', 'niente']; const righe = []; let ultimo = '';
for (let g = 0; g < 400; g++) {
  const sc = await scena(p); const bottoni = await p.evaluate(() => [...document.querySelectorAll('button')].map((b) => b.dataset.azione).filter(Boolean));
  if (sc === 'citta' && bottoni.includes('avvia-episodio')) { await p.click('[data-azione="avvia-episodio"]').catch(() => {}); await p.waitForTimeout(200); continue; }
  if (sc === 'citta' && !bottoni.includes('passo')) { await p.waitForTimeout(500); await p.click('[data-episodio="e01"] .settore-punto', { force: true }).catch(() => {}); await p.waitForTimeout(400); continue; }
  const stato = await p.evaluate(() => { const k = Object.keys(localStorage).find((x) => /-salvataggio$/.test(x)); const s = k && JSON.parse(localStorage.getItem(k)); return { ondata: s?.in_corso?.ondata, credito: s?.in_corso?.variabili?.credito, barra: document.body.innerText.match(/(\d+)\s*\/\s*10/)?.[0] ?? null, rapporti: s?.in_corso?.rapporti?.length }; });
  if (sc === 'rapporto' && stato.rapporti >= 2) { await p.waitForTimeout(500); await p.screenshot({ path: `coordination/collaudi/c054/fiducia-rapporto-r${stato.rapporti}-375x667.jpg`, type: 'jpeg', quality: 60 }); console.log('RAPPORTO', stato.rapporti, (await testo(p)).replace(/\n/g, ' / ').slice(0, 500)); }
  const chiave = `${sc}|${stato.ondata}|${stato.barra}|${stato.credito}`; if (chiave !== ultimo) { righe.push({ sc, ...stato, testo: sc === 'chiusura' ? (await testo(p)).replace(/\n/g, ' / ').slice(0, 160) : undefined }); ultimo = chiave; }
  if (sc === 'verbale' || sc === 'rapporto' && stato.rapporti >= 3) break;
  await passo(p, async (opz) => { const ids = await opz.evaluateAll((e) => e.map((x) => x.dataset.opzione)); const i = ids.findIndex((x) => COMODE.includes(x)); await opz.nth(Math.max(0, i)).click(); });
}
for (const r of righe.filter((x) => ['chiusura', 'rapporto', 'tono', 'risposta'].includes(x.sc))) console.log(JSON.stringify(r));
await browser.close(); srv.close();
