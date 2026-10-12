// Revisione di tutte le schermate (PO-053). Uso: node coordination/sonde/rev-schermate.mjs <radice con dist/> <cartella foto>
// Derivata da coordination/handoffs/collaudatrice/sonde/c06-resa.mjs (ramo claude/valmora-collaudo).
// Sonda C-06: correzioni R01-R07 e N01 della resa (C-04) e e02 dalla città, sulla build integrata.
// Uso: SPENTI=C05R01,… node coordination/handoffs/collaudatrice/sonde/c06-resa.mjs <radice con dist/ e node_modules> [larghezze]
// SPENTI accende gli interruttori rossi (globalThis.__NO_<nome>) con addInitScript, come VALMORA_ROSSI di tools/foto.mjs.
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
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 8000 });
const quale = (p) => p.evaluate(() => document.querySelector('.scena')?.dataset.scena);
const salvato = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('valmora-salvataggio') ?? 'null'));
async function nuova(p, gen = 'm') { await p.getByRole('button', { name: 'Nuova partita' }).click(); await p.waitForTimeout(300);
  if ((await quale(p)) === 'conferma') { while (await p.locator('[data-azione="conferma-passo"]').count()) await p.click('[data-azione="conferma-passo"]'); await p.click('[data-azione="conferma-nuova"]'); } /* S-16: tre conferme */ await sc(p, 'genere'); await p.click(`[data-genere="${gen}"]`); if (await p.locator('[data-azione="guida-salta"]').count()) await p.click('[data-azione="guida-salta"]'); await sc(p, 'citta'); }
async function allaPrimaOndata(p) { await p.click('[data-azione="avvia-episodio"]'); await sc(p, 'sala'); await p.click('[data-azione="avanti"]'); await sc(p, 'briefing');
  while (await p.locator('[data-azione="prossimo"]').count()) { await p.click('[data-azione="prossimo"]'); await p.waitForTimeout(60); } await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento'); }
const piano = (m, v) => { const g = attenta(creaCaso(1), dich); let s = M.iniziaMissione(m, v, dich); const ond = [];
  while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = []; for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); rs.push([c.id, o]); s = M.rispondi(m, s, c.id, o, dich); } ond.push({ d, rs }); s = M.chiudiOndata(m, s, dich); }
  return { ond, esito: M.concludiMissione(m, s, dich).esito.id }; };
async function schiera(p, d) { for (const [r, ps] of Object.entries(d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`); } }
async function ondata(p, o, controlli) {
  await schiera(p, o.d); if (controlli) await controlli('schieramento'); await p.click('[data-azione="conferma"]'); if (await p.locator('[data-azione="conferma-davvero"]').count()) await p.click('[data-azione="conferma-davvero"]'); // S-12: riepilogo
  for (const [, op] of o.rs) { await sc(p, 'chiamata'); if (controlli) await controlli('chiamata'); await p.click(`[data-opzione="${op}"]`); await p.waitForTimeout(250); if (await p.locator('[data-azione="continua"]').count()) await p.click('[data-azione="continua"]'); }
  await sc(p, 'chiusura'); await p.click('[data-azione="rapporto"]'); await sc(p, 'rapporto'); if (controlli) await controlli('rapporto');
}
// Revisione di tutte le schermate (PO-053): per ogni scena misura scorrimento, caratteri, tocchi, tagli, sovrapposizioni; foto.
const RIS = [];
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
async function rileva(p, larg, alt, nome) {
  const x = await misuraTutto(p); const n = RIS.filter((r) => r.larg === larg && r.nome.startsWith(nome)).length;
  const id = `${nome}${n ? '-' + (n + 1) : ''}`; RIS.push({ larg, alt, nome: id, ...x });
  await p.screenshot({ path: `${process.argv[3]}/${larg}-${id}.png`, fullPage: true });
}
const DIR = process.argv[3];
for (const [larg, alt] of [[360, 760], [412, 830]]) {
  const p = await b.newPage({ viewport: { width: larg, height: alt }, hasTouch: true, reducedMotion: 'reduce' });
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload(); await sc(p, 'titolo');
  await rileva(p, larg, alt, 'titolo');
  await p.click('[data-azione="crediti"]'); await p.waitForTimeout(600); await rileva(p, larg, alt, 'crediti');
  await p.goBack().catch(() => {}); await p.goto(URL); await sc(p, 'titolo');
  await p.getByRole('button', { name: 'Nuova partita' }).click(); await sc(p, 'genere'); await rileva(p, larg, alt, 'genere');
  await p.click('[data-genere="m"]'); await sc(p, 'citta'); await p.waitForTimeout(800); await rileva(p, larg, alt, 'citta');
  await p.click('[data-azione="avvia-episodio"]'); await sc(p, 'sala'); await p.waitForTimeout(600); await rileva(p, larg, alt, 'sala');
  await p.click('[data-azione="avanti"]'); await sc(p, 'briefing');
  while (await p.locator('[data-azione="prossimo"]').count()) { await rileva(p, larg, alt, 'briefing'); await p.click('[data-azione="prossimo"]'); await p.waitForTimeout(80); }
  await rileva(p, larg, alt, 'briefing'); await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento');
  const e01 = dati['missioni/e01.json']; const pl = piano(e01, (await salvato(p)).variabili);
  for (const [i, o] of pl.ond.entries()) {
    if (i) await sc(p, 'schieramento');
    await schiera(p, o.d); await rileva(p, larg, alt, 'schieramento'); await p.click('[data-azione="conferma"]'); if (await p.locator('[data-azione="conferma-davvero"]').count()) await p.click('[data-azione="conferma-davvero"]'); // S-12: riepilogo
    for (const [, op] of o.rs) { await sc(p, 'chiamata'); await p.waitForTimeout(300); await rileva(p, larg, alt, 'chiamata'); await p.click(`[data-opzione="${op}"]`); await p.waitForTimeout(400);
      if (await p.locator('[data-azione="continua"]').count()) { await rileva(p, larg, alt, 'risposta'); await p.click('[data-azione="continua"]'); } }
    await sc(p, 'chiusura'); await rileva(p, larg, alt, 'chiusura'); await p.click('[data-azione="rapporto"]'); await sc(p, 'rapporto'); await rileva(p, larg, alt, 'rapporto');
    await p.click('[data-azione="avanti"]');
  }
  await sc(p, 'verbale'); await p.waitForTimeout(500); await rileva(p, larg, alt, 'verbale');
  await p.close();
}
for (const r of RIS) console.log(`${r.larg}×${r.alt} ${r.nome.padEnd(15)} vert ${String(r.verticale).padStart(5)} · orizz ${r.orizzontale} · font ${r.font} · piccoli ${r.piccoli.length ? r.piccoli.join('; ') : '0'} · tagliati ${r.tagliati.length ? r.tagliati.join('; ') : '0'} · sovrapp ${r.sov.length ? r.sov.join('; ') : '0'}`);
await b.close(); srv.close();
