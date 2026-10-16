// C-026 (sola lettura): verifica sui pixel e sui casi dei rilievi chiusi dalla 0.20.0.
//  P  C22-03 / D-126 a: persone sulla mappa. Foto della mappa nello schieramento (e04, prima ondata: corteo di Kiln) e in
//     e26 (folla), verde e rosso C56P01; sui pixel: componenti connesse di pixel quasi neri (contorno) con riquadro ≤ 12 px
//     e dentro un pixel non nero (il riempimento): numero e misura. Le altre componenti (edifici, scritte) si scartano.
//  I  C22-05, C22-08, C22-10: misura a schermo delle icone di pastiglie, effetti, pulsanti, stelline, «home», «i».
//  A  C22-09: nella chiamata l'avatar del mittente e l'icona di chi chiama hanno lo stesso disegno.
//  N  C24-06: città a 412, tutti gli episodi conclusi: posizione del nome di e36 da 150 a 1500 ms, 10 caricamenti.
//  S  C24-03: N percorsi città → sala → briefing → titolo; errori di pagina («screen»).
// Uso: [PARTI=P,I,A,N,S] [GIRI=100] node coordination/sonde/c26-chiusi.mjs <radice con dist/> <cartella foto> <uscita.json>
import { createServer } from 'node:http'; import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c26'; const OUT = process.argv[4] ?? 'c26-chiusi.json'; mkdirSync(DIR, { recursive: true });
const PARTI = (process.env.PARTI ?? 'P,I,A,N,S').split(','); const GIRI = Number(process.env.GIRI ?? 100);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const H = { 360: 760, 375: 667, 412: 915 };
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 20000 });
const RIS = {}; const errori = [];
async function nuova(w, rossi = []) { const p = await b.newPage({ viewport: { width: w, height: H[w] }, hasTouch: true, reducedMotion: 'reduce' }); if (rossi.length) await p.addInitScript((r) => { for (const x of r) globalThis[`__NO_${x}`] = true; }, rossi); p.on('pageerror', (e) => errori.push(`${w}: ${e.message.slice(0, 160)}`)); await p.goto(URL); return p; }
async function finoA(p, ep, dove) {
  const m = missioni.find((x) => x.id === ep);
  await p.evaluate((v) => { localStorage.clear(); localStorage.setItem('valmora-salvataggio', v); }, JSON.stringify(salvataggioTutti(missioni, v0))); await p.reload(); await sc(p, 'titolo');
  await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta'); await p.waitForTimeout(250);
  if (await p.locator(`[data-stagione="${m.stagione}"]`).count()) await p.click(`[data-stagione="${m.stagione}"]`);
  await p.click(`[data-episodio="${ep}"] .settore-punto`); await p.waitForTimeout(250); if (dove === 'citta') return;
  await p.click('[data-azione="avvia-episodio"]'); await p.waitForTimeout(200);
  for (let k = 0; k < 3 && await p.locator('[data-azione="conferma-passo"]').count(); k++) { await p.click('[data-azione="conferma-passo"]'); await p.waitForTimeout(150); }
  if (await p.locator('[data-azione="conferma-rigioca"]').count()) await p.click('[data-azione="conferma-rigioca"]');
  await sc(p, 'sala'); if (dove === 'sala') return; while (await p.locator('[data-azione="passo"]').count()) { await p.click('[data-azione="passo"]'); await p.waitForTimeout(80); }
  await p.click('[data-azione="avanti"]'); await sc(p, 'briefing'); if (dove === 'briefing') return; while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) { await p.click('[data-azione="prossimo"], [data-azione="passo"]'); await p.waitForTimeout(80); }
  await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento'); await p.waitForTimeout(1200); if (dove === 'schieramento') return;
  // prima chiamata: schieramento vuoto, conferma
  await p.click('[data-azione="conferma"]'); if (await p.locator('[data-azione="conferma-davvero"]').count()) await p.click('[data-azione="conferma-davvero"]'); await sc(p, 'chiamata'); await p.waitForTimeout(1200);
}
// componenti di pixel quasi neri piccole con dentro un pixel chiaro
const persone = (p, png) => p.evaluate(async ({ b64, box }) => {
  const im = new Image(); await new Promise((ok) => { im.onload = ok; im.src = `data:image/png;base64,${b64}`; }); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); const D = x.getImageData(0, 0, im.width, im.height).data; const W = im.width, Hh = im.height;
  const nero = (i) => D[i] < 50 && D[i + 1] < 50 && D[i + 2] < 50; const visto = new Uint8Array(W * Hh); const comp = [];
  for (let y = 0; y < Hh; y++) for (let x0 = 0; x0 < W; x0++) { const k = y * W + x0; if (visto[k] || !nero(k * 4)) continue; const coda = [k]; visto[k] = 1; let n = 0, a = W, bb = 0, l = Hh, r = 0;
    while (coda.length) { const q = coda.pop(); n++; const qx = q % W, qy = (q / W) | 0; a = Math.min(a, qx); bb = Math.max(bb, qx); l = Math.min(l, qy); r = Math.max(r, qy); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = qx + dx, ny = qy + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= Hh) continue; const nk = ny * W + nx; if (!visto[nk] && nero(nk * 4)) { visto[nk] = 1; coda.push(nk); } } }
    const w = bb - a + 1, h = r - l + 1; if (w > 12 || h > 12 || w < 3 || h < 3) continue; const cx = ((a + bb) / 2) | 0, cy = ((l + r) / 2) | 0; const ci = (cy * W + cx) * 4; if (nero(ci)) continue; comp.push({ w, h }); }
  return comp; }, { b64: png.toString('base64') });
if (PARTI.includes('P')) {
  RIS.P = [];
  for (const w of [360, 375, 412]) for (const rossi of [[], ['C56P01']]) for (const [ep, dove] of [['e04', 'schieramento'], ['e04', 'chiamata'], ['e26', 'chiamata']]) {
    const p = await nuova(w, rossi);
    try { await finoA(p, ep, dove); const mappa = p.locator('.mappa').first(); await mappa.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
      const png = await mappa.screenshot({ type: 'png' }); const tag = `${w}${rossi.length ? '-rosso' : ''}-${ep}-${dove}`; writeFileSync(`${DIR}/mappa-${tag}.png`, png);
      const z = await mappa.screenshot({ type: 'png', scale: 'css' }); void z;
      const comp = await persone(p, png); const lati = comp.map((c) => Math.max(c.w, c.h)).sort((x, y) => x - y);
      const r = { w, rosso: !!rossi.length, ep, dove, n: comp.length, lato: lati.length ? { min: lati[0], mediana: lati[lati.length >> 1], max: lati[lati.length - 1] } : null, attr: await p.evaluate(() => document.querySelector('.mappa')?.dataset.persone ?? null) };
      RIS.P.push(r); console.log('P', JSON.stringify(r));
    } catch (e) { RIS.P.push({ w, ep, dove, errore: e.message.slice(0, 160) }); }
    await p.close();
  }
}
if (PARTI.includes('I') || PARTI.includes('A')) {
  RIS.I = []; RIS.A = [];
  for (const w of [360, 375, 412]) { const p = await nuova(w);
    for (const ep of ['e01', 'e18']) { await finoA(p, ep, 'chiamata');
      const x = await p.evaluate(() => { const mis = (sel) => [...document.querySelectorAll(sel)].filter((e) => e.getClientRects().length).map((e) => { const r = e.getBoundingClientRect(); return `${r.width.toFixed(1)}×${r.height.toFixed(1)}`; });
        const segni = [...document.querySelectorAll('.segno-effetto')].filter((e) => e.getClientRects().length).map((e) => getComputedStyle(e).fontSize);
        const av = document.querySelector('[data-messaggio^="chiamata-"] .avatar svg')?.innerHTML ?? null, chi = document.querySelector('.chiamata-corpo [data-chi-icona] svg')?.innerHTML ?? null;
        return { pastiglie: [...new Set(mis('.pastiglia .icona, .pastiglia svg'))], effetti: [...new Set(mis('.effetto-chip .icona, .effetto-chip svg'))], pulsanti: [...new Set(mis('.pulsante svg, button.pulsante .icona'))], home: [...new Set(mis('[data-azione="home"] svg, .tasto-home svg'))], info: [...new Set(mis('[data-azione="info-ondata"] svg'))], segni: [...new Set(segni)], avatarUgualeChi: chi === null ? 'vice' : av === chi }; });
      RIS.I.push({ w, ep, ...x }); console.log('I', w, ep, JSON.stringify(x)); }
    await finoA(p, 'e36', 'citta'); const st = await p.evaluate(() => [...new Set([...document.querySelectorAll('.settore-unita svg, .stelle.piccole svg, .settore-unita .stella')].filter((e) => e.getClientRects().length).map((e) => { const r = e.getBoundingClientRect(); return `${r.width.toFixed(1)}×${r.height.toFixed(1)}`; }))]);
    RIS.I.push({ w, citta: st }); console.log('I', w, 'stelline', st);
    await p.close(); }
}
if (PARTI.includes('N')) {
  RIS.N = [];
  for (let k = 0; k < 10; k++) { const p = await nuova(412);
    await p.evaluate((v) => { localStorage.clear(); localStorage.setItem('valmora-salvataggio', v); }, JSON.stringify(salvataggioTutti(missioni, v0))); await p.reload(); await sc(p, 'titolo');
    await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta'); if (await p.locator('[data-stagione="3"]').count()) await p.click('[data-stagione="3"]'); await p.click('[data-episodio="e36"] .settore-punto');
    const pos = []; const t0 = Date.now(); for (const t of [150, 300, 600, 1000, 1500]) { await p.waitForTimeout(Math.max(0, t - (Date.now() - t0))); pos.push(await p.evaluate(() => { const n = document.querySelector('[data-episodio="e36"].acceso .settore-nome'); if (!n) return null; const r = n.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; })); }
    const mosso = pos.filter(Boolean).some((q) => JSON.stringify(q) !== JSON.stringify(pos.find(Boolean)));
    RIS.N.push({ k, pos, mosso }); console.log('N', k, JSON.stringify(pos), mosso ? 'SI MUOVE' : 'fermo'); await p.close(); }
}
if (PARTI.includes('S')) {
  const p = await nuova(360); const prima = errori.length; let fatti = 0;
  for (let k = 0; k < GIRI; k++) { const ep = missioni[k % missioni.length].id; try { await finoA(p, ep, 'briefing'); fatti++; } catch (e) { errori.push(`S ${ep}: ${e.message.slice(0, 100)}`); } }
  RIS.S = { giri: GIRI, completati: fatti, erroriPagina: errori.slice(prima) }; console.log('S', JSON.stringify(RIS.S)); await p.close();
}
await b.close(); srv.close(); writeFileSync(OUT, JSON.stringify({ RIS, errori }, null, 1)); console.log(`errori di pagina ${errori.length}`);
