// Sonda C-028 (sola lettura) sulla build dist/: tablet e PC (PO-114). Gioca dall'interfaccia gli episodi EP col piano del bot
// attento (seme 1), come c27-schermate.mjs, a una finestra W×H qualsiasi, DPR 1, e su ogni schermata misura:
//  - scorrimento orizzontale, testi tagliati (overflow), testi sovrapposti (rettangoli di elementi con testo proprio);
//  - fuori schermo: elementi con testo o comandi che escono dalla finestra a destra o a sinistra;
//  - comandi coperti: l'elemento in cima al centro del comando non è il comando;
//  - leggibilità: dimensione dei caratteri in px CSS (= px reali a DPR 1) dei testi visibili nella finestra, pesata sui caratteri;
//  - spazio: larghezza della colonna #app, quota della finestra fuori dalla colonna, quota vuota (finestra meno il rettangolo
//    colonna × altezza del contenuto visibile), misura della mappa;
//  - comandi principali sotto il bordo della finestra (servono scorrimenti).
// I comandi si danno col MOUSE (page.click: muove il puntatore, preme e rilascia) o, con TOCCO=1, col dito (page.tap, hasTouch).
// Uso: W=1024 H=768 [EP=e01,…] [TOCCO=1] [FOTO=e01,e13] node coordination/sonde/c28-grandi.mjs <radice con dist/> <foto> <uscita.json>
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c28'; const OUT = process.argv[4] ?? 'c28.json';
mkdirSync(DIR, { recursive: true });
const W = Number(process.env.W ?? 1024); const H = Number(process.env.H ?? 768); const TOCCO = process.env.TOCCO === '1';
const FOTO = (process.env.FOTO ?? 'e01').split(',').filter(Boolean);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(R, 'data'));
const EP = process.env.EP ? process.env.EP.split(',') : missioni.map((m) => m.id).sort();
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
const piano = (m) => { const g = B.attenta(creaCaso(1), dich); let s = M.iniziaMissione(m, v0, dich); const ond = [];
  while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = []; for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); rs.push([c.id, o]); s = M.rispondi(m, s, c.id, o, dich); } ond.push({ d, rs }); s = M.chiudiOndata(m, s, dich); }
  return ond; };
const p = await b.newPage({ viewport: { width: W, height: H }, hasTouch: TOCCO, isMobile: false, deviceScaleFactor: 1, reducedMotion: 'reduce' });
const clic = (sel) => (TOCCO ? p.tap(sel) : p.click(sel));
async function schiera(d) { for (const [r, ps] of Object.entries(d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await clic(`[data-risorsa="${r}"]`); await clic(`[data-settore="${s}"] .settore-punto`); } }

const misura = () => p.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && +cs.opacity > 0.05; };
  const proprio = (e) => [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
  const conTesto = [...document.querySelectorAll('body *')].filter((e) => proprio(e) && vis(e) && !e.closest('[aria-hidden="true"][data-nascosta]'));
  const nome = (e) => `${e.tagName}.${String(e.className?.baseVal ?? e.className).split(' ')[0]}«${(proprio(e) || e.getAttribute('aria-label') || e.textContent).trim().slice(0, 25)}»`;
  const tagli = conTesto.filter((e) => { const cs = getComputedStyle(e); return (e.scrollWidth > e.clientWidth + 1 && /hidden|clip/.test(cs.overflowX)) || (e.scrollHeight > e.clientHeight + 1 && /hidden|clip/.test(cs.overflowY)); }).map(nome);
  const sovr = [];
  for (let i = 0; i < conTesto.length; i++) for (let j = i + 1; j < conTesto.length; j++) { const a = conTesto[i], c = conTesto[j]; if (a.contains(c) || c.contains(a)) continue;
    const r = a.getBoundingClientRect(), s = c.getBoundingClientRect(); const w = Math.min(r.right, s.right) - Math.max(r.left, s.left), h = Math.min(r.bottom, s.bottom) - Math.max(r.top, s.top);
    if (w > 1 && h > 1) sovr.push(`${nome(a)} × ${nome(c)} ${w.toFixed(1)}×${h.toFixed(1)}`); }
  const COM = 'button, [data-azione], [data-opzione], a[href], [role="button"], input, select';
  const comandi = [...document.querySelectorAll(COM)].filter((e) => vis(e) && !e.disabled);
  const fuori = [...new Set([...conTesto, ...comandi])].filter((e) => { const r = e.getBoundingClientRect(); return r.right > innerWidth + 1 || r.left < -1; }).map((e) => { const r = e.getBoundingClientRect(); return `${nome(e)} ${r.left.toFixed(0)}…${r.right.toFixed(0)}`; });
  const coperti = []; let sotto = 0; const piccoli = [];
  for (const e of comandi) { const r = e.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (Math.min(r.width, r.height) < 44 && !e.closest('.versione-angolo')) piccoli.push(`${nome(e)} ${r.width.toFixed(0)}×${r.height.toFixed(0)}`);
    if (cy > innerHeight) { sotto++; continue; } if (cx < 0 || cx > innerWidth || cy < 0) continue;
    const top = document.elementFromPoint(cx, cy); if (!top || !(e.contains(top) || top === e)) coperti.push(`${nome(e)} coperto da ${top ? nome(top) : 'niente'}`); }
  // caratteri in px, pesati sul numero di caratteri, solo testi dentro la finestra
  const fs = []; for (const e of conTesto) { const r = e.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue; const px = parseFloat(getComputedStyle(e).fontSize); const n = proprio(e).length; fs.push([px, n, e]); }
  fs.sort((x, y) => x[0] - y[0]); const tot = fs.reduce((a, x) => a + x[1], 0); const q = (f) => { let a = 0; for (const x of fs) { a += x[1]; if (a >= f * tot) return x[0]; } return null; };
  const piccolissimi = fs.filter((x) => x[0] < 12).map((x) => `${x[0]}px ${nome(x[2])}`);
  const app = document.getElementById('app').getBoundingClientRect();
  // altezza del contenuto visibile: fondo dell'ultimo elemento disegnato dentro #app (testo, svg, canvas, comando), entro la finestra
  let fondo = 0; for (const e of document.querySelectorAll('#app *')) { if (!(proprio(e) || /^(svg|canvas|button|img)$/i.test(e.tagName))) continue; if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (r.top < innerHeight) fondo = Math.max(fondo, Math.min(r.bottom, innerHeight)); }
  const contenuto = Math.max(0, Math.min(app.right, innerWidth) - Math.max(app.left, 0)) * fondo;
  const mp = document.querySelector('.mappa'); const mr = mp?.getBoundingClientRect();
  const cv = mp?.querySelector('canvas'); const ver = document.querySelector('.versione-angolo')?.getBoundingClientRect();
  return { oriz: document.documentElement.scrollWidth - innerWidth, tagli, sovr, fuori, coperti, comandi: comandi.length, sotto, piccoli,
    font: { min: fs[0]?.[0] ?? null, p10: q(0.1), mediana: q(0.5), sotto12: piccolissimi.slice(0, 6), nSotto12: piccolissimi.length },
    colonna: +app.width.toFixed(0), fuoriColonna: +(1 - app.width / innerWidth).toFixed(3), vuota: +(1 - contenuto / (innerWidth * innerHeight)).toFixed(3), fondo: +fondo.toFixed(0), alto: document.documentElement.scrollHeight,
    mappa: mr ? { w: +mr.width.toFixed(0), h: +mr.height.toFixed(0), quota: +((mr.width * mr.height) / (innerWidth * innerHeight)).toFixed(3), canvas: cv ? `${cv.width}×${cv.height}` : null } : null,
    versione: ver ? { x: +ver.left.toFixed(0), distanzaColonna: +(ver.left - app.right).toFixed(0) } : null };
});

const RIS = []; const errori = []; const t0 = Date.now(); let ultima = 'avvio';
p.on('console', (x) => { if (x.type() === 'error') errori.push(`dopo ${ultima}: ${x.text().slice(0, 160)}`); }); p.on('pageerror', (e) => errori.push(`dopo ${ultima}: ${e.message.slice(0, 160)}`));
const NOME = `${W}x${H}${TOCCO ? '-tocco' : ''}`;
async function scena(ep, nome, foto) {
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(80);
  const x = await misura(); RIS.push({ ep, scena: nome, ...x }); ultima = `${ep} ${nome}`;
  if (foto) await p.screenshot({ path: `${DIR}/${NOME}-${ep}-${nome}.png` });
}
await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload(); await sc(p, 'titolo'); await p.waitForTimeout(300);
await scena('-', 'titolo', true);
for (const ep of EP) {
  const m = missioni.find((x) => x.id === ep); const ond = piano(m); const F = FOTO.includes(ep);
  try {
    await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(salvataggioTutti(missioni, v0))); await p.reload(); await sc(p, 'titolo');
    await clic('button:has-text("Riprendi")'); await sc(p, 'citta'); await p.waitForTimeout(300);
    if (await p.locator(`[data-stagione="${m.stagione}"]`).count()) await clic(`[data-stagione="${m.stagione}"]`);
    await clic(`[data-episodio="${ep}"] .settore-punto`); await p.waitForTimeout(300);
    await scena(ep, 'citta', F);
    await clic('[data-azione="avvia-episodio"]'); await p.waitForTimeout(200);
    for (let k = 0; k < 3 && await p.locator('[data-azione="conferma-passo"]').count(); k++) { await clic('[data-azione="conferma-passo"]'); await p.waitForTimeout(150); }
    if (await p.locator('[data-azione="conferma-rigioca"]').count()) await clic('[data-azione="conferma-rigioca"]');
    await sc(p, 'sala'); await p.waitForTimeout(300);
    let k = 0; while (await p.locator('[data-azione="passo"]').count()) { await scena(ep, `sala-${++k}`, F && k === 1); await clic('[data-azione="passo"]'); await p.waitForTimeout(120); } await scena(ep, `sala-${++k}`, false);
    await clic('[data-azione="avanti"]'); await sc(p, 'briefing'); await p.waitForTimeout(250);
    k = 0; while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) { await scena(ep, `briefing-${++k}`, F && k === 1); await clic('[data-azione="prossimo"], [data-azione="passo"]'); await p.waitForTimeout(120); }
    await scena(ep, `briefing-${++k}`, false); await clic('[data-azione="inizia"]'); await sc(p, 'schieramento');
    for (const [i, o] of ond.entries()) {
      if (i) await sc(p, 'schieramento'); await p.waitForTimeout(200);
      await scena(ep, `vuoto-${i + 1}`, false);
      await schiera(o.d); await scena(ep, `schieramento-${i + 1}`, F && i === 0);
      await clic('[data-azione="conferma"]'); if (await p.locator('[data-azione="conferma-davvero"]').count()) await clic('[data-azione="conferma-davvero"]');
      for (const [j, [cid, op]] of o.rs.entries()) {
        await sc(p, 'chiamata'); await p.waitForTimeout(250);
        await scena(ep, `chiamata-${cid}`, F && i === 0 && j === 0);
        await clic(`[data-opzione="${op}"]`); await p.waitForSelector('[data-azione="continua"]', { timeout: 5000 }).catch(() => {}); await p.waitForTimeout(150);
        if (await p.locator('[data-azione="continua"]').count()) { await scena(ep, `risposta-${cid}`, F && i === 0 && j === 0); await clic('[data-azione="continua"]'); }
      }
      await sc(p, 'chiusura'); await scena(ep, `chiusura-${i + 1}`, F && i === 0); await clic('[data-azione="rapporto"]'); await sc(p, 'rapporto'); await p.waitForTimeout(200);
      await scena(ep, `rapporto-${i + 1}`, F && i === 0); await clic('[data-azione="avanti"]');
    }
    await sc(p, 'verbale'); await p.waitForTimeout(300);
    k = 0; while (await p.locator('[data-azione="passo"]').count()) { await scena(ep, `verbale-${++k}`, F && k === 1); await clic('[data-azione="passo"]'); await p.waitForTimeout(120); } await scena(ep, `verbale-${++k}`, F);
    console.log(`${NOME} ${ep}: schermate ${RIS.filter((r) => r.ep === ep).length} (${Math.round((Date.now() - t0) / 1000)} s)`);
  } catch (e) { errori.push(`BLOCCO ${ep}: ${e.message.slice(0, 200)}`); await p.screenshot({ path: `${DIR}/${NOME}-${ep}-blocco.png` }); console.log(`${NOME} ${ep}: BLOCCO ${e.message.slice(0, 160)}`); }
}
await b.close(); srv.close();
writeFileSync(OUT, JSON.stringify({ W, H, TOCCO, RIS, errori }));
const n = (f) => RIS.filter(f).length;
console.log(`${NOME}: schermate ${RIS.length}, scorrimento orizzontale ${n((r) => r.oriz > 0)}, tagli ${n((r) => r.tagli.length)}, sovrapposizioni ${n((r) => r.sovr.length)}, fuori schermo ${n((r) => r.fuori.length)}, comandi coperti ${n((r) => r.coperti.length)}, errori/blocchi ${errori.length}${errori.length ? '\n  ' + [...new Set(errori)].slice(0, 8).join('\n  ') : ''}`);
