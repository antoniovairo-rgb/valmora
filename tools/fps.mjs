// Fotogrammi al secondo della mappa animata nel browser SENZA interfaccia (Chromium headless, WebGL
// via SwiftShader sulla CPU): NON valgono per un telefono vero, servono solo a confrontare versioni.
// Uso: node tools/fps.mjs [build=dist] [secondi=5]. Misura sulla sala operativa (folla, corteo, aloni)
// a 360 px, senza rallentamento e con la CPU rallentata 4× (CDP), N prove ciascuno.
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from 'playwright-core';

const [build = 'dist', secondi = '5'] = process.argv.slice(2);
const PROVE = 3;
const TIPI = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff' };
const srv = createServer((req, res) => {
  const u = decodeURIComponent((req.url ?? '/').split('?')[0]); const p = join(build, u === '/' ? 'index.html' : u);
  if (!existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TIPI[extname(p)] ?? 'application/octet-stream' }); res.end(readFileSync(p));
});
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const browser = await chromium.launch({ executablePath: process.env.VALMORA_CHROME ?? '/opt/pw-browsers/chromium' });
const stat = (xs) => { const s = [...xs].sort((a, b) => a - b); const media = xs.reduce((a, b) => a + b, 0) / xs.length;
  return { prove: xs.length, media: +media.toFixed(1), mediana: s[Math.floor(s.length / 2)], min: s[0], max: s.at(-1), dispersione: +Math.sqrt(xs.reduce((a, b) => a + (b - media) ** 2, 0) / xs.length).toFixed(1) }; };
try {
  for (const rallenta of [1, 4]) {
    const misure = [];
    for (let i = 0; i < PROVE; i++) {
      const pg = await browser.newPage({ viewport: { width: 360, height: 800 } });
      await pg.goto(`http://127.0.0.1:${srv.address().port}/`);
      await pg.evaluate(() => localStorage.clear()); await pg.reload();
      await pg.getByRole('button', { name: 'Nuova partita' }).click();
      await pg.click('[data-genere="m"]'); await pg.click('[data-azione="avvia-episodio"]');
      await pg.waitForFunction(() => document.querySelector('.mappa')?.getAttribute('data-pronta') === 'si');
      const cdp = await pg.context().newCDPSession(pg);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: rallenta });
      await pg.waitForTimeout(500);
      misure.push(await pg.evaluate((ms) => new Promise((ok) => {
        let n = 0; const t0 = performance.now();
        const f = () => { n++; if (performance.now() - t0 < ms) requestAnimationFrame(f); else ok(+(n * 1000 / (performance.now() - t0)).toFixed(1)); };
        requestAnimationFrame(f);
      }), Number(secondi) * 1000));
      await pg.close();
    }
    console.log(`CPU ${rallenta}×: fps ${JSON.stringify(stat(misure))} (campioni: ${misure.join(', ')})`);
  }
} finally { await browser.close(); srv.close(); }
