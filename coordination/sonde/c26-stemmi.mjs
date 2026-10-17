// C-026 (sola lettura): i 16 stemmi alla misura del gioco (--avatar, 42 px; nel verbale --icona) disegnati da
// src/resa/stemma.tsx col CSS del gioco, a DPR 1 e 3. Per ogni stemma, dai PIXEL della foto: colore della forma e del
// simbolo (classificazione di ogni pixel sul colore più vicino fra primario, secondario, contorno del simbolo, nero,
// fondo), contrasto simbolo/forma, quota del simbolo nella forma, riquadro del simbolo in px. Per le coppie di club che
// si incontrano in una sfida (curve degli episodi) e per le rivalità della BIBBIA: ΔE2000 fra i primari, anche con
// deuteranopia e protanopia simulate (Machado 2009, gravità 1).
// Uso: node coordination/sonde/c26-stemmi.mjs <cartella foto> <uscita.json>
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { createServer } from 'vite';
import { chromium } from 'playwright-core';

const DIR = process.argv[2] ?? 'docs/foto/c26'; const OUT = process.argv[3] ?? 'c26-stemmi.json'; mkdirSync(DIR, { recursive: true });
const club = readdirSync('data/club').map((f) => JSON.parse(readFileSync(`data/club/${f}`, 'utf8')));
const nomi = Object.assign({}, ...['comune', 'bozze_s1', 'bozze_s2', 'bozze_s3'].map((f) => JSON.parse(readFileSync(`data/testi/it/${f}.json`, 'utf8'))));
const v = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
const { Stemma } = await v.ssrLoadModule('/src/resa/stemma.tsx');
const { renderToStaticMarkup } = await import('react-dom/server'); const { createElement } = await import('react');
const css = ['token.css', 'stile.css', 'stile-c18.css'].map((f) => readFileSync(`src/resa/${f}`, 'utf8')).join('\n');
const celle = club.map((c) => `<figure data-club="${c.id}">${renderToStaticMarkup(createElement(Stemma, { c }))}<figcaption>${nomi[`club.${c.id}`]}</figcaption></figure>`).join('');
await v.close();
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = (v) => v.map((u) => { u /= 255; return u <= 0.03928 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4; }).reduce((s, u, i) => s + u * [0.2126, 0.7152, 0.0722][i], 0);
const rap = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const d2 = (a, b) => a.reduce((s, x, i) => s + (x - b[i]) ** 2, 0);
const ris = {};
for (const [dpr, lato] of [[1, 'avatar'], [3, 'avatar'], [1, 'icona']]) {
  const p = await b.newPage({ viewport: { width: 412, height: 400 }, deviceScaleFactor: dpr });
  await p.setContent(`<html><head><style>${css} body{margin:0;padding:8px;background:var(--bianco)} .g{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
    figure{margin:0;display:grid;justify-items:center;gap:2px;font:600 10px sans-serif} ${lato === 'icona' ? '.stemma{width:var(--icona);height:var(--icona)}' : ''}</style></head><body><div class="g">${celle}</div></body></html>`);
  await p.screenshot({ path: `${DIR}/stemmi-${lato}-dpr${dpr}.png`, fullPage: true });
  const geo = await p.evaluate(() => [...document.querySelectorAll('figure[data-club]')].map((f) => { const s = f.querySelector('svg.stemma'); const r = s.getBoundingClientRect(); const g = s.querySelector('[data-simbolo]').getBoundingClientRect(); const al = getComputedStyle(document.documentElement).getPropertyValue('--nero');
    return { id: f.dataset.club, x: r.left, y: r.top, w: r.width, h: r.height, sim: { w: +g.width.toFixed(1), h: +g.height.toFixed(1) }, alone: s.querySelector('[data-alone-stemma]')?.dataset.aloneStemma ?? null, fondo: getComputedStyle(document.body).backgroundColor }; }));
  const png = await p.screenshot({ type: 'png' });
  const px = await p.evaluate(async (b64) => { const im = new Image(); await new Promise((ok) => { im.onload = ok; im.src = `data:image/png;base64,${b64}`; }); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); return { w: im.width, d: [...x.getImageData(0, 0, im.width, im.height).data] }; }, png.toString('base64'));
  for (const g of geo) {
    const c = club.find((x) => x.id === g.id); const P = hex(c.colori.primario), S = hex(c.colori.secondario), N = [17, 17, 17], Bi = [255, 255, 255];
    const cand = { forma: P, simbolo: S, nero: N, bianco: Bi }; const conta = { forma: 0, simbolo: 0, nero: 0, bianco: 0 };
    for (let y = Math.round(g.y * dpr); y < Math.round((g.y + g.h) * dpr); y++) for (let x = Math.round(g.x * dpr); x < Math.round((g.x + g.w) * dpr); x++) {
      const i = (y * px.w + x) * 4; const q = [px.d[i], px.d[i + 1], px.d[i + 2]];
      const k = Object.entries(cand).sort((a, b2) => d2(q, a[1]) - d2(q, b2[1]))[0][0]; conta[k]++; }
    (ris[g.id] ??= { nome: nomi[`club.${g.id}`], primario: c.colori.primario, secondario: c.colori.secondario, forma: c.stemma.forma, simbolo: c.stemma.simbolo, contornoSimbolo: g.alone, misure: {} });
    ris[g.id].misure[`${lato}@${dpr}`] = { stemmaPx: `${g.w.toFixed(0)}×${g.h.toFixed(0)}`, simboloPx: `${g.sim.w}×${g.sim.h}`, pixel: conta, quotaSimbolo: +(conta.simbolo / (conta.simbolo + conta.forma)).toFixed(3) };
    ris[g.id].contrasto = +rap(P, S).toFixed(2); ris[g.id].formaSuFondo = +rap(P, Bi).toFixed(2);
  }
  await p.close();
}
await b.close();
// ΔE2000 (Sharma, Wu, Dalal 2005) e simulazione di daltonismo (Machado, Oliveira, Fernandes 2009, gravità 1.0)
const lin = (u) => { u /= 255; return u <= 0.04045 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4; }; const gam = (u) => 255 * Math.min(1, Math.max(0, u <= 0.0031308 ? 12.92 * u : 1.055 * u ** (1 / 2.4) - 0.055));
const lab = (rgb) => { const [r, g, b2] = rgb.map(lin); const X = (0.4124 * r + 0.3576 * g + 0.1805 * b2) / 0.95047, Y = 0.2126 * r + 0.7152 * g + 0.0722 * b2, Z = (0.0193 * r + 0.1192 * g + 0.9505 * b2) / 1.08883; const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116); return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))]; };
function de2000([L1, a1, b1], [L2, a2, b2]) { const r = Math.PI / 180; const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cm = (C1 + C2) / 2; const G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7))); const a1p = (1 + G) * a1, a2p = (1 + G) * a2; const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2); const h = (b, a) => { const x = Math.atan2(b, a) / r; return x < 0 ? x + 360 : x; }; const h1 = h(b1, a1p), h2 = h(b2, a2p);
  const dL = L2 - L1, dC = C2p - C1p; let dh = h2 - h1; if (C1p * C2p === 0) dh = 0; else if (dh > 180) dh -= 360; else if (dh < -180) dh += 360; const dH = 2 * Math.sqrt(C1p * C2p) * Math.sin((dh * r) / 2);
  const Lm = (L1 + L2) / 2, Cpm = (C1p + C2p) / 2; let hm = h1 + h2; if (C1p * C2p !== 0) { if (Math.abs(h1 - h2) > 180) hm += h1 + h2 < 360 ? 360 : -360; hm /= 2; }
  const T = 1 - 0.17 * Math.cos((hm - 30) * r) + 0.24 * Math.cos(2 * hm * r) + 0.32 * Math.cos((3 * hm + 6) * r) - 0.2 * Math.cos((4 * hm - 63) * r); const dT = 30 * Math.exp(-(((hm - 275) / 25) ** 2)); const RC = 2 * Math.sqrt(Cpm ** 7 / (Cpm ** 7 + 25 ** 7));
  const SL = 1 + (0.015 * (Lm - 50) ** 2) / Math.sqrt(20 + (Lm - 50) ** 2), SC = 1 + 0.045 * Cpm, SH = 1 + 0.015 * Cpm * T, RT = -Math.sin(2 * dT * r) * RC;
  return Math.sqrt((dL / SL) ** 2 + (dC / SC) ** 2 + (dH / SH) ** 2 + RT * (dC / SC) * (dH / SH)); }
const MAT = { deuter: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]], protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]] };
const sim = (rgb, M) => { const l = rgb.map(lin); return M.map((riga) => gam(riga.reduce((s, k, i) => s + k * l[i], 0))); };
const coppie = new Map();
for (const f of readdirSync('data/missioni').filter((x) => /^e\d\d\.json$/.test(x)).sort()) { const m = JSON.parse(readFileSync(`data/missioni/${f}`, 'utf8')); const ids = [...new Set(m.mappa.settori.filter((s) => s.tipo === 'curva').map((s) => s.club).filter(Boolean))];
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) { const k = [ids[i], ids[j]].sort().join('|'); (coppie.get(k) ?? coppie.set(k, []).get(k)).push(m.id); } }
for (const [a, c] of [['cinderwick_united', 'pinegrove_rangers'], ['belltower_harriers', 'tramway_borough'], ['waterline_city', 'lookout_fc'], ['larkspire_athletic', 'domepark_villa']]) { const k = [a, c].sort().join('|'); if (!coppie.has(k)) coppie.set(k, ['rivalità BIBBIA']); }
const tutte = [];
for (let i = 0; i < club.length; i++) for (let j = i + 1; j < club.length; j++) { const A = hex(club[i].colori.primario), B = hex(club[j].colori.primario); const k = [club[i].id, club[j].id].sort().join('|');
  tutte.push({ k, dove: coppie.get(k) ?? null, de: +de2000(lab(A), lab(B)).toFixed(1), deuter: +de2000(lab(sim(A, MAT.deuter)), lab(sim(B, MAT.deuter))).toFixed(1), protan: +de2000(lab(sim(A, MAT.protan)), lab(sim(B, MAT.protan))).toFixed(1) }); }
tutte.sort((x, y) => Math.min(x.de, x.deuter, x.protan) - Math.min(y.de, y.deuter, y.protan));
writeFileSync(OUT, JSON.stringify({ ris, coppie: tutte }, null, 1));
for (const [id, r] of Object.entries(ris)) console.log(`${r.nome.padEnd(20)} ${r.forma}/${r.simbolo.padEnd(14)} contrasto ${String(r.contrasto).padEnd(5)} contorno ${r.contornoSimbolo ?? '-'} forma/bianco ${r.formaSuFondo} | ${Object.entries(r.misure).map(([k, m]) => `${k}: simbolo ${m.simboloPx} quota ${m.quotaSimbolo}`).join(' | ')}`);
console.log('coppie che si incontrano (o rivali), ΔE2000 normale/deuteranopia/protanopia:');
for (const c of tutte.filter((x) => x.dove)) console.log(`  ${c.k.padEnd(42)} ${String(c.de).padEnd(5)} ${String(c.deuter).padEnd(5)} ${String(c.protan).padEnd(5)} ${c.dove.join(',')}`);
console.log('le 8 coppie più vicine fra tutti i 16:'); for (const c of tutte.slice(0, 8)) console.log(`  ${c.k.padEnd(42)} ${c.de} ${c.deuter} ${c.protan}`);
