// Sonda C-025 (sola lettura) sulla build dist/: ripresa ed export/import dopo PO-108.
//  R1 per ogni episodio di EP: a metà della prima ondata (seconda chiamata aperta) ricarico la pagina e premo
//     «Riprendi»: deve tornare la STESSA chiamata; poi esporto il file, svuoto la memoria, importo e riprendo: di nuovo
//     la stessa chiamata, e il salvataggio dopo l'importazione è uguale al file.
//  R2 i salvataggi reali vecchi di tests/salvataggi-reali/*.json importati dall'interfaccia: la partita si riprende e
//     il testo mostrato non contiene i nomi vecchi delle squadre.
// Uso: [EP=e01,e07,…] node coordination/sonde/c25-ripresa.mjs <radice con dist/> <uscita.json>
import { createServer } from 'node:http'; import { readFileSync, existsSync, readdirSync, writeFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const OUT = process.argv[3] ?? 'c25-ripresa.json';
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(R, 'data'));
const EP = (process.env.EP ?? 'e01,e04,e07,e10,e13,e16,e19,e22,e25,e28,e31,e34,e36').split(',');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 360, height: 760 }, hasTouch: true, reducedMotion: 'reduce', acceptDownloads: true });
const errori = []; p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text().slice(0, 160)); }); p.on('pageerror', (e) => errori.push(e.message.slice(0, 160)));
const sc = (n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
const quale = () => p.evaluate(() => ({ scena: document.querySelector('.scena')?.dataset.scena, chiamata: document.querySelector('[data-messaggio^="chiamata-"]')?.dataset.messaggio ?? null }));
const CH = 'valmora-salvataggio'; const leggi = () => p.evaluate((k) => localStorage.getItem(k), CH);
const VECCHI = /cinderwick|larkspire|calderholt|mossgarth|ollerbrook|quillhaven|saltmere/i;
async function schiera(d) { for (const [r, ps] of Object.entries(d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`); } }
const riprendi = async () => { await p.reload(); await sc('titolo'); await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForTimeout(900); return quale(); };

const R1 = [];
await p.goto(URL);
for (const ep of EP) {
  const m = missioni.find((x) => x.id === ep); const r = { ep };
  try {
    const g = B.attenta(creaCaso(1), dich); let s = M.iniziaMissione(m, v0, dich); const d = g.schiera(m, s); s = M.schiera(m, s, d);
    const c0 = M.chiamateAperte(m, s)[0]; const o0 = g.scegli(m, s, c0);
    await p.evaluate(([k, v]) => { localStorage.clear(); localStorage.setItem(k, v); }, [CH, JSON.stringify(salvataggioTutti(missioni, v0))]); await p.reload(); await sc('titolo');
    await p.getByRole('button', { name: 'Riprendi' }).click(); await sc('citta'); await p.waitForTimeout(300);
    if (await p.locator(`[data-stagione="${m.stagione}"]`).count()) await p.click(`[data-stagione="${m.stagione}"]`);
    await p.click(`[data-episodio="${ep}"] .settore-punto`); await p.waitForTimeout(250); await p.click('[data-azione="avvia-episodio"]'); await p.waitForTimeout(200);
    for (let k = 0; k < 3 && await p.locator('[data-azione="conferma-passo"]').count(); k++) { await p.click('[data-azione="conferma-passo"]'); await p.waitForTimeout(150); }
    if (await p.locator('[data-azione="conferma-rigioca"]').count()) await p.click('[data-azione="conferma-rigioca"]');
    await sc('sala'); while (await p.locator('[data-azione="passo"]').count()) { await p.click('[data-azione="passo"]'); await p.waitForTimeout(100); }
    await p.click('[data-azione="avanti"]'); await sc('briefing'); while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) { await p.click('[data-azione="prossimo"], [data-azione="passo"]'); await p.waitForTimeout(100); }
    await p.click('[data-azione="inizia"]'); await sc('schieramento'); await schiera(d); await p.click('[data-azione="conferma"]'); if (await p.locator('[data-azione="conferma-davvero"]').count()) await p.click('[data-azione="conferma-davvero"]');
    await sc('chiamata'); await p.click(`[data-opzione="${o0}"]`); await p.waitForSelector('[data-azione="continua"]', { timeout: 5000 }).catch(() => {}); if (await p.locator('[data-azione="continua"]').count()) await p.click('[data-azione="continua"]');
    await p.waitForTimeout(500); r.prima = await quale();
    r.dopoRicarica = await riprendi();
    await p.reload(); await sc('titolo'); const salv = await leggi();
    const [scarico] = await Promise.all([p.waitForEvent('download'), p.click('[data-azione="esporta"]')]); const file = await scarico.path(); const esportato = readFileSync(file, 'utf8');
    r.fileUgualeAlSalvataggio = JSON.stringify(JSON.parse(esportato)) === JSON.stringify(JSON.parse(salv));
    await p.evaluate(() => localStorage.clear()); await p.reload(); await sc('titolo');
    await p.setInputFiles('[data-importa]', file); await p.waitForTimeout(800);
    r.importatoUguale = JSON.stringify(JSON.parse((await leggi()) ?? 'null')) === JSON.stringify(JSON.parse(esportato));
    r.dopoImport = await riprendi();
    r.vecchiNelTesto = VECCHI.test(await p.evaluate(() => document.body.innerText));
    r.ok = r.prima.scena === 'chiamata' && r.dopoRicarica.chiamata === r.prima.chiamata && r.dopoImport.chiamata === r.prima.chiamata && r.fileUgualeAlSalvataggio && r.importatoUguale && !r.vecchiNelTesto;
  } catch (e) { r.ok = false; r.errore = e.message.slice(0, 200); }
  R1.push(r); console.log(`R1 ${ep}: ${r.ok ? 'ok' : 'NO'} ${JSON.stringify(r)}`);
}

const R2 = [];
for (const f of readdirSync(join(R, 'tests/salvataggi-reali')).filter((x) => x.endsWith('.json'))) {
  const r = { file: f };
  try {
    await p.evaluate(() => localStorage.clear()); await p.reload(); await sc('titolo');
    await p.setInputFiles('[data-importa]', join(R, 'tests/salvataggi-reali', f)); await p.waitForTimeout(800);
    r.importato = !!(await leggi()); r.errore = await p.locator('[data-errore-importa]').count();
    r.dove = await riprendi();
    // avanza fino a una schermata con la mappa (sala, briefing o chiamata) per leggere i nomi dei settori
    for (let k = 0; k < 6 && !['chiamata', 'schieramento'].includes((await quale()).scena); k++) { const a = p.locator('[data-azione="passo"], [data-azione="avanti"], [data-azione="prossimo"], [data-azione="inizia"], [data-azione="conferma-passo"], [data-azione="avvia-episodio"]'); if (!(await a.count())) break; await a.first().click(); await p.waitForTimeout(400); }
    r.fine = await quale(); const t = await p.evaluate(() => document.body.innerText); r.vecchiNelTesto = (t.match(new RegExp(VECCHI.source, 'gi')) ?? []).length; r.nuovi = [...new Set(t.match(/Kiln|Skyfield|Square|Arches|Studio|Garden|Stoneway/g) ?? [])];
    r.ok = r.importato && !r.vecchiNelTesto;
  } catch (e) { r.ok = false; r.eccezione = e.message.slice(0, 200); }
  R2.push(r); console.log(`R2 ${f}: ${r.ok ? 'ok' : 'NO'} ${JSON.stringify(r)}`);
}
await b.close(); srv.close();
writeFileSync(OUT, JSON.stringify({ R1, R2, errori }, null, 1));
console.log(`R1 ${R1.filter((x) => x.ok).length}/${R1.length}, R2 ${R2.filter((x) => x.ok).length}/${R2.length}, errori di console ${errori.length}${errori.length ? '\n  ' + [...new Set(errori)].join('\n  ') : ''}`);
