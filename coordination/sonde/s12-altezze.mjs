// S-12 (verifica backlog PO-052/053/058/114): altezza di pagina di ogni schermata della partita e01. Uso: VP=360x640,... [FOTO=0] node coordination/sonde/s12-altezze.mjs <radice con dist/> <cartella foto>. Derivata da rev-schermate.mjs.
import { createServer } from 'node:http'; import { readFileSync, existsSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2]); const LARG = (process.argv[3] ?? '360,375,412').split(',').map(Number);
const SPENTI = (process.env.SPENTI ?? '').split(',').filter(Boolean);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const { attenta } = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
console.log(`interruttori rossi: ${SPENTI.join(',') || 'nessuno (verde)'}`);
const out = (id, larg, cosa, esito) => console.log(`${id} · ${larg}px · ${cosa} → ${esito}`);

async function pagina(larg, ridotto = true) {
  const p = await b.newPage({ viewport: { width: larg, height: 760 }, hasTouch: true, reducedMotion: ridotto ? 'reduce' : 'no-preference' });
  if (SPENTI.length) await p.addInitScript((xs) => { for (const x of xs) globalThis[`__NO_${x}`] = true; }, SPENTI);
  const errori = []; p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text()); }); p.on('pageerror', (e) => errori.push(e.message));
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload(); p.errori = errori; return p;
}
const salvato = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('valmora-salvataggio') ?? 'null'));
const piano = (m, v) => { const g = attenta(creaCaso(1), dich); let s = M.iniziaMissione(m, v, dich); const ond = [];
  while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = []; for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); rs.push([c.id, o]); s = M.rispondi(m, s, c.id, o, dich); } ond.push({ d, rs }); s = M.chiudiOndata(m, s, dich); }
  return { ond, esito: M.concludiMissione(m, s, dich).esito.id }; };
async function schiera(p, d) { for (const [r, ps] of Object.entries(d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`); } }
// S-12: pilota generico (scena per scena) su e01 col piano del bot attento; misura altezza pagina e perché.
const lento = (p) => p.waitForFunction(() => { const s = document.querySelectorAll('.scena'); return s.length === 1 && getComputedStyle(s[0]).opacity === '1'; }, null, { timeout: 8000 }).catch(() => {});
const misura = (p) => p.evaluate(() => {
  const s = document.scrollingElement; const vis = (e) => { const r = e.getBoundingClientRect(); const c = getComputedStyle(e); return r.width > 0 && r.height > 0 && c.visibility !== 'hidden' && c.display !== 'none'; };
  const sc = document.querySelector('.scena'); const blocchi = [];
  const main = document.querySelector('main') ?? document.body;
  for (const e of [...main.querySelectorAll(':scope > *'), ...(sc ? sc.querySelectorAll(':scope > *') : [])]) if (vis(e) && getComputedStyle(e).position !== 'fixed') blocchi.push(`${(e.className && typeof e.className === 'string' ? e.className.split(' ')[0] : e.tagName.toLowerCase())}:${Math.round(e.getBoundingClientRect().height)}`);
  const fissi = [...document.querySelectorAll('body *')].filter((e) => vis(e) && getComputedStyle(e).position === 'fixed' && e.getBoundingClientRect().height > 30).map((e) => `${String(e.className).split(' ')[0]}:${Math.round(e.getBoundingClientRect().height)}`);
  const passo = document.querySelector('[data-passo], .passo-numero, .passi-segno')?.textContent?.trim().slice(0, 12) ?? '';
  return { pagina: s.scrollHeight, schermo: innerHeight, ecc: s.scrollHeight - innerHeight, orizz: s.scrollWidth - s.clientWidth, scena: sc?.dataset.scena ?? '?', blocchi: blocchi.join(' '), fissi: fissi.join(' '), titolo: (sc?.querySelector('h1,h2,h3,p')?.textContent ?? '').trim().slice(0, 40) };
});
// REV=1: anche le misure della revisione del 2026-10-11 (caratteri, tocchi, tagli, sovrapposizioni), da rev-schermate.mjs
const misuraTutto = (p) => p.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0'; };
  const foglie = [...document.querySelectorAll('body *')].filter((e) => vis(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && !e.closest('.mappa-tela'));
  const font = Math.min(...foglie.map((e) => parseFloat(getComputedStyle(e).fontSize)));
  const piccoli = [...document.querySelectorAll('button, a, [role=button]')].filter(vis).map((e) => ({ e, r: e.getBoundingClientRect() })).filter(({ r }) => r.width < 44 || r.height < 44).map(({ e, r }) => `${(e.textContent || e.getAttribute('aria-label') || e.className).trim().slice(0, 18)} ${Math.round(r.width)}×${Math.round(r.height)}`);
  const tagliati = foglie.filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible').map((e) => e.textContent.trim().slice(0, 30));
  // sovrapposizioni fra testi che non stanno uno dentro l'altro
  const R = foglie.map((e) => ({ e, r: e.getBoundingClientRect() })); const sov = [];
  for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) { const a = R[i], b = R[j]; if (a.e.contains(b.e) || b.e.contains(a.e)) continue;
    const ov = Math.max(0, Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left)) * Math.max(0, Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top));
    if (ov > 40) sov.push(`«${a.e.textContent.trim().slice(0, 14)}» × «${b.e.textContent.trim().slice(0, 14)}» ${Math.round(ov)}px²`); }
  const s = document.scrollingElement;
  return { verticale: s.scrollHeight - innerHeight, orizzontale: s.scrollWidth - s.clientWidth, font, piccoli: piccoli.slice(0, 6), tagliati: tagliati.slice(0, 4), sov: sov.slice(0, 6) };
});
const RIS = []; const DIR = process.argv[3]; const VP = (process.env.VP ?? '360x640,360x760,375x667,412x830,412x915').split(',').map((v) => v.split('x').map(Number));
async function rileva(p, w, h, nome) { const x = await misura(p); const n = RIS.filter((r) => r.w === w && r.h === h && r.nome.startsWith(nome)).length; const id = `${nome}${n ? '-' + (n + 1) : ''}`; RIS.push({ w, h, nome: id, ...x, ...(process.env.REV ? { rev: await misuraTutto(p) } : {}) }); if (process.env.FOTO !== '0') await p.screenshot({ path: `${DIR}/${w}x${h}-${id}.png`, fullPage: true }); }
const c = async (p, sel) => { if (await p.locator(sel).count()) { await p.locator(sel).first().click(); await p.waitForTimeout(120); await lento(p); return true; } return false; };
for (const [w, h] of VP) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, reducedMotion: 'reduce' });
  const err = []; p.on('pageerror', (e) => err.push(e.message));
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload(); await lento(p); await p.waitForTimeout(400);
  await rileva(p, w, h, 'titolo'); await c(p, '[data-azione="crediti"]'); await p.waitForTimeout(400); await rileva(p, w, h, 'crediti');
  await p.goto(URL); await lento(p);
  await p.getByRole('button', { name: 'Nuova partita' }).click(); await p.waitForTimeout(300); await lento(p);
  const e01 = dati['missioni/e01.json']; let pl = null, io = 0, fermi = 0, visti = new Set(), passi = 0;
  while (passi++ < 300) {
    await lento(p); const m = await misura(p); const q = m.scena;
    const chiave = `${q}|${m.titolo}|${m.pagina}|${await p.evaluate(() => document.querySelector(".scena")?.innerText.length)}`; if (!visti.has(chiave)) { visti.add(chiave); await rileva(p, w, h, q); }
    if (q === 'verbale') break;
    if (await c(p, '[data-azione="conferma-passo"]')) continue;
    if (await c(p, '[data-azione="conferma-nuova"]')) continue;
    if (await c(p, '[data-genere="m"]')) continue;
    if (await c(p, '[data-azione="guida-salta"]')) continue;
    if (q === 'schieramento') { if (!pl) pl = piano(e01, (await salvato(p)).variabili); await schiera(p, pl.ond[io++].d); await rileva(p, w, h, 'schierato'); await c(p, '[data-azione="conferma"]'); await c(p, '[data-azione="conferma-davvero"]'); continue; }
    if (await c(p, '[data-azione="continua"]')) continue;
    if (await c(p, '[data-opzione]:not(:disabled):not([aria-disabled="true"])')) { await p.locator('[data-azione="continua"]').first().waitFor({ timeout: 4000 }).catch(() => {}); continue; }
    let fatto = false; for (const a of ['continua', 'passo', 'prossimo', 'avanti', 'inizia', 'rapporto', 'avvia-episodio']) if (await c(p, `[data-azione="${a}"]`)) { fatto = true; break; }
    if (!fatto) { await p.waitForTimeout(400); if (++fermi > 20) { console.log(`${w}x${h} bloccato su ${q}`); break; } } else fermi = 0;
  }
  if (err.length) console.log(`${w}x${h} errori: ${err.slice(0, 3).join(' | ')}`);
  await p.close();
}
for (const r of RIS) console.log(`${r.w}×${r.h} ${r.nome.padEnd(16)} pagina ${String(r.pagina).padStart(5)} ecc ${String(r.ecc).padStart(5)} orizz ${r.orizz} · «${r.titolo}» · blocchi ${r.blocchi} · fissi ${r.fissi}${r.rev ? ` · font ${r.rev.font} · piccoli ${r.rev.piccoli.length ? r.rev.piccoli.join('; ') : '0'} · tagliati ${r.rev.tagliati.length ? r.rev.tagliati.join('; ') : '0'} · sovrapp ${r.rev.sov.length ? r.rev.sov.join('; ') : '0'}` : ''}`);
await b.close(); srv.close();
