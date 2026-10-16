// Sonda C-028 (sola lettura): si gioca con la SOLA TASTIERA? Gioca gli episodi EP col piano del bot attento (seme 1) dalla
// build dist/, a una finestra W×H, usando solo Tab (avanti), Invio e Spazio. Per ogni azione cerca il comando premendo Tab
// fino a 250 volte; se non lo raggiunge, l'azione è «irraggiungibile» e la sonda si ferma su quell'episodio.
// A ogni fermata del fuoco registra: elemento, contorno del fuoco (outline/box-shadow), se il fuoco è dentro la finestra e se
// il centro dell'elemento è coperto (barra fissa); dopo ogni azione, dove resta il fuoco (perso = body o elemento rimosso).
// Invio per i pulsanti, SPAZIO per le opzioni delle chiamate e per le unità (le due vie di attivazione di un <button>).
// In ogni primo schieramento prova anche il ritiro di un'unità dalla pastiglia col tasto (PO-054).
// Uso: W=1366 H=768 EP=e01,e19 node coordination/sonde/c28-tastiera.mjs <radice con dist/> <foto> <uscita.json>
import { createServer } from 'node:http'; import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'; import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const DIR = process.argv[3] ?? 'docs/foto/c28'; const OUT = process.argv[4] ?? 'c28-tastiera.json';
mkdirSync(DIR, { recursive: true });
const W = Number(process.env.W ?? 1366); const H = Number(process.env.H ?? 768); const FOTO = process.env.FOTO !== '0';
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
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
const errori = []; p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text().slice(0, 160)); }); p.on('pageerror', (e) => errori.push(e.message.slice(0, 160)));

// stato del fuoco adesso
const fuoco = () => p.evaluate(() => {
  const a = document.activeElement; if (!a || a === document.body) return { dove: 'body' };
  const r = a.getBoundingClientRect(); const cs = getComputedStyle(a);
  const nome = `${a.tagName}.${String(a.className?.baseVal ?? a.className).split(' ')[0]}[${a.dataset.azione ?? a.dataset.opzione ?? a.dataset.risorsa ?? a.dataset.presenza ?? a.getAttribute('aria-label') ?? a.textContent.trim().slice(0, 24)}]`;
  const contorno = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) ? `outline ${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}` : '';
  const dentro = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2; const top = dentro ? document.elementFromPoint(Math.min(Math.max(cx, 0), innerWidth - 1), Math.min(Math.max(cy, 0), innerHeight - 1)) : null;
  const coperto = dentro && top && !(a.contains(top) || top.contains(a)) ? `${top.tagName}.${String(top.className?.baseVal ?? top.className).split(' ')[0]}` : '';
  // contorno tagliato da un antenato con overflow nascosto (la mappa)
  let tagliato = ''; for (let x = a.parentElement; x && x !== document.body; x = x.parentElement) { const c = getComputedStyle(x); if (/hidden|clip/.test(c.overflow)) { const q = x.getBoundingClientRect(); const off = parseFloat(cs.outlineOffset) + parseFloat(cs.outlineWidth); if (r.left - off < q.left || r.right + off > q.right || r.top - off < q.top || r.bottom + off > q.bottom) tagliato = `${x.tagName}.${String(x.className).split(' ')[0]}`; break; } }
  return { dove: nome, contorno, ombra: cs.boxShadow !== 'none' ? cs.boxShadow.slice(0, 40) : '', fv: a.matches(':focus-visible'), dentro, coperto, tagliato, disabilitato: !!a.disabled, nascosto: a.closest('[aria-hidden="true"]') ? 'aria-hidden' : '' };
});
const FERMATE = new Map(); // elemento → stato del fuoco (una volta per tipo)
const AZ = []; let ep = '-', fase = '-';
async function premi(sel, tasto = 'Enter') {
  for (let n = 0; n <= 250; n++) {
    const ok = await p.evaluate((s) => { const a = document.activeElement; return !!a && a !== document.body && (s === 'RIPRENDI' ? a.tagName === 'BUTTON' && a.textContent.trim() === 'Riprendi' : a.matches(s)); }, sel);
    if (ok) { const f = await fuoco(); AZ.push({ ep, fase, sel, tab: n, tasto, ...f }); await p.keyboard.press(tasto); await p.waitForTimeout(120);
      const dopo = await p.evaluate(() => document.activeElement === document.body || !document.activeElement ? 'body' : `${document.activeElement.tagName}.${String(document.activeElement.className).split(' ')[0]}`);
      AZ.at(-1).fuocoDopo = dopo; return n; }
    await p.keyboard.press('Tab'); await p.waitForTimeout(15);
    const f = await fuoco(); const k = f.dove.replace(/\[.*\]/, '') + (f.dove.match(/\[(.*)\]/)?.[1]?.startsWith('ritira') ? '[ritira]' : '');
    if (!FERMATE.has(k)) FERMATE.set(k, { ...f, primo: `${ep} ${fase}` });
  }
  throw new Error(`irraggiungibile: ${sel} (${ep} ${fase})`);
}
const ESITI = [];
await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload(); await sc(p, 'titolo'); await p.waitForTimeout(300);
for (const e of EP) {
  ep = e; const m = missioni.find((x) => x.id === e); const ond = piano(m); const t0 = AZ.length;
  try {
    await p.evaluate((v) => localStorage.setItem('valmora-salvataggio', v), JSON.stringify(salvataggioTutti(missioni, v0))); await p.reload(); await sc(p, 'titolo');
    fase = 'titolo'; await premi('RIPRENDI'); await sc(p, 'citta'); await p.waitForTimeout(300);
    fase = 'citta'; if (await p.locator(`[data-stagione="${m.stagione}"]`).count()) await premi(`[data-stagione="${m.stagione}"]`);
    await premi(`[data-episodio="${e}"] .settore-punto`); await p.waitForTimeout(200);
    if (FOTO && e === EP[0]) await p.screenshot({ path: `${DIR}/tastiera-${W}x${H}-${e}-citta.png` });
    await premi('[data-azione="avvia-episodio"]');
    for (let k = 0; k < 3 && await p.locator('[data-azione="conferma-passo"]').count(); k++) await premi('[data-azione="conferma-passo"]');
    if (await p.locator('[data-azione="conferma-rigioca"]').count()) await premi('[data-azione="conferma-rigioca"]');
    await sc(p, 'sala'); fase = 'sala'; while (await p.locator('[data-azione="passo"]').count()) await premi('[data-azione="passo"]');
    await premi('[data-azione="avanti"]'); await sc(p, 'briefing'); fase = 'briefing';
    while (await p.locator('[data-azione="prossimo"], [data-azione="passo"]').count()) await premi('[data-azione="prossimo"], [data-azione="passo"]');
    await premi('[data-azione="inizia"]'); await sc(p, 'schieramento');
    for (const [i, o] of ond.entries()) {
      if (i) await sc(p, 'schieramento'); await p.waitForTimeout(200); fase = `schieramento-${i + 1}`;
      let ritiro = i > 0;
      for (const [r, ps] of Object.entries(o.d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) {
        if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await premi(`[data-risorsa="${r}"]`, ' ');
        await premi(`[data-settore="${s}"] .settore-punto`);
        if (!ritiro) { ritiro = true; const sel = `[data-presenza="${r}@${s}"]`; const quanti = async () => ((await p.locator(sel).count()) ? Number((await p.locator(sel).innerText()).replace(/\D/g, '')) : 0); const prima = await quanti();
          if (FOTO && e === EP[0]) await p.screenshot({ path: `${DIR}/tastiera-${W}x${H}-${e}-prima-del-ritiro.png` });
          await premi(sel); const dopo = await quanti();
          ESITI.push({ ep: e, prova: 'ritiro dalla pastiglia', sel, prima, dopo, ok: dopo === prima - 1 });
          if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await premi(`[data-risorsa="${r}"]`, ' ');
          await premi(`[data-settore="${s}"] .settore-punto`); }
      }
      if (FOTO && e === EP[0] && i === 0) { await premi('[data-azione="conferma"]', 'Shift'); await p.screenshot({ path: `${DIR}/tastiera-${W}x${H}-${e}-fuoco-conferma.png` }); }
      await premi('[data-azione="conferma"]'); if (await p.locator('[data-azione="conferma-davvero"]').count()) await premi('[data-azione="conferma-davvero"]');
      for (const [cid, op] of o.rs) {
        await sc(p, 'chiamata'); await p.waitForTimeout(250); fase = `chiamata-${cid}`;
        await premi(`[data-opzione="${op}"]`, ' '); await p.waitForSelector('[data-azione="continua"]', { timeout: 5000 }).catch(() => {});
        if (await p.locator('[data-azione="continua"]').count()) await premi('[data-azione="continua"]');
      }
      await sc(p, 'chiusura'); fase = `chiusura-${i + 1}`; await premi('[data-azione="rapporto"]'); await sc(p, 'rapporto'); fase = `rapporto-${i + 1}`; await premi('[data-azione="avanti"]');
    }
    await sc(p, 'verbale'); fase = 'verbale'; while (await p.locator('[data-azione="passo"]').count()) await premi('[data-azione="passo"]');
    ESITI.push({ ep: e, prova: 'episodio intero', ok: true, azioni: AZ.length - t0, tab: AZ.slice(t0).reduce((a, x) => a + x.tab, 0) });
    console.log(`${e}: finito con la tastiera, ${AZ.length - t0} azioni, ${AZ.slice(t0).reduce((a, x) => a + x.tab, 0)} Tab`);
  } catch (x) { ESITI.push({ ep: e, prova: 'episodio intero', ok: false, errore: x.message.slice(0, 200) }); await p.screenshot({ path: `${DIR}/tastiera-${W}x${H}-${e}-blocco.png` }); console.log(`${e}: BLOCCO ${x.message.slice(0, 160)}`); }
}
await b.close(); srv.close();
writeFileSync(OUT, JSON.stringify({ W, H, ESITI, FERMATE: [...FERMATE.entries()], AZ, errori }));
const senza = [...FERMATE.entries()].filter(([, f]) => f.dove !== 'body' && !f.contorno && !f.disabilitato);
console.log(`fermate diverse ${FERMATE.size}; senza contorno visibile ${senza.length}: ${senza.map(([k]) => k).join(', ')}`);
console.log(`azioni ${AZ.length}; fuoco coperto ${AZ.filter((a) => a.coperto).length}; fuori finestra ${AZ.filter((a) => !a.dentro).length}; contorno tagliato ${AZ.filter((a) => a.tagliato).length}; fuoco perso dopo l'azione ${AZ.filter((a) => a.fuocoDopo === 'body').length}; errori ${errori.length}`);
