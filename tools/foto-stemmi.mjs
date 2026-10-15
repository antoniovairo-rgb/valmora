// D-125 (PO-109, passo S di docs/proposte/13-club.md §8.2): i 16 stemmi (13 club di Valmora + 3 di fuori città),
// disegnati da src/resa/stemma.tsx col server di vite (SSR) e misurati in Chromium alla misura vera (--avatar).
// Guardiano: per ogni club col simbolo nei dati (o nel piano, finché la principale non crea il file) il simbolo c'è
// (niente iniziali), sta dentro la forma (punti del simbolo campionati con isPointInFill/isPointInStroke), col lato
// maggiore almeno il 40% di quello dello stemma e ha il contrasto di C22-06. Rosso VALMORA_ROSSI=C62S01: i 12 simboli nuovi mancano.
// Uso: node tools/foto-stemmi.mjs [cartella foto]   (senza cartella: solo il controllo)
import { readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { createServer } from 'vite';
import { chromium } from 'playwright-core';
import { controllaStemmi } from './foto-c22.mjs';

/** Il piano (13-club.md §2.2-2.4, §3): forma, simbolo e colori. I file in data/club/ vincono, quando ci sono. */
export const PIANO = {
  cinderwick_united: ['scudo', 'ciminiera', '#ff6a13', '#1a1a1a'], larkspire_athletic: ['tondo', 'collina', '#2fa7ff', '#ffffff'],
  calderholt_rovers: ['scudo', 'calderone', '#1e7b4a', '#f2c230'], mossgarth_town: ['tondo', 'arco', '#546e7a', '#c0ca33'],
  ollerbrook_town: ['rombo', 'ciak', '#00897b', '#cfd8dc'], quillhaven_albion: ['rombo', 'penna', '#1b2a6b', '#d62839'],
  saltmere_wanderers: ['scudo', 'pietra_miliare', '#5d4037', '#e9c46a'], pinegrove_rangers: ['tondo', 'pigna', '#6a1b9a', '#ffc107'],
  belltower_harriers: ['scudo', 'campanile', '#ec407a', '#263238'], waterline_city: ['rombo', 'onde', '#f5f5f5', '#0d47a1'],
  lookout_fc: ['scudo', 'torre_vedetta', '#c62828', '#f5f5f5'], domepark_villa: ['tondo', 'cupola', '#121212', '#f5f5f5'],
  tramway_borough: ['rombo', 'tram', '#fbc02d', '#1565c0'], railhead_county: ['scudo', 'fine_linea', '#b39ddb', '#311b92'],
  southwind_town: ['rombo', 'ancora', '#64dd17', '#ffffff'], wallgate_rovers: ['scudo', 'porta_mura', '#ffab91', '#37474f'],
};

export function clubDaProvare() {
  const dati = Object.fromEntries(readdirSync('data/club').map((f) => JSON.parse(readFileSync(`data/club/${f}`, 'utf8'))).map((c) => [c.id, c]));
  return Object.entries(PIANO).map(([id, [forma, simbolo, primario, secondario]]) => {
    const d = dati[id];
    return { id, nome: `club.${id}`, colori: d?.colori ?? { primario, secondario }, stemma: d?.stemma ?? { forma, simbolo } };
  });
}

/** Pagina coi 16 stemmi alla misura vera; il CSS è quello del gioco (token, stile, stile-c18). */
export async function paginaStemmi(browser, larghezza, rossi = '') {
  const v = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
  try {
    if (rossi) for (const x of rossi.split(',')) globalThis[`__NO_${x}`] = true;
    const { Stemma } = await v.ssrLoadModule('/src/resa/stemma.tsx');
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { createElement } = await import('react');
    const celle = clubDaProvare().map((c) => `<figure data-club="${c.id}" data-simbolo-atteso="${c.stemma.simbolo}">${renderToStaticMarkup(createElement(Stemma, { c }))}<figcaption>${c.id.split('_')[0]}</figcaption></figure>`).join('');
    const css = ['token.css', 'stile.css', 'stile-c18.css'].map((f) => readFileSync(`src/resa/${f}`, 'utf8')).join('\n');
    const p = await browser.newPage({ viewport: { width: larghezza, height: 640 }, deviceScaleFactor: 2 });
    await p.setContent(`<html><head><style>${css}
      body { margin: 0; padding: var(--spazio-3); } .griglia { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--spazio-3); }
      figure { margin: 0; display: grid; justify-items: center; gap: var(--spazio-1); font: 600 var(--testo-mini) var(--font); }</style></head>
      <body><div class="griglia">${celle}</div></body></html>`);
    return p;
  } finally {
    if (rossi) for (const x of rossi.split(',')) delete globalThis[`__NO_${x}`];
    await v.close();
  }
}

/** Il guardiano: simbolo presente, dentro la forma, abbastanza grande; poi il contrasto (C22-06). */
export async function controllaStemmiTutti(pagina, atteso, dove) {
  const male = await pagina.evaluate(() => [...document.querySelectorAll('figure[data-club]')].flatMap((f) => {
    const svg = f.querySelector('svg.stemma'), id = f.dataset.club, out = [];
    const forma = svg.querySelector('.stemma-forma > *'), segni = [...svg.querySelectorAll('[data-simbolo] *')].filter((e) => e.isPointInFill);
    if (svg.querySelector('[data-simbolo] text')) return [`${id}: iniziali al posto del simbolo «${f.dataset.simboloAtteso}»`];
    // punti del simbolo su una griglia di 0,5 unità del disegno: ognuno deve stare dentro la forma
    const pt = svg.createSVGPoint(); let fuori = 0, alto = Infinity, basso = -Infinity, sinistra = Infinity, destra = -Infinity;
    for (let y = 0; y <= 50; y += 0.5) for (let x = 0; x <= 40; x += 0.5) {
      pt.x = x; pt.y = y;
      // dal disegno dello stemma allo spazio dell'elemento (il ciak sta in un gruppo ruotato)
      const dentroSegno = segni.some((e) => { const q = pt.matrixTransform(svg.getScreenCTM().inverse().multiply(e.getScreenCTM()).inverse()); return e.isPointInFill(q) || (getComputedStyle(e).stroke !== 'none' && parseFloat(getComputedStyle(e).strokeWidth) > 1 && e.isPointInStroke(q)); });
      if (!dentroSegno) continue;
      alto = Math.min(alto, y); basso = Math.max(basso, y); sinistra = Math.min(sinistra, x); destra = Math.max(destra, x);
      if (!forma.isPointInFill(pt)) fuori++;
    }
    if (fuori) out.push(`${id}: ${fuori} punti del simbolo fuori dalla forma`);
    // misura: il lato maggiore del simbolo (onde e collina sono larghe e basse) rispetto al lato dello stemma
    const quota = Math.max((basso - alto) / 50, (destra - sinistra) / 40), px = (svg.getBoundingClientRect().height * Math.max(basso - alto, ((destra - sinistra) * 50) / 40)) / 50;
    if (!(quota >= 0.4)) out.push(`${id}: simbolo di ${px.toFixed(1)} px, ${(quota * 100).toFixed(0)}% dello stemma (minimo 40%)`);
    return out;
  }));
  atteso(`${dove}: stemmi: ${male.join('; ')} (D-125)`, !male.length);
  await controllaStemmi(pagina, atteso, dove);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const dir = process.argv[2]; if (dir) mkdirSync(dir, { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium' });
  const errori = [];
  for (const w of [360, 375, 412]) {
    const p = await paginaStemmi(b, w, process.env.VALMORA_ROSSI ?? '');
    await controllaStemmiTutti(p, (m, ok) => { if (!ok) errori.push(m); }, `${w}px`);
    if (dir) await p.screenshot({ path: `${dir}/stemmi-${w}.png`, fullPage: true });
    await p.close();
  }
  await b.close();
  console.log(errori.length ? errori.join('\n') : 'stemmi: nessun errore');
  process.exitCode = errori.length ? 1 : 0;
}
