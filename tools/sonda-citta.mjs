// Sonda PO-128 (S-08): arriva alla città a una larghezza e misura il nome dell'episodio scelto rispetto al bordo
// della mappa, con la stessa attesa e lo stesso controllo di tools/foto.mjs. Ripete N volte su build identica.
// Uso: node tools/sonda-citta.mjs [prove=10] [larghezza=412]   (VALMORA_CHROME=<eseguibile> per il browser della CI)
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { chromium } from 'playwright-core';

const [prove = 10, larghezza = 412] = process.argv.slice(2).map(Number);
const TIPI = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const srv = createServer((req, res) => {
  const u = decodeURIComponent((req.url ?? '/').split('?')[0]); const p = join('dist', u === '/' ? 'index.html' : u);
  if (!existsSync(p)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TIPI[extname(p)] ?? 'application/octet-stream' }); res.end(readFileSync(p));
});
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const url = `http://127.0.0.1:${srv.address().port}/`;
// SONDA_ARGS: argomenti in più per il browser (es. --disable-webgl, come un runner senza WebGL).
const browser = await chromium.launch({ args: (process.env.SONDA_ARGS ?? '').split(' ').filter(Boolean), executablePath: process.env.VALMORA_CHROME ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined) });
// SONDA_STATO=<file json di localStorage>: parte da quel salvataggio («Riprendi» → città) invece che dalla prima partita.
const stato = process.env.SONDA_STATO ? JSON.parse(readFileSync(process.env.SONDA_STATO, 'utf8')) : null;
const rossi = (process.env.VALMORA_ROSSI ?? '').split(',').filter(Boolean);
let rosse = 0;
for (let i = 1; i <= prove; i++) {
  const pagina = await browser.newPage({ viewport: { width: larghezza, height: 800 }, reducedMotion: 'reduce' });
  // SONDA_CPU=<n>: CPU rallentata n volte (CDP), come un runner CI carico.
  if (process.env.SONDA_CPU) await (await pagina.context().newCDPSession(pagina)).send('Emulation.setCPUThrottlingRate', { rate: Number(process.env.SONDA_CPU) });
  // SONDA_FONT_MS=<ms>: i caratteri (.woff2) arrivano in ritardo, come in CI (misura di S-01 su e14 o1).
  if (process.env.SONDA_FONT_MS) await pagina.route('**/*.woff2', async (r) => { await new Promise((ok) => setTimeout(ok, Number(process.env.SONDA_FONT_MS))); await r.continue(); });
  if (rossi.length) await pagina.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, rossi);
  const scena = async (nome) => {
    await pagina.waitForSelector(`.scena[data-scena="${nome}"]`, { timeout: 5000 });
    await pagina.waitForFunction(() => document.querySelectorAll('.scena').length === 1 && getComputedStyle(document.querySelector('.scena')).opacity === '1'
      && [...document.querySelectorAll('.mappa')].every((x) => x.dataset.pronta === 'si'), null, { timeout: 5000 });
  };
  await pagina.goto(url); await pagina.evaluate((st) => { localStorage.clear(); for (const [k, v] of Object.entries(st ?? {})) localStorage.setItem(k, v); }, stato); await pagina.reload(); await scena('titolo');
  if (stato) { await pagina.getByRole('button', { name: 'Riprendi' }).click(); await scena('citta'); } else {
    await pagina.getByRole('button', { name: 'Nuova partita' }).click(); await scena('genere');
    await pagina.click('[data-genere="m"]'); await scena('guida'); await pagina.click('[data-azione="guida-salta"]'); await scena('citta');
  }
  if (process.env.SONDA_FONT_MS) await pagina.waitForFunction(() => document.fonts.status === 'loaded' && document.querySelector('.mappa .settore-nome'), null, { timeout: 10000 }).catch(() => {});
  const m = await pagina.evaluate(() => {
    const mappa = document.querySelector('.mappa').getBoundingClientRect(), n = document.querySelector('.settore-nome');
    if (!n) return { nome: null };
    const r = n.getBoundingClientRect(), s = n.closest('[data-episodio]');
    return { trasformata: getComputedStyle(document.querySelector('.scena')).transform !== 'none', mappa: document.querySelector('.mappa').dataset.mappa, nome: n.textContent, fonts: document.fonts.status, posto: s.dataset.nome, largo: n.style.maxWidth, stretto: n.classList.contains('stretto'),
      dx: n.style.getPropertyValue('--nome-dx'), dy: n.style.getPropertyValue('--nome-dy'),
      margini: [r.left - mappa.left, mappa.right - r.right, r.top - mappa.top, mappa.bottom - r.bottom].map((x) => +x.toFixed(2)), w: +r.width.toFixed(2), h: +r.height.toFixed(2),
      tocca: r.left < mappa.left + 5 || r.right > mappa.right - 5 || r.bottom > mappa.bottom - 5 || r.top < mappa.top + 5 };
  });
  if (process.env.SONDA_FOTO) await pagina.screenshot({ path: `${process.env.SONDA_FOTO}-${i}.png` });
  if (m.tocca) rosse++;
  console.log(`prova ${i}: ${m.tocca ? 'ROSSO' : 'verde'} ${JSON.stringify(m)}`);
  await pagina.close();
}
console.log(`${larghezza}px: ${rosse} rosse su ${prove}`);
await browser.close(); srv.close();
