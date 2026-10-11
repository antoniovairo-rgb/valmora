// Sonda C-09: gioca la build PUBBLICATA (GitHub Pages) come un giocatore nuovo e misura gli attriti. Sola lettura.
// Uso: node coordination/handoffs/collaudatrice/sonde/c09-pubblicata.mjs <radice del commit pubblicato (dati)> <cartella foto> [larghezze]
// Il browser passa dal proxy dell'ambiente (HTTPS_PROXY). I dati del commit servono solo a leggere effetti e accenni di costo.
import { readFileSync, mkdirSync } from 'node:fs'; import { join, resolve } from 'node:path';
const R = resolve(process.argv[2]); const FOTO = resolve(process.argv[3]); const LARG = (process.argv[4] ?? '360,412').split(',').map(Number); mkdirSync(FOTO, { recursive: true });
const URL = 'https://antoniovairo-rgb.github.io/valmora/';
const { chromium } = await import(`${R}/node_modules/playwright-core/index.mjs`);
const { creaCaso } = await import(`${R}/src/logica/caso.ts`);
const mis = Object.fromEntries(['e01', 'e02'].map((id) => [id, JSON.parse(readFileSync(join(R, `data/missioni/${id}.json`), 'utf8'))]));
const opz = {}; for (const m of Object.values(mis)) for (const o of m.ondate) for (const c of o.chiamate) for (const x of c.opzioni) opz[`${m.id}:${c.id}:${x.id}`] = x;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', proxy: { server: process.env.HTTPS_PROXY } });
const out = (id, larg, cosa, esito) => console.log(`${id} · ${larg}px · ${cosa} → ${esito}`);

for (const larg of LARG) {
  const p = await b.newPage({ viewport: { width: larg, height: 760 }, hasTouch: true }); // movimento NON ridotto: come un telefono qualunque
  const err = []; p.on('pageerror', (e) => err.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') err.push(m.text()); });
  await p.goto(URL); await p.evaluate(() => localStorage.clear()); await p.reload();
  let passi = 0, k = 0; const attese = []; const muti = []; const sottoPiega = new Set(); const tagli = new Set(); const incoerenze = []; const risorse = [];
  const scena = () => p.evaluate(() => document.querySelector('.scena')?.dataset.scena ?? null);
  const stabile = () => p.waitForFunction(() => { const s = document.querySelectorAll('.scena'); return s.length === 1 && getComputedStyle(s[0]).opacity === '1'; }, null, { timeout: 15000 });
  const foto = async (n) => p.screenshot({ path: join(FOTO, `${larg}-${String(++k).padStart(3, '0')}-${n}.png`), fullPage: true });
  const controlli = async (nome) => {
    const r = await p.evaluate(() => {
      const vis = (e) => { const x = e.getBoundingClientRect(); return x.width > 0 && x.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
      const tagliati = [...document.querySelectorAll('main *')].filter((e) => vis(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflow !== 'visible').map((e) => e.className || e.tagName);
      const prim = [...document.querySelectorAll('.scena .pulsante:not(.secondario), .scena .opzione')].filter(vis)[0];
      const sotto = prim ? Math.max(0, Math.round(prim.getBoundingClientRect().bottom - innerHeight)) : null;
      return { tagliati, sotto, sw: document.documentElement.scrollWidth > document.documentElement.clientWidth };
    });
    r.tagliati.forEach((t) => tagli.add(`${nome}: ${t}`)); if (r.sotto) sottoPiega.add(`${nome}: azione principale ${r.sotto} px sotto la finestra`); if (r.sw) tagli.add(`${nome}: scorrimento orizzontale`);
  };
  // Un tocco: misura il passo, se qualcosa cambia (scena o salvataggio) e quanto tempo passa prima che la scena nuova sia ferma.
  const tocca = async (sel, nome) => {
    const prima = [await scena(), await p.evaluate(() => localStorage.getItem('valmora-salvataggio')), await p.evaluate(() => document.querySelector('.scena')?.innerText.length)];
    const t0 = Date.now(); await p.click(sel); passi++;
    try { await p.waitForFunction((pr) => { const s = document.querySelector('.scena'); return (s?.dataset.scena !== pr[0]) || localStorage.getItem('valmora-salvataggio') !== pr[1] || s?.innerText.length !== pr[2]; }, prima, { timeout: 3000 }); }
    catch { muti.push(`${nome} (${sel}) in «${prima[0]}»`); }
    await stabile(); attese.push([nome, Date.now() - t0]);
  };
  const salvato = () => p.evaluate(() => JSON.parse(localStorage.getItem('valmora-salvataggio')));
  // Giocatore nuovo: schiera a rotazione su tutti i settori (o tutto su uno, per fallire), sceglie a caso col seme.
  async function episodio(id, caso, fallisci) {
    const m = mis[id]; await stabile();
    if ((await scena()) === 'citta') { await controlli('citta'); await foto(`citta-prima-di-${id}`);
      await tocca(`[data-episodio="${id}"] .settore-punto`, 'punto episodio'); await tocca('[data-azione="avvia-episodio"]', 'avvia episodio'); }
    await controlli('sala'); await foto(`${id}-sala`);
    await tocca('[data-azione="avanti"]', 'ascolta le fonti');
    while (await p.locator('[data-azione="prossimo"]').count()) await tocca('[data-azione="prossimo"]', 'prossimo messaggio');
    await controlli('briefing'); await foto(`${id}-briefing`); await tocca('[data-azione="inizia"]', 'alla prima ondata');
    for (let n = 1; n <= m.ondate.length; n++) {
      const disp = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-risorsa]')].map((e) => [e.dataset.risorsa, Number(e.querySelector('strong')?.textContent ?? 'NaN')])));
      risorse.push(`${id} ondata ${n}: ${JSON.stringify(disp)}`);
      const settori = m.mappa.settori.map((s) => s.id); let i = 0;
      for (const [r, q] of Object.entries(disp)) for (let x = 0; x < q; x++) { const s = fallisci ? settori[0] : settori[i++ % settori.length];
        if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await tocca(`[data-risorsa="${r}"]`, 'scegli unità'); await tocca(`[data-settore="${s}"] .settore-punto`, 'metti unità'); }
      await controlli(`schieramento ${n}`); if (n === 1) await foto(`${id}-schieramento-1`); await tocca('[data-azione="conferma"]', 'conferma schieramento');
      const scelte = [];
      while ((await scena()) === 'chiamata') {
        const cid = (await p.getAttribute('[data-messaggio^="chiamata-"]', 'data-messaggio')).replace('chiamata-', '');
        const ids = await p.$$eval('[data-opzione]', (xs) => xs.map((x) => x.dataset.opzione)); const o = caso.scegli(ids);
        await controlli(`chiamata ${cid}`); if (scelte.length === 0 && n === 1) await foto(`${id}-chiamata`);
        await p.locator(`[data-opzione="${o}"]`).scrollIntoViewIfNeeded(); await tocca(`[data-opzione="${o}"]`, 'scegli opzione'); scelte.push([cid, o]);
        if ((await scena()) === 'risposta') { await controlli('risposta'); await tocca('[data-azione="continua"]', 'avanti dalla risposta'); }
      }
      await tocca('[data-azione="rapporto"]', 'leggi il rapporto'); await controlli(`rapporto ${n}`); await foto(`${id}-rapporto-${n}`);
      // accenno di costo contro rapporto: ogni tensione alzata da una scelta su un settore → colore del settore nel rapporto
      const liv = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-esito-settore]')].map((li) => [li.dataset.esitoSettore, Number((li.querySelector('.campione')?.className.match(/liv-(\d)/) ?? [])[1])])));
      const stato = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-esito-settore]')].map((li) => [li.dataset.esitoSettore, li.querySelector('strong').textContent])));
      for (const [cid, o] of scelte) { const x = opz[`${id}:${cid}:${o}`]; for (const e of x.effetti) if ('tensione' in e && e.valore > 0 && liv[e.tensione] === 0)
        incoerenze.push(`${id} ondata ${n}: «${o}» (tensione ${e.tensione} +${e.valore}, accenno «${x.costo}») → nel rapporto ${e.tensione} colore livello 0, «${stato[e.tensione]}»`); }
      await tocca('[data-azione="avanti"]', n < m.ondate.length ? 'prossima ondata' : 'leggi il verbale');
    }
    await controlli('verbale'); await foto(`${id}-verbale`);
    const esito = await p.getAttribute('[data-esito]', 'data-esito'); const st = await p.getAttribute('.scena [data-stelle]', 'data-stelle').catch(() => null);
    return { esito, st, rigioca: await p.locator('[data-azione="rigioca"]').count() };
  }
  await stabile(); await controlli('titolo'); await foto('titolo');
  await tocca('text=Nuova partita', 'nuova partita'); await tocca('[data-genere="f"]', 'scelta genere');
  const a = await episodio('e01', creaCaso(`c09:${larg}:a`), true); out('PARTITA', larg, 'e01, tutto su un settore (per fallire)', JSON.stringify(a));
  if (a.rigioca) { await tocca('[data-azione="rigioca"]', 'rigioca'); }
  if ((await scena()) !== 'citta') { await p.locator('[data-azione="citta"]').click().catch(() => {}); }
  const b1 = await episodio('e01', creaCaso(`c09:${larg}:b`), false); out('PARTITA', larg, 'e01 rigiocata, schieramento a rotazione', JSON.stringify(b1));
  await tocca('[data-azione="citta"]', 'alla città');
  const c = await episodio('e02', creaCaso(`c09:${larg}:c`), false); out('PARTITA', larg, 'e02, schieramento a rotazione', JSON.stringify(c));
  const sv = await salvato(); out('SALVATAGGIO', larg, 'registro', JSON.stringify(sv.episodi));
  out('PASSI', larg, 'tocchi totali', String(passi));
  const lente = attese.filter(([, ms]) => ms > 1500); out('ATTESE', larg, 'tocco → scena ferma (Chromium headless, indicativo)', `mediana ${attese.map((x) => x[1]).sort((x, y) => x - y)[Math.floor(attese.length / 2)]} ms, massimo ${Math.max(...attese.map((x) => x[1]))} ms; sopra 1,5 s: ${lente.length ? lente.slice(0, 8).map(([n, ms]) => `${n} ${ms}`).join(', ') : 'nessuno'}`);
  out('MUTI', larg, 'tocchi senza effetto visibile entro 3 s', muti.length ? muti.join('; ') : 'nessuno');
  out('PIEGA', larg, 'azione principale sotto la finestra', sottoPiega.size ? [...sottoPiega].slice(0, 12).join('; ') : 'mai');
  out('TAGLI', larg, 'testi tagliati / scorrimento', tagli.size ? [...tagli].join('; ') : 'nessuno');
  out('RISORSE', larg, 'unità disponibili per ondata', risorse.join(' | '));
  out('COSTO', larg, 'tensione alzata da una scelta ma settore a livello 0 nel rapporto', incoerenze.length ? incoerenze.join(' || ') : 'nessuna');
  out('ERRORI', larg, 'console', err.length ? err.slice(0, 4).join('; ') : 'nessuno'); await p.close();
}
await b.close();
