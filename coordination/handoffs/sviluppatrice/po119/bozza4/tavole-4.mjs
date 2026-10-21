// Tavole della quarta prova (PO-133): PRIMA = terza prova, DOPO = quarta; figure intere a riposo; uomo e donna, 7 toni, a 360/375/412 (DPR 2); volti a 3×.
import { readFileSync, mkdirSync } from 'node:fs';
const R = process.cwd(), DIR = process.argv[2], H = `${R}/coordination/handoffs/sviluppatrice/po119`; mkdirSync(DIR, { recursive: true });
const P2 = (await import(`${H}/bozza3/bozza-persona-3.mjs`)).persona, P3 = (await import(`${H}/bozza4/bozza-persona-4.mjs`)).persona;
const { createServer } = await import(`${R}/node_modules/vite/dist/node/index.js`);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const v = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
const E = await v.ssrLoadModule('/src/resa/espressioni.ts'); await v.close();
const defs = '<defs><pattern id="v-ombra" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" class="v-retino-ombra-fondo"/><circle cx="2.5" cy="2.5" r="1.4" class="v-nero"/></pattern></defs>';
const cornice = (corpo, titolo) => `<svg class="vignetta" viewBox="0 0 320 180" role="img" aria-label="${titolo}">${defs}<rect x="0" y="0" width="320" height="180" class="v-giallo"/>${corpo}<rect x="1.5" y="1.5" width="317" height="177" class="v-cornice"/></svg>`;
const sfondoOndata = (t) => `<rect x="0" y="118" width="320" height="62" class="v-ombra"/><rect x="18" y="22" width="92" height="56" class="v-nero v-tratto"/><rect x="24" y="28" width="80" height="44" class="v-ciano"/>${t !== 'calmo' ? `<path d="${t === 'critico' ? 'M30 64 L48 40 L62 56 L80 32 L98 46' : 'M30 60 L50 52 L66 56 L84 46 L98 50'}" class="v-linea"/>` : ''}`;
const sfondoEsito = (t) => `<path d="M0 132 L40 104 L70 116 L110 96 L160 112 L210 94 L260 110 L320 98 V180 H0 Z" class="v-ombra"/>${t === 'bene' ? Array.from({ length: 22 }, (_, i) => `<rect x="${(i * 41) % 310 + 4}" y="${(i * 23) % 70 + 6}" width="5" height="9" transform="rotate(${(i * 47) % 180} ${(i * 41) % 310 + 6} ${(i * 23) % 70 + 10})" class="${['v-magenta', 'v-ciano', 'v-bianco'][i % 3]} v-tratto"/>`).join('') : ''}${t === 'fallita' ? '<path d="M40 30 Q60 10 80 30 Q100 10 120 30 Q140 50 100 50 L50 50 Q20 50 40 30 Z" class="v-nuvola v-tratto"/>' : ''}`;
const PESO = { calmo: [-3, 2], teso: [1.5, -1], critico: [0, 1], bene: [0, 0], medio: [-2, 2], male: [1, -1], fallita: [2, -2] };
let tono = 'calmo';
const tu = (g, e) => ({ scala: 1.15, giacca: 'v-ciano', capelli: g === 'f' ? 'lunghi' : 'corti', distintivo: true, peso: PESO[tono][0], ...e.tu, ...(tono === 'calmo' && !e.tu.braccia ? { braccia: 'cinturone' } : {}) });
const vi = (e, quieto) => ({ peso: PESO[tono][1], s: 0.95, scala: 1.15, giacca: 'v-giacca-scura', capelli: 'berretto', baffi: true, giro: -3, ...e.vice, ...(quieto && !e.vice.braccia ? { braccia: 'conserte' } : {}) });
const toni = [...['calmo', 'teso', 'critico'].map((t) => ['o', t, E.espressioneOndata(t)]), ...['bene', 'medio', 'male', 'fallita'].map((t) => ['e', t, E.espressioneEsito(t)])];
const tav = (P, g) => toni.map(([k, t, e]) => (tono = t) && k === 'o' ? cornice(sfondoOndata(t) + P({ x: 116, y: 72, ...tu(g, e) }) + P({ x: 236, y: 78, ...vi(e, t !== 'critico') }), t)
  : cornice(sfondoEsito(t) + P({ x: 104, y: 72, ...tu(g, e) }) + P({ x: 222, y: 78, ...vi(e, t === 'medio') }), t));
const volto = (P, o) => `<svg class="vignetta" viewBox="-34 -58 70 86" width="174" height="214">${defs}<rect x="-34" y="-58" width="70" height="86" class="v-giallo"/>${P({ x: 0, y: 0, scala: 1, ...o, braccia: undefined })}</svg>`;
const css = ['token.css', 'stile.css', 'stile-c18.css'].map((x) => readFileSync(`src/resa/${x}`, 'utf8')).join('\n') + '\n.vignetta .v-linea.v-fine { stroke-width: var(--vignetta-tratto-fine, 1.1px); }';
const nomi = ['rapporto calmo', 'rapporto teso', 'rapporto critico', 'verbale bene', 'verbale medio', 'verbale male', 'verbale fallita'];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const g of ['m', 'f']) for (const W of [360, 375, 412]) {
  const A = tav(P2, g), B = tav(P3, g), p = await b.newPage({ viewport: { width: W, height: 900 }, deviceScaleFactor: 2 });
  await p.setContent(`<html><head><style>${css} body{margin:0;padding:6px;font:600 11px sans-serif} .r{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px} .r b{grid-column:1/3} .vignetta{height:auto;min-height:0;max-height:none;margin:0}</style></head><body><div class="r"><b>PRIMA (terza prova) · DOPO (quarta prova) · ${W} px</b></div>${nomi.map((n, i) => `<div class="r"><b>${n}</b><div>${A[i]}</div><div>${B[i]}</div></div>`).join('')}</body></html>`);
  await p.screenshot({ path: `${DIR}/tavola-${g}-${W}.png`, fullPage: true }); await p.close();
}
for (const g of ['m', 'f']) {
  const p = await b.newPage({ viewport: { width: 760, height: 900 }, deviceScaleFactor: 1.5 }), o = (e) => tu(g, e);
  const righe = toni.map(([, t, e]) => `<div class="r"><b>${t}</b>${volto(P2, o(e))}${volto(P3, o(e))}${volto(P2, { giacca: 'v-giacca-scura', capelli: 'berretto', baffi: true, giro: -3, ...e.vice })}${volto(P3, { giacca: 'v-giacca-scura', capelli: 'berretto', baffi: true, giro: -3, ...e.vice })}</div>`).join('');
  await p.setContent(`<html><head><style>${css} body{margin:0;padding:6px;font:600 11px sans-serif} .r{display:grid;grid-template-columns:repeat(4,174px);gap:8px;margin-bottom:8px} .r b{grid-column:1/5} .vignetta{height:auto;min-height:0;max-height:none;margin:0;width:174px}</style></head><body><div class="r"><b>VOLTI (protagonista ${g === 'f' ? 'donna' : 'uomo'}: terza · quarta | vice: terza · quarta)</b></div>${righe}</body></html>`);
  await p.screenshot({ path: `${DIR}/volti-${g}.png`, fullPage: true }); await p.close();
}
const intera = (P, o) => `<svg class="vignetta" viewBox="-75 -60 150 200" width="150" height="200">${defs}<rect x="-75" y="-60" width="150" height="200" class="v-giallo"/>${P({ x: 0, y: 0, scala: 1, ...o })}</svg>`;
const pose = [['protagonista uomo, a riposo', { giacca: 'v-ciano', capelli: 'corti', distintivo: true, bocca: 'su' }], ['protagonista uomo, mano sul cinturone', { giacca: 'v-ciano', capelli: 'corti', distintivo: true, bocca: 'su', braccia: 'cinturone', peso: -3 }],
  ['protagonista donna, a riposo', { giacca: 'v-ciano', capelli: 'lunghi', distintivo: true, bocca: 'su' }], ['protagonista donna, mano sul cinturone', { giacca: 'v-ciano', capelli: 'lunghi', distintivo: true, bocca: 'su', braccia: 'cinturone', peso: -3 }],
  ['vice, a riposo', { giacca: 'v-giacca-scura', capelli: 'berretto', baffi: true, giro: -3, bocca: 'su' }], ['vice, braccia conserte', { giacca: 'v-giacca-scura', capelli: 'berretto', baffi: true, giro: -3, bocca: 'su', braccia: 'conserte', peso: 2 }]];
for (const W of [360, 375, 412]) {
  const p = await b.newPage({ viewport: { width: W, height: 900 }, deviceScaleFactor: 2 });
  await p.setContent(`<html><head><style>${css} body{margin:0;padding:6px;font:600 11px sans-serif} .r{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px} .r b{grid-column:1/3} .vignetta{height:auto;width:100%;min-height:0;max-height:none;margin:0}</style></head><body><div class="r"><b>FIGURE INTERE · PRIMA (terza prova) · DOPO (quarta prova) · ${W} px</b></div>${pose.map(([n, o]) => `<div class="r"><b>${n}</b><div>${intera(P2, o)}</div><div>${intera(P3, o)}</div></div>`).join('')}</body></html>`);
  await p.screenshot({ path: `${DIR}/intere-${W}.png`, fullPage: true }); await p.close();
}
await b.close(); console.log('fatto');
