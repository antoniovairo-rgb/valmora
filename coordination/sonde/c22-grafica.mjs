// Sonda C-022 (PO-106, sola lettura): censimento e misura di ogni elemento grafico visibile nell'interfaccia vera (dist/).
// Gioca dall'interfaccia gli episodi EP (piano del bot attento) a 360×760, 375×667, 412×915 con deviceScaleFactor DPR,
// e su ogni schermata (titolo, genere, guida 1-6, crediti, città, sala, briefing, schieramento col «?», chiamate,
// risposte con i segni, chiusura, rapporti, verbale e bilancio) misura nel DOM:
//  - icone lucide (svg.lucide): riquadro, glifo (unione dei rettangoli dei figli), tratto = stroke-width × lato/24,
//    colore del tratto (o del riempimento) contro il fondo effettivo (antenati con sfondo e opacità), rapporto WCAG;
//  - stelle, stemmi, logo (img: naturalWidth contro lato × DPR), dischi dei settori, tasti lettera, segni ▲▼⚑,
//    pastiglie, tacche della fiducia;
//  - vignette (svg.vignetta): scala = min(w/320, h/180); per la chiamata il riquadro di chi chiama (232,18 76×60) e il
//    suo glifo, tratti v-tratto/v-linea in px reali, pallini delle sagome.
// Foto: finestra di ogni schermata nuova (<w>[x2]-<ep>-<scena>.jpg) e ritagli di ogni elemento per i fogli ingranditi
// (in SCRATCH, poi c22-fogli.mjs). Uscita JSON in <uscita>.
// Uso: DPR=1|2 EP=e01,e04 node coordination/sonde/c22-grafica.mjs <radice con dist/> <cartella foto> <uscita.json> [cartella ritagli]
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c22'; const OUT = process.argv[4] ?? 'c22.json'; const RIT = process.argv[5];
mkdirSync(DIR, { recursive: true }); if (RIT) mkdirSync(RIT, { recursive: true });
const DPR = Number(process.env.DPR ?? 1); const EP = (process.env.EP ?? 'e01,e04,e07,e13,e18,e26,e34').split(','); const W = process.env.W?.split(',').map(Number);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(R, 'data'));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 })
  .catch(async (e) => { const q = await p.evaluate(() => [...document.querySelectorAll('.scena')].map((x) => x.dataset.scena).join(',')); await p.screenshot({ path: `${OUT}.errore.png` }); throw new Error(`attesa ${n}, in pagina ${q}: ${e.message.slice(0, 60)}`); });
const quale = (p) => p.evaluate(() => document.querySelector('.scena')?.dataset.scena);
const piano = (m) => { const g = B.attenta(creaCaso(1), dich); let s = M.iniziaMissione(m, v0, dich); const ond = [];
  while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = []; for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); rs.push([c.id, o]); s = M.rispondi(m, s, c.id, o, dich); } ond.push({ d, rs }); s = M.chiudiOndata(m, s, dich); }
  return ond; };
async function schiera(p, d) { for (const [r, ps] of Object.entries(d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`); } }

// Misura nella pagina: tutto ciò che è grafico e visibile nella finestra o nella pagina (scorrimento compreso).
const censisci = (p) => p.evaluate(() => {
  const rgb = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [r, g, b, a]; };
  const lum = ([r, g, b]) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const rapporto = (a, c) => { const [x, y] = [lum(a), lum(c)].sort((u, v) => v - u); return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100; };
  const mescola = (su, sotto, a) => su.slice(0, 3).map((v, i) => v * a + sotto[i] * (1 - a));
  const fondo = (e) => { const strati = []; for (let x = e; x && x.nodeType === 1; x = x.parentElement) { const c = rgb(getComputedStyle(x).backgroundColor); if (c && c[3] > 0) { strati.push(c); if (c[3] >= 1) break; } }
    let f = [255, 212, 0]; for (const c of strati.reverse()) f = mescola(c, f, c[3]); return f; };
  const opac = (e) => { let o = 1; for (let x = e; x && x.nodeType === 1; x = x.parentElement) o *= Number(getComputedStyle(x).opacity); return o; };
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !e.closest('[hidden]') && getComputedStyle(e).visibility !== 'hidden'; };
  const hex = (c) => '#' + c.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const box = (r) => ({ x: Math.round(r.left), y: Math.round(r.top + scrollY), w: +r.width.toFixed(1), h: +r.height.toFixed(1) });
  const contesto = (e) => { const c = e.closest('[data-azione],[data-risorsa],[data-effetto],[data-presenza],[data-fissa],[data-fissa-chip],[data-riposo],[data-montate],.avatar,.stelle,h3,.riposo,.indicatore,.nota-fisse,[data-nota-fisse],.pulsante,.unita');
    return c ? (c.dataset.azione ?? c.dataset.risorsa ?? c.dataset.effetto ?? (c.dataset.presenza ? 'pastiglia' : null) ?? (c.dataset.fissa ? 'pastiglia-fissa' : null) ?? (c.dataset.fissaChip ? 'lucchetto-unita' : null) ?? (c.dataset.riposo ? 'riposo-unita' : null) ?? (c.dataset.montate ? 'montate-unita' : null) ?? String(c.className?.baseVal ?? c.className).split(' ')[0]) : String(e.parentElement?.className?.baseVal ?? e.parentElement?.className ?? '?').split(' ')[0]; };
  const out = [];
  // 1) icone lucide (comprese le stelle)
  for (const s of document.querySelectorAll('svg.lucide')) {
    if (!vis(s)) continue; const r = s.getBoundingClientRect(); const cs = getComputedStyle(s);
    const fig = [...s.children].map((c) => c.getBoundingClientRect()); const g = { l: Math.min(...fig.map((x) => x.left)), t: Math.min(...fig.map((x) => x.top)), r: Math.max(...fig.map((x) => x.right)), b: Math.max(...fig.map((x) => x.bottom)) };
    const sw = Number(s.getAttribute('stroke-width') ?? 2); const tratto = sw * r.width / 24;
    const fdo = fondo(s.parentElement); const o = opac(s); const col = rgb(cs.color); const tinta = mescola(col, fdo, o * col[3]);
    const pieno = cs.fill && cs.fill !== 'none' ? rgb(cs.fill) : null;
    out.push({ tipo: s.classList.contains('stella') ? 'stella' : 'icona', nome: [...s.classList].find((c) => c.startsWith('lucide-') && c !== 'lucide-icon')?.slice(7) ?? '?', ctx: contesto(s), ...box(r),
      glifo: +Math.min(g.r - g.l, g.b - g.t).toFixed(1), glifoWH: `${(g.r - g.l).toFixed(1)}×${(g.b - g.t).toFixed(1)}`, tratto: +tratto.toFixed(2), colore: hex(tinta), fondo: hex(fdo), contrasto: rapporto(tinta, fdo),
      riempi: pieno && pieno[3] > 0 ? hex(pieno) : null, contrastoRiempi: pieno && pieno[3] > 0 ? rapporto(pieno, fdo) : null, opacita: +o.toFixed(2), spento: !!s.closest('button')?.disabled });
  }
  // 2) stemmi
  for (const s of document.querySelectorAll('svg.stemma')) { if (!vis(s)) continue; const r = s.getBoundingClientRect(); const f = s.querySelector('.stemma-forma'); const pr = rgb(getComputedStyle(f).fill); const fdo = fondo(s.parentElement);
    const sim = s.querySelector('g[fill]:not(.stemma-forma)'); const sr = sim?.getBoundingClientRect(); const sc = rgb(getComputedStyle(sim).fill);
    out.push({ tipo: 'stemma', nome: s.dataset.stemma, ctx: contesto(s), ...box(r), glifo: sr ? +Math.min(sr.width, sr.height).toFixed(1) : null, colore: hex(pr), fondo: hex(fdo), contrasto: rapporto(pr, fdo), simbolo: hex(sc), contrastoSimbolo: rapporto(sc, pr), tratto: +(2 * r.height / 50).toFixed(2) }); }
  // 3) logo e immagini raster/vettoriali in <img>
  for (const i of document.querySelectorAll('img')) { if (!vis(i)) continue; const r = i.getBoundingClientRect(); out.push({ tipo: 'img', nome: i.getAttribute('src'), ctx: contesto(i), ...box(r), nativo: `${i.naturalWidth}×${i.naturalHeight}`, serve: `${Math.round(r.width * devicePixelRatio)}×${Math.round(r.height * devicePixelRatio)}`, sgranato: i.naturalWidth < r.width * devicePixelRatio && !/\.svg$/.test(i.src) }); }
  // 4) segni testuali e forme dell'interfaccia
  const forme = [['.segno-effetto', 'segno'], ['.tasto', 'tasto-lettera'], ['.fiducia-tacche > span', 'tacca'], ['.pastiglia', 'pastiglia'], ['.unita-fissa', 'unita-fissa'], ['.passi > li', 'pallino-passi'], ['.timbro', 'timbro']];
  for (const [q, nome] of forme) for (const e of document.querySelectorAll(q)) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); const bg = rgb(cs.backgroundColor); const fdo = fondo(e.parentElement); const col = rgb(cs.color);
    out.push({ tipo: nome, nome: (e.textContent || '').trim().slice(0, 6) || e.className, ctx: contesto(e), ...box(r), glifo: +Math.min(r.width, r.height).toFixed(1), font: parseFloat(cs.fontSize), colore: hex(col), fondo: hex(bg && bg[3] > 0 ? bg : fdo),
      contrasto: rapporto(col, bg && bg[3] > 0 ? bg : fdo), bordoFondo: bg && bg[3] > 0 ? rapporto(bg, fdo) : null }); }
  // 5) dischi dei settori (::after) e della città
  for (const e of document.querySelectorAll('.settore-punto')) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); const a = getComputedStyle(e, '::after'); const ins = parseFloat(a.inset || a.top) || 0; const d = r.width - 2 * (a.inset?.includes('%') ? r.width * parseFloat(a.inset) / 100 : ins);
    const st = e.closest('.settore'); out.push({ tipo: st?.classList.contains('episodio') ? 'disco-citta' : 'disco-settore', nome: st?.dataset.settore ?? st?.dataset.episodio, ctx: st?.className.split(' ').slice(1).join(' '), ...box(r), glifo: +d.toFixed(1), colore: hex(rgb(a.backgroundColor) ?? [0, 0, 0]), bordo: parseFloat(a.borderTopWidth), font: e.textContent ? parseFloat(getComputedStyle(e).fontSize) : null, testo: e.textContent || null }); }
  // 6) vignette
  for (const v of document.querySelectorAll('svg.vignetta')) { if (!vis(v)) continue; const r = v.getBoundingClientRect(); const k = Math.min(r.width / 320, r.height / 180);
    const tr = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--vignetta-tratto')) || 2.4; const ln = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bordo-fine')) || 2;
    const x = { tipo: 'vignetta', nome: v.dataset.vignetta, evento: v.dataset.evento ?? null, ctx: contesto(v), ...box(r), scala: +k.toFixed(3), trattoPx: +(tr * k).toFixed(2), lineaPx: +(ln * k).toFixed(2), cornicePx: +(3 * k).toFixed(2) };
    const chi = v.querySelector('g[transform="translate(232 18)"]'); if (chi) { const q = chi.querySelector('rect').getBoundingClientRect(); const gl = chi.querySelector(':scope > g')?.getBoundingClientRect(); x.riquadro = `${q.width.toFixed(1)}×${q.height.toFixed(1)}`; if (gl) { x.glifoChi = `${gl.width.toFixed(1)}×${gl.height.toFixed(1)}`; x.glifo = +Math.min(gl.width, gl.height).toFixed(1); x.chiBox = box(q); } }
    const pall = v.querySelector('[data-figura="pallino"]'); if (pall) x.pallino = +pall.getBoundingClientRect().width.toFixed(1);
    const sc = v.querySelector('rect.v-magenta[width="6"][height="16"]'); if (sc) x.esclamativo = `${sc.getBoundingClientRect().width.toFixed(1)}×${sc.getBoundingClientRect().height.toFixed(1)}`;
    const scr = [...v.querySelectorAll('text')].map((t) => ({ t: t.textContent, h: +t.getBoundingClientRect().height.toFixed(1) })); if (scr.length) x.scritte = scr;
    out.push(x); }
  // 7) nomi dei settori (testo sulla mappa, per confronto)
  const nomi = [...document.querySelectorAll('.settore-nome')].filter(vis).map((e) => parseFloat(getComputedStyle(e).fontSize));
  const mp = document.querySelector('.mappa'); const mr = mp && vis(mp) ? mp.getBoundingClientRect() : null;
  return { el: out, nomiFont: nomi.length ? Math.min(...nomi) : null, mappa: mr ? { ...box(mr), gl: mp.dataset.mappa, folla: mp.dataset.folla ?? null, dinamica: mp.dataset.dinamica ?? null } : null, dpr: devicePixelRatio, vw: innerWidth };
});

const RIS = []; const errori = []; let nRit = 0; const ritagli = [];
async function scena(p, w, ep, nome, foto) {
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(150);
  const x = await censisci(p); RIS.push({ w, dpr: DPR, ep, scena: nome, ...x });
  const suf = DPR === 2 ? 'x2' : '';
  if (foto) await p.screenshot({ path: `${DIR}/${w}${suf}-${ep}-${nome}.jpg`, type: 'jpeg', quality: 78 });
  if (RIT) { // ritagli di ogni elemento con chiave nuova (tipo, nome, contesto, misura)
    const viste = new Set(ritagli.map((q) => q.k));
    for (const e of x.el) { const k = `${w}|${e.tipo}|${e.nome}|${e.ctx}|${e.w}`; if (viste.has(k) || e.tipo === 'pallino-passi') continue; viste.add(k);
      const pad = e.tipo === 'vignetta' ? 2 : 4; const clip = { x: Math.max(0, e.x - pad), y: e.y - pad, width: e.w + 2 * pad, height: e.h + 2 * pad };
      try { await p.evaluate((y) => scrollTo(0, y + 4 <= innerHeight ? 0 : Math.max(0, y - 100)), e.y + e.h); // a scorrimento 0 se è già nella finestra (barre fisse in basso)
        await p.waitForTimeout(60); const sy = await p.evaluate(() => scrollY);
        const f = `${RIT}/${w}${suf}-${String(++nRit).padStart(4, '0')}.png`; await p.screenshot({ path: f, clip: { ...clip, y: clip.y - sy } });
        ritagli.push({ ...e, k, f, vw: w, dpr: DPR, ep, scena: nome });
        if (e.chiBox) { const c = e.chiBox; const f2 = `${RIT}/${w}${suf}-${String(++nRit).padStart(4, '0')}.png`; await p.screenshot({ path: f2, clip: { x: c.x - 2, y: c.y - 2 - sy, width: c.w + 4, height: c.h + 4 } }); ritagli.push({ ...e, k: k + '|chi', f: f2, vw: w, dpr: DPR, ep, scena: nome, tipo: 'vignetta-chi' }); }
      } catch { /* fuori pagina */ } }
    await p.evaluate(() => scrollTo(0, 0));
  }
}

for (const [w, h] of [[360, 760], [375, 667], [412, 915]].filter(([w]) => !W || W.includes(w))) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, deviceScaleFactor: DPR, reducedMotion: 'reduce' });
  p.on('console', (x) => { if (x.type() === 'error') errori.push(`${w}: ${x.text().slice(0, 160)}`); }); p.on('pageerror', (e) => errori.push(`${w}: ${e.message.slice(0, 160)}`));
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload(); await sc(p, 'titolo'); await p.waitForTimeout(300);
  await scena(p, w, 'gen', 'titolo', true);
  await p.getByRole('button', { name: 'Nuova partita' }).click(); await sc(p, 'genere'); await scena(p, w, 'gen', 'genere', true);
  await p.click('[data-genere="f"]'); await p.waitForTimeout(500);
  if ((await quale(p)) === 'guida') { for (let k = 1; k <= 6; k++) { await scena(p, w, 'gen', `guida-${k}`, true); if (k < 6) { await p.click('[data-azione="guida-avanti"]'); await p.waitForTimeout(200); } } }
  // crediti dal titolo
  await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(salvataggioTutti(missioni, v0))); await p.reload(); await sc(p, 'titolo');
  if (await p.locator('[data-azione="crediti"]').count()) { await p.click('[data-azione="crediti"]'); await p.waitForTimeout(500); await scena(p, w, 'gen', 'crediti', true); }
  for (const ep of EP) {
    const m = missioni.find((x) => x.id === ep); const ond = piano(m);
    await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(salvataggioTutti(missioni, v0))); await p.reload(); await sc(p, 'titolo');
    await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta'); await p.waitForTimeout(300);
    if (await p.locator(`[data-stagione="${m.stagione}"]`).count()) await p.click(`[data-stagione="${m.stagione}"]`);
    await p.click(`[data-episodio="${ep}"] .settore-punto`); await p.waitForSelector('.mappa[data-pronta="si"]', { timeout: 10000 }).catch(() => {}); await p.waitForTimeout(300);
    await scena(p, w, ep, 'citta', ep === EP[0]);
    await p.click('[data-azione="avvia-episodio"]'); await p.waitForTimeout(200);
    for (let k = 0; k < 3 && await p.locator('[data-azione="conferma-passo"]').count(); k++) { await p.click('[data-azione="conferma-passo"]'); await p.waitForTimeout(150); }
    if (await p.locator('[data-azione="conferma-rigioca"]').count()) { if (ep === EP[0]) await scena(p, w, ep, 'tripla', true); await p.click('[data-azione="conferma-rigioca"]'); }
    await sc(p, 'sala'); await p.waitForSelector('.mappa[data-pronta="si"]', { timeout: 10000 }).catch(() => {}); await p.waitForTimeout(400);
    let k = 0; while (await p.locator('[data-azione="passo"]').count()) { await scena(p, w, ep, `sala-${++k}`, k === 1); await p.click('[data-azione="passo"]'); await p.waitForTimeout(150); } await scena(p, w, ep, `sala-${++k}`, false);
    await p.click('[data-azione="avanti"]'); await sc(p, 'briefing'); await p.waitForTimeout(300);
    k = 0; while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) { await scena(p, w, ep, `briefing-${++k}`, k === 1); await p.click('[data-azione="prossimo"], [data-azione="passo"]'); await p.waitForTimeout(150); }
    await scena(p, w, ep, `briefing-${++k}`, false); await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento');
    for (const [i, o] of ond.entries()) {
      if (i) await sc(p, 'schieramento'); await p.waitForSelector('.mappa[data-pronta="si"]', { timeout: 10000 }).catch(() => {}); await p.waitForTimeout(250);
      if (i === 0 && await p.locator('[data-azione="aiuto"]').count()) { await p.click('[data-azione="aiuto"]'); await p.waitForTimeout(250); await scena(p, w, ep, 'schieramento-aiuto', true); await p.click('[data-azione="aiuto"]'); await p.waitForTimeout(150); }
      await schiera(p, o.d); await scena(p, w, ep, `schieramento-${i + 1}`, i === 0 || i === ond.length - 1);
      await p.click('[data-azione="conferma"]'); if (await p.locator('[data-azione="conferma-davvero"]').count()) await p.click('[data-azione="conferma-davvero"]');
      for (const [cid, op] of o.rs) {
        await sc(p, 'chiamata'); await p.waitForSelector('.mappa[data-pronta="si"]', { timeout: 10000 }).catch(() => {}); await p.waitForTimeout(300);
        await scena(p, w, ep, `chiamata-${cid}`, true);
        await p.click(`[data-opzione="${op}"]`); await p.waitForSelector('[data-azione="continua"]', { timeout: 5000 }).catch(() => {}); await p.waitForTimeout(200);
        if (await p.locator('[data-azione="continua"]').count()) { await scena(p, w, ep, `risposta-${cid}`, false); await p.click('[data-azione="continua"]'); }
      }
      await sc(p, 'chiusura'); await scena(p, w, ep, `chiusura-${i + 1}`, false); await p.click('[data-azione="rapporto"]'); await sc(p, 'rapporto'); await p.waitForTimeout(250);
      await scena(p, w, ep, `rapporto-${i + 1}`, i === 0); await p.click('[data-azione="avanti"]');
    }
    await sc(p, 'verbale'); await p.waitForTimeout(400);
    k = 0; while (await p.locator('[data-azione="passo"]').count()) { await scena(p, w, ep, `verbale-${++k}`, true); await p.click('[data-azione="passo"]'); await p.waitForTimeout(150); } await scena(p, w, ep, `verbale-${++k}`, true);
    console.log(`${w} dpr${DPR} ${ep}: schermate ${RIS.filter((r) => r.w === w && r.ep === ep).length}`);
  }
  await p.close();
}
await b.close(); srv.close();
writeFileSync(OUT, JSON.stringify({ RIS, ritagli, errori }));
console.log(`schermate ${RIS.length}, elementi ${RIS.reduce((t, r) => t + r.el.length, 0)}, ritagli ${ritagli.length}, errori di console ${errori.length}${errori.length ? '\n  ' + [...new Set(errori)].slice(0, 8).join('\n  ') : ''}`);
