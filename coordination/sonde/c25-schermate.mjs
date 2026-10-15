// Sonda C-025 (sola lettura) sulla build dist/: gioca dall'interfaccia gli episodi EP col piano del bot attento
// (seme 1) a una larghezza W (360×760, 375×667, 412×915), DPR 1, e su ogni schermata misura:
//  - testo visibile (innerText): nomi vecchi delle squadre (PO-108, D-124), nomi nuovi con le parole davanti;
//    scorrimento orizzontale della pagina; elementi di testo tagliati (scrollWidth > clientWidth con overflow nascosto);
//  - nelle chiamate (C22-01): icona di chi chiama: riquadro dell'svg, glifo DISEGNATO (unione dei rettangoli dei figli),
//    tratto in px, contrasto glifo/fondo dell'icona e contorno/fondo del fumetto (fuori dall'icona), sovrapposizione con
//    qualsiasi elemento che contiene testo o con un pulsante, posizione dentro la finestra; altezza del fumetto;
//  - nelle chiamate (C22-02): pallini delle vignette: diametro, contorno e alone in px; campionamento dei PIXEL della
//    foto (alone, contorno, riempimento e fondo subito fuori dall'alone) e rapporti WCAG.
// ROSSI=C54C01,C55P01 accende i bracci rossi (globalThis.__NO_XXX prima del caricamento) per il confronto.
// Uso: W=360 [EP=e01,…] [ROSSI=…] [FOTO=1] node coordination/sonde/c25-schermate.mjs <radice con dist/> <cartella foto> <uscita.json>
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c25'; const OUT = process.argv[4] ?? 'c25.json';
mkdirSync(DIR, { recursive: true });
const W = Number(process.env.W ?? 360); const H = { 360: 760, 375: 667, 412: 915 }[W]; const FOTO = process.env.FOTO === '1';
const ROSSI = (process.env.ROSSI ?? '').split(',').filter(Boolean);
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
async function schiera(p, d) { for (const [r, ps] of Object.entries(d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`); } }

const VECCHI = /cinderwick|larkspire|calderholt|mossgarth|ollerbrook|quillhaven|saltmere/gi;
const testo = (p) => p.evaluate(() => {
  const t = document.body.innerText;
  const tagli = [];
  for (const e of document.querySelectorAll('body *')) { if (![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue; const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); if (!r.width) continue;
    if ((e.scrollWidth > e.clientWidth + 1 && /hidden|clip/.test(cs.overflowX)) || (e.scrollHeight > e.clientHeight + 1 && /hidden|clip/.test(cs.overflowY))) tagli.push(`${e.tagName}.${String(e.className).split(' ')[0]}: ${e.textContent.trim().slice(0, 60)}`); }
  return { t, oriz: document.documentElement.scrollWidth - innerWidth, tagli };
});

// C22-01: icona di chi chiama
const icona = (p) => p.evaluate(() => {
  const rgb = (s) => (s.match(/[\d.]+/g) ?? ['0', '0', '0']).slice(0, 3).map(Number);
  const lum = (v) => { const [r, g, b] = v.map((u) => { u /= 255; return u <= 0.03928 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const rap = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x); return +((l1 + 0.05) / (l2 + 0.05)).toFixed(2); };
  const fondo = (e) => { for (let x = e; x; x = x.parentElement) { const c = getComputedStyle(x).backgroundColor; if (!/rgba\(.*, 0\)|transparent/.test(c)) return rgb(c); } return [255, 255, 255]; };
  const msg = document.querySelector('.chiamata-corpo')?.closest('.messaggio') ?? document.querySelector('.chiamata-corpo')?.parentElement;
  const out = { fumetto: msg ? +msg.getBoundingClientRect().height.toFixed(1) : null, corpo: +(document.querySelector('.chiamata-corpo')?.getBoundingClientRect().height ?? 0).toFixed(1) };
  const v = document.querySelector('.chiamata-corpo svg.vignetta'); if (v) { const r = v.getBoundingClientRect(); out.vignetta = `${r.width.toFixed(1)}×${r.height.toFixed(1)}`; out.riquadroDentro = v.querySelectorAll('[data-chi-riquadro]').length; }
  const i = document.querySelector('.chiamata-corpo [data-chi-icona]'); if (!i) return out;
  const g = i.querySelector('svg'); const r = g.getBoundingClientRect(); const q = i.getBoundingClientRect();
  const fig = [...g.children].map((c) => c.getBoundingClientRect()); const gl = { w: Math.max(...fig.map((x) => x.right)) - Math.min(...fig.map((x) => x.left)), h: Math.max(...fig.map((x) => x.bottom)) - Math.min(...fig.map((x) => x.top)) };
  const cs = getComputedStyle(i); const fuori = fondo(i.parentElement.parentElement);
  // sovrapposizioni: ogni elemento visibile che ha testo diretto, ogni pulsante, ogni altro svg fuori dall'icona e dalla sua vignetta
  const sopra = [];
  for (const e of document.querySelectorAll('body *')) { if (i.contains(e) || e.contains(i) || e.closest('.vignetta-chi')) continue;
    const testoDiretto = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()); if (!testoDiretto && e.tagName !== 'BUTTON' && !e.matches('svg.lucide, .timbro, .avatar')) continue;
    const s = e.getBoundingClientRect(); if (!s.width || getComputedStyle(e).visibility === 'hidden') continue;
    const a = Math.max(0, Math.min(q.right, s.right) - Math.max(q.left, s.left)) * Math.max(0, Math.min(q.bottom, s.bottom) - Math.max(q.top, s.top));
    if (a > 0) sopra.push(`${e.tagName}.${String(e.className?.baseVal ?? e.className).split(' ')[0]} ${a.toFixed(0)}px²`); }
  // parte della vignetta coperta dall'icona (px² e % della vignetta)
  const vr = v.getBoundingClientRect(); const cop = Math.max(0, Math.min(q.right, vr.right) - Math.max(q.left, vr.left)) * Math.max(0, Math.min(q.bottom, vr.bottom) - Math.max(q.top, vr.top));
  // elemento in cima al centro e agli angoli dell'icona: se non è l'icona, qualcosa la copre
  const punti = [[q.left + 2, q.top + 2], [q.right - 2, q.top + 2], [q.left + q.width / 2, q.top + q.height / 2]].map(([x, y]) => { const e = document.elementFromPoint(x, y); return e && i.contains(e) ? 'icona' : e ? `${e.tagName}.${String(e.className?.baseVal ?? e.className).split(' ')[0]}` : 'fuori'; });
  return { ...out, chi: i.dataset.chiIcona, box: `${q.width.toFixed(1)}×${q.height.toFixed(1)}`, svg: `${r.width.toFixed(1)}×${r.height.toFixed(1)}`, glifo: `${gl.w.toFixed(1)}×${gl.h.toFixed(1)}`, glifoMax: +Math.max(gl.w, gl.h).toFixed(1),
    tratto: +(Number(g.getAttribute('stroke-width') ?? 2) * r.width / 24).toFixed(2), cGlifo: rap(rgb(getComputedStyle(g).color), rgb(cs.backgroundColor)), cBordoDentro: rap(rgb(cs.borderTopColor), rgb(cs.backgroundColor)),
    cBordoFuori: rap(rgb(cs.borderTopColor), fuori), cFondoFuori: rap(rgb(cs.backgroundColor), fuori), bordo: parseFloat(cs.borderTopWidth), sopra, copreVignetta: +(cop / (vr.width * vr.height) * 100).toFixed(1),
    inFinestra: q.left >= 0 && q.right <= innerWidth && q.top >= 0, punti, pos: { x: +q.left.toFixed(1), y: +q.top.toFixed(1) } };
});

// C22-02: pallini, geometria dal DOM e colori dai pixel della foto
async function pallini(p) {
  // la vignetta può stare sotto il bordo della finestra (375×667): la porto al centro prima di fotografare
  await p.evaluate(() => document.querySelector('.chiamata-corpo svg.vignetta')?.scrollIntoView({ block: 'center' })); await p.waitForTimeout(80);
  const geo = await p.evaluate(() => {
    const v = document.querySelector('.chiamata-corpo svg.vignetta'); if (!v) return null; const vr = v.getBoundingClientRect(); const k = Math.min(vr.width / 320, vr.height / 180);
    const ps = [...v.querySelectorAll('[data-figura="pallino"]')].map((g) => { const c = g.querySelector('[data-pallino]') ?? g; const a = g.querySelector('[data-alone]'); const cr = c.getBoundingClientRect(); const ar = a?.getBoundingClientRect();
      return { cx: cr.left + cr.width / 2, cy: cr.top + cr.height / 2, d: +cr.width.toFixed(2), alone: ar ? +ar.width.toFixed(2) : null, contorno: +(parseFloat(getComputedStyle(c).strokeWidth || '0') * k).toFixed(2), fill: getComputedStyle(c).fill }; });
    return { k: +k.toFixed(3), evento: v.dataset.evento, box: { x: vr.left, y: vr.top, w: vr.width, h: vr.height }, ps };
  });
  if (!geo || !geo.ps.length) return geo;
  const shot = (await p.screenshot({ type: 'png' })).toString('base64');
  await p.evaluate(() => document.querySelectorAll('.chiamata-corpo [data-figura="pallino"]').forEach((g) => { g.style.visibility = 'hidden'; }));
  const senza = (await p.screenshot({ type: 'png' })).toString('base64');
  await p.evaluate(() => document.querySelectorAll('.chiamata-corpo [data-figura="pallino"]').forEach((g) => { g.style.visibility = ''; }));
  return p.evaluate(async ({ geo, shot, senza }) => {
    const carica = (b64) => new Promise((ok) => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); ok(x.getImageData(0, 0, im.width, im.height)); }; im.src = `data:image/png;base64,${b64}`; });
    const [A, S] = [await carica(shot), await carica(senza)]; const dpr = A.width / innerWidth;
    const px = (I, x, y) => { const i = (Math.round(y * dpr) * I.width + Math.round(x * dpr)) * 4; return [I.data[i], I.data[i + 1], I.data[i + 2]]; };
    const lum = (v) => { const [r, g, b] = v.map((u) => { u /= 255; return u <= 0.03928 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
    const rap = (a, b) => { const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x); return (l1 + 0.05) / (l2 + 0.05); };
    // anello: 16 punti a raggio rr; per i fondi prendo il colore meno contrastato con l'alone (caso peggiore)
    const anello = (I, cx, cy, rr) => Array.from({ length: 16 }, (_, j) => px(I, cx + rr * Math.cos(j * Math.PI / 8), cy + rr * Math.sin(j * Math.PI / 8)));
    return { ...geo, ps: geo.ps.map((q) => {
      const rP = q.d / 2, rA = (q.alone ?? q.d) / 2;
      const fill = px(A, q.cx, q.cy);
      const cont = anello(A, q.cx, q.cy, Math.max(0, rP - 0.2)); const contD = cont.reduce((m, c) => (lum(c) < lum(m) ? c : m)); // il più scuro sull'anello del contorno
      const alo = anello(A, q.cx, q.cy, (rP + rA) / 2 + 0.3); const aloL = alo.reduce((m, c) => (lum(c) > lum(m) ? c : m)); // il più chiaro sull'anello dell'alone
      const fondo = anello(S, q.cx, q.cy, rA + 1); // il fondo SENZA pallino subito fuori dall'alone
      const fondoPeggio = fondo.reduce((m, c) => (rap(c, aloL) < rap(m, aloL) ? c : m));
      const fondoSotto = px(S, q.cx, q.cy);
      return { d: q.d, alone: q.alone, contorno: q.contorno, aloneAnello: q.alone ? +((rA - rP) - q.contorno / 2).toFixed(2) : null, fill: fill.join(','), cAloneFondo: +rap(aloL, fondoPeggio).toFixed(2), cContornoAlone: +rap(contD, aloL).toFixed(2),
        cContornoFondo: +rap(contD, fondoPeggio).toFixed(2), cFillContorno: +rap(fill, contD).toFixed(2), cFillFondoSotto: +rap(fill, fondoSotto).toFixed(2), fondo: fondoPeggio.join(',') }; }) };
  }, { geo, shot, senza });
}

const RIS = []; const errori = []; const t0 = Date.now(); let ultima = 'avvio';
const p = await b.newPage({ viewport: { width: W, height: H }, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'reduce' });
if (ROSSI.length) await p.addInitScript((r) => { for (const x of r) globalThis[`__NO_${x}`] = true; }, ROSSI);
p.on('console', (x) => { if (x.type() === 'error') errori.push(`dopo ${ultima}: ${x.text().slice(0, 160)}`); }); p.on('pageerror', (e) => errori.push(`dopo ${ultima}: ${e.message.slice(0, 160)}`));
async function scena(ep, nome, foto, extra) {
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(100);
  const x = await testo(p); const vecchi = [...new Set(x.t.match(VECCHI) ?? [])];
  const nuovi = [...x.t.matchAll(/(\S+)\s+(Kiln|Skyfield|Square|Arches|Studio|Garden|Stoneway)\b/g)].map((m) => `${m[1]} ${m[2]}`);
  const r = { ep, scena: nome, vecchi, nuovi, oriz: x.oriz, tagli: x.tagli, ...(extra ? await extra() : {}) };
  if (vecchi.length) r.estratto = x.t.slice(Math.max(0, x.t.search(VECCHI) - 60), x.t.search(VECCHI) + 80);
  RIS.push(r); ultima = `${ep} ${nome}`;
  if (foto || vecchi.length) await p.screenshot({ path: `${DIR}/${W}${ROSSI.length ? '-rosso' : ''}-${ep}-${nome}.jpg`, type: 'jpeg', quality: 78 });
}
await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload(); await sc(p, 'titolo'); await p.waitForTimeout(300);
for (const ep of EP) {
  const m = missioni.find((x) => x.id === ep); const ond = piano(m);
  try {
    await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(salvataggioTutti(missioni, v0))); await p.reload(); await sc(p, 'titolo');
    await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta'); await p.waitForTimeout(300);
    if (await p.locator(`[data-stagione="${m.stagione}"]`).count()) await p.click(`[data-stagione="${m.stagione}"]`);
    await p.click(`[data-episodio="${ep}"] .settore-punto`); await p.waitForTimeout(300);
    await scena(ep, 'citta', FOTO);
    await p.click('[data-azione="avvia-episodio"]'); await p.waitForTimeout(200);
    for (let k = 0; k < 3 && await p.locator('[data-azione="conferma-passo"]').count(); k++) { await p.click('[data-azione="conferma-passo"]'); await p.waitForTimeout(150); }
    if (await p.locator('[data-azione="conferma-rigioca"]').count()) { await scena(ep, 'tripla', false); await p.click('[data-azione="conferma-rigioca"]'); }
    await sc(p, 'sala'); await p.waitForTimeout(300);
    let k = 0; while (await p.locator('[data-azione="passo"]').count()) { await scena(ep, `sala-${++k}`, FOTO && k === 1); await p.click('[data-azione="passo"]'); await p.waitForTimeout(120); } await scena(ep, `sala-${++k}`, false);
    await p.click('[data-azione="avanti"]'); await sc(p, 'briefing'); await p.waitForTimeout(250);
    k = 0; while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) { await scena(ep, `briefing-${++k}`, false); await p.click('[data-azione="prossimo"], [data-azione="passo"]'); await p.waitForTimeout(120); }
    await scena(ep, `briefing-${++k}`, false); await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento');
    for (const [i, o] of ond.entries()) {
      if (i) await sc(p, 'schieramento'); await p.waitForTimeout(200);
      if (process.env.NOINFO !== '1' && await p.locator('[data-azione="info-ondata"], .ondata-info, [data-azione="info"]').count()) { await p.locator('[data-azione="info-ondata"], .ondata-info, [data-azione="info"]').first().click().catch(() => {}); await p.waitForTimeout(150); await scena(ep, `info-${i + 1}`, false); await p.keyboard.press('Escape').catch(() => {}); }
      await schiera(p, o.d); await scena(ep, `schieramento-${i + 1}`, false);
      await p.click('[data-azione="conferma"]'); if (await p.locator('[data-azione="conferma-davvero"]').count()) await p.click('[data-azione="conferma-davvero"]');
      for (const [cid, op] of o.rs) {
        await sc(p, 'chiamata'); await p.waitForTimeout(250);
        await scena(ep, `chiamata-${cid}`, FOTO, async () => ({ icona: await icona(p), pallini: await pallini(p) }));
        await p.click(`[data-opzione="${op}"]`); await p.waitForSelector('[data-azione="continua"]', { timeout: 5000 }).catch(() => {}); await p.waitForTimeout(150);
        if (await p.locator('[data-azione="continua"]').count()) { await scena(ep, `risposta-${cid}`, false); await p.click('[data-azione="continua"]'); }
      }
      await sc(p, 'chiusura'); await scena(ep, `chiusura-${i + 1}`, false); await p.click('[data-azione="rapporto"]'); await sc(p, 'rapporto'); await p.waitForTimeout(200);
      await scena(ep, `rapporto-${i + 1}`, false); await p.click('[data-azione="avanti"]');
    }
    await sc(p, 'verbale'); await p.waitForTimeout(300);
    k = 0; while (await p.locator('[data-azione="passo"]').count()) { await scena(ep, `verbale-${++k}`, false); await p.click('[data-azione="passo"]'); await p.waitForTimeout(120); } await scena(ep, `verbale-${++k}`, FOTO);
    console.log(`${W} ${ep}: schermate ${RIS.filter((r) => r.ep === ep).length} (${Math.round((Date.now() - t0) / 1000)} s)`);
  } catch (e) { errori.push(`BLOCCO ${ep}: ${e.message.slice(0, 200)}`); await p.screenshot({ path: `${DIR}/${W}-${ep}-blocco.jpg`, type: 'jpeg', quality: 70 }); console.log(`${W} ${ep}: BLOCCO ${e.message.slice(0, 120)}`); }
}
await b.close(); srv.close();
writeFileSync(OUT, JSON.stringify({ W, ROSSI, RIS, errori }));
console.log(`W ${W}${ROSSI.length ? ' rossi ' + ROSSI : ''}: schermate ${RIS.length}, con nomi vecchi ${RIS.filter((r) => r.vecchi.length).length}, scorrimento orizzontale ${RIS.filter((r) => r.oriz > 0).length}, errori/blocchi ${errori.length}${errori.length ? '\n  ' + [...new Set(errori)].slice(0, 8).join('\n  ') : ''}`);
