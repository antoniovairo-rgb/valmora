// Sonda C-032 (sola lettura): dopo C28-11 la versione sta nel margine destro della colonna. Quanto è vicina ai pulsanti?
// e01, schieramento (con un'unità messa), prima chiamata e prima risposta, a più finestre: rettangolo della versione,
// per ogni pulsante visibile il rettangolo e l'ombra (box-shadow), distanza orizzontale fra la versione e il bordo destro
// del pulsante con l'ombra, sovrapposizione verticale. Uso: node coordination/sonde/c32-versione-pulsanti.mjs <radice con dist/>
import { createServer } from 'node:http'; import { readFileSync, existsSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.');
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { let f = join(R, 'dist', decodeURIComponent(q.url.split('?')[0])); if (!existsSync(f) || f.endsWith('/')) f = join(R, 'dist', 'index.html'); r.writeHead(200, { 'content-type': T[extname(f)] ?? 'application/octet-stream' }); r.end(readFileSync(f)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
const misura = (p, dove) => p.evaluate((dove) => {
  const v = document.querySelector('.versione-angolo')?.getBoundingClientRect(); if (!v) return { dove, nessuna: true };
  const out = [];
  for (const e of document.querySelectorAll('button, [data-azione]')) { const r = e.getBoundingClientRect(); if (!r.width || r.bottom < 0 || r.top > innerHeight) continue;
    const m = getComputedStyle(e).boxShadow.match(/(-?[\d.]+)px (-?[\d.]+)px/); const sx = m ? Math.max(0, +m[1]) : 0, sy = m ? Math.max(0, +m[2]) : 0;
    const vert = Math.min(v.bottom, r.bottom + sy) - Math.max(v.top, r.top); if (vert <= 0) continue;
    out.push({ comando: (e.dataset.azione || e.className.split(' ')[0] || e.tagName), gap: +(v.left - r.right).toFixed(1), gapOmbra: +(v.left - (r.right + sx)).toFixed(1), vert: +vert.toFixed(1) }); }
  return { dove, versione: `${v.left.toFixed(0)}…${v.right.toFixed(0)} × ${v.top.toFixed(0)}…${v.bottom.toFixed(0)}`, accanto: out };
}, dove);
for (const [W, H] of [[360, 760], [375, 667], [412, 915], [768, 1024], [1024, 768], [1366, 768], [1920, 1080]]) {
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await p.goto(URL); await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(salvataggioTutti(missioni, v0))); await p.reload(); await sc(p, 'titolo');
  await p.click('button:has-text("Riprendi")'); await sc(p, 'citta'); await p.waitForTimeout(300);
  if (await p.locator('[data-stagione="1"]').count()) await p.click('[data-stagione="1"]');
  await p.click('[data-episodio="e01"] .settore-punto'); await p.click('[data-azione="avvia-episodio"]'); await p.waitForTimeout(200);
  for (let k = 0; k < 3 && await p.locator('[data-azione="conferma-passo"]').count(); k++) await p.click('[data-azione="conferma-passo"]');
  if (await p.locator('[data-azione="conferma-rigioca"]').count()) await p.click('[data-azione="conferma-rigioca"]');
  await sc(p, 'sala'); while (await p.locator('[data-azione="passo"]').count()) await p.click('[data-azione="passo"]');
  await p.click('[data-azione="avanti"]'); await sc(p, 'briefing'); while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) await p.click('[data-azione="prossimo"], [data-azione="passo"]');
  await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento'); await p.waitForTimeout(300);
  await p.locator('[data-risorsa]').first().click(); await p.locator('.settore-punto').first().click(); await p.waitForTimeout(200);
  const r1 = await misura(p, 'schieramento');
  await p.click('[data-azione="conferma"]'); if (await p.locator('[data-azione="conferma-davvero"]').count()) await p.click('[data-azione="conferma-davvero"]');
  await sc(p, 'chiamata'); await p.waitForTimeout(300); const r2 = await misura(p, 'chiamata');
  await p.locator('.opzione').first().click(); await p.waitForSelector('[data-azione="continua"]'); await p.waitForTimeout(300); const r3 = await misura(p, 'risposta');
  for (const r of [r1, r2, r3]) console.log(`${W}×${H} ${r.dove}: versione ${r.versione}; accanto: ${r.accanto.map((x) => `${x.comando} distanza ${x.gap} px (dall'ombra ${x.gapOmbra}), in altezza ${x.vert} px`).join('; ') || 'nessun comando alla stessa altezza'}`);
  await p.close();
}
await b.close(); srv.close();
