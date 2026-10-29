// C-054 · riprende sulla build attuale (dist/) un salvataggio fatto da una build storica (file di c054-salvataggio-vecchio.mjs).
// Misura: chiavi dopo la migrazione, differenze del JSON, chiamata mostrata dopo «Riprendi» = quella al momento del salvataggio,
// poi gioca la stessa ondata fino alla chiusura e annota gli id delle chiamate. Uso: node c054-ripresa.mjs <dist> <salvataggio.json> <cartella-foto> <etichetta>
import { readFileSync, mkdirSync } from 'node:fs';
import { servi, apri, scena, testo, bottoni, passo, scorr } from './c054-lib.mjs';
const [dist, file, cart, tag] = process.argv.slice(2); mkdirSync(cart, { recursive: true });
const { dump, stato } = JSON.parse(readFileSync(file, 'utf8'));
const { srv, url } = await servi(dist); const { browser, p, errori } = await apri(url, 375, 667);
const idChiamata = () => p.evaluate(() => document.querySelector('[data-messaggio^="chiamata-"]')?.dataset.messaggio ?? null);
await p.evaluate((d) => { localStorage.clear(); for (const [k, v] of Object.entries(d)) localStorage.setItem(k, v); }, dump);
await p.reload(); await p.waitForTimeout(800);
const r = { tag, titolo: await scena(p), bottoniTitolo: await bottoni(p), testoTitolo: (await testo(p)).slice(0, 400) };
await p.screenshot({ path: `${cart}/${tag}-titolo.jpg`, type: 'jpeg', quality: 60 });
r.chiaviDopo = await p.evaluate(() => Object.keys(localStorage).sort());
const nuovoK = r.chiaviDopo.find((k) => /-salvataggio$/.test(k)), vecchioK = Object.keys(dump).find((k) => /-salvataggio$/.test(k));
const prima = JSON.parse(dump[vecchioK]), dopo = JSON.parse(await p.evaluate((k) => localStorage.getItem(k), nuovoK));
const diff = (a, b, path = '') => { if (JSON.stringify(a) === JSON.stringify(b)) return []; if (a && b && typeof a === 'object' && typeof b === 'object') { const ks = new Set([...Object.keys(a), ...Object.keys(b)]); return [...ks].flatMap((k) => diff(a[k], b[k], `${path}.${k}`)); } return [`${path}: ${JSON.stringify(a)?.slice(0, 60)} → ${JSON.stringify(b)?.slice(0, 60)}`]; };
r.differenzeJson = diff(prima, dopo);
await p.getByRole('button', { name: /Riprendi/i }).click(); await p.waitForTimeout(900);
r.dopoRiprendi = { scena: await scena(p), chiamata: await idChiamata(), bottoni: (await bottoni(p)).filter((b) => /opzione|continua/.test(b)), testo: (await testo(p)).slice(0, 220) };
r.chiamataAlSalvataggio = stato.chiamataAperta; r.stessaChiamata = r.dopoRiprendi.chiamata === `chiamata-${stato.chiamataAperta}`; r.ondataAlSalvataggio = prima.in_corso?.ondata;
await p.screenshot({ path: `${cart}/${tag}-ripresa.jpg`, type: 'jpeg', quality: 60 });
// finisce l'ondata scegliendo sempre la prima opzione
const ids = []; let chiusura = null;
for (let g = 0; g < 80; g++) {
  const sc = await scena(p), c = await idChiamata(); if (sc === 'chiamata' && c && ids.at(-1) !== c) ids.push(c);
  const t = await testo(p); if (/La radio tace|data-radio-dopo/.test(t) || (await p.locator('[data-messaggio="radio-dopo"]').count())) { chiusura = { scena: sc, testo: t.slice(0, 300), scorr: await scorr(p) }; break; }
  await passo(p);
}
r.chiamateFinoAllaChiusura = ids; r.chiusura = chiusura;
r.ondataDopo = await p.evaluate(() => { const k = Object.keys(localStorage).find((x) => /-salvataggio$/.test(x)); const s = JSON.parse(localStorage.getItem(k)); return { ondata: s.in_corso?.ondata, game_version: s.game_version, save_version: s.save_version }; });
r.errori = errori; console.log(JSON.stringify(r, null, 1));
await browser.close(); srv.close();
