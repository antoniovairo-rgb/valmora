// Sonda C-022 (sola lettura): rapporti di contrasto WCAG 2.1 (formula della luminanza relativa,
// https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html#dfn-relative-luminance) fra le coppie di colori
// che il codice disegna DENTRO le vignette SVG e sulla mappa Pixi, dove il DOM non dà un colore di fondo.
// Colori letti dai token (src/resa/token.css) e dai club (data/club/*.json); le coppie sono quelle del codice citato.
// Uso: node coordination/sonde/c22-contrasti.mjs
import { readFileSync, readdirSync } from 'node:fs';
const css = readFileSync('src/resa/token.css', 'utf8'); const tk = {};
for (const m of css.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)) tk[m[1]] ??= m[2];
const club = Object.fromEntries(readdirSync('data/club').map((f) => JSON.parse(readFileSync(`data/club/${f}`, 'utf8'))).map((c) => [c.id, c.colori]));
const lum = (h) => { const v = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const cr = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((u, v) => v - u); return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100; };
const riga = (dove, a, an, b, bn) => console.log(`${cr(a, b).toFixed(2).padStart(6)}  ${cr(a, b) < 3 ? 'SOTTO' : 'ok   '}  ${dove}: ${an} ${a} su ${bn} ${b}`);
const T = (n) => tk[n];
console.log('— vignetta della chiamata, riquadro di chi chiama (src/resa/vignette-chiamata.tsx:48-52)');
riga('riquadro', T('bianco'), 'v-bianco', T('giallo'), 'fondo giallo v-giallo');
riga('telefono', T('nero'), 'v-nero', T('bianco'), 'riquadro');
riga('onde del telefono/radio (v-linea)', T('nero'), 'nero', T('bianco'), 'riquadro');
riga('radio: display', T('ciano'), 'v-ciano', T('nero'), 'corpo radio');
riga('rete: schermo', T('ciano'), 'v-ciano', T('nero'), 'telefono');
riga('rete: notifica', T('magenta'), 'v-magenta', T('bianco'), 'riquadro');
riga('ufficio: foglio', T('giallo'), 'v-giallo', T('bianco'), 'riquadro');
riga('ufficio: timbro', T('magenta'), 'v-magenta', T('giallo'), 'foglio');
console.log('— vignetta della chiamata, sagome (src/resa/vignette-evento.tsx:41-68) sugli sfondi (vignette-chiamata.tsx:27-40)');
for (const [sf, n] of [['mappa-asfalto', 'strada v-asfalto'], ['mappa-tetto-4', 'piazzale/curva/sala v-grigio'], ['mappa-tetto-1', 'tornelli/quartiere v-mattone'], ['citta-fiume', 'porto v-acqua'], ['giallo', 'fondo giallo']]) {
  riga('pallino nero', T('nero'), 'v-nero', T(sf), n); riga('pallino magenta', T('magenta'), 'v-magenta', T(sf), n);
}
for (const [id, c] of Object.entries(club)) riga(`pallino del tifo, ${id}`, c.primario, 'primario', T('mappa-tetto-4'), 'curva v-grigio');
riga('«!» dello scontro', T('magenta'), 'v-magenta', T('bianco'), 'fumetto bianco');
riga('veicoli: furgone', T('bianco'), 'v-bianco', T('mappa-asfalto'), 'strada');
riga('fumo', '#8b8b8b', 'v-fumo (rgba 60,60,60,.55 su grigio #9b9a95 ≈)', T('mappa-tetto-4'), 'grigio');
console.log('— mappa Pixi: gente del corteo e della chiamata (StratoPixi.tsx:76-80, dinamica.ts:24,34) sul viale (sfondo.ts:170)');
riga('corteo neutro 1', T('mappa-folla-2'), '--mappa-folla-2', T('mappa-viale'), 'viale');
riga('corteo neutro 2', T('mappa-folla-3'), '--mappa-folla-3', T('mappa-viale'), 'viale');
for (const [id, c] of Object.entries(club)) { riga(`corteo ${id} primario`, c.primario, 'primario', T('mappa-viale'), 'viale'); riga(`corteo ${id} secondario`, c.secondario, 'secondario', T('mappa-viale'), 'viale'); }
console.log('— mappa Pixi: tifosi sugli spalti (sfondo.ts:197-237) sulla gradinata');
for (const [id, c] of Object.entries(club)) { riga(`spalti ${id} primario`, c.primario, 'primario', T('mappa-gradinata-1'), 'gradinata-1'); riga(`spalti ${id} secondario`, c.secondario, 'secondario', T('mappa-gradinata-1'), 'gradinata-1'); }
console.log('— stemmi (src/resa/stemma.tsx:29-33) sul bianco della scheda, simbolo sulla forma');
for (const [id, c] of Object.entries(club)) { riga(`stemma ${id} forma`, c.primario, 'primario', T('bianco'), 'bianco'); riga(`stemma ${id} simbolo`, c.secondario, 'secondario', c.primario, 'forma'); }
console.log('— dischi dei settori (stile.css:90,119-124): disco col colore della tensione sulla mappa');
for (let i = 0; i <= 5; i++) riga(`disco liv-${i}`, T(`tensione-${i}`), `--tensione-${i}`, T('mappa-asfalto'), 'asfalto');
riga('disco senza tensione', T('bianco'), 'bianco', T('mappa-asfalto'), 'asfalto');
riga('bordo del disco', T('nero'), 'nero', T('mappa-asfalto'), 'asfalto');
