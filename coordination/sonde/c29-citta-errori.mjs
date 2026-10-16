// C-029: copia di c27-citta-errori.mjs con ROSSI=… (bracci rossi globalThis.__NO_XXX). C-027 (sola lettura): errore «Cannot read properties of undefined (reading 'on')» in StratoCitta (visto 1 volta a 412,
// corsa c27-schermate, dopo e21 verbale → ricarica → «Riprendi» → città). Ripete N volte lo stesso passaggio:
// salvataggio con tutti gli episodi aperti, ricarica, titolo, «Riprendi», città con la mappa pronta, scelta di un
// episodio, «Gioca», sala; conta gli errori di pagina e di console. Uso: W=412 [GIRI=150] node coordination/sonde/c27-citta-errori.mjs <radice> <uscita.json>
import { createServer } from 'node:http'; import { readFileSync, existsSync, writeFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const OUT = process.argv[3] ?? 'c27-citta-errori.json';
const W = Number(process.env.W ?? 412); const H = { 360: 760, 375: 667, 412: 915 }[W] ?? 915; const GIRI = Number(process.env.GIRI ?? 150);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: W, height: H }, hasTouch: true, reducedMotion: 'reduce' });
const errori = []; let giro = 0; const ROSSI = (process.env.ROSSI ?? '').split(',').filter(Boolean); if (ROSSI.length) await p.addInitScript((r) => { for (const x of r) globalThis[`__NO_${x}`] = true; }, ROSSI);
p.on('console', (x) => { if (x.type() === 'error') errori.push(`giro ${giro}: ${x.text().slice(0, 160)}`); }); p.on('pageerror', (e) => errori.push(`giro ${giro}: ${e.message.slice(0, 160)}`));
const sc = (n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
await p.goto(URL); const salv = JSON.stringify(salvataggioTutti(missioni, v0)); let fatti = 0;
for (giro = 1; giro <= GIRI; giro++) {
  try {
    await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), salv); await p.reload(); await sc('titolo');
    await p.getByRole('button', { name: 'Riprendi' }).click(); await sc('citta');
    const ep = missioni[giro % missioni.length]; if (await p.locator(`[data-stagione="${ep.stagione}"]`).count()) await p.click(`[data-stagione="${ep.stagione}"]`);
    await p.click(`[data-episodio="${ep.id}"] .settore-punto`); await p.click('[data-azione="avvia-episodio"]');
    for (let k = 0; k < 3 && await p.locator('[data-azione="conferma-passo"]').count(); k++) await p.click('[data-azione="conferma-passo"]');
    if (await p.locator('[data-azione="conferma-rigioca"]').count()) await p.click('[data-azione="conferma-rigioca"]');
    await sc('sala'); fatti++;
  } catch (e) { errori.push(`giro ${giro} BLOCCO: ${e.message.slice(0, 120)}`); }
}
await b.close(); srv.close(); writeFileSync(OUT, JSON.stringify({ W, GIRI, fatti, errori }, null, 1));
console.log(`W ${W}: giri ${GIRI}, completati ${fatti}, errori ${errori.length}${errori.length ? '\n  ' + errori.slice(0, 5).join('\n  ') : ''}`);
