// C-032: copia di c28-salvataggi.mjs; il «continua» dopo la prima risposta si attende (30 s) invece di saltarlo in silenzio
// dopo 5 s: sotto carico e33 veniva esportata sulla risposta (C-032, primo giro 11/12, rifatta da sola 2/2).
// C-028: copia di c26-salvataggi.mjs con VA=<versione di A> nel nome dei file esportati e VECCHI_DIR=<cartella> per
// riprendere nella build B anche salvataggi veri già esportati da versioni precedenti (es. salvataggi-020).
// C-026 (sola lettura): salvataggi VERI della 0.19.0 caricati nella 0.20.0. In C-027 usata uguale con A = 0.20.0 e B = 0.21.0.
// A) sulla build della 0.19.0 (radice A, dist/ costruita da 0744b24) gioco dall'interfaccia ogni episodio di EP fino a
//    metà della prima ondata (una risposta data), leggo il salvataggio (localStorage) ed esporto il file col pulsante.
// B) sulla build della 0.20.0 (radice B) importo il file esportato, premo «Riprendi»: deve tornare la stessa chiamata;
//    leggo il testo mostrato (nomi vecchi in ogni maiuscola, nomi dei club) ed errori di console.
// Uso: [EP=…] node coordination/sonde/c26-salvataggi.mjs <radice 0.19.0> <radice 0.20.0> <cartella salvataggi> <uscita.json>
import { createServer } from 'node:http'; import { readFileSync, existsSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const [RA, RB] = [resolve(process.argv[2]), resolve(process.argv[3])]; const DIR = process.argv[4]; const OUT = process.argv[5]; mkdirSync(DIR, { recursive: true });
const EP = (process.env.EP ?? 'e02,e05,e07,e12,e15,e21,e23,e25,e27,e31').split(',');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const servi = async (R) => { const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); }); await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); return { srv, url: `http://127.0.0.1:${srv.address().port}/` }; };
const { chromium } = await import(`${RB}/node_modules/playwright-core/index.mjs`);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const VECCHI = /cinderwick|larkspire|calderholt|mossgarth|ollerbrook|quillhaven|saltmere/gi;
const NUOVI = /\b(Kiln|Skyfield|Square|Arches|Studio|Garden|Stoneway|Pinegrove|Belltower|Waterline|Lookout|Domepark|Tramway|Railhead|Southwind|Wallgate)\b/g;
const CH = 'valmora-salvataggio';
async function pagina(url, errori) { const p = await b.newPage({ viewport: { width: 360, height: 760 }, hasTouch: true, reducedMotion: 'reduce', acceptDownloads: true }); p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text().slice(0, 160)); }); p.on('pageerror', (e) => errori.push(e.message.slice(0, 160))); await p.goto(url); return p; }
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
const quale = (p) => p.evaluate(() => ({ scena: document.querySelector('.scena')?.dataset.scena, chiamata: document.querySelector('[data-messaggio^="chiamata-"]')?.dataset.messaggio ?? null }));

// A) 0.19.0
const A = await servi(RA); const errA = []; const pa = await pagina(A.url, errA);
const M = await import(`${RA}/src/logica/missione.ts`); const B = await import(`${RA}/src/logica/bot.ts`); const { creaCaso } = await import(`${RA}/src/logica/caso.ts`);
const { leggiDati } = await import(`${RA}/tools/dati-disco.mjs`); const { missioniDai, salvataggioTutti } = await import(`${RA}/tools/foto-bozze.mjs`);
const dati = leggiDati(join(RA, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(RA, 'data'));
const ris = [];
for (const ep of EP) {
  const m = missioni.find((x) => x.id === ep); const r = { ep };
  try {
    const g = B.attenta(creaCaso(1), dich); let s = M.iniziaMissione(m, v0, dich); const d = g.schiera(m, s); s = M.schiera(m, s, d); const c0 = M.chiamateAperte(m, s)[0]; const o0 = g.scegli(m, s, c0);
    await pa.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, v); }, [CH, JSON.stringify(salvataggioTutti(missioni, v0))]); await pa.reload(); await sc(pa, 'titolo');
    await pa.getByRole('button', { name: 'Riprendi' }).click(); await sc(pa, 'citta'); await pa.waitForTimeout(300);
    if (await pa.locator(`[data-stagione="${m.stagione}"]`).count()) await pa.click(`[data-stagione="${m.stagione}"]`);
    await pa.click(`[data-episodio="${ep}"] .settore-punto`); await pa.waitForTimeout(250); await pa.click('[data-azione="avvia-episodio"]'); await pa.waitForTimeout(200);
    for (let k = 0; k < 3 && await pa.locator('[data-azione="conferma-passo"]').count(); k++) { await pa.click('[data-azione="conferma-passo"]'); await pa.waitForTimeout(150); }
    if (await pa.locator('[data-azione="conferma-rigioca"]').count()) await pa.click('[data-azione="conferma-rigioca"]');
    await sc(pa, 'sala'); while (await pa.locator('[data-azione="passo"]').count()) { await pa.click('[data-azione="passo"]'); await pa.waitForTimeout(80); }
    await pa.click('[data-azione="avanti"]'); await sc(pa, 'briefing'); while (await pa.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) { await pa.click('[data-azione="prossimo"], [data-azione="passo"]'); await pa.waitForTimeout(80); }
    await pa.click('[data-azione="inizia"]'); await sc(pa, 'schieramento');
    for (const [rs, ps] of Object.entries(d)) for (const [st, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await pa.getAttribute(`[data-risorsa="${rs}"]`, 'aria-pressed')) !== 'true') await pa.click(`[data-risorsa="${rs}"]`); await pa.click(`[data-settore="${st}"] .settore-punto`); }
    await pa.click('[data-azione="conferma"]'); if (await pa.locator('[data-azione="conferma-davvero"]').count()) await pa.click('[data-azione="conferma-davvero"]');
    await sc(pa, 'chiamata'); await pa.click(`[data-opzione="${o0}"]`); await pa.waitForSelector('[data-azione="continua"]', { timeout: 30000 }); await pa.click('[data-azione="continua"]'); await sc(pa, 'chiamata').catch(() => {}); // C-032: niente più errore ignorato sotto carico
    await pa.waitForTimeout(500); r.a = await quale(pa); r.testoA = [...new Set((await pa.evaluate(() => document.body.innerText)).match(NUOVI) ?? [])];
    await pa.reload(); await sc(pa, 'titolo');
    const [scarico] = await Promise.all([pa.waitForEvent('download'), pa.click('[data-azione="esporta"]')]); r.file = join(DIR, `${process.env.VA ?? '0.21.0'}-${ep}-prima-ondata.json`); copyFileSync(await scarico.path(), r.file);
  } catch (e) { r.erroreA = e.message.slice(0, 200); }
  ris.push(r);
}
await pa.close(); A.srv.close();
// B) 0.20.0
const Bs = await servi(RB); const errB = []; const pb = await pagina(Bs.url, errB);
for (const r of ris) {
  if (!r.file) continue;
  try {
    await pb.evaluate(() => localStorage.clear()); await pb.reload(); await sc(pb, 'titolo');
    await pb.setInputFiles('[data-importa]', r.file); await pb.waitForTimeout(800); r.erroreImporta = await pb.locator('[data-errore-importa]').count();
    await pb.reload(); await sc(pb, 'titolo'); await pb.getByRole('button', { name: 'Riprendi' }).click(); await pb.waitForTimeout(1000);
    r.b = await quale(pb); const t = await pb.evaluate(() => document.body.innerText);
    r.vecchi = (t.match(VECCHI) ?? []).length; r.testoB = [...new Set(t.match(NUOVI) ?? [])];
    r.ok = !r.erroreImporta && r.b.chiamata === r.a.chiamata && r.b.scena === r.a.scena && !r.vecchi;
  } catch (e) { r.erroreB = e.message.slice(0, 200); r.ok = false; }
  console.log(`${r.ep}: ${r.ok ? 'ok' : 'NO'} ${JSON.stringify(r)}`);
}
const vecchi = [];
if (process.env.VECCHI_DIR) for (const f of (await import('node:fs')).readdirSync(process.env.VECCHI_DIR).filter((x) => x.endsWith('.json')).sort()) {
  const v = { file: f };
  try { await pb.evaluate(() => localStorage.clear()); await pb.reload(); await sc(pb, 'titolo');
    await pb.setInputFiles('[data-importa]', join(process.env.VECCHI_DIR, f)); await pb.waitForTimeout(800); v.erroreImporta = await pb.locator('[data-errore-importa]').count();
    await pb.reload(); await sc(pb, 'titolo'); await pb.getByRole('button', { name: 'Riprendi' }).click(); await pb.waitForTimeout(1000);
    v.b = await quale(pb); v.vecchi = ((await pb.evaluate(() => document.body.innerText)).match(VECCHI) ?? []).length; v.ok = !v.erroreImporta && v.b.scena === 'chiamata' && !!v.b.chiamata && !v.vecchi;
  } catch (e) { v.errore = e.message.slice(0, 200); v.ok = false; }
  vecchi.push(v); console.log(`vecchio ${f}: ${v.ok ? 'ok' : 'NO'} ${JSON.stringify(v.b ?? v.errore)}`);
}
await b.close(); Bs.srv.close();
writeFileSync(OUT, JSON.stringify({ ris, vecchi, errA, errB }, null, 1));
console.log(`ripresi ${ris.filter((r) => r.ok).length}/${ris.length}; errori di console 0.19.0 ${errA.length}, 0.20.0 ${errB.length}${errB.length ? '\n  ' + [...new Set(errB)].join('\n  ') : ''}`);
