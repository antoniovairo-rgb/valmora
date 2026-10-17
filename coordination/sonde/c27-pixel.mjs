// Sonda C-027 (sola lettura): verso del corteo sui PIXEL e nel MOVIMENTO, dall'interfaccia della build dist/.
// Gioca gli episodi EP col piano del bot attento (seme 1, come c26-schermate.mjs); in ogni schieramento e in ogni chiamata
// su un settore di tipo strada: legge data-folla / data-dinamica / data-colori-cortei / data-stadio-ellisse, ferma
// fa due foto della mappa a D ms (tempo reale, misurato) l'una dall'altra, trova le persone col colore primario del club
// del corteo (componenti connesse), le accoppia (vicina entro 5 px, spostamento > 0,3 px) e misura per ogni coppia come cambia la distanza dal
// centro dello stadio disegnato e dal punto di un settore di riferimento (RIF, es. piazza_municipio). Δ>0 = si allontana.
// Per i movimenti si leggono anche le posizioni vere delle persone nella scena Pixi (gancio __PIXI_APP_INIT__), a 400 ms di distanza.
// Uso: W=360 EP=e30,e17 [RIF=piazza_municipio] [D=200] [ROSSI=C32D01] node coordination/sonde/c27-pixel.mjs <radice> <foto> <uscita.json>
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c27'; const OUT = process.argv[4] ?? 'c27-pixel.json';
mkdirSync(DIR, { recursive: true });
const W = Number(process.env.W ?? 360); const H = Number(process.env.H ?? { 360: 760, 375: 667, 412: 915 }[W]); const D = Number(process.env.D ?? 200);
const RIF = process.env.RIF ?? 'piazza_municipio'; const ROSSI = (process.env.ROSSI ?? '').split(',').filter(Boolean); const FOTO = process.env.FOTO === '1';
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(R, 'data'));
const EP = (process.env.EP ?? 'e30,e17').split(',');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
const piano = (m) => { const g = B.attenta(creaCaso(1), dich); let s = M.iniziaMissione(m, v0, dich); const ond = [];
  while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = []; for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); rs.push([c.id, o, c.settore]); s = M.rispondi(m, s, c.id, o, dich); } ond.push({ d, rs }); s = M.chiudiOndata(m, s, dich); }
  return ond; };
async function schiera(p, d) { for (const [r, ps] of Object.entries(d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`); } }

const RIS = []; const errori = [];
const p = await b.newPage({ viewport: { width: W, height: H }, hasTouch: true, deviceScaleFactor: 1 });
// l'applicazione Pixi della mappa, dal gancio dei devtools di Pixi (__PIXI_APP_INIT__): posizioni vere delle persone
await p.addInitScript(() => { globalThis.__PIXI_APP_INIT__ = (app) => { (globalThis.__c27app ??= []).push(app); }; });
if (ROSSI.length) await p.addInitScript((r) => { for (const x of r) globalThis[`__NO_${x}`] = true; }, ROSSI);
p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text().slice(0, 160)); }); p.on('pageerror', (e) => errori.push(e.message.slice(0, 160)));

async function misura(ep, nome, ondata) {
  const map = p.locator('.mappa').first(); await map.scrollIntoViewIfNeeded(); await p.waitForTimeout(150);
  const attr = await map.evaluate((el) => { const a = (n) => el.getAttribute(n) ?? ''; const r = el.getBoundingClientRect();
    const pt = (id) => { const q = el.querySelector(`[data-settore="${id}"] .settore-punto`); if (!q) return null; const s = q.getBoundingClientRect(); return { x: s.left + s.width / 2 - r.left, y: s.top + s.height / 2 - r.top }; };
    const settori = Object.fromEntries([...el.querySelectorAll('[data-settore]')].map((q) => [q.dataset.settore, pt(q.dataset.settore)]));
    return { folla: a('data-folla'), dinamica: a('data-dinamica'), dinColori: a('data-dinamica-colori'), colori: a('data-colori-cortei'), stadio: a('data-stadio'), ellisse: a('data-stadio-ellisse'), box: { x: r.left, y: r.top, w: r.width, h: r.height }, settori }; });
  // ferma il tempo, due foto a D ms di gioco l'una dall'altra
  const t0 = Date.now(); const a = (await map.screenshot({ type: 'png' })).toString('base64'); const t1 = Date.now(); await p.waitForTimeout(D); const t2 = Date.now(); const z = (await map.screenshot({ type: 'png' })).toString('base64'); const t3 = Date.now();
  if (FOTO) await map.screenshot({ path: `${DIR}/${W}x${H}${ROSSI.length ? '-rosso-' + ROSSI.join('-') : ''}-${ep}-${nome}.png` });
  const cortei = attr.folla.split('|')[1]?.split(',').filter(Boolean).map((c) => { const [settore, verso] = c.split('>'); return { settore, verso }; }) ?? [];
  const origine = Object.fromEntries(attr.colori.split(',').filter(Boolean).map((x) => x.split('=')));
  const [cx, cy] = attr.ellisse ? attr.ellisse.split(',').map(Number) : [NaN, NaN];
  // colori da cercare: primari dei cortei disegnati (e della dinamica)
  const tinte = [...new Set([...cortei.map((c) => origine[c.settore]), attr.dinColori].filter((x) => x && x.startsWith('#')))];
  const mov = await p.evaluate(async ({ a, z, tinte, st, rif }) => {
    const carica = (b64) => new Promise((ok) => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); ok(x.getImageData(0, 0, im.width, im.height)); }; im.src = `data:image/png;base64,${b64}`; });
    const [A, Z] = [await carica(a), await carica(z)];
    const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const out = {};
    for (const t of tinte) {
      const c = hex(t);
      const blob = (I) => { const n = I.width * I.height, ok = new Uint8Array(n); for (let i = 0; i < n; i++) { const d = Math.abs(I.data[i * 4] - c[0]) + Math.abs(I.data[i * 4 + 1] - c[1]) + Math.abs(I.data[i * 4 + 2] - c[2]); ok[i] = d < 60 ? 1 : 0; }
        const seen = new Uint8Array(n), bl = []; for (let i = 0; i < n; i++) if (ok[i] && !seen[i]) { const st2 = [i]; seen[i] = 1; let sx = 0, sy = 0, k = 0; while (st2.length) { const j = st2.pop(); const x = j % I.width, y = (j / I.width) | 0; sx += x; sy += y; k++;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= I.width || yy >= I.height) continue; const q = yy * I.width + xx; if (ok[q] && !seen[q]) { seen[q] = 1; st2.push(q); } } }
          if (k >= 2 && k <= 40) bl.push({ x: sx / k, y: sy / k }); } return bl; };
      const ba = blob(A), bz = blob(Z); const coppie = [];
      for (const q of ba) { let best = null, bd = 5; for (const r of bz) { const d = Math.hypot(r.x - q.x, r.y - q.y); if (d < bd && d > 0.3) { bd = d; best = r; } } if (best) coppie.push([q, best]); }
      const delta = (pt) => pt ? coppie.map(([q, r]) => Math.hypot(r.x - pt.x, r.y - pt.y) - Math.hypot(q.x - pt.x, q.y - pt.y)) : [];
      const riass = (v) => { if (!v.length) return null; const s = [...v].sort((x, y) => x - y); return { n: v.length, piu: v.filter((x) => x > 0.2).length, meno: v.filter((x) => x < -0.2).length, mediana: +s[s.length >> 1].toFixed(2), media: +(v.reduce((x, y) => x + y, 0) / v.length).toFixed(2) }; };
      out[t] = { personeA: ba.length, personeZ: bz.length, coppie: coppie.length, stadio: riass(delta(st)), rif: riass(delta(rif)), dy: riass(coppie.map(([q, r]) => r.y - q.y)) };
    }
    return out;
  }, { a, z, tinte, st: Number.isFinite(cx) ? { x: cx, y: cy } : null, rif: attr.settori[RIF] ?? null });
  // posizioni delle persone nella scena Pixi (StratoPixi.tsx:63-111: scena = sfondo, aloniFolla, folla, aloniCorteo, corteo,
  // livelloAloni, onde, dinamica): corteo dell'ondata = 70 particelle per corteo nell'ordine di data-folla; dinamica = figli.
  const pos = async () => p.evaluate(() => { const app = (globalThis.__c27app ?? []).filter((a) => { try { return a.canvas?.isConnected && a.canvas.closest('.mappa'); } catch { return false; } }).at(-1); if (!app) return null;
    const sc = app.stage.children.at(-1); const cor = sc?.children[4], din = sc?.children[7];
    return { ondata: (cor?.particleChildren ?? []).map((q) => [q.x, q.y]), dinamica: (din?.children ?? []).map((c) => [c.position.x, c.position.y]), n: sc?.children.length }; });
  const P0 = await pos(); await p.waitForTimeout(400); const P1 = await pos();
  const rif = attr.settori[RIF] ?? null, st = attr.ellisse ? { x: cx, y: cy } : null;
  const mossa = (A, Z, pt) => { if (!pt || !A?.length) return null; const v = A.map((q, i) => [q, Z[i]]).filter(([q, r]) => r && Math.hypot(r[0] - q[0], r[1] - q[1]) < 12 && Math.hypot(r[0] - q[0], r[1] - q[1]) > 0.05)
      .map(([q, r]) => Math.hypot(r[0] - pt.x, r[1] - pt.y) - Math.hypot(q[0] - pt.x, q[1] - pt.y)); return { n: v.length, piu: v.filter((x) => x > 0).length, meno: v.filter((x) => x < 0).length, media: +(v.reduce((a, b) => a + b, 0) / (v.length || 1)).toFixed(2) }; };
  // per ogni punto della mappa (stadio disegnato e ogni settore): «+» se la maggioranza (≥ 80 %) delle persone se ne allontana, «−» se ci si avvicina, «~» se misto
  const versoSettori = (A, Z) => Object.fromEntries([['STADIO', st], ...Object.entries(attr.settori)].filter(([, pt]) => pt).map(([id, pt]) => { const m = mossa(A, Z, pt); return [id, !m?.n ? '?' : m.piu >= 0.8 * m.n ? '+' : m.meno >= 0.8 * m.n ? '−' : '~']; }));
  const pixi = P0 && P1 ? { scena: P0.n, ondata: cortei.map((c, k) => ({ corteo: `${c.settore}>${c.verso}`, stadio: mossa(P0.ondata.slice(k * 70, k * 70 + 70), P1.ondata.slice(k * 70, k * 70 + 70), st), rif: mossa(P0.ondata.slice(k * 70, k * 70 + 70), P1.ondata.slice(k * 70, k * 70 + 70), rif),
      verso: versoSettori(P0.ondata.slice(k * 70, k * 70 + 70), P1.ondata.slice(k * 70, k * 70 + 70)) })),
    dinamica: attr.dinamica ? { quale: attr.dinamica, persone: P0.dinamica.length, stadio: mossa(P0.dinamica, P1.dinamica, st), rif: mossa(P0.dinamica, P1.dinamica, rif), verso: versoSettori(P0.dinamica, P1.dinamica) } : null } : null;
  const r = { ep, ondata, scena: nome, pixi, ms: Math.round((t2 + t3) / 2 - (t0 + t1) / 2), folla: attr.folla, dinamica: attr.dinamica, dinColori: attr.dinColori, colori: attr.colori, stadio: attr.stadio, ellisse: attr.ellisse, rif: attr.settori[RIF] ? RIF : null, settori: Object.fromEntries(Object.entries(attr.settori).map(([k, v]) => [k, v && [Math.round(v.x), Math.round(v.y)]])), box: [attr.box.w, attr.box.h].map(Math.round), mov };
  RIS.push(r); console.log(JSON.stringify(r));
}
await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload(); await sc(p, 'titolo');
for (const ep of EP) {
  const m = missioni.find((x) => x.id === ep); const ond = piano(m); const strade = new Set(m.mappa.settori.filter((s) => s.tipo === 'strada').map((s) => s.id));
  try {
    await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(salvataggioTutti(missioni, v0))); await p.reload(); await sc(p, 'titolo');
    await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta'); await p.waitForTimeout(300);
    if (await p.locator(`[data-stagione="${m.stagione}"]`).count()) await p.click(`[data-stagione="${m.stagione}"]`);
    await p.click(`[data-episodio="${ep}"] .settore-punto`); await p.waitForTimeout(300);
    await p.click('[data-azione="avvia-episodio"]'); await p.waitForTimeout(200);
    for (let k = 0; k < 3 && await p.locator('[data-azione="conferma-passo"]').count(); k++) { await p.click('[data-azione="conferma-passo"]'); await p.waitForTimeout(150); }
    if (await p.locator('[data-azione="conferma-rigioca"]').count()) await p.click('[data-azione="conferma-rigioca"]');
    await sc(p, 'sala'); while (await p.locator('[data-azione="passo"]').count()) { await p.click('[data-azione="passo"]'); await p.waitForTimeout(100); }
    await p.click('[data-azione="avanti"]'); await sc(p, 'briefing');
    while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) { await p.click('[data-azione="prossimo"], [data-azione="passo"]'); await p.waitForTimeout(100); }
    await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento');
    for (const [i, o] of ond.entries()) {
      if (i) await sc(p, 'schieramento'); await p.waitForSelector('.mappa[data-pronta="si"]'); await p.waitForTimeout(300);
      await misura(ep, `schieramento-${i + 1}`, i + 1);
      await schiera(p, o.d); if (FOTO) await p.locator('.mappa').first().screenshot({ path: `${DIR}/${W}x${H}${ROSSI.length ? '-rosso-' + ROSSI.join('-') : ''}-${ep}-schierato-${i + 1}.png` }); await p.click('[data-azione="conferma"]'); if (await p.locator('[data-azione="conferma-davvero"]').count()) await p.click('[data-azione="conferma-davvero"]');
      for (const [cid, op, settore] of o.rs) {
        await sc(p, 'chiamata'); await p.waitForTimeout(300);
        if (strade.has(settore)) await misura(ep, `chiamata-${cid}`, i + 1);
        await p.click(`[data-opzione="${op}"]`); await p.waitForSelector('[data-azione="continua"]', { timeout: 5000 }).catch(() => {}); await p.waitForTimeout(150);
        if (await p.locator('[data-azione="continua"]').count()) await p.click('[data-azione="continua"]');
      }
      await sc(p, 'chiusura'); await p.click('[data-azione="rapporto"]'); await sc(p, 'rapporto'); await p.waitForTimeout(150); await p.click('[data-azione="avanti"]');
    }
  } catch (e) { await p.screenshot({ path: `${DIR}/blocco-${ep}.png` }); console.log(await p.evaluate(() => [...document.querySelectorAll('.scena')].map((s) => s.dataset.scena + ':' + getComputedStyle(s).opacity).join(' '))); errori.push(`BLOCCO ${ep}: ${e.message.slice(0, 200)}`); console.log(`BLOCCO ${ep}: ${e.message.slice(0, 200)}`); }
}
await b.close(); srv.close();
writeFileSync(OUT, JSON.stringify({ W, H, D, ROSSI, RIS, errori }, null, 1)); console.log(`misure ${RIS.length}, errori ${errori.length}`);
