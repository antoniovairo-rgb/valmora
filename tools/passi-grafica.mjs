// Passi della catena «grafica». Ognuno restituisce l'elenco dei problemi.
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { controllaToken, controllaGiro, controllaEmail } from './controlli-grafica.mjs';
import { readdirSync } from 'node:fs';
import { giraFoto } from './foto.mjs';
import { giraEpilogo } from './foto-epilogo.mjs';
import { giraC41 } from './foto-c41.mjs';
import { giraOffline } from './offline.mjs';
import { controllaCittaSenzaWebgl } from './foto-c128.mjs';

// D-202: quanti giri di browser insieme (bracci rossi, foto); le attese dominano sul calcolo
const PARTE_ROSSO = { C201C01: ['citta36'], C203R01: ['rapporti'], C206I01: ['chiamate'], C215L01: ['chiamate'], C210C01: ['citta36'], C210G01: ['citta36'], C218R01: ['riepilogo'], C218S01: ['citta36'], C219H01: ['riepilogo'], C221R01: ['riepilogo'], C230C01: ['citta36'], C234V01: ['verbali'], C237S01: ['po149'], C237P01: ['po149'], C241A01: ['po152a'], C241M01: ['po152a'] };
export const PARALLELI = Number(process.env.VALMORA_PARALLELI ?? 5);
export async function insieme(compiti, n) { const coda = [...compiti]; await Promise.all(Array.from({ length: Math.min(n, coda.length) }, async () => { while (coda.length) await coda.shift()(); })); }
const larghezzeGiro = () => (process.env.VALMORA_LARGHEZZE ?? '360,375,412').split(',').map(Number);
const fileResa = () => execSync('git ls-files --cached --others --exclude-standard src/resa', { encoding: 'utf8' })
  .split('\n').filter((p) => p && existsSync(p));

export const PASSI_GRAFICA = {
  token: () => controllaToken(Object.fromEntries(fileResa().map((p) => [p, readFileSync(p, 'utf8')]))),
  email: () => controllaEmail(Object.fromEntries(['dist/index.html', ...readdirSync('dist/assets').filter((f) => /\.(js|css|html)$/.test(f)).map((f) => `dist/assets/${f}`)].map((p) => [p, readFileSync(p, 'utf8')]))),
  // C128-01: le città con un nome si rigiocano senza WebGL; gli stati restano in out/foto per il braccio rosso
  foto: async () => {
    // D-161, D-164, D-165: epilogo, «Fine stagione» e fischio (tools/foto-epilogo.mjs); C41: verbale fallito. D-202: insieme al giro
    const [giri, epilogo, c41] = await Promise.all([giraFoto('out/foto'), giraEpilogo('out/foto'), giraC41('out/foto')]), stati = giri.flatMap((g) => g.citta);
    writeFileSync('out/foto/citta-stati.json', JSON.stringify(stati));
    return [...giri.flatMap(controllaGiro), ...(await controllaCittaSenzaWebgl(stati)), ...epilogo.flatMap(controllaGiro), ...c41.flatMap(controllaGiro)];
  },
  // D-202: schieramenti (tools/foto-schieramenti.mjs), prima dentro il giro foto: passo a sé, così in CI può girare su un altro job
  schieramenti: async () => {
    const { servi } = await import('./foto.mjs'), { controllaSchieramenti } = await import('./foto-schieramenti.mjs'), { chromium } = await import('playwright-core');
    const srv = await servi('dist'), url = `http://127.0.0.1:${srv.address().port}/`, rossi = (process.env.VALMORA_ROSSI ?? '').split(',').filter(Boolean);
    const browser = await chromium.launch({ executablePath: process.env.VALMORA_CHROME ?? (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined) });
    const giri = larghezzeGiro().map((larghezza) => ({ larghezza, errori: [], scorrimento: [], attesi: [] }));
    try { await Promise.all(giri.map((g) => controllaSchieramenti(browser, url, 'data', 'out/foto', (cosa, ok) => g.attesi.push({ cosa, ok }), rossi, g.larghezza))); }
    finally { await browser.close(); srv.close(); }
    return giri.flatMap(controllaGiro);
  },
  // D-187 (PO-052, PO-058): scorrimento di ogni schermata di e01 alle altezze dei telefoni della larghezza del giro
  altezze: async () => { const a = await import('./sonda-altezze.mjs'); return a.controllaAltezze(await a.giraAltezze({ vps: larghezzeGiro().flatMap((w) => a.VP_PER_LARGHEZZA[w] ?? []) })); },
  // S-22 (C14-01): il gioco installato funziona offline (service worker), su http://localhost
  offline: () => giraOffline('dist'),
  'bracci-rossi-grafica': async () => {
    const ciechi = [], compiti = [];
    // offline: ogni rosso del service worker e del contenitore d'errore va visto (S-22)
    for (const r of ['C14O01', 'C14O02', 'C14O03', 'C28W01']) compiti.push(async () => { if (!(await giraOffline('dist', [r])).length) ciechi.push(`offline/${r} è cieco`); });
    // D-161, D-164, D-165: senza epilogo, senza «Fine stagione» o senza fischio o senza tavole il giro deve diventare rosso (una larghezza basta)
    for (const r of ['C161E01', 'C164F01', 'C165F01', 'C165T01', 'C196V01']) // C196V01: C43-06, passo «Fine stagione» che scorre
      compiti.push(async () => { if (!(await giraEpilogo(`out/foto-rossi/${r}`, 'dist', [360], [r])).flatMap(controllaGiro).length) ciechi.push(`epilogo/${r} è cieco`); });
    // C41-06, C41-08 (collaudo C-041), D-185: senza la vignetta minima del verbale fallito, con le spaziature di prima,
    // con le spaziature di prima e la vignetta forzata al minimo (pagina che scorre) o col fumetto stretto il giro è rosso
    for (const r of ['C41V06,C234V01', 'C185V01,C234V01', 'C185V01,C66V01,C234V01', 'C41G08']) // D-234: col verbale fallito più stretto i primi tre solo con C234V01
      compiti.push(async () => { if (!(await giraC41(`out/foto-rossi/${r.replace(',', '-')}`, 'dist', [360], r.split(','))).flatMap(controllaGiro).length) ciechi.push(`c41/${r} è cieco`); });
    // C128-01: col rosso C128N01 (nessun ricalcolo a ingresso finito) il nome della città deve uscire dal bordo
    const stati = existsSync('out/foto/citta-stati.json') ? JSON.parse(readFileSync('out/foto/citta-stati.json', 'utf8')) : [];
    // i nomi sulla mappa della città ci sono solo a 412 (D-123): un giro a 360 o 375 da solo (CI per larghezza) non ne ha
    const con412 = !process.env.VALMORA_LARGHEZZE || process.env.VALMORA_LARGHEZZE.split(',').includes('412');
    if (!stati.length) { if (con412) ciechi.push('foto/città senza WebGL: nessuno stato con un nome dal giro foto'); }
    else compiti.push(async () => { if (!(await controllaCittaSenzaWebgl(stati, 'dist', ['C128N01'])).some((x) => x.includes('tocca il bordo'))) ciechi.push('foto/città senza WebGL (C128N01) è cieco'); });
    compiti.push(async () => { if (!(await (await import('./foto-home.mjs')).homeRossaVista('dist'))) ciechi.push('foto/home (C140H01 PO-140, C187C01+C230C01 C43-07 o C224A01 D-224) è cieco'); });
    // D-187: con la mappa che non si abbassa o la versione sopra la scena che esce il guardiano diventa rosso (360×760)
    if (larghezzeGiro().includes(360)) { const a = await import('./sonda-altezze.mjs');
      // D-191: rapporto senza mappa (R01), minimo a 160 px (L01), scheda compatta della città (C01), nomi lontani da «Home» (H01);
      // D-193: risposta in un blocco (R01), spaziature di sala e briefing (S01); D-241: costo prima della scelta (A01), mappa spenta (M01)
      for (const [r, vp] of [['C187M01', '360x760'], ['C187V01', '360x760'], ['C191R01', '360x760'], ['C191L01', '360x640'], ['C191C01', '360x640'], ['C191H01', '360x640'], ['C193R01', '360x640'], ['C193S01', '360x640'], ['C197R01', '360x640'], ['C201R01', '412x760'], ['C201C01,C230C01', '360x760'], ['C203R01', '360x760'], ['C206I01', '360x760'], ['C215L01', '360x760'], ['C210C01', '360x760'], ['C210G01', '360x760'], ['C218R01,C221R01', '360x760'], ['C218S01', '360x760'], ['C219H01,C221R01', '360x760'], ['C221R01', '360x640'], ['C230C01', '360x640'], ['C234V01', '360x640'], ['C237S01', '360x760'], ['C237P01', '360x760'], ['C241A01', '360x760'], ['C241M01', '360x760']])
        compiti.push(async () => { if (!a.controllaAltezze(await a.giraAltezze({ vps: [vp], rossi: r.split(','), parti: PARTE_ROSSO[r.split(',')[0]] ?? ['e01'] })).length) ciechi.push(`altezze/${r} è cieco`); }); }
    // D-207: ogni braccio delle altezze gira solo la parte dove il suo rosso si vede
    // D-202: i bracci sono indipendenti (rossi come parametro, cartelle separate): PARALLELI insieme, ognuno col suo browser
    await insieme(compiti, PARALLELI);
    if (!controllaToken({ 'src/resa/x.css': '.a { color: #fff; }' }).length) ciechi.push('token/colore è cieco');
    if (!controllaToken({ 'src/resa/x.css': '.a { margin: 3px; }' }).length) ciechi.push('token/misura è cieco');
    if (!controllaToken({ 'src/resa/X.tsx': '<div style={{ color: "red" }} />' }).length) ciechi.push('token/stile in linea è cieco');
    if (!controllaEmail({ 'dist/x.js': 'const a="prova@esempio.it"' }).length) ciechi.push('email è cieco');
    if (!controllaGiro({ larghezza: 360, errori: ['x'], scorrimento: [], attesi: [] }).length) ciechi.push('foto/errori è cieco');
    if (!controllaGiro({ larghezza: 360, errori: [], scorrimento: [{ schermata: 'schieramento', contenuto: 400, finestra: 360 }], attesi: [] }).length) ciechi.push('foto/scorrimento è cieco');
    if (!controllaGiro({ larghezza: 360, errori: [], scorrimento: [], attesi: [{ cosa: 'x', ok: false }] }).length) ciechi.push('foto/attesi è cieco');
    return ciechi;
  },
};
