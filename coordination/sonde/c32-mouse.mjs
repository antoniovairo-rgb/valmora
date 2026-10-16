// Sonda C-032: copia di c28-mouse.mjs; in più «accesaColore»: l'opzione sotto il puntatore fermo ha davvero lo sfondo
// dell'evidenza (--ciano), non solo lo stato :hover (che con la correzione C28-02 resta vero ma non si vede).
// Sonda C-028 (sola lettura): MOUSE su PC (PO-114). Gioca gli episodi EP col piano del bot attento (seme 1) a W×H col mouse e,
// su ogni tipo di schermata (la prima volta che compare), per ogni comando visibile (attivo o disattivato):
//  - cursore (computed cursor) e cambiamento di aspetto sotto il puntatore (:hover): confronta background, colore, ombra,
//    trasformazione, contorno, bordo, filtro, opacità dell'elemento, del primo figlio e del suo ::after prima e dopo mouse.move;
//  - nel primo schieramento: trascinamento di un'unità sulla mappa col mouse (giù, 12 passi, su) e verifica della pastiglia;
//  - nella prima chiamata: rotella sopra la mappa e sopra il testo, quanto scorre la pagina.
// Uso: W=1366 H=768 EP=e01,e19 node coordination/sonde/c28-mouse.mjs <radice con dist/> <foto> <uscita.json>
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c28'; const OUT = process.argv[4] ?? 'c28-mouse.json';
mkdirSync(DIR, { recursive: true });
const W = Number(process.env.W ?? 1366); const H = Number(process.env.H ?? 768);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const M = await import(`${R}/src/logica/missione.ts`); const B = await import(`${R}/src/logica/bot.ts`); const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const { missioniDai, salvataggioTutti } = await import(`${R}/tools/foto-bozze.mjs`);
const dati = leggiDati(join(R, 'data')); const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const { missioni, v0 } = missioniDai(join(R, 'data'));
const EP = (process.env.EP ?? 'e01').split(',');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u); if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok)); const URL = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const sc = (p, n) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, n, { timeout: 15000 });
const piano = (m) => { const g = B.attenta(creaCaso(1), dich); let s = M.iniziaMissione(m, v0, dich); const ond = [];
  while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = []; for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); rs.push([c.id, o]); s = M.rispondi(m, s, c.id, o, dich); } ond.push({ d, rs }); s = M.chiudiOndata(m, s, dich); }
  return ond; };
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const errori = []; p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text().slice(0, 160)); }); p.on('pageerror', (e) => errori.push(e.message.slice(0, 160)));
async function schiera(d) { for (const [r, ps] of Object.entries(d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`); } }

const VISTI = new Set(); const HOVER = []; const PROVE = []; const RESIDUO = [];
const COM = 'button, [data-azione], [data-opzione], a[href], [role="button"]';
async function hover(ep, scena) {
  const tipo = scena.replace(/-.*/, ''); if (VISTI.has(tipo)) return; VISTI.add(tipo);
  await p.evaluate(() => scrollTo(0, 0)); await p.mouse.move(1, 1); await p.waitForTimeout(150);
  const n = await p.evaluate((COM) => { document.querySelectorAll('[data-c28]').forEach((e) => e.removeAttribute('data-c28')); let i = 0; for (const e of document.querySelectorAll(COM)) { const r = e.getBoundingClientRect(); if (r.width && r.height) e.setAttribute('data-c28', String(i++)); } return i; }, COM);
  const stile = (i) => p.evaluate((i) => { const e = document.querySelector(`[data-c28="${i}"]`); if (!e) return null; const P = ['backgroundColor', 'color', 'boxShadow', 'transform', 'outlineStyle', 'borderTopColor', 'filter', 'opacity', 'textDecorationLine'];
    const leggi = (cs) => P.map((k) => cs[k]).join('|'); const f = e.firstElementChild;
    return { nome: `${e.tagName}.${String(e.className?.baseVal ?? e.className).split(' ')[0]}[${e.dataset.azione ?? e.dataset.opzione ?? e.dataset.risorsa ?? e.dataset.presenza ?? e.getAttribute('aria-label') ?? e.textContent.trim().slice(0, 20)}]`,
      disabilitato: !!e.disabled, cursore: getComputedStyle(e).cursor, title: e.getAttribute('title') ?? '', s: [leggi(getComputedStyle(e)), f ? leggi(getComputedStyle(f)) : '', leggi(getComputedStyle(e, '::after'))] }; }, i);
  for (let i = 0; i < n; i++) {
    await p.locator(`[data-c28="${i}"]`).evaluate((e) => e.scrollIntoView({ block: 'center' })).catch(() => {}); await p.waitForTimeout(60);
    const a = await stile(i); if (!a) continue; const box = await p.locator(`[data-c28="${i}"]`).boundingBox(); if (!box) continue;
    await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.waitForTimeout(160); const z = await stile(i); await p.mouse.move(1, 1); await p.waitForTimeout(120);
    const cambia = z ? a.s.map((x, k) => x !== z.s[k]) : [false, false, false];
    HOVER.push({ ep, scena: tipo, nome: a.nome, disabilitato: a.disabilitato, cursore: a.cursore, title: a.title, hover: cambia.some(Boolean), dove: ['elemento', 'figlio', '::after'].filter((_, k) => cambia[k]).join('+') });
  }
}
await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload(); await sc(p, 'titolo'); await p.waitForTimeout(300); await hover('-', 'titolo');
for (const ep of EP) {
  const m = missioni.find((x) => x.id === ep); const ond = piano(m);
  try {
    await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(salvataggioTutti(missioni, v0))); await p.reload(); await sc(p, 'titolo');
    await p.getByRole('button', { name: 'Riprendi' }).click(); await sc(p, 'citta'); await p.waitForTimeout(300);
    if (await p.locator(`[data-stagione="${m.stagione}"]`).count()) await p.click(`[data-stagione="${m.stagione}"]`);
    await p.click(`[data-episodio="${ep}"] .settore-punto`); await p.waitForTimeout(300); await hover(ep, 'citta');
    await p.click('[data-azione="avvia-episodio"]'); await p.waitForTimeout(200);
    for (let k = 0; k < 3 && await p.locator('[data-azione="conferma-passo"]').count(); k++) { await hover(ep, 'tripla'); await p.click('[data-azione="conferma-passo"]'); await p.waitForTimeout(150); }
    if (await p.locator('[data-azione="conferma-rigioca"]').count()) await p.click('[data-azione="conferma-rigioca"]');
    await sc(p, 'sala'); await p.waitForTimeout(300);
    while (await p.locator('[data-azione="passo"]').count()) { await hover(ep, 'sala'); await p.click('[data-azione="passo"]'); await p.waitForTimeout(120); }
    await p.click('[data-azione="avanti"]'); await sc(p, 'briefing'); await p.waitForTimeout(250);
    while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) { await hover(ep, 'briefing'); await p.click('[data-azione="prossimo"], [data-azione="passo"]'); await p.waitForTimeout(120); }
    await p.click('[data-azione="inizia"]'); await sc(p, 'schieramento');
    for (const [i, o] of ond.entries()) {
      if (i) await sc(p, 'schieramento'); await p.waitForTimeout(200);
      if (i === 0) {
        // trascinamento col mouse: prima unità del piano sul suo primo settore
        const [r, ps] = Object.entries(o.d)[0]; const s = Object.keys(ps)[0];
        const u = await p.locator(`[data-risorsa="${r}"]`).boundingBox(); const t = await p.locator(`[data-settore="${s}"] .settore-punto`).boundingBox();
        const quanti = async () => ((await p.locator(`[data-presenza="${r}@${s}"]`).count()) ? Number((await p.locator(`[data-presenza="${r}@${s}"]`).innerText()).replace(/\D/g, '')) : 0);
        const prima = await quanti(); await p.mouse.move(u.x + u.width / 2, u.y + u.height / 2); await p.mouse.down();
        await p.mouse.move(t.x + t.width / 2, t.y + t.height / 2, { steps: 12 }); await p.screenshot({ path: `${DIR}/mouse-${W}x${H}-${ep}-trascina.png` }); await p.mouse.up(); await p.waitForTimeout(200);
        const dopo = await quanti(); PROVE.push({ ep, prova: `trascina ${r} su ${s}`, prima, dopo, ok: dopo === prima + 1 });
        if (dopo === prima + 1) { await p.click(`[data-presenza="${r}@${s}"]`); await p.waitForTimeout(150); PROVE.push({ ep, prova: 'ritiro col clic sulla pastiglia', prima: dopo, dopo: await quanti(), ok: (await quanti()) === prima }); }
        await hover(ep, 'schieramento');
      }
      await schiera(o.d); if (i === 0) { VISTI.delete('schieramento'); await hover(ep, 'schieramento-pieno'); }
      await p.click('[data-azione="conferma"]'); if (await p.locator('[data-azione="conferma-davvero"]').count()) { await hover(ep, 'riepilogo'); await p.click('[data-azione="conferma-davvero"]'); }
      for (const [j, [cid, op]] of o.rs.entries()) {
        await sc(p, 'chiamata'); await p.waitForTimeout(250);
        // opzione accesa dal solo puntatore fermo dove era l'ultimo clic (nessun movimento del mouse)
        RESIDUO.push({ ep, cid, ondata: i + 1, accesa: await p.evaluate(() => document.querySelector('.opzione:hover')?.dataset.opzione ?? null), accesaColore: await p.evaluate(() => { const o = document.querySelector('.opzione:hover'); if (!o) return null; const v = document.createElement('i'); v.style.color = 'var(--ciano)'; document.body.append(v); const c = getComputedStyle(v).color; v.remove(); return getComputedStyle(o).backgroundColor === c && !o.classList.contains('scelta') ? o.dataset.opzione : null; }), comandoSotto: await p.evaluate(() => document.querySelector('button:hover, [data-azione]:hover')?.dataset?.azione ?? null) });
        await hover(ep, 'chiamata');
        if (i === 0 && j === 0) { // rotella sopra la mappa e sopra il testo
          for (const dove of ['.mappa', '.chiamata-corpo', '.mappa', '.chiamata-corpo']) { await p.evaluate(() => scrollTo(0, 0)); const q = await p.locator(dove).first().boundingBox(); if (!q) continue; const y = Math.min(q.y + q.height / 2, H - 5);
            await p.waitForTimeout(300); await p.mouse.move(q.x + q.width / 2, y); await p.waitForTimeout(100); const sotto = await p.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? `${e.tagName}.${String(e.className?.baseVal ?? e.className).split(' ')[0]}` : ''; }, [q.x + q.width / 2, y]); for (let k = 0; k < 3; k++) { await p.mouse.wheel(0, 100); await p.waitForTimeout(150); } await p.waitForTimeout(400); PROVE.push({ ep, prova: `rotella sopra ${dove}`, sotto, scrollY: await p.evaluate(() => scrollY), alto: await p.evaluate(() => document.documentElement.scrollHeight - innerHeight) }); }
          await p.evaluate(() => scrollTo(0, 0));
        }
        await p.click(`[data-opzione="${op}"]`); await p.waitForSelector('[data-azione="continua"]', { timeout: 5000 }).catch(() => {}); await p.waitForTimeout(150);
        if (await p.locator('[data-azione="continua"]').count()) { await hover(ep, 'risposta'); await p.click('[data-azione="continua"]'); }
      }
      await sc(p, 'chiusura'); await hover(ep, 'chiusura'); await p.click('[data-azione="rapporto"]'); await sc(p, 'rapporto'); await p.waitForTimeout(200); await hover(ep, 'rapporto'); await p.click('[data-azione="avanti"]');
    }
    await sc(p, 'verbale'); await p.waitForTimeout(300);
    while (await p.locator('[data-azione="passo"]').count()) { await hover(ep, 'verbale'); await p.click('[data-azione="passo"]'); await p.waitForTimeout(120); } VISTI.delete('verbale'); await hover(ep, 'verbale-fine');
    PROVE.push({ ep, prova: 'episodio intero col mouse', ok: true }); console.log(`${ep}: finito col mouse`);
  } catch (e) { PROVE.push({ ep, prova: 'episodio intero col mouse', ok: false, errore: e.message.slice(0, 200) }); console.log(`${ep}: BLOCCO ${e.message.slice(0, 160)}`); }
}
await b.close(); srv.close();
writeFileSync(OUT, JSON.stringify({ W, H, HOVER, PROVE, RESIDUO, errori }));
console.log(`chiamate ${RESIDUO.length}: col colore dell'evidenza (azzurro) sotto il puntatore fermo ${RESIDUO.filter((r) => r.accesaColore).length}`);
console.log(`chiamate ${RESIDUO.length}: con un'opzione già accesa sotto il puntatore fermo ${RESIDUO.filter((r) => r.accesa).length} (${[...new Set(RESIDUO.filter((r) => r.accesa).map((r) => r.accesa))].slice(0, 8).join(', ')})`);
const att = HOVER.filter((h) => !h.disabilitato); const dis = HOVER.filter((h) => h.disabilitato);
console.log(`comandi attivi ${att.length}: senza :hover ${att.filter((h) => !h.hover).length}, cursore non «pointer» ${att.filter((h) => h.cursore !== 'pointer').length}`);
console.log(`comandi disattivati ${dis.length}: con cursore «pointer» ${dis.filter((h) => h.cursore === 'pointer').length}, che cambiano sotto il puntatore ${dis.filter((h) => h.hover).length}`);
console.log(PROVE.map((x) => JSON.stringify(x)).join('\n')); console.log(`errori ${errori.length}`);
