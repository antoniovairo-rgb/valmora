// Sonda C-021: verifica delle correzioni del C-020 nell'interfaccia (dist/), a 360×760, 375×667, 412×915.
//  C20-03 città, tutti i 36 episodi conclusi, ogni disco toccato: nome sopra il cerchio di un altro disco, sopra le sue
//         stelline (.settore-unita), fuori dalla mappa;
//  C20-04 «?» dello schieramento (e01, e04, e06, ondata 1): riquadro [data-aiuto] sotto la barra fissa [data-barra];
//  C20-06 tasto «i» (data-azione=info-ondata): griglia di punti 1 px su 60×60 attorno al centro, elementFromPoint;
//  C20-08 sfida della sala ([data-sfida]) contro i club delle curve dei dati, 36 episodi.
// Uso: node coordination/sonde/c21-c20.mjs <radice> <foto> · ROSSO=C44N01,C44A01,C44I02,C44S03 per il braccio rosso
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c21'; mkdirSync(DIR, { recursive: true });
const ROSSI = process.env.ROSSO?.split(',').filter(Boolean) ?? []; const suff = ROSSI.length ? '-rosso' : '';
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const M = await import(`${R}/src/logica/missione.ts`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`); const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const base = salvataggioTutti(missioni, v0); const errori = [];
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 10000 });
const carica = async (p, sal) => { await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(sal)); await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click(); };
for (const [w, h] of [[360, 760], [375, 667], [412, 915]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  if (ROSSI.length) await p.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, ROSSI);
  p.on('console', (x) => { if (x.type() === 'error') errori.push(`${w}: ${x.text().slice(0, 160)}`); }); p.on('pageerror', (e) => errori.push(`${w}: ${e.message.slice(0, 160)}`));
  await p.goto(URL);
  // C20-03
  await carica(p, base); await sc(p, 'citta'); await p.waitForTimeout(400);
  const dischi = [], stelline = [], fuori = [];
  for (const st of await p.$$eval('[data-stagione]', (xs) => xs.map((x) => x.dataset.stagione))) {
    await p.click(`[data-stagione="${st}"]`); await p.waitForTimeout(150);
    for (const id of await p.$$eval('[data-episodio]', (xs) => xs.map((x) => x.dataset.episodio))) {
      await p.click(`[data-episodio="${id}"] .settore-punto`); await p.waitForTimeout(90);
      const x = await p.evaluate((id) => {
        const n = document.querySelector(`[data-episodio="${id}"].acceso .settore-nome`); if (!n) return null;
        const r = n.getBoundingClientRect(), mp = document.querySelector('.mappa').getBoundingClientRect();
        const ov = (a, c) => Math.max(0, Math.min(a.right, c.right) - Math.max(a.left, c.left)) * Math.max(0, Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top));
        const altri = [...document.querySelectorAll('[data-episodio]')].filter((d) => d.dataset.episodio !== id);
        const su = altri.filter((d) => { const c = d.querySelector('.settore-punto').getBoundingClientRect(), cx = c.left + c.width / 2, cy = c.top + c.height / 2;
          const px = Math.max(r.left, Math.min(cx, r.right)), py = Math.max(r.top, Math.min(cy, r.bottom)); return Math.hypot(px - cx, py - cy) < c.width / 2 - 0.5; }).map((d) => d.dataset.episodio);
        const st = altri.map((d) => [d.dataset.episodio, d.querySelector('.settore-unita')]).filter(([, u]) => u).map(([e, u]) => [e, ov(r, u.getBoundingClientRect())]).filter(([, a]) => a > 0).map(([e, a]) => `${e}:${Math.round(a)}px²`);
        return { su, st, fuori: r.left < mp.left - 0.5 || r.right > mp.right + 0.5 || r.top < mp.top - 0.5 || r.bottom > mp.bottom + 0.5 };
      }, id);
      if (!x) continue;
      if (x.su.length) dischi.push(`${id}>${x.su.join('+')}`); if (x.st.length) stelline.push(`${id}>${x.st.join('+')}`); if (x.fuori) fuori.push(id);
      if (x.su.length || x.st.length) await p.screenshot({ path: `${DIR}/${w}-citta-${id}${suff}.jpg`, type: 'jpeg', quality: 72 });
    }
  }
  console.log(`${w} C20-03 città: nome sopra altri dischi ${dischi.length}/36 ${dischi.join(' ')}; sopra stelline ${stelline.length}/36 ${stelline.join(' ')}; fuori dalla mappa ${fuori.length}`);
  // C20-04 e C20-06
  for (const id of ['e01', 'e04', 'e06']) {
    const m = missioni.find((x) => x.id === id);
    await carica(p, { ...base, in_corso: M.iniziaMissione(m, { ...v0 }, dich) }); await sc(p, 'schieramento'); await p.waitForTimeout(300);
    const i = await p.evaluate(() => { const e = document.querySelector('[data-azione="info-ondata"]'); if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity, n = 0;
      for (let dx = -30; dx <= 30; dx++) for (let dy = -30; dy <= 30; dy++) { const t = document.elementFromPoint(cx + dx, cy + dy); if (t && (t === e || e.contains(t))) { n++; x0 = Math.min(x0, dx); x1 = Math.max(x1, dx); y0 = Math.min(y0, dy); y1 = Math.max(y1, dy); } }
      return { tasto: `${Math.round(r.width)}×${Math.round(r.height)}`, zona: `${x1 - x0 + 1}×${y1 - y0 + 1}`, punti: n }; });
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(100);
    await p.click('[data-azione="aiuto"]'); await p.waitForTimeout(500);
    const a = await p.evaluate(() => { const el = document.querySelector('[data-aiuto]'), barra = document.querySelector('[data-barra]'); if (!el) return null; const r = el.getBoundingClientRect(), q = barra?.getBoundingClientRect();
      const ov = q ? Math.max(0, Math.min(r.right, q.right) - Math.max(r.left, q.left)) * Math.max(0, Math.min(r.bottom, q.bottom) - Math.max(r.top, q.top)) : 0;
      return { top: Math.round(r.top), bottom: Math.round(r.bottom), barra: q ? Math.round(q.top) : null, sotto: Math.round(ov), dentro: r.top >= 0 && r.bottom <= innerHeight }; });
    console.log(`${w} ${id} C20-06 «i»: ${JSON.stringify(i)} · C20-04 «?»: ${JSON.stringify(a)}`);
    if (id === 'e01') await p.screenshot({ path: `${DIR}/${w}-e01-schieramento-aiuto${suff}.jpg`, type: 'jpeg', quality: 72 });
  }
  // C20-08
  if (w === 360) {
    const male = [];
    for (const m of missioni) {
      await carica(p, base); await sc(p, 'citta');
      const st = p.locator(`[data-stagione="${m.stagione}"]`); if (await st.count()) await st.click();
      await p.locator(`[data-episodio="${m.id}"] .settore-punto`).click(); await p.click('[data-azione="avvia-episodio"]');
      if (await p.locator('.tripla').count()) { for (let k = 0; k < 5 && (await p.locator('[data-azione="conferma-passo"]').count()); k++) await p.click('[data-azione="conferma-passo"]'); await p.click('[data-azione="conferma-rigioca"]'); }
      await sc(p, 'sala').catch(() => {});
      const vista = (await p.getAttribute('[data-sfida]', 'data-sfida').catch(() => null)) ?? '';
      const attesa = [...new Set(m.mappa.settori.filter((s) => s.tipo === 'curva' && s.club).map((s) => s.club))].join(',');
      if (vista !== attesa) male.push(`${m.id}: «${vista}» ≠ «${attesa}»`);
      if (m.id === 'e04' || m.id === 'e02') await p.screenshot({ path: `${DIR}/${w}-${m.id}-sala-sfida${suff}.jpg`, type: 'jpeg', quality: 72 });
    }
    console.log(`360 C20-08 sfida: diversa dai club delle curve in ${male.length}/36 ${male.join('; ')}`);
  }
  await p.close();
}
console.log(`errori di console: ${errori.length} ${[...new Set(errori)].slice(0, 5).join(' | ')}`);
await b.close(); srv.close();
