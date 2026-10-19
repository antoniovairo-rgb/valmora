// Passi della catena «grafica». Ognuno restituisce l'elenco dei problemi.
import { execSync } from 'node:child_process';
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { controllaToken, controllaGiro, controllaEmail } from './controlli-grafica.mjs';
import { readdirSync } from 'node:fs';
import { giraFoto } from './foto.mjs';
import { giraEpilogo } from './foto-epilogo.mjs';
import { giraOffline } from './offline.mjs';
import { controllaCittaSenzaWebgl } from './foto-c128.mjs';

const larghezzeGiro = () => (process.env.VALMORA_LARGHEZZE ?? '360,375,412').split(',').map(Number);
const fileResa = () => execSync('git ls-files --cached --others --exclude-standard src/resa', { encoding: 'utf8' })
  .split('\n').filter((p) => p && existsSync(p));

export const PASSI_GRAFICA = {
  token: () => controllaToken(Object.fromEntries(fileResa().map((p) => [p, readFileSync(p, 'utf8')]))),
  email: () => controllaEmail(Object.fromEntries(['dist/index.html', ...readdirSync('dist/assets').filter((f) => /\.(js|css|html)$/.test(f)).map((f) => `dist/assets/${f}`)].map((p) => [p, readFileSync(p, 'utf8')]))),
  // C128-01: le città con un nome si rigiocano senza WebGL; gli stati restano in out/foto per il braccio rosso
  foto: async () => {
    const giri = await giraFoto('out/foto'), stati = giri.flatMap((g) => g.citta);
    writeFileSync('out/foto/citta-stati.json', JSON.stringify(stati));
    // D-161, D-164, D-165: epilogo, «Fine stagione» e fischio (tools/foto-epilogo.mjs)
    return [...giri.flatMap(controllaGiro), ...(await controllaCittaSenzaWebgl(stati)), ...(await giraEpilogo('out/foto')).flatMap(controllaGiro)];
  },
  // D-187 (PO-052, PO-058): scorrimento di ogni schermata di e01 alle altezze dei telefoni della larghezza del giro
  altezze: async () => { const a = await import('./sonda-altezze.mjs'); return a.controllaAltezze(await a.giraAltezze({ vps: larghezzeGiro().flatMap((w) => a.VP_PER_LARGHEZZA[w] ?? []) })); },
  // S-22 (C14-01): il gioco installato funziona offline (service worker), su http://localhost
  offline: () => giraOffline('dist'),
  'bracci-rossi-grafica': async () => {
    const ciechi = [];
    // offline: ogni rosso del service worker e del contenitore d'errore va visto (S-22)
    for (const r of ['C14O01', 'C14O02', 'C14O03', 'C28W01']) {
      process.env.VALMORA_ROSSI = r;
      try { if (!(await giraOffline('dist')).length) ciechi.push(`offline/${r} è cieco`); } finally { delete process.env.VALMORA_ROSSI; }
    }
    // D-161, D-164, D-165: senza epilogo, senza «Fine stagione» o senza fischio o senza tavole il giro deve diventare rosso (una larghezza basta)
    for (const r of ['C161E01', 'C164F01', 'C165F01', 'C165T01']) {
      process.env.VALMORA_ROSSI = r;
      try { if (!(await giraEpilogo('out/foto-rossi', 'dist', [360])).flatMap(controllaGiro).length) ciechi.push(`epilogo/${r} è cieco`); } finally { delete process.env.VALMORA_ROSSI; }
    }
    // C128-01: col rosso C128N01 (nessun ricalcolo a ingresso finito) il nome della città deve uscire dal bordo
    const stati = existsSync('out/foto/citta-stati.json') ? JSON.parse(readFileSync('out/foto/citta-stati.json', 'utf8')) : [];
    // i nomi sulla mappa della città ci sono solo a 412 (D-123): un giro a 360 o 375 da solo (CI per larghezza) non ne ha
    const con412 = !process.env.VALMORA_LARGHEZZE || process.env.VALMORA_LARGHEZZE.split(',').includes('412');
    if (!stati.length) { if (con412) ciechi.push('foto/città senza WebGL: nessuno stato con un nome dal giro foto'); }
    else if (!(await controllaCittaSenzaWebgl(stati, 'dist', ['C128N01'])).some((x) => x.includes('tocca il bordo'))) ciechi.push('foto/città senza WebGL (C128N01) è cieco');
    if (!(await (await import('./foto-home.mjs')).homeRossaVista('dist'))) ciechi.push('foto/home (C140H01, PO-140) è cieco');
    // D-187: con la mappa che non si abbassa, la versione sopra le lettere o i nomi sopra i segni il guardiano diventa rosso (360×760)
    if (larghezzeGiro().includes(360)) { const a = await import('./sonda-altezze.mjs');
      for (const r of ['C187M01', 'C187V01', 'C187S01']) if (!a.controllaAltezze(await a.giraAltezze({ vps: ['360x760'], rossi: [r] })).length) ciechi.push(`altezze/${r} è cieco`); }
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
