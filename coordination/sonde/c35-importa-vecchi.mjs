// Sonda C-035: salvataggi veri esportati da build vecchie (file .json in una cartella) importati col pulsante nella
// build <radice>, poi «Riprendi»: scena in cui si riparte, chiamata aperta, errori di importazione e di console.
// Uso: node coordination/sonde/c35-importa-vecchi.mjs <radice> <cartella salvataggi> <uscita.json>
import { createServer } from 'node:http'; import { readFileSync, existsSync, writeFileSync, readdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2]); const DIR = process.argv[3]; const OUT = process.argv[4];
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 360, height: 760 }, hasTouch: true, reducedMotion: 'reduce' }); const errori = [];
p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text().slice(0, 160)); }); p.on('pageerror', (e) => errori.push(e.message.slice(0, 160)));
await p.goto(`http://127.0.0.1:${srv.address().port}/`);
const sc = (n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
const ris = [];
for (const f of readdirSync(DIR).filter((x) => x.endsWith('.json')).sort()) {
  const r = { file: f };
  try {
    await p.evaluate(() => localStorage.clear()); await p.reload(); await sc('titolo');
    await p.setInputFiles('[data-importa]', join(DIR, f)); await p.waitForTimeout(800); r.erroreImporta = await p.locator('[data-errore-importa]').count();
    await p.reload(); await sc('titolo'); const riprendi = p.getByRole('button', { name: 'Riprendi' }); r.riprendi = await riprendi.count();
    if (r.riprendi) { await riprendi.click(); await p.waitForTimeout(2000); }
    Object.assign(r, await p.evaluate(() => ({ scena: document.querySelector('.scena')?.dataset.scena, chiamata: [...document.querySelectorAll('[data-messaggio^="chiamata-"]')].at(-1)?.dataset.messaggio ?? null })));
  } catch (e) { r.errore = e.message.slice(0, 200); }
  ris.push(r); console.log(JSON.stringify(r));
}
await b.close(); srv.close(); writeFileSync(OUT, JSON.stringify({ ris, errori }, null, 1));
console.log(`file ${ris.length}; importati senza errore ${ris.filter((r) => !r.erroreImporta && !r.errore).length}; errori di console ${errori.length}`);
