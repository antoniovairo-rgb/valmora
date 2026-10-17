// Sonda C-033 (PO-120, «partita da giocatore»): un browser che resta aperto, a 360×760 col dito, sulla build <radice>/dist,
// comandato passo per passo via HTTP locale (curl) da chi gioca: legge la schermata, decide, tocca. Nessuna scelta
// automatica: ogni tocco è un comando. Ogni comando e il testo visibile finiscono nel giornale (JSONL), le foto nella cartella.
// Comandi: GET /stato · /tocca?s=<selettore css>[&n=<indice>] · /testo?t=<testo del pulsante> · /foto?nome=… · /attendi?ms=…
//          /js?c=<espressione> (solo lettura per misure) · /fine
// Uso: PORTA=9333 W=360 H=760 node coordination/sonde/c33-giocatore.mjs <radice> <cartella foto> <giornale.jsonl>
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync, appendFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2]); const DIR = process.argv[3]; const LOG = process.argv[4]; mkdirSync(DIR, { recursive: true });
const W = Number(process.env.W ?? 360), H = Number(process.env.H ?? 760), PORTA = Number(process.env.PORTA ?? 9333);
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: W, height: H }, hasTouch: true, deviceScaleFactor: 1 });
const errori = []; p.on('pageerror', (e) => errori.push(e.message.slice(0, 200))); p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text().slice(0, 200)); });
await p.goto(URL); let passi = 0;
const stato = () => p.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
  const scena = [...document.querySelectorAll('.scena')].map((s) => s.dataset.scena).join(',');
  const testo = (document.querySelector('main') ?? document.body).innerText.replace(/\n{2,}/g, '\n').trim();
  const comandi = [...document.querySelectorAll('button, [role="button"], a, input')].filter(vis).map((e) => {
    const a = ['data-azione', 'data-opzione', 'data-risorsa', 'data-settore', 'data-episodio', 'data-stagione', 'data-presenza'].map((k) => e.getAttribute(k) ? `${k}=${e.getAttribute(k)}` : (e.closest(`[${k}]`) && k !== 'data-azione' && k !== 'data-opzione' ? `${k}~${e.closest(`[${k}]`).getAttribute(k)}` : '')).filter(Boolean).join(' ');
    return `${e.tagName.toLowerCase()}${e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : ''} [${a}] «${(e.innerText || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 70)}»${e.disabled ? ' (spento)' : ''}${e.getAttribute('aria-pressed') === 'true' ? ' (premuto)' : ''}`; });
  const mappa = document.querySelector('.mappa:not(.citta)'); const settori = mappa ? [...mappa.querySelectorAll('[data-settore]')].map((s) => `${s.dataset.settore}: ${s.querySelector('.settore-nome')?.textContent ?? ''} ${s.className.replace(/\s+/g, ' ')} ${s.querySelector('.settore-unita')?.innerText.replace(/\s+/g, ' ') ?? ''}`) : [];
  return { scena, testo, comandi, settori, tono: document.querySelector('[data-tono]')?.dataset.tono ?? null, folla: document.querySelector('.mappa')?.getAttribute('data-folla') ?? null };
});
const log = (o) => appendFileSync(LOG, JSON.stringify({ passi, ora: new Date().toISOString(), ...o }) + '\n');
createServer(async (q, r) => {
  const u = new globalThis.URL(q.url, 'http://x'); const op = u.pathname.slice(1); let out = {};
  try {
    if (op === 'stato') out = await stato();
    else if (op === 'tocca') { const s = u.searchParams.get('s'), n = Number(u.searchParams.get('n') ?? 0); passi++; await p.locator(s).nth(n).tap(); await p.waitForTimeout(Number(u.searchParams.get('ms') ?? 700)); out = await stato(); log({ op, s, n, scena: out.scena }); }
    else if (op === 'testo') { const t = u.searchParams.get('t'); passi++; await p.getByRole('button', { name: t }).first().tap(); await p.waitForTimeout(Number(u.searchParams.get('ms') ?? 700)); out = await stato(); log({ op, t, scena: out.scena }); }
    else if (op === 'foto') { const nome = u.searchParams.get('nome'); await p.screenshot({ path: join(DIR, `${nome}.jpg`), type: 'jpeg', quality: 80, fullPage: u.searchParams.get('pieno') === '1' }); out = { foto: nome }; log({ op, nome }); }
    else if (op === 'attendi') { await p.waitForTimeout(Number(u.searchParams.get('ms') ?? 500)); out = await stato(); }
    else if (op === 'js') out = { valore: await p.evaluate(u.searchParams.get('c')) };
    else if (op === 'fine') { out = { passi, errori }; log({ op, passi, errori }); r.end(JSON.stringify(out)); await b.close(); srv.close(); process.exit(0); }
    if (out.testo !== undefined) log({ op: 'vista', scena: out.scena, testo: out.testo, tono: out.tono, folla: out.folla });
  } catch (e) { out = { errore: e.message.slice(0, 300) }; }
  out.errori = errori.length; r.writeHead(200, { 'content-type': 'application/json' }); r.end(JSON.stringify(out, null, 1));
}).listen(PORTA, '127.0.0.1', () => console.log(`pronto su ${PORTA}, gioco su ${URL}`));
