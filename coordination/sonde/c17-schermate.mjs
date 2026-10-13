// Sonda C-017 (grafica): foto di ogni schermata a 360×760, 375×667 e 412×915 (JPEG) e misure per scena:
// scorrimento verticale/orizzontale, carattere minimo, tocchi < 44 px, testi tagliati, sovrapposizioni fra testi,
// settori che pulsano contro settore della chiamata (PO-088), dinamica della mappa (PO-089), vignetta nella chiamata.
// Partita e01 vinta (piano del bot attento) e persa (piano del bot peggiore), giocate dall'interfaccia.
// Uso: node coordination/sonde/c17-schermate.mjs <radice con dist/> <cartella foto> [movimento=riduci|vero]
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c17'; const VERO = process.argv[4] === 'vero';
mkdirSync(DIR, { recursive: true });
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 10000 });
const quale = (p) => p.evaluate(() => document.querySelector('.scena')?.dataset.scena);
const piano = (m, strategia) => { const g = B[strategia](creaCaso(1), dich); let s = M.iniziaMissione(m, Object.fromEntries([...dich.values()].map((d) => [d.id, d.iniziale])), dich); const ond = [];
  while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = []; for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); rs.push([c.id, o]); s = M.rispondi(m, s, c.id, o, dich); } ond.push({ d, rs }); s = M.chiudiOndata(m, s, dich); }
  return { ond, esito: M.concludiMissione(m, s, dich).esito.id }; };
async function schiera(p, d) { for (const [r, ps] of Object.entries(d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`); } }
const misura = (p) => p.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0'; };
  const foglie = [...document.querySelectorAll('body *')].filter((e) => vis(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && !e.closest('.mappa-tela'));
  const font = Math.min(...foglie.map((e) => parseFloat(getComputedStyle(e).fontSize)));
  const piccoli = [...document.querySelectorAll('button, a, [role=button]')].filter(vis).map((e) => ({ e, r: e.getBoundingClientRect() })).filter(({ r }) => r.width < 44 || r.height < 44).map(({ e, r }) => `${(e.textContent || e.getAttribute('aria-label') || e.className).trim().slice(0, 18)} ${Math.round(r.width)}×${Math.round(r.height)}`);
  const tagliati = foglie.filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible').map((e) => e.textContent.trim().slice(0, 30));
  const Rr = foglie.map((e) => ({ e, r: e.getBoundingClientRect() })); const sov = [];
  for (let i = 0; i < Rr.length; i++) for (let j = i + 1; j < Rr.length; j++) { const a = Rr[i], c = Rr[j]; if (a.e.contains(c.e) || c.e.contains(a.e)) continue;
    const ov = Math.max(0, Math.min(a.r.right, c.r.right) - Math.max(a.r.left, c.r.left)) * Math.max(0, Math.min(a.r.bottom, c.r.bottom) - Math.max(a.r.top, c.r.top));
    if (ov > 40) sov.push(`«${a.e.textContent.trim().slice(0, 16)}» × «${c.e.textContent.trim().slice(0, 16)}» ${Math.round(ov)}px²`); }
  const s = document.scrollingElement; const mp = document.querySelector('.mappa');
  const pulsante = [...document.querySelectorAll('.scena .pulsante, .scena .opzione')].filter(vis)[0]?.getBoundingClientRect();
  return { vert: s.scrollHeight - innerHeight, orizz: s.scrollWidth - s.clientWidth, font, piccoli: piccoli.slice(0, 5), tagliati: tagliati.slice(0, 4), sov: sov.slice(0, 5),
    lampeggianti: mp?.dataset.lampeggianti ?? '-', dinamica: mp?.dataset.dinamica ?? '-', folla: mp?.dataset.folla ?? '-', mappaAlta: mp ? Math.round(mp.getBoundingClientRect().height) : 0,
    primoTasto: pulsante ? Math.round(pulsante.top) : null, vignetta: !!document.querySelector('.scena svg, .scena .vignetta'),
    chiamata: document.querySelector('[data-messaggio^="chiamata-"]')?.dataset.messaggio?.slice(9) ?? null };
});
const RIS = []; const settoreDi = (m, id) => m.ondate.flatMap((o) => o.chiamate ?? []).find((c) => c.id === id)?.settore ?? '';
async function foto(p, w, nome, m) {
  if (VERO) await p.waitForTimeout(700);
  const x = await misura(p); const n = RIS.filter((r) => r.w === w && r.nome.startsWith(nome)).length; const id = `${nome}${n ? '-' + (n + 1) : ''}`;
  if (x.chiamata && m) x.atteso = settoreDi(m, x.chiamata);
  RIS.push({ w, nome: id, ...x });
  await p.screenshot({ path: `${DIR}/${w}-${id}${VERO ? '-anim' : ''}.jpg`, fullPage: true, type: 'jpeg', quality: 70 });
}
const errori = [];
for (const [w, h] of [[360, 760], [375, 667], [412, 915]]) for (const strategia of ['attenta', 'peggiore']) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, deviceScaleFactor: 1, reducedMotion: VERO ? 'no-preference' : 'reduce' });
  p.on('console', (x) => { if (x.type() === 'error') errori.push(`${w} ${strategia}: ${x.text().slice(0, 140)}`); }); p.on('pageerror', (e) => errori.push(`${w} ${strategia}: ${e.message.slice(0, 140)}`));
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload(); await sc(p, 'titolo');
  const pre = strategia === 'attenta' ? '' : 'persa-';
  if (!pre) await foto(p, w, 'titolo');
  await p.getByRole('button', { name: 'Nuova partita' }).click(); await sc(p, 'genere'); if (!pre) await foto(p, w, 'genere');
  await p.click('[data-genere="f"]'); await p.waitForTimeout(400);
  if ((await quale(p)) === 'guida') { if (!pre) await foto(p, w, 'guida'); await p.click('[data-azione="guida-salta"]'); }
  await sc(p, 'citta'); await p.waitForTimeout(500); if (!pre) await foto(p, w, 'citta');
  await p.click('[data-azione="avvia-episodio"]'); await sc(p, 'sala'); await p.waitForTimeout(500);
  while (await p.locator('[data-azione="passo"]').count()) { if (!pre) await foto(p, w, 'sala'); await p.click('[data-azione="passo"]'); await p.waitForTimeout(150); } if (!pre) await foto(p, w, 'sala');
  await p.click('[data-azione="avanti"]'); await sc(p, 'briefing');
  while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) { if (!pre) await foto(p, w, 'briefing'); await p.click('[data-azione="prossimo"], [data-azione="passo"]'); await p.waitForTimeout(150); }
  if (!pre) await foto(p, w, 'briefing'); await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento');
  const m = dati['missioni/e01.json']; const pl = piano(m, strategia);
  for (const [i, o] of pl.ond.entries()) {
    if (i) await sc(p, 'schieramento');
    await schiera(p, o.d); if (!pre) await foto(p, w, 'schieramento', m);
    await p.click('[data-azione="conferma"]'); if (await p.locator('[data-azione="conferma-davvero"]').count()) { if (!pre && !i) await foto(p, w, 'riepilogo'); await p.click('[data-azione="conferma-davvero"]'); }
    for (const [, op] of o.rs) { await sc(p, 'chiamata'); await p.waitForTimeout(250); await foto(p, w, `${pre}chiamata`, m); await p.click(`[data-opzione="${op}"]`); await p.waitForTimeout(350);
      if (await p.locator('[data-azione="continua"]').count()) { if (!pre) await foto(p, w, 'risposta', m); await p.click('[data-azione="continua"]'); } }
    await sc(p, 'chiusura'); if (!pre && !i) await foto(p, w, 'chiusura'); await p.click('[data-azione="rapporto"]'); await sc(p, 'rapporto'); await p.waitForTimeout(250); await foto(p, w, `${pre}rapporto`);
    await p.click('[data-azione="avanti"]');
  }
  await sc(p, 'verbale'); await p.waitForTimeout(400);
  while (await p.locator('[data-azione="passo"]').count()) { await foto(p, w, `${pre}verbale`); await p.click('[data-azione="passo"]'); await p.waitForTimeout(150); } await foto(p, w, `${pre}verbale`);
  if (pre) RIS.at(-1).riparti = await p.getAttribute('[data-azione="riparti"]', 'data-ondata').catch(() => null);
  await p.close();
}
for (const r of RIS) console.log(`${r.w} ${r.nome.padEnd(18)} vert ${String(r.vert).padStart(5)} orizz ${r.orizz} font ${r.font} tasto@${r.primoTasto} mappa ${r.mappaAlta} · piccoli ${r.piccoli.join('; ') || 0} · tagliati ${r.tagliati.join('; ') || 0} · sovr ${r.sov.join('; ') || 0}${r.chiamata ? ` · chiamata ${r.chiamata} settore «${r.atteso || '—'}» pulsa «${r.lampeggianti}» dinamica «${r.dinamica}» vignetta ${r.vignetta}` : ''} · folla ${r.folla}`);
for (const r of RIS.filter((x) => 'riparti' in x)) console.log(`${r.w} verbale perso: Riparti dall'ondata ${r.riparti}`);
console.log(`errori di console: ${errori.length}`); for (const e of errori.slice(0, 20)) console.log('  ' + e);
await b.close(); srv.close();
