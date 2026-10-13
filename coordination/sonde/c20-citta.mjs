// Sonda C-020 (C17-12): nella città, scelto ogni episodio (salvataggio con tutti i 36 conclusi, tutte le stagioni),
// il nome dell'episodio scelto (.acceso .settore-nome) copre altri dischi (.settore-punto, .settore-unita degli altri
// episodi)? Sta dentro la mappa? Area sovrapposta in px², a 360×760, 375×667, 412×915.
// Braccio rosso: ROSSO=1 accende __NO_C42N01 (nome sempre sotto il disco, come prima della 0.15.0).
// Uso: node coordination/sonde/c20-citta.mjs <radice con dist/> [cartella foto]
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3]; if (DIR) mkdirSync(DIR, { recursive: true });
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`); const { variabiliIniziali } = await import(`${R}/src/logica/condizioni.ts`); const { GAME_VERSION } = await import(`${R}/src/versione.ts`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const v0 = variabiliIniziali(dich.values());
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x).sort((a, c) => a.episodio - c.episodio);
const salv = { save_version: 2, game_version: GAME_VERSION, seme: 1, caso: 1, variabili: v0, missioni_concluse: missioni.map((m) => m.id),
  episodi: Object.fromEntries(missioni.map((m) => [m.id, { migliore: { esito: m.esiti[0].id, fallita: false, stelle: 2 }, tentativi: 1, variabili_prima: v0, variabili_dopo: v0 }])), genere: 'f', rapporto_aperto: null, in_corso: null };
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const errori = []; const RIS = [];
for (const [w, h] of [[360, 760], [375, 667], [412, 915]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  if (process.env.ROSSO) await p.addInitScript(() => { window.__NO_C42N01 = true; });
  p.on('console', (x) => { if (x.type() === 'error') errori.push(`${w}: ${x.text().slice(0, 140)}`); }); p.on('pageerror', (e) => errori.push(`${w}: ${e.message.slice(0, 140)}`));
  await p.goto(URL); await p.evaluate((s) => { localStorage.clear(); localStorage.setItem('valmora-guida-vista', 'si'); localStorage.setItem('valmora-salvataggio', s); }, JSON.stringify(salv));
  await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForTimeout(800);
  for (const st of [1, 2, 3]) {
    const tab = p.locator(`[data-stagione="${st}"]`); if (await tab.count()) { await tab.click(); await p.waitForTimeout(400); }
    for (const m of missioni.filter((x) => x.stagione === st)) {
      const d = p.locator(`[data-episodio="${m.id}"] .settore-punto`); if (!(await d.count())) { RIS.push({ w, ep: m.id, manca: true }); continue; }
      await d.click(); await p.waitForTimeout(250);
      const x = await p.evaluate((id) => { const ov = (a, c) => Math.max(0, Math.min(a.right, c.right) - Math.max(a.left, c.left)) * Math.max(0, Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top));
        const s = document.querySelector(`[data-episodio="${id}"]`); const n = s?.querySelector('.settore-nome'); const mp = s?.closest('.mappa');
        if (!n || !s.classList.contains('acceso')) return { scelto: !!s?.classList.contains('acceso'), nome: !!n };
        const r = n.getBoundingClientRect(); const m = mp.getBoundingClientRect();
        const altri = [...document.querySelectorAll('[data-episodio]')].filter((e) => e !== s).flatMap((e) => [...e.querySelectorAll('.settore-punto, .settore-unita')]);
        const sopra = altri.map((e) => [e.closest('[data-episodio]').dataset.episodio, ov(r, e.getBoundingClientRect())]).filter(([, a]) => a > 0);
        return { scelto: true, nome: true, testo: n.textContent, posto: s.dataset.nome, dentro: r.left >= m.left && r.right <= m.right && r.top >= m.top && r.bottom <= m.bottom, area: Math.round(sopra.reduce((t, [, a]) => t + a, 0)), su: sopra.map(([e, a]) => `${e} ${Math.round(a)}`).join(', ') };
      }, m.id);
      RIS.push({ w, ep: m.id, ...x }); if (DIR && x.area > 0) await p.screenshot({ path: `${DIR}/${w}-citta-${m.id}${process.env.ROSSO ? '-rosso' : ''}.jpg`, type: 'jpeg', quality: 70 });
    }
  }
  await p.close();
}
for (const w of [360, 375, 412]) { const x = RIS.filter((r) => r.w === w); const ok = x.filter((r) => r.nome);
  console.log(`${process.env.ROSSO ? 'ROSSO' : 'VERDE'} ${w}: episodi ${x.length}, scelti col nome ${ok.length}, nome sopra altri dischi ${ok.filter((r) => r.area > 0).length} (max ${Math.max(0, ...ok.map((r) => r.area))} px²), nome fuori dalla mappa ${ok.filter((r) => !r.dentro).length}`);
  for (const r of x.filter((r) => !r.nome || r.area > 0 || !r.dentro)) console.log(`  ${r.ep}: ${JSON.stringify(r)}`); }
console.log(`errori di console: ${errori.length}`); for (const e of errori.slice(0, 10)) console.log('  ' + e);
await b.close(); srv.close();
