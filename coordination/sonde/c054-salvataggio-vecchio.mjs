// C-054 · crea un salvataggio VERO con una build storica (0.54.0 / 0.55.0) giocando dall'interfaccia fino a metà missione,
// poi lo scrive su file. Uso: node c054-salvataggio-vecchio.mjs <dist-vecchia> <uscita.json> [scelte-prima-di-fermarsi=4]
import { writeFileSync } from 'node:fs';
import { servi, apri, scena, testo, bottoni, passo } from './c054-lib.mjs';
const [dist, out, nStop = '4'] = process.argv.slice(2); const OBIETTIVO = process.env.EP ?? 'e01'; // EP=e02: prima si conclude e01 (prima persona: sempre la prima opzione), poi ci si ferma a metà di e02
const { srv, url } = await servi(dist); const { browser, p, errori } = await apri(url, 375, 667);
await p.waitForTimeout(700); await p.getByRole('button', { name: /NUOVA PARTITA/i }).click(); await p.waitForTimeout(400);
const traccia = []; let fatte = 0, chiamataAperta = null;
for (let g = 0; g < 200; g++) {
  const sc = await scena(p); const b = await bottoni(p); traccia.push(sc); if (process.env.DEBUG) console.log(g, sc, b.join(' '));
  if (sc === 'chiamata' && fatte >= Number(nStop) && b.some((x) => x.startsWith('opzione='))) {
    // la scena può essere ancora quella della chiamata appena risposta (dissolvenza): ci si ferma solo su una chiamata NON ancora in risposte
    await p.waitForTimeout(500);
    const [id, risp] = await p.evaluate(() => [document.querySelector('[data-messaggio^="chiamata-"]')?.dataset.messaggio?.replace('chiamata-', '') ?? null, Object.keys(JSON.parse(localStorage.getItem(Object.keys(localStorage).find((k) => /-salvataggio$/.test(k))) ?? '{}').in_corso?.risposte ?? {})]);
    if (id && !risp.includes(id)) { chiamataAperta = id; break; }
  }
  if (sc === 'citta' && !b.includes('azione=avvia-episodio') && !b.includes('azione=passo')) { await p.waitForTimeout(500); await p.click(`[data-episodio="${(await p.evaluate(() => { const k = Object.keys(localStorage).find((x) => /-salvataggio$/.test(x)); return k ? JSON.parse(localStorage.getItem(k)).missioni_concluse.includes('e01') : false; })) ? OBIETTIVO : 'e01'}"] .settore-punto`, { force: true }); await p.waitForTimeout(400); continue; }
  if (sc === 'genere') { await p.getByRole('button', { name: /IL NUOVO RESPONSABILE/i }).click(); await p.waitForTimeout(300); continue; }
  if (sc === 'guida') { await p.click('[data-azione="guida-salta"]'); await p.waitForTimeout(300); continue; }
  if (['scheda'].includes(sc) || b.some((x) => x.startsWith('testo='))) { const t = p.locator('button').filter({ hasText: /^(Uomo|Donna|Lui|Lei|Maschio|Femmina|Inizia|Continua|Avanti|Comincia)/i }).first(); if (await t.count() && sc !== 'chiamata') { await t.click().catch(() => {}); await p.waitForTimeout(150); continue; } }
  const sc2 = await passo(p, async (opz) => {
    // PREFER="opzione1,opzione2": se una di queste è fra quelle mostrate, si sceglie lei (per salvataggi con una scelta «comoda» già fatta)
    const pref = (process.env.PREFER ?? '').split(',').filter(Boolean); const ids = await opz.evaluateAll((e) => e.map((x) => x.dataset.opzione));
    const i = ids.findIndex((x) => pref.includes(x)); await opz.nth(i >= 0 ? i : Math.min(Number(process.env.IDX ?? 0), ids.length - 1)).click(); if (await p.evaluate(() => { const k = Object.keys(localStorage).find((x) => /-salvataggio$/.test(x)); return JSON.parse(localStorage.getItem(k) ?? '{}').in_corso?.missione; }) === OBIETTIVO) fatte++;
  });
}
const dump = await p.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])));
const stato = { scena: await scena(p), testo: await testo(p), bottoni: await bottoni(p), scelteFatte: fatte, chiamataAperta, traccia: traccia.filter((x, i) => x !== traccia[i - 1]) };
writeFileSync(out, JSON.stringify({ dump, stato, errori }, null, 1)); console.log(JSON.stringify({ chiavi: Object.keys(dump), ...stato, testo: stato.testo.slice(0, 160), errori }));
await browser.close(); srv.close();
