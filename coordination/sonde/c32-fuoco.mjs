// Sonda C-032 (sola lettura): C28-09 da vicino, solo tastiera. e01 a W×H: (1) città: Tab fino a «Gioca l'episodio»,
// Invio, poi conta i Tab fino a «conferma-passo» (se c'è); (2) schieramento: Tab fino alla prima unità, Spazio, Tab fino
// a un settore, Invio, Tab fino a «Conferma», Invio; (3) prima chiamata: Tab fino alla prima opzione, Spazio. Dopo ogni
// tasto legge document.activeElement a 50, 150, 400, 1000 e 2000 ms. ROSSI=… come le altre sonde (c32-rossi.mjs).
// Uso: W=1366 H=768 node [--import ./coordination/sonde/c32-rossi.mjs] coordination/sonde/c32-fuoco.mjs <radice con dist/>
import { createServer } from 'node:http'; import { readFileSync, existsSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const W = Number(process.env.W ?? 1366); const H = Number(process.env.H ?? 768);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { let f = join(R, 'dist', decodeURIComponent(q.url.split('?')[0])); if (!existsSync(f) || f.endsWith('/')) f = join(R, 'dist', 'index.html'); r.writeHead(200, { 'content-type': T[extname(f)] ?? 'application/octet-stream' }); r.end(readFileSync(f)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1, reducedMotion: 'reduce' }); const errori = []; p.on('pageerror', (e) => errori.push(e.message));
const sc = (n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
const att = () => p.evaluate(() => { const a = document.activeElement; return !a || a === document.body ? 'body' : `${a.tagName}.${String(a.className).split(' ')[0]}${a.dataset.azione ? '[' + a.dataset.azione + ']' : ''}`; });
const tabFino = async (sel, max = 300) => { for (let n = 0; n <= max; n++) { if (await p.evaluate((s) => document.activeElement?.matches(s), sel)) return n; await p.keyboard.press('Tab'); await p.waitForTimeout(10); } return -1; };
const dopo = async (nome, tasto) => { await p.keyboard.press(tasto); const t = []; let prec = 0; for (const ms of [50, 150, 400, 1000, 2000]) { await p.waitForTimeout(ms - prec); prec = ms; t.push(`${ms}ms ${await att()}`); } console.log(`${W}×${H} ${nome}: ${t.join(' · ')}`); };
await p.goto(URL); await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(salvataggioTutti(missioni, v0))); await p.reload(); await sc('titolo');
await p.getByRole('button', { name: 'Riprendi' }).focus(); await p.keyboard.press('Enter'); await sc('citta'); await p.waitForTimeout(300);
if (await p.locator('[data-stagione="1"]').count()) { console.log(`${W}×${H} città: Tab fino alla stagione 1 ${await tabFino('[data-stagione="1"]')}`); await dopo('città, Invio sulla stagione 1', 'Enter'); }
console.log(`${W}×${H} città: Tab fino a e01 ${await tabFino('[data-episodio="e01"] .settore-punto')}`); await dopo('città, Invio su e01', 'Enter');
console.log(`${W}×${H} città: Tab fino a «Gioca l'episodio» ${await tabFino('[data-azione="avvia-episodio"]')}`); await dopo('città, Invio su «Gioca l\'episodio»', 'Enter');
if (await p.locator('[data-azione="conferma-passo"]').count()) { console.log(`${W}×${H} città: Tab fino a «conferma-passo» ${await tabFino('[data-azione="conferma-passo"]')}`); await dopo('città, Invio su conferma-passo', 'Enter'); }
for (let k = 0; k < 3 && await p.locator('[data-azione="conferma-passo"]').count(); k++) { await p.click('[data-azione="conferma-passo"]'); }
if (await p.locator('[data-azione="conferma-rigioca"]').count()) await p.click('[data-azione="conferma-rigioca"]');
await sc('sala'); while (await p.locator('[data-azione="passo"]').count()) await p.click('[data-azione="passo"]'); await p.click('[data-azione="avanti"]'); await sc('briefing');
while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) await p.click('[data-azione="prossimo"], [data-azione="passo"]');
await p.locator('[data-azione="inizia"]').focus(); await p.keyboard.press('Enter'); await sc('schieramento'); await p.waitForTimeout(300);
console.log(`${W}×${H} schieramento: Tab fino alla prima unità ${await tabFino('[data-risorsa]')}`); await dopo('schieramento, Spazio sull\'unità', ' ');
console.log(`${W}×${H} schieramento: Tab fino a un settore ${await tabFino('.settore-punto')}`); await dopo('schieramento, Invio sul settore', 'Enter');
console.log(`${W}×${H} schieramento: Tab fino a «Conferma» ${await tabFino('[data-azione="conferma"]')}`); await dopo('schieramento, Invio su «Conferma»', 'Enter');
if (await p.locator('[data-azione="conferma-davvero"]').count()) { await tabFino('[data-azione="conferma-davvero"]'); await dopo('riepilogo, Invio', 'Enter'); }
await sc('chiamata'); await p.waitForTimeout(300); await dopo('chiamata aperta (nessun tasto: Shift)', 'Shift');
console.log(`${W}×${H} chiamata: Tab fino alla prima opzione ${await tabFino('.opzione')}`); await dopo('chiamata, Spazio sull\'opzione', ' ');
console.log(`${W}×${H} risposta: Tab fino a «continua» ${await tabFino('[data-azione="continua"]')}`); await dopo('risposta, Invio su «continua»', 'Enter');
console.log(`${W}×${H} chiamata 2: Tab fino alla prima opzione ${await tabFino('.opzione')}`);
console.log(`errori ${errori.length} ${errori.slice(0, 3).join(' | ')}`); await b.close(); srv.close();
