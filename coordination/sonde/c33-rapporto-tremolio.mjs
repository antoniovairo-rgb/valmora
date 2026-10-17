// Sonda C-033 (sola lettura): PO-059, la vignetta di fine ondata è nascondibile (useRiempi, D-126 d) come quella della sala:
// per ogni finestra e per il rapporto dell'ondata 1 degli episodi EP (stato del bot attento, seme 1, ripreso dal salvataggio)
// legge per 120 frame: vignetta nascosta o no, altezza, altezza della pagina, scrollY; conta i valori diversi (tremolio, C29-01).
// Uso: [FOTO=<cartella>] [EP=e01,e13,e30] [MISURE=360x760,…] node coordination/sonde/c33-rapporto-tremolio.mjs <radice> [uscita.json]
import { createServer } from 'node:http'; import { readFileSync, existsSync, writeFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const OUT = process.argv[3];
const EP = (process.env.EP ?? 'e01,e13,e30').split(','); const MISURE = (process.env.MISURE ?? '360x760,375x667,412x915,768x1024,1024x768,1366x768,1920x1080').split(',').map((x) => x.split('x').map(Number));
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`); const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`); const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const base = salvataggioTutti(missioni, v0); const RIS = []; const errori = [];
for (const [W, H] of MISURE) {
  const p = await b.newPage({ viewport: { width: W, height: H } }); p.on('pageerror', (e) => errori.push(e.message.slice(0, 160))); p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text().slice(0, 160)); });
  await p.goto(URL);
  for (const ep of EP) {
    const m = missioni.find((x) => x.id === ep); const g = B.attenta(creaCaso(1), dich); let s = M.iniziaMissione(m, v0, dich);
    s = M.schiera(m, s, g.schiera(m, s)); for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) s = M.rispondi(m, s, c.id, g.scegli(m, s, c), dich); s = M.chiudiOndata(m, s, dich);
    await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify({ ...base, in_corso: s, rapporto_aperto: 1 }));
    await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click();
    await p.waitForFunction(() => document.querySelector('.scena')?.dataset.scena === 'rapporto', null, { timeout: 8000 }).catch(() => {});
    const v = await p.evaluate(() => new Promise((ok) => { const viste = []; let n = 0; const giro = () => { const svg = document.querySelector('[data-tono] [data-vignetta]');
      viste.push(`${svg?.hasAttribute('data-nascosta') ? 'N' : 'V'}|${Math.round(svg?.getBoundingClientRect().height ?? -1)}|${document.documentElement.scrollHeight}|${Math.round(scrollY)}`); if (++n < 120) requestAnimationFrame(giro); else ok(viste); }; requestAnimationFrame(giro); }));
    if (process.env.FOTO) await p.screenshot({ path: `${process.env.FOTO}/rapporto-${W}x${H}-${ep}.jpg`, type: 'jpeg', quality: 80, fullPage: true });
    const finali = v.slice(60); const r = { W, H, ep, diversiTutti: new Set(v).size, diversiDopo60: new Set(finali).size, cambiNascosta: v.slice(1).filter((x, i) => x[0] !== v[i][0]).length, ultima: v.at(-1) };
    RIS.push(r); console.log(`${W}×${H} ${ep}: valori diversi ${r.diversiTutti} (dopo il frame 60: ${r.diversiDopo60}), cambi nascosta/visibile ${r.cambiNascosta}, finale ${r.ultima} (N = nascosta | altezza vignetta | altezza pagina | scrollY)`);
  }
  await p.close();
}
await b.close(); srv.close(); if (OUT) writeFileSync(OUT, JSON.stringify({ RIS, errori })); console.log(`errori ${errori.length}`, errori.slice(0, 3));
