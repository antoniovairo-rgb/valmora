// Sonda C-020 (grafica): e01 ed e06 giocati dall'interfaccia col piano del bot attento (vinto) e del peggiore (perso),
// più e04 col piano attento e la scelta forzata «Chiedi di chiudere il mercato subito», a 360×760, 375×667 e 412×915.
// Si parte da un salvataggio con gli episodi precedenti superati («Riprendi» → città → episodio). Misure:
//  - PO-101: «i» [data-azione="info-ondata"] in ogni scena dell'ondata (schieramento, chiamata, risposta, chiusura;
//    il rapporto è annotato a parte); testo della riga = «eXX.ondataN.i» dei dati; nello schieramento, nella prima
//    chiamata e nella chiusura di ogni ondata: tocco → riga aperta sotto il titolo; area sovrapposta alla mappa e ai
//    comandi; spostamento della mappa; secondo tocco → chiusa; tocco sul titolo (altrove) → chiusa; zona di tocco del
//    tasto (punti colpiti in una griglia 44×44 attorno al centro); contrasto con la riga aperta;
//  - C19-04/PO-098: contrasto di ogni testo col suo fondo effettivo (come c19-grafica, soglia 4,5:1, 3:1 se ≥ 24 px o
//    ≥ 18,66 px grassetto; https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio), a inizio e a fondo pagina di ogni scena;
//  - PO-085: icone sotto le opzioni ([data-effetto]) contro gli effetti dei dati; segni [data-segno] dopo la risposta
//    contro gli effetti; segno dentro la finestra?;
//  - C18-05: «Rispondi» nel fumetto: area sopra testo-radio/vice/mittente/vignetta; dopo il tocco prima opzione intera;
//  - C17-05: stati dei settori nel rapporto; C18-09: «Fiducia ±N» coperta da elementi fissi?; C17-22 e C18-08 nel
//    verbale: testi coperti da elementi fissi, sfida sulla riga delle stelle, nomi dei club nascosti e sovrapposizione
//    con la vignetta; C18-07: aiuto «?» dentro la finestra e non sotto la barra fissa;
//  - errori di console.
// C17-12 (nome dell'episodio nella città) è misurato a parte: c20-citta.mjs.
// Foto della finestra in <cartella>: <w>-<ep>-<vinto|perso|mercato>-<scena>.jpg (solo scene scelte).
// Uso: node coordination/sonde/c20-grafica.mjs <radice con dist/> <cartella foto>   (filtri: EP=e06 LARG=360,412)
// Braccio rosso: ROSSO=C43I01,C40C01,C39I01,C39E01,C42R01,C42F01,C42V01,C42A01,C42S01,C42C01 (interruttori accesi prima del caricamento).
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c20';
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
const piano = (m, strategia, forza = {}) => { const g = B[strategia](creaCaso(1), dich); let s = M.iniziaMissione(m, v0, dich); const ond = [];
  while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = []; for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) {
    let o = g.scegli(m, s, c); if (forza[c.id] && M.opzioniValide(c, s, m).some((x) => x.id === forza[c.id])) o = forza[c.id]; rs.push([c.id, o]); s = M.rispondi(m, s, c.id, o, dich); } ond.push({ d, rs }); s = M.chiudiOndata(m, s, dich); }
  return { ond, esito: M.concludiMissione(m, s, dich).esito }; };
const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x).sort((a, c) => a.episodio - c.episodio);
const salvataggio = (prima) => ({ save_version: 2, game_version: GAME_VERSION, seme: 1, caso: 1, variabili: v0, missioni_concluse: prima.map((m) => m.id),
  episodi: Object.fromEntries(prima.map((m) => [m.id, { migliore: { esito: m.esiti[0].id, fallita: false, stelle: 1 }, tentativi: 1, variabili_prima: v0, variabili_dopo: v0 }])), genere: 'f', rapporto_aperto: null, in_corso: null });
// attese dai dati (indipendenti dalla resa)
const rigaI = (m, n) => { const o = m.ondate[n - 1]; return dati[`testi/it/${m.id}.json`][`${(o.titolo ?? `testi:${m.id}.ondata${o.n}`).replace(/^testi:/, '')}.i`] ?? null; };
const chiamata = (m, id) => m.ondate.flatMap((o) => o.chiamate ?? []).find((c) => c.id === id);
const attesaVoci = (c, o) => { const k = new Set(); for (const e of o.effetti) { if (!e.valore) continue; if ('tensione' in e) k.add(`settore:${e.tensione}`); else if ('pressione' in e) k.add(`settore:${e.pressione}`); else if (e.aggiungi === 'credito') k.add('fiducia'); else if ('riserva' in e) k.add(`unita:${e.riserva}`); } return [...k].sort(); };
const attesaSegni = (c, o) => o.effetti.filter((e) => e.valore).flatMap((e) => 'tensione' in e ? [`${e.tensione}:tensione:${e.valore > 0 ? 'su' : 'giu'}`] : 'pressione' in e ? [`${e.pressione}:pressione:${e.valore > 0 ? 'su' : 'giu'}`] : 'riserva' in e && c.settore ? [`${c.settore}:squadra:${e.valore < 0 ? 'su' : 'giu'}`] : []).sort();

const misura = (p) => p.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.opacity !== '0'; };
  const ov = (a, c) => Math.max(0, Math.min(a.right, c.right) - Math.max(a.left, c.left)) * Math.max(0, Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top));
  const rgb = (c) => { const m = c.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0, 0]; return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const rapp = (x, y) => { const [a, c] = [lum(x), lum(y)].sort((p, q) => q - p); return (a + 0.05) / (c + 0.05); };
  const pag = rgb(getComputedStyle(document.body).backgroundColor);
  const fondoDi = (el) => { for (let a = el; a && a !== document.documentElement; a = a.parentElement) { const c = rgb(getComputedStyle(a).backgroundColor); if (c.a > 0.5) return [c, a]; } return [pag, document.body]; };
  const bassi = []; let testi = 0;
  for (const el of document.querySelectorAll('main *')) {
    if (el.closest('svg') || !vis(el) || !(el.offsetParent || getComputedStyle(el).position === 'fixed')) continue;
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    testi++; const cs = getComputedStyle(el); const [f] = fondoDi(el); const t = rgb(cs.color);
    const mix = { r: t.r * t.a + f.r * (1 - t.a), g: t.g * t.a + f.g * (1 - t.a), b: t.b * t.a + f.b * (1 - t.a) };
    const px = parseFloat(cs.fontSize), grande = px >= 24 || (px >= 18.66 && Number(cs.fontWeight) >= 700); const r = rapp(mix, f);
    if (r < (grande ? 3 : 4.5)) bassi.push(`«${el.textContent.trim().slice(0, 22)}» ${r.toFixed(2)}:1 (${el.tagName.toLowerCase()}.${[...el.classList].join('.')} ${px}px ${cs.fontWeight} colore ${cs.color} su rgb(${f.r}, ${f.g}, ${f.b}))`);
  }
  const fissi = [...document.querySelectorAll('.scena *')].filter((e) => vis(e) && ['sticky', 'fixed'].includes(getComputedStyle(e).position));
  const foglie = [...document.querySelectorAll('.scena *')].filter((e) => vis(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && !e.closest('.mappa-tela'));
  const coperti = [];
  for (const f of foglie) for (const s of fissi) { if (s.contains(f) || f.contains(s)) continue; const a = ov(f.getBoundingClientRect(), s.getBoundingClientRect()); if (a > 40) coperti.push(`«${f.textContent.trim().slice(0, 18)}» sotto «${s.textContent.trim().slice(0, 14)}» ${Math.round(a)}px²`); }
  const fid = document.querySelector('[data-premio-fiducia]'); const fr = fid?.getBoundingClientRect();
  const stati = [...document.querySelectorAll('[data-stato-settore]')].map((e) => e.dataset.statoSettore);
  const sf = document.querySelector('.stelle-sfida .sfida'); const vig = document.querySelector('[data-vignetta]');
  return { y: Math.round(scrollY), maxY: document.scrollingElement.scrollHeight - innerHeight, testi, bassi: bassi.slice(0, 8), coperti: coperti.slice(0, 6),
    info: !!document.querySelector('[data-azione="info-ondata"]'), fid: fid ? { testo: fid.textContent.trim(), dentro: fr.top >= 0 && fr.bottom <= innerHeight, coperta: fissi.filter((s) => !s.contains(fid)).reduce((t, s) => t + ov(fr, s.getBoundingClientRect()), 0) } : null,
    stati, sfida: sf ? { nomiVisibili: [...sf.querySelectorAll('.sfida-club > span:last-child')].filter(vis).length, sopraVignetta: vig ? Math.round(ov(sf.getBoundingClientRect(), vig.getBoundingClientRect())) : 0, etichette: [...sf.querySelectorAll('[aria-label], title')].map((e) => e.getAttribute('aria-label') ?? e.textContent).join(' | ') } : null };
});
// PO-101: riga «i»
const leggiInfo = (p) => p.evaluate(() => {
  const ov = (a, c) => Math.max(0, Math.min(a.right, c.right) - Math.max(a.left, c.left)) * Math.max(0, Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top));
  const riga = document.querySelector('[data-info-ondata]'); const bt = document.querySelector('[data-azione="info-ondata"]'); const h1 = document.querySelector('.testata-t h1'); const mp = document.querySelector('.mappa');
  if (!riga) return { aperta: false, espanso: bt?.getAttribute('aria-expanded'), mappaTop: mp ? Math.round(mp.getBoundingClientRect().top + scrollY) : null };
  const r = riga.getBoundingClientRect(); const comandi = [...document.querySelectorAll('button, a, .opzione, [role=button], .settore-punto, [data-risorsa]')].filter((e) => e !== bt && !riga.contains(e) && e.getBoundingClientRect().width > 0);
  return { aperta: true, espanso: bt.getAttribute('aria-expanded'), testo: riga.textContent, sottoTitolo: r.top >= h1.getBoundingClientRect().bottom - 1, dentro: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth,
    rett: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}×${Math.round(r.height)}`, sopraMappa: mp ? Math.round(ov(r, mp.getBoundingClientRect())) : null,
    sopraComandi: comandi.map((e) => [e, ov(r, e.getBoundingClientRect())]).filter(([, a]) => a > 0).map(([e, a]) => `${(e.textContent || e.getAttribute('aria-label') || e.className).trim().slice(0, 16)} ${Math.round(a)}px²`),
    inCima: document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) && riga.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)),
    mappaTop: mp ? Math.round(mp.getBoundingClientRect().top + scrollY) : null };
});
const zonaTocco = (p) => p.evaluate(() => { const bt = document.querySelector('[data-azione="info-ondata"]'); const r = bt.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2; let si = 0, tot = 0;
  for (let dx = -21; dx <= 21; dx += 6) for (let dy = -21; dy <= 21; dy += 6) { tot++; const e = document.elementFromPoint(cx + dx, cy + dy); if (e && bt.contains(e)) si++; }
  return { tasto: `${Math.round(r.width)}×${Math.round(r.height)}`, colpiti: `${si}/${tot}` }; });
const RIS = []; const errori = []; const INFO = []; const PROVE = []; const VOCI = []; const SEGNI = []; const RISP = []; const AIUTO = [];
const foto = (p, nome) => p.screenshot({ path: `${DIR}/${nome}.jpg`, type: 'jpeg', quality: 70 });
async function scena(p, tag, nome, fai = false) {
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(150); const a = await misura(p); if (fai) await foto(p, `${tag}-${nome}`);
  await p.evaluate(() => scrollTo(0, document.scrollingElement.scrollHeight)); await p.waitForTimeout(250); const z = await misura(p); if (fai && z.y > 0) await foto(p, `${tag}-${nome}-fondo`);
  RIS.push({ tag, nome, a, z }); await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(100); return a;
}
async function provaInfo(p, tag, nome, atteso, fai) {
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(100);
  const bt = p.locator('[data-azione="info-ondata"]'); if (!(await bt.count())) { PROVE.push({ tag, nome, manca: true }); return; }
  const prima = await leggiInfo(p); const zona = await zonaTocco(p);
  await bt.tap(); await p.waitForTimeout(150); const aperta = await leggiInfo(p); const m = await misura(p); if (fai) await foto(p, `${tag}-${nome}-i`);
  await bt.tap(); await p.waitForTimeout(150); const chiusa2 = await leggiInfo(p);
  await bt.tap(); await p.waitForTimeout(150); await p.locator('.testata-t h1').tap(); await p.waitForTimeout(150); const chiusaFuori = await leggiInfo(p);
  PROVE.push({ tag, nome, atteso, prima, aperta, chiusa2, chiusaFuori, zona, bassi: m.bassi });
}
async function schiera(p, d) { for (const [r, ps] of Object.entries(d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) {
  if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`); } }
const GIOCHI = [['e01', 'attenta', {}], ['e01', 'peggiore', {}], ['e06', 'attenta', {}], ['e06', 'peggiore', {}], ['e04', 'attenta', { arance: 'chiudi_mercato' }]];
const EP = (process.env.EP ?? 'e01,e06,e04').split(','); const LARG = (process.env.LARG ?? '360,375,412').split(',').map(Number);
for (const [ep, strategia, forza] of GIOCHI.filter(([e]) => EP.includes(e))) for (const [w, h] of [[360, 760], [375, 667], [412, 915]].filter(([x]) => LARG.includes(x))) {
  const m = dati[`missioni/${ep}.json`]; const pl = piano(m, strategia, forza); const esito = Object.keys(forza).length ? 'mercato' : pl.esito.fallita ? 'perso' : 'vinto'; const tag = `${w}-${ep}-${esito}`;
  const F = strategia === 'attenta';
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: true, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  p.on('console', (x) => { if (x.type() === 'error') errori.push(`${tag}: ${x.text().slice(0, 140)}`); }); p.on('pageerror', (e) => errori.push(`${tag}: ${e.message.slice(0, 140)}`));
  if (process.env.ROSSO) await p.addInitScript((xs) => { for (const x of xs) window[`__NO_${x}`] = true; }, process.env.ROSSO.split(','));
  await p.goto(URL); await p.evaluate((s) => { localStorage.clear(); localStorage.setItem('valmora-guida-vista', 'si'); localStorage.setItem('valmora-salvataggio', s); }, JSON.stringify(salvataggio(missioni.filter((x) => x.episodio < m.episodio))));
  await p.reload(); await sc(p, 'titolo'); await scena(p, tag, 'titolo');
  await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta'); await p.waitForTimeout(400);
  const st = p.locator(`[data-stagione="${m.stagione}"]`); if (await st.count()) await st.click();
  await p.locator(`[data-episodio="${m.id}"] .settore-punto`).click(); await p.waitForTimeout(200); await scena(p, tag, 'citta');
  await p.click('[data-azione="avvia-episodio"]'); await sc(p, 'sala'); await p.waitForTimeout(400);
  let k = 0; while (await p.locator('[data-azione="passo"]').count()) { await scena(p, tag, `sala-${++k}`); await p.click('[data-azione="passo"]'); await p.waitForTimeout(120); } await scena(p, tag, `sala-${++k}`);
  await p.click('[data-azione="avanti"]'); await sc(p, 'briefing');
  k = 0; while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) { await scena(p, tag, `briefing-${++k}`); await p.click('[data-azione="prossimo"], [data-azione="passo"]'); await p.waitForTimeout(120); }
  await scena(p, tag, `briefing-${++k}`); await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento');
  for (const [i, o] of pl.ond.entries()) {
    const n = i + 1; const atteso = rigaI(m, n);
    if (i) await sc(p, 'schieramento');
    if (i === 0) { // C18-07: «?»
      await p.click('[data-azione="aiuto"]'); await p.waitForTimeout(400);
      AIUTO.push({ tag, ...(await p.evaluate(() => { const a = document.querySelector('[data-aiuto]').getBoundingClientRect(); const ov = (x, c) => Math.max(0, Math.min(x.right, c.right) - Math.max(x.left, c.left)) * Math.max(0, Math.min(x.bottom, c.bottom) - Math.max(x.top, c.top));
        const fissi = [...document.querySelectorAll('.scena *')].filter((e) => ['sticky', 'fixed'].includes(getComputedStyle(e).position) && e.getBoundingClientRect().height > 0 && !e.closest('[data-aiuto]'));
        return { dentro: a.top >= 0 && a.bottom <= innerHeight, top: Math.round(a.top), bottom: Math.round(a.bottom), h: innerHeight, coperto: Math.round(fissi.reduce((t, e) => t + ov(a, e.getBoundingClientRect()), 0)) }; })) });
      if (w === 375 && F) await foto(p, `${tag}-schieramento-aiuto`);
      await p.click('[data-azione="aiuto"]'); await p.waitForTimeout(150);
    }
    INFO.push({ tag, scena: `schieramento-${n}`, ...(await misura(p).then((x) => ({ info: x.info }))), atteso });
    await provaInfo(p, tag, `schieramento-${n}`, atteso, F && (n === 1 || (ep === 'e04' && n === 2)));
    await schiera(p, o.d); await scena(p, tag, `schieramento-${n}`);
    await p.click('[data-azione="conferma"]'); if (await p.locator('[data-azione="conferma-davvero"]').count()) await p.click('[data-azione="conferma-davvero"]');
    for (const [j, [cid, op]] of o.rs.entries()) {
      await sc(p, 'chiamata'); await p.waitForTimeout(250); const a = await scena(p, tag, `chiamata-${cid}`, F && i === 0 && j === 0);
      INFO.push({ tag, scena: `chiamata-${cid}`, info: a.info, atteso });
      if (j === 0) await provaInfo(p, tag, `chiamata-${n}`, atteso, F && ((n === 1 && ep !== 'e04') || (ep === 'e04' && n === 2)));
      // PO-085: icone sotto le opzioni
      const c = chiamata(m, cid);
      const dom = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-opzione]')].map((e) => [e.dataset.opzione, [...e.querySelectorAll('[data-effetto]')].map((x) => x.dataset.effetto).sort()])));
      for (const [oid, voci] of Object.entries(dom)) { const ox = c.opzioni.find((x) => x.id === oid); VOCI.push({ tag, cid, oid, ok: JSON.stringify(voci) === JSON.stringify(attesaVoci(c, ox)), voci, att: attesaVoci(c, ox) }); }
      // C18-05: «Rispondi»
      await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(100);
      const ind = await p.locator('[data-indicatore="opzioni"]').count(); const r = { tag, cid, ind };
      if (ind) {
        r.copre = await p.evaluate(() => { const i = document.querySelector('[data-indicatore="opzioni"]').getBoundingClientRect(); const ov = (a, c) => Math.max(0, Math.min(a.right, c.right) - Math.max(a.left, c.left)) * Math.max(0, Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top));
          return [...document.querySelectorAll('.testo-radio, .vice-a-margine, .mittente, .vignetta')].map((e) => [e.className.baseVal ?? e.className, ov(i, e.getBoundingClientRect())]).filter(([, a]) => a > 0).map(([c, a]) => `${String(c).split(' ')[0]} ${Math.round(a)}px²`).join(', '); });
        await p.click('[data-indicatore="opzioni"]'); await p.waitForTimeout(900);
        r.dopo = await p.evaluate(() => { const o = document.querySelector('.opzione').getBoundingClientRect(); const ov = (a, c) => Math.max(0, Math.min(a.right, c.right) - Math.max(a.left, c.left)) * Math.max(0, Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top));
          const st = [...document.querySelectorAll('.scena *')].filter((e) => ['sticky', 'fixed'].includes(getComputedStyle(e).position) && e.getBoundingClientRect().height > 0 && !e.contains(document.querySelector('.opzione')));
          return { intera: o.top >= 0 && o.bottom <= innerHeight, coperta: st.reduce((t, e) => t + ov(o, e.getBoundingClientRect()), 0) }; });
      }
      RISP.push(r);
      await p.locator(`[data-opzione="${op}"]`).scrollIntoViewIfNeeded(); await p.click(`[data-opzione="${op}"]`); await p.waitForTimeout(150);
      const seg = await p.evaluate(() => [...document.querySelectorAll('[data-segno]')].map((e) => { const r = e.getBoundingClientRect(); return { s: e.dataset.segno, dentro: r.top >= 0 && r.bottom <= innerHeight && r.width > 0, testo: e.textContent }; }));
      const ox = c.opzioni.find((x) => x.id === op); const att = attesaSegni(c, ox);
      SEGNI.push({ tag, cid, op, ok: JSON.stringify(seg.map((x) => x.s).sort()) === JSON.stringify(att), att, seg, fuori: seg.filter((x) => !x.dentro).length });
      if (F && i === 0 && j === 0 && seg.length) await foto(p, `${tag}-segni-${cid}`);
      await p.waitForTimeout(150);
      if (await p.locator('[data-azione="continua"]').count()) { const x = await scena(p, tag, `risposta-${cid}`); INFO.push({ tag, scena: `risposta-${cid}`, info: x.info, atteso }); await p.click('[data-azione="continua"]'); }
    }
    await sc(p, 'chiusura'); const x = await scena(p, tag, `chiusura-${n}`); INFO.push({ tag, scena: `chiusura-${n}`, info: x.info, atteso });
    if (n === 1) await provaInfo(p, tag, `chiusura-${n}`, atteso, false);
    await p.click('[data-azione="rapporto"]'); await sc(p, 'rapporto'); await p.waitForTimeout(250);
    const rp = await scena(p, tag, `rapporto-${n}`, F && (i === pl.ond.length - 1 || i === 0)); INFO.push({ tag, scena: `rapporto-${n}`, info: rp.info, atteso: null, rapporto: true });
    await p.click('[data-azione="avanti"]');
  }
  await sc(p, 'verbale'); await p.waitForTimeout(400);
  k = 0; while (await p.locator('[data-azione="passo"]').count()) { await scena(p, tag, `verbale-${++k}`, w === 375 && ep !== 'e04'); await p.click('[data-azione="passo"]'); await p.waitForTimeout(150); } await scena(p, tag, `verbale-${++k}`, ep !== 'e04');
  await p.close();
}
// ---- riepilogo
const tutte = RIS.flatMap((r) => [['inizio', r, r.a], ['fondo', r, r.z]]);
console.log(`SCHERMATE ${RIS.length} (misure ${tutte.length}), testi misurati ${tutte.reduce((t, [, , x]) => t + x.testi, 0)}`);
const inOndata = INFO.filter((x) => !x.rapporto);
console.log(`PO-101 «i»: scene dell'ondata ${inOndata.length}, con l'icona ${inOndata.filter((x) => x.info).length}; rapporti ${INFO.filter((x) => x.rapporto).length}, con l'icona ${INFO.filter((x) => x.rapporto && x.info).length}`);
for (const x of inOndata.filter((x) => !x.info).slice(0, 10)) console.log(`  senza «i»: ${x.tag} ${x.scena}`);
const pr = PROVE.filter((x) => !x.manca);
console.log(`PO-101 prove al tocco: ${PROVE.length} (icona mancante ${PROVE.length - pr.length}); si apre ${pr.filter((x) => x.aperta.aperta).length}; testo = dati ${pr.filter((x) => x.aperta.testo === x.atteso).length}; sotto il titolo ${pr.filter((x) => x.aperta.sottoTitolo).length}; dentro la finestra ${pr.filter((x) => x.aperta.dentro).length}; in cima (non coperta) ${pr.filter((x) => x.aperta.inCima).length}; aria-expanded true ${pr.filter((x) => x.aperta.espanso === 'true').length}`);
console.log(`  sopra la mappa (px²) max ${Math.max(...pr.map((x) => x.aperta.sopraMappa ?? 0))}; sopra comandi ${pr.filter((x) => x.aperta.sopraComandi?.length).length}; chiusa al secondo tocco ${pr.filter((x) => !x.chiusa2.aperta).length}; chiusa toccando il titolo ${pr.filter((x) => !x.chiusaFuori.aperta).length}`);
for (const w of [360, 375, 412]) { const x = pr.filter((y) => y.tag.startsWith(`${w}-`)); const sp = x.map((y) => (y.aperta.mappaTop ?? 0) - (y.prima.mappaTop ?? 0)); console.log(`  ${w}: prove ${x.length}; mappa spostata in giù di ${Math.min(...sp)}–${Math.max(...sp)} px con la riga aperta; tasto ${[...new Set(x.map((y) => y.zona.tasto))].join(',')}; punti colpiti nella griglia 8×8 su 42 px ${[...new Set(x.map((y) => y.zona.colpiti))].join(',')}; testi sotto soglia con la riga aperta ${x.filter((y) => y.bassi.length).length}`); }
for (const x of pr.filter((x) => !x.aperta.aperta || x.aperta.testo !== x.atteso || !x.aperta.sottoTitolo || x.aperta.sopraComandi?.length || x.chiusa2.aperta || x.chiusaFuori.aperta || x.bassi.length).slice(0, 12)) console.log(`  !! ${x.tag} ${x.nome}: ${JSON.stringify({ a: x.aperta, c2: x.chiusa2.aperta, cf: x.chiusaFuori.aperta, bassi: x.bassi })}`);
const bassi = tutte.filter(([, , x]) => x.bassi.length); console.log(`C19-04/PO-098 testi sotto soglia: ${bassi.length} misure su ${tutte.length}`); const visti = new Set();
for (const [q, r, x] of bassi) for (const s of x.bassi) { const k = s.replace(/«[^»]*»/, ''); if (!visti.has(k)) { visti.add(k); console.log(`  ${r.tag} ${r.nome} ${q}: ${s} (in ${tutte.filter(([, , y]) => y.bassi.some((z) => z.replace(/«[^»]*»/, '') === k)).length} misure)`); } }
console.log(`PO-085 icone: opzioni mostrate ${VOCI.length}, uguali agli effetti dei dati ${VOCI.filter((x) => x.ok).length}, con almeno un'icona ${VOCI.filter((x) => x.voci.length).length}`); for (const x of VOCI.filter((x) => !x.ok).slice(0, 6)) console.log(`  !! ${JSON.stringify(x)}`);
console.log(`PO-085 segni: risposte ${SEGNI.length}, segni uguali agli effetti ${SEGNI.filter((x) => x.ok).length}, risposte con segni ${SEGNI.filter((x) => x.seg.length).length}, segni ${SEGNI.reduce((t, x) => t + x.seg.length, 0)}, segni fuori dalla finestra ${SEGNI.reduce((t, x) => t + x.fuori, 0)}`);
for (const w of [360, 375, 412]) { const x = SEGNI.filter((y) => y.tag.startsWith(`${w}-`)); console.log(`  ${w}: segni ${x.reduce((t, y) => t + y.seg.length, 0)}, fuori dalla finestra ${x.reduce((t, y) => t + y.fuori, 0)}`); }
for (const x of SEGNI.filter((x) => !x.ok).slice(0, 6)) console.log(`  !! ${JSON.stringify(x)}`);
const ind = RISP.filter((r) => r.ind);
console.log(`C18-05: chiamate ${RISP.length}; con «Rispondi» ${ind.length}; «Rispondi» sopra testo ${ind.filter((r) => r.copre).length}; dopo il tocco prima opzione intera ${ind.filter((r) => r.dopo.intera).length}, coperta ${ind.filter((r) => r.dopo.coperta > 0).length}`);
for (const w of [360, 375, 412]) { const x = RISP.filter((r) => r.tag.startsWith(`${w}-`)); console.log(`  ${w}: chiamate ${x.length}, «Rispondi» ${x.filter((r) => r.ind).length}, sopra testo ${x.filter((r) => r.copre).length}`); }
for (const r of ind.filter((r) => r.copre || !r.dopo.intera).slice(0, 6)) console.log(`  !! ${JSON.stringify(r)}`);
const rap = RIS.filter((r) => r.nome.startsWith('rapporto')); const caldi = rap.reduce((t, r) => t + r.a.stati.filter((s) => s === 'caldo').length, 0);
console.log(`C17-05: rapporti ${rap.length}; settori «caldo» ${caldi}; «scoperto» ${rap.reduce((t, r) => t + r.a.stati.filter((s) => s === 'scoperto').length, 0)}; «controllo» ${rap.reduce((t, r) => t + r.a.stati.filter((s) => s === 'controllo').length, 0)}`);
const fr = rap.filter((r) => r.a.fid); console.log(`C18-09: rapporti con «Fiducia ±N» ${fr.length}; coperta da elementi fissi a inizio pagina ${fr.filter((r) => r.a.fid.coperta > 0).length}, a fondo ${fr.filter((r) => r.z.fid?.coperta > 0).length}; dentro la finestra senza scorrere ${fr.filter((r) => r.a.fid.dentro).length}`);
for (const w of [360, 375, 412]) { const x = fr.filter((r) => r.tag.startsWith(`${w}-`)); console.log(`  ${w}: ${x.length} rapporti con la riga, coperta ${x.filter((r) => r.a.fid.coperta > 0 || r.z.fid?.coperta > 0).length}, dentro senza scorrere ${x.filter((r) => r.a.fid.dentro).length}`); }
const ver = RIS.filter((r) => r.nome.startsWith('verbale')); console.log(`C17-22: schermate del verbale ${ver.length}; con testi coperti da elementi fissi (inizio o fondo) ${ver.filter((r) => r.a.coperti.length || r.z.coperti.length).length}`);
for (const r of ver.filter((r) => r.a.coperti.length || r.z.coperti.length).slice(0, 6)) console.log(`  !! ${r.tag} ${r.nome}: ${[...r.a.coperti, ...r.z.coperti].join('; ')}`);
const tutteCop = RIS.filter((r) => r.a.coperti.length || r.z.coperti.length); console.log(`testi coperti da elementi fissi, tutte le schermate: ${tutteCop.length} su ${RIS.length}`); for (const r of tutteCop.slice(0, 8)) console.log(`  ${r.tag} ${r.nome}: ${[...r.a.coperti, ...r.z.coperti].slice(0, 2).join('; ')}`);
const sf = ver.filter((r) => r.a.sfida || r.z.sfida); console.log(`C18-08: schermate del verbale con la sfida sulla riga delle stelle ${sf.length}; nomi dei club visibili ${sf.filter((r) => (r.a.sfida ?? r.z.sfida).nomiVisibili).length}; sopra la vignetta ${sf.filter((r) => (r.a.sfida ?? r.z.sfida).sopraVignetta > 0).length}; etichette: ${[...new Set(sf.map((r) => (r.a.sfida ?? r.z.sfida).etichette))].join(' / ')}`);
console.log(`C18-07: aiuto «?» ${AIUTO.length}; dentro la finestra ${AIUTO.filter((x) => x.dentro).length}; coperto da elementi fissi ${AIUTO.filter((x) => x.coperto > 0).length}`); for (const x of AIUTO) console.log(`  ${x.tag}: ${JSON.stringify(x)}`);
console.log(`errori di console: ${errori.length}`); for (const e of errori.slice(0, 20)) console.log('  ' + e);
await b.close(); srv.close();
