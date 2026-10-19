// S-12 (PO-114): C28-01/02/09/11 alle 5 risoluzioni di C-028, col mouse (non tocco). Uso: node coordination/sonde/s12-c28.mjs <radice con dist/> <cartella foto>. Derivata da rev-schermate.mjs.
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
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 8000 });
const quale = (p) => p.evaluate(() => document.querySelector('.scena')?.dataset.scena);
const salvato = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('valmora-salvataggio') ?? 'null'));
async function nuova(p, gen = 'm') { await p.getByRole('button', { name: 'Nuova partita' }).click(); await p.waitForTimeout(300);
  if ((await quale(p)) === 'conferma') { while (await p.locator('[data-azione="conferma-passo"]').count()) await p.click('[data-azione="conferma-passo"]'); await p.click('[data-azione="conferma-nuova"]'); } /* S-16: tre conferme */ await sc(p, 'genere'); await p.click(`[data-genere="${gen}"]`); await p.locator(`[data-azione="guida-salta"]`).waitFor({ timeout: 4000 }).then(() => p.click(`[data-azione="guida-salta"]`)).catch(() => {}); await sc(p, 'citta'); }
const piano = (m, v) => { const g = attenta(creaCaso(1), dich); let s = M.iniziaMissione(m, v, dich); const ond = [];
  while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = []; for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); rs.push([c.id, o]); s = M.rispondi(m, s, c.id, o, dich); } ond.push({ d, rs }); s = M.chiudiOndata(m, s, dich); }
  return { ond, esito: M.concludiMissione(m, s, dich).esito.id }; };
async function schiera(p, d) { for (const [r, ps] of Object.entries(d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`); } }
async function allaPrimaOndata(p) { await p.click('[data-azione="avvia-episodio"]'); await sc(p, 'sala');
  for (let i = 0; i < 40 && !(await p.locator('[data-azione="inizia"]').count()); i++) { for (const a of ['passo', 'avanti', 'prossimo']) if (await p.locator(`[data-azione="${a}"]`).count()) { await p.click(`[data-azione="${a}"]`); break; } await p.waitForTimeout(150); }
  await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento'); }
const DIR = process.argv[3];
const c28 = (p) => p.evaluate(() => {
  const m = document.querySelector('.mappa'), t = m?.querySelector('canvas'); const v = document.querySelector('.versione-angolo'); const col = document.querySelector('main')?.getBoundingClientRect();
  const rm = m?.getBoundingClientRect(), cs = m && getComputedStyle(m), rt = t?.getBoundingClientRect(); const bw = cs ? parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft) : 0;
  const rv = v?.getBoundingClientRect();
  return { tela: rt ? `${Math.round(rt.width)}×${Math.round(rt.height)}` : '-', interno: rm ? `${Math.round(rm.width - 2 * bw)}×${Math.round(rm.height - 2 * bw)}` : '-',
    versione: rv ? `x ${Math.round(rv.left)}–${Math.round(rv.right)}` : '-', colonna: col ? `${Math.round(col.left)}–${Math.round(col.right)}` : '-', fuoco: document.activeElement?.tagName.toLowerCase() + (document.activeElement?.className ? '.' + String(document.activeElement.className).split(' ')[0] : '') };
});
for (const [w, h] of [[768, 1024], [1024, 768], [1280, 800], [1366, 768], [1920, 1080]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload(); await sc(p, 'titolo');
  await nuova(p); await allaPrimaOndata(p);
  const x1 = await c28(p); await p.screenshot({ path: `${DIR}/c28-${w}x${h}-schieramento.png` });
  const pl = piano(dati['missioni/e01.json'], (await salvato(p)).variabili); await schiera(p, pl.ond[0].d);
  await p.click('[data-azione="conferma"]'); if (await p.locator('[data-azione="conferma-davvero"]').count()) await p.click('[data-azione="conferma-davvero"]');
  await sc(p, 'chiamata'); await p.waitForTimeout(300);
  // C28-02 come il guardiano controllaOpzioneFerma (tools/foto-c22.mjs): ripresa da tastiera col puntatore fermo sulla prima opzione
  const riprendi = async () => { await p.reload(); await sc(p, 'titolo'); await p.getByRole('button', { name: 'Riprendi' }).focus(); await p.keyboard.press('Enter'); await sc(p, 'chiamata'); await p.waitForTimeout(300); };
  await riprendi(); const r = await p.locator('.opzione').first().boundingBox(); const px = r.x + r.width / 2, py = r.y + r.height / 2;
  await p.reload(); await sc(p, 'titolo'); await p.mouse.move(px, py); await p.getByRole('button', { name: 'Riprendi' }).focus(); await p.keyboard.press('Enter'); await sc(p, 'chiamata'); await p.waitForTimeout(300);
  const st = await p.evaluate(([x, y]) => { const o = document.elementFromPoint(x, y)?.closest('.opzione'); const v = document.createElement('i'); v.style.color = 'var(--ciano)'; document.body.append(v); const c = getComputedStyle(v).color; v.remove();
    return { fermo: `sotto il puntatore «${o?.dataset.opzione ?? '-'}» sfondo ${o ? getComputedStyle(o).backgroundColor : '-'} (evidenza ${c})${o && getComputedStyle(o).backgroundColor === c ? ' GIÀ ACCESA' : ' spenta'}` }; }, [px, py]);
  await p.mouse.move(px + 3, py + 3); await p.waitForTimeout(150); const dopoMossa = await p.evaluate(([x, y]) => { const o = document.elementFromPoint(x, y)?.closest('.opzione'); return o ? getComputedStyle(o).backgroundColor : 'nessuna opzione'; }, [px + 3, py + 3]); st.fermo += `; dopo una mossa del mouse ${dopoMossa}`;
  await p.mouse.move(0, 0);
  // C28-09: scelta da tastiera, poi «continua» da tastiera: dove finisce il fuoco
  await p.locator(`[data-opzione="${pl.ond[0].rs[0][1]}"]`).focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(400);
  const fuocoDopoScelta = (await c28(p)).fuoco;
  if (await p.locator('[data-azione="continua"]').count()) { await p.locator('[data-azione="continua"]').focus(); await p.keyboard.press('Enter'); }
  await sc(p, 'chiamata'); await p.waitForTimeout(300);
  const x2 = await c28(p); await p.screenshot({ path: `${DIR}/c28-${w}x${h}-chiamata.png` });
  await p.keyboard.press('Tab'); const anello = await p.evaluate(() => { const a = document.activeElement; const s = getComputedStyle(a); return `${a.tagName.toLowerCase()}.${String(a.className).split(' ')[0]} outline ${s.outlineStyle} ${s.outlineColor}`; });
  console.log(`${w}×${h} · C28-01 schieramento tela ${x1.tela} in ${x1.interno}, chiamata tela ${x2.tela} in ${x2.interno} · C28-02 ${st.fermo} · C28-09 fuoco dopo la scelta: ${fuocoDopoScelta}, dopo «continua»: ${x2.fuoco}, primo Tab: ${anello} · C28-11 versione ${x1.versione}, colonna ${x1.colonna}`);
  await p.close();
}
await b.close(); srv.close();
