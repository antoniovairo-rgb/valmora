// Sonda C-12 · riproduce la partita 4 di e03 a 360 px (seme del piano 364) e si ferma dove la scena «risposta» non avanza.
// Uso: node coordination/handoffs/collaudatrice/sonde/c12-risposta.mjs <radice con dist/> <cartella foto>
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2]); const FOTO = resolve(process.argv[3]); mkdirSync(FOTO, { recursive: true });
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`); const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { variabiliIniziali } = await import(`${R}/src/logica/condizioni.ts`); const E = await import(`${R}/src/logica/episodi.ts`); const { SAVE_VERSION } = await import(`${R}/src/salvataggi/salvataggio.ts`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const m = dati['missioni/e03.json'];
let v = variabiliIniziali(dich.values()); let reg = {}; for (const id of ['e01', 'e02']) { const mm = dati[`missioni/${id}.json`]; const pr = v; const r = M.giocaMissione(mm, v, dich, B.equilibrata(creaCaso(1), dich)); reg = E.registra(reg, id, pr, E.valutaEpisodio(mm, r), r.variabili).registro; v = r.variabili; }
const sal = { save_version: SAVE_VERSION, game_version: 'collaudo', seme: 1, caso: 1, variabili: v, missioni_concluse: ['e01', 'e02'], episodi: reg, genere: 'm', rapporto_aperto: null, in_corso: null };
const caso = creaCaso('c12:e03:364'); const g = { schiera: B.attenta(caso, dich).schiera, scegli: B.casuale(caso, dich).scegli };
let s = M.iniziaMissione(m, v, dich); const ond = []; while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = []; for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); rs.push([c.id, o]); s = M.rispondi(m, s, c.id, o, dich); } ond.push({ d, rs }); s = M.chiudiOndata(m, s, dich); }
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 360, height: 760 }, hasTouch: true, reducedMotion: 'reduce' }); const err = []; p.on('pageerror', (e) => err.push(e.message)); p.on('console', (x) => { if (x.type() === 'error') err.push(x.text()); });
await p.goto(`http://127.0.0.1:${srv.address().port}/`); await p.evaluate((x) => { localStorage.clear(); localStorage.setItem('valmora-salvataggio', JSON.stringify(x)); }, sal); await p.reload();
const sc = (n, ms = 10000) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: ms });
const quale = () => p.evaluate(() => [...document.querySelectorAll('.scena')].map((s) => `${s.dataset.scena}(${getComputedStyle(s).opacity})`).join(','));
await sc('titolo'); await p.getByRole('button', { name: 'Riprendi' }).click(); await sc('citta'); await p.click('[data-azione="avvia-episodio"]'); await sc('sala'); await p.click('[data-azione="avanti"]'); await sc('briefing');
while (await p.locator('[data-azione="prossimo"]').count()) { await p.click('[data-azione="prossimo"]'); await p.waitForTimeout(50); } await p.click('[data-azione="inizia"]');
let passo = 0;
try {
  for (const [i, o] of ond.entries()) { await sc('schieramento');
    for (const [r, ps] of Object.entries(o.d)) for (const [k, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${k}"] .settore-punto`); }
    await p.click('[data-azione="conferma"]');
    for (const [c, op] of o.rs) { passo++; await sc('chiamata'); await p.locator(`[data-opzione="${op}"]`).scrollIntoViewIfNeeded(); await p.click(`[data-opzione="${op}"]`); await p.waitForTimeout(150);
      const dopo = await quale(); if (dopo.startsWith('risposta')) { await p.click('[data-azione="continua"]'); await p.waitForTimeout(400); const ancora = await quale(); if (ancora.includes('risposta')) { console.log(`passo ${passo} ondata ${i + 1} ${c}.${op}: dopo «continua» ancora ${ancora}`); } } }
    await sc('chiusura'); await p.click('[data-azione="rapporto"]'); await sc('rapporto'); await p.click('[data-azione="avanti"]'); }
  await sc('verbale'); console.log('arrivata al verbale');
} catch (e) { console.log(`ERRORE al passo ${passo}: ${e.message.split('\n')[0]}; scene ${await quale()}`); await p.screenshot({ path: join(FOTO, 'c12-risposta-blocco.png'), fullPage: true }); }
console.log('errori console', err); await b.close(); srv.close();
