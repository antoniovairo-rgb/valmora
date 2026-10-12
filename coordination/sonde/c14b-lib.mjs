// Collaudo C-014b (PO-070): libreria comune delle sonde di sola lettura.
// Serve dist/ della build (vite build) su 127.0.0.1, apre Chromium di sistema e guida il gioco
// con i selettori di src/resa (data-azione, data-scena, data-opzione, data-episodio).
// Le misure sono di scorrimento (document.scrollingElement), tocchi < 44 px e testi tagliati.
// Uso: importata dalle sonde c14b-*.mjs. Radice = cartella del repository (argv[2] o cwd).
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { chromium } from 'playwright-core';

export const RADICE = resolve(process.env.RADICE ?? process.cwd());
export const DIST = join(RADICE, 'dist');
export const OUT = process.env.C14B_OUT ?? join(RADICE, 'out', 'c14b');
mkdirSync(OUT, { recursive: true });
export const MISURE = [[360, 760], [375, 812], [412, 915]];
const TIPI = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' };

export async function avviaServer() {
  const srv = createServer((q, r) => {
    const u = decodeURIComponent((q.url ?? '/').split('?')[0]);
    const p = join(DIST, u === '/' ? 'index.html' : u);
    if (!existsSync(p)) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'content-type': TIPI[extname(p)] ?? 'application/octet-stream' });
    r.end(readFileSync(p));
  });
  // PORTA fissa: ogni chunk è un processo a sé, e localStorage è per origine (porta compresa)
  await new Promise((ok) => srv.listen(Number(process.env.PORTA ?? 0), '127.0.0.1', ok));
  return { srv, url: `http://127.0.0.1:${srv.address().port}/` };
}

export async function apriBrowser() {
  return chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
}

/** Pagina a una misura, con log di console.error e pageerror. Il salvataggio parte vuoto. */
export async function nuovaPagina(b, url, [larg, alt], { pulisci = true } = {}) {
  const p = await b.newPage({ viewport: { width: larg, height: alt }, hasTouch: true, reducedMotion: 'reduce' });
  p.errori = [];
  p.on('console', (x) => { if (x.type() === 'error') p.errori.push(`console: ${x.text()}`); });
  p.on('pageerror', (e) => p.errori.push(`pageerror: ${e.message}`));
  await p.goto(url);
  if (pulisci) { await p.evaluate(() => localStorage.clear()); await p.reload(); }
  return p;
}

/** Attende che la scena visibile sia una di quelle indicate; ritorna il nome trovato. */
export async function attendiScena(p, nomi, timeout = 8000) {
  const h = await p.waitForFunction((nomi) => {
    const s = document.querySelectorAll('.scena');
    if (s.length !== 1 || getComputedStyle(s[0]).opacity !== '1') return null;
    return nomi.includes(s[0].dataset.scena) ? s[0].dataset.scena : null;
  }, nomi, { timeout, polling: 60 }).catch(() => null);
  return h ? await h.jsonValue() : null;
}
export const scenaCorrente = (p) => p.evaluate(() => document.querySelector('.scena')?.dataset.scena ?? null);
export const salvato = (p) => p.evaluate(() => { try { return JSON.parse(localStorage.getItem('valmora-salvataggio') ?? 'null'); } catch { return 'JSON-ROTTO'; } });

/**
 * Misura la schermata visibile: eccedenza verticale/orizzontale (document.scrollingElement),
 * elementi cliccabili con lato < 44 px, testi con scrollWidth > clientWidth (testi tagliati).
 * Ritorna numeri e campioni (max 4 per voce). Non modifica la pagina.
 */
export function misura(p) {
  return p.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0'; };
    const etichetta = (e) => (e.textContent || e.getAttribute('aria-label') || e.className || '').toString().trim().replace(/\s+/g, ' ').slice(0, 24);
    const cliccabili = [...document.querySelectorAll('button, a, [role=button], input, select, textarea')].filter(vis)
      .map((e) => ({ e, r: e.getBoundingClientRect() })).filter(({ r }) => Math.min(r.width, r.height) < 44);
    const testi = [...document.querySelectorAll('body *')].filter((e) => vis(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
    const tagliati = testi.filter((e) => e.scrollWidth > e.clientWidth + 1);
    const s = document.scrollingElement;
    return {
      verticale: s.scrollHeight - s.clientHeight,
      orizzontale: s.scrollWidth - s.clientWidth,
      piccoli: cliccabili.length, piccoliEs: cliccabili.slice(0, 4).map(({ e, r }) => `${etichetta(e)} ${Math.round(r.width)}×${Math.round(r.height)}`),
      tagliati: tagliati.length, tagliatiEs: tagliati.slice(0, 4).map((e) => etichetta(e)),
    };
  });
}

/** Misura e, se c'è un difetto, salva la foto nella cartella di uscita. Ritorna la riga. */
export async function osserva(p, riga) {
  const m = await misura(p);
  const difetto = m.verticale > 0 || m.orizzontale > 0 || m.piccoli > 0 || m.tagliati > 0;
  const rec = { ...riga, scena: riga.scena ?? await scenaCorrente(p), ...m };
  if (difetto && riga.foto !== false) {
    const nome = `${riga.larg}-${(riga.episodio ?? 'x')}-${rec.scena}-${Date.now() % 100000}.png`;
    await p.screenshot({ path: join(OUT, 'foto', nome), fullPage: true }).catch(() => {});
    rec.foto = nome;
  }
  return rec;
}

export const attesa = (p, ms) => p.waitForTimeout(ms);
export const scrivi = (nome, dati) => writeFileSync(join(OUT, nome), JSON.stringify(dati, null, 2));
export const riga = (r) => console.log(JSON.stringify(r));

/** Azione con attesa del cambio di scena: il nodo .scena nuovo (chiave diversa) e visibile. */
export async function agisci(p, azione) {
  await p.evaluate(() => { window.__c14bPrev = document.querySelector('.scena'); });
  await azione();
  await p.waitForFunction(() => { const s = document.querySelector('.scena'); return s && s !== window.__c14bPrev && getComputedStyle(s).opacity === '1'; }, null, { timeout: 4000, polling: 50 }).catch(() => {});
}

/** Profilo persistente: il salvataggio resta tra un chunk e l'altro (ogni chunk è un processo a sé). */
export async function apriPersistente(dir, [larg, alt]) {
  const ctx = await chromium.launchPersistentContext(dir, { executablePath: '/opt/pw-browsers/chromium', viewport: { width: larg, height: alt }, hasTouch: true, reducedMotion: 'reduce', serviceWorkers: 'allow' });
  const p = ctx.pages()[0] ?? await ctx.newPage();
  p.errori = [];
  p.on('console', (x) => { if (x.type() === 'error') p.errori.push(`console: ${x.text()}`); });
  p.on('pageerror', (e) => p.errori.push(`pageerror: ${e.message}`));
  return { ctx, p };
}
