// Sonda C-014: gioco installato e offline (service worker public/sw.js) su http://localhost.
// Uso: node coordination/sonde/c14-offline.mjs <dist A> <dist B> <cartella foto>
//   A e B sono due build dello stesso commit con timbro diverso (impronte dei file diverse), come due rilasci notturni.
// O1 prima visita della sola home, poi offline → Nuova partita
// O2 e01 giocato online (i pezzi caricati entrano in cache), poi offline → e02 dall'inizio alla fine
// O3 come O2 con la build A, poi online si apre la home della build B (rilascio nuovo), poi offline → Riprendi / città
import { createServer } from 'node:http'; import { readFileSync, existsSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const [A, Bd, FOTO] = process.argv.slice(2).map((x) => resolve(x));
const R = resolve('.');
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
let radice = A, rete = true;
const srv = createServer((q, r) => { if (!rete) { r.destroy(); return; } const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(radice, u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://localhost:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const sc = (p, n, timeout = 8000) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && (!n || s[0].dataset.scena === n) && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout, polling: 'raf' });
const quale = (p) => p.evaluate(() => document.querySelector('.scena')?.dataset.scena ?? `nessuna scena (testo ${document.body.innerText.trim().length} caratteri)`);
const passi = async (p) => { while (await p.locator('[data-azione="passo"]:visible').count()) { await p.click('[data-azione="passo"]:visible'); await p.waitForTimeout(40); } };
async function contesto() {
  const ctx = await b.newContext({ viewport: { width: 360, height: 760 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  const p = await ctx.newPage(); p.errori = []; p.on('pageerror', (e) => p.errori.push(e.message.slice(0, 120))); p.on('console', (x) => { if (x.type() === 'error') p.errori.push(x.text().slice(0, 120)); });
  return { ctx, p };
}
const pronto = async (p) => { await p.evaluate(() => navigator.serviceWorker.ready); await p.waitForTimeout(500); await p.reload(); await sc(p, 'titolo'); };
async function nuova(p) { await p.getByRole('button', { name: 'Nuova partita' }).click(); await p.waitForTimeout(250); if ((await p.locator('[data-azione="conferma-nuova"]').count())) await p.click('[data-azione="conferma-nuova"]'); await sc(p, 'genere'); await p.click('[data-genere="m"]'); await sc(p, 'citta'); }
/** Episodio giocato a caso ma valido: tutte le unità sul primo settore, prima opzione. */
async function episodio(p) {
  await p.click('[data-azione="avvia-episodio"]'); await sc(p, 'sala'); await passi(p); await p.click('[data-azione="avanti"]'); await sc(p, 'briefing'); await passi(p); await p.click('[data-azione="inizia"]');
  for (let k = 0; k < 200; k++) {
    await sc(p, null); const q = await quale(p);
    if (q === 'verbale') return 'verbale';
    if (q === 'schieramento') { await p.click('[data-azione="conferma"]'); continue; }
    if (q === 'chiamata') { await p.locator('[data-opzione]').first().click(); await p.waitForTimeout(300); continue; }
    if (q === 'risposta') { await p.click('[data-azione="continua"]'); continue; }
    if (q === 'chiusura') { await p.click('[data-azione="rapporto"]'); continue; }
    if (q === 'rapporto') { await p.click('[data-azione="avanti"]'); continue; }
    return q;
  }
}
const prova = async (nome, f) => { if (process.env.SOLO && !nome.startsWith(process.env.SOLO)) return; try { console.log(`${nome}: ${await f()}`); } catch (e) { console.log(`${nome}: ECCEZIONE ${e.message.split('\n')[0]}`); } };

const SOLO = process.env.SOLO;
const prova0 = prova;
await prova('O1 sola home online, poi offline → Nuova partita', async () => {
  radice = A; rete = true; const { ctx, p } = await contesto(); await p.goto(URL); await pronto(p);
  rete = false; await ctx.setOffline(true); await p.reload(); await sc(p, 'titolo');
  await p.getByRole('button', { name: 'Nuova partita' }).click(); await p.waitForTimeout(400); if (await p.locator('[data-genere="m"]').count()) await p.click('[data-genere="m"]'); await p.waitForTimeout(1500);
  const q = await quale(p); await p.screenshot({ path: join(FOTO, 'offline-O1.png') }); await p.reload(); await p.waitForTimeout(800); const dopo = await quale(p);
  await ctx.close(); return `dopo la scelta del protagonista: «${q}»; ricaricando: «${dopo}»; errori ${p.errori.length}: ${[...new Set(p.errori)].slice(0, 2).join(' | ')}`;
});
await prova('O2 e01 online, poi offline → e02 intero', async () => {
  radice = A; rete = true; const { ctx, p } = await contesto(); await p.goto(URL); await pronto(p); await nuova(p); const e1 = await episodio(p);
  await passi(p); await p.click('[data-azione="citta"]'); await sc(p, 'citta');
  rete = false; await ctx.setOffline(true); await p.reload(); await sc(p, 'titolo'); await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta');
  const e2 = await episodio(p); await p.screenshot({ path: join(FOTO, 'offline-O2.png') });
  await ctx.close(); return `e01 online → «${e1}»; e02 offline → «${e2}»; errori ${p.errori.length}: ${[...new Set(p.errori)].slice(0, 2).join(' | ')}`;
});
await prova('O3 build A giocata online, rilascio B aperto online solo in home, poi offline → Riprendi', async () => {
  radice = A; rete = true; const { ctx, p } = await contesto(); await p.goto(URL); await pronto(p); await nuova(p); const e1 = await episodio(p); console.log(`  O3: e01 → ${e1}`); await passi(p); await p.click('[data-azione="citta"]'); await sc(p, 'citta'); console.log('  O3: città');
  await p.click('[data-azione="avvia-episodio"]'); await sc(p, 'sala'); await passi(p); await p.click('[data-azione="avanti"]'); await sc(p, 'briefing'); await passi(p); await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento'); // e02 in corso
  console.log('  O3: e02 in corso sulla build A'); radice = Bd; await p.reload(); await sc(p, 'titolo'); console.log('  O3: home B online'); const versione = await p.textContent('[data-versione]');
  rete = false; await ctx.setOffline(true); await p.reload(); await p.waitForTimeout(1500); console.log(`  O3: offline dopo ricarica «${await quale(p)}»`); await p.screenshot({ path: join(FOTO, 'offline-O3-home.png') });
  await p.getByRole('button', { name: 'Riprendi' }).click({ timeout: 5000 }); await p.waitForTimeout(2000); const q = await quale(p); await p.screenshot({ path: join(FOTO, 'offline-O3.png') });
  await ctx.close(); return `home B online: «${versione.trim()}»; offline, Riprendi → «${q}»; errori ${p.errori.length}: ${[...new Set(p.errori)].slice(0, 2).join(' | ')}`;
});
await prova('O4 cache dopo due rilasci (A giocata, B giocata): file della build A ancora in cache', async () => {
  radice = A; rete = true; const { ctx, p } = await contesto(); await p.goto(URL); await pronto(p); await nuova(p); await episodio(p);
  radice = Bd; await p.goto(URL); await sc(p, 'titolo'); await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta'); await episodio(p);
  const voci = await p.evaluate(async () => { const out = {}; for (const n of await caches.keys()) out[n] = (await (await caches.open(n)).keys()).map((r) => new URL(r.url).pathname); return out; });
  const { readdirSync } = await import('node:fs'); const a = new Set(readdirSync(join(A, 'assets'))); const bb = new Set(readdirSync(join(Bd, 'assets')));
  const tutte = Object.values(voci).flat(); const soloA = tutte.filter((x) => x.startsWith('/assets/') && a.has(x.slice(8)) && !bb.has(x.slice(8)));
  await ctx.close(); return `cache ${Object.keys(voci).join(',')}: ${tutte.length} voci, di cui ${soloA.length} file della sola build A (vecchia) mai tolti`;
});
await b.close(); srv.close();
