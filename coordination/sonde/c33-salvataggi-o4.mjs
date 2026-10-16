// Sonda C-033 (sola lettura): salvataggi VERI della build A (0.31.0) dentro l'ondata 4 di e08 ed e30, dove la 0.32.0 ha
// cambiato testi (e08.ch.risultato) e verso del corteo (e30). A) nella build A: stato del motore A (bot attento, seme 1)
// all'inizio dell'ondata 4 con lo schieramento fatto, «Riprendi», si legge la chiamata aperta, poi si esporta il file col
// pulsante. B) nella build B: importa il file, «Riprendi», stessa chiamata? testo della chiamata, data-folla della mappa.
// Giro 1: la scena di A letta a 1200 ms dal «Riprendi» era ancora il titolo (e08); ora si attende la chiamata (15 s).
// RAPPORTO=1: lo stato è a fine ondata N, sul rapporto (rapporto_aperto), per la 0.33.0 che cambia il rapporto (PO-059).
// Uso: [RAPPORTO=1] [EP=e08,e30] [VA=0.31.0] node coordination/sonde/c33-salvataggi-o4.mjs <radice A> <radice B> <cartella salvataggi> <uscita.json>
import { createServer } from 'node:http'; import { readFileSync, existsSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const [RA, RB] = [resolve(process.argv[2]), resolve(process.argv[3])]; const DIR = process.argv[4]; const OUT = process.argv[5]; mkdirSync(DIR, { recursive: true });
const EP = (process.env.EP ?? 'e08,e30').split(','); const VA = process.env.VA ?? '0.31.0'; const ONDATA = Number(process.env.ONDATA ?? 4);
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const servi = async (R) => { const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); }); await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); return { srv, url: `http://127.0.0.1:${srv.address().port}/` }; };
const { chromium } = await import(`${RB}/node_modules/playwright-core/index.mjs`);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const CH = 'valmora-salvataggio';
async function pagina(url, errori) { const p = await b.newPage({ viewport: { width: 360, height: 760 }, hasTouch: true, reducedMotion: 'reduce', acceptDownloads: true }); p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text().slice(0, 160)); }); p.on('pageerror', (e) => errori.push(e.message.slice(0, 160))); await p.goto(url); return p; }
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
const quale = (p) => p.evaluate(() => ({ scena: document.querySelector('.scena')?.dataset.scena, chiamata: document.querySelector('[data-messaggio^="chiamata-"]')?.dataset.messaggio ?? null,
  tono: document.querySelector('[data-tono]')?.dataset.tono ?? null, testo: document.querySelector('[data-messaggio^="chiamata-"]')?.innerText.replace(/\s+/g, ' ').slice(0, 400) ?? null, folla: document.querySelector('.mappa')?.getAttribute('data-folla') ?? null }));
const M = await import(`${RA}/src/logica/missione.ts`); const Bt = await import(`${RA}/src/logica/bot.ts`); const { creaCaso } = await import(`${RA}/src/logica/caso.ts`);
const { leggiDati } = await import(`${RA}/tools/dati-disco.mjs`); const { missioniDai, salvataggioTutti } = await import(`${RA}/tools/foto-bozze.mjs`);
const dati = leggiDati(join(RA, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(RA, 'data'));
const A = await servi(RA); const errA = []; const pa = await pagina(A.url, errA); const ris = [];
for (const ep of EP) {
  const m = missioni.find((x) => x.id === ep); const r = { ep };
  try {
    const g = Bt.attenta(creaCaso(1), dich); let s = M.iniziaMissione(m, v0, dich);
    while (s.ondata < ONDATA) { s = M.schiera(m, s, g.schiera(m, s)); for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) s = M.rispondi(m, s, c.id, g.scegli(m, s, c), dich); s = M.chiudiOndata(m, s, dich); }
    const RAP = process.env.RAPPORTO === '1'; let extra = {};
    if (RAP) { s = M.schiera(m, s, g.schiera(m, s)); for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) s = M.rispondi(m, s, c.id, g.scegli(m, s, c), dich); s = M.chiudiOndata(m, s, dich); extra = { rapporto_aperto: s.rapporti.at(-1).n }; r.attesa = 'rapporto'; }
    else { s = M.schiera(m, s, g.schiera(m, s)); r.attesa = M.chiamateAperte(m, s)[0]?.id; }
    await pa.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, v); }, [CH, JSON.stringify({ ...salvataggioTutti(missioni, v0), in_corso: s, ...extra })]); await pa.reload(); await sc(pa, 'titolo');
    await pa.getByRole('button', { name: 'Riprendi' }).click(); await sc(pa, RAP ? 'rapporto' : 'chiamata').catch(() => {}); await pa.waitForTimeout(600); r.a = await quale(pa);
    await pa.reload(); await sc(pa, 'titolo');
    const [scarico] = await Promise.all([pa.waitForEvent('download'), pa.click('[data-azione="esporta"]')]); r.file = join(DIR, `${VA}-${ep}-ondata${ONDATA}${process.env.RAPPORTO === '1' ? '-rapporto' : ''}.json`); copyFileSync(await scarico.path(), r.file);
  } catch (e) { r.erroreA = e.message.slice(0, 200); }
  ris.push(r);
}
await pa.close(); A.srv.close();
const Bs = await servi(RB); const errB = []; const pb = await pagina(Bs.url, errB);
for (const r of ris) {
  if (!r.file) continue;
  try {
    await pb.evaluate(() => localStorage.clear()); await pb.reload(); await sc(pb, 'titolo');
    await pb.setInputFiles('[data-importa]', r.file); await pb.waitForTimeout(800); r.erroreImporta = await pb.locator('[data-errore-importa]').count();
    await pb.reload(); await sc(pb, 'titolo'); await pb.getByRole('button', { name: 'Riprendi' }).click(); await sc(pb, process.env.RAPPORTO === '1' ? 'rapporto' : 'chiamata').catch(() => {}); await pb.waitForTimeout(600);
    r.b = await quale(pb); await pb.screenshot({ path: join(DIR, `${VA}-${r.ep}-ondata${ONDATA}-ripreso.png`) });
    r.ok = !r.erroreImporta && r.b.scena === r.a?.scena && r.b.chiamata === r.a?.chiamata;
  } catch (e) { r.erroreB = e.message.slice(0, 200); r.ok = false; }
  console.log(`${r.ep}: ${r.ok ? 'ok' : 'NO'} ${JSON.stringify(r)}`);
}
await b.close(); Bs.srv.close(); writeFileSync(OUT, JSON.stringify({ ris, errA, errB }, null, 1));
console.log(`ripresi ${ris.filter((r) => r.ok).length}/${ris.length}; errori di console A ${errA.length}, B ${errB.length}`, [...new Set([...errA, ...errB])].slice(0, 5));
