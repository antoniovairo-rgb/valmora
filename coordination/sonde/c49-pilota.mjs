// C-049: pilota interattivo. Un browser Chromium resta aperto; i comandi arrivano via HTTP (POST /cmd, JSON) e la collaudatrice
// legge la schermata e sceglie a mano ("in prima persona"). Uso: node c49-pilota.mjs <porta> <cartella-foto> <larghezza> <altezza>
// Il salvataggio di partenza si crea con il comando {"c":"carica","ep":"e34"} (episodi prima conclusi dal giocatore attento, variabili vere).
import { existsSync, mkdirSync, appendFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { chromium } from 'playwright-core';
import { servi } from '../../tools/foto.mjs';
import { leggiDati } from '../../tools/dati-disco.mjs';
import { attenta } from '../../src/logica/bot.ts';
import { creaCaso } from '../../src/logica/caso.ts';
import { variabiliIniziali } from '../../src/logica/condizioni.ts';
import { iniziaMissione, schiera, chiamateAperte, rispondi, chiudiOndata, missioneFinita, concludiMissione } from '../../src/logica/missione.ts';
import { valutaEpisodio } from '../../src/logica/episodi.ts';
import { GAME_VERSION } from '../../src/versione.ts';

const [porta, cart, W, H] = [Number(process.argv[2]), process.argv[3], Number(process.argv[4]), Number(process.argv[5])];
mkdirSync(cart, { recursive: true });
const dati = leggiDati('data'), dich = new Map(dati['stato.json'].variabili.map((d) => [d.id, d])), v0 = variabiliIniziali(dich.values());
const missioni = Object.entries(dati).filter(([k]) => k.startsWith('missioni/')).map(([, x]) => x).sort((a, b) => a.episodio - b.episodio);
const CH = 'valmora-salvataggio';
function salvataggioFino(id, forza = {}) {
  let v = v0; const episodi = {}, concluse = [];
  for (const m of missioni) {
    if (m.id === id) break;
    const g = attenta(creaCaso(1), dich); let s = iniziaMissione(m, v, dich);
    while (!missioneFinita(m, s)) { s = schiera(m, s, g.schiera(m, s)); for (let c = chiamateAperte(m, s)[0]; c; c = chiamateAperte(m, s)[0]) s = rispondi(m, s, c.id, g.scegli(m, s, c), dich); s = chiudiOndata(m, s, dich); }
    const f = concludiMissione(m, s, dich);
    episodi[m.id] = { migliore: { esito: f.esito.id, fallita: !!f.esito.fallita, stelle: valutaEpisodio(m, f).stelle }, tentativi: 1, variabili_prima: v, variabili_dopo: f.variabili };
    concluse.push(m.id); v = f.variabili;
  }
  v = { ...v, ...forza };
  return { save_version: 2, game_version: GAME_VERSION, seme: 1, caso: 1, variabili: v, missioni_concluse: concluse, episodi, genere: 'm', rapporto_aperto: null, in_corso: null };
}
const srv = await servi('dist'), url = `http://127.0.0.1:${srv.address().port}/`;
const browser = await chromium.launch({ executablePath: existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: true, reducedMotion: 'reduce' });
const p = await ctx.newPage(); p.setDefaultTimeout(6000);
const errori = []; let n = 0, passi = 0;
p.on('console', (x) => { if (x.type() === 'error') errori.push(x.text()); }); p.on('pageerror', (e) => errori.push(e.message));
await p.addInitScript(() => { globalThis.__VALMORA_SECONDO_MS = 1; });
await p.goto(url);
async function stato() {
  passi++;
  return p.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    return {
      scena: document.querySelector('.scena')?.dataset.scena ?? null,
      scorr: document.documentElement.scrollHeight - innerHeight, scorrX: document.documentElement.scrollWidth - innerWidth,
      testo: (document.querySelector('.scena')?.innerText ?? document.body.innerText).replace(/\n{2,}/g, '\n'),
      azioni: [...document.querySelectorAll('button')].filter(vis).map((b) => (b.dataset.azione ? `azione=${b.dataset.azione}` : b.dataset.opzione ? `opzione=${b.dataset.opzione}` : b.dataset.risorsa ? `risorsa=${b.dataset.risorsa}` : b.dataset.stagione ? `stagione=${b.dataset.stagione}` : `testo=${b.innerText.trim().slice(0, 30)}`) + (b.disabled ? '(off)' : '')),
    };
  });
}
async function cmd(c) {
  if (c.c === 'carica') { await p.evaluate(([k, x]) => localStorage.setItem(k, x), [CH, JSON.stringify(salvataggioFino(c.ep, c.forza))]); await p.reload(); return { ok: 1 }; }
  if (c.c === 'clic') { await p.click(c.s); await p.waitForTimeout(c.ms ?? 150); return stato(); }
  if (c.c === 'testo') { await p.getByRole('button', { name: c.t }).first().click(); await p.waitForTimeout(c.ms ?? 150); return stato(); }
  if (c.c === 'schiera') { // "squadra:settore:n,..." clic su risorsa poi settore
    for (const [r, sett, k] of c.l.map((x) => x.split(':'))) for (let i = 0; i < Number(k ?? 1); i++) {
      if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]:not([disabled])`);
      await p.click(`[data-settore="${sett}"] .settore-punto`);
    } return stato();
  }
  if (c.c === 'foto') { await p.screenshot({ path: join(cart, `${c.n}-${W}x${H}.jpg`), type: 'jpeg', quality: 55 }); return { foto: `${c.n}-${W}x${H}.jpg` }; }
  if (c.c === 'fotoel') { await p.locator(c.s).first().screenshot({ path: join(cart, `${c.n}-${W}x${H}.jpg`), type: 'jpeg', quality: 55 }); return { foto: `${c.n}-${W}x${H}.jpg` }; }
  if (c.c === 'auto') { // politica fissa (NON prima persona): risorse a giro sui settori, opzione n.c.opz (default 1) a ogni chiamata, fino al verbale
    const log = [];
    for (let g = 0; g < 400; g++) {
      const sc = await p.evaluate(() => document.querySelector('.scena')?.dataset.scena);
      if (sc === 'verbale' || sc === 'epilogo' || sc === 'fischio') break;
      if (sc === 'schieramento' && await p.locator('[data-azione="conferma-davvero"]').count()) { await p.click('[data-azione="conferma-davvero"]', { timeout: 2000 }).catch(() => {}); log.push('schiera'); continue; }
      if (sc === 'schieramento') {
        const sett = await p.evaluate(() => [...document.querySelectorAll('[data-settore]')].map((e) => e.dataset.settore));
        let i = 0;
        for (const r of ['squadre', 'steward', 'mediatore']) {
          for (let k = 0; k < 12; k++) {
            if (!(await p.locator(`[data-risorsa="${r}"]:not([disabled])`).count())) break;
            if ((await p.getAttribute(`[data-risorsa="${r}"]`, 'aria-pressed')) !== 'true') await p.click(`[data-risorsa="${r}"]:not([disabled])`);
            const q = await p.evaluate((x) => document.querySelector(`[data-risorsa="${x}"]`)?.innerText.split('\n').filter(Boolean)[1], r); if (Number(q) === 0) break;
            await p.click(`[data-settore="${sett[i++ % sett.length]}"] .settore-punto`);
          }
        }
        await p.click('[data-azione="conferma"]', { timeout: 2000 }).catch(() => {}); await p.click('[data-azione="conferma-davvero"]', { timeout: 2000 }).catch(() => {}); log.push('schiera'); continue;
      }
      const n = (c.opz ?? [1])[Math.min(log.filter((x) => x === 'scelta').length, (c.opz ?? [1]).length - 1)];
      if (await p.locator('.opzioni > [data-opzione]').count()) {
        const ok = p.locator('.opzioni > [data-opzione]:not([disabled])'), tot = await ok.count();
        if (!tot) { await p.waitForTimeout(150); continue; }
        await ok.nth(Math.min(n - 1, tot - 1)).click({ timeout: 1500 }).catch(() => {}); log.push('scelta'); await p.waitForTimeout(150); continue;
      }
      const b = p.locator('[data-azione="continua"], [data-azione="rapporto"], [data-azione="avanti"], [data-azione="passo"], [data-azione="inizia"], [data-azione="prossimo"], [data-azione="avvia-episodio"]').first();
      if (await b.count()) { await b.click({ timeout: 1500 }).catch(() => {}); await p.waitForTimeout(100); } else await p.waitForTimeout(150);
    }
    return { ...(await stato()), log: log.length };
  }
  if (c.c === 'ricarica') { await p.reload(); await p.waitForTimeout(400); return stato(); }
  if (c.c === 'eval') return { r: await p.evaluate(c.js) };
  if (c.c === 'var') return p.evaluate((k) => { const s = JSON.parse(localStorage.getItem(k)); return { variabili: s.variabili, ep: Object.fromEntries(Object.entries(s.episodi ?? {}).map(([i, e]) => [i, e.migliore])) }; }, CH);
  return stato();
}
createServer(async (rq, rs) => {
  let b = ''; for await (const x of rq) b += x;
  try { const c = JSON.parse(b || '{}'), r = await cmd(c); const e = errori.splice(0); appendFileSync(join(cart, `registro-${W}x${H}.jsonl`), JSON.stringify({ c, scena: r.scena, scorr: r.scorr, scorrX: r.scorrX, errori: e }) + '\n'); rs.end(JSON.stringify({ ...r, errori: e, passi })); }
  catch (e) { rs.end(JSON.stringify({ err: String(e.message).slice(0, 300) })); }
}).listen(porta, '127.0.0.1');
console.log('pronto');
