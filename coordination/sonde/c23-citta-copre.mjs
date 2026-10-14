// Sonda C-023 (sola lettura): quanta parte del nome acceso sulla mappa della città è coperta da ALTRI elementi,
// compreso il disco e le stelline dell'episodio stesso (c23-citta.mjs guarda solo gli altri episodi). Griglia di punti
// ogni 2 px dentro il riquadro del nome; per ogni punto elementFromPoint: coperto se l'elemento in cima non è dentro
// .settore-nome. Durante il campionamento tutta la mappa ha pointer-events:auto (il nome e le stelline hanno
// pointer-events:none e elementFromPoint li salterebbe: prima versione della sonda cieca, 100% ovunque). Una sola apertura per larghezza (il posto è stabile, c23-citta.mjs). Foto dei nomi coperti > SOGLIA %.
// Uso: node coordination/sonde/c23-citta-copre.mjs <radice> <foto> · env SOGLIA=3 ROSSO=...
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c23'; mkdirSync(DIR, { recursive: true });
const ROSSI = process.env.ROSSO?.split(',').filter(Boolean) ?? []; const suff = ROSSI.length ? '-rosso' : ''; const SOGLIA = Number(process.env.SOGLIA ?? 3);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const base = salvataggioTutti(missioni, v0); const errori = [];
for (const [w, h] of [[360, 760], [375, 667], [412, 915]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, deviceScaleFactor: 1 });
  if (ROSSI.length) await p.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, ROSSI);
  p.on('console', (x) => { if (x.type() === 'error') errori.push(`${w}: ${x.text().slice(0, 160)}`); }); p.on('pageerror', (e) => errori.push(`${w}: ${e.message.slice(0, 160)}`));
  await p.goto(`http://127.0.0.1:${srv.address().port}/`); await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(base));
  await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForSelector('.scena[data-scena="citta"] [data-episodio].acceso', { state: 'attached' }); await p.waitForTimeout(800);
  const righe = [];
  for (const st of await p.$$eval('[data-stagione]', (xs) => xs.map((x) => x.dataset.stagione))) {
    await p.click(`[data-stagione="${st}"]`); await p.waitForTimeout(300);
    for (const id of await p.$$eval('[data-episodio]', (xs) => xs.map((x) => x.dataset.episodio))) {
      await p.click(`[data-episodio="${id}"] .settore-punto`); await p.waitForTimeout(500);
      const x = await p.evaluate((id) => {
        const st = document.createElement('style'); st.textContent = '.mappa, .mappa * { pointer-events: auto !important; }'; document.head.append(st);
        const s = document.querySelector(`[data-episodio="${id}"]`), n = s.querySelector('.settore-nome'); const r = n.getBoundingClientRect();
        let tot = 0, cop = 0; const da = {};
        for (let y = r.top + 1; y < r.bottom - 1; y += 2) for (let x = r.left + 1; x < r.right - 1; x += 2) { tot++; const t = document.elementFromPoint(x, y); if (!t || !n.contains(t)) { cop++; const d = t?.closest('[data-episodio]'); const k = !t ? 'nulla' : d === s ? `proprio ${t.className || t.tagName}` : d ? `altro ${d.dataset.episodio}` : (t.className?.baseVal ?? t.className ?? t.tagName); da[k] = (da[k] ?? 0) + 1; } }
        st.remove();
        return { pct: tot ? (100 * cop) / tot : 0, da, posto: s.dataset.nome, stretto: n.classList.contains('stretto'), testo: n.textContent };
      }, id);
      righe.push({ id, ...x });
      if (x.pct > SOGLIA) await p.screenshot({ path: `${DIR}/${w}-citta-${id}-coperto${suff}.jpg`, type: 'jpeg', quality: 80 });
    }
  }
  const sopra = righe.filter((r) => r.pct > SOGLIA);
  console.log(`${w}: nomi coperti per più del ${SOGLIA}% ${sopra.length}/36 · max ${Math.max(...righe.map((r) => r.pct)).toFixed(1)}%`);
  for (const r of righe.filter((r) => r.pct > 0).sort((a, b) => b.pct - a.pct)) console.log(`   ${r.id} «${r.testo}» ${r.pct.toFixed(1)}% (${r.posto}${r.stretto ? ', stretto' : ''}) da ${Object.entries(r.da).map(([k, v]) => `${k}:${v}`).join(' ')}`);
  await p.close();
}
console.log(`errori di console: ${errori.length}`);
await b.close(); srv.close();
