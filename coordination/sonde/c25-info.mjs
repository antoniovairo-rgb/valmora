// Sonda C-025 (sola lettura): il primo tocco dopo aver aperto la riga «i» dell'ondata (PO-101) colpisce ciò che il
// giocatore vede? La riga è nel flusso della testata (stile-c18.css:30) e si chiude al pointerdown fuori
// (schermate/Fumetto.tsx:22-25): se la pagina si sposta fra pointerdown e click, il click cade altrove.
// Per ogni episodio di EP e larghezza W, nello schieramento della prima ondata:
//  1. seleziono «Squadre»; 2. apro la «i»; 3. misuro il centro del punto del settore BERSAGLIO (il primo della mappa con
//     pastiglia libera) con la riga aperta; 4. tocco con il mouse esattamente lì (come un dito);
//  5. leggo dove è finita la squadra (pastiglie per settore prima/dopo) e di quanto si è spostata la mappa.
// Braccio di controllo: stesso tocco senza aprire la «i».
// Uso: [EP=e01,e16] [W=360,412] node coordination/sonde/c25-info.mjs <radice con dist/> <cartella foto> <uscita.json>
import { createServer } from 'node:http'; import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c25'; const OUT = process.argv[4] ?? 'c25-info.json'; mkdirSync(DIR, { recursive: true });
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`);
const { missioni, v0 } = missioniDai(join(R, 'data'));
const EP = (process.env.EP ?? missioni.map((m) => m.id).sort().join(',')).split(','); const WS = (process.env.W ?? '360,375,412').split(',').map(Number);
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const H = { 360: 760, 375: 667, 412: 915 };
const RIS = []; const errori = [];
for (const w of WS) {
  const p = await b.newPage({ viewport: { width: w, height: H[w] }, hasTouch: true, reducedMotion: 'reduce' });
  p.on('pageerror', (e) => errori.push(e.message.slice(0, 160)));
  const sc = (n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
  const presenze = () => p.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-settore]')].map((s) => [s.dataset.settore, s.querySelector('[data-presenza]')?.textContent?.trim() ?? ''])));
  await p.goto(URL);
  for (const ep of EP) for (const apri of [true, false]) {
    const m = missioni.find((x) => x.id === ep); const r = { w, ep, apri };
    try {
      await p.evaluate((v) => { localStorage.clear(); localStorage.setItem('valmora-salvataggio', v); }, JSON.stringify(salvataggioTutti(missioni, v0))); await p.reload(); await sc('titolo');
      await p.getByRole('button', { name: 'Riprendi' }).click(); await sc('citta'); await p.waitForTimeout(250);
      if (await p.locator(`[data-stagione="${m.stagione}"]`).count()) await p.click(`[data-stagione="${m.stagione}"]`);
      await p.click(`[data-episodio="${ep}"] .settore-punto`); await p.waitForTimeout(250); await p.click('[data-azione="avvia-episodio"]'); await p.waitForTimeout(200);
      for (let k = 0; k < 3 && await p.locator('[data-azione="conferma-passo"]').count(); k++) { await p.click('[data-azione="conferma-passo"]'); await p.waitForTimeout(150); }
      if (await p.locator('[data-azione="conferma-rigioca"]').count()) await p.click('[data-azione="conferma-rigioca"]');
      await sc('sala'); while (await p.locator('[data-azione="passo"]').count()) { await p.click('[data-azione="passo"]'); await p.waitForTimeout(80); }
      await p.click('[data-azione="avanti"]'); await sc('briefing'); while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) { await p.click('[data-azione="prossimo"], [data-azione="passo"]'); await p.waitForTimeout(80); }
      await p.click('[data-azione="inizia"]'); await sc('schieramento'); await p.waitForTimeout(300);
      await p.click('[data-risorsa="squadre"]'); await p.waitForTimeout(100);
      const settori = await p.evaluate(() => [...document.querySelectorAll('[data-settore]')].map((s) => s.dataset.settore));
      const bersaglio = settori[0]; r.bersaglio = bersaglio;
      const y0 = await p.evaluate(() => document.querySelector('.mappa').getBoundingClientRect().top);
      if (apri) { await p.click('[data-azione="info-ondata"]'); await p.waitForTimeout(200); }
      const riga = await p.evaluate(() => { const e = document.querySelector('[data-info-ondata]'); return e ? +e.getBoundingClientRect().height.toFixed(1) : 0; });
      const pt = await p.evaluate((s) => { const r = document.querySelector(`[data-settore="${s}"] .settore-punto`).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, bersaglio);
      const y1 = await p.evaluate(() => document.querySelector('.mappa').getBoundingClientRect().top);
      if (apri && w === WS[0] && ep === EP[0]) await p.screenshot({ path: `${DIR}/${w}-${ep}-info-aperta.jpg`, type: 'jpeg', quality: 78 });
      const prima = await presenze();
      await p.mouse.click(pt.x, pt.y); await p.waitForTimeout(250);
      const dopo = await presenze(); const y2 = await p.evaluate(() => document.querySelector('.mappa').getBoundingClientRect().top);
      if (apri && w === WS[0] && ep === EP[0]) await p.screenshot({ path: `${DIR}/${w}-${ep}-info-dopo-tocco.jpg`, type: 'jpeg', quality: 78 });
      r.riga = riga; r.spostamento = +(y1 - y2).toFixed(1); r.mappaChiusa = +(y0).toFixed(1);
      r.cambiati = Object.keys(dopo).filter((k) => dopo[k] !== prima[k]); r.colpito = r.cambiati.includes(bersaglio) && r.cambiati.length === 1;
    } catch (e) { r.errore = e.message.slice(0, 160); }
    RIS.push(r); console.log(JSON.stringify(r));
  }
  await p.close();
}
await b.close(); srv.close(); writeFileSync(OUT, JSON.stringify({ RIS, errori }, null, 1));
const con = RIS.filter((r) => r.apri && !r.errore), senza = RIS.filter((r) => !r.apri && !r.errore);
console.log(`con la «i» aperta: bersaglio colpito ${con.filter((r) => r.colpito).length}/${con.length}; senza: ${senza.filter((r) => r.colpito).length}/${senza.length}; errori ${RIS.filter((r) => r.errore).length + errori.length}`);
