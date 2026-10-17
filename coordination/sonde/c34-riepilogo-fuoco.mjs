// Sonda C-034 (sola lettura): C32-01 e il riepilogo dello schieramento. Con la tastiera: fuoco su «Conferma», Invio; dove va il
// fuoco (elemento, dentro la finestra), poi un secondo Invio: si apre la chiamata senza aver visto il riepilogo? Foto.
// Navigazione copiata da c34-aiuto.mjs.
// Uso: [ROSSI=C97F01] [EP=e01,e19] [MISURE=1366x768,…] node coordination/sonde/c34-riepilogo-fuoco.mjs <radice> <uscita.json> [foto]
import { createServer } from 'node:http'; import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'), OUT = process.argv[3] ?? 'aiuto.json', FOTO = process.argv[4];
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { missioni, v0 } = missioniDai(join(R, 'data'));
const ROSSI = (process.env.ROSSI ?? '').split(',').filter(Boolean);
const EP = (process.env.EP ?? 'e01').split(',');
const MISURE = (process.env.MISURE ?? '360x760,360x640,375x667,412x915,1366x768').split(',').map((m) => m.split('x').map(Number));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { let f = join(R, 'dist', decodeURIComponent(q.url.split('?')[0])); if (!existsSync(f) || f.endsWith('/')) f = join(R, 'dist', 'index.html'); r.writeHead(200, { 'content-type': T[extname(f)] ?? 'application/octet-stream' }); r.end(readFileSync(f)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
if (FOTO) mkdirSync(FOTO, { recursive: true });
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
const misura = (p) => p.evaluate(() => {
  const ret = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), basso: Math.round(r.bottom), vista: r.top >= 0 && r.bottom <= innerHeight, coperto: !(t && (t === e || e.contains(t))), sopra: t && !(t === e || e.contains(t)) ? `${t.tagName}.${(t.className?.baseVal ?? t.className ?? '').toString().split(' ')[0]}` : null }; };
  const a = document.querySelector('[data-azione="aiuto"]'), c = document.querySelector('[data-barra] [data-azione="conferma"]');
  const i = a?.querySelector('svg')?.getBoundingClientRect();
  const sc = document.querySelector('[data-aiuto]');
  return { aiuto: a ? { ...ret(a), barra: !!a.closest('[data-barra]'), tocco: Math.min(a.offsetWidth, a.offsetHeight), icona: i ? Math.round(Math.min(i.width, i.height)) : 0, premuto: a.getAttribute('aria-pressed') } : null,
    conferma: c ? { ...ret(c), testo: c.textContent.trim(), taglio: c.scrollWidth > c.clientWidth + 1 } : null,
    annulla: ret(document.querySelector('[data-barra] [data-azione="annulla"]')), azzera: ret(document.querySelector('[data-barra] [data-azione="azzera"]')),
    ordine: [...document.querySelectorAll('[data-barra] button')].map((x) => x.dataset.azione),
    infoAperta: document.querySelector('[data-azione="info-ondata"]')?.getAttribute('aria-expanded'),
    scatola: sc ? ret(sc) : null, scorrimentoX: document.documentElement.scrollWidth > innerWidth, pagina: document.documentElement.scrollHeight, finestra: innerHeight };
});
const righe = [], errori = [];
for (const ep of EP) for (const [W, H] of MISURE) {
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  p.on('pageerror', (e) => errori.push(`${ep} ${W}x${H}: ${e.message}`)); p.on('console', (m) => { if (m.type() === 'error') errori.push(`${ep} ${W}x${H}: ${m.text()}`); });
  if (ROSSI.length) await p.addInitScript((r) => { for (const x of r) globalThis[`__NO_${x}`] = true; }, ROSSI);
  await p.goto(URL); await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(salvataggioTutti(missioni, v0))); await p.reload(); await sc(p, 'titolo');
  await p.click('button:has-text("Riprendi")'); await sc(p, 'citta'); await p.waitForTimeout(300);
  const st = missioni.find((m) => m.id === ep)?.stagione ?? 1;
  if (await p.locator(`[data-stagione="${st}"]`).count()) await p.click(`[data-stagione="${st}"]`);
  await p.click(`[data-episodio="${ep}"] .settore-punto`); await p.click('[data-azione="avvia-episodio"]'); await p.waitForTimeout(200);
  for (let k = 0; k < 3 && await p.locator('[data-azione="conferma-passo"]').count(); k++) await p.click('[data-azione="conferma-passo"]');
  if (await p.locator('[data-azione="conferma-rigioca"]').count()) await p.click('[data-azione="conferma-rigioca"]');
  await sc(p, 'sala'); while (await p.locator('[data-azione="passo"]').count()) await p.click('[data-azione="passo"]');
  await p.click('[data-azione="avanti"]'); await sc(p, 'briefing'); while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) await p.click('[data-azione="prossimo"], [data-azione="passo"]');
  await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento'); await p.waitForTimeout(400);
  await p.locator('[data-risorsa]').first().click(); await p.locator('.settore-punto').first().click(); await p.waitForTimeout(200);
  await p.focus('[data-barra] [data-azione="conferma"]'); await p.keyboard.press('Enter'); await p.waitForTimeout(800);
  const dopo1 = await p.evaluate(() => { const a = document.activeElement, r = a?.getBoundingClientRect(); return { fuoco: a ? `${a.tagName}[${a.dataset?.azione ?? a.className}]` : null, dentro: !!r && r.bottom > 0 && r.top < innerHeight, y: r ? Math.round(r.top) : null, riepilogo: !!document.querySelector('[data-riepilogo]'), riepilogoY: Math.round(document.querySelector('[data-riepilogo]')?.getBoundingClientRect().top ?? -1), scroll: Math.round(scrollY) }; });
  const nome = `${W}x${H}-${ep}${ROSSI.length ? '-rosso' : ''}`;
  if (FOTO) await p.screenshot({ path: join(FOTO, `riepilogo-${nome}.png`) });
  await p.keyboard.press('Enter'); await p.waitForTimeout(1500);
  const scena2 = await p.evaluate(() => document.querySelector('.scena')?.dataset.scena);
  righe.push({ ep, W, H, dopo1, scena2 });
  console.log(`${nome}: dopo Invio su Conferma il fuoco è su ${dopo1.fuoco} (${dopo1.dentro ? 'nella finestra' : `FUORI dalla finestra, y ${dopo1.y}`}), riepilogo ${dopo1.riepilogo ? `a y ${dopo1.riepilogoY}` : 'assente'}; secondo Invio → scena «${scena2}»`);
  await p.close();
}
writeFileSync(OUT, JSON.stringify({ ROSSI, righe, errori }, null, 1));
console.log(`errori ${errori.length}${errori.length ? ': ' + errori.slice(0, 5).join(' | ') : ''}`);
await b.close(); srv.close();
