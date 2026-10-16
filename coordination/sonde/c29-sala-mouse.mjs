// Sonda C-029 (sola lettura): riproduzione del clic col mouse su «passo» nella sala (c28-mouse.mjs, 1366×768: 3/3 episodi
// fermi). Per W×H e per episodio: città → «Gioca» → sala; poi a ogni passo legge rettangolo del pulsante, elemento in cima al
// suo centro, opacità e trasformazioni, e prova page.click con 4 s di attesa; registra il messaggio completo di Playwright.
// Uso: W=1366 H=768 [TOCCO=1] [EP=e01] node coordination/sonde/c29-sala-mouse.mjs <radice con dist/> <uscita.json> [foto]
import { createServer } from 'node:http'; import { readFileSync, existsSync, writeFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const OUT = process.argv[3] ?? 'c29-sala-mouse.json'; const FOTO = process.argv[4];
const W = Number(process.env.W ?? 1366), H = Number(process.env.H ?? 768); const EP = (process.env.EP ?? 'e01').split(',');
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: process.env.TOCCO === '1' });
const errori = []; p.on('pageerror', (e) => errori.push(e.message.slice(0, 160))); p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text().slice(0, 160)); });
const RIS = [];
const stato = () => p.evaluate(() => { const e = document.querySelector('[data-azione="passo"]'); if (!e) return null; const r = e.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2; const t = document.elementFromPoint(cx, cy);
  const catena = []; for (let x = e; x && x !== document.body; x = x.parentElement) { const cs = getComputedStyle(x); if (cs.transform !== 'none' || cs.opacity !== '1' || cs.pointerEvents === 'none') catena.push(`${x.tagName}.${String(x.className).split(' ')[0]} t=${cs.transform} o=${cs.opacity} pe=${cs.pointerEvents}`); }
  return { rett: [r.left, r.top, r.width, r.height].map((v) => +v.toFixed(1)), dentro: cy >= 0 && cy <= innerHeight, inCima: t ? (e.contains(t) ? 'il pulsante' : `${t.tagName}.${String(t.className?.baseVal ?? t.className).split(' ')[0]}`) : 'niente', catena, scrollY, altezzaPagina: document.documentElement.scrollHeight, testo: e.textContent.trim().slice(0, 30) }; });
await p.goto(URL);
for (const ep of EP) { const m = missioni.find((x) => x.id === ep);
  await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(salvataggioTutti(missioni, v0))); await p.reload(); await sc(p, 'titolo');
  await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta'); await p.waitForTimeout(300);
  if (await p.locator(`[data-stagione="${m.stagione}"]`).count()) await p.click(`[data-stagione="${m.stagione}"]`);
  await p.click(`[data-episodio="${ep}"] .settore-punto`); await p.waitForTimeout(300); await p.click('[data-azione="avvia-episodio"]'); await p.waitForTimeout(200);
  for (let k = 0; k < 3 && await p.locator('[data-azione="conferma-passo"]').count(); k++) { await p.click('[data-azione="conferma-passo"]'); await p.waitForTimeout(150); }
  if (await p.locator('[data-azione="conferma-rigioca"]').count()) await p.click('[data-azione="conferma-rigioca"]');
  await sc(p, 'sala'); await p.waitForTimeout(400);
  for (let k = 1; k <= 8 && await p.locator('[data-azione="passo"]').count(); k++) {
    const prima = await stato(); let esito = 'ok';
    try { await p.click('[data-azione="passo"]', { timeout: 4000 }); } catch (x) { esito = x.message.replace(/\u001b\[\d+m/g, '').split('\n').filter((l) => /retrying|intercepts|not stable|outside|visible|scroll|subtree/.test(l)).slice(0, 4).join(' / ') || x.message.slice(0, 300); }
    RIS.push({ ep, passo: k, prima, esito }); console.log(ep, k, JSON.stringify(prima), '→', esito);
    if (esito !== 'ok') { if (FOTO) await p.screenshot({ path: `${FOTO}/sala-mouse-${W}x${H}-${ep}-passo${k}.jpg`, type: 'jpeg', quality: 78 }); break; }
    await p.waitForTimeout(150);
  } }
await b.close(); srv.close(); writeFileSync(OUT, JSON.stringify({ W, H, RIS, errori }, null, 1)); console.log('errori', errori.length);
