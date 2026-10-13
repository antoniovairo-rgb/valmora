// Sonda C-017 (affidabilità nel browser), build in dist/, Chromium headless a 360×760.
//  A1 tempo di caricamento (fino al titolo visibile e alla mappa pronta in sala), CPU 1× e 4×, 5 prove;
//  A2 episodio perso (e01, partita casuale c17:e01:casuale:3, per cui la logica propone l'ondata 2): «Riparti dall'ondata N»; poi ricarica sul verbale, tasto
//     indietro sul verbale → che cosa resta della ripartenza;
//  A3 «Riparti» → si riparte davvero dall'ondata N (scena e salvataggio);
//  A4 ricarica a metà ondata (sulla risposta, sulla chiamata, sul rapporto) e tasto indietro in chiamata;
//  A5 esporta → cancella → importa: stesso salvataggio;
//  A6 caso più lento del calcolo di «Riparti» (e02, partita casuale c17:e02:casuale:45): tempo dal rapporto
//     finale al verbale, CPU 1× e 4×;
//  A7 fotogrammi della mappa animata nella chiamata (con dinamica) a 360 e 412, CPU 1× e 4×, 3 prove;
//  errori di console in tutto il giro.
// Uso: node coordination/sonde/c17-affidabilita.mjs <radice con dist/>
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdtempSync } from 'node:fs'; import { join, extname, resolve } from 'node:path'; import { tmpdir } from 'node:os';
const R = resolve(process.argv[2] ?? '.');
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { ondataVincibile } = await import(`${R}/src/logica/ripartenza.ts`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d]));
const v0 = Object.fromEntries([...dich.values()].map((d) => [d.id, d.iniziale]));
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const errori = []; const out = (x) => console.log(x);
const stat = (xs) => { const o = [...xs].sort((a, c) => a - c); const media = o.reduce((a, c) => a + c, 0) / o.length; return `media ${media.toFixed(0)} mediana ${o[o.length >> 1].toFixed(0)} min ${o[0].toFixed(0)} max ${o.at(-1).toFixed(0)} dispersione ${Math.sqrt(o.reduce((a, c) => a + (c - media) ** 2, 0) / o.length).toFixed(0)} (n=${o.length})`; };
const sc = (p, n, t = 15000) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: t });
const quale = (p) => p.evaluate(() => document.querySelector('.scena')?.dataset.scena);
const salvato = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('valmora-salvataggio') ?? 'null'));
async function pagina(w = 360, h = 760, ridotto = true) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, reducedMotion: ridotto ? 'reduce' : 'no-preference', acceptDownloads: true });
  const p = await ctx.newPage(); p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text().slice(0, 160)); }); p.on('pageerror', (e) => errori.push(e.message.slice(0, 160)));
  await p.goto(URL); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('valmora-guida-vista', 'si'); }); await p.reload(); await sc(p, 'titolo'); return p;
}
const cpu = async (p, rate) => { const c = await p.context().newCDPSession(p); await c.send('Emulation.setCPUThrottlingRate', { rate }); };
const piano = (m, g, v = v0) => { let s = M.iniziaMissione(m, v, dich); const ond = [];
  while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = []; for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); rs.push([c.id, o]); s = M.rispondi(m, s, c.id, o, dich); } ond.push({ d, rs }); s = M.chiudiOndata(m, s, dich); }
  const e = M.concludiMissione(m, s, dich); return { ond, esito: e.esito, n: e.esito.fallita ? ondataVincibile(m, e, s, dich) : null }; };
async function schiera(p, d) { for (const [r, ps] of Object.entries(d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`); } }
async function finoAllOndata(p) { await sc(p, 'sala'); while (await p.locator('[data-azione="passo"]').count()) await p.click('[data-azione="passo"]'); await p.click('[data-azione="avanti"]'); await sc(p, 'briefing');
  while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) await p.click('[data-azione="prossimo"], [data-azione="passo"]'); await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento'); }
async function nuova(p) { await p.getByRole('button', { name: 'Nuova partita' }).click(); await sc(p, 'genere'); await p.click('[data-genere="m"]'); await sc(p, 'citta'); }
async function giocaOndata(p, o, fermati) { // fermati(fase, i) → true = esci lasciando la partita lì
  await schiera(p, o.d); await p.click('[data-azione="conferma"]'); if (await p.locator('[data-azione="conferma-davvero"]').count()) await p.click('[data-azione="conferma-davvero"]');
  for (const [i, [, op]] of o.rs.entries()) { await sc(p, 'chiamata'); if (fermati && await fermati('chiamata', i)) return false; await p.click(`[data-opzione="${op}"]`); await p.waitForTimeout(200);
    if (await p.locator('[data-azione="continua"]').count()) { if (fermati && await fermati('risposta', i)) return false; await p.click('[data-azione="continua"]'); } }
  await sc(p, 'chiusura'); await p.click('[data-azione="rapporto"]'); await sc(p, 'rapporto'); return true; }
async function alVerbale(p) { await sc(p, 'verbale', 30000); while (await p.locator('[data-azione="passo"]').count()) await p.click('[data-azione="passo"]'); }

// A1 (SALTA_A1=1 la salta)
if (!process.env.SALTA_A1) { for (const rate of [1, 4]) { const tit = [], map = [];
  for (let i = 0; i < 5; i++) { const ctx = await b.newContext({ viewport: { width: 360, height: 760 } }); const p = await ctx.newPage(); await cpu(p, rate);
    const t0 = Date.now(); await p.goto(URL); await sc(p, 'titolo', 60000); tit.push(Date.now() - t0);
    await p.evaluate(() => localStorage.setItem('valmora-guida-vista', 'si')); await nuova(p); const t1 = Date.now(); await p.click('[data-azione="avvia-episodio"]');
    await p.waitForFunction(() => document.querySelector('.mappa')?.dataset.pronta === 'si', null, { timeout: 60000 }); map.push(Date.now() - t1); await ctx.close(); }
  out(`A1 CPU ${rate}×: titolo visibile ms ${stat(tit)}; sala con mappa pronta ms ${stat(map)}`); } }

// A2 + A3
{ const m = dati['missioni/e01.json']; const pl = piano(m, B.casuale(creaCaso('c17:e01:casuale:3'), dich)); out(`A2 piano casuale e01 seme 3: esito ${pl.esito.id}, logica propone ondata ${pl.n}`);
  const p = await pagina(); await nuova(p); await p.click('[data-azione="avvia-episodio"]'); await finoAllOndata(p);
  for (const [i, o] of pl.ond.entries()) { if (i) await sc(p, 'schieramento'); await giocaOndata(p, o); await p.click('[data-azione="avanti"]'); }
  await alVerbale(p); const rip = await p.getAttribute('[data-azione="riparti"]', 'data-ondata').catch(() => null);
  const avviso = await p.textContent('[data-fallita]').catch(() => null);
  out(`A2 verbale: riparti=${rip ?? 'assente'} · «${avviso}» · in_corso nel salvataggio: ${JSON.stringify((await salvato(p)).in_corso)}`);
  await p.reload(); await sc(p, 'titolo'); out(`A2 ricarica sul verbale → scena «${await quale(p)}»`);
  await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForTimeout(600); out(`A2 … poi «Riprendi» → scena «${await quale(p)}», riparti visibile: ${await p.locator('[data-azione="riparti"]').count()}`);
  // stesso giro col tasto indietro
  const p2 = await pagina(); await nuova(p2); await p2.click('[data-azione="avvia-episodio"]'); await finoAllOndata(p2);
  for (const [i, o] of pl.ond.entries()) { if (i) await sc(p2, 'schieramento'); await giocaOndata(p2, o); await p2.click('[data-azione="avanti"]'); }
  await alVerbale(p2); await p2.goBack(); await p2.waitForTimeout(600); out(`A2 tasto indietro sul verbale → scena «${await quale(p2)}»`);
  if (await p2.getByRole('button', { name: 'Riprendi' }).count()) { await p2.getByRole('button', { name: 'Riprendi' }).click(); await p2.waitForTimeout(600); }
  out(`A2 … poi «Riprendi» → scena «${await quale(p2)}», riparti visibile: ${await p2.locator('[data-azione="riparti"]').count()}`);
  // A3
  const p3 = await pagina(); await nuova(p3); await p3.click('[data-azione="avvia-episodio"]'); await finoAllOndata(p3);
  for (const [i, o] of pl.ond.entries()) { if (i) await sc(p3, 'schieramento'); await giocaOndata(p3, o); await p3.click('[data-azione="avanti"]'); }
  await sc(p3, 'verbale', 30000); const tens = (await salvato(p3)); await p3.click('[data-azione="riparti"]'); await p3.waitForTimeout(600);
  const s3 = await salvato(p3); out(`A3 «Riparti» → scena «${await quale(p3)}», ondata salvata ${s3.in_corso?.ondata}, testata «${await p3.textContent('.testata, header').catch(() => '?')}», tentativi e01 ${tens.episodi.e01?.tentativi}`);
  // A3b: rigiocata dall'ondata N col bot attento: si vince?
  if (s3.in_corso) { const st = s3.in_corso; const g = B.attenta(creaCaso(1), dich); let s = st; while (!M.missioneFinita(m, s)) { s = M.schiera(m, s, g.schiera(m, s)); for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) s = M.rispondi(m, s, c.id, g.scegli(m, s, c), dich); s = M.chiudiOndata(m, s, dich); }
    out(`A3 dallo stato salvato dopo «Riparti», bot attento: ${M.concludiMissione(m, s, dich).esito.id}`); }
  await p.context().close(); await p2.context().close(); await p3.context().close(); }

// A4
{ const m = dati['missioni/e01.json']; const pl = piano(m, B.attenta(creaCaso(1), dich));
  const p = await pagina(); await nuova(p); await p.click('[data-azione="avvia-episodio"]'); await finoAllOndata(p);
  let id1 = null;
  await giocaOndata(p, pl.ond[0], async (fase, i) => { if (fase === 'risposta' && i === 0) return true; return false; });
  const prima = await salvato(p); await p.reload(); await sc(p, 'titolo'); await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForTimeout(500);
  id1 = await p.getAttribute('[data-messaggio^="chiamata-"]', 'data-messaggio').catch(() => null);
  out(`A4 ricarica sulla risposta alla chiamata 1 → «Riprendi» → scena «${await quale(p)}» ${id1 ?? ''}; risposte salvate ${JSON.stringify(prima.in_corso.risposte)}`);
  await p.goBack(); await p.waitForTimeout(500); out(`A4 tasto indietro in chiamata → scena «${await quale(p)}»`);
  await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForTimeout(500);
  out(`A4 … «Riprendi» → scena «${await quale(p)}» ${await p.getAttribute('[data-messaggio^="chiamata-"]', 'data-messaggio').catch(() => '')}`);
  // finisci l'ondata 1 e ricarica sul rapporto
  for (const [, op] of pl.ond[0].rs.slice(1)) { await sc(p, 'chiamata'); await p.click(`[data-opzione="${op}"]`); await p.waitForTimeout(200); if (await p.locator('[data-azione="continua"]').count()) await p.click('[data-azione="continua"]'); }
  await sc(p, 'chiusura'); await p.click('[data-azione="rapporto"]'); await sc(p, 'rapporto'); await p.reload(); await sc(p, 'titolo'); await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForTimeout(500);
  out(`A4 ricarica sul rapporto → «Riprendi» → scena «${await quale(p)}»`);
  // ricarica a metà schieramento (unità piazzate ma non confermate)
  await p.click('[data-azione="avanti"]'); await sc(p, 'schieramento'); await schiera(p, pl.ond[1].d); const piazzate = await p.locator('[data-presenza]').count();
  await p.reload(); await sc(p, 'titolo'); await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'schieramento');
  out(`A4 ricarica a schieramento non confermato: pastiglie prima ${piazzate}, dopo ${await p.locator('[data-presenza]').count()}`);
  // A5 export/import
  await p.click('[data-azione="home"]'); await sc(p, 'titolo');
  const dir = mkdtempSync(join(tmpdir(), 'c17-')); const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-azione="esporta"]')]); const file = join(dir, dl.suggestedFilename()); await dl.saveAs(file);
  const prima5 = await salvato(p); await p.evaluate(() => localStorage.clear()); await p.reload(); await sc(p, 'titolo');
  await p.setInputFiles('input[data-importa]', file); await p.waitForTimeout(500); while (await p.locator('[data-azione="si-importa"]').count()) await p.click('[data-azione="si-importa"]');
  const dopo5 = await salvato(p); out(`A5 esporta (${dl.suggestedFilename()}) → cancella → importa: uguale ${JSON.stringify(prima5) === JSON.stringify(dopo5)}; «Riprendi» presente ${await p.getByRole('button', { name: 'Riprendi' }).count()}`);
  if (await p.getByRole('button', { name: 'Riprendi' }).count()) { await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForTimeout(500); out(`A5 … «Riprendi» → scena «${await quale(p)}»`); }
  await p.context().close(); }

// A6
{ const e2 = dati['missioni/e02.json']; const pl = piano(e2, B.casuale(creaCaso('c17:e02:casuale:45'), dich)); out(`A6 piano e02 seme 45: esito ${pl.esito.id}, logica propone ondata ${pl.n}`);
  for (const rate of [1, 4]) {
    const p = await pagina(); await nuova(p);
    await p.evaluate((v) => { const s = JSON.parse(localStorage.getItem('valmora-salvataggio')); s.episodi = { e01: { migliore: { esito: 'contenuto', fallita: false, stelle: 3 }, tentativi: 1, variabili_prima: v, variabili_dopo: v } }; s.missioni_concluse = ['e01']; localStorage.setItem('valmora-salvataggio', JSON.stringify(s)); }, v0);
    await p.reload(); await sc(p, 'titolo'); await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta');
    const sc2 = await p.evaluate(() => document.querySelector('[data-azione="avvia-episodio"]')?.closest('[data-episodio]')?.dataset.episodio ?? '?');
    await p.click('[data-azione="avvia-episodio"]'); await finoAllOndata(p);
    for (const [i, o] of pl.ond.entries()) { if (i) await sc(p, 'schieramento'); await giocaOndata(p, o); if (i < pl.ond.length - 1) await p.click('[data-azione="avanti"]'); }
    await cpu(p, rate); const t0 = Date.now(); await p.click('[data-azione="avanti"]'); await sc(p, 'verbale', 60000); const dt = Date.now() - t0;
    await cpu(p, 1); while (await p.locator('[data-azione="passo"]').count()) await p.click('[data-azione="passo"]');
    out(`A6 CPU ${rate}× (episodio ${sc2}): dal tocco «Avanti» sull'ultimo rapporto al verbale ${dt} ms; riparti ${await p.getAttribute('[data-azione="riparti"]', 'data-ondata').catch(() => 'assente')}`);
    await p.context().close(); } }

// A7
{ const m = dati['missioni/e01.json']; const pl = piano(m, B.attenta(creaCaso(1), dich));
  for (const [w, h] of [[360, 760], [412, 915]]) for (const rate of [1, 4]) { const f = [];
    for (let i = 0; i < 3; i++) { const p = await pagina(w, h, false); await nuova(p); await p.click('[data-azione="avvia-episodio"]'); await finoAllOndata(p);
      await schiera(p, pl.ond[0].d); await p.click('[data-azione="conferma"]'); if (await p.locator('[data-azione="conferma-davvero"]').count()) await p.click('[data-azione="conferma-davvero"]');
      await sc(p, 'chiamata'); await p.waitForTimeout(800); await cpu(p, rate); await p.waitForTimeout(300);
      f.push(await p.evaluate(() => new Promise((ok) => { let n = 0; const t0 = performance.now(); const g = () => { n++; if (performance.now() - t0 < 4000) requestAnimationFrame(g); else ok(n * 1000 / (performance.now() - t0)); }; requestAnimationFrame(g); })));
      if (!i) out(`A7 ${w}px mappa: dinamica «${await p.getAttribute('.mappa', 'data-dinamica')}», pulsa «${await p.getAttribute('.mappa', 'data-lampeggianti')}», webgl «${await p.getAttribute('.mappa', 'data-mappa')}»`);
      await p.context().close(); }
    out(`A7 ${w}px CPU ${rate}× fotogrammi/s in chiamata (headless, SwiftShader): ${stat(f)}`); } }

out(`errori di console in tutto il giro: ${errori.length}`); for (const e of [...new Set(errori)].slice(0, 15)) out(`  ${e}`);
await b.close(); srv.close();
