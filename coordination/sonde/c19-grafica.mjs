// Sonda C-019 (grafica): e01 ed e06 giocati dall'interfaccia col piano del bot attento (vinto) e del peggiore (perso), a
// 360×760, 375×667 e 412×915. Si parte da un salvataggio con gli episodi precedenti superati («Riprendi» → città →
// episodio). Su ogni schermata, a inizio e a fondo pagina:
//  - C18-10: versione [data-versione-angolo] dentro la finestra SENZA scorrere; sovrapposta a comandi (button, a,
//    .opzione, [role=button], .settore-punto) o a righe di testo (rettangoli dei nodi di testo, Range.getClientRects);
//  - PO-098: contrasto di ogni testo col suo fondo effettivo (primo antenato con fondo opaco, altrimenti il body),
//    soglia 4,5:1 (3:1 se ≥ 24 px, o ≥ 18,66 px in grassetto). Formula WCAG 2.1: https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
//    Per «Per la … stella» e [data-premio-fiducia]: colore, fondo, rapporto, e stacco del riquadro dalla pagina
//    (fondo o bordo ≥ 3:1, https://www.w3.org/TR/WCAG21/#non-text-contrast);
//  - PO-099: «Rende di più» / [data-rende] nella pagina, misurato anche con un'unità in mano nello schieramento;
//  - errori di console.
// Foto della finestra in <cartella>: <w>-<ep>-<vinto|perso>-<scena>[-fondo].jpg (solo scene scelte).
// Uso: node coordination/sonde/c19-grafica.mjs <radice con dist/> <cartella foto>   (filtri: EP=e06 LARG=360,412)
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c19';
mkdirSync(DIR, { recursive: true });
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { variabiliIniziali } = await import(`${R}/src/logica/condizioni.ts`); const { GAME_VERSION } = await import(`${R}/src/versione.ts`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const v0 = variabiliIniziali(dich.values());
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 10000 });
const quale = (p) => p.evaluate(() => document.querySelector('.scena')?.dataset.scena);
const piano = (m, strategia) => { const g = B[strategia](creaCaso(1), dich); let s = M.iniziaMissione(m, v0, dich); const ond = [];
  while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = []; for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); rs.push([c.id, o]); s = M.rispondi(m, s, c.id, o, dich); } ond.push({ d, rs }); s = M.chiudiOndata(m, s, dich); }
  return { ond, esito: M.concludiMissione(m, s, dich).esito }; };
const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x).sort((a, c) => a.episodio - c.episodio);
const salvataggio = (prima) => ({ save_version: 2, game_version: GAME_VERSION, seme: 1, caso: 1, variabili: v0, missioni_concluse: prima.map((m) => m.id),
  episodi: Object.fromEntries(prima.map((m) => [m.id, { migliore: { esito: m.esiti[0].id, fallita: false, stelle: 1 }, tentativi: 1, variabili_prima: v0, variabili_dopo: v0 }])), genere: 'f', rapporto_aperto: null, in_corso: null });
const misura = (p) => p.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0'; };
  const ov = (a, c) => Math.max(0, Math.min(a.right, c.right) - Math.max(a.left, c.left)) * Math.max(0, Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top));
  const rgb = (c) => { const m = c.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 0]; return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const rapp = (x, y) => { const [a, c] = [lum(x), lum(y)].sort((p, q) => q - p); return (a + 0.05) / (c + 0.05); };
  const pag = rgb(getComputedStyle(document.body).backgroundColor);
  const fondoDi = (el) => { for (let a = el; a && a !== document.documentElement; a = a.parentElement) { const c = rgb(getComputedStyle(a).backgroundColor); if (c.a > 0.5) return [c, a]; } return [pag, document.body]; };
  const v = document.querySelector('[data-versione-angolo]'); const vr = v && vis(v) ? v.getBoundingClientRect() : null;
  const comandi = [...document.querySelectorAll('button, a, .opzione, [role=button], .settore-punto')].filter(vis);
  const vCom = vr ? comandi.map((e) => [e, ov(vr, e.getBoundingClientRect())]).filter(([, a]) => a > 0).map(([e, a]) => `${(e.textContent || e.getAttribute('aria-label') || e.className).trim().slice(0, 16)} ${Math.round(a)}px²`) : [];
  const vTesto = [];
  const w = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    if (!n.textContent.trim() || (v && v.contains(n)) || n.parentElement.closest('svg') || !vis(n.parentElement)) continue;
    const rg = document.createRange(); rg.selectNodeContents(n);
    for (const q of rg.getClientRects()) if (vr && ov(vr, q) > 0) vTesto.push(`«${n.textContent.trim().slice(0, 16)}» ${Math.round(ov(vr, q))}px²`);
  }
  const bassi = [];
  for (const el of document.querySelectorAll('main *')) {
    if (el.closest('svg') || !vis(el) || !(el.offsetParent || getComputedStyle(el).position === 'fixed')) continue;
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const cs = getComputedStyle(el); const [f] = fondoDi(el); const t = rgb(cs.color);
    const mix = { r: t.r * t.a + f.r * (1 - t.a), g: t.g * t.a + f.g * (1 - t.a), b: t.b * t.a + f.b * (1 - t.a) };
    const px = parseFloat(cs.fontSize), grande = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700); const r = rapp(mix, f);
    if (r < (grande ? 3 : 4.5)) bassi.push(`«${el.textContent.trim().slice(0, 22)}» ${r.toFixed(2)}:1 (${el.tagName.toLowerCase()}.${[...el.classList].join('.')} ${px}px ${cs.fontWeight} colore ${cs.color} su rgb(${f.r}, ${f.g}, ${f.b}))`);
  }
  const dettaglio = (el) => { if (!el) return null; const cs = getComputedStyle(el); const [f, a] = fondoDi(el); const ca = getComputedStyle(a);
    const box = a === document.body ? 'nessun riquadro (sulla pagina)' : `riquadro ${a.tagName.toLowerCase()}.${[...a.classList].join('.')} fondo/pagina ${rapp(f, pag).toFixed(2)}:1, bordi ${['Top', 'Right', 'Bottom', 'Left'].map((k) => `${k[0]}${parseFloat(ca[`border${k}Width`])}px ${rapp(rgb(ca[`border${k}Color`]), pag).toFixed(2)}:1`).join(' ')}`;
    return `«${el.textContent.trim().slice(0, 40)}» colore ${cs.color} fondo rgb(${f.r}, ${f.g}, ${f.b}) testo/fondo ${rapp(rgb(cs.color), f).toFixed(2)}:1 · ${box}`; };
  const stella = [...document.querySelectorAll('main *')].find((e) => /stella (la )?(tensione|successiva)|Per la (seconda|terza|prima) stella/.test([...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('')) && vis(e));
  const fid = document.querySelector('[data-premio-fiducia]');
  return { y: Math.round(scrollY), maxY: document.scrollingElement.scrollHeight - innerHeight, versione: v?.textContent ?? null, vDentro: vr ? vr.top >= 0 && vr.bottom <= innerHeight && vr.left >= 0 && vr.right <= innerWidth : false,
    vRett: vr ? `${Math.round(vr.left)},${Math.round(vr.top)} ${Math.round(vr.width)}×${Math.round(vr.height)}` : null, vCom, vTesto: vTesto.slice(0, 4), bassi: bassi.slice(0, 6),
    rende: /Rende di più/.test(document.body.innerText) || !!document.querySelector('[data-rende]'), stella: dettaglio(stella), fid: vis(fid ?? document.body) && fid ? dettaglio(fid) : null };
});
const RIS = []; const errori = []; const RENDE = [];
const foto = (p, nome) => p.screenshot({ path: `${DIR}/${nome}.jpg`, type: 'jpeg', quality: 70 });
async function scena(p, tag, nome, fai = false) {
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(150); const a = await misura(p); if (fai) await foto(p, `${tag}-${nome}`);
  await p.evaluate(() => scrollTo(0, document.scrollingElement.scrollHeight)); await p.waitForTimeout(250); const z = await misura(p); if (fai && z.y > 0) await foto(p, `${tag}-${nome}-fondo`);
  RIS.push({ tag, nome, a, z }); await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(100);
}
async function schiera(p, d, tag, prima) { for (const [r, ps] of Object.entries(d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) {
  if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`);
  if (prima.v) { prima.v = false; const x = await misura(p); RENDE.push(`${tag} in mano «${await p.textContent('[data-in-mano]')}» rende=${x.rende}`); await scena(p, tag, 'schieramento-in-mano', true); }
  await p.click(`[data-settore="${s}"] .settore-punto`); } }
const EP = (process.env.EP ?? 'e01,e06').split(','); const LARG = (process.env.LARG ?? '360,375,412').split(',').map(Number);
for (const ep of EP) for (const [w, h] of [[360, 760], [375, 667], [412, 915]].filter(([x]) => LARG.includes(x))) for (const strategia of ['attenta', 'peggiore']) {
  const m = dati[`missioni/${ep}.json`]; const pl = piano(m, strategia); const esito = pl.esito.fallita ? 'perso' : 'vinto'; const tag = `${w}-${ep}-${esito}`;
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  p.on('console', (x) => { if (x.type() === 'error') errori.push(`${tag}: ${x.text().slice(0, 140)}`); }); p.on('pageerror', (e) => errori.push(`${tag}: ${e.message.slice(0, 140)}`));
  await p.goto(URL); await p.evaluate((s) => { localStorage.clear(); localStorage.setItem('valmora-guida-vista', 'si'); localStorage.setItem('valmora-salvataggio', s); }, JSON.stringify(salvataggio(missioni.filter((x) => x.episodio < m.episodio))));
  await p.reload(); await sc(p, 'titolo'); await scena(p, tag, 'titolo', ep === 'e01' && strategia === 'attenta');
  await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta'); await p.waitForTimeout(400);
  const st = p.locator(`[data-stagione="${m.stagione}"]`); if (await st.count()) await st.click();
  await p.locator(`[data-episodio="${m.id}"] .settore-punto`).click(); await p.waitForTimeout(200); await scena(p, tag, 'citta', strategia === 'attenta');
  await p.click('[data-azione="avvia-episodio"]'); await sc(p, 'sala'); await p.waitForTimeout(400);
  let k = 0; while (await p.locator('[data-azione="passo"]').count()) { await scena(p, tag, `sala-${++k}`, false); await p.click('[data-azione="passo"]'); await p.waitForTimeout(120); } await scena(p, tag, `sala-${++k}`, false);
  await p.click('[data-azione="avanti"]'); await sc(p, 'briefing');
  k = 0; while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) { await scena(p, tag, `briefing-${++k}`, strategia === 'attenta' && k === 1); await p.click('[data-azione="prossimo"], [data-azione="passo"]'); await p.waitForTimeout(120); }
  await scena(p, tag, `briefing-${++k}`, false); await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento');
  const prima = { v: true };
  for (const [i, o] of pl.ond.entries()) {
    if (i) await sc(p, 'schieramento');
    await schiera(p, o.d, tag, prima); await scena(p, tag, `schieramento-${i + 1}`, false);
    await p.click('[data-azione="conferma"]'); if (await p.locator('[data-azione="conferma-davvero"]').count()) await p.click('[data-azione="conferma-davvero"]');
    for (const [cid, op] of o.rs) {
      await sc(p, 'chiamata'); await p.waitForTimeout(250); await scena(p, tag, `chiamata-${cid}`, strategia === 'attenta' && i === 0 && cid === o.rs[0][0]);
      await p.click(`[data-opzione="${op}"]`); await p.waitForTimeout(300);
      if (await p.locator('[data-azione="continua"]').count()) { await scena(p, tag, `risposta-${cid}`, false); await p.click('[data-azione="continua"]'); }
    }
    await sc(p, 'chiusura'); await scena(p, tag, `chiusura-${i + 1}`, false); await p.click('[data-azione="rapporto"]'); await sc(p, 'rapporto'); await p.waitForTimeout(250);
    await scena(p, tag, `rapporto-${i + 1}`, i === pl.ond.length - 1 || i === 0); await p.click('[data-azione="avanti"]');
  }
  await sc(p, 'verbale'); await p.waitForTimeout(400);
  k = 0; while (await p.locator('[data-azione="passo"]').count()) { await scena(p, tag, `verbale-${++k}`, ep === 'e06'); await p.click('[data-azione="passo"]'); await p.waitForTimeout(150); } await scena(p, tag, `verbale-${++k}`, true);
  await p.close();
}
const tutte = RIS.flatMap((r) => [['inizio', r, r.a], ['fondo', r, r.z]]);
for (const w of [360, 375, 412]) { const x = RIS.filter((r) => r.tag.startsWith(`${w}-`));
  console.log(`C18-10 ${w}: schermate ${x.length}; versione presente ${x.filter((r) => r.a.versione).length}; dentro la finestra senza scorrere ${x.filter((r) => r.a.vDentro).length}; a fondo pagina ${x.filter((r) => r.z.vDentro).length}; sopra comandi (inizio o fondo) ${x.filter((r) => r.a.vCom.length || r.z.vCom.length).length}; sopra testo ${x.filter((r) => r.a.vTesto.length || r.z.vTesto.length).length} · rettangolo ${x[0]?.a.vRett}`); }
for (const [q, r, x] of tutte) if (x.vCom.length || x.vTesto.length) console.log(`  versione ${r.tag} ${r.nome} ${q}: comandi ${x.vCom.join('; ') || 0} · testo ${x.vTesto.join('; ') || 0}`);
const bassi = tutte.filter(([, , x]) => x.bassi.length); console.log(`PO-098 testi sotto soglia: ${bassi.length} misure su ${tutte.length}`); const visti = new Set();
for (const [q, r, x] of bassi) for (const s of x.bassi) { const k = `${r.tag.split('-')[1]} ${r.nome.split('-')[0]} ${s.replace(/«[^»]*»/, '')}`; if (!visti.has(k)) { visti.add(k); console.log(`  ${r.tag} ${r.nome} ${q}: ${s}`); } }
const st = new Set(); for (const [, r, x] of tutte) for (const s of [x.stella, x.fid].filter(Boolean)) { const k = s.replace(/«[^»]*»/, '').trim() + r.tag.split('-').slice(0, 3).join('-'); if (!st.has(k)) { st.add(k); console.log(`  ${r.tag} ${r.nome}: ${s}`); } }
console.log(`PO-099: schermate con «Rende di più» o [data-rende]: ${tutte.filter(([, , x]) => x.rende).length} su ${tutte.length}`); for (const x of RENDE) console.log('  ' + x);
console.log(`errori di console: ${errori.length}`); for (const e of errori.slice(0, 20)) console.log('  ' + e);
await b.close(); srv.close();
