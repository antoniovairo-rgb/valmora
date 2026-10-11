// Sonda C-03: collaudo della resa v2 nel browser (Chromium di /opt/pw-browsers), in sola lettura.
// Uso: node coordination/handoffs/collaudatrice/sonde/c03-resa.mjs <radice del ramo resa> <cartella foto> [partite per larghezza]
// La radice deve avere dist/ (npx vite build) e node_modules: motore, dati e playwright vengono da lì.
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
const R = resolve(process.argv[2] ?? '.'); const FOTO = resolve(process.argv[3] ?? 'out/c03'); const PARTITE = Number(process.argv[4] ?? 3);
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { leggiDati } = await import(`${R}/tools/dati-disco.mjs`);
const { variabiliIniziali } = await import(`${R}/src/logica/condizioni.ts`);
const M = await import(`${R}/src/logica/missione.ts`);
const { attenta, casuale, peggiore } = await import(`${R}/src/logica/bot.ts`);
const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
mkdirSync(FOTO, { recursive: true });
const dati = leggiDati(join(R, 'data')); const m = dati['missioni/e01.json'];
const dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])); const v0 = variabiliIniziali(dich.values());
const TIPI = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const srv = createServer((q, r) => { const u = decodeURIComponent((q.url ?? '/').split('?')[0]); const p = join(R, 'dist', u === '/' ? 'index.html' : u);
  if (!existsSync(p)) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': TIPI[extname(p)] ?? 'application/octet-stream' }); r.end(readFileSync(p)); });
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const URL = `http://127.0.0.1:${srv.address().port}/`;
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const righe = []; const riga = (id, larg, cosa, esito) => { righe.push({ id, larg, cosa, esito }); console.log(`${id} · ${larg}px · ${cosa} → ${esito}`); };

// Piano di una partita dal motore: schieramenti, risposte ed esito atteso.
function piano(g) {
  let s = M.iniziaMissione(m, v0, dich); const ondate = [];
  while (!M.missioneFinita(m, s)) { const d = g.schiera(m, s); s = M.schiera(m, s, d); const rs = [];
    for (let c = M.chiamateAperte(m, s)[0]; c; c = M.chiamateAperte(m, s)[0]) { const o = g.scegli(m, s, c); rs.push([c.id, o]); s = M.rispondi(m, s, c.id, o, dich); }
    ondate.push({ d, rs }); s = M.chiudiOndata(m, s, dich); }
  return { ondate, esito: M.concludiMissione(m, s, dich).esito };
}

async function nuovaPagina(larg, ridotto) {
  const p = await browser.newPage({ viewport: { width: larg, height: 760 }, reducedMotion: ridotto ? 'reduce' : 'no-preference', hasTouch: true });
  const errori = []; p.on('console', (x) => { if (x.type() === 'error' || x.type() === 'warning') errori.push(`${x.type()}: ${x.text()}`); }); p.on('pageerror', (e) => errori.push(`pageerror: ${e.message}`));
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
  return { p, errori };
}
const scena = (p, nome) => p.waitForFunction((n) => { const s = document.querySelectorAll('.scena'); return s.length === 1 && s[0].dataset.scena === n && getComputedStyle(s[0]).opacity === '1'; }, nome, { timeout: 8000 });
const quale = (p) => p.evaluate(() => document.querySelector('.scena')?.dataset.scena);
const salvato = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('valmora-salvataggio') ?? 'null'));
// Controlli di ogni schermata: scorrimento orizzontale, testo tagliato, caratteri piccoli, bersagli piccoli, cifre fuori posto.
async function controlla(p, larg, nome, foto) {
  const r = await p.evaluate(() => {
    const vis = (e) => { const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return b.width > 0 && b.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
    const testi = [...document.querySelectorAll('main *')].filter((e) => vis(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()));
    const minFont = Math.min(...testi.map((e) => parseFloat(getComputedStyle(e).fontSize)));
    const piccoli = testi.filter((e) => parseFloat(getComputedStyle(e).fontSize) < 12).map((e) => `${e.className || e.tagName}:${getComputedStyle(e).fontSize}`);
    const tagliati = testi.filter((e) => e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible').map((e) => e.className || e.tagName);
    const fuori = [...document.querySelectorAll('main *')].filter(vis).filter((e) => { const b = e.getBoundingClientRect(); return b.right > innerWidth + 1 || b.left < -1; }).map((e) => e.className || e.tagName);
    const bersagli = [...document.querySelectorAll('button:not([disabled]), a')].filter(vis).map((e) => { const b = e.getBoundingClientRect(); return { n: e.getAttribute('aria-label') || e.textContent.trim().slice(0, 20) || e.className, w: Math.round(b.width), h: Math.round(b.height) }; }).filter((x) => x.w < 24 || x.h < 24);
    // cifre visibili, tolte quelle ammesse (episodio/ondata/chiamata N di M, unità, versione)
    const testo = document.querySelector('main').innerText.replace(/Episodio \d+/gi, '').replace(/ondata \d+( di \d+)?/gi, '').replace(/Chiamata \d+ di \d+/gi, '').replace(/Versione [\d.]+/g, '');
    const etichette = [...document.querySelectorAll('[data-settore] .settore-punto')].map((b) => b.getAttribute('aria-label')).join(' | ');
    return { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, minFont, piccoli: [...new Set(piccoli)], tagliati: [...new Set(tagliati)], fuori: [...new Set(fuori)].slice(0, 5), bersagli, testo, etichette };
  });
  if (foto) await p.screenshot({ path: join(FOTO, `${larg}-${foto}-${nome}.png`), fullPage: true });
  return r;
}

const larghezze = [360, 375, 412];
const sommario = {};
for (const larg of larghezze) {
  const S = (sommario[larg] = { scorrimento: [], fuori: [], tagliati: new Set(), piccoli: new Set(), bersagli: new Set(), minFont: 99, cifre: [], errori: [], esiti: [] });
  const registra = (nome, r) => { if (r.sw > r.cw) S.scorrimento.push(`${nome}: ${r.sw}>${r.cw}`); if (r.fuori.length) S.fuori.push(`${nome}: ${r.fuori.join(',')}`);
    r.tagliati.forEach((x) => S.tagliati.add(`${nome}:${x}`)); r.piccoli.forEach((x) => S.piccoli.add(`${nome}:${x}`)); r.bersagli.forEach((x) => S.bersagli.add(`${nome}:${x.n} ${x.w}×${x.h}`)); S.minFont = Math.min(S.minFont, r.minFont); };

  // C03-1 · partite complete: attento, peggiore (fallita) e casuali; movimento NON ridotto (come sul telefono).
  const giocatori = [['attento', attenta(creaCaso(1), dich)], ['peggiore', peggiore(creaCaso(1), dich)], ...Array.from({ length: PARTITE }, (_, i) => [`casuale-${i + 1}`, casuale(creaCaso(`c03:${larg}:${i}`), dich)])];
  for (const [nomeG, g] of giocatori) {
    const pl = piano(g); const { p, errori } = await nuovaPagina(larg, false); const fotoQui = nomeG === 'attento' || nomeG === 'peggiore';
    let k = 0; const passo = async () => { const n = await quale(p); const r = await controlla(p, larg, n, fotoQui ? `${nomeG}-${String(++k).padStart(2, '0')}` : null); registra(n, r); return r; };
    try {
      await scena(p, 'titolo'); await passo();
      await p.getByRole('button', { name: 'Nuova partita' }).click(); await scena(p, 'sala'); await passo();
      await p.click('[data-azione="avanti"]'); await scena(p, 'briefing'); await passo();
      while (await p.locator('[data-azione="prossimo"]').count()) { await p.click('[data-azione="prossimo"]'); await p.waitForTimeout(50); }
      await passo(); await p.click('[data-azione="inizia"]');
      for (const [i, o] of pl.ondate.entries()) {
        await scena(p, 'schieramento'); await passo();
        for (const [r, ps] of Object.entries(o.d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) {
          if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`);
          await p.click(`[data-settore="${s}"] .settore-punto`);
        }
        await passo(); await p.click('[data-azione="conferma"]');
        for (const [c, op] of o.rs) {
          await scena(p, 'chiamata'); const r = await passo();
          // nessun nuovo schieramento dopo le chiamate: niente «conferma», settori non toccabili
          if (await p.locator('[data-azione="conferma"]').count()) S.cifre.push(`ondata ${i + 1}: pulsante conferma visibile in chiamata`);
          if (await p.locator('[data-settore] .settore-punto:not([disabled])').count()) S.cifre.push(`ondata ${i + 1}: settori toccabili in chiamata`);
          await p.click(`[data-opzione="${op}"]`);
          if (m.ondate[i].chiamate.find((x) => x.id === c).opzioni.find((x) => x.id === op).risposta) { await scena(p, 'risposta'); await passo(); await p.click('[data-azione="continua"]'); }
        }
        await scena(p, 'chiusura'); await passo(); await p.click('[data-azione="rapporto"]'); await scena(p, 'rapporto');
        const r = await passo(); if (/\d/.test(r.testo.replace(/A riposo nella prossima ondata:[^\n]*/g, '').replace(/\n\d+\n/g, '\n'))) S.cifre.push(`rapporto ${i + 1}: cifre rimaste ${JSON.stringify(r.testo.replace(/A riposo nella prossima ondata:[^\n]*/g, "").match(/[^\n]*\d[^\n]*/g))}`);
        if (/\d/.test(r.etichette.replace(/\d+ (Squadre|Steward|Mediatore)/g, ''))) S.cifre.push(`rapporto ${i + 1}, etichette mappa: ${r.etichette}`);
        await p.click('[data-azione="avanti"]');
      }
      await scena(p, 'verbale'); await passo();
      const es = await p.getAttribute('[data-esito]', 'data-esito'); const sv = await salvato(p);
      S.esiti.push(`${nomeG}: resa «${es}», motore «${pl.esito.id}»${es === pl.esito.id ? '' : ' ✗'}; concluse ${JSON.stringify(sv.missioni_concluse)}, in_corso ${sv.in_corso === null ? 'null' : 'pieno'}`);
      if (pl.esito.fallita) { // D-059: dopo il fallimento si rigioca
        await p.click('text=Torna al titolo'); await scena(p, 'titolo');
        const rip = await p.getByRole('button', { name: 'Riprendi' }).count();
        if (rip) { await p.getByRole('button', { name: 'Riprendi' }).click(); }
        S.esiti.push(`${nomeG}: dopo «fallita» → Riprendi ${rip ? 'presente' : 'ASSENTE'}, scena ${await quale(p)}`);
      }
    } catch (e) { S.esiti.push(`${nomeG}: ERRORE ${e.message.split('\n')[0]} (scena ${await quale(p).catch(() => '?')})`); }
    S.errori.push(...errori.map((x) => `${nomeG}: ${x}`)); await p.close();
  }

  // C03-2 · salvataggio e ripresa a metà ondata (dopo lo schieramento, dopo 1 e 2 risposte, al rapporto, al verbale)
  {
    const pl = piano(attenta(creaCaso(1), dich)); const { p, errori } = await nuovaPagina(larg, true); const esiti = [];
    const ricarica = async (perche) => { const prima = await salvato(p); const sc = await quale(p); await p.reload(); await scena(p, 'titolo');
      const rip = await p.getByRole('button', { name: 'Riprendi' }).count(); if (rip) await p.getByRole('button', { name: 'Riprendi' }).click();
      await p.waitForTimeout(400); const dopo = await salvato(p); const sc2 = await quale(p);
      esiti.push(`${perche}: prima «${sc}», dopo «${sc2}», salvataggio ${JSON.stringify(prima) === JSON.stringify(dopo) ? 'identico' : 'CAMBIATO'}, unità sulla mappa ${await p.locator('[data-presenza]').count()}`); };
    await scena(p, 'titolo'); await p.getByRole('button', { name: 'Nuova partita' }).click(); await scena(p, 'sala'); await p.click('[data-azione="avanti"]'); await scena(p, 'briefing');
    while (await p.locator('[data-azione="prossimo"]').count()) { await p.click('[data-azione="prossimo"]'); await p.waitForTimeout(50); }
    await p.click('[data-azione="inizia"]'); await scena(p, 'schieramento');
    // schieramento a metà (bozza non confermata)
    const [r0, ps0] = Object.entries(pl.ondate[0].d).find(([, ps]) => Object.keys(ps).length); const s0 = Object.keys(ps0)[0];
    await p.click(`[data-risorsa="${r0}"]`); await p.click(`[data-settore="${s0}"] .settore-punto`); await ricarica('bozza di schieramento non confermata');
    for (const [r, ps] of Object.entries(pl.ondate[0].d)) for (const [s, q] of Object.entries(ps)) for (let x = 0; x < q; x++) { if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]`); await p.click(`[data-settore="${s}"] .settore-punto`); }
    await p.click('[data-azione="conferma"]'); await scena(p, 'chiamata'); await ricarica('dopo lo schieramento');
    const [c1, o1] = pl.ondate[0].rs[0]; await p.click(`[data-opzione="${o1}"]`); await p.waitForTimeout(300); await ricarica('sulla risposta alla 1ª chiamata');
    const [c2, o2] = pl.ondate[0].rs[1]; await scena(p, 'chiamata'); await p.click(`[data-opzione="${o2}"]`); await p.waitForTimeout(300);
    if (await p.locator('[data-azione="continua"]').count()) await p.click('[data-azione="continua"]');
    await ricarica('dopo la 2ª risposta');
    for (const [c, op] of pl.ondate[0].rs.slice(2)) { await scena(p, 'chiamata'); await p.click(`[data-opzione="${op}"]`); await p.waitForTimeout(300); if (await p.locator('[data-azione="continua"]').count()) await p.click('[data-azione="continua"]'); }
    await scena(p, 'chiusura'); await p.click('[data-azione="rapporto"]'); await scena(p, 'rapporto'); await ricarica('sul rapporto dell\'ondata 1');
    riga('C03-2', larg, 'ricarica e «Riprendi»', esiti.join(' || ')); S.errori.push(...errori.map((x) => `ripresa: ${x}`)); await p.close();
  }

  // C03-3 · doppio tocco veloce su due opzioni diverse della stessa chiamata (movimento non ridotto: la scena vecchia esce in 0,2 s)
  {
    const { p, errori } = await nuovaPagina(larg, false);
    await scena(p, 'titolo'); await p.getByRole('button', { name: 'Nuova partita' }).click(); await scena(p, 'sala'); await p.click('[data-azione="avanti"]'); await scena(p, 'briefing');
    while (await p.locator('[data-azione="prossimo"]').count()) { await p.click('[data-azione="prossimo"]'); await p.waitForTimeout(50); }
    await p.click('[data-azione="inizia"]'); await scena(p, 'schieramento'); await p.click('[data-azione="conferma"]'); await scena(p, 'chiamata');
    const c = m.ondate[0].chiamate[0]; const [a, b] = c.opzioni;
    const ra = await p.locator(`[data-opzione="${a.id}"]`).boundingBox(); const rb = await p.locator(`[data-opzione="${b.id}"]`).boundingBox();
    await p.mouse.click(ra.x + ra.width / 2, ra.y + ra.height / 2); await p.waitForTimeout(40);
    const ancora = await p.locator(`[data-opzione="${b.id}"]`).count();
    await p.mouse.click(rb.x + rb.width / 2, rb.y + rb.height / 2); await p.waitForTimeout(600);
    const sv = await salvato(p);
    riga('C03-3', larg, `tocco su «${a.id}» e dopo 40 ms su «${b.id}» (chiamata «${c.id}»)`, `opzione B ancora a schermo: ${ancora ? 'sì' : 'no'}; salvato risposte ${JSON.stringify(sv.in_corso.risposte)}, scelte ${sv.in_corso.scelte.length}, scena ${await quale(p)}`);
    S.errori.push(...errori.map((x) => `doppio tocco: ${x}`)); await p.close();
  }

  // C03-4 · «Nuova partita» con una partita in corso: chiede conferma?
  {
    const { p } = await nuovaPagina(larg, true); await scena(p, 'titolo'); await p.getByRole('button', { name: 'Nuova partita' }).click(); await scena(p, 'sala');
    await p.click('[data-azione="avanti"]'); await scena(p, 'briefing'); while (await p.locator('[data-azione="prossimo"]').count()) { await p.click('[data-azione="prossimo"]'); await p.waitForTimeout(50); }
    await p.click('[data-azione="inizia"]'); await scena(p, 'schieramento'); await p.click('[data-azione="conferma"]'); await scena(p, 'chiamata');
    const prima = await salvato(p); await p.reload(); await scena(p, 'titolo'); let dialogo = false; p.on('dialog', async (d) => { dialogo = true; await d.dismiss(); });
    await p.getByRole('button', { name: 'Nuova partita' }).click(); await p.waitForTimeout(400); const dopo = await salvato(p);
    riga('C03-4', larg, '«Nuova partita» con una missione a metà', `richiesta di conferma: ${dialogo ? 'sì' : 'no'}; in_corso prima ${prima.in_corso ? 'pieno' : 'null'}, dopo ${dopo.in_corso ? 'pieno' : 'null'}; seme ${prima.seme === dopo.seme ? 'uguale' : 'nuovo'}`);
    await p.close();
  }

  // C03-5 · link APK
  { const { p } = await nuovaPagina(larg, true); await scena(p, 'titolo'); const a = p.locator('[data-azione="apk"]');
    riga('C03-5', larg, 'link APK nel titolo', `${await a.count()} link, href ${await a.getAttribute('href').catch(() => '-')}, testo «${(await a.textContent().catch(() => '')).trim()}»`); await p.close(); }

  riga('C03-1', larg, `partite (${giocatori.length})`, S.esiti.join(' || '));
  riga('C03-1', larg, 'scorrimento orizzontale', S.scorrimento.length ? S.scorrimento.join('; ') : 'nessuno');
  riga('C03-1', larg, 'elementi oltre il bordo', S.fuori.length ? [...new Set(S.fuori)].slice(0, 6).join('; ') : 'nessuno');
  riga('C03-1', larg, 'testo tagliato (overflow nascosto)', S.tagliati.size ? [...S.tagliati].slice(0, 8).join('; ') : 'nessuno');
  riga('C03-1', larg, `carattere minimo ${S.minFont}px; sotto 12px`, S.piccoli.size ? [...S.piccoli].slice(0, 8).join('; ') : 'nessuno');
  riga('C03-1', larg, 'bersagli sotto 24×24 px', S.bersagli.size ? [...S.bersagli].slice(0, 8).join('; ') : 'nessuno');
  riga('C03-1', larg, 'D-055 cifre e schieramento dopo le chiamate', S.cifre.length ? S.cifre.slice(0, 6).join('; ') : 'nessun problema');
  riga('C03-1', larg, 'errori/avvisi di console', S.errori.length ? [...new Set(S.errori)].slice(0, 6).join('; ') : 'nessuno');
}
await browser.close(); srv.close();
