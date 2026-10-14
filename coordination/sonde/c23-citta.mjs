// Sonda C-023 (sola lettura): D-119 e C20-03, nomi degli episodi sulla mappa della città (dist/), 36 episodi conclusi.
// Per ogni larghezza (360×760, 375×667, 412×915) fa CARICAMENTI caricamenti completi della pagina (ricarica → Riprendi →
// città, movimento NON ridotto, come un telefono qualsiasi); a ogni caricamento: nome dell'episodio acceso subito
// all'arrivo (a 150 ms e a 1500 ms: si sposta?), poi tocca ogni disco e misura dopo ATTESA ms il nome acceso:
// area sopra le stelline (.settore-unita) e sopra il cerchio di altri dischi, distanza dal bordo della mappa (<5 px =
// sul bordo, MARGINE di src/resa/mappa/etichette.ts:9), corpo del carattere, posto (data-nome), classe «stretto»,
// rettangolo in coordinate della mappa. Stabilità: per ogni episodio, dispersione del rettangolo fra i caricamenti.
// Uso: node coordination/sonde/c23-citta.mjs <radice> <foto> · env CARICAMENTI=10 ATTESA=500 ROSSO=C47N01,C47N02,C48N01
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c23'; mkdirSync(DIR, { recursive: true });
const ROSSI = process.env.ROSSO?.split(',').filter(Boolean) ?? []; const suff = ROSSI.length ? '-rosso' : '';
const N = Number(process.env.CARICAMENTI ?? 10), ATTESA = Number(process.env.ATTESA ?? 500);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`);
const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const base = salvataggioTutti(missioni, v0); const errori = [];
const misura = (p, id) => p.evaluate((id) => {
  const s = id ? document.querySelector(`[data-episodio="${id}"]`) : document.querySelector('[data-episodio].acceso'); if (!s || !s.classList.contains('acceso')) return null;
  const n = s.querySelector('.settore-nome'); if (!n) return null;
  const r = n.getBoundingClientRect(), mp = document.querySelector('.mappa').getBoundingClientRect();
  const ov = (a, c) => Math.max(0, Math.min(a.right, c.right) - Math.max(a.left, c.left)) * Math.max(0, Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top));
  const altri = [...document.querySelectorAll('[data-episodio]')].filter((d) => d !== s);
  const dischi = altri.filter((d) => { const c = d.querySelector('.settore-punto').getBoundingClientRect(), cx = c.left + c.width / 2, cy = c.top + c.height / 2;
    const px = Math.max(r.left, Math.min(cx, r.right)), py = Math.max(r.top, Math.min(cy, r.bottom)); return Math.hypot(px - cx, py - cy) < c.width / 2 - 0.5; }).map((d) => d.dataset.episodio);
  const stelline = altri.map((d) => [d.dataset.episodio, d.querySelector('.settore-unita')]).filter(([, u]) => u).map(([e, u]) => [e, ov(r, u.getBoundingClientRect())]).filter(([, a]) => a > 0.5).map(([e, a]) => `${e}:${Math.round(a)}`);
  const bordo = Math.min(r.left - mp.left, mp.right - r.right, r.top - mp.top, mp.bottom - r.bottom);
  const cs = getComputedStyle(n);
  return { id: s.dataset.episodio, dischi, stelline, bordo: Math.round(bordo * 10) / 10, font: cs.fontSize, stretto: n.classList.contains('stretto'), posto: s.dataset.nome, rett: [r.left - mp.left, r.top - mp.top, r.width, r.height].map((v) => Math.round(v * 10) / 10) };
}, id);
const RIS = {};
for (const [w, h] of [[360, 760], [375, 667], [412, 915]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, deviceScaleFactor: 1 });
  if (ROSSI.length) await p.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, ROSSI);
  p.on('console', (x) => { if (x.type() === 'error') errori.push(`${w}: ${x.text().slice(0, 160)}`); }); p.on('pageerror', (e) => errori.push(`${w}: ${e.message.slice(0, 160)}`));
  await p.goto(URL); await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(base));
  RIS[w] = { arrivo: [], ep: {} };
  for (let k = 0; k < N; k++) {
    await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click();
    await p.waitForSelector('.scena[data-scena="citta"] [data-episodio].acceso', { timeout: 10000, state: 'attached' });
    await p.waitForTimeout(150); const a1 = await misura(p, null); await p.waitForTimeout(1350); const a2 = await misura(p, null);
    RIS[w].arrivo.push({ a1, a2 });
    for (const st of await p.$$eval('[data-stagione]', (xs) => xs.map((x) => x.dataset.stagione))) {
      await p.click(`[data-stagione="${st}"]`); await p.waitForTimeout(150);
      for (const id of await p.$$eval('[data-episodio]', (xs) => xs.map((x) => x.dataset.episodio))) {
        await p.click(`[data-episodio="${id}"] .settore-punto`); await p.waitForTimeout(ATTESA);
        const x = await misura(p, id); if (!x) continue;
        (RIS[w].ep[id] ??= []).push(x);
        if (k === 0 && (x.dischi.length || x.stelline.length || x.bordo < 5)) await p.screenshot({ path: `${DIR}/${w}-citta-${id}${suff}.jpg`, type: 'jpeg', quality: 72 });
      }
    }
  }
  if (!ROSSI.length) for (const id of ['e05', 'e06']) { await p.click(`[data-stagione="${missioni.find((m) => m.id === id).stagione}"]`).catch(() => {}); await p.click(`[data-episodio="${id}"] .settore-punto`); await p.waitForTimeout(ATTESA); await p.screenshot({ path: `${DIR}/${w}-citta-${id}-dopo${suff}.jpg`, type: 'jpeg', quality: 72 }); }
  await p.close();
}
for (const [w, r] of Object.entries(RIS)) {
  const tutte = Object.values(r.ep).flat();
  const sopraStelline = tutte.filter((x) => x.stelline.length), sopraDischi = tutte.filter((x) => x.dischi.length), suBordo = tutte.filter((x) => x.bordo < 5);
  const disp = Object.entries(r.ep).map(([id, xs]) => [id, Math.max(...[0, 1, 2, 3].map((i) => Math.max(...xs.map((x) => x.rett[i])) - Math.min(...xs.map((x) => x.rett[i])))), new Set(xs.map((x) => x.posto + (x.stretto ? '*' : ''))).size]);
  const instabili = disp.filter(([, d, pz]) => d > 1 || pz > 1);
  const font = [...new Set(tutte.map((x) => x.font))], stretti = [...new Set(tutte.filter((x) => x.stretto).map((x) => x.id))];
  const mov = r.arrivo.filter((a) => a.a1 && a.a2 && a.a1.rett.some((v, i) => Math.abs(v - a.a2.rett[i]) > 1));
  console.log(`${w}: misure ${tutte.length} (${Object.keys(r.ep).length} episodi × ${N} caricamenti)`);
  console.log(`  sopra stelline ${sopraStelline.length} [${[...new Set(sopraStelline.map((x) => `${x.id}>${x.stelline.join('+')}`))].join(' ')}] · sopra dischi ${sopraDischi.length} [${[...new Set(sopraDischi.map((x) => `${x.id}>${x.dischi}`))].join(' ')}] · a meno di 5 px dal bordo ${suBordo.length} [${[...new Set(suBordo.map((x) => `${x.id}:${x.bordo}`))].join(' ')}] · bordo minimo ${Math.min(...tutte.map((x) => x.bordo))} px`);
  console.log(`  carattere ${font.join(',')}; riquadro stretto: ${stretti.join(' ') || 'nessuno'}`);
  console.log(`  stabilità fra i caricamenti: episodi col nome che cambia di più di 1 px o di posto ${instabili.length}/36 ${instabili.map(([id, d, pz]) => `${id}(${d.toFixed(1)} px, posti ${pz})`).join(' ')}; dispersione massima ${Math.max(...disp.map((x) => x[1])).toFixed(1)} px`);
  console.log(`  nome all'arrivo che si sposta fra 150 e 1500 ms: ${mov.length}/${r.arrivo.length} ${mov.map((a) => `${a.a1.id} ${a.a1.rett}→${a.a2.rett}`).join(' ')}`);
}
console.log(`errori di console: ${errori.length} ${[...new Set(errori)].slice(0, 5).join(' | ')}`);
await b.close(); srv.close();
