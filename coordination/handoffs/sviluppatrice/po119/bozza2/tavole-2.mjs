// Tavole PO-119: prima (vignette di oggi, SSR del repository) e dopo (bozza persona.mjs), uomo e donna, 7 toni.
import { readFileSync, mkdirSync } from 'node:fs';
const R = process.cwd(), DIR = process.argv[2]; mkdirSync(DIR, { recursive: true });
const { persona } = await import(`${process.argv[3]}/persona2.mjs`);
const { createServer } = await import(`${R}/node_modules/vite/dist/node/index.js`);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const v = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
const { VignettaOndata, VignettaEsito } = await v.ssrLoadModule('/src/resa/vignette-gioco.tsx');
const E = await v.ssrLoadModule('/src/resa/espressioni.ts');
const { renderToStaticMarkup } = await import(`${R}/node_modules/react-dom/server.node.js`); const { createElement } = await import(`${R}/node_modules/react/index.js`);
const m = JSON.parse(readFileSync('data/missioni/e01.json', 'utf8'));
const cornice = (corpo, titolo) => `<svg class="vignetta" viewBox="0 0 320 180" role="img" aria-label="${titolo}"><rect x="0" y="0" width="320" height="180" class="v-giallo"/>${corpo}<rect x="1.5" y="1.5" width="317" height="177" class="v-cornice"/></svg>`;
const sfondoOndata = (t) => `<rect x="0" y="118" width="320" height="62" class="v-ombra"/><rect x="18" y="22" width="92" height="56" class="v-nero v-tratto"/><rect x="24" y="28" width="80" height="44" class="v-ciano"/>${t !== 'calmo' ? `<path d="${t === 'critico' ? 'M30 64 L48 40 L62 56 L80 32 L98 46' : 'M30 60 L50 52 L66 56 L84 46 L98 50'}" class="v-linea"/>` : ''}`;
const sfondoEsito = (t) => `<path d="M0 132 L40 104 L70 116 L110 96 L160 112 L210 94 L260 110 L320 98 V180 H0 Z" class="v-ombra"/>${t === 'bene' ? Array.from({ length: 22 }, (_, i) => `<rect x="${(i * 41) % 310 + 4}" y="${(i * 23) % 70 + 6}" width="5" height="9" transform="rotate(${(i * 47) % 180} ${(i * 41) % 310 + 6} ${(i * 23) % 70 + 10})" class="${['v-magenta', 'v-ciano', 'v-bianco'][i % 3]} v-tratto"/>`).join('') : ''}${t === 'fallita' ? '<path d="M40 30 Q60 10 80 30 Q100 10 120 30 Q140 50 100 50 L50 50 Q20 50 40 30 Z" class="v-nuvola v-tratto"/>' : ''}`;
const capelli = (g) => (g === 'f' ? 'lunghi' : 'corti');
// inquadratura più stretta: figure più grandi, busto tagliato dalla cornice; il vice a braccia conserte quando è tranquillo
const tu = (g, e) => ({ scala: 1.15, giacca: 'v-ciano', capelli: capelli(g), distintivo: true, ...e.tu });
const vi = (e, quieto) => ({ s: 0.95, scala: 1.15, giacca: 'v-giacca-scura', capelli: 'berretto', baffi: true, giro: -3, ...e.vice, ...(quieto && !e.vice.braccia ? { braccia: 'conserte' } : {}) });
const dopo = (g) => [
  ...['calmo', 'teso', 'critico'].map((t) => { const e = E.espressioneOndata(t); return cornice(sfondoOndata(t) + persona({ x: 116, y: 72, ...tu(g, e) }) + persona({ x: 236, y: 78, ...vi(e, t !== 'critico') }), t); }),
  ...['bene', 'medio', 'male', 'fallita'].map((t) => { const e = E.espressioneEsito(t); return cornice(sfondoEsito(t) + persona({ x: 104, y: 72, ...tu(g, e) }) + persona({ x: 222, y: 78, ...vi(e, t === 'medio') }), t); }),
];
// primo piano del solo volto, ogni tono, a 3× (62 unità → 186 px)
const volti = (g) => [...['calmo', 'teso', 'critico'].map((t) => E.espressioneOndata(t)), ...['bene', 'medio', 'male', 'fallita'].map((t) => E.espressioneEsito(t))]
  .map((e) => [`<svg class="vignetta" viewBox="-30 -58 62 80" width="186" height="240"><defs><pattern id="v-ombra" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" class="v-retino-ombra-fondo"/><circle cx="2.5" cy="2.5" r="1.4" class="v-nero"/></pattern></defs><rect x="-30" y="-58" width="62" height="80" class="v-giallo"/>${persona({ x: 0, y: 0, scala: 1, ...tu(g, e), braccia: undefined })}</svg>`,
    `<svg class="vignetta" viewBox="-30 -58 62 80" width="186" height="240"><defs><pattern id="v-ombra" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" class="v-retino-ombra-fondo"/><circle cx="2.5" cy="2.5" r="1.4" class="v-nero"/></pattern></defs><rect x="-30" y="-58" width="62" height="80" class="v-giallo"/>${persona({ x: 0, y: 0, scala: 1, giacca: 'v-giacca-scura', capelli: 'berretto', baffi: true, giro: -3, ...e.vice, braccia: undefined })}</svg>`]);
const prima = (g) => [...['calmo', 'teso', 'critico'].map((t) => createElement(VignettaOndata, { tono: t, genere: g })), ...['bene', 'medio', 'male', 'fallita'].map((t) => createElement(VignettaEsito, { m, tono: t, genere: g }))].map((e) => renderToStaticMarkup(e));
await v.close();
const css = ['token.css', 'stile.css', 'stile-c18.css'].map((f) => readFileSync(`src/resa/${f}`, 'utf8')).join('\n') + '\n.vignetta .v-fine { stroke-width: 1.1px; } /* bozza: token nuovo --vignetta-tratto-fine */';
const nomi = ['rapporto calmo', 'rapporto teso', 'rapporto critico', 'verbale bene', 'verbale medio', 'verbale male', 'verbale fallita'];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const g of ['m', 'f']) for (const W of [360, 412]) for (const dpr of [1, 2]) {
  const P = prima(g), D = dopo(g);
  const righe = nomi.map((n, i) => `<div class="r"><b>${n}</b><div class="c">${P[i]}</div><div class="c">${D[i]}</div></div>`).join('');
  const p = await b.newPage({ viewport: { width: W, height: 900 }, deviceScaleFactor: dpr });
  await p.setContent(`<html><head><style>${css} body{margin:0;padding:6px;font:600 11px sans-serif} .r{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px} .r b{grid-column:1/3} .c .vignetta{height:auto;min-height:0;max-height:none;margin:0} .t{display:grid;grid-template-columns:1fr 1fr;font-weight:800}</style></head><body><div class="t"><span>PRIMA</span><span>DOPO</span></div>${righe}</body></html>`);
  await p.screenshot({ path: `${DIR}/tavola-${g}-${W}-dpr${dpr}.png`, fullPage: true }); await p.close();
}
for (const g of ['m', 'f']) {
  const V = volti(g), p = await b.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
  const righe = nomi.map((n, i) => `<div class="r"><b>${n}</b><div>${V[i][0]}</div><div>${V[i][1]}</div></div>`).join('');
  await p.setContent(`<html><head><style>${css} body{margin:0;padding:6px;font:600 11px sans-serif} .r{display:grid;grid-template-columns:186px 186px;gap:8px;margin-bottom:8px} .r b{grid-column:1/3} .vignetta{height:auto;min-height:0;max-height:none;margin:0;width:186px}</style></head><body><div class="r"><b>PRIMI PIANI a 3× (protagonista ${g === 'f' ? 'donna' : 'uomo'} · vice)</b></div>${righe}</body></html>`);
  await p.screenshot({ path: `${DIR}/volti-${g}-3x.png`, fullPage: true }); await p.close();
}
await b.close();
