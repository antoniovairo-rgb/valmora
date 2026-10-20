// C-044: partita da giocatore dall'interfaccia (Chromium, dito, larghezza a scelta). Il salvataggio di partenza ha gli episodi
// precedenti conclusi col giocatore attento (variabili vere, non sintetiche). Le scelte vengono dal bot (attenta | peggiore | casuale)
// ma i clic sono sull'interfaccia. Registra testo, scorrimento e foto di ogni scena nuova; ricarica a metà episodio.
// Uso: node coordination/sonde/c44-giocatore.mjs <cartella> <larghezza> e07:attenta,e12:peggiore[,...]
import { existsSync, mkdirSync, writeFileSync, appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { servi } from '../../tools/foto.mjs';
import { leggiDati } from '../../tools/dati-disco.mjs';
import { attenta, peggiore, casuale } from '../../src/logica/bot.ts';
import { creaCaso } from '../../src/logica/caso.ts';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { iniziaMissione, schiera, chiamateAperte, rispondi, chiudiOndata, missioneFinita, concludiMissione } from '../../src/logica/missione.ts';
import { valutaEpisodio } from '../../src/logica/episodi.ts';
import { GAME_VERSION } from '../../src/versione.ts';

const [cartella, larg, lavori] = [process.argv[2], Number(process.argv[3]), process.argv[4].split(',')], alt = Number(process.argv[5] ?? 760);
const suff = alt === 760 ? '' : `x${alt}`;
mkdirSync(cartella, { recursive: true });
const dati = leggiDati('data'), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), v0 = variabiliIniziali(dich.values());
const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x).sort((a, b) => a.episodio - b.episodio);
const CH = 'valmora-salvataggio';
const FORZA = { attenta, peggiore, casuale };

function salvataggioFino(id) { // episodi prima di «id» conclusi col giocatore attento
  let v = v0; const episodi = {}, concluse = [];
  for (const m of missioni) {
    if (m.id === id) break;
    const g = attenta(creaCaso(1), dich); let s = iniziaMissione(m, v, dich);
    while (!missioneFinita(m, s)) { s = schiera(m, s, g.schiera(m, s)); for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = rispondi(m, s, c.id, g.scegli(m, s, c), dich); s = chiudiOndata(m, s, dich); }
    const f = concludiMissione(m, s, dich);
    episodi[m.id] = { migliore: { esito: f.esito.id, fallita: !!f.esito.fallita, stelle: valutaEpisodio(m, f).stelle }, tentativi: 1, variabili_prima: v, variabili_dopo: f.variabili };
    concluse.push(m.id); v = f.variabili;
  }
  return { sal: { save_version: 2, game_version: GAME_VERSION, seme: 1, caso: 1, variabili: v, missioni_concluse: concluse, episodi, genere: 'm', rapporto_aperto: null, in_corso: null }, v };
}

const srv = await servi('dist'), url = `http://127.0.0.1:${srv.address().port}/`;
const browser = await chromium.launch({ executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
const vede = async (pg, x) => (await pg.locator(x).count()) > 0 && pg.locator(x).first().isVisible();
const vai = async (pg, x) => { while (!(await vede(pg, x)) && (await vede(pg, '[data-azione="passo"]'))) { await pg.click('[data-azione="passo"]'); await pg.waitForTimeout(80); } await pg.click(x); };
const log = (f, o) => appendFileSync(join(cartella, f), JSON.stringify(o) + '\n');
const errori = []; let passi = 0;
try {
  for (const lavoro of lavori) {
    const [id, pol] = lavoro.split(':'), m = missioni.find((x) => x.id === id);
    let { sal, v } = salvataggioFino(id);
    for (const kv of (process.env.VAR ?? '').split(',').filter(Boolean)) { const [k, x] = kv.split('='); v = { ...v, [k]: x }; sal.variabili = v; } // C-044: variabili forzate (es. VAR=carte=fermate)
    const ctx = await browser.newContext({ viewport: { width: larg, height: alt }, hasTouch: true, reducedMotion: 'reduce' });
    const p = await ctx.newPage(); p.setDefaultTimeout(8000);
    p.on('console', (x) => { if (x.type() === 'error') errori.push(`${id}: ${x.text()}`); }); p.on('pageerror', (e) => errori.push(`${id}: ${e.message}`));
    await p.addInitScript(() => { globalThis.__VALMORA_SECONDO_MS = 1; });
    await p.goto(url); await p.evaluate(([k, x]) => localStorage.setItem(k, x), [CH, JSON.stringify(sal)]); await p.reload();
    const viste = new Set(); let n = 0;
    const scena = () => p.getAttribute('.scena', 'data-scena');
    const scatta = async (nome, sempre) => { const k = nome; if (!sempre && viste.has(k)) return; viste.add(k); await p.screenshot({ path: join(cartella, `${id}-${pol}-${larg}${suff}-${String(++n).padStart(2, '0')}-${nome}.jpg`), type: 'jpeg', quality: 55 }); };
    const misura = async (nome) => { passi++; const r = await p.evaluate(() => ({ w: innerWidth, sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, ih: innerHeight, mappa: (() => { const x = document.querySelector('.mappa'); if (!x) return 'assente'; const r = x.getBoundingClientRect(); return `${x.dataset.nascosta !== undefined ? 'nascosta' : 'visibile'} ${Math.round(r.height)}px`; })(), testo: document.querySelector('.scena')?.innerText ?? '' })); log(`${id}-${pol}-${larg}${suff}.jsonl`, { nome, ...r }); return r; };
    await p.getByRole('button', { name: 'Riprendi' }).click(); await p.waitForSelector('.scena[data-scena="citta"]');
    const st = p.locator(`[data-stagione="${m.stagione}"]`); if (await st.count()) await st.click();
    await p.locator(`[data-episodio="${id}"] .settore-punto`).click(); await misura('scheda'); await scatta('scheda');
    await p.click('[data-azione="avvia-episodio"]');
    if (await p.locator('.tripla').count()) await p.click('[data-azione="conferma-rigioca"]');
    const g = FORZA[pol](creaCaso(7), dich); let s = iniziaMissione(m, v, dich);
    await p.waitForSelector('.scena[data-scena="sala"]'); await misura('sala'); await scatta('sala'); await vai(p, '[data-azione="avanti"]');
    await p.waitForSelector('.scena[data-scena="briefing"]'); await misura('briefing'); await scatta('briefing');
    while (await p.locator('[data-azione="prossimo"]').count()) await vai(p, '[data-azione="prossimo"]');
    await vai(p, '[data-azione="inizia"]');
    let ricaricato = false;
    for (let o = 1; o <= m.ondate.length; o++) {
      await p.waitForSelector('.scena[data-scena="schieramento"]'); await misura(`schieramento-o${o}`); await scatta(`schieramento-o${o}`, o === 1);
      const d = g.schiera(m, s);
      for (const [r, mm] of Object.entries(d)) for (const [sett, k] of Object.entries(mm)) for (let i = 0; i < k; i++) {
        if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]:not([disabled])`).catch(() => {});
        await p.click(`[data-settore="${sett}"] .settore-punto`).catch((e) => errori.push(`${id} o${o}: tocco ${r}@${sett}: ${e.message.slice(0, 80)}`));
      }
      s = schiera(m, s, d);
      await vai(p, '[data-azione="conferma"]'); await p.waitForSelector('[data-riepilogo]'); await misura(`conferma-o${o}`); await vai(p, '[data-azione="conferma-davvero"]');
      let j = 0;
      for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0], j++) {
        await p.waitForSelector(`[data-messaggio="chiamata-${c.id}"]`);
        const dom = await p.evaluate(() => ({ imp: !!document.querySelector('[data-imprevisto]'), conto: !!document.querySelector('[role="timer"]'), opz: [...document.querySelectorAll('.opzione')].map((e) => ({ id: e.dataset.opzione, t: e.innerText.replace(/\s+/g, ' ') })) }));
        const m1 = await misura(`chiamata-o${o}-${c.id}${dom.imp ? '-IMPREVISTO' : ''}`); await scatta(`chiamata-o${o}-${c.id}${dom.imp ? '-imprevisto' : ''}`, dom.imp);
        log(`${id}-${pol}-${larg}${suff}-chiamate.jsonl`, { o, c: c.id, imp: dom.imp, conto: dom.conto, opz: dom.opz, ordine: j });
        const scelta = g.scegli(m, s, c); await p.click(`[data-opzione="${scelta}"]`);
        await p.waitForFunction(() => !document.querySelector('[data-annulla]'), null, { timeout: 8000 }).catch(() => {});
        s = rispondi(m, s, c.id, scelta, dich);
        if (await p.locator('[data-azione="continua"]').count() || await p.waitForSelector('[data-azione="continua"]', { timeout: 1500 }).then(() => true).catch(() => false)) {
          const mr = await misura(`risposta-o${o}-${c.id}${dom.imp ? '-IMPREVISTO' : ''}`); await scatta(`risposta-o${o}-${c.id}${dom.imp ? '-imprevisto' : ''}`, dom.imp); log(`${id}-${pol}-${larg}${suff}-chiamate.jsonl`, { o, c: c.id, scelta, risposta: mr.testo.slice(0, 600) });
          await vai(p, '[data-azione="continua"]');
        }
        if (!ricaricato && o === 2 && j === 0) { ricaricato = true; await p.reload(); await p.getByRole('button', { name: 'Riprendi' }).click(); log(`${id}-${pol}-${larg}${suff}-chiamate.jsonl`, { ricarica: 'dopo la prima risposta di o2', scena: await scena() }); }
      }
      s = chiudiOndata(m, s, dich);
      await p.waitForSelector('[data-azione="rapporto"]'); await misura(`chiusura-o${o}`); await vai(p, '[data-azione="rapporto"]');
      await p.waitForSelector('.scena[data-scena="rapporto"]'); await misura(`rapporto-o${o}`); await scatta(`rapporto-o${o}`, o === 1 || o === m.ondate.length);
      await vai(p, '[data-azione="avanti"]');
    }
    await p.waitForSelector('.scena[data-scena="verbale"]'); let k = 0;
    for (;;) {
      k++; await misura(`verbale-p${k}`); await scatta(`verbale-p${k}`, true);
      const b = p.locator('.scena [data-azione="passo"], .scena [data-azione="avanti"], .scena [data-azione="prossimo"], .scena [data-azione="continua"]').first();
      if (!(await b.count()) || k > 12) break; await b.click(); await p.waitForTimeout(150);
      if ((await scena()) !== 'verbale') break;
    }
    if (await p.locator('[data-azione="epilogo"]').count()) {
      await p.click('[data-azione="epilogo"]');
      for (let k = 1; k <= 8; k++) {
        await p.waitForTimeout(500);
        const e = await p.evaluate(() => ({ tavole: [...document.querySelectorAll('[data-tavola]')].map((x) => `${x.dataset.tavola}=${x.dataset.valore ?? x.dataset.carriera ?? ''}`), righe: [...document.querySelectorAll('[data-riga]')].map((x) => x.textContent), sh: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth, testo: document.querySelector('.scena')?.innerText ?? '' }));
        log(`${id}-${pol}-${larg}${suff}.jsonl`, { nome: `epilogo-${process.env.TAG ?? ''}-${k}`, w: larg, ih: alt, ...e });
        if (e.tavole.length) await p.screenshot({ path: join(cartella, `${id}-${pol}-${larg}-epilogo${process.env.TAG ?? ''}.jpg`), type: 'jpeg', quality: 50, fullPage: true });
        const b = p.locator('.scena [data-azione="avanti"], .scena [data-azione="passo"]').first();
        if (!(await b.count())) break; await b.click();
      }
    }
    const sv = await p.evaluate((x) => JSON.parse(localStorage.getItem(x)), CH);
    log(`${id}-${pol}-${larg}${suff}.jsonl`, { fine: true, scena: await scena(), episodio: sv.episodi?.[id], variabili: sv.variabili });
    await ctx.close();
  }
} finally { await browser.close(); srv.close(); }
console.log(JSON.stringify({ passi, errori }));
