// PO-022 (D-190): foto di tre imprevisti (e01 ondata 1, e02 ondata 2, e05 ondata 2) a 360, 375 e 412 px, e il braccio
// rosso C190I01 (l'imprevisto come una chiamata qualsiasi). Stato: bot attento fino all'imprevisto. Controlli: l'avviso
// «Imprevisto» c'è e si vede, nessun conto alla rovescia, nessuno scorrimento orizzontale.
// Uso: npx vite build && node tools/foto-imprevisti.mjs [cartella]
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { servi } from './foto.mjs';
import { leggiDati } from './dati-disco.mjs';
import { salvataggioTutti } from './foto-bozze.mjs';
import { partenzeAttente } from './foto-schieramenti.mjs';
import { attenta } from '../src/logica/bot.ts';
import { creaCaso } from '../src/logica/caso.ts';
import { variabiliIniziali } from '../src/logica/condizioni.ts';
import { chiamateAperte, rispondi, schiera } from '../src/logica/missione.ts';

const cartella = process.argv[2] ?? 'coordination/handoffs/sviluppatrice/s14/imprevisti';
mkdirSync(cartella, { recursive: true });
const CHIAVE = 'valmora-salvataggio';
const dati = leggiDati('data'), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), v0 = variabiliIniziali(dich.values());
const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x);
const partenze = partenzeAttente('data');
/** Stato salvato con l'imprevisto «id» come chiamata aperta. */
function fino(ep, n, id) {
  const st = partenze.find((x) => x.m.id === ep && x.n === n), bot = attenta(creaCaso(1), dich);
  let s = schiera(st.m, st.s, st.d);
  for (let c = chiamateAperte(st.m, s)[0]; c && c.id !== id; c = chiamateAperte(st.m, s)[0]) s = rispondi(st.m, s, c.id, bot.scegli(st.m, s, c), dich);
  if (chiamateAperte(st.m, s)[0]?.id !== id) throw new Error(`${ep}: ${id} non arriva`);
  return JSON.stringify({ ...salvataggioTutti(missioni, v0), in_corso: s });
}
const CASI = [['e01', 1, 'imp_ambulanza'], ['e02', 2, 'imp_sciarpa'], ['e05', 2, 'imp_tabellone']];
const srv = await servi('dist'), url = `http://127.0.0.1:${srv.address().port}/`;
const browser = await chromium.launch({ executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
const esiti = []; let rossi = 0;
try {
  for (const [ep, n, id] of CASI) for (const w of [360, 375, 412]) for (const rosso of [false, true]) {
    if (rosso && w !== 360) continue;
    const p = await browser.newPage({ viewport: { width: w, height: 800 }, reducedMotion: 'reduce' });
    await p.addInitScript((r) => { globalThis.__VALMORA_SECONDO_MS = 1; if (r) globalThis.__NO_C190I01 = true; }, rosso);
    await p.goto(url); await p.evaluate(([k, v]) => localStorage.setItem(k, v), [CHIAVE, fino(ep, n, id)]); await p.reload();
    await p.getByRole('button', { name: 'Riprendi' }).click();
    await p.waitForSelector(`[data-messaggio="chiamata-${id}"]`, { timeout: 15000 }); await p.waitForTimeout(600);
    // l'avviso in cima alla chiamata: la pagina lo porta in vista come fa con la chiamata
    await p.evaluate(() => document.querySelector('[data-imprevisto]')?.scrollIntoView({ block: 'start' }));
    await p.waitForTimeout(200);
    const x = await p.evaluate(() => { const a = document.querySelector('[data-imprevisto]'); const r = a?.getBoundingClientRect();
      return { avviso: a?.textContent ?? null, visibile: !!r && r.top >= 0 && r.bottom <= innerHeight, timbro: document.querySelector('.timbro')?.textContent ?? null,
        conto: !!document.querySelector('[data-conto], [role="timer"]'), orizzontale: document.documentElement.scrollWidth > innerWidth }; });
    await p.screenshot({ path: join(cartella, `${ep}-${id}-${w}${rosso ? '-rosso' : ''}.png`) });
    esiti.push({ ep, id, w, rosso, ...x });
    if (rosso && !x.avviso) rossi++;
    await p.close();
  }
} finally { await browser.close(); srv.close(); }
for (const e of esiti) console.log(JSON.stringify(e));
const male = esiti.filter((e) => !e.rosso && (!e.avviso || !e.visibile || e.conto || e.orizzontale || e.timbro !== 'Imprevisto!'));
console.log(`imprevisti: ${esiti.filter((e) => !e.rosso).length} foto, ${male.length} con difetti; braccio rosso C190I01 senza avviso: ${rossi}/${CASI.length}`);
process.exit(male.length || rossi !== CASI.length ? 1 : 0);
