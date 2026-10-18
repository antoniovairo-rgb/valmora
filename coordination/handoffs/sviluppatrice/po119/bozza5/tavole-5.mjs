// Tavole della quinta prova (solo braccia, PO-133): tre varianti V1/V2/V3; per ognuna figure intere (uomo, donna, vice) e
// vignette a busto dei 7 toni (uomo e donna), a 360 e 412 (DPR 2). Dalla radice: node …/bozza5/tavole-5.mjs <cartella>
import { readFileSync, mkdirSync } from 'node:fs';
const R = process.cwd(), DIR = process.argv[2], H = `${R}/coordination/handoffs/sviluppatrice/po119`; mkdirSync(DIR, { recursive: true });
const P = (await import(`${H}/bozza5/bozza-persona-5.mjs`)).persona, P4 = (await import(`${H}/bozza4/bozza-persona-4.mjs`)).persona;
const { createServer } = await import(`${R}/node_modules/vite/dist/node/index.js`);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const v = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
const E = await v.ssrLoadModule('/src/resa/espressioni.ts'); await v.close();
const defs = '<defs><pattern id="v-ombra" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" class="v-retino-ombra-fondo"/><circle cx="2.5" cy="2.5" r="1.4" class="v-nero"/></pattern></defs>';
const cornice = (corpo) => `<svg class="vignetta" viewBox="0 0 320 180">${defs}<rect x="0" y="0" width="320" height="180" class="v-giallo"/>${corpo}<rect x="1.5" y="1.5" width="317" height="177" class="v-cornice"/></svg>`;
const sfondoOndata = (t) => `<rect x="0" y="118" width="320" height="62" class="v-ombra"/><rect x="18" y="22" width="92" height="56" class="v-nero v-tratto"/><rect x="24" y="28" width="80" height="44" class="v-ciano"/>${t !== 'calmo' ? `<path d="${t === 'critico' ? 'M30 64 L48 40 L62 56 L80 32 L98 46' : 'M30 60 L50 52 L66 56 L84 46 L98 50'}" class="v-linea"/>` : ''}`;
const sfondoEsito = (t) => `<path d="M0 132 L40 104 L70 116 L110 96 L160 112 L210 94 L260 110 L320 98 V180 H0 Z" class="v-ombra"/>${t === 'fallita' ? '<path d="M40 30 Q60 10 80 30 Q100 10 120 30 Q140 50 100 50 L50 50 Q20 50 40 30 Z" class="v-nuvola v-tratto"/>' : ''}`;
const PESO = { calmo: [-3, 2], teso: [1.5, -1], critico: [0, 1], bene: [0, 0], medio: [-2, 2], male: [1, -1], fallita: [2, -2] };
const CALMI = ['calmo', 'medio'];
const tu = (V, g, e, t) => ({ variante: V, scala: 1.15, giacca: 'v-ciano', capelli: g === 'f' ? 'lunghi' : 'corti', distintivo: true, peso: PESO[t][0], ...e.tu, ...(V === 'v2' && CALMI.includes(t) && !e.tu.braccia ? { braccia: 'cinturone' } : {}) });
const vi = (V, e, t, quieto) => ({ variante: V, peso: PESO[t][1], s: 0.95, scala: 1.15, giacca: 'v-giacca-scura', capelli: 'berretto', baffi: true, giro: -3, ...e.vice,
  ...(!e.vice.braccia ? (V === 'v2' && CALMI.includes(t) ? { braccia: 'cinturone' } : quieto ? { braccia: 'conserte' } : {}) : {}) });
const toni = [...['calmo', 'teso', 'critico'].map((t) => ['o', t, E.espressioneOndata(t)]), ...['bene', 'medio', 'male', 'fallita'].map((t) => ['e', t, E.espressioneEsito(t)])];
const vignetta = (Pf, V, g, [k, t, e]) => k === 'o' ? cornice(sfondoOndata(t) + Pf({ x: 116, y: 72, ...tu(V, g, e, t) }) + Pf({ x: 236, y: 78, ...vi(V, e, t, t !== 'critico') }))
  : cornice(sfondoEsito(t) + Pf({ x: 104, y: 72, ...tu(V, g, e, t) }) + Pf({ x: 222, y: 78, ...vi(V, e, t, t === 'medio') }));
const intera = (Pf, o) => `<svg class="vignetta" viewBox="-75 -60 150 200">${defs}<rect x="-75" y="-60" width="150" height="200" class="v-giallo"/>${Pf({ x: 0, y: 0, scala: 1, ...o })}</svg>`;
const figure = (V) => [['uomo', { giacca: 'v-ciano', capelli: 'corti', distintivo: true, bocca: 'su', peso: -3 }], ['donna', { giacca: 'v-ciano', capelli: 'lunghi', distintivo: true, bocca: 'su', peso: 2 }], ['vice', { giacca: 'v-giacca-scura', capelli: 'berretto', baffi: true, giro: -3, bocca: 'su', peso: 1.5 }]]
  .flatMap(([n, o]) => [[`${n}, a riposo`, { variante: V, ...o }], ...(V === 'v2' ? [[`${n}, mano al fianco (toni calmi)`, { variante: V, ...o, braccia: 'cinturone' }]] : [])]);
const css = ['token.css', 'stile.css', 'stile-c18.css'].map((x) => readFileSync(`src/resa/${x}`, 'utf8')).join('\n');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const V of ['v1', 'v2', 'v3']) for (const W of [360, 412]) {
  const p = await b.newPage({ viewport: { width: W, height: 900 }, deviceScaleFactor: 2 }), F = figure(V);
  const intere = `<div class="r3"><b>${V.toUpperCase()} · figure intere · ${W} px (prima riga: quarta prova)</b>${['uomo', 'donna', 'vice'].map((n, i) => intera(P4, [{ giacca: 'v-ciano', capelli: 'corti', distintivo: true, bocca: 'su' }, { giacca: 'v-ciano', capelli: 'lunghi', distintivo: true, bocca: 'su' }, { giacca: 'v-giacca-scura', capelli: 'berretto', baffi: true, giro: -3, bocca: 'su' }][i])).join('')}${F.map(([n, o]) => `<div><small>${n}</small>${intera(P, o)}</div>`).join('')}</div>`;
  const vign = toni.map((x) => `<div class="r"><b>${x[1]}</b><div>${vignetta(P, V, 'm', x)}</div><div>${vignetta(P, V, 'f', x)}</div></div>`).join('');
  await p.setContent(`<html><head><style>${css} body{margin:0;padding:6px;font:600 11px sans-serif} .r{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px} .r b,.r3 b{grid-column:1/-1} .r3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;margin-bottom:8px} small{display:block} .vignetta{height:auto;width:100%;min-height:0;max-height:none;margin:0}</style></head><body>${intere}<div class="r"><b>${V.toUpperCase()} · vignette a busto (uomo · donna, col vice) · ${W} px</b></div>${vign}</body></html>`);
  await p.screenshot({ path: `${DIR}/${V}-${W}.png`, fullPage: true }); await p.close();
}
await b.close(); console.log('fatto');
